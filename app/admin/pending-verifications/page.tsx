"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import SidebarNav from "@/components/ui/sidebar-nav";
import {
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
  Mail,
} from "lucide-react";

interface Employer {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
  company_address: string | null;
  industry: string | null;
  verification_status: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface ActionModal {
  show: boolean;
  type: "verify" | "reject" | "delete" | null;
  employer: Employer | null;
}

export default function PendingVerificationsPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [filteredEmployers, setFilteredEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionModal, setActionModal] = useState<ActionModal>({
    show: false,
    type: null,
    employer: null,
  });
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "verified" | "pending" | "rejected"
  >("verified");

  useEffect(() => {
    async function fetchEmployers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "employer")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setEmployers(data);
        setFilteredEmployers(data);
      }
      setLoading(false);
    }

    fetchEmployers();
  }, []);

  // Search handler
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      if (!value.trim()) {
        setFilteredEmployers(employers);
        return;
      }
      const filtered = employers.filter(
        (e) =>
          e.full_name?.toLowerCase().includes(value.toLowerCase()) ||
          e.company_name?.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredEmployers(filtered);
    },
    [employers],
  );

  const tabEmployers = filteredEmployers.filter(
    (e) => e.verification_status === activeTab,
  );

  // Stats
  const totalCount = employers.length;
  const pendingCount = employers.filter(
    (e) => e.verification_status === "pending",
  ).length;
  const verifiedCount = employers.filter(
    (e) => e.verification_status === "verified",
  ).length;
  const rejectedCount = employers.filter(
    (e) => e.verification_status === "rejected",
  ).length;

  const handleShowAction = useCallback(
    (type: "verify" | "reject" | "delete", employer: Employer) => {
      setActionModal({ show: true, type, employer });
    },
    [],
  );

  const handleConfirmAction = useCallback(async () => {
    if (!actionModal.employer) return;
    setProcessing(true);

    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();
    if (!adminUser) return;

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", adminUser.id)
      .single();

    if (actionModal.type === "verify") {
      await supabase
        .from("profiles")
        .update({ verification_status: "verified" })
        .eq("id", actionModal.employer.id);

      await supabase.from("audit_logs").insert({
        action: "VERIFY_EMPLOYER",
        target_id: actionModal.employer.id,
        target_name: actionModal.employer.full_name,
        performed_by: adminUser.id,
        performed_by_name: adminProfile?.full_name,
      });

      setEmployers((prev) =>
        prev.map((e) =>
          e.id === actionModal.employer!.id
            ? { ...e, verification_status: "verified" }
            : e,
        ),
      );
      setFilteredEmployers((prev) =>
        prev.map((e) =>
          e.id === actionModal.employer!.id
            ? { ...e, verification_status: "verified" }
            : e,
        ),
      );
    }

    if (actionModal.type === "reject") {
      await supabase
        .from("profiles")
        .update({ verification_status: "rejected" })
        .eq("id", actionModal.employer.id);

      await supabase.from("audit_logs").insert({
        action: "REJECT_EMPLOYER",
        target_id: actionModal.employer.id,
        target_name: actionModal.employer.full_name,
        performed_by: adminUser.id,
        performed_by_name: adminProfile?.full_name,
      });

      setEmployers((prev) =>
        prev.map((e) =>
          e.id === actionModal.employer!.id
            ? { ...e, verification_status: "rejected" }
            : e,
        ),
      );
      setFilteredEmployers((prev) =>
        prev.map((e) =>
          e.id === actionModal.employer!.id
            ? { ...e, verification_status: "rejected" }
            : e,
        ),
      );
    }

    if (actionModal.type === "delete") {
      await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: actionModal.employer.id }),
      });

      await supabase
        .from("profiles")
        .delete()
        .eq("id", actionModal.employer.id);

      await supabase.from("audit_logs").insert({
        action: "DELETE_EMPLOYER",
        target_id: actionModal.employer.id,
        target_name: actionModal.employer.full_name,
        performed_by: adminUser.id,
        performed_by_name: adminProfile?.full_name,
      });

      setEmployers((prev) =>
        prev.filter((e) => e.id !== actionModal.employer!.id),
      );
      setFilteredEmployers((prev) =>
        prev.filter((e) => e.id !== actionModal.employer!.id),
      );
    }

    setProcessing(false);
    setActionModal({ show: false, type: null, employer: null });
  }, [actionModal]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getActionDetails() {
    switch (actionModal.type) {
      case "verify":
        return {
          title: "Verify Employer",
          message: `Are you sure you want to verify "${actionModal.employer?.company_name}"? They will be able to access the employer dashboard.`,
          buttonLabel: "Verify",
          buttonClass: "bg-green-500 hover:bg-green-600 text-white",
        };
      case "reject":
        return {
          title: "Reject Employer",
          message: `Are you sure you want to reject "${actionModal.employer?.company_name}"? They will not be able to access the platform.`,
          buttonLabel: "Reject",
          buttonClass: "bg-red-800 hover:bg-red-900 text-white",
        };
      case "delete":
        return {
          title: "Delete Employer",
          message: `Are you sure you want to delete "${actionModal.employer?.company_name}"? This action cannot be undone.`,
          buttonLabel: "Delete",
          buttonClass: "bg-red-500 hover:bg-red-600 text-white",
        };
      default:
        return { title: "", message: "", buttonLabel: "", buttonClass: "" };
    }
  }

  function getStatusBadge(status: string | null) {
    switch (status) {
      case "verified":
        return (
          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <CheckCircle size={16} /> Verified
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
            <XCircle size={16} /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-orange-500 text-sm font-medium">
            <Clock size={16} /> Pending
          </span>
        );
    }
  }

  const actionDetails = getActionDetails();

  return (
    <div className="flex bg-neutral-50 min-h-screen">
      <SidebarNav role="admin" />

      <main className="flex-1 p-3 md:p-10 mt-10 md:mt-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="md:text-2xl font-bold">Employer Verifications</h1>
            <p className="text-sm text-muted-foreground">
              Review and manage employer verification requests
            </p>
          </div>
          <div className="w-auto">
            <Input
              placeholder="Search employers..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:flex gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm">
            <Building2 size={16} className="text-muted-foreground" />
            <span className="font-semibold">{totalCount}</span>
            <span className="text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm">
            <CheckCircle size={16} className="text-green-500" />
            <span className="font-semibold text-green-500">
              {verifiedCount}
            </span>
            <span className="text-muted-foreground">Verified</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm">
            <Clock size={16} className="text-orange-500" />
            <span className="font-semibold text-orange-500">
              {pendingCount}
            </span>
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm">
            <XCircle size={16} className="text-red-500" />
            <span className="font-semibold text-red-500">{rejectedCount}</span>
            <span className="text-muted-foreground">Rejected</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b">
          {(["verified", "pending", "rejected"] as const).map((tab) => {
            const count = employers.filter(
              (e) => e.verification_status === tab,
            ).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-sm capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-red-700 text-red-700 font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab} <span className="px-1">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Employer List */}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : tabEmployers.length === 0 ? (
          <div className="flex justify-center items-center min-h-40 bg-white rounded-xl">
            <p className="text-muted-foreground">No {activeTab} employers.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tabEmployers.map((employer) => (
              <div key={employer.id} className="bg-white rounded-xl border p-6">
                {/* Top Row — Avatar + Name + Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border shrink-0">
                      {employer.avatar_url ? (
                        <img
                          src={employer.avatar_url}
                          alt={employer.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-sm text-muted-foreground font-medium">
                            {employer.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{employer.full_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail size={12} />
                        {employer.email}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(employer.verification_status)}
                </div>

                {/* Company Details */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">
                      Company
                    </p>
                    <p className="text-sm font-medium">
                      {employer.company_name || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">
                      Address
                    </p>
                    <p className="text-sm font-medium">
                      {employer.company_address || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase mb-1">
                      Industry
                    </p>
                    <p className="text-sm font-medium">
                      {employer.industry || "—"}
                    </p>
                  </div>
                </div>

                {/* Bottom Row — Date + Actions */}
                <div className="flex justify-between items-center pt-3 border-t">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays size={13} />
                    Applied: {formatDate(employer.created_at)}
                  </p>

                  <div className="flex gap-2">
                    {activeTab === "pending" && (
                      <>
                        <Button
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleShowAction("verify", employer)}
                        >
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShowAction("reject", employer)}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {activeTab === "verified" && (
                      <Button
                        variant="outline"
                        onClick={() => handleShowAction("reject", employer)}
                      >
                        Revoke
                      </Button>
                    )}

                    {activeTab === "rejected" && (
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleShowAction("verify", employer)}
                      >
                        Re-verify
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleShowAction("delete", employer)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Confirmation Modal */}
        {actionModal.show && actionModal.employer && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-sm p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">{actionDetails.title}</h2>
              <p className="text-sm text-muted-foreground">
                {actionDetails.message}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    setActionModal({ show: false, type: null, employer: null })
                  }
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${actionDetails.buttonClass}`}
                  onClick={handleConfirmAction}
                  disabled={processing}
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    actionDetails.buttonLabel
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

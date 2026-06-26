"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import SidebarNav from "@/components/ui/sidebar-nav";

interface Employer {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
  company_address: string | null;
  industry: string | null;
  verification_status: string | null;
  created_at: string;
}

interface ActionModal {
  show: boolean;
  type: "verify" | "reject" | "delete" | null;
  employer: Employer | null;
}

export default function PendingVerificationsPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<ActionModal>({
    show: false,
    type: null,
    employer: null,
  });
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "pending" | "verified" | "rejected"
  >("pending");

  useEffect(() => {
    async function fetchEmployers() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "employer")
        .order("created_at", { ascending: false });

      if (!error && data) setEmployers(data);
      setLoading(false);
    }

    fetchEmployers();
  }, []);

  const filteredEmployers = employers.filter(
    (e) => e.verification_status === activeTab,
  );

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

      // Log action
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
    }

    if (actionModal.type === "reject") {
      await supabase
        .from("profiles")
        .update({ verification_status: "rejected" })
        .eq("id", actionModal.employer.id);

      // Log action
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
    }

    if (actionModal.type === "delete") {
      // Delete from auth
      await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: actionModal.employer.id }),
      });

      await supabase
        .from("profiles")
        .delete()
        .eq("id", actionModal.employer.id);

      // Log action
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

  const actionDetails = getActionDetails();

  return (
    <div className="flex">
      <SidebarNav role="admin" />

      <main className="flex-1 p-8 bg-neutral-50">
        <h1 className="text-2xl font-bold mb-6">Employer Verifications</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "verified", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "bg-red-900 text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-black/10"
              }`}
            >
              {tab} (
              {employers.filter((e) => e.verification_status === tab).length})
            </button>
          ))}
        </div>

        {/* Employer List */}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filteredEmployers.length === 0 ? (
          <div className="flex justify-center items-center min-h-40 bg-white rounded-xl">
            <p className="text-muted-foreground">No {activeTab} employers.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredEmployers.map((employer) => (
              <Card key={employer.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start gap-4">
                    {/* Employer Details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Contact Person
                        </p>
                        <p className="text-sm font-medium">
                          {employer.full_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm">{employer.email}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Company Name
                        </p>
                        <p className="text-sm">
                          {employer.company_name || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Company Address
                        </p>
                        <p className="text-sm">
                          {employer.company_address || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Industry
                        </p>
                        <p className="text-sm">{employer.industry || "—"}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Applied</p>
                        <p className="text-sm">
                          {formatDate(employer.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 shrink-0">
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
                        className="bg-red-700 hover:bg-red-800 text-white"
                        onClick={() => handleShowAction("delete", employer)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

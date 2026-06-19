"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import SidebarNav from "@/components/ui/sidebar-nav";
import { TrashIcon, Save } from "lucide-react";

interface Experience {
  id: string;
  job_title: string;
  company_name: string;
  location: string | null;
  employment_type: string | null;
  job_description: string | null;
  is_current: boolean;
  start_month: string | null;
  start_year: string | null;
  end_month: string | null;
  end_year: string | null;
}

interface ExperienceForm {
  job_title: string;
  company_name: string;
  location: string;
  employment_type: string;
  job_description: string;
  is_current: boolean;
  start_month: string;
  start_year: string;
  end_month: string;
  end_year: string;
}

const INITIAL_FORM: ExperienceForm = {
  job_title: "",
  company_name: "",
  location: "",
  employment_type: "",
  job_description: "",
  is_current: true,
  start_month: "",
  start_year: "",
  end_month: "",
  end_year: "",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Casual",
];

const YEARS = Array.from({ length: 50 }, (_, i) =>
  (new Date().getFullYear() - i).toString(),
);

export default function BackgroundPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ExperienceForm>(INITIAL_FORM);
  const [deleteModal, setDeleteModal] = useState(false);
  const [expToDelete, setExpToDelete] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchExperiences() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setExperiences(data);
      setLoading(false);
    }

    fetchExperiences();
  }, []);

  const handleFormChange = useCallback(
    (field: keyof ExperienceForm, value: string | boolean) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleOpenModal = useCallback(() => {
    setForm(INITIAL_FORM);
    setError("");
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setForm(INITIAL_FORM);
    setError("");
  }, []);

  const handleSave = useCallback(async () => {
    setError("");

    if (!form.job_title) {
      setError("Job title is required");
      return;
    }
    if (!form.company_name) {
      setError("Company name is required");
      return;
    }
    if (!form.location) {
      setError("Location is required");
      return;
    }
    if (!form.employment_type) {
      setError("Employment type is required");
      return;
    }
    if (!form.start_month || !form.start_year) {
      setError("Start month and year are required");
      return;
    }
    if (!form.is_current && (!form.end_month || !form.end_year)) {
      setError("End month and year are required");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error: insertError } = await supabase
      .from("experiences")
      .insert({
        user_id: user.id,
        job_title: form.job_title,
        company_name: form.company_name,
        location: form.location || null,
        employment_type: form.employment_type || null,
        job_description: form.job_description || null,
        is_current: form.is_current,
        start_month: form.start_month,
        start_year: form.start_year,
        end_month: form.is_current ? null : form.end_month,
        end_year: form.is_current ? null : form.end_year,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
    } else {
      setExperiences((prev) => [data, ...prev]);
      handleCloseModal();
    }

    setSaving(false);
  }, [form, handleCloseModal]);

  const handleShowDelete = useCallback((exp: Experience) => {
    setExpToDelete(exp);
    setDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!expToDelete) return;
    setDeleting(true);

    const { error } = await supabase
      .from("experiences")
      .delete()
      .eq("id", expToDelete.id);

    if (!error) {
      setExperiences((prev) => prev.filter((exp) => exp.id !== expToDelete.id));
    }

    setDeleting(false);
    setDeleteModal(false);
    setExpToDelete(null);
  }, [expToDelete]);

  const handleCancelDelete = useCallback(() => {
    setDeleteModal(false);
    setExpToDelete(null);
  }, []);

  // async function handleDelete(id: string) {
  //   const { error } = await supabase.from("experiences").delete().eq("id", id);

  //   if (!error) {
  //     setExperiences((prev) => prev.filter((exp) => exp.id !== id));
  //   }
  // }

  return (
    <div className="flex">
      <SidebarNav role="client" />

      <main className="flex-1 p-8 bg-neutral-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Work Experience</h1>
          <Button onClick={handleOpenModal}>+ Add Experience</Button>
        </div>

        {/* Experience List */}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : experiences.length === 0 ? (
          <p className="text-muted-foreground">No experience added yet.</p>
        ) : (
          <div className="flex flex-col gap-4 items-center">
            {experiences.map((exp) => (
              <Card key={exp.id} className="w-[80%] shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-semibold text-base">
                        {exp.job_title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {exp.company_name}
                        {exp.employment_type ? ` · ${exp.employment_type}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {exp.start_month} {exp.start_year} —{" "}
                        {exp.is_current
                          ? "Present"
                          : `${exp.end_month} ${exp.end_year}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {exp.location ? `${exp.location}` : ""}
                      </p>
                      {exp.job_description && (
                        <p className="text-sm mt-2">{exp.job_description}</p>
                      )}
                    </div>

                    <Button
                      variant="warning"
                      onClick={() => handleShowDelete(exp)}
                    >
                      <TrashIcon />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && expToDelete && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-sm p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Delete Experience</h2>

              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-medium text-foreground">
                  "{expToDelete.job_title}"
                </span>{" "}
                at{" "}
                <span className="font-medium text-foreground">
                  {expToDelete.company_name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelDelete}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-lg font-semibold">Add Experience</h2>
                <Button variant="outline" onClick={handleCloseModal}>
                  Close
                </Button>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex flex-col gap-4">
                {/* Job Title */}
                <div className="flex flex-col gap-2">
                  <Label>Job Title *</Label>
                  <Input
                    placeholder="Mechanical Engineers"
                    value={form.job_title}
                    onChange={(e) =>
                      handleFormChange("job_title", e.target.value)
                    }
                  />
                </div>

                {/* Company Name */}
                <div className="flex flex-col gap-2">
                  <Label>Company Name *</Label>
                  <Input
                    placeholder="Input company"
                    value={form.company_name}
                    onChange={(e) =>
                      handleFormChange("company_name", e.target.value)
                    }
                  />
                </div>

                {/* Location */}
                <div className="flex flex-col gap-2">
                  <Label>Location *</Label>
                  <Input
                    placeholder="Ex. Sydney, Australia"
                    value={form.location}
                    onChange={(e) =>
                      handleFormChange("location", e.target.value)
                    }
                  />
                </div>

                {/* Employment Type */}
                <div className="flex flex-col gap-2">
                  <Label>Employment Type *</Label>
                  <select
                    value={form.employment_type}
                    onChange={(e) =>
                      handleFormChange("employment_type", e.target.value)
                    }
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  >
                    <option value="">Select type</option>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currently Working Here */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={form.is_current}
                    onChange={(e) =>
                      handleFormChange("is_current", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="is_current">I currently work here</Label>
                </div>

                {/* Start Date */}
                <div className="flex flex-col gap-2">
                  <Label>Start Date *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={form.start_month}
                      onChange={(e) =>
                        handleFormChange("start_month", e.target.value)
                      }
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    >
                      <option value="">Month</option>
                      {MONTHS.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={form.start_year}
                      onChange={(e) =>
                        handleFormChange("start_year", e.target.value)
                      }
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    >
                      <option value="">Year</option>
                      {YEARS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* End Date — show kung hindi current */}
                {!form.is_current && (
                  <div className="flex flex-col gap-2">
                    <Label>End Date *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={form.end_month}
                        onChange={(e) =>
                          handleFormChange("end_month", e.target.value)
                        }
                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                      >
                        <option value="">Month</option>
                        {MONTHS.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <select
                        value={form.end_year}
                        onChange={(e) =>
                          handleFormChange("end_year", e.target.value)
                        }
                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                      >
                        <option value="">Year</option>
                        {YEARS.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Job Description */}
                <div className="flex flex-col gap-2">
                  <Label>Job Description</Label>
                  <textarea
                    placeholder="Describe your responsibilities..."
                    value={form.job_description}
                    onChange={(e) =>
                      handleFormChange("job_description", e.target.value)
                    }
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm min-h-25"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                {/* Save Button */}
                <Button
                  className="w-full hover:bg-black/80"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save />
                      Save Experience
                    </>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const job = await fetchApi("/jobs/", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      router.push(`/recruiter/jobs/${job.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Post a New Job</h1>
      <p className="text-text-secondary mb-8">Create a job posting to screen candidates against.</p>

      <div className="card p-6">
        {error && <div className="bg-red-50 text-danger p-3 rounded-md mb-4 text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label text-base">Job Title</label>
            <input
              type="text"
              required
              className="input-field mt-1"
              placeholder="e.g., Senior Frontend Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="label text-base">Job Description (Target Profile)</label>
            <p className="text-xs text-text-secondary mb-2">
              Be detailed. The AI will use this text to extract required skills, experience, and keywords to rank candidates against.
            </p>
            <textarea
              required
              rows={12}
              className="input-field font-mono text-sm resize-y"
              placeholder="We are looking for a Senior Frontend Engineer with 5+ years of experience in React..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => router.back()} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Job Posting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { PlusCircle, Building2, Calendar } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await fetchApi("/jobs/");
        // In a real app, we'd filter to jobs owned by this recruiter
        // or have a specific /api/recruiter/jobs endpoint.
        setJobs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Manage your active job postings and screenings</p>
        </div>
        <Link href="/recruiter/jobs/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> New Job Posting
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-text-primary mb-2">No jobs posted yet</h3>
          <p className="text-text-secondary mb-6">Create your first job posting to start screening candidates.</p>
          <Link href="/recruiter/jobs/new" className="btn-primary">Post a Job</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Link key={job.id} href={`/recruiter/jobs/${job.id}`}>
              <div className="card hover:border-primary hover:shadow-md transition-all p-6 group cursor-pointer h-full flex flex-col">
                <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors mb-2 line-clamp-1">{job.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-3 mb-4 flex-grow">{job.description}</p>
                <div className="flex items-center text-xs text-text-secondary mt-auto pt-4 border-t border-border">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(job.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

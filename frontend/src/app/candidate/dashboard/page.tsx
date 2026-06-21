"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { Building2, Calendar, ArrowRight } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function CandidateDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await fetchApi("/jobs/");
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Open Positions</h1>
        <p className="text-text-secondary mt-1">Find your next role and see how well your resume matches.</p>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-text-primary mb-2">No jobs available right now</h3>
          <p className="text-text-secondary">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="card p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-text-primary line-clamp-1">{job.title}</h3>
              </div>
              <p className="text-sm text-text-secondary line-clamp-3 mb-6 flex-grow">{job.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                <div className="flex items-center text-xs text-text-secondary">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(job.created_at).toLocaleDateString()}
                </div>
                <Link href={`/candidate/apply/${job.id}`} className="text-primary font-medium hover:underline flex items-center text-sm gap-1">
                  View & Apply <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

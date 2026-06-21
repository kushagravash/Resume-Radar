"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { FileUp, ThumbsUp, ThumbsDown, CheckCircle, Zap } from "lucide-react";

export default function CandidateApplyPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi(`/jobs/${jobId}`).then(setJob).catch(console.error);
  }, [jobId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleApply = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/candidate/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) throw new Error("Analysis failed");
      
      const data = await res.json();
      setFeedback(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!job) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{job.title}</h1>
        <p className="text-text-secondary mt-1">Review the description and check your fit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Job Description */}
        <div className="card p-6 h-fit max-h-[80vh] overflow-y-auto">
          <h3 className="font-bold mb-4 text-lg border-b border-border pb-2">Job Description</h3>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* Right Column: Upload & Feedback */}
        <div className="space-y-6">
          {!feedback ? (
            <div className="card p-8 border-dashed border-2 border-primary/50 bg-primary-light/10 text-center">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Check Your Fit</h3>
              <p className="text-sm text-text-secondary mb-6">
                Upload your resume (PDF/DOCX) to instantly see how well you match this role.
              </p>
              
              <input
                type="file"
                accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
                onChange={handleFileChange}
                className="block w-full max-w-xs mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer mb-6"
              />
              
              <button 
                onClick={handleApply} 
                disabled={analyzing || !file}
                className="btn-primary w-full max-w-xs"
              >
                {analyzing ? "Analyzing Resume..." : "Upload & Analyze"}
              </button>
              {error && <p className="text-danger text-sm mt-4">{error}</p>}
            </div>
          ) : (
            <div className="card p-6 border-t-4 border-t-primary">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-primary/20 mb-4">
                  <span className="text-3xl font-bold text-primary">{feedback.match_score}%</span>
                </div>
                <h3 className="text-xl font-bold text-text-primary">Match Score</h3>
                <p className="text-text-secondary text-sm mt-1">{feedback.suggestion}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-success flex items-center gap-2 mb-3">
                    <ThumbsUp className="w-4 h-4" /> Matching Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {feedback.strengths.length > 0 ? feedback.strengths.map((s: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 bg-green-50 text-success border border-green-200 rounded-md">
                        {s}
                      </span>
                    )) : <span className="text-xs text-text-secondary">No strong keywords matched.</span>}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-danger flex items-center gap-2 mb-3">
                    <ThumbsDown className="w-4 h-4" /> Potential Gaps
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {feedback.gaps.length > 0 ? feedback.gaps.map((g: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 bg-red-50 text-danger border border-red-200 rounded-md">
                        {g}
                      </span>
                    )) : <span className="text-xs text-text-secondary">No significant gaps found.</span>}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border flex justify-between">
                <button onClick={() => setFeedback(null)} className="btn-secondary text-sm">
                  Upload Different Resume
                </button>
                <button className="btn-primary text-sm bg-text-primary hover:bg-black">
                  Submit Final Application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

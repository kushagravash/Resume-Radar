"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { FileUp, FileText, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

export default function JobScreeningPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [screening, setScreening] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi(`/jobs/${id}`).then(setJob).catch(console.error);
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleScreening = async () => {
    if (files.length === 0) return;
    setScreening(true);
    setError("");

    const formData = new FormData();
    files.forEach(file => {
      formData.append("resumes", file);
    });

    try {
      // Use direct fetch since we're sending FormData
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/api/recruiter/jobs/${id}/screen`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) throw new Error("Screening failed");
      
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during screening.");
    } finally {
      setScreening(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-success bg-green-50 border-green-200";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-danger bg-red-50 border-red-200";
  };

  if (!job) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Job Details & Uploader */}
      <div className="lg:col-span-1 space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-2">{job.title}</h2>
          <p className="text-sm text-text-secondary whitespace-pre-wrap line-clamp-6">{job.description}</p>
        </div>

        <div className="card p-6 border-dashed border-2 border-primary/50 bg-primary-light/10">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FileUp className="w-5 h-5 text-primary" /> Bulk Upload Resumes
          </h3>
          <p className="text-xs text-text-secondary mb-4">Accepts PDF, DOCX, PNG, JPG (Max 5MB per file)</p>
          
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer mb-4"
          />
          
          {files.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium">{files.length} files selected:</p>
              <ul className="text-xs text-text-secondary max-h-32 overflow-y-auto">
                {files.map((f, i) => <li key={i} className="truncate">{f.name}</li>)}
              </ul>
            </div>
          )}

          <button 
            onClick={handleScreening} 
            disabled={screening || files.length === 0}
            className="btn-primary w-full"
          >
            {screening ? "Analyzing Candidates..." : `Screen ${files.length} Resumes`}
          </button>
          
          {error && <p className="text-danger text-xs mt-2">{error}</p>}
        </div>
      </div>

      {/* Right Column: AI Results Ranking */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-primary">AI Ranked Candidates</h2>
          {results.length > 0 && <span className="text-sm text-text-secondary font-medium px-3 py-1 bg-surface border border-border rounded-full">{results.length} processed</span>}
        </div>
        
        {results.length === 0 ? (
          <div className="card p-12 text-center text-text-secondary border-dashed">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Upload resumes on the left to see AI rankings here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, idx) => (
              <div key={idx} className="card p-5 flex flex-col sm:flex-row gap-6 relative overflow-hidden">
                {/* Ranking Ribbon */}
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" opacity={1 - (idx * 0.2)}></div>
                
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{result.candidate_name}</h3>
                      <p className="text-xs text-text-secondary">{result.filename}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full border font-bold text-sm flex items-center gap-1 ${getScoreColor(result.match_score)}`}>
                      {result.match_score >= 75 ? <CheckCircle className="w-4 h-4"/> : result.match_score >= 50 ? <AlertTriangle className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                      {result.match_score}% Match
                    </div>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-3">{result.summary}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {result.matched_keywords.slice(0, 5).map((kw: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200">
                        {kw}
                      </span>
                    ))}
                    {result.matched_keywords.length > 5 && (
                      <span className="text-xs px-2 py-1 text-text-secondary">+{result.matched_keywords.length - 5} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

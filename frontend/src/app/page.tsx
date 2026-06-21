import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">Resume Radar</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-text-secondary hover:text-text-primary font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl font-extrabold text-text-primary tracking-tight mb-6">
              Hire smarter, not harder.
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              Our AI-powered screening system instantly analyzes resumes against job descriptions, 
              providing recruiters with ranked candidates and actionable insights.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/signup?role=recruiter" className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
                I'm a Recruiter <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/signup?role=candidate" className="btn-secondary text-lg px-8 py-3">
                I'm a Candidate
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24">
            <div className="card p-6 border-t-4 border-t-primary">
              <Zap className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Instant Analysis</h3>
              <p className="text-text-secondary">Process hundreds of resumes in seconds using advanced Transformer models.</p>
            </div>
            <div className="card p-6 border-t-4 border-t-primary">
              <ShieldCheck className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Privacy First</h3>
              <p className="text-text-secondary">Resumes are processed entirely in-memory and never stored on disk.</p>
            </div>
            <div className="card p-6 border-t-4 border-t-primary">
              <CheckCircle2 className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Unbiased Ranking</h3>
              <p className="text-text-secondary">Candidates are scored based purely on skill matching and semantic similarity.</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-surface border-t border-border py-8 text-center text-text-secondary">
        <p>© 2026 Resume Radar. Built for the Summer Internship.</p>
      </footer>
    </div>
  );
}

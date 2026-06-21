"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { User, Mail, Lock, Briefcase } from "lucide-react";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "recruiter" ? "recruiter" : "candidate";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetchApi("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });
      setSuccess(response.message);
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-primary">Create Account</h2>
          <p className="text-text-secondary mt-2">Join as a {role === 'recruiter' ? 'Recruiter' : 'Candidate'}</p>
        </div>

        {error && <div className="bg-red-50 text-danger p-3 rounded-md mb-4 text-sm border border-red-200">{error}</div>}
        {success && (
          <div className="bg-green-50 text-success p-4 rounded-md mb-4 text-sm border border-green-200 text-center">
            <p className="font-semibold mb-2">Account Created Successfully!</p>
            <p>{success}</p>
            <Link href="/login" className="btn-primary inline-block mt-4">Go to Login</Link>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="input-field pl-10"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors ${role === 'candidate' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:bg-gray-50'}`}
                  onClick={() => setRole("candidate")}
                >
                  Candidate
                </button>
                <button
                  type="button"
                  className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors ${role === 'recruiter' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:bg-gray-50'}`}
                  onClick={() => setRole("recruiter")}
                >
                  Recruiter
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-text-secondary text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

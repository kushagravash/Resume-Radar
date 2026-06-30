"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { User, Mail, Lock, Key } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "recruiter" ? "recruiter" : "candidate";

  const [step, setStep] = useState<"register" | "otp">("register");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [otpCode, setOtpCode] = useState("");
  
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
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchApi("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp_code: otpCode }),
      });

      localStorage.setItem("access_token", res.access_token);

      // Fetch user profile to get role
      const userRes = await fetchApi("/auth/me", {
        headers: { "Authorization": `Bearer ${res.access_token}` }
      });
      
      // Redirect based on role
      if (userRes.role === "recruiter") {
        router.push("/recruiter/dashboard");
      } else {
        router.push("/candidate/dashboard");
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-primary">
            {step === "register" ? "Create Account" : "Verify Email"}
          </h2>
          <p className="text-text-secondary mt-2">
            {step === "register" ? `Join as a ${role === 'recruiter' ? 'Recruiter' : 'Candidate'}` : "Enter the 6-digit code sent to your email."}
          </p>
        </div>

        {error && <div className="bg-red-50 text-danger p-3 rounded-md mb-4 text-sm border border-red-200">{error}</div>}
        {success && step === "otp" && (
          <div className="bg-green-50 text-success p-3 rounded-md mb-4 text-sm border border-green-200 text-center">
            {success}
          </div>
        )}

        {step === "register" && (
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

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="label">Verification Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="input-field pl-10 tracking-widest text-center text-lg font-mono"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Continue"}
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // The backend route /api/auth/login expects a Pydantic model (UserLogin), 
      // so it must be sent as application/json. We can safely use our fetchApi wrapper.
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let msg = "Login failed";
        try {
           const data = await res.json();
           // FastAPI 422 errors return detail as an array of objects
           msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail || data);
        } catch(err) {}
        throw new Error(msg);
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);

      // Fetch user profile to get role
      const userRes = await fetch("http://localhost:8000/api/auth/me", {
        headers: { "Authorization": `Bearer ${data.access_token}` }
      });
      const user = await userRes.json();
      
      // Redirect based on role
      if (user.role === "recruiter") {
        router.push("/recruiter/dashboard");
      } else {
        router.push("/candidate/dashboard");
      }

    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-primary">Welcome Back</h2>
          <p className="text-text-secondary mt-2">Log in to your account</p>
        </div>

        {error && <div className="bg-red-50 text-danger p-3 rounded-md mb-4 text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
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
                className="input-field pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

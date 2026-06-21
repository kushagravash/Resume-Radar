"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetchApi(`/auth/verify?token=${token}`);
        setStatus("success");
        setMessage(res.message);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Failed to verify email.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="card w-full max-w-md p-8 text-center">
        {status === "loading" && (
          <div className="py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-text-primary">Verifying Email...</h2>
          </div>
        )}
        
        {status === "success" && (
          <div className="py-8">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Email Verified!</h2>
            <p className="text-text-secondary mb-6">{message}</p>
            <Link href="/login" className="btn-primary inline-block">
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-8">
            <XCircle className="h-16 w-16 text-danger mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Verification Failed</h2>
            <p className="text-danger mb-6">{message}</p>
            <Link href="/signup" className="btn-secondary inline-block">
              Back to Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { LogOut, Briefcase, Users, LayoutDashboard } from "lucide-react";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await fetchApi("/auth/me");
        if (data.role !== "recruiter") {
          router.push("/candidate/dashboard");
        } else {
          setUser(data);
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="text-xl font-bold text-primary tracking-tight">Recruiter<span className="text-text-primary">Portal</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/recruiter/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-md text-text-secondary hover:bg-primary-light hover:text-primary transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/recruiter/jobs/new" className="flex items-center gap-3 px-4 py-3 rounded-md text-text-secondary hover:bg-primary-light hover:text-primary transition-colors">
            <Briefcase className="w-5 h-5" /> Post a Job
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full rounded-md text-danger hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

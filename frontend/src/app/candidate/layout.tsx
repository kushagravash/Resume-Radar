"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { LogOut, Briefcase, Search, UserCircle } from "lucide-react";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await fetchApi("/auth/me");
        if (data.role !== "candidate") {
          router.push("/recruiter/dashboard");
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
            <UserCircle className="w-6 h-6" /> Candidate<span className="text-text-primary">Portal</span>
          </span>
          <nav className="hidden md:flex items-center gap-4 border-l border-border pl-6">
            <Link href="/candidate/dashboard" className="text-text-secondary hover:text-primary font-medium flex items-center gap-2 transition-colors">
              <Search className="w-4 h-4" /> Browse Jobs
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-primary">{user?.name}</p>
            <p className="text-xs text-text-secondary">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-md transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

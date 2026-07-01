"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SpeedTest from "@/components/SpeedTest";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("wifi_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      router.push("/login");
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-emerald-600 font-medium">Logged in</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, <span className="text-blue-600">{user.email}</span>
          </h1>
          <p className="text-gray-500 mt-1">Run a speed test or view your profile</p>
        </div>

        <div className="grid gap-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <SpeedTest />
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="font-semibold text-gray-900 mb-4">Account Info</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Plan</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
                Free
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

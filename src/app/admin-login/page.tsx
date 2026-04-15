"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { loginAdmin } from "../admin/actions";

export default function AdminLogin() {
  const [tab, setTab] = useState<"clerk" | "passcode">("clerk");
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md px-4">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Zenchart Admin</h1>
          <p className="text-slate-400 mt-1 text-sm">Secure access to your control panel</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setTab("clerk")}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                tab === "clerk"
                  ? "text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => setTab("passcode")}
              className={`flex-1 py-4 text-sm font-semibold transition-all ${
                tab === "passcode"
                  ? "text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Emergency Passcode
            </button>
          </div>

          <div className="p-8">
            {tab === "clerk" ? (
              <ClerkLoginForm router={router} />
            ) : (
              <PasscodeForm router={router} />
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Protected admin area · Zenchart © 2026
        </p>
      </div>
    </div>
  );
}

// ── Clerk email+password form ──────────────────────────────────────────────
function ClerkLoginForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClerkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        // Check admin role via server action
        const roleCheck = await checkAdminRole();
        if (roleCheck.isAdmin) {
          router.push("/admin");
          router.refresh();
        } else {
          setError("Access denied. Your account does not have admin privileges.");
        }
      } else {
        setError("Sign-in incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("CLERK_DEV_ERROR", err);
      if (err?.errors) console.error("CLERK_ERRORS", JSON.stringify(err.errors, null, 2));
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleClerkLogin} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@yourstore.com"
          className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
          className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !isLoaded}
        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Authenticating...
          </span>
        ) : "Sign In to Dashboard"}
      </button>
    </form>
  );
}

// ── Emergency passcode form ────────────────────────────────────────────────
function PasscodeForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await loginAdmin(passcode);
      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error || "Invalid passcode");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Admin Passcode</label>
        <input
          type="password"
          required
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Enter emergency passcode"
          className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
        />
      </div>
      <p className="text-xs text-slate-500">⚠️ Emergency access only. Use Clerk login when possible.</p>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-slate-600"
      >
        {loading ? "Verifying..." : "Access with Passcode"}
      </button>
    </form>
  );
}

// Server action proxy ─ checks if the currently signed-in Clerk user is ADMIN in DB
async function checkAdminRole(): Promise<{ isAdmin: boolean }> {
  try {
    const res = await fetch("/api/admin/check-role", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      return { isAdmin: data.isAdmin };
    }
    return { isAdmin: false };
  } catch {
    return { isAdmin: false };
  }
}

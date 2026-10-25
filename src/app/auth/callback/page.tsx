"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUserManual } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function handleAuthCallback() {
      try {
        // 1. Check for error parameters in URL (e.g. user cancelled Google OAuth consent)
        const errorParam = searchParams.get("error");
        const errorDesc = searchParams.get("error_description");
        if (errorParam) {
          if (!isCancelled) {
            setStatus("error");
            setErrorMessage(errorDesc || "Google authentication was cancelled or encountered an error.");
          }
          return;
        }

        // 2. Retrieve Supabase Session (Handles both PKCE code flow & implicit hash flow)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // If session is not immediately available, listen for auth state change
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (event === "SIGNED_IN" && currentSession) {
              await processSession(currentSession);
            }
          });

          // Wait 2.5 seconds for listener before falling back
          setTimeout(() => {
            if (!session && status === "loading" && !isCancelled) {
              setStatus("error");
              setErrorMessage("Unable to retrieve Supabase session. Please try logging in again.");
            }
          }, 2500);

          return () => {
            authListener.subscription.unsubscribe();
          };
        } else {
          await processSession(session);
        }
      } catch (err: any) {
        console.error("Auth callback exception:", err);
        if (!isCancelled) {
          setStatus("error");
          setErrorMessage(err.message || "An unexpected error occurred during authentication.");
        }
      }
    }

    async function processSession(session: any) {
      const authUser = session.user;
      if (!authUser || !authUser.email) {
        if (!isCancelled) {
          setStatus("error");
          setErrorMessage("Google account did not provide a valid email address.");
        }
        return;
      }

      const role = searchParams.get("role") || "buyer";
      const fullName = 
        authUser.user_metadata?.full_name || 
        authUser.user_metadata?.name || 
        authUser.email.split("@")[0];

      // 3. Synchronize with Induscycle application database
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google_sync",
          email: authUser.email,
          name: fullName,
          role: role,
          avatar: authUser.user_metadata?.avatar_url || null,
          supabaseId: authUser.id,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        if (!isCancelled) {
          setUserManual(data.user, data.company);
          setStatus("success");

          setTimeout(() => {
            if (data.user.role === "seller") {
              router.push("/dashboard/seller");
            } else {
              router.push("/dashboard/buyer");
            }
          }, 1200);
        }
      } else {
        if (!isCancelled) {
          setStatus("error");
          setErrorMessage(data.error || "Failed to link Google profile with platform workspace.");
        }
      }
    }

    handleAuthCallback();

    return () => {
      isCancelled = true;
    };
  }, [searchParams, router, setUserManual]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-navy-950 border border-slate-800 rounded-2xl p-8 text-center text-white shadow-2xl space-y-6">
        
        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-3 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-black">Authenticating with Google...</h2>
            <p className="text-xs text-slate-400">
              Verifying your session credentials and initializing your Induscycle industrial workspace.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white">Authentication Successful!</h2>
            <p className="text-xs text-slate-300">
              Redirecting you to your industrial procurement &amp; surplus dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/40">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-rose-300">Authentication Failed</h2>
            <p className="text-xs text-slate-300 leading-relaxed bg-navy-900 p-3 rounded-xl border border-slate-800">
              {errorMessage}
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-lg"
              >
                <span>Return to Registration / Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
          Loading authentication callback...
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

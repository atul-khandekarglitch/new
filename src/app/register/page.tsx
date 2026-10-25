"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types";
import { 
  ShoppingCart, 
  Factory, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  Layers,
  Lock,
  Building2,
  Mail,
  User,
  Phone,
  MapPin
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { setUserManual } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>("buyer");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("Automotive Component Stamping");
  const [city, setCity] = useState("Pune");
  const [industrialArea, setIndustrialArea] = useState("Chakan Industrial Area");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?role=${selectedRole}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        setErrorMessage(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to initiate Google authentication.");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!fullName.trim() || !companyName.trim() || !businessEmail.trim()) {
      setErrorMessage("Please complete all mandatory personal and company fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage("Please accept the Induscycle platform terms and industrial verification policy.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          role: selectedRole,
          fullName,
          companyName,
          businessEmail,
          phoneNumber: phone,
          industry,
          companyLocation: city,
          city,
          state: "Maharashtra",
          password,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setUserManual(data.user, data.company);
        setSuccessMessage("Account created successfully! Redirecting to your workspace...");

        setTimeout(() => {
          if (selectedRole === "seller") {
            router.push("/dashboard/seller");
          } else {
            router.push("/dashboard/buyer");
          }
        }, 1200);
      } else {
        setErrorMessage(data.error || "Registration failed. Please check inputs.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-brand-blue text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Industrial Membership</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-navy-950 tracking-tight">
            Join Induscycle
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Connect with manufacturers, discover valuable materials, and participate in a circular industrial economy.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
          
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Section 1: Prominent Role Selection Cards (Section 1 Mandated) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Step 1: Choose Your Primary Activity
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option 1: Buyer Card */}
              <div
                onClick={() => setSelectedRole("buyer")}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === "buyer"
                    ? "border-brand-blue bg-blue-50/50 shadow-md ring-2 ring-blue-100"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center font-bold">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === "buyer" ? "border-brand-blue bg-brand-blue text-white" : "border-slate-300"
                    }`}>
                      {selectedRole === "buyer" && "✓"}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900">Option 1: Buyer</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Procure verified secondary feedstocks and by-products.
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
                      <span>Find industrial materials and manufacturing by-products.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
                      <span>Search suppliers and compatible materials.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
                      <span>Compare material prices and delivered costs.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
                      <span>Submit enquiries and purchase materials.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
                      <span>Track shipments and download invoices.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Option 2: Seller Card */}
              <div
                onClick={() => setSelectedRole("seller")}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === "seller"
                    ? "border-brand-purple bg-purple-50/50 shadow-md ring-2 ring-purple-100"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-brand-purple flex items-center justify-center font-bold">
                      <Factory className="w-6 h-6" />
                    </div>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === "seller" ? "border-brand-purple bg-brand-purple text-white" : "border-slate-300"
                    }`}>
                      {selectedRole === "seller" && "✓"}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900">Option 2: Seller</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Monetize factory offcuts, turnings, and surplus lots.
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                      <span>List surplus industrial materials.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                      <span>Upload product images and technical specifications.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                      <span>Set prices, quantity, dimensions, and location.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                      <span>Receive buyer enquiries and offers.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                      <span>Manage orders, payments, and invoices.</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Option 3: Combined Dual Role */}
            <div
              onClick={() => setSelectedRole("both")}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedRole === "both"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>Option 3: Combined Buyer + Seller</strong> — For vertically integrated plants that produce by-products and procure secondary raw materials.
                </span>
              </div>
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                selectedRole === "both" ? "border-emerald-600 bg-emerald-600 text-white font-bold" : "border-slate-300"
              }`}>
                {selectedRole === "both" && "✓"}
              </span>
            </div>
          </div>

          {/* Google OAuth Quick Sign-Up */}
          <div className="pt-5 pb-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleLoading ? "Connecting to Google..." : `Continue with Google as ${selectedRole === "seller" ? "Seller" : selectedRole === "both" ? "Dual Role" : "Buyer"}`}</span>
            </button>

            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                Or register with corporate business email
              </span>
            </div>
          </div>

          {/* Section 2: Registration Fields */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Step 2: Company &amp; User Credentials
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kulkarni"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Entity *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Bharat Heavy Fabricators Ltd"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Business Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Automotive, Aerospace, Forging"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune, Bengaluru, Chennai"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industrial Area / MIDC</label>
                <input
                  type="text"
                  value={industrialArea}
                  onChange={(e) => setIndustrialArea(e.target.value)}
                  placeholder="e.g. Chakan Phase 2, Bhosari, Peenya"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Terms Acceptance */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-blue mt-0.5"
                />
                <span>
                  I agree to Induscycle&apos;s Industrial Verification Policy, non-hazardous exchange terms, and privacy protocols.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Already registered?{" "}
                <Link href="/marketplace" className="text-brand-blue font-bold hover:underline">
                  Sign In to existing account
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? "Creating Verified Account..." : `Register as ${selectedRole === "seller" ? "Seller" : selectedRole === "both" ? "Buyer + Seller" : "Buyer"}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      </main>

    </div>
  );
}

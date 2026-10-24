"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { X, CheckCircle2, ShieldCheck, Factory, ShoppingCart, RefreshCw, ArrowRight } from "lucide-react";

export default function AuthModal() {
  const { switchRoleModalOpen, setSwitchRoleModalOpen, loginAs, setUserManual } = useAuth();
  const [mode, setMode] = useState<"choose_role" | "register_buyer" | "register_seller" | "register_both">("choose_role");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [industry, setIndustry] = useState("");
  const [subIndustry, setSubIndustry] = useState("");
  const [manufacturingProcess, setManufacturingProcess] = useState("");
  const [companyLocation, setCompanyLocation] = useState("Pune");
  const [requiredMaterials, setRequiredMaterials] = useState("");
  const [materialsGenerated, setMaterialsGenerated] = useState("");

  if (!switchRoleModalOpen) return null;

  const handleRegister = async (role: UserRole) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          role,
          fullName,
          companyName,
          businessEmail,
          phoneNumber,
          industry,
          subIndustry,
          manufacturingProcess,
          companyLocation,
          requiredMaterials,
          materialsGenerated,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUserManual(data.user, data.company);
        setSwitchRoleModalOpen(false);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-brand-purple p-6 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wider text-brand-cyan uppercase">Authentication &amp; Access</span>
            <h2 className="text-2xl font-bold mt-1">What would you like to do on Connector?</h2>
          </div>
          <button
            onClick={() => setSwitchRoleModalOpen(false)}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {mode === "choose_role" ? (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">
                Select your primary activity to configure your workspace, matching preferences, and verification requirements:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Buyer */}
                <div
                  onClick={() => setMode("register_buyer")}
                  className="p-5 rounded-xl border-2 border-slate-200 hover:border-brand-blue bg-white hover:bg-blue-50/40 cursor-pointer transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">1. I&apos;m a Buyer</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Find, assess compatibility, and procure verified industrial by-products, billet ends, offcuts, and secondary feedstocks.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-brand-blue group-hover:translate-x-1 transition-transform">
                    <span>Register as Buyer</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>

                {/* Option 2: Seller */}
                <div
                  onClick={() => setMode("register_seller")}
                  className="p-5 rounded-xl border-2 border-slate-200 hover:border-brand-purple bg-white hover:bg-purple-50/40 cursor-pointer transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-brand-purple flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Factory className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">2. I&apos;m a Seller</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      List surplus manufacturing by-products for sale, reuse, recycling, exchange, or donation with complete metallurgical specs.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-brand-purple group-hover:translate-x-1 transition-transform">
                    <span>Register as Seller</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>

              {/* Option 3: Combined Dual Role */}
              <div
                onClick={() => setMode("register_both")}
                className="p-4 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">Combined Buyer + Seller (Dual Role)</div>
                    <div className="text-xs text-slate-500">For integrated manufacturers that produce by-products and procure secondary inputs.</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </div>

              {/* One-Click Quick Test Accounts */}
              <div className="pt-4 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Instant Demo Logins (Pre-seeded Industrial Accounts)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      loginAs("buyer");
                      setSwitchRoleModalOpen(false);
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-brand-blue text-left bg-slate-50 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-xs font-bold text-brand-blue">Buyer: Rajesh Sharma</div>
                    <div className="text-[11px] text-slate-500 truncate">Kalyani Heavy Fab</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      loginAs("seller");
                      setSwitchRoleModalOpen(false);
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-brand-purple text-left bg-slate-50 hover:bg-purple-50 transition-colors"
                  >
                    <div className="text-xs font-bold text-brand-purple">Seller: Anand Verma</div>
                    <div className="text-[11px] text-slate-500 truncate">Apex Aerospace</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      loginAs("both");
                      setSwitchRoleModalOpen(false);
                    }}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-600 text-left bg-slate-50 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="text-xs font-bold text-emerald-700">Dual: Vikram Patel</div>
                    <div className="text-[11px] text-slate-500 truncate">Precision Auto Forgings</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister(
                  mode === "register_buyer" ? "buyer" : mode === "register_seller" ? "seller" : "both"
                );
              }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">
                  {mode === "register_buyer" && "Buyer Registration"}
                  {mode === "register_seller" && "Seller Registration"}
                  {mode === "register_both" && "Combined Buyer + Seller Registration"}
                </h3>
                <button
                  type="button"
                  onClick={() => setMode("choose_role")}
                  className="text-xs text-brand-blue font-semibold hover:underline"
                >
                  ← Change Role
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kulkarni"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Tata Autocomp Systems"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry &amp; Sub-Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Automotive Component Stamping"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Location (City/State)</label>
                  <input
                    type="text"
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    placeholder="e.g. Pune, Maharashtra"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
              </div>

              {mode === "register_seller" || mode === "register_both" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manufacturing Process &amp; Materials Generated
                  </label>
                  <input
                    type="text"
                    value={materialsGenerated}
                    onChange={(e) => setMaterialsGenerated(e.target.value)}
                    placeholder="e.g. CNC machining turnings, billet drop cuts, laser offcuts"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
              ) : null}

              {mode === "register_buyer" || mode === "register_both" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Secondary Materials or Scrap Types
                  </label>
                  <input
                    type="text"
                    value={requiredMaterials}
                    onChange={(e) => setRequiredMaterials(e.target.value)}
                    placeholder="e.g. SS304 sheet offcuts, EN8 forge scrap, 6061 billet cuts"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
              ) : null}

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMode("choose_role")}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg text-sm font-semibold bg-brand-blue hover:bg-blue-600 text-white shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Creating Account..." : "Complete Registration"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

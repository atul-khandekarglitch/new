"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Layers, 
  Menu, 
  X, 
  UserCircle, 
  ChevronDown, 
  PlusCircle, 
  Search, 
  Truck, 
  Sliders, 
  ShieldCheck,
  Building2,
  LogOut,
  MapPin,
  FileText,
  CreditCard,
  Loader2
} from "lucide-react";
import NotificationCenter from "./NotificationCenter";

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const pathname = usePathname();
  const { 
    user, 
    company, 
    loginAs, 
    setSwitchRoleModalOpen, 
    logout,
    isRoleTransitioning,
    targetRole,
    roleTransitionError,
    clearRoleTransitionError
  } = useAuth();

  const buyerBtnRef = React.useRef<HTMLButtonElement>(null);
  const sellerBtnRef = React.useRef<HTMLButtonElement>(null);
  const bothBtnRef = React.useRef<HTMLButtonElement>(null);
  const [indicatorPos, setIndicatorPos] = useState<{ left: number; width: number }>({ left: 4, width: 92 });

  const currentRole = user?.role || "buyer";
  const activeRole = isRoleTransitioning && targetRole ? targetRole : currentRole;

  React.useEffect(() => {
    const updatePos = () => {
      let targetEl: HTMLButtonElement | null = null;
      if (activeRole === "buyer") targetEl = buyerBtnRef.current;
      else if (activeRole === "seller") targetEl = sellerBtnRef.current;
      else if (activeRole === "both") targetEl = bothBtnRef.current;

      if (targetEl) {
        setIndicatorPos({
          left: targetEl.offsetLeft,
          width: targetEl.offsetWidth,
        });
      }
    };

    updatePos();
    const timer = setTimeout(updatePos, 40);
    window.addEventListener("resize", updatePos);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePos);
    };
  }, [activeRole]);

  React.useEffect(() => {
    if (roleTransitionError) {
      const timer = setTimeout(() => {
        clearRoleTransitionError();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [roleTransitionError, clearRoleTransitionError]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isHome = pathname === "/";
  const navBackground = transparent && isHome
    ? "bg-transparent text-white"
    : "bg-navy-950/95 backdrop-blur-md text-white border-b border-navy-800 shadow-sm";

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-200 ${navBackground}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand (Induscycle Branding) */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                  INDUSCYCLE<span className="w-2 h-2 rounded-full bg-brand-cyan inline-block animate-pulse"></span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-300">
                  Industrial Exchange Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                href="/marketplace"
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  pathname === "/marketplace"
                    ? "text-brand-cyan bg-white/10"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                }`}
              >
                Marketplace
              </Link>

              <Link
                href="/cluster-map"
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  pathname === "/cluster-map"
                    ? "text-brand-cyan bg-white/10"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                }`}
              >
                Cluster Map
              </Link>

              <Link
                href="/material-flow"
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  pathname === "/material-flow"
                    ? "text-brand-cyan bg-white/10"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                }`}
              >
                Material Flow Analysis
              </Link>

              <Link
                href="/payments"
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === "/payments"
                    ? "text-brand-cyan bg-white/10"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Payments</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </Link>

              <Link
                href="/tracking"
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  pathname === "/tracking"
                    ? "text-brand-cyan bg-white/10"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                }`}
              >
                Shipment Tracking
              </Link>

              <Link
                href="/simulator"
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  pathname === "/simulator"
                    ? "text-brand-cyan bg-white/10"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                }`}
              >
                What-If Simulator
              </Link>

              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 rounded-md text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-colors">
                  <span>Platform</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-navy-900 border border-navy-700 shadow-2xl py-2 hidden group-hover:block backdrop-blur-xl z-50">
                  <Link
                    href="/marketplace"
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Search className="w-4 h-4 text-brand-cyan" />
                    <div>
                      <div className="font-medium">Intelligent Search</div>
                      <div className="text-[11px] text-slate-400">Deterministic metallurgy filters</div>
                    </div>
                  </Link>
                  <Link
                    href="/cluster-map"
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-medium">Industrial Cluster Map</div>
                      <div className="text-[11px] text-slate-400">Pune, Bengaluru, Chennai corridors</div>
                    </div>
                  </Link>
                  <Link
                    href="/payments"
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-medium">Supplier Payments &amp; Invoices</div>
                      <div className="text-[11px] text-slate-400">Milestones &amp; 3-way matching</div>
                    </div>
                  </Link>
                  <Link
                    href="/tracking"
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Truck className="w-4 h-4 text-brand-blue" />
                    <div>
                      <div className="font-medium">Live Custody Tracking</div>
                      <div className="text-[11px] text-slate-400">9-stage simulated logistics</div>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/buyer"
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="font-medium">Compatibility Engine</div>
                      <div className="text-[11px] text-slate-400">AI-assisted match explanations</div>
                    </div>
                  </Link>
                  <Link
                    href="/listings/new"
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-brand-purple" />
                    <div>
                      <div className="font-medium">Industrial Listing Suite</div>
                      <div className="text-[11px] text-slate-400">Dimensions &amp; multi-image upload</div>
                    </div>
                  </Link>
                </div>
              </div>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Quick Role Switcher Pill with Smooth Sliding Highlight */}
            <div 
              className="relative flex items-center bg-white/10 rounded-full p-1 border border-white/15"
              role="radiogroup"
              aria-label="User Mode Selector"
            >
              {/* Sliding background highlight pill */}
              <div
                className={`role-indicator-pill absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out shadow-sm pointer-events-none motion-reduce:transition-none ${
                  activeRole === "seller"
                    ? "bg-brand-purple"
                    : activeRole === "both"
                    ? "bg-emerald-600"
                    : "bg-brand-blue"
                }`}
                style={{
                  left: `${indicatorPos.left}px`,
                  width: `${indicatorPos.width}px`,
                }}
              />

              <button
                ref={buyerBtnRef}
                type="button"
                role="radio"
                aria-checked={activeRole === "buyer"}
                disabled={isRoleTransitioning}
                onClick={() => loginAs("buyer")}
                className={`relative z-10 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 ${
                  activeRole === "buyer"
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                } disabled:cursor-not-allowed`}
                title="Switch to Buyer view (Rajesh Sharma)"
              >
                {isRoleTransitioning && targetRole === "buyer" && (
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                )}
                <span>Buyer Mode</span>
              </button>

              <button
                ref={sellerBtnRef}
                type="button"
                role="radio"
                aria-checked={activeRole === "seller"}
                disabled={isRoleTransitioning}
                onClick={() => loginAs("seller")}
                className={`relative z-10 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 ${
                  activeRole === "seller"
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                } disabled:cursor-not-allowed`}
                title="Switch to Seller view (Anand Verma)"
              >
                {isRoleTransitioning && targetRole === "seller" && (
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                )}
                <span>Seller Mode</span>
              </button>

              <button
                ref={bothBtnRef}
                type="button"
                role="radio"
                aria-checked={activeRole === "both"}
                disabled={isRoleTransitioning}
                onClick={() => loginAs("both")}
                className={`relative z-10 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 ${
                  activeRole === "both"
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                } disabled:cursor-not-allowed`}
                title="Switch to Combined Dual Role (Vikram Patel)"
              >
                {isRoleTransitioning && targetRole === "both" && (
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                )}
                <span>Dual</span>
              </button>
            </div>

            {/* List Surplus CTA */}
            <Link
              href="/listings/new"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4 text-brand-cyan" />
              <span>List Surplus</span>
            </Link>

            {/* Register Link */}
            <Link
              href="/register"
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
            >
              Join Induscycle
            </Link>

            {/* Notification Center */}
            <NotificationCenter />

            {/* User Profile / Dashboard Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-indigo text-white text-xs font-semibold hover:opacity-95 shadow-md transition-all"
                >
                  <UserCircle className="w-4 h-4" />
                  <span>{user.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-navy-900 border border-navy-700 shadow-2xl py-2 z-50 text-slate-200 text-xs"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-navy-800">
                      <div className="font-semibold text-white text-sm">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{company?.name}</div>
                      <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-brand-blue/20 text-brand-cyan border border-brand-blue/30">
                        Role: {user.role.toUpperCase()}
                      </div>
                    </div>

                    <Link
                      href={user.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer"}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Building2 className="w-4 h-4 text-brand-cyan" />
                      <span>{user.role === "seller" ? "Seller Dashboard" : "Buyer Dashboard"}</span>
                    </Link>

                    <Link
                      href="/payments"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Supplier Payments</span>
                    </Link>

                    <Link
                      href="/tracking"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Truck className="w-4 h-4 text-emerald-400" />
                      <span>Active Shipments</span>
                    </Link>

                    <Link
                      href="/invoices/inv_2026_001"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Invoices &amp; Receipts</span>
                    </Link>

                    <Link
                      href="/register"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/10 text-cyan-300 hover:text-cyan-200 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Switch / Register New Role</span>
                    </Link>

                    <div className="border-t border-navy-800 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/register"
                className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-blue-600 text-white text-xs font-semibold shadow-md transition-all"
              >
                Sign In / Join
              </Link>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={() => loginAs(user?.role === "buyer" ? "seller" : "buyer")}
              disabled={isRoleTransitioning}
              className="px-2.5 py-1 text-xs rounded bg-white/10 text-white font-medium flex items-center gap-1.5 transition-all disabled:opacity-75"
              title={`Switch to ${user?.role === "buyer" ? "Seller" : "Buyer"} Mode`}
            >
              {isRoleTransitioning && <Loader2 className="w-3 h-3 animate-spin text-white" />}
              <span>{user?.role === "buyer" ? "Buyer" : "Seller"}</span>
            </button>
            <NotificationCenter isMobile />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-950 border-b border-navy-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/marketplace"
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            Marketplace
          </Link>
          <Link
            href="/cluster-map"
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            Industrial Cluster Map
          </Link>
          <Link
            href="/payments"
            className="block px-3 py-2 rounded-md text-base font-medium text-emerald-300 hover:bg-white/10 font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Payments &amp; Invoices
          </Link>
          <Link
            href="/material-flow"
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            Material Flow Analysis
          </Link>
          <Link
            href="/simulator"
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            What-If Simulator
          </Link>
          <Link
            href="/tracking"
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            Shipment Tracking
          </Link>
          <Link
            href="/register"
            className="block px-3 py-2 rounded-md text-base font-medium text-cyan-300 hover:bg-white/10 font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Join Induscycle / Register
          </Link>
          <Link
            href="/listings/new"
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-cyan hover:bg-white/10 font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            + List Your Surplus
          </Link>
          <Link
            href={user?.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer"}
            className="block px-3 py-2 rounded-md text-base font-medium text-white bg-brand-blue"
            onClick={() => setMobileMenuOpen(false)}
          >
            Go to {user?.role === "seller" ? "Seller" : "Buyer"} Dashboard
          </Link>
        </div>
      )}

      {/* Role Transition Error Notification Toast */}
      {roleTransitionError && (
        <div className="fixed top-24 right-4 z-50 max-w-sm p-3.5 rounded-xl bg-rose-900/95 border border-rose-500/50 text-white shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <p className="text-xs text-rose-100">{roleTransitionError}</p>
          </div>
          <button
            onClick={clearRoleTransitionError}
            className="text-xs text-rose-300 hover:text-white p-1"
            title="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
}

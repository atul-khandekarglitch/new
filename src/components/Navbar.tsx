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
  LogOut
} from "lucide-react";

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const pathname = usePathname();
  const { user, company, loginAs, setSwitchRoleModalOpen, logout } = useAuth();
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
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                  CONNECTOR<span className="w-2 h-2 rounded-full bg-brand-cyan inline-block animate-pulse"></span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
                  Industrial Exchange
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                href="/marketplace"
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/marketplace"
                    ? "text-brand-cyan bg-white/10"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                }`}
              >
                Marketplace
              </Link>

              <Link
                href="/material-flow"
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/material-flow"
                    ? "text-brand-cyan bg-white/10"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                }`}
              >
                Material Flow Analysis
              </Link>

              <Link
                href="/simulator"
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/simulator"
                    ? "text-brand-cyan bg-white/10"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                }`}
              >
                What-If Simulator
              </Link>

              <Link
                href="/tracking"
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/tracking"
                    ? "text-brand-cyan bg-white/10"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                }`}
              >
                Shipment Tracking
              </Link>

              <div className="relative group">
                <button className="flex items-center gap-1 px-3.5 py-2 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors">
                  <span>Platform</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-navy-900 border border-navy-700 shadow-2xl py-2 hidden group-hover:block backdrop-blur-xl z-50">
                  <Link
                    href="/marketplace"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Search className="w-4 h-4 text-brand-cyan" />
                    <div>
                      <div className="font-medium">Intelligent Search</div>
                      <div className="text-xs text-slate-400">Deterministic metallurgy filters</div>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard/buyer"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="font-medium">Compatibility Engine</div>
                      <div className="text-xs text-slate-400">AI-assisted match explanations</div>
                    </div>
                  </Link>
                  <Link
                    href="/listings/new"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-brand-purple" />
                    <div>
                      <div className="font-medium">Industrial Listing Suite</div>
                      <div className="text-xs text-slate-400">Dimensions & multi-image upload</div>
                    </div>
                  </Link>
                </div>
              </div>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Quick Role Switcher Pill */}
            <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/15">
              <button
                onClick={() => loginAs("buyer")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  user?.role === "buyer"
                    ? "bg-brand-blue text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Switch to Buyer view (Rajesh Sharma)"
              >
                Buyer Mode
              </button>
              <button
                onClick={() => loginAs("seller")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  user?.role === "seller"
                    ? "bg-brand-purple text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Switch to Seller view (Anand Verma)"
              >
                Seller Mode
              </button>
              <button
                onClick={() => loginAs("both")}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  user?.role === "both"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Switch to Combined Dual Role (Vikram Patel)"
              >
                Dual
              </button>
            </div>

            {/* List Surplus CTA */}
            <Link
              href="/listings/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4 text-brand-cyan" />
              <span>List Surplus</span>
            </Link>

            {/* User Profile / Dashboard Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-brand-blue to-brand-indigo text-white text-sm font-semibold hover:opacity-95 shadow-md transition-all"
                >
                  <UserCircle className="w-4 h-4" />
                  <span>{user.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-navy-900 border border-navy-700 shadow-2xl py-2 z-50 text-slate-200"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-navy-800">
                      <div className="font-semibold text-white text-sm">{user.name}</div>
                      <div className="text-xs text-slate-400 truncate">{company?.name}</div>
                      <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-brand-blue/20 text-brand-cyan border border-brand-blue/30">
                        Role: {user.role.toUpperCase()}
                      </div>
                    </div>

                    <Link
                      href={user.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer"}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Building2 className="w-4 h-4 text-brand-cyan" />
                      <span>{user.role === "seller" ? "Seller Dashboard" : "Buyer Dashboard"}</span>
                    </Link>

                    {user.role === "both" && (
                      <Link
                        href="/dashboard/seller"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <PlusCircle className="w-4 h-4 text-brand-purple" />
                        <span>Seller Controls</span>
                      </Link>
                    )}

                    <Link
                      href="/tracking"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Truck className="w-4 h-4 text-emerald-400" />
                      <span>Active Shipments</span>
                    </Link>

                    <button
                      onClick={() => {
                        setSwitchRoleModalOpen(true);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-white/10 text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Register New Role</span>
                    </button>

                    <div className="border-t border-navy-800 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setSwitchRoleModalOpen(true)}
                className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-blue-600 text-white text-sm font-semibold shadow-md transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={() => loginAs(user?.role === "buyer" ? "seller" : "buyer")}
              className="px-2.5 py-1 text-xs rounded bg-white/10 text-white font-medium"
            >
              {user?.role === "buyer" ? "Buyer" : "Seller"}
            </button>
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
    </header>
  );
}

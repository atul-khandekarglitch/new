"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { MaterialListing, Shipment, EnquiryOffer } from "@/types";
import { 
  Search, 
  ShoppingCart, 
  Sparkles, 
  Truck, 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText,
  DollarSign,
  Building2,
  Bookmark,
  Bell
} from "lucide-react";

export default function BuyerDashboardPage() {
  const { user, company, loginAs } = useAuth();
  
  const [recommendations, setRecommendations] = useState<MaterialListing[]>([]);
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If not logged in as buyer or both, switch
    if (user && user.role !== "buyer" && user.role !== "both") {
      loginAs("buyer");
    }

    Promise.all([
      fetch("/api/listings?status=active").then((r) => r.json()),
      fetch("/api/shipments").then((r) => r.json()),
      fetch("/api/enquiries").then((r) => r.json()),
    ])
      .then(([listingsData, shipmentsData, enquiriesData]) => {
        if (listingsData.success) {
          setRecommendations(listingsData.listings.slice(0, 3));
        }
        if (shipmentsData.success && shipmentsData.shipments.length > 0) {
          setActiveShipment(shipmentsData.shipments[0]);
        }
        if (enquiriesData.success) {
          setEnquiries(enquiriesData.enquiries);
        }
      })
      .catch((err) => console.error("Buyer dashboard load error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AuthModal />

      {/* Dashboard Header Bar */}
      <div className="bg-navy-950 text-white py-8 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-blue/30 text-brand-cyan border border-brand-blue/40 mb-2">
                Buyer Procurement Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Welcome, {user?.name || "Rajesh Sharma"}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                {company?.name || "Kalyani Industrial Equipment"} • Destination Hub: {company?.city || "Pune"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/marketplace"
                className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Secondary Feedstocks</span>
              </Link>
              <Link
                href="/simulator"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors flex items-center gap-2"
              >
                <Calculator className="w-3.5 h-3.5 text-cyan-300" />
                <span>What-If Simulator</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Intake Inquiries</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{enquiries.length || 2}</div>
            <span className="text-[11px] text-emerald-600 font-medium">1 accepted proposal</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase">Consignments In Transit</span>
            <div className="text-2xl font-black text-brand-blue mt-1">1 Consignment</div>
            <span className="text-[11px] text-slate-500">Stage 4: In transit (NH-48)</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase">Cumulative Landed Savings</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹3.8 Lakhs</div>
            <span className="text-[11px] text-emerald-700 font-medium">34% vs virgin distributor</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase">Verified Traceability</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">100% MTR</div>
            <span className="text-[11px] text-slate-500">Certified heat analyses</span>
          </div>
        </div>

        {/* Live Active Shipment Tracking Tile (Section 41) */}
        {activeShipment && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Inbound Consignment: {activeShipment.trackingNumber}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {activeShipment.listingTitle} • Carrier: {activeShipment.carrierName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-brand-blue border border-blue-200">
                  Stage {activeShipment.currentStage}/9: In Transit
                </span>
                <Link
                  href="/tracking"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-brand-blue transition-colors"
                >
                  View Full Tracking
                </Link>
              </div>
            </div>

            {/* Stage Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600 font-semibold">
                <span>Origin: {activeShipment.origin}</span>
                <span>Current: Udaipur Bypass, NH-48</span>
                <span>Destination: {activeShipment.destination}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-blue to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${(activeShipment.currentStage / 9) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Materials & AI Matches (Section 36 & 39) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-blue" />
                <span>Recommended Materials For Your Manufacturing Process</span>
              </h2>
              <p className="text-xs text-slate-500">
                Matched deterministically against your plant specifications and destination logistics.
              </p>
            </div>
            <Link href="/marketplace" className="text-xs font-semibold text-brand-blue hover:underline">
              Browse All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                      {item.materialCategory}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      MTR Verified
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{item.title}</h3>
                  <div className="text-xs text-slate-500 mt-1">{item.city}, {item.state}</div>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Grade:</span>
                      <span className="font-bold text-slate-800">{item.grade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stock Available:</span>
                      <span className="font-bold text-slate-800">{item.totalQuantity} {item.quantityUnit}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-brand-blue">₹{item.pricePerUnit}</span>
                    <span className="text-[10px] text-slate-400"> / {item.quantityUnit}</span>
                  </div>
                  <Link
                    href={`/listings/${item.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-brand-blue text-white text-xs font-bold transition-colors"
                  >
                    Assess Specs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Sourcing Simulator Callout */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-300">Procurement Decision Support</span>
            <h3 className="text-lg font-black">Run Multi-Supplier Landed Cost Simulation</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Model material price, haulage rates, cleaning overheads, and usable yield to calculate net bottom-line savings before issuing purchase orders.
            </p>
          </div>
          <Link
            href="/simulator"
            className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-navy-950 font-bold text-xs whitespace-nowrap shadow-md transition-colors"
          >
            Open Simulator
          </Link>
        </div>

      </main>

    </div>
  );
}

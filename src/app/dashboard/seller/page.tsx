"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { MaterialListing, EnquiryOffer, BuyerRequirement, Order } from "@/types";
import { 
  PlusCircle, 
  Layers, 
  Eye, 
  Send, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Truck, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Trash2,
  Edit,
  FileText
} from "lucide-react";

export default function SellerDashboardPage() {
  const { user, company, loginAs } = useAuth();
  
  const [listings, setListings] = useState<MaterialListing[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryOffer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If not logged in as seller or both, switch
    if (user && user.role !== "seller" && user.role !== "both") {
      loginAs("seller");
    }

    Promise.all([
      fetch("/api/listings?status=all").then((r) => r.json()),
      fetch("/api/enquiries").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ])
      .then(([listingsData, enquiriesData, ordersData]) => {
        if (listingsData.success) {
          setListings(listingsData.listings);
        }
        if (enquiriesData.success) {
          setEnquiries(enquiriesData.enquiries);
        }
        if (ordersData.success && ordersData.orders) {
          setOrders(ordersData.orders);
        }
      })
      .catch((err) => console.error("Seller dashboard error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const totalStockKg = listings.reduce((acc, curr) => acc + (curr.totalQuantity || 0), 0);
  const totalValueINR = listings.reduce((acc, curr) => acc + ((curr.totalQuantity || 0) * (curr.pricePerUnit || 0)), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <AuthModal />

      {/* Header Bar */}
      <div className="bg-navy-950 text-white py-8 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-purple/30 text-purple-300 border border-brand-purple/40 mb-2">
                Induscycle Manufacturing Plant Dispatch Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                {user?.name || "Anand Verma"} — Seller Workspace
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                {company?.name || "Apex Aerospace Components Ltd."} • Plant Location: {company?.city || "Bengaluru"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/listings/new"
                className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add New Material</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase">Published Listings</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{listings.length}</div>
            <span className="text-[11px] text-brand-purple font-medium">100% active on exchange</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Listed Stock</span>
            <div className="text-2xl font-black text-brand-blue mt-1">
              {(totalStockKg / 1000).toFixed(1)} MT
            </div>
            <span className="text-[11px] text-slate-500">Across {listings.length} metallurgical lots</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase">Inventory Realization</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ₹{(totalValueINR / 100000).toFixed(1)} Lakhs
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Expected sales revenue</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold uppercase">Buyer RFQs &amp; Enquiries</span>
            <div className="text-2xl font-black text-purple-600 mt-1">{enquiries.length || 3}</div>
            <span className="text-[11px] text-slate-500">High purchase interest</span>
          </div>
        </div>

        {/* Section: Customer Procurement Orders & Invoices */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-purple" />
                <span>Customer Orders &amp; Tax Invoices</span>
              </h2>
              <p className="text-xs text-slate-500">
                Confirmed buyer purchase orders, payment verification, and dispatch tax documentation.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-brand-purple">
              {orders.length} Verified Orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order ID &amp; Date</th>
                  <th className="py-3 px-3">Buyer Company</th>
                  <th className="py-3 px-3">Destination Delivery Address</th>
                  <th className="py-3 px-3">Gross Realization</th>
                  <th className="py-3 px-3">Payment Status</th>
                  <th className="py-3 px-4 text-right">Tax Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{order.id}</div>
                      <div className="text-[11px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{order.buyerCompanyName}</div>
                      <div className="text-[11px] text-slate-500">Attn: {order.buyerName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800">{order.buyerAddress || "Bhosari MIDC, Pune, Maharashtra"}</div>
                      <div className="text-[11px] text-slate-500">Commercial Carrier Assigned</div>
                    </td>
                    <td className="py-3 px-3">
                      <strong className="text-emerald-700 text-sm">₹{order.totalAmount.toLocaleString()}</strong>
                      <div className="text-[10px] text-slate-400">Paid in full</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/invoices/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-brand-purple text-white font-bold text-xs shadow-sm transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Material Listings Table (Section 36 & 37) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-purple" />
                <span>My Plant Material Listings &amp; Inventories</span>
              </h2>
              <p className="text-xs text-slate-500">
                Manage dimensions, certifications, available volume, and pricing.
              </p>
            </div>

            <Link
              href="/listings/new"
              className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              + Create New Listing
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Material / Title</th>
                  <th className="py-3 px-3">Grade</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Available Quantity</th>
                  <th className="py-3 px-3">Price / Unit</th>
                  <th className="py-3 px-3">Verification</th>
                  <th className="py-3 px-3">Performance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.city}, {item.state}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800">{item.grade}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                        {item.materialCategory}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <strong className="text-slate-900">{item.totalQuantity.toLocaleString()}</strong> {item.quantityUnit}
                    </td>
                    <td className="py-3 px-3">
                      <strong className="text-brand-blue">₹{item.pricePerUnit}</strong> / {item.quantityUnit}
                    </td>
                    <td className="py-3 px-3">
                      {item.verificationState === "verified" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          MTR Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                          Declared
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {item.viewsCount}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Send className="w-3 h-3 text-brand-purple" />
                          {item.enquiriesCount}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/listings/${item.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-800 font-bold transition-colors inline-block"
                      >
                        View / Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incoming Buyer Enquiries & Negotiations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
                <Send className="w-4 h-4 text-brand-purple" />
                <span>Incoming Buyer Enquiries &amp; Purchase Offers</span>
              </h2>
              <p className="text-xs text-slate-500">Direct technical RFQs from certified industrial buyers.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-brand-purple">
              {enquiries.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{enq.buyerCompanyName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brand-blue uppercase">
                      {enq.type}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-1">
                    Target: <strong>{enq.listingTitle}</strong> • Quantity: <strong>{enq.quantity} units</strong> • Offered Price: <strong>₹{enq.offeredPrice}/unit</strong>
                  </div>
                  {enq.message && (
                    <p className="text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-100 max-w-xl">
                      &quot;{enq.message}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => alert("Offer accepted! Logistics dispatch consignment created.")}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Accept Offer
                  </button>
                  <button
                    onClick={() => alert("Offer marked as under review.")}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    Counter / Inquire
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

    </div>
  );
}

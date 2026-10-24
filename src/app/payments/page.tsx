"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { SupplierInvoice, InvoiceApprovalStatus, InvoicePaymentStatus, EligibilityStatus } from "@/types";
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Truck,
  ArrowUpRight,
  ChevronRight,
  X,
  RotateCcw,
  Building2,
  Calendar,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Receipt,
  Layers,
  Sparkles
} from "lucide-react";

export default function SupplierPaymentsPage() {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [summary, setSummary] = useState({
    totalPayable: 0,
    totalPaid: 0,
    pendingPayment: 0,
    overduePayment: 0,
    pendingApproval: 0,
    upcomingCashObligations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApprovalFilter, setSelectedApprovalFilter] = useState<string>("all");
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>("all");
  const [selectedScenarioFilter, setSelectedScenarioFilter] = useState<string>("all");

  // Modals & Detail State
  const [activeInvoice, setActiveInvoice] = useState<SupplierInvoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [clarificationInput, setClarificationInput] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmountInput, setPayAmountInput] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
        setSummary(data.summary);
        if (activeInvoice) {
          const updated = data.invoices.find((i: SupplierInvoice) => i.id === activeInvoice.id);
          if (updated) setActiveInvoice(updated);
        }
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleApprove = async (inv: SupplierInvoice) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          invoiceId: inv.id,
          processedBy: "Rajesh Sharma (Head of Procurement)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          type: "success",
          text: `Invoice ${inv.invoiceNumber} approved successfully. Status set to Approved.`,
        });
        await fetchPayments();
        if (activeInvoice?.id === inv.id) {
          setActiveInvoice(data.invoice);
        }
      } else {
        setFeedbackMessage({ type: "error", text: data.error || "Approval failed" });
      }
    } catch (err) {
      console.error("Approve error:", err);
      setFeedbackMessage({ type: "error", text: "Network error during approval." });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleConfirmReject = async () => {
    if (!activeInvoice || !rejectReasonInput.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          invoiceId: activeInvoice.id,
          rejectionReason: rejectReasonInput.trim(),
          processedBy: "Rajesh Sharma (Head of Procurement)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          type: "success",
          text: `Invoice ${activeInvoice.invoiceNumber} rejected with documented reason.`,
        });
        setShowRejectModal(false);
        setRejectReasonInput("");
        await fetchPayments();
        setActiveInvoice(data.invoice);
      } else {
        setFeedbackMessage({ type: "error", text: data.error || "Rejection failed" });
      }
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleConfirmClarification = async () => {
    if (!activeInvoice || !clarificationInput.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clarification",
          invoiceId: activeInvoice.id,
          clarificationQuery: clarificationInput.trim(),
          processedBy: "Rajesh Sharma (Head of Procurement)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          type: "success",
          text: `Clarification request logged for ${activeInvoice.invoiceNumber}.`,
        });
        setShowClarificationModal(false);
        setClarificationInput("");
        await fetchPayments();
        setActiveInvoice(data.invoice);
      } else {
        setFeedbackMessage({ type: "error", text: data.error || "Clarification request failed" });
      }
    } catch (err) {
      console.error("Clarification error:", err);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleConfirmPay = async () => {
    if (!activeInvoice) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pay",
          invoiceId: activeInvoice.id,
          amount: payAmountInput > 0 ? payAmountInput : activeInvoice.outstandingBalance,
          paymentMethod: "Industrial Verified Escrow (Demo Mode)",
          processedBy: "Rajesh Sharma (Head of Procurement)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          type: "success",
          text: data.message || `Demo payout processed! Ref: ${data.transaction.transactionReference}`,
        });
        setShowPayModal(false);
        await fetchPayments();
        setActiveInvoice(data.invoice);
      } else {
        setFeedbackMessage({ type: "error", text: data.error || "Payment processing failed" });
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.listingTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesApproval =
      selectedApprovalFilter === "all" || inv.approvalStatus === selectedApprovalFilter;

    const matchesPayment =
      selectedPaymentFilter === "all" || inv.paymentStatus === selectedPaymentFilter;

    const matchesScenario =
      selectedScenarioFilter === "all" || inv.scenarioTag === selectedScenarioFilter;

    return matchesSearch && matchesApproval && matchesPayment && matchesScenario;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Header Bar */}
      <div className="bg-navy-950 text-white py-8 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                <CreditCard className="w-3 h-3" />
                <span>Section 42 • Smart Supplier Payments &amp; Invoice Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Supplier Invoice &amp; Payment Management
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Real-time 3-way matching (PO vs Invoice vs GRN), contractual milestone disbursements, and automated commercial liability controls.
              </p>
            </div>

            {/* Quick Demo Scenario Switcher Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-navy-900/90 p-1.5 rounded-xl border border-navy-700 text-xs">
              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Scenarios:</span>
              <button
                onClick={() => setSelectedScenarioFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  selectedScenarioFilter === "all" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                All (5)
              </button>
              <button
                onClick={() => setSelectedScenarioFilter("Scenario A")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  selectedScenarioFilter === "Scenario A" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Scenario A: PrecisionForge - Fully Paid"
              >
                A: Paid
              </button>
              <button
                onClick={() => setSelectedScenarioFilter("Scenario B")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  selectedScenarioFilter === "Scenario B" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Scenario B: Apex CNC - Pending Due"
              >
                B: Pending
              </button>
              <button
                onClick={() => setSelectedScenarioFilter("Scenario C")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  selectedScenarioFilter === "Scenario C" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Scenario C: Bharat Tooling - Overdue 4 Days"
              >
                C: Overdue
              </button>
              <button
                onClick={() => setSelectedScenarioFilter("Scenario D")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  selectedScenarioFilter === "Scenario D" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Scenario D: Deccan Machining - Invoice Mismatch Blocked"
              >
                D: Mismatch
              </button>
              <button
                onClick={() => setSelectedScenarioFilter("Scenario E")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  selectedScenarioFilter === "Scenario E" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Scenario E: Vertex Metalcraft - QA Inspection Pending"
              >
                E: QA Pending
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Dynamic Alerts Banner */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold transition-all shadow-md ${
              feedbackMessage.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                : "bg-rose-50 text-rose-900 border border-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button onClick={() => setFeedbackMessage(null)} className="text-slate-500 hover:text-slate-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Financial Summary KPIs (Single Source of Truth) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Payable</span>
            <div className="text-lg sm:text-xl font-black text-slate-900">
              ₹{summary.totalPayable.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">All active supplier claims</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">Total Paid</span>
            <div className="text-lg sm:text-xl font-black text-emerald-700">
              ₹{summary.totalPaid.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Cleared via escrow settlement</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">Pending Payment</span>
            <div className="text-lg sm:text-xl font-black text-blue-700">
              ₹{summary.pendingPayment.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Approved &amp; scheduled</div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-300 shadow-sm space-y-1 relative overflow-hidden">
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-600 animate-ping"></div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700">Overdue Payment</span>
            <div className="text-lg sm:text-xl font-black text-rose-700">
              ₹{summary.overduePayment.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Past contractual due date</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">Pending Approval</span>
            <div className="text-lg sm:text-xl font-black text-amber-700">
              ₹{summary.pendingApproval.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Under review / clarification</div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 text-white border border-navy-800 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">Upcoming (14 Days)</span>
            <div className="text-lg sm:text-xl font-black text-white">
              ₹{summary.upcomingCashObligations.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-300 font-medium">Cash outflow requirement</div>
          </div>

        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
          
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice, supplier, PO, or tracking ID..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue text-xs text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Approval Filter */}
            <select
              value={selectedApprovalFilter}
              onChange={(e) => setSelectedApprovalFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="all">All Approval States</option>
              <option value="Approved">Approved</option>
              <option value="Under Review">Under Review</option>
              <option value="Needs Clarification">Needs Clarification</option>
              <option value="Rejected">Rejected</option>
              <option value="Pending Review">Pending Review</option>
            </select>

            {/* Payment Filter */}
            <select
              value={selectedPaymentFilter}
              onChange={(e) => setSelectedPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="all">All Payment States</option>
              <option value="Paid">Paid</option>
              <option value="Pending Payment">Pending Payment</option>
              <option value="Overdue">Overdue</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Not Due">Not Due</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedApprovalFilter("all");
                setSelectedPaymentFilter("all");
                setSelectedScenarioFilter("all");
              }}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-semibold transition-colors flex items-center gap-1"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-brand-blue" />
              <h2 className="text-sm font-black text-slate-900">
                Supplier Accounts Payable &amp; Invoices ({filteredInvoices.length})
              </h2>
            </div>
            <div className="text-[11px] text-slate-500">
              Showing deterministic contractual milestone records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice / Tag</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">PO &amp; Shipment</th>
                  <th className="py-3 px-4 text-right">Invoice Amount</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Outstanding</th>
                  <th className="py-3 px-4">Terms &amp; Due Date</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Eligibility</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      No invoices match the specified criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isOverdue = inv.paymentStatus === "Overdue";
                    return (
                      <tr
                        key={inv.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isOverdue ? "bg-rose-50/30" : ""
                        }`}
                      >
                        {/* Invoice & Scenario Tag */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => {
                              setActiveInvoice(inv);
                              setShowDetailModal(true);
                            }}
                            className="font-bold text-brand-blue hover:underline text-left block"
                          >
                            {inv.invoiceNumber}
                          </button>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            {inv.scenarioTag}
                          </span>
                        </td>

                        {/* Supplier */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          <div>{inv.supplierName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">GST: {inv.supplierGst || "N/A"}</div>
                        </td>

                        {/* PO & Tracking */}
                        <td className="py-3.5 px-4 text-[11px] text-slate-600">
                          <div className="font-semibold text-slate-900">{inv.poNumber}</div>
                          <div className="text-slate-400 font-mono">{inv.trackingNumber}</div>
                        </td>

                        {/* Invoice Amount */}
                        <td className="py-3.5 px-4 text-right font-black text-slate-900">
                          ₹{inv.invoiceAmount.toLocaleString("en-IN")}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                          ₹{inv.paidAmount.toLocaleString("en-IN")}
                        </td>

                        {/* Outstanding Balance */}
                        <td className="py-3.5 px-4 text-right font-black text-slate-900">
                          ₹{inv.outstandingBalance.toLocaleString("en-IN")}
                        </td>

                        {/* Terms & Due Date */}
                        <td className="py-3.5 px-4 text-[11px]">
                          <div className="font-semibold text-slate-800">{inv.paymentTerms}</div>
                          <div className={`mt-0.5 flex items-center gap-1 ${
                            isOverdue ? "text-rose-600 font-bold" : "text-slate-500"
                          }`}>
                            <Calendar className="w-3 h-3" />
                            <span>{inv.dueDate}</span>
                            {isOverdue && <span className="text-[9px] bg-rose-100 px-1 rounded uppercase">Overdue</span>}
                          </div>
                        </td>

                        {/* Approval Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                            inv.approvalStatus === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.approvalStatus === "Under Review"
                              ? "bg-purple-100 text-purple-800"
                              : inv.approvalStatus === "Needs Clarification"
                              ? "bg-amber-100 text-amber-800"
                              : inv.approvalStatus === "Rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-800"
                          }`}>
                            {inv.approvalStatus}
                          </span>
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                            inv.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.paymentStatus === "Pending Payment"
                              ? "bg-blue-100 text-blue-800"
                              : inv.paymentStatus === "Overdue"
                              ? "bg-rose-600 text-white animate-pulse"
                              : inv.paymentStatus === "Partially Paid"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {inv.paymentStatus}
                          </span>
                        </td>

                        {/* Eligibility Status */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            inv.eligibilityStatus === "Eligible"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : inv.eligibilityStatus === "Blocked"
                              ? "bg-rose-50 text-rose-700 border border-rose-300"
                              : inv.eligibilityStatus === "Pending evidence"
                              ? "bg-purple-50 text-purple-700 border border-purple-300"
                              : "bg-amber-50 text-amber-700 border border-amber-300"
                          }`}
                          title={inv.eligibilityReason}
                          >
                            <span>{inv.eligibilityStatus}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setActiveInvoice(inv);
                                setShowDetailModal(true);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px]"
                              title="Inspect 3-way match & contractual milestones"
                            >
                              Review
                            </button>

                            {/* Mark as Paid Demo Button */}
                            {inv.outstandingBalance > 0 && (
                              <button
                                onClick={() => {
                                  setActiveInvoice(inv);
                                  setPayAmountInput(inv.outstandingBalance);
                                  setShowPayModal(true);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] shadow-sm flex items-center gap-1"
                                title="Process payment in test mode"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Pay</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3-Way Match & Discrepancy Diagnostics Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-blue" />
              <h3 className="text-sm font-black text-slate-900">
                Contractual 3-Way Matching Rules
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Induscycle automatically compares <strong>Purchase Order (PO)</strong> line items, <strong>Supplier Invoices</strong>, and verified <strong>Goods Receipt Notes (GRN)</strong>. Any variance beyond ±0.5% in quantity or unit rate automatically locks milestone disbursement until resolved.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">Quantity Tolerance</span>
                <span className="font-mono text-emerald-700 font-bold">Strict Weighbridge Zero-Slip</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">Unit Price Variance</span>
                <span className="font-mono text-emerald-700 font-bold">0.00% (Strict PO Lock)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">Quality Inspection Milestone</span>
                <span className="font-mono text-purple-700 font-bold">AS9100 / Spectrometer Sign-Off</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">
                Cash Flow Obligations &amp; Operational Runway
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Summary of upcoming supplier liabilities scheduled for settlement. All transactions are backed by escrow verification with immutable audit references.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-blue-800 block text-[10px] font-bold uppercase">Due in 5 Days (Scenario B)</span>
                <span className="text-sm font-black text-blue-900 block mt-1">₹2,45,000</span>
                <span className="text-[10px] text-blue-700">Apex CNC Solutions</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300">
                <span className="text-rose-800 block text-[10px] font-bold uppercase">Overdue 4 Days (Scenario C)</span>
                <span className="text-sm font-black text-rose-900 block mt-1">₹1,85,000</span>
                <span className="text-[10px] text-rose-700">Bharat Tooling Works</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Invoice Detail Modal with 3-Way Match & Milestones */}
      {showDetailModal && activeInvoice && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/30 text-cyan-300 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black">{activeInvoice.invoiceNumber}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-blue text-white">
                      {activeInvoice.scenarioTag}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                      DEMO MODE
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Supplier: <strong>{activeInvoice.supplierName}</strong> • PO: <strong>{activeInvoice.poNumber}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Financial Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Invoice Total</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    ₹{activeInvoice.invoiceAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Paid</span>
                  <span className="text-base font-black text-emerald-700 mt-0.5 block">
                    ₹{activeInvoice.paidAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Outstanding</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    ₹{activeInvoice.outstandingBalance.toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Terms</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {activeInvoice.paymentTerms}
                  </span>
                </div>
              </div>

              {/* Eligibility & Explanation Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                activeInvoice.eligibilityStatus === "Eligible"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : activeInvoice.eligibilityStatus === "Blocked"
                  ? "bg-rose-50 border-rose-300 text-rose-950"
                  : "bg-amber-50 border-amber-300 text-amber-950"
              }`}>
                <div className="mt-0.5">
                  {activeInvoice.eligibilityStatus === "Eligible" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : activeInvoice.eligibilityStatus === "Blocked" ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <span>Disbursement Eligibility:</span>
                    <span className="uppercase text-[11px] underline">
                      {activeInvoice.eligibilityStatus}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {activeInvoice.eligibilityReason}
                  </p>
                  {activeInvoice.rejectionReason && (
                    <div className="text-rose-700 font-semibold pt-1">
                      Logged Rejection Reason: {activeInvoice.rejectionReason}
                    </div>
                  )}
                  {activeInvoice.clarificationQuery && (
                    <div className="text-amber-800 font-semibold pt-1">
                      Clarification Note: {activeInvoice.clarificationQuery}
                    </div>
                  )}
                </div>
              </div>

              {/* 3-Way Matching Verification Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-blue" />
                    <span>3-Way Match Verification (PO vs Invoice vs GRN)</span>
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeInvoice.threeWayMatch.matched
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}>
                    {activeInvoice.threeWayMatch.matched ? "✓ 100% Match Verified" : "⚠ Match Variance Triggered"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Verification Dimension</th>
                        <th className="py-2.5 px-3">Purchase Order ({activeInvoice.threeWayMatch.poNumber})</th>
                        <th className="py-2.5 px-3">Supplier Invoice ({activeInvoice.invoiceNumber})</th>
                        <th className="py-2.5 px-3">GRN Receipt ({activeInvoice.threeWayMatch.grnNumber})</th>
                        <th className="py-2.5 px-3 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">Quantity</td>
                        <td className="py-2.5 px-3">{activeInvoice.threeWayMatch.poQuantity} kg</td>
                        <td className="py-2.5 px-3">{activeInvoice.threeWayMatch.invoiceQuantity} kg</td>
                        <td className="py-2.5 px-3">{activeInvoice.threeWayMatch.grnQuantity} kg</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            activeInvoice.threeWayMatch.quantityMatch
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {activeInvoice.threeWayMatch.quantityMatch ? "MATCH" : "MISMATCH"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">Unit Rate (₹/kg)</td>
                        <td className="py-2.5 px-3">₹{activeInvoice.threeWayMatch.poUnitRate.toFixed(2)}</td>
                        <td className="py-2.5 px-3">₹{activeInvoice.threeWayMatch.invoiceUnitRate.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-slate-400">N/A (Weighbridge)</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            activeInvoice.threeWayMatch.unitRateMatch
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {activeInvoice.threeWayMatch.unitRateMatch ? "MATCH" : "MISMATCH"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">Total Valuation</td>
                        <td className="py-2.5 px-3">₹{activeInvoice.threeWayMatch.poTotal.toLocaleString("en-IN")}</td>
                        <td className="py-2.5 px-3">₹{activeInvoice.threeWayMatch.invoiceTotal.toLocaleString("en-IN")}</td>
                        <td className="py-2.5 px-3 text-slate-400">N/A (Logistics Slip)</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            activeInvoice.threeWayMatch.totalMatch
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {activeInvoice.threeWayMatch.totalMatch ? "MATCH" : "MISMATCH"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">Quality QA Sign-Off</td>
                        <td className="py-2.5 px-3">Spec Required</td>
                        <td className="py-2.5 px-3">Billed</td>
                        <td className="py-2.5 px-3 font-semibold">{activeInvoice.threeWayMatch.grnCondition}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            activeInvoice.threeWayMatch.qualitySignOff
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {activeInvoice.threeWayMatch.qualitySignOff ? "PASSED" : "PENDING QA"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Discrepancies if any */}
                {activeInvoice.threeWayMatch.discrepancies.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                    <span className="font-bold text-rose-900 block text-[11px]">Audit Exceptions Flagged:</span>
                    <ul className="list-disc list-inside text-rose-700 text-[11px] space-y-0.5">
                      {activeInvoice.threeWayMatch.discrepancies.map((disc, idx) => (
                        <li key={idx}>{disc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Contractual Milestones Breakdown */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Contractual Payment Milestones (Total: 100%)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeInvoice.milestones.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl border space-y-1.5 ${
                        m.status === "paid"
                          ? "bg-emerald-50/60 border-emerald-300"
                          : m.status === "verified"
                          ? "bg-blue-50/60 border-blue-300"
                          : m.status === "blocked"
                          ? "bg-rose-50/60 border-rose-300"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{m.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          m.status === "paid"
                            ? "bg-emerald-200 text-emerald-900"
                            : m.status === "verified"
                            ? "bg-blue-200 text-blue-900"
                            : m.status === "blocked"
                            ? "bg-rose-200 text-rose-900"
                            : "bg-slate-200 text-slate-700"
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <div className="text-sm font-black text-slate-900">
                        ₹{m.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {m.condition}
                      </div>
                      {m.verifiedAt && (
                        <div className="text-[9px] text-slate-400 pt-1">
                          Verified on: {new Date(m.verifiedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Immutable Transaction History */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-slate-600" />
                  <span>Disbursement Audit History ({activeInvoice.transactions.length})</span>
                </h4>

                {activeInvoice.transactions.length === 0 ? (
                  <div className="p-3 text-slate-400 bg-slate-50 rounded-xl text-center border border-slate-200">
                    No payment transactions recorded yet for this invoice.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeInvoice.transactions.map((txn) => (
                      <div
                        key={txn.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold font-mono text-emerald-700">{txn.transactionReference}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(txn.paymentDate).toLocaleString()} • Processed by {txn.processedBy}
                          </div>
                          {txn.note && <div className="text-[10px] text-slate-600 italic mt-0.5">{txn.note}</div>}
                        </div>
                        <div className="text-right">
                          <div className="font-black text-slate-900">₹{txn.amount.toLocaleString("en-IN")}</div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 text-[11px]">
                Authorized Signatory: <strong>Rajesh Sharma (Head of Procurement)</strong>
              </div>

              <div className="flex items-center gap-2">
                {/* Approve Button */}
                {activeInvoice.approvalStatus !== "Approved" && (
                  <button
                    onClick={() => handleApprove(activeInvoice)}
                    disabled={isProcessing}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-50"
                  >
                    Approve Invoice
                  </button>
                )}

                {/* Clarification Button */}
                <button
                  onClick={() => setShowClarificationModal(true)}
                  disabled={isProcessing}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  Request Clarification
                </button>

                {/* Reject Button */}
                {activeInvoice.approvalStatus !== "Rejected" && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isProcessing}
                    className="px-3.5 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    Reject
                  </button>
                )}

                {/* Payout Button */}
                {activeInvoice.outstandingBalance > 0 && (
                  <button
                    onClick={() => {
                      setPayAmountInput(activeInvoice.outstandingBalance);
                      setShowPayModal(true);
                    }}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white rounded-xl font-black shadow-md transition-all flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Mark as Paid — Demo Mode</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Reject Confirmation Modal with Required Reason */}
      {showRejectModal && activeInvoice && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-900">
                Reject Invoice {activeInvoice.invoiceNumber}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please state the technical, contractual, or commercial reason for rejecting this supplier invoice. This will be permanently logged in the audit trail.
            </p>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Rejection Reason (Mandatory):
              </label>
              <textarea
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="e.g. Chemical spectrometer analysis failed required UNS grade specification..."
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReasonInput.trim() || isProcessing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarification Request Modal */}
      {showClarificationModal && activeInvoice && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <HelpCircle className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-900">
                Request Clarification from {activeInvoice.supplierName}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter the specific variance or question for the supplier. Status will transition to <strong>Needs Clarification</strong>.
            </p>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Clarification Query:
              </label>
              <textarea
                value={clarificationInput}
                onChange={(e) => setClarificationInput(e.target.value)}
                placeholder="e.g. Weighbridge slip indicates 500 kg net received, please reconcile +50 kg billed surplus..."
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClarificationModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClarification}
                disabled={!clarificationInput.trim() || isProcessing}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
              >
                Send Clarification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Demo Modal */}
      {showPayModal && activeInvoice && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <CreditCard className="w-6 h-6" />
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Release Supplier Payment (Demo Mode)
                </h3>
                <span className="text-[10px] uppercase font-bold text-amber-600">
                  Simulated Transaction Gateway
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Invoice:</span>
                <span className="font-bold text-slate-900">{activeInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Beneficiary Supplier:</span>
                <span className="font-bold text-slate-900">{activeInvoice.supplierName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Current Outstanding:</span>
                <span className="font-bold text-slate-900">₹{activeInvoice.outstandingBalance.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Disbursement Amount (₹):
              </label>
              <input
                type="number"
                value={payAmountInput}
                onChange={(e) => setPayAmountInput(Number(e.target.value))}
                min={1}
                max={activeInvoice.outstandingBalance}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Generates immutable audit reference e.g. <code>DEMO-TXN-2026-XXXX</code>
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPay}
                disabled={payAmountInput <= 0 || isProcessing}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white rounded-xl font-black text-xs shadow-md disabled:opacity-50"
              >
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

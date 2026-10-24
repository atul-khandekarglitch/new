"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Invoice, Order } from "@/types";
import { 
  Download, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  ArrowLeft, 
  AlertTriangle,
  FileText,
  Layers
} from "lucide-react";

export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/invoices/${invoiceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.invoice) {
          setInvoice(data.invoice);
          setOrder(data.order);
        } else {
          setError(data.error || "Invoice not found");
        }
      })
      .catch((err) => setError("Connection error"))
      .finally(() => setIsLoading(false));
  }, [invoiceId]);

  const handlePrintDownload = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Generating verified tax invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-16 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Invoice Not Found</h2>
          <p className="text-xs text-slate-600">{error || "Requested invoice record does not exist."}</p>
          <Link href="/dashboard/buyer" className="inline-block px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-lg">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200 py-4 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link
            href="/dashboard/buyer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-blue"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Buyer Orders</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Download Invoice PDF</span>
            </button>
            <button
              onClick={handlePrintDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        
        {/* Success Alert Banner (print:hidden) */}
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between text-xs print:hidden shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-sm block">Payment Confirmed &amp; Invoice Generated!</span>
              <span className="text-emerald-800">
                Transaction reference: <strong>{invoice.paymentReference}</strong>. Order marked paid and inventory reserved.
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
            PAID IN FULL
          </span>
        </div>

        {/* The Invoice Document */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-xl print:shadow-none print:border-none print:p-0 space-y-8 text-slate-800">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center shadow-md">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-navy-950">
                    INDUSCYCLE
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">
                    Industrial By-Product Exchange Platform
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 max-w-xs">
                Official Secondary Material Exchange Consignment Tax Invoice.
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 inline-block mb-1">
                {invoice.paymentStatus.toUpperCase()}
              </span>
              <div className="text-xl font-black text-slate-900">{invoice.invoiceNumber}</div>
              <div className="text-xs text-slate-500">Invoice Date: <strong>{invoice.invoiceDate}</strong></div>
              <div className="text-xs text-slate-500">Order ID: <strong>{invoice.orderId}</strong></div>
            </div>
          </div>

          {/* Seller & Buyer Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue block">
                Seller (Consignor)
              </span>
              <div className="font-bold text-sm text-slate-900">{invoice.sellerDetails.companyName}</div>
              <div className="text-slate-600">{invoice.sellerDetails.industrialArea || "Industrial Cluster"}</div>
              <div className="text-slate-600">{invoice.sellerDetails.city}, {invoice.sellerDetails.state}, {invoice.sellerDetails.country}</div>
              <div className="text-slate-500 pt-1">Email: {invoice.sellerDetails.email}</div>
              {invoice.sellerDetails.phone && (
                <div className="text-slate-500">Phone: {invoice.sellerDetails.phone}</div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple block">
                Buyer (Consignee)
              </span>
              <div className="font-bold text-sm text-slate-900">{invoice.buyerDetails.companyName}</div>
              <div className="text-slate-700">Attn: {invoice.buyerDetails.fullName}</div>
              <div className="text-slate-600">{invoice.buyerDetails.city}, {invoice.buyerDetails.state}</div>
              <div className="text-slate-500 pt-1">Email: {invoice.buyerDetails.email}</div>
              {invoice.buyerDetails.phone && (
                <div className="text-slate-500">Phone: {invoice.buyerDetails.phone}</div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item &amp; Metallurgical Description</th>
                  <th className="py-3 px-3">Grade</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Unit Rate</th>
                  <th className="py-3 px-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 text-sm">{invoice.materialDetails.materialName}</div>
                    <div className="text-[11px] text-slate-400">Listing ID: {invoice.materialDetails.listingId}</div>
                  </td>
                  <td className="py-4 px-3 font-semibold text-slate-800">{invoice.materialDetails.grade}</td>
                  <td className="py-4 px-3 text-slate-600">{invoice.materialDetails.category}</td>
                  <td className="py-4 px-3 text-right font-bold text-slate-900">
                    {invoice.materialDetails.quantity.toLocaleString()} {invoice.materialDetails.unit}
                  </td>
                  <td className="py-4 px-3 text-right text-slate-700">
                    ₹{invoice.materialDetails.unitPrice}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-slate-900">
                    ₹{invoice.subtotal.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
            <div className="text-xs space-y-1.5 text-slate-500 max-w-sm">
              <span className="font-bold text-slate-700 block">Payment Details</span>
              <div>Method: <strong>{invoice.paymentMethod}</strong></div>
              <div>Payment Reference: <strong className="font-mono text-slate-800">{invoice.paymentReference}</strong></div>
              <div>Status: <strong className="text-emerald-700">Payment Verified on Escrow Settlement</strong></div>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Material Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Transport &amp; Freight:</span>
                <span className="font-semibold text-slate-900">₹{invoice.transportCost.toLocaleString()}</span>
              </div>
              {invoice.processingCost > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Pre-Processing Charges:</span>
                  <span className="font-semibold text-slate-900">₹{invoice.processingCost.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Applicable GST / Taxes (18%):</span>
                <span className="font-semibold text-slate-900">₹{invoice.taxAmount.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline font-black">
                <span className="text-sm text-slate-900">Total Amount Paid:</span>
                <span className="text-xl text-brand-blue">₹{invoice.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Legal & Compliance Notice */}
          <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
            <p>
              This is a computer-generated tax invoice issued through the Induscycle Secondary Material Exchange platform.
            </p>
            <p>
              Governed by Indian Sale of Goods Act, 1930 &amp; Ministry of Steel Circular Economy Policy Guidelines.
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}

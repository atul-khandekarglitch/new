"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { MaterialListing, Order } from "@/types";
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Lock,
  ArrowRight
} from "lucide-react";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.listingId as string;
  const { user, company } = useAuth();

  const [listing, setListing] = useState<MaterialListing | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(100);
  const [distanceKm, setDistanceKm] = useState<number>(250);
  const [includeProcessing, setIncludeProcessing] = useState<boolean>(false);
  const [shippingAddress, setShippingAddress] = useState("Plot 42, Bhosari MIDC, Pune, Maharashtra 411026");

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/listings/${listingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.listing) {
          setListing(data.listing);
          setOrderQuantity(data.listing.minOrderQuantity || 100);
        } else {
          setError(data.error || "Failed to load material details");
        }
      })
      .catch((err) => setError("Connection error"))
      .finally(() => setIsLoading(false));
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Preparing verified checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Checkout Error</h2>
          <p className="text-xs text-slate-600">{error || "Listing not found"}</p>
          <Link href="/marketplace" className="inline-block px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-lg">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Financial calculations
  const unitPrice = listing.pricePerUnit;
  const subtotal = Math.round(orderQuantity * unitPrice);
  const transportFreight = Math.round(distanceKm * 35 + orderQuantity * 1.5);
  const processingCost = includeProcessing ? Math.round(orderQuantity * 6) : 0;
  const taxableAmount = subtotal + transportFreight + processingCost;
  const taxAmount = Math.round(taxableAmount * 0.18);
  const totalAmount = taxableAmount + taxAmount;

  const handleProceedToPayment = async () => {
    setIsProcessingPayment(true);
    setError(null);

    try {
      // Step 1: Create Order on backend
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          quantity: orderQuantity,
          buyerId: user?.id || "user_buyer_rajesh",
          buyerName: user?.name || "Rajesh Sharma",
          buyerCompanyName: company?.name || "Kalyani Industrial Equipment",
          buyerEmail: user?.email || "procurement@kalyaniequip.example.com",
          buyerAddress: shippingAddress,
          distanceKm,
          includeProcessing,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.order) {
        setError(orderData.error || "Failed to initialize order");
        setIsProcessingPayment(false);
        return;
      }

      const createdOrder: Order = orderData.order;

      // Step 2: Server-side payment verification (Section 3: verified backend confirmation)
      const payRes = await fetch(`/api/orders/${createdOrder.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "demo_gateway",
          paymentReference: `PAY-INDUS-${Date.now().toString().slice(-6)}`,
        }),
      });

      const payData = await payRes.json();
      if (payData.success && payData.invoice) {
        // Step 3: Redirect to Invoice Confirmation Page
        router.push(`/invoices/${payData.invoice.id}`);
      } else {
        setError(payData.error || "Payment verification failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred during payment processing.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Breadcrumb */}
        <div>
          <Link
            href={`/listings/${listing.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-blue"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Material Specifications</span>
          </Link>
          <h1 className="text-2xl font-black text-navy-950 mt-2">
            Industrial Procurement Checkout
          </h1>
          <p className="text-xs text-slate-500">
            Review landed order costs, delivery requirements, and proceed to verified payment.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Order Details & Configurations (Col 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Material Card Summary */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                    {listing.materialCategory}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">{listing.title}</h2>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{listing.industrialArea}, {listing.city}, {listing.state}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  MTR Verified
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Order Quantity ({listing.quantityUnit})</span>
                  <span className="text-slate-400">Available Stock: {listing.totalQuantity} {listing.quantityUnit}</span>
                </div>
                <input
                  type="number"
                  min={listing.minOrderQuantity || 1}
                  max={listing.totalQuantity}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, Math.min(listing.totalQuantity, Number(e.target.value))))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-blue font-bold"
                />
              </div>

              {/* Distance Slider */}
              <div className="space-y-1.5 pt-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700">Estimated Delivery Distance:</span>
                  <span className="text-brand-blue">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={1200}
                  step={10}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Processing Option */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeProcessing}
                    onChange={(e) => setIncludeProcessing(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-blue"
                  />
                  <span>Include pre-delivery sorting, degreasing &amp; strapping (+₹6/{listing.quantityUnit})</span>
                </label>
              </div>

              {/* Shipping Address */}
              <div className="pt-3 border-t border-slate-200 space-y-1 text-xs">
                <label className="block font-bold text-slate-700">Delivery Intake Plant Address</label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                ></textarea>
              </div>

            </div>

          </div>

          {/* Payment & Order Review Card (Col 8-12) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
              <h3 className="font-bold text-sm text-navy-950 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span>Final Order Summary</span>
                <span className="text-xs font-mono text-slate-400">INR (₹)</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Material Subtotal ({orderQuantity} {listing.quantityUnit} @ ₹{unitPrice}):</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Freight &amp; Tolls ({distanceKm} km):</span>
                  <span className="font-bold text-slate-900">₹{transportFreight.toLocaleString()}</span>
                </div>
                {includeProcessing && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pre-Processing &amp; Strapping:</span>
                    <span className="font-bold text-slate-900">₹{processingCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Applicable GST / Taxes (18%):</span>
                  <span className="font-bold text-slate-900">₹{taxAmount.toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-extrabold text-navy-950 block">Total Landed Amount</span>
                    <span className="text-[10px] text-slate-400">All freight &amp; taxes included</span>
                  </div>
                  <div className="text-2xl font-black text-brand-blue">
                    ₹{totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Demo Mode Notice Banner (Section 3 Rule) */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <span className="font-bold block mb-0.5">Verified Industrial Escrow (Test Mode)</span>
                This transaction runs on Induscycle&apos;s verified test payment simulator. A legally binding invoice and linked order record will be generated immediately upon completion.
              </div>

              {/* Complete Payment Button */}
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleProceedToPayment}
                className="w-full py-3.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isProcessingPayment ? "Verifying Transaction..." : `Confirm Payment: ₹${totalAmount.toLocaleString()}`}
                </span>
              </button>

              <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Server-side verification • Zero card storage • Instant PDF Invoice</span>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}

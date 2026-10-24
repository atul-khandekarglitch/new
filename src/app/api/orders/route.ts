import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { Order, OrderItem } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    const sellerId = searchParams.get("sellerId");

    let orders = db.orders || [];

    if (buyerId) {
      orders = orders.filter((o) => o.buyerId === buyerId);
    }
    if (sellerId) {
      orders = orders.filter((o) => o.sellerId === sellerId);
    }

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDatabase();
    const body = await req.json();

    const {
      listingId,
      quantity,
      buyerId,
      buyerName,
      buyerCompanyName,
      buyerEmail,
      buyerPhone,
      buyerAddress,
      distanceKm = 250,
      transportMethod = "Road (Covered Truck)",
      includeProcessing = false,
    } = body;

    const listing = db.listings.find((l) => l.id === listingId);
    if (!listing) {
      return NextResponse.json({ success: false, error: "Material listing not found" }, { status: 404 });
    }

    const orderQty = Number(quantity);
    if (!orderQty || orderQty <= 0) {
      return NextResponse.json({ success: false, error: "Invalid order quantity" }, { status: 400 });
    }

    if (orderQty > listing.totalQuantity) {
      return NextResponse.json({ 
        success: false, 
        error: `Requested quantity exceeds available stock (${listing.totalQuantity} ${listing.quantityUnit})` 
      }, { status: 400 });
    }

    // Server-side financial calculations (strictly non-floating point rounding)
    const unitPrice = listing.pricePerUnit;
    const subtotal = Math.round(orderQty * unitPrice);
    
    // Transport freight calculation
    const transportRatePerKm = 35;
    const transportCost = Math.round(distanceKm * transportRatePerKm + orderQty * 1.5);

    // Processing charges
    const processingCost = includeProcessing ? Math.round(orderQty * 6) : 0;

    // 18% GST / applicable taxes
    const taxableAmount = subtotal + transportCost + processingCost;
    const taxAmount = Math.round(taxableAmount * 0.18);
    const totalAmount = taxableAmount + taxAmount;

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const supplierCompany = db.companies.find((c) => c.id === listing.supplierCompanyId);

    const orderItem: OrderItem = {
      id: `item_${Date.now()}`,
      orderId,
      listingId: listing.id,
      materialName: listing.materialName,
      materialCategory: listing.materialCategory,
      grade: listing.grade,
      quantity: orderQty,
      unit: listing.quantityUnit,
      unitPrice,
      lineTotal: subtotal,
    };

    const newOrder: Order = {
      id: orderId,
      buyerId: buyerId || "user_buyer_rajesh",
      buyerName: buyerName || "Rajesh Sharma",
      buyerCompanyName: buyerCompanyName || "Kalyani Industrial Equipment",
      buyerEmail: buyerEmail || "procurement@kalyaniequip.example.com",
      buyerPhone: buyerPhone || "+91 98220 11223",
      buyerAddress: buyerAddress || `${listing.city} Inbound Facility`,
      sellerId: listing.supplierUserId,
      sellerCompanyName: supplierCompany?.name || "Industrial Supplier",
      sellerEmail: supplierCompany?.contactEmail || "sales@supplier.example.com",
      sellerCity: listing.city,
      sellerState: listing.state,
      listingId: listing.id,
      status: "pending_payment",
      subtotal,
      transportCost,
      processingCost,
      taxAmount,
      totalAmount,
      currency: listing.currency || "INR",
      items: [orderItem],
      createdAt: now,
      updatedAt: now,
    };

    if (!db.orders) db.orders = [];
    if (!db.orderItems) db.orderItems = [];

    db.orders.unshift(newOrder);
    db.orderItems.unshift(orderItem);

    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: newOrder.buyerId,
      action: "ORDER_CREATED",
      details: `Created order ${orderId} for ${orderQty} ${listing.quantityUnit} of ${listing.title}`,
      timestamp: now,
    });

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}

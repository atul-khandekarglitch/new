import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const queryId = params.id;

    const invoice = (db.invoices || []).find(
      (i) => i.id === queryId || i.invoiceNumber.toLowerCase() === queryId.toLowerCase() || i.orderId === queryId
    );

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    const order = (db.orders || []).find((o) => o.id === invoice.orderId);

    return NextResponse.json({
      success: true,
      invoice,
      order,
    });
  } catch (error) {
    console.error("GET /api/invoices/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch invoice" }, { status: 500 });
  }
}

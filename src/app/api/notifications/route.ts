import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { 
  getSmtpConfig, 
  verifySmtpConnection, 
  sendNotificationEmail,
  buildInduscycleEmailHtml 
} from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // 1. IN-APP NOTIFICATIONS (When userId is supplied by authenticated user)
    if (userId) {
      const user = db.users.find((u) => u.id === userId);
      const company = db.companies.find((c) => c.id === user?.companyId);

      const userEmail = user?.email?.toLowerCase();
      const companyEmail = company?.contactEmail?.toLowerCase();
      const companyId = company?.id;

      // Authorized user filtering (strictly user's or their company's notifications)
      const userNotifications = (db.notifications || []).filter((n) => {
        if (n.userId && n.userId === userId) return true;
        if (n.metadata?.userId && n.metadata.userId === userId) return true;
        if (userEmail && n.to && n.to.toLowerCase() === userEmail) return true;
        if (companyEmail && n.to && n.to.toLowerCase() === companyEmail) return true;
        if (companyId && n.metadata?.companyId && n.metadata.companyId === companyId) return true;
        return false;
      });

      const formattedNotifications = userNotifications.map((n) => {
        let fallbackTitle = n.subject.split(":")[0].trim();
        let fallbackLink = "/marketplace";
        if (n.eventType.startsWith("order")) fallbackLink = "/payments";
        else if (n.eventType.startsWith("shipment")) {
          fallbackLink = `/tracking${n.metadata?.trackingNumber ? `?tracking=${n.metadata.trackingNumber}` : ""}`;
        } else if (n.eventType.startsWith("invoice")) fallbackLink = "/payments";
        else if (n.eventType.startsWith("disclosure")) fallbackLink = "/marketplace";
        else if (n.eventType === "enquiry_offer") fallbackLink = "/marketplace";
        else if (n.eventType === "user_registration") fallbackLink = "/dashboard/buyer";

        return {
          id: n.id,
          title: n.title || fallbackTitle,
          message: n.message || n.subject,
          eventType: n.eventType,
          referenceId: n.referenceId,
          link: n.link || fallbackLink,
          read: Boolean(n.read),
          createdAt: n.sentAt || new Date().toISOString(),
          metadata: n.metadata,
        };
      });

      const unreadCount = formattedNotifications.filter((i) => !i.read).length;

      return NextResponse.json({
        success: true,
        notifications: formattedNotifications,
        unreadCount,
        totalCount: formattedNotifications.length,
      });
    }

    // 2. DIAGNOSTICS & SYSTEM CONFIG (When no userId query parameter is passed)
    const config = getSmtpConfig();
    const verifyResult = await verifySmtpConnection();

    const notifications = (db.notifications || []).slice(0, 50);

    return NextResponse.json({
      success: true,
      sender: {
        email: config.user,
        host: config.host,
        port: config.port,
        secure: config.secure,
        from: config.from,
        isAppPasswordConfigured: config.hasPassword,
      },
      smtpStatus: verifyResult,
      supportedEvents: [
        {
          event: "user_registration",
          description: "Sent upon new buyer/seller registration or Google OAuth profile synchronization",
          recipient: "New User's Email",
        },
        {
          event: "order_placed",
          description: "Sent upon buyer placing an industrial procurement order",
          recipient: "Buyer & Supplier Emails",
        },
        {
          event: "order_paid",
          description: "Sent upon escrow payment confirmation and tax invoice generation",
          recipient: "Buyer & Supplier Emails",
        },
        {
          event: "shipment_update",
          description: "Sent on 9-stage shipment progression (dispatch, transit, arrival, receipt)",
          recipient: "Buyer & Supplier Plant Managers",
        },
        {
          event: "invoice_approval",
          description: "Sent when finance team approves or releases payment on a supplier invoice",
          recipient: "Supplier Finance Email",
        },
        {
          event: "invoice_rejection",
          description: "Sent when an invoice is rejected with audit reason documented",
          recipient: "Supplier Finance Email",
        },
        {
          event: "invoice_payment",
          description: "Sent when finance releases payment against supplier invoice milestones",
          recipient: "Supplier Finance Email",
        },
        {
          event: "disclosure_request",
          description: "Sent to supplier when buyer submits information or contact reveal request",
          recipient: "Target Supplier Email",
        },
        {
          event: "disclosure_status",
          description: "Sent to buyer when supplier approves or declines material disclosure request",
          recipient: "Requester Buyer Email",
        },
        {
          event: "enquiry_offer",
          description: "Sent to supplier upon receiving price offer, with confirmation copy to buyer",
          recipient: "Supplier & Buyer Emails",
        },
        {
          event: "order_status_update",
          description: "Sent to buyer when supplier accepts or declines an order",
          recipient: "Buyer Email",
        },
      ],
      notificationsCount: (db.notifications || []).length,
      recentNotifications: notifications,
    });
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch notification status" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const action = body.action || "test_email";

    // 1. Mark single notification as read
    if (action === "mark_read") {
      const { notificationId, userId } = body;
      if (!notificationId) {
        return NextResponse.json({ success: false, error: "notificationId is required" }, { status: 400 });
      }

      const notif = (db.notifications || []).find((n) => n.id === notificationId);
      if (!notif) {
        return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 });
      }

      notif.read = true;
      saveDatabase(db);

      let unreadCount = 0;
      if (userId) {
        const user = db.users.find((u) => u.id === userId);
        const company = db.companies.find((c) => c.id === user?.companyId);
        const userEmail = user?.email?.toLowerCase();
        const companyEmail = company?.contactEmail?.toLowerCase();
        const companyId = company?.id;

        const userNotifs = (db.notifications || []).filter((n) => {
          if (n.userId && n.userId === userId) return true;
          if (n.metadata?.userId && n.metadata.userId === userId) return true;
          if (userEmail && n.to && n.to.toLowerCase() === userEmail) return true;
          if (companyEmail && n.to && n.to.toLowerCase() === companyEmail) return true;
          if (companyId && n.metadata?.companyId && n.metadata.companyId === companyId) return true;
          return false;
        });
        unreadCount = userNotifs.filter((n) => !n.read).length;
      }

      return NextResponse.json({
        success: true,
        notificationId,
        read: true,
        unreadCount,
      });
    }

    // 2. Mark all notifications as read for a user
    if (action === "mark_all_read") {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
      }

      const user = db.users.find((u) => u.id === userId);
      const company = db.companies.find((c) => c.id === user?.companyId);
      const userEmail = user?.email?.toLowerCase();
      const companyEmail = company?.contactEmail?.toLowerCase();
      const companyId = company?.id;

      let markedCount = 0;
      (db.notifications || []).forEach((n) => {
        const matchesUser =
          (n.userId && n.userId === userId) ||
          (n.metadata?.userId && n.metadata.userId === userId) ||
          (userEmail && n.to && n.to.toLowerCase() === userEmail) ||
          (companyEmail && n.to && n.to.toLowerCase() === companyEmail) ||
          (companyId && n.metadata?.companyId && n.metadata.companyId === companyId);

        if (matchesUser) {
          n.read = true;
          markedCount++;
        }
      });

      saveDatabase(db);

      return NextResponse.json({
        success: true,
        markedCount,
        unreadCount: 0,
      });
    }

    // 3. Diagnostic Test Email
    const { recipient, eventType = "admin_alert" } = body;
    const targetEmail = recipient || "induscycle@gmail.com";

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient email address" },
        { status: 400 }
      );
    }

    const config = getSmtpConfig();
    const nowIso = new Date().toISOString();

    const html = buildInduscycleEmailHtml({
      title: "Induscycle SMTP Connectivity Test",
      heading: "Automated Notification Channel Verified",
      subheading: `This verification email confirms that the Induscycle email notification subsystem is operational.`,
      badgeText: "System Diagnostic",
      badgeColor: "#10b981",
      rows: [
        { label: "Designated Sender", value: config.user },
        { label: "Target Recipient", value: targetEmail },
        { label: "SMTP Host & Port", value: `${config.host}:${config.port} (SSL: ${config.secure})` },
        { label: "Transmission Time", value: new Date().toLocaleString("en-IN") },
        { label: "App Password Configured", value: config.hasPassword ? "Yes (Active)" : "Pending (.env.local)" },
      ],
      primaryButton: {
        text: "Launch Induscycle Dashboard",
        url: `${config.appUrl}/payments`,
      },
      demoNotice: true,
    });

    const result = await sendNotificationEmail({
      to: targetEmail,
      subject: `[Diagnostic] Induscycle Notification Verification — ${new Date().toLocaleTimeString("en-IN")}`,
      html,
      eventType: eventType,
      idempotencyKey: `diag_test_${Date.now()}_${targetEmail}`,
      referenceId: "diagnostic_test",
      metadata: { initiatedBy: "manual_diagnostic_test", targetEmail },
    });

    return NextResponse.json({
      success: true,
      diagnostic: result,
      smtpConfig: {
        sender: config.user,
        host: config.host,
        port: config.port,
        isAppPasswordConfigured: config.hasPassword,
      },
    });
  } catch (error: any) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process notification request" },
      { status: 500 }
    );
  }
}

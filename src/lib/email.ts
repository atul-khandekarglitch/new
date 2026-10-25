import nodemailer from 'nodemailer';
import { getDatabase, saveDatabase } from './db';
import { 
  EmailNotification, 
  EmailEventType, 
  User, 
  Company, 
  Order, 
  OrderStatus,
  Invoice, 
  Shipment, 
  SupplierInvoice,
  DisclosureRequest,
  EnquiryOffer
} from '@/types';

// SMTP Configuration
export function getSmtpConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || (port === 465 && process.env.SMTP_SECURE !== 'false');
  const user = process.env.SMTP_USER || 'induscycle@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_APP_PASSWORD || '';
  const from = process.env.EMAIL_FROM || `"Induscycle Platform" <${user}>`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
    appUrl,
    hasPassword: Boolean(pass && pass.trim().length > 0),
  };
}

export function getTransporter() {
  const config = getSmtpConfig();
  if (!config.hasPassword) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 8000,
  });
}

// SMTP Connectivity Verifier
export async function verifySmtpConnection(): Promise<{
  configured: boolean;
  verified: boolean;
  message: string;
  details?: Record<string, any>;
}> {
  const config = getSmtpConfig();

  if (!config.hasPassword) {
    return {
      configured: false,
      verified: false,
      message: 'SMTP credentials pending: Google App Password not yet configured in SMTP_PASS.',
      details: {
        host: config.host,
        port: config.port,
        user: config.user,
        senderEmail: config.user,
      },
    };
  }

  try {
    const transporter = getTransporter();
    if (!transporter) {
      return {
        configured: false,
        verified: false,
        message: 'Could not initialize SMTP transport.',
      };
    }

    await transporter.verify();
    return {
      configured: true,
      verified: true,
      message: `SMTP connection successfully verified with Gmail server for ${config.user}.`,
      details: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
      },
    };
  } catch (error: any) {
    return {
      configured: true,
      verified: false,
      message: `SMTP verification failed: ${error?.message || 'Unknown network/authentication error'}`,
      details: {
        code: error?.code,
        response: error?.response,
      },
    };
  }
}

// Branded Induscycle HTML Template Builder
export function buildInduscycleEmailHtml({
  title,
  preheader,
  badgeText,
  badgeColor = '#0265FF', // default brand blue
  heading,
  subheading,
  rows,
  primaryButton,
  demoNotice = true,
}: {
  title: string;
  preheader?: string;
  badgeText?: string;
  badgeColor?: string;
  heading: string;
  subheading?: string;
  rows: { label: string; value: string }[];
  primaryButton?: { text: string; url: string };
  demoNotice?: boolean;
}): string {
  const config = getSmtpConfig();
  const currentYear = new Date().getFullYear();

  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500; width: 38%; vertical-align: top;">
          ${r.label}
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600; vertical-align: top;">
          ${r.value}
        </td>
      </tr>`
    )
    .join('');

  const buttonHtml = primaryButton
    ? `
    <div style="margin: 28px 0 16px; text-align: center;">
      <a href="${primaryButton.url}" target="_blank" style="background: linear-gradient(135deg, #0265FF 0%, #1742a6 100%); color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(2, 101, 255, 0.25);">
        ${primaryButton.text} &rarr;
      </a>
    </div>`
    : '';

  const demoNoticeHtml = demoNotice
    ? `
    <div style="margin-top: 24px; padding: 12px 16px; background-color: #f8fafc; border-left: 4px solid #0265FF; border-radius: 4px; font-size: 12px; color: #475569; line-height: 1.5;">
      <strong>Simulation / Audit Disclosure:</strong> This transaction was processed in verified development mode on the Induscycle industrial platform. No actual bank debit or physical consignment transfer occurred.
    </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b1220; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
    table { border-collapse: collapse; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9;">
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; color: #ffffff;">
    ${preheader || title}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    <!-- HEADER -->
    <tr>
      <td style="background: linear-gradient(135deg, #0b1329 0%, #132448 60%, #1e3a8a 100%); padding: 28px 32px; text-align: left; border-bottom: 3px solid #38bdf8;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="display: inline-block; vertical-align: middle;">
                <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">INDUS<span style="color: #38bdf8;">CYCLE</span></span>
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 2px;">Industrial Material Exchange</div>
              </div>
            </td>
            ${
              badgeText
                ? `<td style="text-align: right; vertical-align: middle;">
                    <span style="background-color: ${badgeColor}; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">
                      ${badgeText}
                    </span>
                  </td>`
                : ''
            }
          </tr>
        </table>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding: 32px 32px 24px;">
        <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.3;">
          ${heading}
        </h1>
        ${
          subheading
            ? `<p style="margin: 0 0 20px; font-size: 14px; color: #64748b; line-height: 1.5;">${subheading}</p>`
            : '<div style="margin-bottom: 20px;"></div>'
        }

        <!-- DETAILS CARD -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 20px;">
          ${rowsHtml}
        </table>

        ${buttonHtml}
        ${demoNoticeHtml}
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background-color: #0b1220; padding: 24px 32px; text-align: center; border-top: 1px solid #1e293b;">
        <p style="margin: 0 0 6px; font-size: 12px; color: #cbd5e1; font-weight: 600;">
          Induscycle By-Product Exchange &bull; Circular Industrial Economy
        </p>
        <p style="margin: 0 0 10px; font-size: 11px; color: #64748b; line-height: 1.5;">
          Official Sender: <a href="mailto:${config.user}" style="color: #38bdf8; text-decoration: none;">${config.user}</a><br/>
          Pune &bull; Bengaluru &bull; Chennai &bull; Faridabad Clusters &bull; Secured with SSL/TLS
        </p>
        <p style="margin: 0; font-size: 10px; color: #475569;">
          &copy; ${currentYear} Induscycle. All rights reserved. Confidential industrial communication.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Helper to derive in-app notification presentation details
export function deriveNotificationDetails(
  eventType: EmailEventType,
  subject: string,
  referenceId?: string,
  metadata?: Record<string, any>
): { title: string; link: string; message: string } {
  let title = subject.split(':')[0].trim();
  let link = '/marketplace';
  let message = subject;

  switch (eventType) {
    case 'order_placed':
      title = metadata?.role === 'seller' ? 'New Surplus Order Received' : 'Commercial Order Placed';
      link = '/payments';
      message = subject;
      break;
    case 'order_paid':
      title = 'Payment Confirmed & Invoice Issued';
      link = '/payments';
      message = subject;
      break;
    case 'order_status_update':
      title = metadata?.newStatus === 'processing' ? 'Order Accepted by Supplier' : 'Order Declined by Supplier';
      link = '/payments';
      message = subject;
      break;
    case 'shipment_update':
      title = `Shipment Milestone: Stage ${metadata?.stage || 1}`;
      link = `/tracking${metadata?.trackingNumber ? `?tracking=${metadata.trackingNumber}` : ''}`;
      message = subject;
      break;
    case 'invoice_approval':
      title = 'Supplier Invoice Approved';
      link = '/payments';
      message = subject;
      break;
    case 'invoice_rejection':
      title = 'Supplier Invoice Declined';
      link = '/payments';
      message = subject;
      break;
    case 'invoice_clarification':
      title = 'Clarification Requested on Invoice';
      link = '/payments';
      message = subject;
      break;
    case 'invoice_payment':
      title = 'Invoice Payment Disbursed';
      link = '/payments';
      message = subject;
      break;
    case 'disclosure_request':
      title = 'Material Information Requested';
      link = '/marketplace';
      message = subject;
      break;
    case 'disclosure_status':
      title = metadata?.status === 'approved' ? 'Disclosure Approved' : 'Disclosure Declined';
      link = '/marketplace';
      message = subject;
      break;
    case 'enquiry_offer':
      title = metadata?.role === 'seller' ? 'New Commercial Price Offer' : 'Offer Dispatched to Supplier';
      link = '/marketplace';
      message = subject;
      break;
    case 'user_registration':
      title = 'Welcome to Induscycle';
      link = '/marketplace';
      message = subject;
      break;
    default:
      title = subject.slice(0, 40);
      link = '/marketplace';
      message = subject;
  }

  return { title, link, message };
}

// Core sendNotification function with Idempotency & Graceful Recovery
export async function sendNotificationEmail({
  to,
  subject,
  html,
  text,
  eventType,
  idempotencyKey,
  referenceId,
  metadata,
  title,
  message,
  link,
  userId,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  eventType: EmailEventType;
  idempotencyKey: string;
  referenceId?: string;
  metadata?: Record<string, any>;
  title?: string;
  message?: string;
  link?: string;
  userId?: string;
}): Promise<{
  success: boolean;
  simulated: boolean;
  status: 'sent' | 'failed' | 'simulated_pending_credentials' | 'skipped_duplicate';
  messageId?: string;
  error?: string;
  reason?: string;
}> {
  const db = getDatabase();
  const config = getSmtpConfig();
  const nowIso = new Date().toISOString();

  if (!db.notifications) {
    db.notifications = [];
  }

  // Idempotency check: prevent duplicate notifications
  const existingNotification = db.notifications.find(
    (n) => n.idempotencyKey === idempotencyKey && (n.status === 'sent' || n.status === 'simulated_pending_credentials')
  );

  if (existingNotification) {
    console.log(`[Induscycle Email Idempotency] Suppressed duplicate notification for key: ${idempotencyKey}`);
    return {
      success: true,
      simulated: existingNotification.status === 'simulated_pending_credentials',
      status: 'skipped_duplicate',
      messageId: existingNotification.messageId,
      reason: `Notification previously processed with status '${existingNotification.status}'`,
    };
  }

  const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const derived = deriveNotificationDetails(eventType, subject, referenceId, metadata);
  const inAppTitle = title || derived.title;
  const inAppMessage = message || derived.message;
  const inAppLink = link || derived.link;
  const inAppUserId = userId || metadata?.userId;

  // CASE 1: Credentials not yet configured (Graceful Simulation Mode)
  if (!config.hasPassword) {
    const simulatedRecord: EmailNotification = {
      id: notificationId,
      idempotencyKey,
      to,
      from: config.user,
      subject,
      title: inAppTitle,
      message: inAppMessage,
      link: inAppLink,
      read: false,
      userId: inAppUserId,
      eventType,
      referenceId,
      status: 'simulated_pending_credentials',
      sentAt: nowIso,
      metadata: {
        ...metadata,
        notice: 'Queued in development mode. Configure SMTP_PASS in .env.local to send live emails via smtp.gmail.com.',
      },
    };

    db.notifications.unshift(simulatedRecord);

    // Audit log
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: metadata?.userId || 'system',
      action: 'EMAIL_QUEUED_SIMULATED',
      details: `[${eventType}] Email to ${to} (${subject}) recorded. Live delivery awaiting Google App Password.`,
      timestamp: nowIso,
    });

    saveDatabase(db);

    console.log(
      `[Induscycle Email] (SIMULATED - Awaiting App Password) Event: ${eventType} | To: ${to} | Subject: "${subject}"`
    );

    return {
      success: true,
      simulated: true,
      status: 'simulated_pending_credentials',
      messageId: `sim_${notificationId}`,
      reason: 'Notification recorded. Set SMTP_PASS in .env.local to deliver live via Gmail SMTP.',
    };
  }

  // CASE 2: Live SMTP Transmission
  try {
    const transporter = getTransporter();
    if (!transporter) {
      throw new Error('Transporter initialization failed.');
    }

    const mailOptions = {
      from: config.from,
      to,
      subject,
      html,
      text: text || subject,
    };

    const info = await transporter.sendMail(mailOptions);

    const sentRecord: EmailNotification = {
      id: notificationId,
      idempotencyKey,
      to,
      from: config.user,
      subject,
      title: inAppTitle,
      message: inAppMessage,
      link: inAppLink,
      read: false,
      userId: inAppUserId,
      eventType,
      referenceId,
      status: 'sent',
      messageId: info.messageId,
      sentAt: nowIso,
      metadata,
    };

    db.notifications.unshift(sentRecord);

    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: metadata?.userId || 'system',
      action: 'EMAIL_SENT',
      details: `[${eventType}] Email successfully delivered to ${to}. MessageId: ${info.messageId}`,
      timestamp: nowIso,
    });

    saveDatabase(db);

    console.log(`[Induscycle Email] (SENT LIVE) Event: ${eventType} | To: ${to} | MessageId: ${info.messageId}`);

    return {
      success: true,
      simulated: false,
      status: 'sent',
      messageId: info.messageId,
    };
  } catch (err: any) {
    const failedRecord: EmailNotification = {
      id: notificationId,
      idempotencyKey,
      to,
      from: config.user,
      subject,
      title: inAppTitle,
      message: inAppMessage,
      link: inAppLink,
      read: false,
      userId: inAppUserId,
      eventType,
      referenceId,
      status: 'failed',
      error: err?.message || 'SMTP delivery failure',
      sentAt: nowIso,
      metadata,
    };

    db.notifications.unshift(failedRecord);

    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      userId: metadata?.userId || 'system',
      action: 'EMAIL_DELIVERY_FAILED',
      details: `[${eventType}] Failed delivery to ${to}: ${err?.message}`,
      timestamp: nowIso,
    });

    saveDatabase(db);

    console.warn(`[Induscycle Email Warning] Delivery failed to ${to}:`, err?.message);

    // Note: We return success: false for the email record, but DO NOT throw,
    // protecting the calling transaction from failing.
    return {
      success: false,
      simulated: false,
      status: 'failed',
      error: err?.message || 'SMTP transmission error',
    };
  }
}

// ----------------------------------------------------------------------
// WORKFLOW-SPECIFIC EMAIL HELPERS
// ----------------------------------------------------------------------

// 1. User Registration / Account Confirmation
export async function notifyUserRegistration(user: User, company?: Company) {
  const config = getSmtpConfig();
  const roleDisplay = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  const html = buildInduscycleEmailHtml({
    title: 'Welcome to Induscycle Industrial Material Exchange',
    heading: `Welcome to Induscycle, ${user.name}!`,
    subheading: `Your industrial account has been successfully initialized for ${company?.name || 'your enterprise'}.`,
    badgeText: 'Account Active',
    badgeColor: '#10b981',
    rows: [
      { label: 'Authorized Name', value: user.name },
      { label: 'Registered Email', value: user.email },
      { label: 'Industrial Role', value: `${roleDisplay} Account` },
      { label: 'Company / Organization', value: company?.name || 'Declared Entity' },
      { label: 'Cluster / Location', value: `${company?.city || 'Pune'}, ${company?.state || 'Maharashtra'}` },
      { label: 'Registration Date', value: new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' }) },
    ],
    primaryButton: {
      text: 'Access Your Industrial Portal',
      url: `${config.appUrl}/marketplace`,
    },
    demoNotice: false,
  });

  return sendNotificationEmail({
    to: user.email,
    subject: `Welcome to Induscycle — ${company?.name || user.name}`,
    html,
    eventType: 'user_registration',
    idempotencyKey: `reg_${user.id}_${user.email}`,
    referenceId: user.id,
    metadata: { userId: user.id, companyId: user.companyId, role: user.role },
  });
}

// 2. Order Placed Notifications (Buyer & Supplier)
export async function notifyOrderPlaced(order: Order, listingTitle?: string) {
  const config = getSmtpConfig();
  const formattedTotal = `₹${order.totalAmount.toLocaleString('en-IN')}`;
  const firstItem = order.items[0];
  const itemDesc = firstItem ? `${firstItem.quantity} ${firstItem.unit} of ${firstItem.materialName}` : 'Material Consignment';

  // Buyer Email
  const buyerHtml = buildInduscycleEmailHtml({
    title: `Order Confirmation — ${order.id}`,
    heading: 'Your Commercial Procurement Order Has Been Placed',
    subheading: `Order ${order.id} has been recorded on the Induscycle exchange. Awaiting supplier payment & dispatch release.`,
    badgeText: 'Order Placed',
    badgeColor: '#0265FF',
    rows: [
      { label: 'Order Reference', value: order.id },
      { label: 'Material', value: listingTitle || firstItem?.materialName || 'Industrial Consignment' },
      { label: 'Quantity', value: `${firstItem?.quantity || 0} ${firstItem?.unit || 'units'}` },
      { label: 'Supplier Enterprise', value: order.sellerCompanyName },
      { label: 'Dispatch Location', value: `${order.sellerCity}, ${order.sellerState}` },
      { label: 'Total Payable Amount', value: formattedTotal },
      { label: 'Order Date', value: new Date(order.createdAt).toLocaleString('en-IN') },
    ],
    primaryButton: {
      text: 'View Order & Complete Escrow',
      url: `${config.appUrl}/marketplace`,
    },
    demoNotice: true,
  });

  await sendNotificationEmail({
    to: order.buyerEmail,
    subject: `Order Placed: ${order.id} — ${itemDesc}`,
    html: buyerHtml,
    eventType: 'order_placed',
    idempotencyKey: `order_placed_buyer_${order.id}`,
    referenceId: order.id,
    metadata: { orderId: order.id, role: 'buyer', totalAmount: order.totalAmount },
  });

  // Supplier Email
  const supplierHtml = buildInduscycleEmailHtml({
    title: `New Order Received — ${order.id}`,
    heading: 'New Industrial Procurement Order Received',
    subheading: `Buyer ${order.buyerCompanyName} has initialized order ${order.id} for your surplus material.`,
    badgeText: 'Action Required',
    badgeColor: '#f59e0b',
    rows: [
      { label: 'Order Reference', value: order.id },
      { label: 'Procuring Entity', value: `${order.buyerCompanyName} (${order.buyerName})` },
      { label: 'Material Demanded', value: listingTitle || firstItem?.materialName || 'Industrial Surplus' },
      { label: 'Quantity Ordered', value: `${firstItem?.quantity || 0} ${firstItem?.unit || 'units'}` },
      { label: 'Destination Facility', value: order.buyerAddress || 'Inbound Facility' },
      { label: 'Contract Value', value: formattedTotal },
    ],
    primaryButton: {
      text: 'Review Order in Supplier Dashboard',
      url: `${config.appUrl}/payments`,
    },
    demoNotice: true,
  });

  return sendNotificationEmail({
    to: order.sellerEmail,
    subject: `New Surplus Material Order: ${order.id} from ${order.buyerCompanyName}`,
    html: supplierHtml,
    eventType: 'order_placed',
    idempotencyKey: `order_placed_seller_${order.id}`,
    referenceId: order.id,
    metadata: { orderId: order.id, role: 'seller', totalAmount: order.totalAmount },
  });
}

// 3. Order Payment Confirmed & Invoice Generated
export async function notifyOrderPaid(order: Order, invoice: Invoice) {
  const config = getSmtpConfig();
  const formattedTotal = `₹${order.totalAmount.toLocaleString('en-IN')}`;

  const html = buildInduscycleEmailHtml({
    title: `Payment Confirmed & Invoice ${invoice.invoiceNumber}`,
    heading: 'Payment Confirmed & Official Invoice Generated',
    subheading: `Payment for Order ${order.id} is verified. Official commercial invoice ${invoice.invoiceNumber} is now issued.`,
    badgeText: 'Payment Confirmed',
    badgeColor: '#10b981',
    rows: [
      { label: 'Invoice Number', value: invoice.invoiceNumber },
      { label: 'Order Reference', value: order.id },
      { label: 'Payment Reference', value: invoice.paymentReference || 'ESCROW-PAID' },
      { label: 'Total Amount Cleared', value: formattedTotal },
      { label: 'Supplier Entity', value: invoice.sellerDetails.companyName },
      { label: 'Buyer Entity', value: invoice.buyerDetails.companyName },
      { label: 'Invoice Date', value: invoice.invoiceDate },
    ],
    primaryButton: {
      text: 'View Official Tax Invoice',
      url: `${config.appUrl}/payments`,
    },
    demoNotice: true,
  });

  // Notify Buyer
  await sendNotificationEmail({
    to: order.buyerEmail,
    subject: `Payment Confirmed: Tax Invoice ${invoice.invoiceNumber} (${order.id})`,
    html,
    eventType: 'order_paid',
    idempotencyKey: `order_paid_buyer_${order.id}_${invoice.invoiceNumber}`,
    referenceId: order.id,
    metadata: { orderId: order.id, invoiceNumber: invoice.invoiceNumber, amount: order.totalAmount },
  });

  // Notify Seller
  return sendNotificationEmail({
    to: order.sellerEmail,
    subject: `Payment Verified: Invoice ${invoice.invoiceNumber} for Order ${order.id}`,
    html,
    eventType: 'order_paid',
    idempotencyKey: `order_paid_seller_${order.id}_${invoice.invoiceNumber}`,
    referenceId: order.id,
    metadata: { orderId: order.id, invoiceNumber: invoice.invoiceNumber, amount: order.totalAmount },
  });
}

// 4. Shipment Progression & Custody Updates
export async function notifyShipmentProgression(
  shipment: Shipment,
  stageEvent: { stage: number; stageName: string; location?: string }
) {
  const config = getSmtpConfig();
  const db = getDatabase();

  const buyerComp = db.companies.find((c) => c.id === shipment.buyerCompanyId);
  const supplierComp = db.companies.find((c) => c.id === shipment.supplierCompanyId);

  const buyerEmail = buyerComp?.contactEmail || 'buyer@example.com';
  const supplierEmail = supplierComp?.contactEmail || 'supplier@example.com';

  const badgeColor = stageEvent.stage >= 7 ? '#10b981' : stageEvent.stage >= 4 ? '#0265FF' : '#f59e0b';

  const html = buildInduscycleEmailHtml({
    title: `Shipment Tracking Update — ${shipment.trackingNumber}`,
    heading: `Shipment Update: Stage ${stageEvent.stage} / 9 — ${stageEvent.stageName}`,
    subheading: `Consignment ${shipment.trackingNumber} has progressed on the Induscycle industrial route.`,
    badgeText: stageEvent.stageName,
    badgeColor,
    rows: [
      { label: 'Tracking Number', value: shipment.trackingNumber },
      { label: 'Consignment Title', value: shipment.listingTitle },
      { label: 'Carrier Partner', value: shipment.carrierName || 'Indus Logistics Carrier' },
      { label: 'Assigned Vehicle', value: shipment.vehicleNumber || 'Assigned Logistics Fleet' },
      { label: 'Origin Plant', value: shipment.origin },
      { label: 'Destination Facility', value: shipment.destination },
      { label: 'Current Waypoint', value: stageEvent.location || 'Industrial Corridor' },
      { label: 'Audit Timestamp', value: new Date().toLocaleString('en-IN') },
    ],
    primaryButton: {
      text: 'Track Live GPS Route',
      url: `${config.appUrl}/tracking?tracking=${shipment.trackingNumber}`,
    },
    demoNotice: true,
  });

  // Send to Buyer
  await sendNotificationEmail({
    to: buyerEmail,
    subject: `Tracking ${shipment.trackingNumber}: Stage ${stageEvent.stage} — ${stageEvent.stageName}`,
    html,
    eventType: 'shipment_update',
    idempotencyKey: `shipment_buyer_${shipment.id}_stage_${stageEvent.stage}`,
    referenceId: shipment.id,
    metadata: { shipmentId: shipment.id, trackingNumber: shipment.trackingNumber, stage: stageEvent.stage },
  });

  // Send to Supplier
  return sendNotificationEmail({
    to: supplierEmail,
    subject: `Consignment Progress: ${shipment.trackingNumber} is now ${stageEvent.stageName}`,
    html,
    eventType: 'shipment_update',
    idempotencyKey: `shipment_supplier_${shipment.id}_stage_${stageEvent.stage}`,
    referenceId: shipment.id,
    metadata: { shipmentId: shipment.id, trackingNumber: shipment.trackingNumber, stage: stageEvent.stage },
  });
}

// 5. Supplier Invoice Actions (Approval, Rejection, Payment, Clarification)
export async function notifySupplierInvoiceAction(
  invoice: SupplierInvoice,
  action: 'approved' | 'rejected' | 'clarification' | 'pay',
  details?: { reason?: string; query?: string; amount?: number; txnRef?: string }
) {
  const config = getSmtpConfig();
  const db = getDatabase();

  const supplier = db.users.find((u) => u.id === invoice.supplierId) || { email: 'materials@precisionforge.example.com' };
  const recipientEmail = supplier.email;

  let heading = '';
  let badgeText = '';
  let badgeColor = '#0265FF';
  let eventType: EmailEventType = 'invoice_approval';

  if (action === 'approved') {
    heading = `Supplier Invoice ${invoice.invoiceNumber} Has Been Approved`;
    badgeText = 'Approved for Payment';
    badgeColor = '#10b981';
    eventType = 'invoice_approval';
  } else if (action === 'rejected') {
    heading = `Supplier Invoice ${invoice.invoiceNumber} Was Rejected`;
    badgeText = 'Invoice Rejected';
    badgeColor = '#ef4444';
    eventType = 'invoice_rejection';
  } else if (action === 'clarification') {
    heading = `Clarification Requested for Invoice ${invoice.invoiceNumber}`;
    badgeText = 'Action Required';
    badgeColor = '#f59e0b';
    eventType = 'invoice_clarification';
  } else if (action === 'pay') {
    heading = `Payment Released for Supplier Invoice ${invoice.invoiceNumber}`;
    badgeText = 'Payment Disbursed';
    badgeColor = '#10b981';
    eventType = 'invoice_payment';
  }

  const rows = [
    { label: 'Invoice Number', value: invoice.invoiceNumber },
    { label: 'Purchase Order', value: invoice.poNumber },
    { label: 'Supplier Entity', value: invoice.supplierName },
    { label: 'Buyer Enterprise', value: invoice.buyerCompanyName },
    { label: 'Invoice Total', value: `₹${invoice.invoiceAmount.toLocaleString('en-IN')}` },
    { label: 'Outstanding Balance', value: `₹${invoice.outstandingBalance.toLocaleString('en-IN')}` },
  ];

  if (action === 'rejected' && details?.reason) {
    rows.push({ label: 'Rejection Reason', value: details.reason });
  } else if (action === 'clarification' && details?.query) {
    rows.push({ label: 'Clarification Note', value: details.query });
  } else if (action === 'pay' && details?.amount) {
    rows.push({ label: 'Disbursed Amount', value: `₹${details.amount.toLocaleString('en-IN')}` });
    if (details.txnRef) rows.push({ label: 'Transaction Audit Ref', value: details.txnRef });
  }

  const html = buildInduscycleEmailHtml({
    title: `${badgeText} — ${invoice.invoiceNumber}`,
    heading,
    subheading: `Official procurement update from ${invoice.buyerCompanyName} on Induscycle.`,
    badgeText,
    badgeColor,
    rows,
    primaryButton: {
      text: 'Open Supplier Invoice Dashboard',
      url: `${config.appUrl}/payments`,
    },
    demoNotice: true,
  });

  return sendNotificationEmail({
    to: recipientEmail,
    subject: `Update on Invoice ${invoice.invoiceNumber}: ${badgeText}`,
    html,
    eventType,
    idempotencyKey: `invoice_${invoice.id}_${action}_${Date.now()}`,
    referenceId: invoice.id,
    metadata: { invoiceId: invoice.id, action, amount: details?.amount, txnRef: details?.txnRef },
  });
}

// 6. Material Disclosure Request Created (To Target Supplier)
export async function notifyDisclosureRequestCreated(request: DisclosureRequest) {
  const config = getSmtpConfig();
  const db = getDatabase();

  const targetComp = db.companies.find((c) => c.id === request.targetCompanyId);
  const recipientEmail = targetComp?.contactEmail || 'surplus@apexaero.example.com';

  const typeDisplay = request.requestType === 'contact_info' 
    ? 'Direct Contact & Reveal Information' 
    : 'Certified Composition / Spec Sheet Access';

  const html = buildInduscycleEmailHtml({
    title: `Information Request for ${request.listingTitle}`,
    heading: 'New Material Exchange Information Request Received',
    subheading: `${request.requesterCompanyName} has submitted an information disclosure request on Induscycle.`,
    badgeText: 'Disclosure Request',
    badgeColor: '#0265FF',
    rows: [
      { label: 'Request Type', value: typeDisplay },
      { label: 'Procuring Enterprise', value: request.requesterCompanyName },
      { label: 'Material Listing', value: request.listingTitle },
      { label: 'Commercial Justification', value: request.justification || 'Commercial procurement inquiry.' },
      { label: 'Request Timestamp', value: new Date(request.createdAt).toLocaleString('en-IN') },
    ],
    primaryButton: {
      text: 'Review & Manage Disclosures',
      url: `${config.appUrl}/marketplace`,
    },
    demoNotice: true,
  });

  return sendNotificationEmail({
    to: recipientEmail,
    subject: `Material Exchange Request: ${typeDisplay} — ${request.listingTitle}`,
    html,
    eventType: 'disclosure_request',
    idempotencyKey: `disc_req_created_${request.id}`,
    referenceId: request.id,
    metadata: { requestId: request.id, requesterCompanyId: request.requesterCompanyId, listingId: request.listingId },
  });
}

// 7. Material Disclosure Request Status Changed (Approved / Rejected to Requester)
export async function notifyDisclosureRequestStatusChanged(request: DisclosureRequest, newStatus: string) {
  const config = getSmtpConfig();
  const db = getDatabase();

  const requesterComp = db.companies.find((c) => c.id === request.requesterCompanyId);
  const recipientEmail = requesterComp?.contactEmail || 'procurement@kalyaniequip.example.com';

  const isApproved = newStatus === 'approved';
  const badgeText = isApproved ? 'Disclosure Approved' : 'Disclosure Declined';
  const badgeColor = isApproved ? '#10b981' : '#ef4444';

  const html = buildInduscycleEmailHtml({
    title: `Disclosure ${isApproved ? 'Approved' : 'Declined'} — ${request.listingTitle}`,
    heading: isApproved
      ? `Material Information Disclosure Request Approved`
      : `Material Information Disclosure Request Declined`,
    subheading: `Supplier ${request.targetCompanyName} has ${isApproved ? 'granted access to' : 'declined'} requested information.`,
    badgeText,
    badgeColor,
    rows: [
      { label: 'Material Listing', value: request.listingTitle },
      { label: 'Supplier Enterprise', value: request.targetCompanyName },
      { label: 'Requested Detail', value: request.requestType === 'contact_info' ? 'Supplier Direct Contact' : 'Technical Document' },
      { label: 'Decision Status', value: isApproved ? 'Authorized (Unlocked in Portal)' : 'Declined by Supplier' },
      { label: 'Decision Date', value: new Date().toLocaleString('en-IN') },
    ],
    primaryButton: {
      text: 'View Material Listing in Portal',
      url: `${config.appUrl}/marketplace/${request.listingId}`,
    },
    demoNotice: true,
  });

  return sendNotificationEmail({
    to: recipientEmail,
    subject: `Disclosure Request ${isApproved ? 'Approved' : 'Declined'}: ${request.listingTitle}`,
    html,
    eventType: 'disclosure_status',
    idempotencyKey: `disc_status_${request.id}_${newStatus}`,
    referenceId: request.id,
    metadata: { requestId: request.id, status: newStatus },
  });
}

// 8. Commercial Enquiry / Material Offer Created
export async function notifyEnquiryOfferCreated(enquiry: EnquiryOffer) {
  const config = getSmtpConfig();
  const db = getDatabase();

  const sellerComp = db.companies.find((c) => c.id === enquiry.sellerCompanyId);
  const buyerComp = db.companies.find((c) => c.id === enquiry.buyerCompanyId);

  const sellerEmail = sellerComp?.contactEmail || 'surplus@apexaero.example.com';
  const buyerEmail = buyerComp?.contactEmail || 'procurement@kalyaniequip.example.com';

  const totalValue = enquiry.offeredPrice * enquiry.quantity;
  const formattedOffer = `₹${enquiry.offeredPrice.toLocaleString('en-IN')}`;
  const formattedTotal = `₹${totalValue.toLocaleString('en-IN')}`;

  // Notify Supplier (Seller)
  const sellerHtml = buildInduscycleEmailHtml({
    title: `New Commercial Offer: ${enquiry.listingTitle}`,
    heading: 'New Material Exchange Offer Received',
    subheading: `${enquiry.buyerCompanyName} has submitted a commercial offer for ${enquiry.listingTitle}.`,
    badgeText: 'Offer Received',
    badgeColor: '#f59e0b',
    rows: [
      { label: 'Material Demanded', value: enquiry.listingTitle },
      { label: 'Buyer Enterprise', value: enquiry.buyerCompanyName },
      { label: 'Offered Unit Price', value: formattedOffer },
      { label: 'Quantity Demanded', value: `${enquiry.quantity} units` },
      { label: 'Total Valuation', value: formattedTotal },
      { label: 'Buyer Note', value: enquiry.message || 'Commercial offer submitted via exchange.' },
    ],
    primaryButton: {
      text: 'Review Offer in Supplier Portal',
      url: `${config.appUrl}/marketplace`,
    },
    demoNotice: true,
  });

  await sendNotificationEmail({
    to: sellerEmail,
    subject: `Commercial Offer: ${formattedOffer}/unit for ${enquiry.listingTitle}`,
    html: sellerHtml,
    eventType: 'enquiry_offer',
    idempotencyKey: `enq_seller_${enquiry.id}`,
    referenceId: enquiry.id,
    metadata: { enquiryId: enquiry.id, role: 'seller', totalValue },
  });

  // Confirmation to Buyer
  const buyerHtml = buildInduscycleEmailHtml({
    title: `Offer Transmitted — ${enquiry.listingTitle}`,
    heading: 'Your Commercial Material Offer Was Transmitted',
    subheading: `Your commercial offer for ${enquiry.listingTitle} has been delivered to ${enquiry.sellerCompanyName}.`,
    badgeText: 'Offer Dispatched',
    badgeColor: '#0265FF',
    rows: [
      { label: 'Target Material', value: enquiry.listingTitle },
      { label: 'Supplier Enterprise', value: enquiry.sellerCompanyName },
      { label: 'Your Offered Price', value: formattedOffer },
      { label: 'Quantity', value: `${enquiry.quantity} units` },
      { label: 'Expected Total', value: formattedTotal },
    ],
    primaryButton: {
      text: 'View Your Inquiries',
      url: `${config.appUrl}/marketplace`,
    },
    demoNotice: true,
  });

  return sendNotificationEmail({
    to: buyerEmail,
    subject: `Offer Confirmation: ${enquiry.listingTitle}`,
    html: buyerHtml,
    eventType: 'enquiry_offer',
    idempotencyKey: `enq_buyer_${enquiry.id}`,
    referenceId: enquiry.id,
    metadata: { enquiryId: enquiry.id, role: 'buyer', totalValue },
  });
}

// 9. Order Status Changed (Accepted / Cancelled / Rejected to Buyer)
export async function notifyOrderStatusChanged(order: Order, newStatus: OrderStatus, reason?: string) {
  const config = getSmtpConfig();
  const isAccepted = newStatus === 'processing';
  const badgeText = isAccepted ? 'Order Accepted' : 'Order Declined';
  const badgeColor = isAccepted ? '#10b981' : '#ef4444';

  const html = buildInduscycleEmailHtml({
    title: `Order ${order.id} ${isAccepted ? 'Accepted' : 'Declined'}`,
    heading: isAccepted ? 'Your Order Has Been Accepted by the Supplier' : 'Your Order Was Declined by the Supplier',
    subheading: isAccepted
      ? `Supplier ${order.sellerCompanyName} has verified availability and scheduled fulfillment.`
      : `Supplier ${order.sellerCompanyName} is unable to fulfill order ${order.id}.`,
    badgeText,
    badgeColor,
    rows: [
      { label: 'Order Reference', value: order.id },
      { label: 'Material', value: order.items[0]?.materialName || 'Industrial Surplus' },
      { label: 'Supplier Enterprise', value: order.sellerCompanyName },
      { label: 'Contract Total', value: `₹${order.totalAmount.toLocaleString('en-IN')}` },
      { label: 'Status Update', value: isAccepted ? 'Accepted (Preparing Dispatch)' : 'Cancelled' },
      { label: 'Audit Details', value: reason || (isAccepted ? 'Confirmed in supplier inventory schedule.' : 'Order rejected by supplier.') },
    ],
    primaryButton: {
      text: 'View Order Details',
      url: `${config.appUrl}/marketplace`,
    },
    demoNotice: true,
  });

  return sendNotificationEmail({
    to: order.buyerEmail,
    subject: `Order Update: ${order.id} ${isAccepted ? 'Accepted' : 'Declined'} by ${order.sellerCompanyName}`,
    html,
    eventType: 'order_status_update',
    idempotencyKey: `order_status_${order.id}_${newStatus}`,
    referenceId: order.id,
    metadata: { orderId: order.id, newStatus, reason },
  });
}

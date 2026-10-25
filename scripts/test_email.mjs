import assert from 'assert';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runEmailTests() {
  console.log('=== INDUSCYCLE AUTOMATIC EMAIL NOTIFICATION TEST SUITE ===\n');
  let passed = 0;
  let total = 0;

  function test(desc, fn) {
    total++;
    try {
      fn();
      console.log(`[PASS] ${desc}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] ${desc}:`, e.message);
    }
  }

  async function testAsync(desc, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${desc}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] ${desc}:`, e.message);
    }
  }

  // 1. Diagnostics & API Endpoint Checks
  console.log('--- 1. Testing Notification Status & Diagnostics API ---');
  await testAsync('GET /api/notifications returns 200 with designated sender and events', async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`);
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.sender.email, 'induscycle@gmail.com');
    assert.strictEqual(data.sender.host, 'smtp.gmail.com');
    assert.strictEqual(data.sender.port, 465);
    assert.ok(Array.isArray(data.supportedEvents) && data.supportedEvents.length >= 8);
  });

  await testAsync('POST /api/notifications validates invalid recipient address', async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: 'not-an-email' }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('Invalid recipient'));
  });

  await testAsync('POST /api/notifications executes diagnostic test email without crashing', async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: 'induscycle@gmail.com',
        eventType: 'admin_alert',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.diagnostic);
    assert.strictEqual(data.diagnostic.success, true);
    assert.ok(['sent', 'simulated_pending_credentials'].includes(data.diagnostic.status));
  });

  // 2. Registration Workflow Notification
  console.log('\n--- 2. Testing Registration Workflow Notification ---');
  let testUserId = '';
  const testUserEmail = `eng_buyer_${Date.now()}@tatamotors.example.com`;

  await testAsync('User registration automatically triggers welcome notification', async () => {
    const res = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        fullName: 'Vikramaditya Rao',
        companyName: 'Tata Precision Auto Works',
        businessEmail: testUserEmail,
        phoneNumber: '+91 98230 44556',
        role: 'buyer',
        industry: 'Automotive Powertrain',
        city: 'Pune',
        state: 'Maharashtra',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    testUserId = data.user.id;

    // Verify in notifications history
    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();
    const welcomeNotif = notifData.recentNotifications.find(
      (n) => n.to === testUserEmail && n.eventType === 'user_registration'
    );
    assert.ok(welcomeNotif, `Welcome notification record expected for ${testUserEmail}`);
    assert.strictEqual(welcomeNotif.from, 'induscycle@gmail.com');
  });

  // 3. Order Placement Workflow Notifications
  console.log('\n--- 3. Testing Order Placement Workflow Notifications ---');
  let testOrderId = '';

  await testAsync('Order placement sends notifications to both Buyer and Seller', async () => {
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: 'lst_forge_flash_003',
        quantity: 500,
        buyerId: testUserId || 'user_buyer_rajesh',
        buyerName: 'Vikramaditya Rao',
        buyerCompanyName: 'Tata Precision Auto Works',
        buyerEmail: testUserEmail,
        buyerPhone: '+91 98230 44556',
        buyerAddress: 'Chakan MIDC Phase 2, Pune',
      }),
    });
    assert.strictEqual(orderRes.status, 200);
    const orderData = await orderRes.json();
    assert.strictEqual(orderData.success, true);
    testOrderId = orderData.order.id;

    // Check notifications for buyer and seller
    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();

    const buyerNotif = notifData.recentNotifications.find(
      (n) => n.referenceId === testOrderId && n.to === testUserEmail && n.eventType === 'order_placed'
    );
    assert.ok(buyerNotif, 'Order placed notification to Buyer recorded');

    const sellerNotif = notifData.recentNotifications.find(
      (n) => n.referenceId === testOrderId && n.eventType === 'order_placed' && n.to !== testUserEmail
    );
    assert.ok(sellerNotif, 'Order placed notification to Supplier recorded');
  });

  // 4. Order Payment & Official Invoice Notification
  console.log('\n--- 4. Testing Order Payment & Tax Invoice Notifications ---');
  await testAsync('Order escrow payment triggers Tax Invoice notifications with idempotency', async () => {
    assert.ok(testOrderId, 'Test order ID required');
    const payRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'demo_gateway',
        paymentReference: `TEST-PAY-${Date.now()}`,
      }),
    });
    assert.strictEqual(payRes.status, 200);
    const payData = await payRes.json();
    assert.strictEqual(payData.success, true);
    assert.ok(payData.invoice);
    assert.ok(payData.invoice.invoiceNumber.startsWith('INV-2026-'));

    // Verify invoice notification recorded
    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();
    const invoiceNotif = notifData.recentNotifications.find(
      (n) => n.referenceId === testOrderId && n.eventType === 'order_paid'
    );
    assert.ok(invoiceNotif, 'Tax Invoice notification recorded for order');
    assert.ok(invoiceNotif.subject.includes(payData.invoice.invoiceNumber));

    // Test Idempotency: Duplicate payment attempt on already-paid order returns without duplicate emails
    const countBefore = notifData.recentNotifications.filter(
      (n) => n.referenceId === testOrderId && n.eventType === 'order_paid'
    ).length;

    const dupPayRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'demo_gateway' }),
    });
    assert.strictEqual(dupPayRes.status, 200);

    const notifResAfter = await fetch(`${BASE_URL}/api/notifications`);
    const notifDataAfter = await notifResAfter.json();
    const countAfter = notifDataAfter.recentNotifications.filter(
      (n) => n.referenceId === testOrderId && n.eventType === 'order_paid'
    ).length;

    assert.strictEqual(countAfter, countBefore, 'Idempotency prevented duplicate invoice emails');
  });

  // 5. Shipment Progression & Custody Transfer Notifications
  console.log('\n--- 5. Testing Shipment Progression Notifications ---');
  let testTrackingNum = '';

  await testAsync('Shipment initialization triggers dispatch manifest notification', async () => {
    const shipRes = await fetch(`${BASE_URL}/api/shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Peenya Industrial Area, Bengaluru',
        destination: 'Chakan Zone, Pune',
        carrierName: 'Indus Freight Express',
        vehicleNumber: 'MH-14-AZ-4412',
      }),
    });
    assert.strictEqual(shipRes.status, 200);
    const shipData = await shipRes.json();
    assert.strictEqual(shipData.success, true);
    testTrackingNum = shipData.shipment.trackingNumber;

    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();
    const shipNotif = notifData.recentNotifications.find(
      (n) => n.referenceId === shipData.shipment.id && n.eventType === 'shipment_update'
    );
    assert.ok(shipNotif, 'Shipment manifest dispatch notification recorded');
    assert.ok(shipNotif.subject.includes(testTrackingNum));
  });

  await testAsync('Shipment step_forward triggers transit milestone notification', async () => {
    assert.ok(testTrackingNum, 'Tracking number required');
    const stepRes = await fetch(`${BASE_URL}/api/shipments/${testTrackingNum}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'step_forward' }),
    });
    assert.strictEqual(stepRes.status, 200);
    const stepData = await stepRes.json();
    assert.strictEqual(stepData.success, true);
    assert.strictEqual(stepData.shipment.currentStage, 2);

    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();
    const stage2Notif = notifData.recentNotifications.find(
      (n) => n.referenceId === stepData.shipment.id && n.metadata?.stage === 2
    );
    assert.ok(stage2Notif, 'Shipment Stage 2 milestone notification recorded');
  });

  // 6. Supplier Invoice Management Actions
  console.log('\n--- 6. Testing Supplier Invoice Management Action Notifications ---');
  await testAsync('Invoice approval action triggers financial notification to supplier', async () => {
    const approveRes = await fetch(`${BASE_URL}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve',
        invoiceId: 'sinv_scenario_b_apex',
        processedBy: 'Rajesh Sharma (Finance Controller)',
      }),
    });
    assert.strictEqual(approveRes.status, 200);

    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();
    const approveNotif = notifData.recentNotifications.find(
      (n) => n.referenceId === 'sinv_scenario_b_apex' && n.eventType === 'invoice_approval'
    );
    assert.ok(approveNotif, 'Supplier invoice approval notification recorded');
    assert.ok(approveNotif.subject.includes('Approved'));
  });

  await testAsync('Invoice payment disbursement triggers payment receipt notification', async () => {
    const payRes = await fetch(`${BASE_URL}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'pay',
        invoiceId: 'sinv_scenario_b_apex',
        amount: 50000,
        processedBy: 'Rajesh Sharma',
      }),
    });
    assert.strictEqual(payRes.status, 200);
    const payData = await payRes.json();
    assert.ok(payData.transaction);

    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();
    const payNotif = notifData.recentNotifications.find(
      (n) => n.referenceId === 'sinv_scenario_b_apex' && n.eventType === 'invoice_payment'
    );
    assert.ok(payNotif, 'Supplier invoice payment disbursement notification recorded');
    assert.ok(payNotif.metadata.txnRef.startsWith('DEMO-TXN-'));
  });

  // 7. Material Disclosure Requests & Status Transitions
  console.log('\n--- 7. Testing Material Disclosure Request Notifications ---');
  let testDisclosureId = '';

  await testAsync('Material disclosure request creation sends notification to supplier', async () => {
    const res = await fetch(`${BASE_URL}/api/disclosure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetCompanyId: 'comp_apex_aero',
        targetCompanyName: 'Apex Aerospace Components Ltd.',
        listingId: 'lst_al_billet_001',
        listingTitle: 'Aerospace Grade 6061-T6 Aluminum Billet Cut-offs',
        requestType: 'contact_info',
        justification: 'Inquiry for immediate batch purchase of 2400 kg.',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    testDisclosureId = data.request.id;

    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();
    const discNotif = notifData.recentNotifications.find(
      (n) => n.referenceId === testDisclosureId && n.eventType === 'disclosure_request'
    );
    assert.ok(discNotif, 'Disclosure request notification to supplier recorded');
    assert.strictEqual(discNotif.to, 'surplus@apexaero.example.com');
  });

  await testAsync('Material disclosure status change (approval) sends notification to requester', async () => {
    assert.ok(testDisclosureId, 'Disclosure ID required');
    const res = await fetch(`${BASE_URL}/api/disclosure`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testDisclosureId,
        status: 'approved',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);

    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();
    const statusNotif = notifData.recentNotifications.find(
      (n) => n.referenceId === testDisclosureId && n.eventType === 'disclosure_status'
    );
    assert.ok(statusNotif, 'Disclosure status change notification to requester recorded');
    assert.ok(statusNotif.subject.includes('Approved'));
  });

  // 8. Commercial Enquiries & Price Offers
  console.log('\n--- 8. Testing Commercial Enquiry & Offer Notifications ---');
  await testAsync('Commercial enquiry submission sends notifications to both seller and buyer', async () => {
    const res = await fetch(`${BASE_URL}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: 'lst_al_billet_001',
        listingTitle: 'Aerospace Grade 6061-T6 Aluminum Billet Cut-offs',
        sellerCompanyId: 'comp_apex_aero',
        sellerCompanyName: 'Apex Aerospace Components Ltd.',
        buyerCompanyId: 'comp_precision_forge',
        buyerCompanyName: 'Precision Auto Forgings Pvt Ltd',
        offeredPrice: 215,
        quantity: 1200,
        message: 'Can take entire 1200 kg lot if dispatch can be scheduled within 3 days.',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);

    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();

    const sellerEnqNotif = notifData.recentNotifications.find(
      (n) => n.referenceId === data.enquiry.id && n.to === 'surplus@apexaero.example.com' && n.eventType === 'enquiry_offer'
    );
    assert.ok(sellerEnqNotif, 'Enquiry offer notification to supplier recorded');
    assert.ok(sellerEnqNotif.subject.includes('₹215/unit'));

    const buyerEnqNotif = notifData.recentNotifications.find(
      (n) => n.referenceId === data.enquiry.id && n.to === 'materials@precisionforge.example.com' && n.eventType === 'enquiry_offer'
    );
    assert.ok(buyerEnqNotif, 'Enquiry confirmation notification to buyer recorded');
  });

  // 9. Order Status Transitions (Accept / Decline)
  console.log('\n--- 9. Testing Order Status Transition Notifications ---');
  await testAsync('Order status transition (acceptance by supplier) sends notification to buyer', async () => {
    assert.ok(testOrderId, 'Test order ID required');
    const res = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'processing',
        reason: 'Consignment confirmed in supplier warehouse; staging for carrier pickup.',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.order.status, 'processing');

    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    const notifData = await notifRes.json();
    const orderStatusNotif = notifData.recentNotifications.find(
      (n) => n.referenceId === testOrderId && n.eventType === 'order_status_update'
    );
    assert.ok(orderStatusNotif, 'Order status update notification to buyer recorded');
    assert.ok(orderStatusNotif.subject.includes('Accepted'));
  });

  console.log('\n==========================================');
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('==========================================');

  if (passed === total) {
    console.log('ALL EMAIL NOTIFICATION WORKFLOWS VERIFIED 100%!');
  } else {
    process.exit(1);
  }
}

runEmailTests().catch((err) => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});

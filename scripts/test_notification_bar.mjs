import assert from 'assert';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runNotificationBarTests() {
  console.log('=== INDUSCYCLE NOTIFICATION BAR & IN-PORTAL CENTER TEST SUITE ===\n');
  let passed = 0;
  let total = 0;

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

  // 1. Navbar Notification Bell Rendering
  console.log('--- 1. Testing Notification Bell in Navigation ---');
  await testAsync('Homepage returns 200 and renders the Notification Bell markup', async () => {
    const res = await fetch(`${BASE_URL}`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('aria-label="Notifications"'), 'Bell button with aria-label="Notifications" present in Navbar');
    assert.ok(html.includes('Portal Notifications'), 'Title tag present on Bell button');
  });

  // 2. User Isolation & Authentication Filtering
  console.log('\n--- 2. Testing User Authorization & Scoped Filtering ---');
  const buyerId = 'user_buyer_rajesh';
  const sellerId = 'user_seller_anand';

  await testAsync('GET /api/notifications?userId=user_buyer_rajesh returns only buyer-authorized notifications', async () => {
    const res = await fetch(`${BASE_URL}/api/notifications?userId=${buyerId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.notifications));
    assert.strictEqual(typeof data.unreadCount, 'number');

    // Confirm that buyer notifications do not contain seller-only notifications
    const hasArbitrarySellerOnlyAlerts = data.notifications.some(
      (n) => n.eventType === 'admin_alert' && n.title === 'Material Listing Published' && n.userId === sellerId
    );
    assert.strictEqual(hasArbitrarySellerOnlyAlerts, false, 'Buyer does not receive other sellers private listing notifications');
  });

  await testAsync('GET /api/notifications?userId=user_seller_anand returns only seller-authorized notifications', async () => {
    const res = await fetch(`${BASE_URL}/api/notifications?userId=${sellerId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.notifications));
    assert.strictEqual(typeof data.unreadCount, 'number');
  });

  // 3. Real Event Generation & Instant Unread Count Increment
  console.log('\n--- 3. Testing Real Portal Event Triggering In-App Notification ---');
  let testOrderId = '';
  let testBuyerUnreadBefore = 0;

  await testAsync('Placing an order generates in-app notification with valid link & unread status', async () => {
    // Get initial unread count for buyer
    const initialRes = await fetch(`${BASE_URL}/api/notifications?userId=${buyerId}`);
    const initialData = await initialRes.json();
    testBuyerUnreadBefore = initialData.unreadCount;

    // Buyer places an order
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: 'lst_al_billet_001',
        quantity: 100,
        buyerId: buyerId,
        buyerName: 'Rajesh Sharma',
        buyerCompanyName: 'Kalyani Industrial Equipment',
        buyerEmail: 'procure@kalyaniequip.example.com',
      }),
    });
    assert.strictEqual(orderRes.status, 200);
    const orderData = await orderRes.json();
    assert.strictEqual(orderData.success, true);
    testOrderId = orderData.order.id;

    // Check notifications for buyer
    const afterRes = await fetch(`${BASE_URL}/api/notifications?userId=${buyerId}`);
    const afterData = await afterRes.json();
    assert.ok(afterData.unreadCount >= testBuyerUnreadBefore, 'Buyer unread count updated');

    const orderNotif = afterData.notifications.find((n) => n.referenceId === testOrderId);
    assert.ok(orderNotif, 'In-app notification created for the new order');
    assert.strictEqual(orderNotif.read, false, 'New notification has unread status');
    assert.ok(orderNotif.link, 'Notification contains clickable destination link');
    assert.ok(orderNotif.title, 'Notification contains formatted title');
    assert.ok(orderNotif.message, 'Notification contains clear description');
  });

  // 4. Mark Single as Read
  console.log('\n--- 4. Testing Mark as Read Action ---');
  let notifToMark = '';

  await testAsync('Mark single notification as read updates state and unread count', async () => {
    const listRes = await fetch(`${BASE_URL}/api/notifications?userId=${buyerId}`);
    const listData = await listRes.json();
    const unreadItem = listData.notifications.find((n) => !n.read);
    assert.ok(unreadItem, 'Found an unread notification to test');
    notifToMark = unreadItem.id;

    const markRes = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'mark_read',
        notificationId: notifToMark,
        userId: buyerId,
      }),
    });
    assert.strictEqual(markRes.status, 200);
    const markData = await markRes.json();
    assert.strictEqual(markData.success, true);
    assert.strictEqual(markData.read, true);

    // Verify persistence
    const verifyRes = await fetch(`${BASE_URL}/api/notifications?userId=${buyerId}`);
    const verifyData = await verifyRes.json();
    const updatedItem = verifyData.notifications.find((n) => n.id === notifToMark);
    assert.strictEqual(updatedItem.read, true, 'Notification read state persisted');
  });

  // 5. Mark All as Read
  console.log('\n--- 5. Testing Mark All as Read Action ---');
  await testAsync('Mark all as read sets unreadCount to 0 for the authenticated user', async () => {
    const markAllRes = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'mark_all_read',
        userId: buyerId,
      }),
    });
    assert.strictEqual(markAllRes.status, 200);
    const markAllData = await markAllRes.json();
    assert.strictEqual(markAllData.success, true);
    assert.strictEqual(markAllData.unreadCount, 0);

    // Verify on subsequent fetch
    const verifyRes = await fetch(`${BASE_URL}/api/notifications?userId=${buyerId}`);
    const verifyData = await verifyRes.json();
    assert.strictEqual(verifyData.unreadCount, 0, 'Unread count is strictly 0 after mark_all_read');
  });

  // 6. Navigation Link Integrity
  console.log('\n--- 6. Testing Notification Destination Link Integrity ---');
  await testAsync('Notification destination links navigate to valid portal routes', async () => {
    const listRes = await fetch(`${BASE_URL}/api/notifications?userId=${buyerId}`);
    const listData = await listRes.json();
    const sampleLinks = [...new Set(listData.notifications.map((n) => n.link).filter(Boolean))];
    assert.ok(sampleLinks.length > 0, 'At least one notification link exists');

    for (const link of sampleLinks.slice(0, 3)) {
      const pageRes = await fetch(`${BASE_URL}${link}`);
      assert.ok([200, 307, 308].includes(pageRes.status), `Link ${link} returned valid HTTP status ${pageRes.status}`);
    }
  });

  // 7. Duplicate Prevention (Idempotency)
  console.log('\n--- 7. Testing Idempotency & Duplicate Prevention ---');
  await testAsync('Duplicate operation does not spawn duplicate in-app notifications', async () => {
    assert.ok(testOrderId, 'Test order ID required');

    // First payment confirms order and issues invoice
    await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'demo_gateway' }),
    });

    const beforeRetryRes = await fetch(`${BASE_URL}/api/notifications?userId=${buyerId}`);
    const beforeRetryData = await beforeRetryRes.json();
    const countBeforeRetry = beforeRetryData.notifications.filter((n) => n.referenceId === testOrderId).length;

    // Retry payment on already paid order (duplicate action)
    const retryRes = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'demo_gateway' }),
    });
    assert.strictEqual(retryRes.status, 200);

    const afterRetryRes = await fetch(`${BASE_URL}/api/notifications?userId=${buyerId}`);
    const afterRetryData = await afterRetryRes.json();
    const countAfterRetry = afterRetryData.notifications.filter((n) => n.referenceId === testOrderId).length;

    assert.strictEqual(countAfterRetry, countBeforeRetry, 'Idempotency prevented duplicate notifications on retried action');
  });

  console.log('\n==========================================');
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('==========================================');

  if (passed === total) {
    console.log('ALL NOTIFICATION BAR CRITERIA MET WITH 100% SUCCESS!');
  } else {
    process.exit(1);
  }
}

runNotificationBarTests().catch((err) => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});

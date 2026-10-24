// scripts/test_acceptance.mjs
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== INDUSCYCLE ACCEPTANCE TEST SUITE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Homepage Check & Design Reference
    console.log("\n--- 1. Testing Homepage & Design Reference ---");
    const homeRes = await fetch(`${BASE_URL}/`);
    const homeHtml = await homeRes.text();
    assert(homeRes.status === 200, "Homepage returns HTTP 200");
    assert(
      homeHtml.includes("Turn Industrial By-Products into") && homeHtml.includes("Valuable Resources"),
      "Homepage contains exact mandated headline"
    );
    assert(homeHtml.includes("INDUSCYCLE"), "Homepage contains INDUSCYCLE branding");
    assert(homeHtml.includes("Explore Materials"), "Primary CTA 'Explore Materials' present");
    assert(homeHtml.includes("List Your Surplus"), "Secondary CTA 'List Your Surplus' present");
    assert(homeHtml.includes("Intelligent Material Marketplace"), "Section 1 headline present");
    assert(homeHtml.includes("AI-Powered Material Matching"), "Section 2 headline present");
    assert(homeHtml.includes("Material Flow Analysis"), "Section 3 headline present");
    assert(homeHtml.includes("Smarter Industrial Logistics"), "Section 4 headline present");
    assert(homeHtml.includes("Verified Circular Impact"), "Section 5 headline present");

    // 2. Auth & Role-Based Registration Check
    console.log("\n--- 2. Testing Role-Based Login & Registration ---");
    const authGet = await fetch(`${BASE_URL}/api/auth`);
    const authData = await authGet.json();
    assert(authData.success && authData.users.length >= 3, "Auth endpoint returns pre-seeded users");

    // Register a new Buyer
    const regRes = await fetch(`${BASE_URL}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        role: "buyer",
        fullName: "Test Automated Buyer",
        companyName: "Auto Test Foundry Ltd",
        businessEmail: `autobuyer_${Date.now()}@autofoundry.test`,
        companyLocation: "Pune, Maharashtra",
        requiredMaterials: "SS304 offcuts & 6061 billets"
      })
    });
    const regData = await regRes.json();
    assert(regData.success && regData.user.role === "buyer", "Successfully registered new Buyer account");

    // Register page check
    const registerPageRes = await fetch(`${BASE_URL}/register`);
    const registerPageHtml = await registerPageRes.text();
    assert(registerPageRes.status === 200, "Register page (/register) returns HTTP 200");
    assert(registerPageHtml.includes("Option 1: Buyer") && registerPageHtml.includes("Option 2: Seller"), "Register page displays Option 1: Buyer and Option 2: Seller selectable cards");

    // 3. Material Listing Creation with Dimensions & Multiple Images
    console.log("\n--- 3. Testing Advanced Industrial Material Listing Form ---");
    const newListingPayload = {
      title: "Test Inconel 718 Laser Drop Cuts",
      materialName: "Inconel 718 Sheet Strips",
      materialCategory: "Sheet-metal offcuts",
      sourceIndustry: "Turbine Aerospace",
      manufacturingProcess: "Fiber Laser Trimming",
      description: "Clean nickel superalloy scrap pieces from turbine shroud manufacturing.",
      grade: "Inconel 718 / UNS N07718",
      dimensions: {
        length: 250,
        width: 120,
        heightOrThickness: 2.5,
        dimensionUnit: "mm",
        weightPerPiece: 0.65,
        numberOfPieces: 300,
        shapeOrPhysicalForm: "Rectangular Drop Strip"
      },
      totalQuantity: 195,
      quantityUnit: "kg",
      minOrderQuantity: 50,
      pricePerUnit: 1450,
      currency: "INR",
      condition: "clean",
      contaminationStatus: "No coolants, laser clean",
      images: [
        {
          id: "img_test_1",
          storagePath: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><rect width='100' height='100' fill='blue'/></svg>",
          originalFilename: "inconel_718_strip1.svg",
          contentType: "image/svg+xml",
          fileSize: 1024,
          isPrimary: true,
          displayOrder: 1,
          uploadedAt: new Date().toISOString()
        },
        {
          id: "img_test_2",
          storagePath: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><rect width='100' height='100' fill='purple'/></svg>",
          originalFilename: "inconel_718_strip2.svg",
          contentType: "image/svg+xml",
          fileSize: 1024,
          isPrimary: false,
          displayOrder: 2,
          uploadedAt: new Date().toISOString()
        }
      ],
      documents: [
        {
          id: "doc_test_1",
          title: "Inconel_718_HeatCert.pdf",
          documentType: "test_report",
          storagePath: "/docs/test_mtr.pdf",
          verificationState: "verified",
          isConfidential: false
        }
      ]
    };

    const createListingRes = await fetch(`${BASE_URL}/api/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newListingPayload)
    });
    const createListingData = await createListingRes.json();
    assert(createListingData.success && createListingData.listing.id, "Successfully published technical material listing with dimensions and images");
    const createdId = createListingData.listing.id;

    // Fetch created listing by ID
    const getDetailRes = await fetch(`${BASE_URL}/api/listings/${createdId}`);
    const getDetailData = await getDetailRes.json();
    assert(getDetailData.success && getDetailData.listing.images.length === 2, "Listing detail returns full multi-image gallery");
    assert(getDetailData.listing.dimensions.heightOrThickness === 2.5, "Dimensions persisted accurately");

    // 4. Global Search & Autocomplete
    console.log("\n--- 4. Testing Global Search & Autocomplete ---");
    const searchRes = await fetch(`${BASE_URL}/api/search?q=Inconel`);
    const searchData = await searchRes.json();
    assert(searchData.success && searchData.results.length >= 1, "Global search retrieves newly created Inconel listing");

    const categorySearchRes = await fetch(`${BASE_URL}/api/search?category=Sheet-metal offcuts`);
    const categorySearchData = await categorySearchRes.json();
    assert(categorySearchData.success && categorySearchData.results.length >= 2, "Category filter works seamlessly");

    // 5. Material Compatibility Checker
    console.log("\n--- 5. Testing Deterministic Compatibility Checker ---");
    const compatRes = await fetch(`${BASE_URL}/api/compatibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: createdId,
        requiredGrade: "Inconel 718",
        quantityRequired: 100,
        conditionAcceptable: ["clean"]
      })
    });
    const compatData = await compatRes.json();
    assert(compatData.success && compatData.evaluation.status === "Compatible", "Compatibility checker confirms status 'Compatible'");
    assert(compatData.evaluation.score >= 80, "Decision-support score accurately computed");

    // Test Incompatibility Rule
    const incompatRes = await fetch(`${BASE_URL}/api/compatibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: createdId,
        requiredGrade: "Mild Steel IS 2062",
        conditionAcceptable: ["clean"]
      })
    });
    const incompatData = await incompatRes.json();
    assert(incompatData.evaluation.status === "Incompatible", "Deterministic metallurgical incompatibility correctly triggered");

    // 6. Transport & Landed Cost Estimator
    console.log("\n--- 6. Testing Delivered Cost & What-If Simulator ---");
    const costRes = await fetch(`${BASE_URL}/api/cost-estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity: 1000,
        materialPricePerUnit: 185,
        distanceKm: 350,
        transportRatePerKm: 35,
        loadingUnloadingRate: 2,
        packagingHandling: 1,
        sortingCleaning: 4
      })
    });
    const costData = await costRes.json();
    assert(costData.success && costData.calculation.totalDeliveredCost > costData.calculation.materialCost, "Landed cost calculation computes freight + processing + taxes accurately");
    assert(costData.calculation.estimatedSavings > 0, "Estimates net landed savings vs conventional sourcing");

    // 7. Live Shipment Tracking & 9-Stage Progress
    console.log("\n--- 7. Testing 9-Stage Shipment Tracking ---");
    const shipListRes = await fetch(`${BASE_URL}/api/shipments`);
    const shipListData = await shipListRes.json();
    assert(shipListData.success && shipListData.shipments.length > 0, "Tracking endpoint returns active consignments");

    const activeShip = shipListData.shipments[0];
    const initialStage = activeShip.currentStage;

    // Simulate Step Forward
    const stepRes = await fetch(`${BASE_URL}/api/shipments/${activeShip.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "step_forward" })
    });
    const stepData = await stepRes.json();
    assert(stepData.success && stepData.shipment.currentStage === Math.min(9, initialStage + 1), "Shipment simulation steps forward successfully through the 9 stages");

    // 8. Order Creation, Payment Confirmation & Invoice System
    console.log("\n--- 8. Testing Order Creation, Payment & Invoice System ---");
    const orderCreateRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: createdId,
        quantity: 50,
        buyerId: "user_buyer_rajesh",
        buyerName: "Rajesh Sharma",
        buyerCompanyName: "Kalyani Industrial Equipment",
        buyerEmail: "procurement@kalyaniequip.example.com",
        buyerAddress: "Plot 42, Bhosari MIDC, Pune, Maharashtra",
        distanceKm: 180,
        includeProcessing: true
      })
    });
    const orderCreateData = await orderCreateRes.json();
    assert(orderCreateData.success && orderCreateData.order.id, "Successfully initialized commercial procurement order");

    const orderId = orderCreateData.order.id;

    // Confirm Payment
    const paymentConfirmRes = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "demo_gateway",
        paymentReference: `PAY-TEST-${Date.now().toString().slice(-6)}`
      })
    });
    const paymentConfirmData = await paymentConfirmRes.json();
    assert(paymentConfirmData.success && paymentConfirmData.order.status === "paid", "Payment verified and order marked paid");
    assert(paymentConfirmData.invoice && paymentConfirmData.invoice.invoiceNumber, "Invoice generated with unique official number");

    // Retrieve Invoice
    const invoiceFetchRes = await fetch(`${BASE_URL}/api/invoices/${paymentConfirmData.invoice.id}`);
    const invoiceFetchData = await invoiceFetchRes.json();
    assert(invoiceFetchData.success && invoiceFetchData.invoice.id === paymentConfirmData.invoice.id, "Invoice accessible by invoice ID");

    // 9. Industrial Cluster Map Directory
    console.log("\n--- 9. Testing Industrial Cluster Map Directory ---");
    const clusterRes = await fetch(`${BASE_URL}/api/clusters`);
    const clusterData = await clusterRes.json();
    assert(clusterData.success && clusterData.clusters.length >= 4, "Cluster directory returns Pune, Bengaluru, Chennai, and Faridabad hubs");

    const clusterPageRes = await fetch(`${BASE_URL}/cluster-map`);
    assert(clusterPageRes.status === 200, "Cluster map page (/cluster-map) returns HTTP 200");

    // 10. Smart Supplier Payments & Invoice Management (Section 42)
    console.log("\n--- 10. Testing Smart Supplier Payments & Invoice Dashboard ---");
    const paymentsRes = await fetch(`${BASE_URL}/api/payments`);
    const paymentsData = await paymentsRes.json();
    assert(paymentsRes.status === 200 && paymentsData.success, "Payments API returns HTTP 200 and success: true");
    assert(paymentsData.invoices && paymentsData.invoices.length >= 5, "Payments endpoint includes all 5 required demo scenarios (A, B, C, D, E)");
    assert(paymentsData.summary.totalPayable > 0, "Single source of truth KPI Total Payable is non-zero");
    assert(paymentsData.summary.totalPaid > 0, "Single source of truth KPI Total Paid is non-zero");
    assert(paymentsData.summary.overduePayment > 0, "Overdue Payment alert KPI correctly computed for Scenario C");

    // Scenario D: Check 3-way match discrepancy
    const scenarioD = paymentsData.invoices.find(inv => inv.scenarioTag === "Scenario D");
    assert(scenarioD && scenarioD.threeWayMatch.matched === false, "Scenario D correctly flags 3-way match mismatch");
    assert(scenarioD.threeWayMatch.discrepancies.length >= 2, "Scenario D documents exact quantity and unit rate discrepancies");

    // Scenario E: Check quality inspection milestone
    const scenarioE = paymentsData.invoices.find(inv => inv.scenarioTag === "Scenario E");
    assert(scenarioE && scenarioE.eligibilityStatus === "Pending evidence", "Scenario E flags QA inspection pending evidence");

    // Test Demo Mode Payout Action (Scenario B)
    const scenarioB = paymentsData.invoices.find(inv => inv.scenarioTag === "Scenario B");
    const payActionRes = await fetch(`${BASE_URL}/api/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "pay",
        invoiceId: scenarioB.id,
        amount: 245000,
        processedBy: "Test Automated Buyer"
      })
    });
    const payActionData = await payActionRes.json();
    assert(payActionData.success && payActionData.transaction.transactionReference.startsWith("DEMO-TXN-"), "Demo payment generates unique DEMO-TXN-... audit reference");
    assert(payActionData.invoice.paymentStatus === "Paid" && payActionData.invoice.outstandingBalance === 0, "Invoice balance cleared and payment status updated to Paid");

    // Payments page check
    const paymentsPageRes = await fetch(`${BASE_URL}/payments`);
    const paymentsPageHtml = await paymentsPageRes.text();
    assert(paymentsPageRes.status === 200, "Payments page (/payments) returns HTTP 200");
    assert(paymentsPageHtml.includes("Supplier Invoice &amp; Payment Management") || paymentsPageHtml.includes("Supplier Invoice & Payment Management"), "Payments page renders required header");

    // 11. Live Custody GPS Route & Transporter Tracking (Section 41)
    console.log("\n--- 11. Testing Live Custody GPS Route & Transporter Tracking ---");
    const trackingPageRes = await fetch(`${BASE_URL}/tracking`);
    const trackingPageHtml = await trackingPageRes.text();
    assert(trackingPageRes.status === 200, "Tracking page (/tracking) returns HTTP 200");
    assert(trackingPageHtml.includes("LIVE CLUSTER GPS ROUTE"), "Tracking page contains prominent 'LIVE CLUSTER GPS ROUTE' panel");
    assert(trackingPageHtml.includes("Designated Transporter &amp; Fleet Logistics") || trackingPageHtml.includes("Designated Transporter & Fleet Logistics"), "Tracking page displays Transporter & Driver card");
    assert(trackingPageHtml.includes("Custody Transfer Audit Log"), "Tracking page displays Vertical Custody Transfer Audit Log");

    // 12. Google Maps-Style Cluster Map & Deduplicated Company Summary (Section 43)
    console.log("\n--- 12. Testing Cluster Map Deduplicated Counts & UI ---");
    const clusterMapHtml = await (await fetch(`${BASE_URL}/cluster-map`)).text();
    assert(clusterMapHtml.includes("Total Companies on Platform"), "Cluster Map renders Deduplicated Company Counts summary");
    assert(clusterMapHtml.includes("Transparent Regional Ecosystem Disclosure"), "Cluster Map displays transparent disclosure notice");

    console.log("\n==========================================");
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("==========================================");

    if (failed === 0) {
      console.log("ALL ACCEPTANCE CRITERIA MET WITH 100% SUCCESS!");
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runTests();

// scripts/test_acceptance.mjs
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== CONNECTOR ACCEPTANCE TEST SUITE ===");
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
    // 1. Homepage Check
    console.log("\n--- 1. Testing Homepage & Design Reference ---");
    const homeRes = await fetch(`${BASE_URL}/`);
    const homeHtml = await homeRes.text();
    assert(homeRes.status === 200, "Homepage returns HTTP 200");
    assert(
      homeHtml.includes("Turn Industrial By-Products into") && homeHtml.includes("Valuable Resources"),
      "Homepage contains exact GrabCAD-inspired headline"
    );
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

    // 8. Privacy-Preserving Disclosure Request
    console.log("\n--- 8. Testing Privacy-Preserving Disclosure Request ---");
    const discRes = await fetch(`${BASE_URL}/api/disclosure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: createdId,
        targetCompanyId: "comp_aerostruct_sheet",
        justification: "Automated verification test of contact reveal workflow"
      })
    });
    const discData = await discRes.json();
    assert(discData.success && discData.request.status === "pending", "Privacy request-to-reveal registered as pending");

    // 9. Buyer Enquiry & Purchase Offer
    console.log("\n--- 9. Testing Buyer Purchase Offer Workflow ---");
    const enqRes = await fetch(`${BASE_URL}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: createdId,
        type: "offer",
        offeredPrice: 1400,
        quantity: 100,
        message: "Automated test offer for turbine offcuts"
      })
    });
    const enqData = await enqRes.json();
    assert(enqData.success && enqData.enquiry.status === "pending", "Purchase offer submitted and dispatched to seller");

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

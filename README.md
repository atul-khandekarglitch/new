# Connector — Industrial Material Exchange & Circular Supply Chain

> **Turn Industrial By-Products into Valuable Resources**  
> Connector uses intelligent material matching, material-flow analysis, and cost-aware industrial networking to help manufacturers discover reusable materials, reduce waste, and build a more circular supply chain.

---

## 🚀 Overview

Connector is a production-grade circular manufacturing platform inspired by the visual design, spacing, and typography of GrabCAD, tailored for industrial materials exchange (CNC machining chips, billet cut-offs, forging flash, sheet-metal offcuts, tool steel, alloys, and polymer production scrap).

---

## ✨ Key Features

### 1. GrabCAD-Inspired Homepage & Design System
- **Navy-to-Purple Gradient Hero**: Full-width dark navy blue transitioning into electric bright blue and violet/purple with a smooth curved wave edge.
- **Alternating White Product Information Sections**:
  - **Intelligent Material Marketplace**: Live factory feeds with metallurgical specifications.
  - **AI-Powered Material Matching**: Deterministic compatibility matrix and score breakdown.
  - **Material Flow Analysis**: Mass balance diagrams detailing prime goods vs. reusable solids.
  - **Smarter Industrial Logistics**: Delivered landed cost breakdowns.
  - **Verified Circular Impact**: Audited ESG and BRSR compliance metrics.

### 2. Advanced Industrial Material Listing Suite (`/listings/new`)
- **8-Step Progress Wizard**:
  1. *Basic Material Information*: Title, source industry, manufacturing process, listing type (sale, reuse, exchange, recycling, donation).
  2. *Specifications & Dimensions*: Dynamic conditional fields according to category (length, width, thickness, diameter, particle size, piece count, weight).
  3. *Quantity, Price & Availability*: Volume, MOQ, currency, negotiable option, recurring supply replenishment.
  4. *Quality, Condition & Safety*: Cleanliness status, residual coolant/oil flags, oxidation warnings, safety advisories.
  5. *Photos & Documents*: Multi-image drag-and-drop upload (up to 8 images), primary selector, reordering, and Mill Test Report (MTR) / Spectro assay attachment.
  6. *Location & Logistics*: Industrial zone, vehicle limits (e.g. 32-ft trailers), crane access.
  7. *Intended Reuse*: Remelting requirements, cutting needs, buyer industry preference.
  8. *Review & Publish*: Live summary review, draft saving, and instant publishing.

### 3. Global Marketplace & Product Cards (`/marketplace`)
- **Global Search & Autocomplete**: Debounced search across material names, grades, categories, companies, and locations.
- **Filtering & Multi-Sorting**: Filter by 15 industrial categories, alloy grade, condition, location, and verification status.
- **Product Cards & Detail View (`/listings/[id]`)**: Full image galleries, metallurgical envelopes, interactive delivered cost calculator, and direct offer/RFQ modals.

### 4. Deterministic Compatibility Engine (`/api/compatibility`)
- Compares material identity, metallurgical grade, dimensional envelopes, quantity thresholds, surface cleanliness, and certified test reports.
- Deterministic outcomes: `Compatible`, `Potentially Compatible`, `Incompatible`, or `Insufficient Information`.
- **"Why this match?" Explanation**: Transparent explanation of matched fields, conflicting parameters, and missing documentation.

### 5. Role-Based Buyer & Seller Dashboards
- **Dedicated Buyer Dashboard (`/dashboard/buyer`)**: Sourcing search, active shipment tracking, incoming inquiries, and landed savings KPIs.
- **Dedicated Seller Dashboard (`/dashboard/seller`)**: Plant inventory management, stock realization metrics, and incoming purchase offers.
- **1-Click Demo Role Switcher**: Instant switching between Buyer (Rajesh Sharma), Seller (Anand Verma), and Dual Role (Vikram Patel).

### 6. 9-Stage Live Shipment Tracking (`/tracking`)
- Chain-of-custody milestones: *Awaiting collection $\rightarrow$ Collection scheduled $\rightarrow$ Collected $\rightarrow$ In transit $\rightarrow$ Near destination $\rightarrow$ Out for delivery $\rightarrow$ Delivered $\rightarrow$ Receipt confirmation pending $\rightarrow$ Completed*.
- Interactive `DEMO TRACKING` simulation button to step forward through stages.
- Electronic weighbridge tare/gross logs, driver credentials, and intake condition confirmation.

### 7. "What-If" Landed Cost & Proceeds Simulator (`/simulator`)
- **Buyer Landed Savings Simulator**: Models required quantity, freight rates, handling, pre-processing, and usable yield to calculate net savings and break-even transport distances.
- **Seller Net Proceeds Simulator**: Calculates gross sales value, preparation costs, and break-even selling rates.
- Presets for *Low Cost*, *Expected*, and *High Cost* scenario comparisons.

### 8. Material Flow Analysis (`/material-flow`)
- Mass balance diagnostic topologies across Automotive Forging, Aerospace CNC Machining, and Sheet Laser Stamping lines.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database / Persistence**: Server-side file-backed relational JSON database (`data/connector_db.json`) with pre-seeded industrial companies, users, listings, and shipments.

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Build & Run for Production
```bash
npm run build
npm run start
```

### 4. Run Acceptance Test Suite
```bash
node scripts/test_acceptance.mjs
```

---

## 📄 License
MIT

import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q")?.trim().toLowerCase() || "";
    const category = searchParams.get("category");
    const grade = searchParams.get("grade")?.toLowerCase();
    const location = searchParams.get("location")?.toLowerCase();
    const condition = searchParams.get("condition");
    const minQty = searchParams.get("minQty") ? Number(searchParams.get("minQty")) : null;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;
    const sort = searchParams.get("sort") || "relevance";

    // Build autocomplete suggestions if query is short
    const suggestions: string[] = [];
    if (query.length >= 2) {
      db.listings.forEach((l) => {
        if (l.materialName.toLowerCase().includes(query) && !suggestions.includes(l.materialName)) {
          suggestions.push(l.materialName);
        }
        if (l.grade.toLowerCase().includes(query) && !suggestions.includes(l.grade)) {
          suggestions.push(l.grade);
        }
        if (l.materialCategory.toLowerCase().includes(query) && !suggestions.includes(l.materialCategory)) {
          suggestions.push(l.materialCategory);
        }
        if (l.city.toLowerCase().includes(query) && !suggestions.includes(l.city)) {
          suggestions.push(l.city);
        }
      });
    }

    let results = db.listings.filter((listing) => {
      if (listing.status !== "active") return false;

      if (query) {
        const matchesTitle = listing.title.toLowerCase().includes(query);
        const matchesName = listing.materialName.toLowerCase().includes(query);
        const matchesDesc = listing.description.toLowerCase().includes(query);
        const matchesGrade = listing.grade.toLowerCase().includes(query);
        const matchesCategory = listing.materialCategory.toLowerCase().includes(query);
        const matchesCity = listing.city.toLowerCase().includes(query);
        const matchesState = listing.state.toLowerCase().includes(query);
        const matchesProcess = listing.manufacturingProcess.toLowerCase().includes(query);
        const matchesAlloy = listing.alloyDesignation?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesName && !matchesDesc && !matchesGrade && !matchesCategory && !matchesCity && !matchesState && !matchesProcess && !matchesAlloy) {
          return false;
        }
      }

      if (category && category !== "all" && listing.materialCategory !== category) return false;
      if (grade && !listing.grade.toLowerCase().includes(grade)) return false;
      if (condition && condition !== "all" && listing.condition !== condition) return false;
      if (minQty !== null && listing.totalQuantity < minQty) return false;
      if (maxPrice !== null && listing.pricePerUnit > maxPrice) return false;

      if (location) {
        const locMatch = listing.city.toLowerCase().includes(location) || 
                         listing.state.toLowerCase().includes(location) || 
                         listing.industrialArea.toLowerCase().includes(location);
        if (!locMatch) return false;
      }

      return true;
    });

    // Sorting
    results.sort((a, b) => {
      if (sort === "relevance" && query) {
        const aExact = a.title.toLowerCase().includes(query) ? 2 : 1;
        const bExact = b.title.toLowerCase().includes(query) ? 2 : 1;
        return bExact - aExact;
      }
      if (sort === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === "price_asc") {
        return a.pricePerUnit - b.pricePerUnit;
      }
      if (sort === "price_desc") {
        return b.pricePerUnit - a.pricePerUnit;
      }
      if (sort === "qty_desc") {
        return b.totalQuantity - a.totalQuantity;
      }
      return 0;
    });

    const enrichedResults = results.map(listing => {
      const company = db.companies.find(c => c.id === listing.supplierCompanyId);
      const isPrivate = company && company.privacyLevel !== "public";
      return {
        ...listing,
        supplierName: isPrivate ? `${company?.industry || "Precision Manufacturer"} (${listing.city} Zone)` : company?.name,
        isCompanyPrivate: isPrivate,
      };
    });

    return NextResponse.json({
      success: true,
      query,
      count: enrichedResults.length,
      suggestions: suggestions.slice(0, 8),
      results: enrichedResults,
    });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Save search endpoint
  try {
    const db = getDatabase();
    const body = await req.json();

    const newSavedSearch = {
      id: `srch_${Date.now()}`,
      userId: body.userId || "user_buyer_rajesh",
      query: body.query || "",
      category: body.category,
      location: body.location,
      notifyOnMatch: true,
      createdAt: new Date().toISOString(),
    };

    db.savedSearches.push(newSavedSearch);
    saveDatabase(db);

    return NextResponse.json({ success: true, savedSearch: newSavedSearch });
  } catch (error) {
    console.error("POST /api/search error:", error);
    return NextResponse.json({ success: false, error: "Failed to save search" }, { status: 500 });
  }
}

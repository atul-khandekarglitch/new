import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.toLowerCase() || "";
    const category = searchParams.get("category");
    const role = searchParams.get("role"); // 'buyer' | 'seller' | 'all'

    let clusters = db.industrialClusters || [];
    const allCompanies = db.companies || [];

    // Filter clusters
    clusters = clusters.filter((c) => {
      if (q) {
        const nameMatch = c.name.toLowerCase().includes(q);
        const regionMatch = c.region.toLowerCase().includes(q);
        const stateMatch = c.state.toLowerCase().includes(q);
        const tagMatch = c.tags.some(t => t.toLowerCase().includes(q));
        const indMatch = c.primaryIndustries.some(i => i.toLowerCase().includes(q));
        if (!nameMatch && !regionMatch && !stateMatch && !tagMatch && !indMatch) {
          return false;
        }
      }

      if (category && category !== "all") {
        const genMatch = c.keyMaterialsGenerated.some(m => m.toLowerCase().includes(category.toLowerCase()));
        const demMatch = c.keyMaterialsDemanded.some(m => m.toLowerCase().includes(category.toLowerCase()));
        if (!genMatch && !demMatch) return false;
      }

      return true;
    });

    // Enrich clusters with active listings counts and matching companies
    const enrichedClusters = clusters.map((c) => {
      const matchingListings = db.listings.filter(
        (l) => l.city.toLowerCase().includes(c.state.toLowerCase()) || 
               l.state.toLowerCase().includes(c.state.toLowerCase()) ||
               c.name.toLowerCase().includes(l.city.toLowerCase()) ||
               l.industrialArea.toLowerCase().includes(c.name.toLowerCase()) ||
               c.name.toLowerCase().includes(l.industrialArea.toLowerCase())
      );

      // Find companies operating in this cluster region
      const clusterCompanies = allCompanies.filter((comp) => {
        const matchState = comp.state.toLowerCase() === c.state.toLowerCase();
        const matchCity = comp.city.toLowerCase().includes(c.region.toLowerCase()) || 
                          c.name.toLowerCase().includes(comp.city.toLowerCase()) ||
                          comp.industrialArea.toLowerCase().includes(c.name.toLowerCase()) ||
                          c.name.toLowerCase().includes(comp.industrialArea.toLowerCase());
        return matchState && matchCity;
      });

      return {
        ...c,
        actualListings: matchingListings.map(l => ({
          id: l.id,
          title: l.title,
          category: l.materialCategory,
          grade: l.grade,
          quantity: `${l.totalQuantity} ${l.quantityUnit}`,
          price: `₹${l.pricePerUnit}/${l.quantityUnit}`,
          city: l.city,
          condition: l.condition,
        })),
        activeListingsCount: Math.max(c.activeListingsCount, matchingListings.length),
        companies: clusterCompanies,
        platformCompaniesCount: clusterCompanies.length,
      };
    });

    // Deduplicated company stats
    const totalCompaniesOnInduscycle = allCompanies.length;
    const verifiedCompaniesCount = allCompanies.filter(c => c.verified).length;

    return NextResponse.json({
      success: true,
      count: enrichedClusters.length,
      clusters: enrichedClusters,
      totalCompaniesOnInduscycle,
      verifiedCompaniesCount,
      allCompanies,
    });
  } catch (error) {
    console.error("GET /api/clusters error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch industrial clusters" }, { status: 500 });
  }
}

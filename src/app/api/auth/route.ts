import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { Company, User } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const user = db.users.find((u) => u.id === userId);
      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }
      const company = db.companies.find((c) => c.id === user.companyId);
      return NextResponse.json({ success: true, user, company });
    }

    // Default return all users for testing/switching
    return NextResponse.json({ 
      success: true, 
      users: db.users, 
      companies: db.companies 
    });
  } catch (error) {
    console.error("GET /api/auth error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const action = body.action || "login";

    if (action === "login") {
      const email = body.email?.toLowerCase().trim();
      const user = db.users.find((u) => u.email.toLowerCase() === email);

      if (!user) {
        // If demo email, return first user or specific role
        const fallbackUser = body.role 
          ? db.users.find(u => u.role === body.role || u.role === 'both') || db.users[0]
          : db.users[0];
        const company = db.companies.find((c) => c.id === fallbackUser.companyId);
        return NextResponse.json({ success: true, user: fallbackUser, company });
      }

      const company = db.companies.find((c) => c.id === user.companyId);
      return NextResponse.json({ success: true, user, company });
    }

    if (action === "register") {
      const {
        fullName,
        companyName,
        businessEmail,
        phoneNumber,
        role, // 'buyer' | 'seller' | 'both'
        industry,
        subIndustry,
        manufacturingProcess,
        companyLocation,
        city,
        state,
        requiredMaterials,
        materialsGenerated,
      } = body;

      if (!fullName || !companyName || !businessEmail || !role) {
        return NextResponse.json({ success: false, error: "Missing required registration fields" }, { status: 400 });
      }

      const newCompanyId = `comp_${Date.now()}`;
      const newUserId = `user_${Date.now()}`;
      const now = new Date().toISOString();

      const newCompany: Company = {
        id: newCompanyId,
        name: companyName,
        industry: industry || "Industrial Manufacturing",
        subIndustry: subIndustry || "",
        manufacturingProcess: manufacturingProcess || "",
        city: city || companyLocation || "Pune",
        state: state || "Maharashtra",
        country: "India",
        industrialArea: `${city || companyLocation || "Industrial"} Zone`,
        privacyLevel: "public",
        verified: false,
        contactEmail: businessEmail,
        contactPhone: phoneNumber,
        capabilities: materialsGenerated ? [materialsGenerated] : requiredMaterials ? [requiredMaterials] : [],
        description: `Registered as ${role} on Induscycle.`,
      };

      const newUser: User = {
        id: newUserId,
        name: fullName,
        email: businessEmail,
        phone: phoneNumber,
        role: role,
        companyId: newCompanyId,
        createdAt: now,
      };

      db.companies.push(newCompany);
      db.users.push(newUser);

      db.auditLogs.unshift({
        id: `log_${Date.now()}`,
        userId: newUserId,
        action: "USER_REGISTERED",
        details: `Registered ${fullName} as ${role} for ${companyName}`,
        timestamp: now,
      });

      saveDatabase(db);

      return NextResponse.json({
        success: true,
        user: newUser,
        company: newCompany,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/auth error:", error);
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 });
  }
}

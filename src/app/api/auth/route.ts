import { NextRequest, NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { Company, User } from "@/types";
import { syncUserToSupabase } from "@/lib/supabaseDb";
import { notifyUserRegistration } from "@/lib/email";

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

      // Trigger automatic welcome email notification (non-blocking)
      notifyUserRegistration(newUser, newCompany).catch((e) => console.warn("Registration email notification notice:", e));

      // Async sync to Supabase if schema is ready
      syncUserToSupabase(newUser, newCompany).catch((e) => console.warn("Supabase user sync notice:", e));

      return NextResponse.json({
        success: true,
        user: newUser,
        company: newCompany,
      });
    }

    if (action === "google_sync") {
      const { email, name, role = "buyer", avatar, supabaseId } = body;
      if (!email) {
        return NextResponse.json({ success: false, error: "Email is required for Google authentication" }, { status: 400 });
      }

      // Check for existing user with this email
      let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      let company: Company | undefined;

      if (user) {
        company = db.companies.find((c) => c.id === user!.companyId);
      } else {
        const newCompanyId = `comp_${Date.now()}`;
        const newUserId = supabaseId || `user_${Date.now()}`;
        const now = new Date().toISOString();

        company = {
          id: newCompanyId,
          name: `${name}'s Industrial Org`,
          industry: "Industrial Manufacturing",
          city: "Pune",
          state: "Maharashtra",
          country: "India",
          industrialArea: "Industrial Zone",
          privacyLevel: "public",
          verified: true,
          contactEmail: email,
          capabilities: [],
          description: `Authenticated via Google OAuth on Induscycle.`,
        };

        user = {
          id: newUserId,
          name: name || email.split("@")[0],
          email: email,
          role: role,
          companyId: newCompanyId,
          avatar: avatar || undefined,
          createdAt: now,
        };

        db.companies.push(company);
        db.users.push(user);

        db.auditLogs.unshift({
          id: `log_${Date.now()}`,
          userId: newUserId,
          action: "GOOGLE_OAUTH_LOGIN",
          details: `Google authentication for ${name} (${email}) as ${role}`,
          timestamp: now,
        });

        saveDatabase(db);

        // Trigger automatic welcome email notification (non-blocking)
        notifyUserRegistration(user, company).catch((e) => console.warn("Google OAuth email notification notice:", e));

        // Async sync to Supabase if schema is ready
        syncUserToSupabase(user, company).catch((e) => console.warn("Supabase user sync notice:", e));
      }

      return NextResponse.json({
        success: true,
        user,
        company,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/auth error:", error);
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 });
  }
}

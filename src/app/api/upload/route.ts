import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const documentType = formData.get("documentType") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 });
    }

    if (files.length > 8) {
      return NextResponse.json({ success: false, error: "Maximum 8 images allowed per upload operation" }, { status: 400 });
    }

    const uploadedItems = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file size (max 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ 
          success: false, 
          error: `File ${file.name} exceeds the 10MB limit.` 
        }, { status: 400 });
      }

      // Convert buffer to data URI for universal local persistence
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "application/octet-stream";
      const dataUri = `data:${mimeType};base64,${base64}`;

      const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      if (documentType) {
        // Document item
        uploadedItems.push({
          id,
          title: file.name,
          documentType: documentType || "other",
          storagePath: dataUri,
          verificationState: "uploaded",
          isConfidential: true,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toISOString(),
        });
      } else {
        // Image item
        uploadedItems.push({
          id,
          storagePath: dataUri,
          originalFilename: file.name,
          contentType: mimeType,
          fileSize: file.size,
          isPrimary: i === 0,
          displayOrder: i + 1,
          uploadedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: uploadedItems.length,
      items: uploadedItems,
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ success: false, error: "File upload failed" }, { status: 500 });
  }
}

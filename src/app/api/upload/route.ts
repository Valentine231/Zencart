import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      return NextResponse.json({ error: "Cloudinary URL not configured" }, { status: 500 });
    }

    const regex = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
    const match = cloudinaryUrl.match(regex);

    if (!match) {
      return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 500 });
    }

    const apiKey = match[1];
    const apiSecret = match[2];
    const cloudName = match[3];

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = crypto
      .createHash("sha1")
      .update(`timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const cloudFormData = new FormData();
    cloudFormData.append("file", file);
    cloudFormData.append("api_key", apiKey);
    cloudFormData.append("timestamp", timestamp.toString());
    cloudFormData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudFormData,
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ url: data.secure_url });
    } else {
      console.error("Cloudinary upload failed:", data);
      return NextResponse.json({ error: data.error?.message || "Upload failed" }, { status: response.status });
    }
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

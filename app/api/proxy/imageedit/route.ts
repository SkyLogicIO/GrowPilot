
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Log the received files for debugging
    const prompt = formData.get("prompt");
    const image1 = formData.get("image1");
    
    if (!prompt || !image1) {
      return NextResponse.json(
        { error: "Missing required fields: prompt and image1" },
        { status: 400 }
      );
    }

    // Forward the request to the actual API
    const apiResponse = await fetch("http://175.27.193.51:3008/api/v1/imageedit", {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
        // Do NOT set Content-Type here, let fetch set it with the boundary for FormData
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Upstream API Error:", apiResponse.status, errorText);
      return NextResponse.json(
        { error: `Upstream API error: ${apiResponse.status}`, details: errorText },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

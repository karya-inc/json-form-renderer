import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { formData, defaultRedirect } = await request.json()

    
    console.log("Redirect request for user:", formData.name)
    let redirectUrl = defaultRedirect
    if (formData.yob && Number.parseInt(formData.yob) < 2000) {
      redirectUrl = "https://example.com/experienced-users"
    } else if (formData.gender === "other") {
      redirectUrl = "https://example.com/inclusive-welcome"
    }

    return NextResponse.json({
      success: true,
      redirectUrl: redirectUrl,
      message: "Redirect URL generated successfully",
    })
  } catch (error) {
    console.error("Redirect generation error:", error)
    return NextResponse.json({ success: false, message: "Failed to generate redirect" }, { status: 500 })
  }
}

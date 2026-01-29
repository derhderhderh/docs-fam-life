import { NextRequest, NextResponse } from "next/server"
import { sendDocumentUploadedEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, documentTitle, uploadedByName, familyName } = await request.json()

    if (!email || !displayName || !documentTitle || !uploadedByName || !familyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await sendDocumentUploadedEmail({
      email,
      displayName,
      documentTitle,
      uploadedByName,
      familyName,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email error:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}

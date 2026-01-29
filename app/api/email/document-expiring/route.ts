import { NextRequest, NextResponse } from "next/server"
import { sendDocumentExpiringEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, documentTitle, expirationDate, daysRemaining } = await request.json()

    if (!email || !displayName || !documentTitle || !expirationDate || daysRemaining === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await sendDocumentExpiringEmail({
      email,
      displayName,
      documentTitle,
      expirationDate,
      daysRemaining,
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

import { NextRequest, NextResponse } from "next/server"
import { sendDeletionWarningEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, familyName, deletionDate, daysRemaining } = await request.json()

    if (!email || !displayName || !familyName || !deletionDate || daysRemaining === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await sendDeletionWarningEmail({
      email,
      displayName,
      familyName,
      deletionDate,
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

import { NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, familyName, trialEndsAt } = await request.json()

    if (!email || !displayName || !familyName || !trialEndsAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await sendWelcomeEmail({
      email,
      displayName,
      familyName,
      trialEndsAt,
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

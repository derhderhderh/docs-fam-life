import { NextRequest, NextResponse } from "next/server"
import { sendSubscriptionActivatedEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, familyName, planName } = await request.json()

    if (!email || !displayName || !familyName || !planName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await sendSubscriptionActivatedEmail({
      email,
      displayName,
      familyName,
      planName,
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

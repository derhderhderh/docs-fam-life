import { NextRequest, NextResponse } from "next/server"
import { sendDataDeletedEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, familyName } = await request.json()

    if (!email || !displayName || !familyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await sendDataDeletedEmail({
      email,
      displayName,
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

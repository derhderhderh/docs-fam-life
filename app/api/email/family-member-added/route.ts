import { NextRequest, NextResponse } from "next/server"
import { sendFamilyMemberAddedEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { managerEmail, managerName, memberName, memberEmail, familyName } = await request.json()

    if (!managerEmail || !managerName || !memberName || !memberEmail || !familyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await sendFamilyMemberAddedEmail({
      managerEmail,
      managerName,
      memberName,
      memberEmail,
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

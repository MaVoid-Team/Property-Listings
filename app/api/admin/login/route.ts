import { validateAdminCredentials } from "@/lib/auth/admin"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 })
    }

    const result = await validateAdminCredentials(email, password)

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 401 })
    }

    // Create a simple JWT-like token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ adminId: result.adminId, email })).toString("base64")

    return NextResponse.json({
      success: true,
      token,
      message: "Login successful",
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

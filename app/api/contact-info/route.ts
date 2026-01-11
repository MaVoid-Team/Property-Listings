import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("contact_info").select("*").single()

    if (error) {
      console.error("[v0] Error fetching contact info:", error)
      return NextResponse.json({ message: "Error fetching contact info" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Contact info fetch error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { phone, email, address, hours } = body

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("contact_info")
      .update({
        phone,
        email,
        address,
        hours,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating contact info:", error)
      return NextResponse.json({ message: "Error updating contact info" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Contact info update error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

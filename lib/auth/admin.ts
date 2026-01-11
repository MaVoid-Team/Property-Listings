import bcrypt from "bcryptjs"
import { createClient } from "@/lib/supabase/server"

export interface AdminSession {
  adminId: string
  email: string
  isAdmin: boolean
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function validateAdminCredentials(
  email: string,
  password: string,
): Promise<{ success: boolean; adminId?: string; message: string }> {
  try {
    const supabase = await createClient()

    console.log("[v0] Attempting login for email:", email)

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, email, password_hash")
      .eq("email", email)
      .single()

    if (error) {
      console.log("[v0] Query error:", error.message, error.code)
      if (error.code === "PGRST116") {
        return { success: false, message: "Admin user not found. Please run database setup." }
      }
      return { success: false, message: "Authentication error" }
    }

    if (!admin) {
      console.log("[v0] No admin user found for email:", email)
      return { success: false, message: "Invalid credentials" }
    }

    console.log("[v0] Admin user found, verifying password")
    const passwordValid = await verifyPassword(password, admin.password_hash)

    if (!passwordValid) {
      console.log("[v0] Password verification failed")
      return { success: false, message: "Invalid credentials" }
    }

    console.log("[v0] Login successful for:", email)
    return {
      success: true,
      adminId: admin.id,
      message: "Login successful",
    }
  } catch (error) {
    console.error("[v0] Admin auth error:", error)
    return {
      success: false,
      message: `Authentication error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

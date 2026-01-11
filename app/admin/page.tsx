"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import type { Property, Inquiry } from "@/lib/types"
import { AdminPropertyList } from "@/components/admin-property-list"
import { AdminInquiryList } from "@/components/admin-inquiry-list"
import { AdminContactSettings } from "@/components/admin-contact-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, LogOut } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin-login")
      return
    }
    setIsAuthenticated(true)
    fetchData()
  }, [router])

  async function fetchData() {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data: propsData } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })

      const { data: inquiriesData } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })

      setProperties(propsData || [])
      setInquiries(inquiriesData || [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminEmail")
    router.push("/admin-login")
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your properties, inquiries, and contact information</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/list-property"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              List New Property
            </Link>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="properties" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Properties ({properties.length})</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries ({inquiries.length})</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="mt-6">
            <AdminPropertyList properties={properties} onPropertyDeleted={() => window.location.reload()} />
          </TabsContent>

          <TabsContent value="inquiries" className="mt-6">
            <AdminInquiryList inquiries={inquiries} />
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <AdminContactSettings />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

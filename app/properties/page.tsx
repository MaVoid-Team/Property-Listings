"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { PropertyGrid } from "@/components/property-grid"
import type { Property } from "@/lib/types"

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      let query = supabase
        .from("properties")
        .select(`
          *,
          property_images(*)
        `)
        .eq("status", "available")

      const location = searchParams.get("location")
      if (location) {
        query = query.ilike("address", `%${location}%`)
      }

      const minPrice = searchParams.get("minPrice")
      if (minPrice) {
        query = query.gte("price", Number.parseFloat(minPrice))
      }

      const maxPrice = searchParams.get("maxPrice")
      if (maxPrice) {
        query = query.lte("price", Number.parseFloat(maxPrice))
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (!error) {
        setProperties(data || [])
      }
      setLoading(false)
    }

    fetchProperties()
  }, [searchParams])

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Available Properties</h1>
        <p className="text-lg text-muted-foreground mb-12 text-balance">
          {loading ? "Loading..." : `Found ${properties.length} properties`}
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-muted-foreground">Loading properties...</div>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-4">No properties found</p>
              <a href="/" className="text-primary hover:underline">
                Go back home
              </a>
            </div>
          </div>
        ) : (
          <PropertyGrid properties={properties} />
        )}
      </div>
    </main>
  )
}

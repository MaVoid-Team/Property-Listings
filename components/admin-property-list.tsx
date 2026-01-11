"use client"

import { useState } from "react"
import type { Property } from "@/lib/types"
import { supabase } from "@/lib/supabase/client"
import { Edit2, Trash2, Eye } from "lucide-react"
import Link from "next/link"

interface AdminPropertyListProps {
  properties: Property[]
  onPropertyDeleted: () => void
}

export function AdminPropertyList({ properties, onPropertyDeleted }: AdminPropertyListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return

    setDeleting(id)
    const { error } = await supabase.from("properties").delete().eq("id", id)

    setDeleting(null)
    if (!error) {
      onPropertyDeleted()
    }
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-muted-foreground mb-4">No properties listed yet</p>
        <Link href="/list-property" className="text-primary hover:underline font-semibold">
          Create your first listing
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border">
          <tr>
            <th className="text-left py-4 px-6 font-semibold text-foreground">Title</th>
            <th className="text-left py-4 px-6 font-semibold text-foreground">Price</th>
            <th className="text-left py-4 px-6 font-semibold text-foreground">Type</th>
            <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
            <th className="text-right py-4 px-6 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.id} className="border-b border-border hover:bg-muted/30 transition">
              <td className="py-4 px-6 text-foreground font-medium">{property.title}</td>
              <td className="py-4 px-6 text-foreground font-semibold">${property.price.toLocaleString()}</td>
              <td className="py-4 px-6 text-muted-foreground">{property.property_type}</td>
              <td className="py-4 px-6">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    property.status === "available"
                      ? "bg-green-100/50 text-green-700"
                      : "bg-yellow-100/50 text-yellow-700"
                  }`}
                >
                  {property.status}
                </span>
              </td>
              <td className="py-4 px-6 text-right flex items-center justify-end gap-2">
                <Link
                  href={`/properties/${property.id}`}
                  className="p-2 hover:bg-muted rounded-lg transition text-muted-foreground hover:text-foreground"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  href={`/edit-property/${property.id}`}
                  className="p-2 hover:bg-muted rounded-lg transition text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(property.id)}
                  disabled={deleting === property.id}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition text-muted-foreground hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

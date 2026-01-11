"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { uploadPropertyImage } from "@/lib/blob/client"
import { AlertCircle, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

export default function ListPropertyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadingImages, setUploadingImages] = useState(false)
  const [images, setImages] = useState<{ file: File; preview: string }[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    property_type: "house",
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const preview = URL.createObjectURL(file)
      setImages((prev) => [...prev, { file, preview }])
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in to list a property")
        setLoading(false)
        return
      }

      // Create property
      const { data: property, error: propError } = await supabase
        .from("properties")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            address: formData.address,
            price: Number.parseFloat(formData.price),
            bedrooms: formData.bedrooms ? Number.parseInt(formData.bedrooms) : null,
            bathrooms: formData.bathrooms ? Number.parseInt(formData.bathrooms) : null,
            area: formData.area ? Number.parseFloat(formData.area) : null,
            property_type: formData.property_type,
            status: "available",
            created_by: user.id,
          },
        ])
        .select()

      if (propError || !property) {
        setError("Failed to create property")
        setLoading(false)
        return
      }

      const propertyId = property[0].id

      // Upload images
      if (images.length > 0) {
        setUploadingImages(true)
        for (let i = 0; i < images.length; i++) {
          const { file } = images[i]
          const blobUrl = await uploadPropertyImage(file, propertyId)

          await supabase.from("property_images").insert([
            {
              property_id: propertyId,
              blob_url: blobUrl,
              is_primary: i === 0,
            },
          ])
        }
        setUploadingImages(false)
      }

      router.push(`/properties/${propertyId}`)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">List Your Property</h1>
        <p className="text-muted-foreground mb-8">Fill in the details below to create a new property listing</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Property Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Beautiful 3 Bed Home in Downtown"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property in detail..."
                rows={6}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address *</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, State 12345"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price *</label>
                <input
                  type="number"
                  name="price"
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Property Type *</label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Property Details</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Area (Sq Ft)</label>
                <input
                  type="number"
                  name="area"
                  step="0.01"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Property Images</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-4">Upload Images</label>
              <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition bg-muted/30">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            </div>

            {images.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {images.length} image{images.length !== 1 ? "s" : ""} selected
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative h-24 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={img.preview || "/placeholder.svg"}
                        alt={`Preview ${index}`}
                        fill
                        className="object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive/80 text-white p-1 rounded hover:bg-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading || uploadingImages ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploadingImages ? "Uploading images..." : "Creating listing..."}
              </>
            ) : (
              "Create Listing"
            )}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Your property will be published immediately after creation.
          </p>
        </form>
      </div>
    </main>
  )
}

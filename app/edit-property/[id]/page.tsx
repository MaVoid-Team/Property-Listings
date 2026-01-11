"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { uploadPropertyImage, deletePropertyImage } from "@/lib/blob/client"
import type { Property, PropertyImage } from "@/lib/types"
import { AlertCircle, Loader2, Upload, X, Trash2 } from "lucide-react"
import Image from "next/image"

export default function EditPropertyPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [property, setProperty] = useState<Property | null>(null)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    property_type: "house",
    status: "available",
  })

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      const { data: prop, error: propError } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single()

      const { data: imgs } = await supabase
        .from("property_images")
        .select("*")
        .eq("property_id", propertyId)
        .order("is_primary", { ascending: false })

      if (!propError && prop) {
        setProperty(prop)
        setFormData({
          title: prop.title,
          description: prop.description || "",
          address: prop.address,
          price: prop.price.toString(),
          bedrooms: prop.bedrooms?.toString() || "",
          bathrooms: prop.bathrooms?.toString() || "",
          area: prop.area?.toString() || "",
          property_type: prop.property_type,
          status: prop.status,
        })
      }

      if (imgs) {
        setImages(imgs)
      }

      setLoading(false)
    }

    fetchProperty()
  }, [propertyId])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const preview = URL.createObjectURL(file)
      setNewImages((prev) => [...prev, { file, preview }])
    })
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const newArray = [...prev]
      URL.revokeObjectURL(newArray[index].preview)
      newArray.splice(index, 1)
      return newArray
    })
  }

  const deleteImage = async (imageId: string, blobUrl?: string) => {
    if (!confirm("Delete this image?")) return

    try {
      if (blobUrl) {
        await deletePropertyImage(blobUrl)
      }
      await supabase.from("property_images").delete().eq("id", imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (err) {
      setError("Failed to delete image")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      // Update property
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          title: formData.title,
          description: formData.description,
          address: formData.address,
          price: Number.parseFloat(formData.price),
          bedrooms: formData.bedrooms ? Number.parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? Number.parseInt(formData.bathrooms) : null,
          area: formData.area ? Number.parseFloat(formData.area) : null,
          property_type: formData.property_type,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", propertyId)

      if (updateError) {
        setError("Failed to update property")
        setSaving(false)
        return
      }

      // Upload new images
      if (newImages.length > 0) {
        setUploadingImages(true)
        for (const { file } of newImages) {
          const blobUrl = await uploadPropertyImage(file, propertyId)
          await supabase.from("property_images").insert([
            {
              property_id: propertyId,
              blob_url: blobUrl,
              is_primary: false,
            },
          ])
        }
        setUploadingImages(false)
        setNewImages([])

        // Refresh images
        const { data: updatedImages } = await supabase.from("property_images").select("*").eq("property_id", propertyId)
        if (updatedImages) setImages(updatedImages)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setSaving(false)
      setUploadingImages(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Property not found</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">Edit Property</h1>
        <p className="text-muted-foreground mb-8">Update your property details and images</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-100/50 border border-green-200/50 text-green-700 rounded-lg p-4">
              Property updated successfully!
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
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
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
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
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
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Current Images */}
          {images.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Current Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative h-24 rounded-lg overflow-hidden border border-border group">
                    <Image
                      src={img.blob_url || img.image_url || "/placeholder.svg"}
                      alt="Property"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => deleteImage(img.id, img.blob_url)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Images */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Add Images</h2>

            <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition bg-muted/30">
              <div className="text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>

            {newImages.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {newImages.length} new image{newImages.length !== 1 ? "s" : ""} to upload
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {newImages.map((img, index) => (
                    <div key={index} className="relative h-24 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={img.preview || "/placeholder.svg"}
                        alt={`Preview ${index}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
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
            disabled={saving || uploadingImages}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving || uploadingImages ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploadingImages ? "Uploading images..." : "Saving changes..."}
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </main>
  )
}

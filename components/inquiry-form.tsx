"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Mail, Phone, User } from "lucide-react"

interface InquiryFormProps {
  propertyId: string
  propertyTitle: string
}

export function InquiryForm({ propertyId, propertyTitle }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error: submitError } = await supabase.from("inquiries").insert([
      {
        property_id: propertyId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      },
    ])

    setLoading(false)

    if (submitError) {
      setError("Failed to submit inquiry. Please try again.")
    } else {
      setSubmitted(true)
      setFormData({ name: "", email: "", phone: "", message: "" })
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="text-accent mb-2">✓</div>
        <p className="text-foreground font-semibold mb-2">Inquiry Submitted!</p>
        <p className="text-muted-foreground text-sm">We will contact you shortly about this property.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

      <div className="relative">
        <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          name="name"
          placeholder="Your name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="relative">
        <Phone className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
        <input
          type="tel"
          name="phone"
          placeholder="Your phone (optional)"
          value={formData.phone}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <textarea
        name="message"
        placeholder="Tell us more about your interest..."
        value={formData.message}
        onChange={handleChange}
        rows={4}
        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Send Inquiry"}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        We respect your privacy. Your information is safe with us.
      </p>
    </form>
  )
}

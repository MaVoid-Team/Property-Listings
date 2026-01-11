import { createClient } from "@/lib/supabase/server"
import { PropertyGrid } from "@/components/property-grid"
import { SearchFilters } from "@/components/search-filters"

export default async function Home() {
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from("properties")
    .select(`
      *,
      property_images(*)
    `)
    .eq("status", "available")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("categories").select("*")

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4 text-balance">Find Your Dream Property</h1>
            <p className="text-xl text-muted-foreground text-balance">
              Discover premium properties in your desired location
            </p>
          </div>
          <SearchFilters />
        </div>
      </section>

      {/* Featured Properties Section */}
      {properties && properties.length > 0 && (
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-balance">Featured Properties</h2>
            <PropertyGrid properties={properties} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Looking for something specific?</h2>
          <p className="text-lg text-muted-foreground mb-8 text-balance">
            Browse our complete property listings or contact our team for personalized assistance
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/properties"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              View All Properties
            </a>
            <a
              href="/contact"
              className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

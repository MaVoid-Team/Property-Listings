"use client"

import Link from "next/link"
import { Home, Search, Plus, Mail } from "lucide-react"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition"
        >
          <Home className="w-6 h-6" />
          <span>PropertyHub</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`flex items-center gap-2 transition ${
              isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            href="/properties"
            className={`flex items-center gap-2 transition ${
              isActive("/properties") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="w-4 h-4" />
            Properties
          </Link>
          <Link
            href="/contact"
            className={`flex items-center gap-2 transition ${
              isActive("/contact") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="w-4 h-4" />
            Contact
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="/list-property"
            className="hidden sm:flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">List Property</span>
          </a>
          <a
            href="/admin-login"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold text-sm sm:text-base"
          >
            Admin
          </a>
        </div>
      </div>
    </nav>
  )
}

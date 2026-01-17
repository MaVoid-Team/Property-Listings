"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { isAuthenticated as checkAuth, logout as apiLogout, isAuthenticated } from "@/lib/api/auth"
import { useRouter } from "next/navigation"

interface AuthContextType {
    isAuthenticated: boolean
    isLoading: boolean
    login: (token: string, email: string) => void
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const checkAuthStatus = () => {
        const isAuth = checkAuth()
        setIsAuthenticated(isAuth)
        setIsLoading(false)
    }

    useEffect(() => {
        checkAuthStatus()

        // Add event listener for storage changes to sync across tabs
        const handleStorageChange = () => {
            checkAuthStatus()
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    const login = (token: string, email: string) => {
        // Note: LocalStorage setting is handled by the api/auth.ts login function
        // ensuring we just update state here
        setIsAuthenticated(true)
    }

    const logout = async () => {
        setIsLoading(true)
        try {
            await apiLogout()
            setIsAuthenticated(false)
            router.push("/")
            router.refresh()
        } catch (error) {
            console.error("Logout failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

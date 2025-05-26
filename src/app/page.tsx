/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ModeToggle"
import { FolderOpen } from "lucide-react"

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: "include",
        })
        const data = await res.json()

        console.log(data)
        setIsLoggedIn(data.isLoggedIn)
      } catch (e) {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <FolderOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Foldr</span>
            </Link>

            <div className="flex items-center space-x-4">
              <ModeToggle />
              {isLoggedIn ? (
                <Button asChild>
                  <Link href="/home">Go to Dashboard</Link>
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Your files, <span className="text-primary">everywhere</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Store, sync, and share your files with Foldr. Access your documents, photos, and videos from any device, anywhere in the world.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {isLoggedIn ? (
              <Button size="lg" asChild>
                <Link href="/home">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Foldr</span>
          </div>
          <p className="text-sm text-muted-foreground">Made with ❤️ by nILADRI.</p>
        </div>
      </footer>
    </div>
  )
}

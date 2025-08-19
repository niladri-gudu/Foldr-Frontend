"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""

const UserButton = () => {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      router.push("/sign-in")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>N</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="font-medium text-red-500">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleLogout}
        >
          <div className="flex items-center gap-2 justify-center">
            <LogOut />
            <span>Logout</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserButton

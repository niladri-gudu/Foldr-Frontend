"use client"

import { UserButton } from "@clerk/nextjs"
import { ModeToggle } from "./ModeToggle"
import { SidebarTrigger } from "./ui/sidebar"
import { usePathname } from "next/navigation"

const Navbar = () => {

    const pathname = usePathname()

  return (
    <nav className="p-4 flex items-center justify-between">
      <SidebarTrigger className="cursor-pointer" />
      <div className="flex w-full items-center justify-between ml-4">
        <div>
          {pathname === "/home" && (
            <h1 className="text-2xl">My Drive</h1>
          )}
          {pathname === "/starred" && (
            <h1 className="text-2xl">Favourites</h1>
          )}
          {pathname === "/shared" && (
            <h1 className="text-2xl">Shared with Me</h1>
          )}
          {pathname === "/trash" && (
            <h1 className="text-2xl">Trash</h1>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </nav>
  )
}
export default Navbar
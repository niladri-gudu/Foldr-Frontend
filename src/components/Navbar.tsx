"use client";

import { ModeToggle } from "./ModeToggle";
import { SidebarTrigger } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import UserButton from "./UserButton";

const Navbar = () => {
  const pathname = usePathname();

  const getTitle = () => {
    switch (pathname) {
      case "/home":
        return "My Drive";
      case "/starred":
        return "Favourites";
      case "/shared":
        return "Shared with Me";
      case "/trash":
        return "Trash";
      default:
        return "";
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-white via-indigo-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="cursor-pointer" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-700 dark:text-gray-100">
            {getTitle()}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </nav>
  );
};
export default Navbar;

"use client";

import { Home, Star, Share, Trash, FolderOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Starred",
    url: "/starred",
    icon: Star,
  },
  {
    title: "Shared",
    url: "/shared",
    icon: Share,
  },
  {
    title: "Trash",
    url: "/trash",
    icon: Trash,
  },
];

const AppSidebar = () => {

    const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="my-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="flex items-center gap-2 w-full"
            >
            <Link href="/home" className="flex items-center space-x-2">
              <FolderOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Foldr</span>
            </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url || (pathname.startsWith(item.url) && item.url !== "/");

                return (
                  <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={
                      isActive
                        ? "bg-muted text-gray-900 dark:text-gray-100 font-medium rounded-md"
                        : "text-gray-700 dark:text-gray-400 hover:bg-muted hover:text-gray-900 dark:hover:text-gray-100 rounded-md"
                      }
                    >
                    <Link
                      href={item.url}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                      <item.icon />
                      <span className="">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )})}
            </SidebarMenu>
          </SidebarContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
export default AppSidebar
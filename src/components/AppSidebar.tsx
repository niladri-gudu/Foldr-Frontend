"use client";

import { Home, Star, Share, Trash } from "lucide-react";
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
import Image from "next/image";
import logo from "../../public/cloud_logo.png";

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
    <Sidebar
      collapsible="icon"
      className="border-r bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-md"
    >
      <SidebarHeader className="my-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/home" className="flex items-center gap-3">
                <Image
                  src={logo}
                  alt="Foldr Logo"
                  width={60}
                  height={60}
                  className="rounded-md"
                />
                <span className="text-2xl font-bold tracking-tight">Foldr</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground px-2 mb-2">
            Application
          </SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => {
              const isActive =
                pathname === item.url ||
                (pathname.startsWith(item.url) && item.url !== "/");

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`w-full px-3 py-2 flex items-center gap-4 rounded-md transition-colors duration-200 ${
                      isActive
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-white font-semibold shadow"
                        : "text-muted-foreground hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-gray-700 dark:hover:text-white"
                    }`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-6 h-6" />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;

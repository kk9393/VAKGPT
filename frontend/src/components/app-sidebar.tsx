"use client"

import * as React from "react"
import {
  Clock,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {

  navMain: [
    {
      title: "Sessions",
      url: "#",
      icon: Clock,
      isActive: true,
      items: [
        {
          title: "123",
          url: "#",
        },
        {
          title: "456",
          url: "#",
        }
      ],
    }

  ],
  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

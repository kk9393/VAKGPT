"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import ChatInterface from "./ChatInterface";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function Page() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("light")
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>

          <ChatInterface/>

      </SidebarInset>
    </SidebarProvider>
  )
}

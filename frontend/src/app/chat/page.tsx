"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ChatInterface from "./ChatInterface";

export default function Page() {
  const { setTheme } = useTheme();
  const { login } = useAuth();
  const router = useRouter();

  const generateRandomString = (length: number) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };
  const [selectedSession, setSelectedSession] = useState<string>(
    generateRandomString(20)
  );

  useEffect(() => {
    setTheme("light");
  }, []);
  

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
  
    if (token && !Cookies.get("token")) {
      Cookies.set("token", token, { expires: 7 });
      login(token);
      router.replace("/chat");
    }
  }, [login, router]);
  

  return (
    <SidebarProvider>
      <AppSidebar
        setSelectedSession={setSelectedSession}
        selectedSession={selectedSession}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <ChatInterface selectedSession={selectedSession} />
      </SidebarInset>
    </SidebarProvider>
  );
}

"use client";

import { useAuth } from "@/app/context/AuthContext";
import { NavMain } from "@/components/nav-main";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { loginWithGoogle } from "@/lib/auth";
import { Clock } from "lucide-react";
import { NavUser } from "./nav-user";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

type Session = string;


export function AppSidebar({
  setSelectedSession,
}: {
  setSelectedSession: (sessionId: string) => void;
}) {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = Cookies.get("token");

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/session/get_sessions`,
          {
            method: "GET",
            headers,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }

        const data = await response.json();
        setSessions(data?.sessions || []);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <NavMain
          items={[
            {
              title: "Sessions",
              icon: Clock,
              isActive: true,
              items: sessions.map((session: string) => ({
                title: session, 
                key: session, 
                onClick: () => setSelectedSession(session),
              })),
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter>
        {!user ? (
          <Button onClick={loginWithGoogle} className="w-full">
            Login
          </Button>
        ) : (
          <NavUser user={user} logout={logout} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

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

interface Session {
  session_id: string;
  _id: string;
}

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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sessions`
        );
        const data = await response.json();
        setSessions(data);
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
              url: "#",
              icon: Clock,
              isActive: true,
              items: sessions.map((session) => ({
                title: session.session_id,
                url: "#",
                onClick: () => setSelectedSession(session.session_id),
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

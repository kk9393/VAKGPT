"use client";

import { Clock, LogOut, ChevronsUpDown } from "lucide-react";
import { Sidebar, SidebarContent, SidebarRail, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import { Button } from "@/components/ui/button";
import { loginWithGoogle } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/context/AuthContext";

// Sample Data
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
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />

      {/* Login or User Info at Bottom */}
      <div className="absolute bottom-4 left-0 w-full px-4">
        {!user ? (
          <Button onClick={loginWithGoogle} className="w-full">
            Login
          </Button>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full flex items-center gap-2">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.profile_picture || ""} alt={user.name} />
                      <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{user.email}</span>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="right" align="end">
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user.profile_picture || ""} alt={user.name} />
                        <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.name}</span>
                        <span className="truncate text-xs">{user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={logout} className="text-red-500 hover:text-red-700">
                      <LogOut />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </div>
    </Sidebar>
  );
}

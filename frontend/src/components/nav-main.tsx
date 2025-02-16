import { ChevronRight, Edit, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAuth } from "@/app/context/AuthContext";
import { loginWithGoogle } from "@/lib/auth";
import { Button } from "./ui/button";

export function NavMain({
  items,
  createNewSession,
}: {
  items: {
    title: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      key: string;
      onClick: () => void;
      isSelected?: boolean;
    }[];
  }[];
  createNewSession: () => void;
}) {
  const { user } = useAuth();
  const handleNewChat = () => {
    if (user) {
      createNewSession();
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem className="pb-4" onClick={handleNewChat}>
          {user ? (
            <SidebarMenuButton className="rounded bg-secondary h-full">
              <Edit size={20} />
              <span>New Chat</span>
            </SidebarMenuButton>
          ) : (
            <Dialog>
              <DialogTrigger className="flex items-center gap-2 text-sm w-full rounded bg-secondary m-2 p-2">
                <Edit size={20} />
                <span>New Chat</span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Chat Session?</DialogTitle>
                  <DialogDescription>
                    Log in to initiate a new chat session and preserve your
                    conversation history.
                  </DialogDescription>
                  <Button onClick={loginWithGoogle} className="w-full">
                    Login
                  </Button>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}
        </SidebarMenuItem>

        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem
                      key={subItem.key}
                      className={`cursor-pointer ${
                        subItem.isSelected ? "bg-gray-200 dark:bg-gray-700" : ""
                      }`}
                    >
                      <SidebarMenuSubButton asChild>
                        <span onClick={subItem.onClick}>
                          <span>{subItem.title}</span>
                        </span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

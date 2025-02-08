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
import { useAuth } from "@/app/context/AuthContext";

export function NavMain({
  items,
  createNewSession, // ✅ Receive function as prop
}: {
  items: {
    title: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      key: string;
      onClick: () => void;
      isSelected?: boolean; // ✅ Track selected state
    }[];
  }[];
  createNewSession: () => void;
}) {
  const { user } = useAuth();

  const handleNewChat = () => {
    if (user) {
      createNewSession(); // ✅ Create a new session
    } else {
      // open login modal
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem className="pb-4" onClick={handleNewChat}>
          <SidebarMenuButton
            className="rounded bg-secondary h-full"
            tooltip={"New Chat"}
          >
            <Edit />
            <span>New Chat</span>
          </SidebarMenuButton>
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
                        subItem.isSelected
                          ? "bg-gray-200 dark:bg-gray-700" // ✅ Highlight selected session
                          : ""
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

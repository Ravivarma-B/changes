"use client";

import { Avatar, AvatarFallback, AvatarImage } from "web-utils-components/avatar";
import { Button } from "web-utils-components/button";
import { ScrollArea } from "web-utils-components/scroll-area";
import {
  CircleUser,
  DoorClosed,
  FileJson,
  LayoutDashboard,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  DecisionLogoIcon,
  SideFileBoxIcon,
  SidePositionsIcon,
  SideScanSearchIcon,
  SideSegmentsIcon,
  SideWorkflowIcon,
} from "../svgs/default";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "web-utils-components/tooltip";
import SidePanelUserMenu from "./SidePanelUserMenu";

export function SidePanel() {
  // Navigation items data for mapping
  const navigationItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      link: "/dashboard",
      label: "Dashboard",
    },
    {
      icon: <SidePositionsIcon />,
      link: "/positions",
      label: "Positions",
    },
    {
      icon: <DoorClosed className="w-5 h-5" />,
      link: "/departments",
      label: "Departments",
    },
    {
      icon: <UserCog className="w-5 h-5" />,
      link: "/roles",
      label: "Roles",
    },
    {
      icon: <CircleUser className="w-5 h-5" />,
      link: "/users",
      label: "Users",
    },
    { icon: <Users className="w-5 h-5" />, link: "/groups", label: "Groups" },
    {
      icon: <SideWorkflowIcon />,
      link: "/workflows",
      label: "Workflows",
    },
    {
      icon: <SideFileBoxIcon />,
      link: "/entity-types",
      label: "Entity Types",
    },
    {
      icon: <FileJson className="w-5 h-5" />,
      link: "/document-types",
      label: "Document Types",
    },
    {
      icon: <SideSegmentsIcon />,
      link: "/segment-types",
      label: "Segment Types",
    },
    {
      icon: <SideScanSearchIcon />,
      link: "/lookups",
      label: "Lookups",
    },
  ];
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-12 h-dvh bg-blue-800">
      {/* Header with logo */}
      <header className="flex items-center justify-center p-2.5 w-full">
        <DecisionLogoIcon />
      </header>
      {/* Navigation items */}
      <ScrollArea className="flex-1 w-full">
        <TooltipProvider delayDuration={200}>
          <div className="flex flex-col items-center py-2">
            {navigationItems.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link href={item.link}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`w-9 h-9 text-white hover:bg-[#172554] hover:text-white rounded-md my-1 cursor-pointer ${
                        pathname === item.link ? "bg-[#172554]" : ""
                      } 
              dark:text-foreground dark:hover:text-muted-foreground
              dark:hover:bg-muted 
              ${
                pathname === item.link ? "dark:bg-muted dark:text-primary" : ""
              } `}
                      aria-label={item.label}
                    >
                      {item.icon}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-sm">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </ScrollArea>
      {isUserMenuOpen && (
        <div className="fixed z-[11] bottom-[60px] left-[20px]">
          <SidePanelUserMenu />
        </div>
      )}
      {/* Footer with user avatar */}
      <footer
        className="flex justify-center p-3 bg-blue-950 cursor-pointer"
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src="" alt="User profile" />
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            US
          </AvatarFallback>
        </Avatar>
      </footer>
    </div>
  );
}

import { Avatar, AvatarFallback } from "web-utils-components/avatar";
import { Button } from "web-utils-components/button";
import { Card, CardContent } from "web-utils-components/card";
import { Separator } from "web-utils-components/separator";
import { Switch } from "web-utils-components/switch";
import { ChevronRight, CircleUser, LogOut, MessageSquare, Settings as SettingsIcon, User } from "lucide-react";
import { ThemeToggle } from "../theme/theme-toggle";
import { useUser } from "web-utils-components/UserContext";

export default function SidePanelUserMenu() {
  const user = useUser();

  // Menu sections data
  const accountMenuItems = [
    { icon: <User className="w-4 h-4" />, label: "Profile" },
    { icon: <MessageSquare className="w-4 h-4" />, label: "Chat" },
    { icon: <SettingsIcon className="w-4 h-4" />, label: "Settings" },
  ];

  return (
    <Card className="flex flex-col min-w-32 w-64 items-start gap-3 p-3 border border-solid border-slate-200 shadow-none">
      {/* User Profile Section */}
      <div className="flex items-center justify-between p-2 relative self-stretch w-full rounded-md">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <Avatar className="w-8 h-8 bg-slate-100">
            <AvatarFallback>MA</AvatarFallback>
          </Avatar>

          <div className="flex flex-col justify-center self-stretch">
            <div className="self-stretch mt-[-1.00px] font-text-sm-leading-normal-semibold text-primary text-[length:var(--text-sm-leading-normal-semibold-font-size)] tracking-[var(--text-sm-leading-normal-semibold-letter-spacing)] leading-[var(--text-sm-leading-normal-semibold-line-height)]">
              {user.name}
            </div>

            <div className="self-stretch font-text-xs-leading-normal-normal text-slate-500 text-[length:var(--text-xs-leading-normal-normal-font-size)] tracking-[var(--text-xs-leading-normal-normal-letter-spacing)] leading-[var(--text-xs-leading-normal-normal-line-height)]">
              User ID: {user.id}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8 shadow-shadow-xs"
          onClick={() => (window.location.href = `/api/admin/auth/logout?returnUrl=${encodeURIComponent(window.location.href)}`)}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Role Section */}
      <div className="flex-col items-start flex relative self-stretch w-full">
        <div className="items-center px-2 py-3 flex relative self-stretch w-full">
          <div className="w-fit mt-[-1.00px] font-text-xss-mono text-slate-500 text-[length:var(--text-xss-mono-font-size)] tracking-[var(--text-xss-mono-letter-spacing)] leading-[var(--text-xss-mono-line-height)]">
            MY ROLE
          </div>
        </div>

        <CardContent className="flex flex-col w-full items-start p-0">
          <Button variant="ghost" className="h-8 w-full justify-start gap-2 p-2 rounded">
            <CircleUser className="w-4 h-4" />
            <span className="flex-1 font-text-sm-leading-none-medium text-slate-950 dark:text-slate-50 text-[length:var(--text-sm-leading-none-medium-font-size)] tracking-[var(--text-sm-leading-none-medium-letter-spacing)] leading-[var(--text-sm-leading-none-medium-line-height)] overflow-hidden text-ellipsis whitespace-nowrap text-left">
              {user.username}
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </div>

      <Separator className="w-full h-px" />

      {/* Account Section */}
      <div className="flex-col items-start flex relative self-stretch w-full">
        <div className="items-center px-2 py-3 flex relative self-stretch w-full">
          <div className="w-fit mt-[-1.00px] font-text-xss-mono text-slate-500 text-[length:var(--text-xss-mono-font-size)] tracking-[var(--text-xss-mono-letter-spacing)] leading-[var(--text-xss-mono-line-height)]">
            MY ACCOUNT
          </div>
        </div>

        <CardContent className="flex flex-col items-start p-0 w-full">
          {accountMenuItems.map((item, index) => (
            <Button key={index} variant="ghost" className="h-8 w-full justify-start gap-2 p-2 rounded">
              {item.icon}
              <span className="flex-1 font-text-sm-leading-none-medium text-slate-950 dark:text-slate-50 text-[length:var(--text-sm-leading-none-medium-font-size)] tracking-[var(--text-sm-leading-none-medium-letter-spacing)] leading-[var(--text-sm-leading-none-medium-line-height)] overflow-hidden text-ellipsis whitespace-nowrap text-left">
                {item.label}
              </span>
            </Button>
          ))}
        </CardContent>
      </div>

      <Separator className="w-full h-px" />

      {/* Appearance Settings Section */}
      <div className="flex-col items-start flex relative self-stretch w-full">
        <div className="items-center px-2 py-3 flex relative self-stretch w-full">
          <div className="w-fit mt-[-1.00px] font-text-xss-mono text-slate-500 text-[length:var(--text-xss-mono-font-size)] tracking-[var(--text-xss-mono-letter-spacing)] leading-[var(--text-xss-mono-line-height)]">
            APPEARANCE SETTINGS
          </div>
        </div>

        <CardContent className="gap-1.5 px-1 py-2 flex flex-col items-start w-full">
          <div className="flex items-center w-full">
            <div className="flex w-full items-center gap-2 px-2 py-1.5 rounded">
              <div className="flex-1 mt-[-1.00px] font-text-sm-leading-normal-normal text-slate-950 dark:text-slate-50 text-[length:var(--text-sm-leading-normal-normal-font-size)] tracking-[var(--text-sm-leading-normal-normal-letter-spacing)] leading-[var(--text-sm-leading-normal-normal-line-height)] overflow-hidden text-ellipsis whitespace-nowrap">
                Theme
              </div>
              <Switch defaultChecked className="bg-blue-600" />
            </div>
          </div>

          <div className="flex items-center w-full">
            <div className="flex flex-1 items-center gap-2 px-2 py-1.5 rounded">
              <div className="flex-1 mt-[-1.00px] font-text-sm-leading-normal-normal text-slate-950 dark:text-slate-50 text-[length:var(--text-sm-leading-normal-normal-font-size)] tracking-[var(--text-sm-leading-normal-normal-letter-spacing)] leading-[var(--text-sm-leading-normal-normal-line-height)] overflow-hidden text-ellipsis whitespace-nowrap">
                Mode
              </div>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

"use client";
import { LanguageSelector } from "@/components/template/LanguageSelector";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Separator } from "web-utils-components/separator";
import { SidePanel } from "./SidePanel";
import { ChevronLeft } from "lucide-react";
import { Button } from "web-utils-components/button";

export function AdminLayout({
  children,
  enableBackButton = false,
}: {
  children: React.ReactNode;
  enableBackButton?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");
  const { t } = useTranslation();

  return (
    <div className="flex min-w-[480px] min-h-screen items-start relative bg-slate-100 dark:bg-background dark:text-foreground">
      {/* Sidebar */}
      <SidePanel />
      <div className="flex flex-col items-start relative flex-1 self-stretch grow z-0">
        {/* Header with Back Button and Title */}
        <div className="flex w-full h-[45px] items-center justify-between gap-3 px-6 py-2 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <Separator orientation="vertical" className="w-px !h-[29px] bg-slate-200"/>
            { !isDashboard && (<Button onClick={() => router.push(`/dashboard`)} size="sm" className="cursor-pointer w-5 h-5 p-0 bg-blue-600 hover:bg-blue-700 rounded-md shadow-shadow-xs flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4 text-white" />
              </Button>
            )}
            <header className="flex flex-col items-start gap-1.5">
              <h1 className="font-medium text-primary text-base leading-6">
                {t("Admin Dashboard")}
              </h1>
            </header>
          </div>
          <div className="flex flex-row items-center gap-3">
            <LanguageSelector />
          </div>
        </div>
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}

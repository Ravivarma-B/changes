/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import ThemeToggle from "./theme-toggle";

export function AdminLayout({
  children,
  enableBackButton = false,
}: {
  children: React.ReactNode;
  enableBackButton?: boolean;
}) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex min-w-[480px] min-h-screen items-start relative bg-slate-100 dark:bg-background dark:text-foreground">
      {/* Sidebar */}
      {/* <SidePanel /> */}
      <div className="flex flex-col items-start relative flex-1 self-stretch grow z-0">
        {/* Header with Back Button and Title */}
        <div className="flex w-full h-[45px] items-center justify-between gap-3 px-6 py-2 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <Separator orientation="vertical" className="h-full" />
            <header className="flex flex-col items-start gap-1.5">
              <h1 className="font-medium text-primary text-base leading-6">
                {t("Admin Panel")}
              </h1>
            </header>
          </div>
          <div className="flex flex-row items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}

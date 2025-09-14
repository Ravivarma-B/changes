"use client";

import { DynamicIcon } from "lucide-react/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { SpinnerCircular } from "spinners-react";

export interface UserIcon {
  key: string;
  name: string;
  url: string;
}

interface IconButtonProps {
  icon: string; // lucide name or user icon key
  isUserIcon?: boolean;
  size?: number;
  className?: string;
}

export function Icon({
  icon,
  size = 20,
  className = "",
  isUserIcon,
}: IconButtonProps) {
  console.log(isUserIcon);
  const [userIcon, setUserIcon] = useState<UserIcon | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user icon if needed
  useEffect(() => {
    if (!isUserIcon) return;

    async function fetchUserIcon() {
      try {
        setIsLoading(true);
        const res = await fetch(`/admin/api/upload-icon?name=${icon}`);
        setIsLoading(false);
        if (!res.ok) throw new Error("Icon not found");
        const data: UserIcon = await res.json();
        setUserIcon(data);
      } catch (err) {
        console.warn("Failed to load user icon:", err);
      }
    }

    fetchUserIcon();
  }, [icon, isUserIcon]);

  const source = useMemo(() => (isUserIcon ? "user" : "lucide"), [isUserIcon]);

  return (
    <>
      {!isLoading && (
        <span className={className}>
          {source === "lucide" && (
            <DynamicIcon
              name={icon as never}
              style={{ width: size, height: size }}
            />
          )}
          {source === "user" && userIcon && (
            <Image
              src={userIcon.url}
              alt={userIcon.name}
              width={size}
              height={size}
            />
          )}
        </span>
      )}
      {isLoading && <SpinnerCircular className="!w-4 h-4 mr-2" />}
    </>
  );
}

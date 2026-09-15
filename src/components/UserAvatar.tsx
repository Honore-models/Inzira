"use client";

import { useSession } from "next-auth/react";
import { getPhotoUrl } from "@/lib/photos";

const SIZES = ["sm", "md", "lg"] as const;

export type UserAvatarSize = (typeof SIZES)[number];

/**
 * Professional profile avatar for the dashboards.
 * Priority: session photo → known staff photo → colored initials.
 */
export function UserAvatar({
  size = "md",
  className = "",
}: {
  size?: UserAvatarSize;
  className?: string;
}) {
  const { data: session } = useSession();
  const name = session?.user?.name || "User";
  const email = session?.user?.email;
  const photo = session?.user?.image || getPhotoUrl(email) || null;

  const sizeClass = SIZES.includes(size) ? size : "md";

  return (
    <span className={`profile-avatar ${sizeClass} ${className}`.trim()}>
      {photo ? (
        <img src={photo} alt={name} />
      ) : (
        <span aria-hidden="true">
          {name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase() || "U"}
        </span>
      )}
    </span>
  );
}

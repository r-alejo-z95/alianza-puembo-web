"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AuthorAvatar({ profile, className = "h-8 w-8" }) {
  const getInitials = (name, email) => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "?";
  };

  const name = profile?.full_name || profile?.email || "Desconocido";
  const initials = getInitials(profile?.full_name, profile?.email);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className={className}>
            <AvatarFallback className="text-white bg-(--puembo-black) text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>Autor: {name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  className?: string;
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingIndicator({ className, text = "Processing...", size = "md" }: LoadingIndicatorProps) {
  const iconSize = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }[size];

  const textSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }[size];

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2 py-8", className)}>
      <Loader2 className={cn(iconSize, "animate-spin text-primary")} />
      {text && <p className={cn(textSize, "text-muted-foreground")}>{text}</p>}
    </div>
  );
}

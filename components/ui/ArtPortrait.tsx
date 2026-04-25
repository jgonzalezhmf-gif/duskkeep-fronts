"use client";

import { cn } from "@/lib/cn";

export default function ArtPortrait({
  src,
  alt,
  className,
  imgClassName,
  fallback,
  priority,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback?: React.ReactNode;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn("h-full w-full object-cover object-top", imgClassName)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_24%,rgba(255,255,255,0.12),rgba(255,255,255,0.04)_38%,rgba(0,0,0,0.28)_100%)] text-white/80">
          {fallback}
        </div>
      )}
    </div>
  );
}

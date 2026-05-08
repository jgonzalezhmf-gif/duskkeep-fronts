"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function VisualAssetImage({
  src,
  fallbackSrc,
  alt,
  className,
  imgClassName,
  fallback,
}: {
  src?: string | null;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback?: ReactNode;
}) {
  const initialSrc = src ?? fallbackSrc ?? null;
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(initialSrc);
  const [failed, setFailed] = useState(initialSrc === null);

  useEffect(() => {
    const nextSrc = src ?? fallbackSrc ?? null;
    setResolvedSrc(nextSrc);
    setFailed(nextSrc === null);
  }, [fallbackSrc, src]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {resolvedSrc && !failed ? (
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={imgClassName}
          onError={() => {
            if (fallbackSrc && resolvedSrc !== fallbackSrc) {
              setResolvedSrc(fallbackSrc);
              return;
            }
            setFailed(true);
          }}
        />
      ) : (
        fallback ?? null
      )}
    </div>
  );
}

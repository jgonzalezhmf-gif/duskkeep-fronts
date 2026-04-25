import "./globals.css";
import type { Metadata, Viewport } from "next";
import AppShell from "@/components/ui/AppShell";

export const metadata: Metadata = {
  title: "Fortress Tactics (Branch)",
  description: "Turn-based tactical squad game. Collect heroes, forge your fortress.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b0d12",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-bg text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

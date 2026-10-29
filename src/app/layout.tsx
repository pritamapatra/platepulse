import "@/lib/env";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlatePulse",
  description: "Daily cash, UPI and supplier tracking for small restaurants",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

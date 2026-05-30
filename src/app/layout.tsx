import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0F4C81",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Sardarji RO | Customer Portal",
  description: "Manage your RO services seamlessly.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sardarji RO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50 flex flex-col relative w-full">
          {children}
        </div>
      </body>
    </html>
  );
}

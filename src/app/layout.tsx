import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import InstallPrompt from "@/components/ui/InstallPrompt";

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
  manifest: "/manifest.json",
  icons: {
    icon: "/Sardarji_RO_logo.png",
  },
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
        <Toaster position="top-center" toastOptions={{ className: 'text-sm font-bold', style: { borderRadius: '16px', padding: '16px 24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' } }} />
        <div className="min-h-screen bg-slate-50 flex flex-col relative w-full">
          {children}
        </div>
        <InstallPrompt />
      </body>
    </html>
  );
}

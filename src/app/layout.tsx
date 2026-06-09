import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Admin Dashboard | SardarJi RO",
  description: "Administrative portal for SardarJi RO",
};

import { Toaster } from "react-hot-toast";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js" strategy="beforeInteractive" />
        <Toaster position="top-center" toastOptions={{ className: 'text-sm font-bold', style: { borderRadius: '16px', padding: '16px 24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' } }} />
        {children}
      </body>
    </html>
  );
}

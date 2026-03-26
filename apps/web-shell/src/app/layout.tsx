import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import ProgressBar from "@/components/layout/ProgressBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NGCMS | Next-Gen College Management System",
  description: "Advanced AI-native college ERP platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="font-utility bg-surface text-on-surface flex min-h-screen overflow-hidden"
        suppressHydrationWarning
      >
        <ProgressBar />
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-surface p-6 custom-scrollbar">
          {children}
        </main>
      </body>
    </html>
  );
}

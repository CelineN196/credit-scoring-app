import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VTI Credit AI Pro",
  description: "Intelligence Risk Assessment System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617] text-white min-h-screen`}
      >
        <nav className="bg-[#020617] border-b border-slate-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-black tracking-tighter italic text-indigo-400 uppercase">
                VTI Credit AI Pro
              </Link>
              <span className="text-[10px] font-bold text-slate-500 tracking-[0.4em] uppercase">
                Intelligence Risk Assessment
              </span>
            </div>
            <div className="flex space-x-6">
              <Link 
                href="/" 
                className="text-slate-300 hover:text-indigo-400 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-800/50"
              >
                Analyzer
              </Link>
              <Link 
                href="/history" 
                className="text-slate-300 hover:text-indigo-400 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-800/50"
              >
                History
              </Link>
              <Link 
                href="/stats" 
                className="text-slate-300 hover:text-indigo-400 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-800/50"
              >
                Statistics
              </Link>
            </div>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

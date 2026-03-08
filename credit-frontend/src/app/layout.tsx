import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link"; // <-- CỨU TINH Ở ĐÂY: Fix lỗi Link
import ThemeToggle from "./ThemeToggle"; // Kiểm tra lại tên file là ThemeToggle hay themetoggle nhé
import { ThemeProvider } from "next-themes";
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
    // Thêm suppressHydrationWarning để tránh lỗi báo đỏ ở console trình duyệt
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900 dark:bg-[#05070a] dark:text-slate-100 min-h-screen transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-2xl font-black tracking-tighter italic text-indigo-600 dark:text-indigo-400 uppercase">
                  VTI Credit AI Pro
                </Link>
                <span className="hidden md:inline text-[10px] font-bold text-slate-500 tracking-[0.4em] uppercase">
                  Intelligence Risk Assessment
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/" 
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  Analyzer
                </Link>
                <Link 
                  href="/history" 
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  History
                </Link>
                <Link 
                  href="/stats" 
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  Statistics
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </nav>
          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
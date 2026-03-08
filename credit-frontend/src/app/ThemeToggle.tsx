"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Đảm bảo component đã "mounted" trên trình duyệt
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-2 w-10 h-10" />; // Khoảng trống giả lập khi chưa load xong

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-slate-800 dark:bg-slate-200 hover:opacity-80 transition-colors"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
}
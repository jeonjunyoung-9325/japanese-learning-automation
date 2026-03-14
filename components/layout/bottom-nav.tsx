"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "홈" },
  { href: "/lessons", label: "레슨" },
  { href: "/review", label: "복습" },
  { href: "/profile", label: "프로필" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto mb-4 w-[calc(100%-2rem)] max-w-md rounded-[28px] border border-white/10 bg-stone-950/90 p-2 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href as Route} className={`rounded-2xl px-3 py-3 text-center text-sm ${active ? "bg-orange-400 font-semibold text-stone-950" : "text-stone-300"}`}>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Navbar = () => {
  const { data: session } = useSession() as any;
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/roadmap-chat", label: "Our Services" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/reports", label: "Reports" },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="fixed left-1/2 top-4 z-50 w-full max-w-5xl -translate-x-1/2 px-4 font-sans"
    >
      <div
        className="flex items-center justify-between rounded-2xl border border-white/10 
        bg-gradient-to-r from-gray-900/60 via-gray-800/40 to-gray-900/60 
        shadow-2xl backdrop-blur-2xl px-4 py-3 transition-all duration-500"
      >
        {/* --- Logo --- */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-1 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <div className="w-2 h-2 rounded-full bg-white opacity-70"></div>
            <div className="w-2 h-2 rounded-full bg-white opacity-50"></div>
          </div>
          <span className="text-lg font-bold tracking-tight bg-white bg-clip-text text-transparent">
            NeuraView.AI
          </span>
        </Link>

        {/* --- Navigation Links --- */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative text-sm transition-all duration-300 ${
                  isActive
                    ? "white font-semibold"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </div>

        {/* --- Auth Buttons --- */}
        <div className="flex items-center gap-3">
          {session?.user?.id ? (
            <>
              <Link
                href="/create-interview"
                className="rounded-lg px-4 py-2 text-xs font-semibold 
                text-white bg-gradient-to-r from-green-600 to-emerald-500 
                hover:from-green-500 hover:to-emerald-400 transition-all shadow-lg shadow-green-600/20 
                hover:shadow-green-400/40 duration-300"
              >
                Start Interview
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-white/20 px-4 py-2 text-xs 
                font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 
                text-xs font-semibold text-black px-4 py-2 shadow-md hover:opacity-90 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

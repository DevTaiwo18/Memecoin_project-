'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface NavbarProps {
  backLink?: boolean;
}

export default function Navbar({ backLink }: NavbarProps) {
  const { data: session, status } = useSession();

  return (
    <div className="border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={28} />
          <span className="font-bold text-white tracking-tight text-sm md:text-base">PumpRadar</span>
        </Link>
        {backLink && (
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {status === 'loading' ? (
          <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
        ) : session ? (
          <>
            <Link href="/account" className="flex items-center hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {session.user?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U'}
              </div>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="cursor-pointer text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            href="/sign-in"
            className="text-xs font-semibold px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}

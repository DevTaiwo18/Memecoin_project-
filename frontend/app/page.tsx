'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Logo from '@/components/Logo';

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#080810] text-white flex flex-col">

      {/* Nav */}
      <div className="border-b border-white/5 px-4 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <span className="font-bold text-white tracking-tight text-sm md:text-base">PumpRadar</span>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" className="cursor-pointer text-xs font-semibold px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all">
              Dashboard
            </Link>
          ) : (
            <Link href="/sign-in" className="cursor-pointer text-xs font-semibold px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20 md:py-28">

        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-xs text-cyan-400 font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          Live Solana memecoin tracking
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight max-w-3xl">
          Know when to buy <span className="text-cyan-400">before</span> the pump
        </h1>

        <p className="text-gray-400 text-base md:text-lg max-w-xl mb-10 leading-relaxed">
          We track Solana memecoins in real time and tell you exactly when to get in, before the price explodes.
          No trading experience needed.
        </p>

        {session ? (
          <Link href="/dashboard" className="cursor-pointer flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-8 rounded-2xl transition-all text-sm">
            See live signals
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        ) : (
          <Link href="/sign-in" className="cursor-pointer flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-8 rounded-2xl transition-all text-sm">
            Get Started — it&apos;s free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        )}
      </div>

      {/* Features */}
      <div className="px-4 md:px-10 pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white/3 border border-white/6 rounded-2xl p-6">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Buy Now signals</h3>
            <p className="text-gray-500 text-xs leading-relaxed">We detect coins gaining momentum on 5m and 1h but not yet pumped on 24h — that&apos;s your window.</p>
          </div>

          <div className="bg-white/3 border border-white/6 rounded-2xl p-6">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Safety scoring</h3>
            <p className="text-gray-500 text-xs leading-relaxed">Every coin gets a safety score based on liquidity and buy/sell ratio so you can avoid rugs.</p>
          </div>

          <div className="bg-white/3 border border-white/6 rounded-2xl p-6">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Telegram alerts</h3>
            <p className="text-gray-500 text-xs leading-relaxed">Get notified the moment a coin flips to &quot;Buy Now&quot; — straight to your Telegram, no need to check the app.</p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 px-4 py-5 text-center text-xs text-gray-700">
        Not financial advice. Memecoins are high-risk — only invest what you can afford to lose.
      </div>

    </div>
  );
}

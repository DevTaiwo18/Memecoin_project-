'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Logo from '@/components/Logo';

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#080810] text-white flex flex-col">

      {/* Nav */}
      <nav className="px-6 md:px-12 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <span className="font-bold text-white tracking-tight">PumpRadar</span>
        </div>
        {session ? (
          <Link href="/dashboard" className="text-xs font-semibold px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all">
            Dashboard
          </Link>
        ) : (
          <Link href="/sign-in" className="text-xs font-semibold px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all">
            Sign In
          </Link>
        )}
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-xs text-cyan-400 font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          Live on Solana
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl mb-6">
          Know when to buy{' '}
          <span className="text-cyan-400">before</span>{' '}
          the pump
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          PumpRadar tracks Solana memecoins in real time, scores them for momentum and safety, and tells you exactly when to get in, before the price explodes.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          {session ? (
            <Link href="/dashboard" className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3.5 px-8 rounded-2xl transition-all">
              See live signals
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3.5 px-8 rounded-2xl transition-all">
                Get started free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/sign-in" className="text-sm text-gray-400 hover:text-white transition-all">
                Sign in with Google →
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          <div className="bg-[#080810] px-8 py-8 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Buy Now signals</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Coins gaining on 5m and 1h but not yet pumped on 24h. That&apos;s your entry window.</p>
            </div>
          </div>
          <div className="bg-[#080810] px-8 py-8 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Rug protection</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Every coin gets a safety score based on liquidity and buy/sell ratio. Avoid scams before they happen.</p>
            </div>
          </div>
          <div className="bg-[#080810] px-8 py-8 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Telegram alerts</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Buy Now, take profit at +10% to +200%, and sell alerts, all instant on Telegram.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4">How it works</p>
          <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-16">Three steps. No experience needed.</h2>

          <div className="flex flex-col gap-12">
            <div className="flex gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm flex items-center justify-center shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-2">We scan the market every 5 minutes</h3>
                <p className="text-gray-500 leading-relaxed">PumpRadar pulls live data on 100+ Solana memecoins, price, volume, liquidity, and transaction counts, around the clock.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm flex items-center justify-center shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-2">Our engine scores every coin</h3>
                <p className="text-gray-500 leading-relaxed">A safety score flags potential rugs. A momentum score identifies coins heating up on the 5m and 1h timeframes, before the 24h chart shows anything.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm flex items-center justify-center shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-2">You get the signal on Telegram</h3>
                <p className="text-gray-500 leading-relaxed">The moment a coin hits Buy Now, you get an alert. Track your holding and receive take profit alerts at every milestone, and a sell alert if the signal turns bad.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      {!session && (
        <section className="px-6 md:px-12 pb-24">
          <div className="max-w-4xl mx-auto bg-linear-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-3xl p-10 md:p-16 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Start catching pumps today</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">Free to use. Sign in with Google, connect Telegram, and let PumpRadar do the work.</p>
            <Link href="/sign-in" className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-4 px-10 rounded-2xl transition-all text-base">
              Get started, it&apos;s free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6 text-center text-xs text-gray-700">
        Not financial advice. Memecoins are high-risk. Only invest what you can afford to lose.
      </footer>

    </div>
  );
}

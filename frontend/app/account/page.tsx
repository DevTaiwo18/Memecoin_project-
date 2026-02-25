'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chatId, setChatId] = useState('');
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/sign-in');
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;
    const google_id = (session.user as { google_id?: string }).google_id;
    if (!google_id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${google_id}`)
      .then(r => r.json())
      .then(data => { if (data.data?.telegram_chat_id) setConnected(true); })
      .catch(() => {});
  }, [session]);

  async function connectTelegram() {
    const google_id = (session?.user as { google_id?: string })?.google_id;
    if (!google_id || !chatId.trim()) return;
    setTelegramStatus('loading');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/connect-telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_id, telegram_chat_id: chatId.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTelegramStatus('success');
        setConnected(true);
      } else {
        setTelegramStatus('error');
      }
    } catch {
      setTelegramStatus('error');
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 md:px-8 py-10">

        <div className="flex items-center gap-3 mb-6">
          <a href="/dashboard" className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </a>
        </div>

        <h1 className="text-2xl font-bold text-white mb-6">My Account</h1>

        {/* Profile card */}
        <div className="bg-white/3 border border-white/8 rounded-3xl p-6 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-cyan-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
              {session.user?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U'}
            </div>
            <div>
              <div className="font-semibold text-white text-base">{session.user?.name}</div>
              <div className="text-gray-500 text-sm">{session.user?.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
              <div className="text-gray-500 text-xs mb-1">Signed in with</div>
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </div>
            </div>

            {/* Telegram card */}
            <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
              <div className="text-gray-500 text-xs mb-2">Telegram alerts</div>

              {connected ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-emerald-400 text-sm font-medium">Connected — Buy Now alerts are active</span>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                    1. Open Telegram and start <span className="text-white font-medium">@PumpRadar_bot</span><br />
                    2. Send <span className="font-mono text-cyan-400">/start</span> — the bot will reply with your Chat ID<br />
                    3. Paste your Chat ID below
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatId}
                      onChange={e => setChatId(e.target.value)}
                      placeholder="Your Telegram Chat ID"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
                    />
                    <button
                      onClick={connectTelegram}
                      disabled={telegramStatus === 'loading' || !chatId.trim()}
                      className="cursor-pointer px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-sm font-medium transition-all"
                    >
                      {telegramStatus === 'loading' ? '...' : 'Connect'}
                    </button>
                  </div>
                  {telegramStatus === 'error' && (
                    <p className="text-red-400 text-xs mt-2">Something went wrong. Check your Chat ID and try again.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="cursor-pointer w-full text-sm font-medium py-3 px-5 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

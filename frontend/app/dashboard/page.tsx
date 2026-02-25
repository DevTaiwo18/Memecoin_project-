'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';


interface Metric {
  price: number;
  volume: number;
  liquidity: number;
  price_change_5m: number;
  price_change_1h: number;
  price_change_24h: number;
  txns_buys: number;
  txns_sells: number;
}

interface Score {
  safety_score: number;
  momentum_score: number;
  composite_score: number;
  signal: string;
}

interface Coin {
  coin_id: string;
  name: string;
  symbol: string;
  image_url: string;
  metric: Metric;
  score: Score;
}

function PriceChange({ value }: { value: number }) {
  if (value === undefined || value === null) return <span className="text-gray-600">N/A</span>;
  const color = value >= 0 ? 'text-emerald-400' : 'text-red-400';
  const sign = value >= 0 ? '+' : '';
  return <span className={`font-medium ${color}`}>{sign}{value.toFixed(2)}%</span>;
}

const SIGNAL_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Buy Now':       { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
  'Keep Watching': { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/30',     dot: 'bg-sky-500' },
  'Too Late':      { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30',   dot: 'bg-amber-500' },
  'Avoid':         { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/30',     dot: 'bg-red-500' },
  'Likely Rug':    { bg: 'bg-red-900/20',     text: 'text-red-300',     border: 'border-red-700/40',     dot: 'bg-red-700' },
};

function SignalBadge({ signal }: { signal: string }) {
  if (!signal) return null;
  const cfg = SIGNAL_CONFIG[signal] || { bg: 'bg-gray-800', text: 'text-gray-400', border: 'border-gray-700', dot: 'bg-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {signal}
    </span>
  );
}

function ScoreBar({ value }: { value: number }) {
  if (value === undefined || value === null) return <span className="text-gray-600 text-xs">N/A</span>;
  const textColor = value >= 70 ? 'text-emerald-400' : value >= 40 ? 'text-amber-400' : 'text-red-400';
  const barColor  = value >= 70 ? 'bg-emerald-500'   : value >= 40 ? 'bg-amber-500'   : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${textColor}`}>{value}</span>
    </div>
  );
}

function formatNumber(num: number) {
  if (!num) return 'N/A';
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

function formatPrice(price: number) {
  if (!price) return 'N/A';
  if (price < 0.0001) return `$${price.toExponential(2)}`;
  return `$${price.toFixed(6)}`;
}

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState<'composite' | 'momentum' | 'safety'>('composite');
  const [activeFilter, setActiveFilter] = useState<'all' | 'Buy Now' | 'Keep Watching' | 'Likely Rug' | 'Danger'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/sign-in');
    if (status === 'authenticated' && (session?.user as { isNew?: boolean })?.isNew) {
      router.replace('/account');
    }
  }, [status, session, router]);

  async function fetchCoins(showLoading = false) {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coins`);
      const data = await res.json();
      setCoins(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoins(true);
    const interval = setInterval(() => fetchCoins(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const watchNowCount = coins.filter(c => c.score?.signal === 'Buy Now').length;

  const filtered = coins
    .filter(c => activeFilter === 'all' || (activeFilter === 'Danger' ? (c.score?.signal === 'Avoid' || c.score?.signal === 'Likely Rug') : c.score?.signal === activeFilter))
    .filter(c => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return c.symbol?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q);
    });

  const sorted = [...filtered].sort((a, b) => {
    const key = sortBy === 'composite' ? 'composite_score' : sortBy === 'momentum' ? 'momentum_score' : 'safety_score';
    return (b.score?.[key] ?? 0) - (a.score?.[key] ?? 0);
  });

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white">

      <Navbar />

      <div className="max-w-350 mx-auto px-4 md:px-8 py-6 md:py-8">

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-2">
            Know exactly when to <span className="text-emerald-400">buy</span>, hold, and <span className="text-red-400">sell</span>.
          </h1>
          <p className="text-gray-500 text-sm md:text-base">We track {coins.length} Solana memecoins and tell you what to do. No trading experience needed.</p>
        </div>

        {/* Stats row — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <button onClick={() => setActiveFilter('all')} className={`cursor-pointer text-left rounded-2xl px-4 md:px-5 py-4 border transition-all ${activeFilter === 'all' ? 'bg-white/8 border-white/20' : 'bg-white/3 border-white/6 hover:bg-white/5'}`}>
            <div className="text-xl md:text-2xl font-bold text-white">{coins.length}</div>
            <div className="text-gray-400 text-sm mt-0.5">All coins</div>
            <div className="text-gray-600 text-xs mt-2 leading-relaxed hidden md:block">Every coin we are currently tracking on Solana.</div>
          </button>
          <button onClick={() => setActiveFilter(activeFilter === 'Buy Now' ? 'all' : 'Buy Now')} className={`cursor-pointer text-left rounded-2xl px-4 md:px-5 py-4 border transition-all ${activeFilter === 'Buy Now' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'}`}>
            <div className="text-xl md:text-2xl font-bold text-emerald-400">{watchNowCount}</div>
            <div className="text-gray-400 text-sm mt-0.5">Buy windows open</div>
            <div className="text-gray-600 text-xs mt-2 leading-relaxed hidden md:block">These coins have early momentum. Good time to consider getting in.</div>
          </button>
          <button onClick={() => setActiveFilter(activeFilter === 'Keep Watching' ? 'all' : 'Keep Watching')} className={`cursor-pointer text-left rounded-2xl px-4 md:px-5 py-4 border transition-all ${activeFilter === 'Keep Watching' ? 'bg-sky-500/20 border-sky-500/50' : 'bg-sky-500/5 border-sky-500/20 hover:bg-sky-500/10'}`}>
            <div className="text-xl md:text-2xl font-bold text-sky-400">{coins.filter(c => c.score?.signal === 'Keep Watching').length}</div>
            <div className="text-gray-400 text-sm mt-0.5">Worth watching</div>
            <div className="text-gray-600 text-xs mt-2 leading-relaxed hidden md:block">Showing some potential but not ready yet. Keep an eye on these.</div>
          </button>
          <button onClick={() => setActiveFilter(activeFilter === 'Danger' ? 'all' : 'Danger')} className={`cursor-pointer text-left rounded-2xl px-4 md:px-5 py-4 border transition-all ${activeFilter === 'Danger' ? 'bg-red-500/20 border-red-500/50' : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'}`}>
            <div className="text-xl md:text-2xl font-bold text-red-400">{coins.filter(c => c.score?.signal === 'Likely Rug' || c.score?.signal === 'Avoid').length}</div>
            <div className="text-gray-400 text-sm mt-0.5">Danger, avoid</div>
            <div className="text-gray-600 text-xs mt-2 leading-relaxed hidden md:block">High chance of being a scam. Do not put money into these.</div>
          </button>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or symbol..."
              className="w-full bg-white/3 border border-white/6 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 bg-white/3 border border-white/6 rounded-xl p-1 shrink-0">
            {(['composite', 'momentum', 'safety'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`cursor-pointer text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${sortBy === s ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {s === 'composite' ? 'Top Opportunity' : s === 'momentum' ? 'Biggest Movers' : 'Lowest Risk'}
              </button>
            ))}
          </div>
        </div>

        <div className="text-gray-600 text-xs mb-3">
          {sorted.length} {activeFilter === 'all' && !search ? 'coins' : 'results'}
          {search && <span className="text-gray-500"> for &quot;{search}&quot;</span>}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-600 py-24 text-sm">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-white/6 py-20 text-center px-6">
            <div className="text-3xl mb-3">👀</div>
            <div className="text-white font-semibold text-base mb-1">No coins found</div>
            <div className="text-gray-500 text-sm">
              {search ? `No coins match "${search}". Try a different name.` : 'None of the tracked coins match this filter right now.'}
            </div>
            <button onClick={() => { setActiveFilter('all'); setSearch(''); }} className="cursor-pointer mt-5 text-xs px-4 py-2 rounded-lg bg-white/6 text-gray-300 hover:bg-white/10 transition-all">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-2xl border border-white/6 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/6 bg-white/2 text-xs text-gray-600 uppercase tracking-wider">
                    <th className="text-left px-5 py-3">#</th>
                    <th className="text-left px-4 py-3">Coin</th>
                    <th className="text-right px-4 py-3">Price</th>
                    <th className="text-right px-4 py-3">5m</th>
                    <th className="text-right px-4 py-3">1h</th>
                    <th className="text-right px-4 py-3">24h</th>
                    <th className="text-right px-4 py-3">Volume</th>
                    <th className="text-right px-4 py-3">Buys / Sells</th>
                    <th className="text-left px-4 py-3">Safety</th>
                    <th className="text-left px-4 py-3">Momentum</th>
                    <th className="text-center px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {sorted.map((coin, i) => {
                    const isBuyNow = coin.score?.signal === 'Buy Now';
                    return (
                      <tr key={coin.coin_id} onClick={() => router.push(`/coin/${coin.coin_id}`)} className={`cursor-pointer transition-colors ${isBuyNow ? 'bg-emerald-500/3 hover:bg-emerald-500/6' : 'hover:bg-white/2'}`}>
                        <td className="px-5 py-4 text-gray-600 text-xs">{i + 1}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {coin.image_url ? (
                              <Image src={coin.image_url} alt={coin.symbol} width={32} height={32} className="rounded-full shrink-0" unoptimized />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{coin.symbol?.slice(0, 2)}</div>
                            )}
                            <div>
                              <div className="font-semibold text-white text-sm">{coin.symbol}</div>
                              <div className="text-gray-600 text-xs truncate max-w-30">{coin.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-gray-300 text-xs">{formatPrice(coin.metric?.price)}</td>
                        <td className="px-4 py-4 text-right text-xs"><PriceChange value={coin.metric?.price_change_5m} /></td>
                        <td className="px-4 py-4 text-right text-xs"><PriceChange value={coin.metric?.price_change_1h} /></td>
                        <td className="px-4 py-4 text-right text-xs"><PriceChange value={coin.metric?.price_change_24h} /></td>
                        <td className="px-4 py-4 text-right text-gray-400 text-xs">{formatNumber(coin.metric?.volume)}</td>
                        <td className="px-4 py-4 text-right text-xs">
                          <span className="text-emerald-400 font-medium">{coin.metric?.txns_buys?.toLocaleString() ?? 'N/A'}</span>
                          <span className="text-gray-700 mx-1">/</span>
                          <span className="text-red-400 font-medium">{coin.metric?.txns_sells?.toLocaleString() ?? 'N/A'}</span>
                        </td>
                        <td className="px-4 py-4"><ScoreBar value={coin.score?.safety_score} /></td>
                        <td className="px-4 py-4"><ScoreBar value={coin.score?.momentum_score} /></td>
                        <td className="px-4 py-4 text-center"><SignalBadge signal={coin.score?.signal} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {sorted.map((coin, i) => {
                const isBuyNow = coin.score?.signal === 'Buy Now';
                return (
                  <div key={coin.coin_id} onClick={() => router.push(`/coin/${coin.coin_id}`)} className={`cursor-pointer rounded-2xl border p-4 ${isBuyNow ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/2 border-white/6'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-xs w-4">{i + 1}</span>
                        {coin.image_url ? (
                          <Image src={coin.image_url} alt={coin.symbol} width={36} height={36} className="rounded-full shrink-0" unoptimized />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{coin.symbol?.slice(0, 2)}</div>
                        )}
                        <div>
                          <div className="font-semibold text-white text-sm">{coin.symbol}</div>
                          <div className="text-gray-600 text-xs">{coin.name}</div>
                        </div>
                      </div>
                      <SignalBadge signal={coin.score?.signal} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div>
                        <div className="text-gray-600 text-xs mb-0.5">Price</div>
                        <div className="text-gray-300 text-xs font-mono">{formatPrice(coin.metric?.price)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs mb-0.5">1h</div>
                        <div className="text-xs"><PriceChange value={coin.metric?.price_change_1h} /></div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs mb-0.5">24h</div>
                        <div className="text-xs"><PriceChange value={coin.metric?.price_change_24h} /></div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs mb-0.5">Volume</div>
                        <div className="text-gray-400 text-xs">{formatNumber(coin.metric?.volume)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs mb-0.5">Safety</div>
                        <ScoreBar value={coin.score?.safety_score} />
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs mb-0.5">Momentum</div>
                        <ScoreBar value={coin.score?.momentum_score} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

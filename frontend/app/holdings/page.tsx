'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';

interface Holding {
  coin_id: string;
  amount_invested: number;
  buy_price: number;
  bought_at?: string;
  is_sold: boolean;
  sell_price?: number;
  sold_at?: string;
}

interface CoinMetric {
  price: number;
}

interface CoinScore {
  signal: string;
}

interface Coin {
  coin_id: string;
  name: string;
  symbol: string;
  image_url: string;
  metric: CoinMetric;
  score?: CoinScore;
}

export default function HoldingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/sign-in');
  }, [status, router]);

  useEffect(() => {
    const google_id = (session?.user as { google_id?: string })?.google_id;
    if (!google_id) return;

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/holdings/${google_id}`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coins`).then(r => r.json()),
    ]).then(([holdingsData, coinsData]) => {
      if (holdingsData.success) setHoldings(holdingsData.data || []);
      if (coinsData.success) setCoins(coinsData.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [session]);

  async function removeHolding(coin_id: string, sellPrice: number) {
    const google_id = (session?.user as { google_id?: string })?.google_id;
    if (!google_id) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/holdings/${google_id}/${coin_id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sell_price: sellPrice }),
    });
    setHoldings(prev => prev.map(h =>
      h.coin_id === coin_id && !h.is_sold
        ? { ...h, is_sold: true, sell_price: sellPrice, sold_at: new Date().toISOString() }
        : h
    ));
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeHoldings = holdings.filter(h => !h.is_sold);
  const soldHoldings = holdings.filter(h => h.is_sold);

  const totalInvested = activeHoldings.reduce((sum, h) => sum + h.amount_invested, 0);
  const totalCurrentValue = activeHoldings.reduce((sum, h) => {
    const coin = coins.find(c => c.coin_id === h.coin_id);
    const currentPrice = coin?.metric?.price ?? 0;
    const coinsHeld = h.amount_invested / h.buy_price;
    return sum + coinsHeld * currentPrice;
  }, 0);
  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(1) : '0.0';

  const realizedPnl = soldHoldings.reduce((sum, h) => {
    const coinsHeld = h.amount_invested / h.buy_price;
    const soldValue = coinsHeld * (h.sell_price ?? 0);
    return sum + (soldValue - h.amount_invested);
  }, 0);
  const realizedPnlPct = soldHoldings.length > 0
    ? ((realizedPnl / soldHoldings.reduce((sum, h) => sum + h.amount_invested, 0)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="flex min-h-screen bg-[#080810] text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 md:px-8 py-8 md:py-10 pt-20 md:pt-8">
        <h1 className="text-2xl font-bold text-white mb-6">My Holdings</h1>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeHoldings.length === 0 && soldHoldings.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-gray-500 text-sm mb-4">You have no holdings tracked yet.</div>
            <button
              onClick={() => router.push('/dashboard')}
              className="cursor-pointer text-xs px-4 py-2 rounded-xl bg-white/6 text-gray-300 hover:bg-white/10 transition-all"
            >
              Browse coins
            </button>
          </div>
        ) : (
          <>
            {/* Summary row — always visible when there's any data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
                <div className="text-gray-500 text-xs mb-1">Total invested</div>
                <div className="text-white font-bold text-lg">${totalInvested.toFixed(2)}</div>
              </div>
              <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
                <div className="text-gray-500 text-xs mb-1">Current value</div>
                <div className="text-white font-bold text-lg">${totalCurrentValue.toFixed(2)}</div>
              </div>
              <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
                <div className="text-gray-500 text-xs mb-1">Unrealized P&L</div>
                <div className={`font-bold text-lg ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} ({totalPnl >= 0 ? '+' : ''}{totalPnlPct}%)
                </div>
              </div>
              <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
                <div className="text-gray-500 text-xs mb-1">Realized profit</div>
                <div className={`font-bold text-lg ${realizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)} ({realizedPnl >= 0 ? '+' : ''}{realizedPnlPct}%)
                </div>
              </div>
            </div>

            {activeHoldings.length > 0 && (
              <>
                {/* Active holdings list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
                  {activeHoldings.map(h => {
                    const coin = coins.find(c => c.coin_id === h.coin_id);
                    const currentPrice = coin?.metric?.price ?? 0;
                    const coinsHeld = h.amount_invested / h.buy_price;
                    const currentValue = coinsHeld * currentPrice;
                    const pnl = currentValue - h.amount_invested;
                    const pnlPct = ((pnl / h.amount_invested) * 100).toFixed(1);
                    const isUp = pnl >= 0;
                    const signal = coin?.score?.signal;
                    const signalStyle = signal === 'Buy Now'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : signal === 'Keep Watching'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : signal === 'Likely Rug' || signal === 'Avoid' || signal === 'Too Late'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
                    const dotColor = signal === 'Buy Now'
                      ? 'bg-emerald-500'
                      : signal === 'Keep Watching'
                      ? 'bg-blue-500'
                      : signal === 'Likely Rug' || signal === 'Avoid' || signal === 'Too Late'
                      ? 'bg-red-500'
                      : 'bg-cyan-500';
                    return (
                      <div key={h.coin_id} className="bg-white/3 border border-white/8 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <button
                            onClick={() => router.push(`/coin/${h.coin_id}`)}
                            className="cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            {coin?.image_url ? (
                              <Image src={coin.image_url} alt={coin.symbol} width={28} height={28} className="rounded-full shrink-0" unoptimized />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                                {coin?.symbol?.slice(0, 2) || '?'}
                              </div>
                            )}
                            <div className="text-left">
                              <div className="text-white font-bold text-sm">{coin?.symbol || h.coin_id}</div>
                              <div className="text-gray-600 text-xs">{coin?.name}</div>
                            </div>
                          </button>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg border ${signalStyle}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                            {signal || 'Loading'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <div className="text-gray-500 mb-0.5">Invested</div>
                            <div className="text-white font-medium">${h.amount_invested}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-0.5">Current value</div>
                            <div className="text-white font-medium">${currentValue.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-0.5">Buy price</div>
                            <div className="text-white font-medium">${h.buy_price < 0.0001 ? h.buy_price.toExponential(2) : h.buy_price.toFixed(6)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-0.5">P&L</div>
                            <div className={`font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isUp ? '+' : ''}${pnl.toFixed(2)} ({isUp ? '+' : ''}{pnlPct}%)
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeHolding(h.coin_id, currentPrice)}
                          className="cursor-pointer w-full text-xs font-medium py-2 px-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          I Sold
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Trade History */}
            {soldHoldings.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-white mb-4">Trade History</h2>
                <div className="flex flex-col gap-2">
                  {soldHoldings.map((h, i) => {
                    const coin = coins.find(c => c.coin_id === h.coin_id);
                    const sellPrice = h.sell_price ?? 0;
                    const coinsHeld = h.amount_invested / h.buy_price;
                    const soldValue = coinsHeld * sellPrice;
                    const pnl = soldValue - h.amount_invested;
                    const pnlPct = ((pnl / h.amount_invested) * 100).toFixed(1);
                    const isUp = pnl >= 0;
                    const soldDate = h.sold_at ? new Date(h.sold_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
                    return (
                      <div key={`${h.coin_id}-${i}`} className="bg-white/3 border border-white/6 rounded-2xl px-4 py-3 flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {coin?.image_url ? (
                            <Image src={coin.image_url} alt={coin.symbol} width={28} height={28} className="rounded-full shrink-0" unoptimized />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                              {coin?.symbol?.slice(0, 2) || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-white font-bold text-sm">{coin?.symbol || `${h.coin_id.slice(0, 4)}...${h.coin_id.slice(-4)}`}</div>
                            <div className="text-gray-600 text-xs truncate">{coin?.name || 'Delisted coin'}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-gray-500 text-xs mb-0.5">Invested</div>
                          <div className="text-white text-sm font-medium">${h.amount_invested.toFixed(2)}</div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-gray-500 text-xs mb-0.5">Sold for</div>
                          <div className="text-white text-sm font-medium">${soldValue.toFixed(2)}</div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-gray-500 text-xs mb-0.5">P&L</div>
                          <div className={`text-sm font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isUp ? '+' : ''}${pnl.toFixed(2)} ({isUp ? '+' : ''}{pnlPct}%)
                          </div>
                        </div>

                        <div className="text-right shrink-0 hidden sm:block">
                          <div className="text-gray-500 text-xs mb-0.5">Date</div>
                          <div className="text-gray-400 text-xs">{soldDate}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeHoldings.length === 0 && soldHoldings.length > 0 && (
              <div className="mb-8 text-center py-12">
                <div className="text-gray-500 text-sm mb-4">No active holdings.</div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="cursor-pointer text-xs px-4 py-2 rounded-xl bg-white/6 text-gray-300 hover:bg-white/10 transition-all"
                >
                  Browse coins
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

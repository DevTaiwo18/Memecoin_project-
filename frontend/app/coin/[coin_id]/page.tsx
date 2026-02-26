'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';

interface Metric {
  price: number;
  volume: number;
  liquidity: number;
  market_cap: number;
  price_change_5m: number;
  price_change_1h: number;
  price_change_6h: number;
  price_change_24h: number;
  txns_buys: number;
  txns_sells: number;
  timestamp: string;
}

interface Score {
  safety_score: number;
  momentum_score: number;
  composite_score: number;
  signal: string;
}

interface CoinDetail {
  coin_id: string;
  name: string;
  symbol: string;
  image_url: string;
  contract_address: string;
  chain: string;
  launch_time: string;
  twitter: string;
  telegram: string;
  website: string;
  metrics: Metric[];
  score: Score;
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
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      {signal}
    </span>
  );
}

function PriceChange({ value, label }: { value: number; label: string }) {
  const isNull = value === undefined || value === null;
  const color = isNull ? 'text-gray-600' : value >= 0 ? 'text-emerald-400' : 'text-red-400';
  const sign = value >= 0 ? '+' : '';
  return (
    <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>
        {isNull ? 'N/A' : `${sign}${value.toFixed(2)}%`}
      </div>
    </div>
  );
}

function ScoreCard({ label, value, description }: { label: string; value: number; description: string }) {
  const textColor = value >= 70 ? 'text-emerald-400' : value >= 40 ? 'text-amber-400' : 'text-red-400';
  const barColor  = value >= 70 ? 'bg-emerald-500'   : value >= 40 ? 'bg-amber-500'   : 'bg-red-500';
  return (
    <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-gray-400 text-sm font-medium">{label}</div>
        <div className={`text-2xl font-black ${textColor}`}>{value ?? 'N/A'}</div>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${value ?? 0}%` }} />
      </div>
      <div className="text-gray-600 text-xs leading-relaxed">{description}</div>
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

function formatAge(launch_time: string) {
  if (!launch_time) return 'N/A';
  const diff = Date.now() - new Date(launch_time).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Less than 1 hour old';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} old`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} old`;
}

export default function CoinPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [holdingStatus, setHoldingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [usdAmount, setUsdAmount] = useState('');
  const [solPrice, setSolPrice] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/sign-in');
  }, [status, router]);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      .then(r => r.json())
      .then(data => setSolPrice(data?.solana?.usd ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchCoin() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coins/${params.coin_id}`);
        const data = await res.json();
        if (data.success) setCoin(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCoin();
  }, [params.coin_id]);

  useEffect(() => {
    const google_id = (session?.user as { google_id?: string })?.google_id;
    if (!google_id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/holdings/${google_id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setIsHolding(data.data.some((h: { coin_id: string }) => h.coin_id === params.coin_id));
        }
      })
      .catch(() => {});
  }, [session, params.coin_id]);

  async function saveHolding() {
    const google_id = (session?.user as { google_id?: string })?.google_id;
    const currentPrice = coin?.metrics?.[0]?.price;
    if (!google_id || !amountInput || !currentPrice) return;
    setHoldingStatus('loading');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_id, coin_id: params.coin_id, amount_invested: parseFloat(amountInput), buy_price: currentPrice }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/holdings');
      } else {
        setHoldingStatus('error');
      }
    } catch {
      setHoldingStatus('error');
    }
  }

  function copyAddress() {
    if (!coin?.contract_address) return;
    navigator.clipboard.writeText(coin.contract_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const metric = coin?.metrics?.[0];
  const signal = coin?.score?.signal;
  const isBuyNow = signal === 'Buy Now';

  return (
    <div className="flex min-h-screen bg-[#080810] text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8 pt-20 md:pt-6">

        <button onClick={() => router.push('/dashboard')} className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </button>

        {loading || status === 'loading' || status === 'unauthenticated' ? (
          <div className="text-center text-gray-600 py-24 text-sm">Loading...</div>
        ) : !coin ? (
          <div className="text-center py-24">
            <div className="text-gray-500 mb-4">Coin not found</div>
            <button onClick={() => router.push('/dashboard')} className="cursor-pointer text-xs px-4 py-2 rounded-lg bg-white/6 text-gray-300 hover:bg-white/10 transition-all">
              Go back
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={`rounded-2xl border p-5 md:p-6 mb-5 ${isBuyNow ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/2 border-white/6'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {coin.image_url ? (
                    <Image src={coin.image_url} alt={coin.symbol} width={56} height={56} className="rounded-full shrink-0" unoptimized />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-500 shrink-0">{coin.symbol?.slice(0, 2)}</div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl md:text-2xl font-bold text-white">{coin.symbol}</h1>
                      <span className="text-gray-500 text-sm">{coin.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-gray-600 bg-white/4 px-2 py-0.5 rounded-md">Solana</span>
                      {coin.launch_time && (
                        <span className="text-xs text-gray-600">{formatAge(coin.launch_time)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {isHolding ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                      <span className="w-2 h-2 rounded-full shrink-0 bg-cyan-500" />
                      Holding
                    </span>
                  ) : signal && <SignalBadge signal={signal} />}
                  <div className="text-right">
                    <div className="text-xl md:text-2xl font-bold text-white">{formatPrice(metric?.price ?? 0)}</div>
                    <div className="text-xs text-gray-500">Current price</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Candlestick Chart */}
            <div className="bg-white/3 border border-white/6 rounded-2xl overflow-hidden mb-5 relative">
              <iframe
                src={`https://dexscreener.com/solana/${coin.contract_address}?embed=1&theme=dark&trades=0&info=0`}
                className="w-full"
                style={{ height: '420px', border: 'none' }}
                title="Price Chart"
              />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#0d0d14]" />
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <ScoreCard
                label="Safety Score"
                value={coin.score?.safety_score}
                description="Based on liquidity depth and buy/sell ratio. Higher means less likely to be a rug."
              />
              <ScoreCard
                label="Momentum Score"
                value={coin.score?.momentum_score}
                description="Based on 5m and 1h price change and transaction activity. Higher means it's moving now."
              />
              <ScoreCard
                label="Composite Score"
                value={coin.score?.composite_score}
                description="Overall score combining safety and momentum. Above 70 with Buy Now is the sweet spot."
              />
            </div>

            {/* Price changes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <PriceChange value={metric?.price_change_5m ?? 0} label="5 min" />
              <PriceChange value={metric?.price_change_1h ?? 0} label="1 hour" />
              <PriceChange value={metric?.price_change_6h ?? 0} label="6 hours" />
              <PriceChange value={metric?.price_change_24h ?? 0} label="24 hours" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
                <div className="text-gray-500 text-xs mb-1">Volume (24h)</div>
                <div className="text-white font-bold">{formatNumber(metric?.volume ?? 0)}</div>
              </div>
              <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
                <div className="text-gray-500 text-xs mb-1">Liquidity</div>
                <div className="text-white font-bold">{formatNumber(metric?.liquidity ?? 0)}</div>
              </div>
              <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
                <div className="text-gray-500 text-xs mb-1">Market Cap</div>
                <div className="text-white font-bold">{formatNumber(metric?.market_cap ?? 0)}</div>
              </div>
              <div className="bg-white/3 border border-white/6 rounded-2xl p-4">
                <div className="text-gray-500 text-xs mb-1">Buys / Sells (24h)</div>
                <div className="font-bold">
                  <span className="text-emerald-400">{metric?.txns_buys?.toLocaleString() ?? 'N/A'}</span>
                  <span className="text-gray-700 mx-1">/</span>
                  <span className="text-red-400">{metric?.txns_sells?.toLocaleString() ?? 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Contract + Buy links */}
            <div className="bg-white/3 border border-white/6 rounded-2xl p-5 mb-5">
              <div className="text-gray-400 text-sm font-medium mb-3">Contract Address</div>
              <div className="flex items-center gap-3 flex-wrap">
                <code className="text-gray-300 text-xs bg-black/30 px-3 py-2 rounded-lg break-all flex-1">{coin.contract_address}</code>
                <button
                  onClick={copyAddress}
                  className="cursor-pointer shrink-0 text-xs px-3 py-2 rounded-lg bg-white/6 text-gray-300 hover:bg-white/10 transition-all font-medium"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* SOL Calculator + Buy button */}
            {!isHolding && <div className="mb-5 flex flex-col gap-3">
              {signal === 'Buy Now' || signal === 'Keep Watching' ? (
                <>
                  <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
                    <div className="text-gray-400 text-xs font-medium mb-2">How much do you want to spend?</div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          value={usdAmount}
                          onChange={e => setUsdAmount(e.target.value)}
                          placeholder="10"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
                        />
                      </div>
                      <div className="text-right shrink-0">
                        {usdAmount && solPrice ? (
                          <>
                            <div className="text-white font-bold text-sm">≈ {(parseFloat(usdAmount) / solPrice).toFixed(4)} SOL</div>
                            <div className="text-gray-600 text-xs">@ ${solPrice.toLocaleString()}/SOL</div>
                          </>
                        ) : (
                          <div className="text-gray-600 text-xs">Enter amount</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://photon-sol.tinyastro.io/en/lp/${coin.contract_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-5 rounded-2xl transition-all text-sm w-full"
                  >
                    Buy on Photon
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2 bg-white/4 border border-white/6 text-gray-600 font-semibold py-3.5 px-5 rounded-2xl text-sm w-full cursor-not-allowed">
                  {signal === 'Too Late' ? 'Already pumped. Not recommended to buy' : 'Not recommended to buy'}
                </div>
              )}
            </div>}

            {/* Track as Holding */}
            <div className="mb-5">
              {isHolding ? (
                <button
                  onClick={() => router.push('/holdings')}
                  className="cursor-pointer w-full flex items-center justify-center gap-2 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-semibold py-3 px-5 rounded-2xl transition-all text-sm hover:bg-cyan-500/20"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                  Holding — View in My Holdings
                </button>
              ) : showBuyForm ? (
                <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
                  <div className="text-white text-sm font-semibold mb-3">How much did you invest in this holding?</div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        value={amountInput}
                        onChange={e => setAmountInput(e.target.value)}
                        placeholder="50"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
                      />
                    </div>
                    <button
                      onClick={saveHolding}
                      disabled={holdingStatus === 'loading' || !amountInput}
                      className="cursor-pointer px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-sm font-medium transition-all"
                    >
                      {holdingStatus === 'loading' ? '...' : 'Save'}
                    </button>
                    <button onClick={() => setShowBuyForm(false)} className="cursor-pointer px-3 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white text-sm transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowBuyForm(true)}
                  className="cursor-pointer w-full flex items-center justify-center gap-2 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 font-medium py-3 px-5 rounded-2xl transition-all text-sm"
                >
                  Track as Holding
                </button>
              )}
            </div>

            {/* Socials */}
            {(coin.twitter || coin.telegram || coin.website) && (
              <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
                <div className="text-gray-400 text-sm font-medium mb-3">Links</div>
                <div className="flex items-center gap-3 flex-wrap">
                  {coin.twitter && (
                    <a href={coin.twitter} target="_blank" rel="noopener noreferrer" className="cursor-pointer text-xs px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium">
                      Twitter / X
                    </a>
                  )}
                  {coin.telegram && (
                    <a href={coin.telegram} target="_blank" rel="noopener noreferrer" className="cursor-pointer text-xs px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium">
                      Telegram
                    </a>
                  )}
                  {coin.website && (
                    <a href={coin.website} target="_blank" rel="noopener noreferrer" className="cursor-pointer text-xs px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium">
                      Website
                    </a>
                  )}
                  <a
                    href={`https://dexscreener.com/solana/${coin.contract_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer text-xs px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                  >
                    DexScreener
                  </a>
                </div>
              </div>
            )}

            {/* DexScreener fallback if no socials */}
            {!coin.twitter && !coin.telegram && !coin.website && (
              <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
                <div className="text-gray-400 text-sm font-medium mb-3">Links</div>
                <a
                  href={`https://dexscreener.com/solana/${coin.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer inline-block text-xs px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-gray-300 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  View on DexScreener
                </a>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Metric {
  price: number;
  volume: number;
  liquidity: number;
  market_cap: number;
  price_change_5m: number;
  price_change_1h: number;
  price_change_24h: number;
  txns_buys: number;
  txns_sells: number;
}

interface Coin {
  coin_id: string;
  name: string;
  symbol: string;
  image_url: string;
  metric: Metric;
}

function PriceChange({ value }: { value: number }) {
  const color = value >= 0 ? 'text-green-400' : 'text-red-400';
  const sign = value >= 0 ? '+' : '';
  return <span className={color}>{sign}{value?.toFixed(2)}%</span>;
}

function formatNumber(num: number) {
  if (!num) return '$0';
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function formatPrice(price: number) {
  if (!price) return '$0';
  if (price < 0.0001) return `$${price.toExponential(2)}`;
  return `$${price.toFixed(6)}`;
}

export default function Dashboard() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  async function fetchCoins() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coins`);
      const data = await res.json();
      setCoins(data.data || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Memecoin Intelligence</h1>
            <p className="text-gray-400 text-sm mt-1">Solana — Live Trending Coins</p>
          </div>
          <div className="text-gray-500 text-sm">
            {lastUpdated && `Updated ${lastUpdated}`}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading coins...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800 bg-gray-900">
                  <th className="text-left px-4 py-3">Coin</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-right px-4 py-3">5m</th>
                  <th className="text-right px-4 py-3">1h</th>
                  <th className="text-right px-4 py-3">24h</th>
                  <th className="text-right px-4 py-3">Volume 24h</th>
                  <th className="text-right px-4 py-3">Liquidity</th>
                  <th className="text-right px-4 py-3">Buys / Sells</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin, i) => (
                  <tr
                    key={coin.coin_id}
                    className={`border-b border-gray-800 hover:bg-gray-900 transition-colors ${i % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900/30'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {coin.image_url ? (
                          <Image
                            src={coin.image_url}
                            alt={coin.symbol}
                            width={32}
                            height={32}
                            className="rounded-full"
                            unoptimized
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                            {coin.symbol?.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white">{coin.symbol}</div>
                          <div className="text-gray-400 text-xs">{coin.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatPrice(coin.metric?.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PriceChange value={coin.metric?.price_change_5m} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PriceChange value={coin.metric?.price_change_1h} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PriceChange value={coin.metric?.price_change_24h} />
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatNumber(coin.metric?.volume)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatNumber(coin.metric?.liquidity)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-green-400">{coin.metric?.txns_buys?.toLocaleString()}</span>
                      <span className="text-gray-500"> / </span>
                      <span className="text-red-400">{coin.metric?.txns_sells?.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

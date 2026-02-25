const { getTrendingSolana } = require('./dexscreener');
const Coin = require('../models/Coin');
const Metric = require('../models/Metric');
const Score = require('../models/Score');

async function collectAndStore() {
  try {
    const pairs = await getTrendingSolana();

    for (const pair of pairs) {
      const coin_id = pair.baseToken?.address;
      if (!coin_id) continue;

      const socials = pair.info?.socials || [];
      const twitter = socials.find(s => s.type === 'twitter')?.url || null;
      const telegram = socials.find(s => s.type === 'telegram')?.url || null;
      const website = pair.info?.websites?.[0]?.url || null;
      const image_url = pair.info?.imageUrl || null;
      const launch_time = pair.pairCreatedAt ? new Date(pair.pairCreatedAt) : null;

      await Coin.findOneAndUpdate(
        { coin_id },
        {
          coin_id,
          name: pair.baseToken.name,
          symbol: pair.baseToken.symbol,
          contract_address: coin_id,
          chain: 'solana',
          launch_time,
          image_url,
          twitter,
          telegram,
          website,
        },
        { upsert: true, new: true }
      );

      await Metric.create({
        coin_id,
        price: parseFloat(pair.priceUsd) || 0,
        volume: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        market_cap: pair.marketCap || 0,
        price_change_5m: pair.priceChange?.m5 || 0,
        price_change_1h: pair.priceChange?.h1 || 0,
        price_change_6h: pair.priceChange?.h6 || 0,
        price_change_24h: pair.priceChange?.h24 || 0,
        txns_buys: pair.txns?.h24?.buys || 0,
        txns_sells: pair.txns?.h24?.sells || 0,
        image_url,
        launch_time,
      });
    }
  } catch (err) {
    console.error(err.message);
  }
}

async function cleanupStaleCoins() {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const latestMetrics = await Metric.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$coin_id', lastSeen: { $first: '$timestamp' } } }
    ]);

    const staleIds = latestMetrics
      .filter(m => m.lastSeen < twoHoursAgo)
      .map(m => m._id);

    if (staleIds.length > 0) {
      await Coin.deleteMany({ coin_id: { $in: staleIds } });
      await Metric.deleteMany({ coin_id: { $in: staleIds } });
      await Score.deleteMany({ coin_id: { $in: staleIds } });
      console.log(`[Cleanup] Removed ${staleIds.length} stale coins`);
    }
  } catch (err) {
    console.error(err.message);
  }
}

module.exports = { collectAndStore, cleanupStaleCoins };

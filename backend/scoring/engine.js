const Metric = require('../models/Metric');
const Score = require('../models/Score');
const User = require('../models/User');
const { sendBuyNowAlert } = require('../telegram');

function calcSafetyScore(metric) {
  let score = 0;

  if (metric.liquidity >= 50000) score += 40;
  else if (metric.liquidity >= 10000) score += 20;
  else if (metric.liquidity >= 1000) score += 10;

  const totalTxns = metric.txns_buys + metric.txns_sells;
  if (totalTxns > 0) {
    const buyRatio = metric.txns_buys / totalTxns;
    if (buyRatio >= 0.6) score += 30;
    else if (buyRatio >= 0.5) score += 20;
    else if (buyRatio >= 0.4) score += 10;
  }

  if (metric.liquidity > 0) {
    const volLiqRatio = metric.volume / metric.liquidity;
    if (volLiqRatio >= 2) score += 20;
    else if (volLiqRatio >= 0.5) score += 10;
  }

  if (metric.launch_time) {
    const ageHours = (Date.now() - new Date(metric.launch_time)) / 3600000;
    if (ageHours >= 24) score += 10;
    else if (ageHours >= 6) score += 5;
  }

  return Math.min(score, 100);
}

function calcMomentumScore(metric) {
  let score = 0;

  // 1h change is the most important early signal
  const h1 = metric.price_change_1h || 0;
  if (h1 >= 50) score += 35;
  else if (h1 >= 20) score += 25;
  else if (h1 >= 5) score += 12;
  else if (h1 < -20) score -= 10;

  // 5m change shows what's happening RIGHT NOW
  const m5 = metric.price_change_5m || 0;
  if (m5 >= 10) score += 30;
  else if (m5 >= 3) score += 18;
  else if (m5 >= 1) score += 8;
  else if (m5 < -10) score -= 10;

  // Transaction volume shows real interest
  const totalTxns = metric.txns_buys + metric.txns_sells;
  if (totalTxns >= 10000) score += 20;
  else if (totalTxns >= 1000) score += 12;
  else if (totalTxns >= 100) score += 5;

  // 24h is NOT rewarded here — high 24h means pump already happened
  // We only penalise a crash
  const h24 = metric.price_change_24h || 0;
  if (h24 < -50) score -= 15;

  return Math.max(0, Math.min(score, 100));
}

function calcSignal(safety, momentum, composite, metric) {
  const h24 = metric.price_change_24h || 0;
  const h1  = metric.price_change_1h  || 0;
  const m5  = metric.price_change_5m  || 0;

  if (safety < 30) return 'Likely Rug';

  // Already pumped hard — too late to enter
  if (h24 > 150) return 'Too Late';

  // Early mover: rising fast on 5m/1h but 24h still low = before the pump
  if (safety >= 30 && momentum >= 55 && h24 <= 50 && (h1 >= 10 || m5 >= 5)) return 'Buy Now';

  // Some momentum building but not quite there yet
  if (composite >= 40 && momentum >= 30) return 'Keep Watching';

  return 'Avoid';
}

async function runScoringEngine() {
  try {
    const coins = await Metric.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$coin_id', metric: { $first: '$$ROOT' } } }
    ]);

    const usersWithTelegram = await User.find({ telegram_chat_id: { $ne: null } }).lean();

    for (const { _id: coin_id, metric } of coins) {
      const safety_score = calcSafetyScore(metric);
      const momentum_score = calcMomentumScore(metric);
      const composite_score = Math.round((safety_score * 0.4) + (momentum_score * 0.6));
      const signal = calcSignal(safety_score, momentum_score, composite_score, metric);

      const prev = await Score.findOne({ coin_id }).sort({ timestamp: -1 });
      const wasNotBuyNow = !prev || prev.signal !== 'Buy Now';

      await Score.create({ coin_id, safety_score, momentum_score, composite_score, signal });

      if (signal === 'Buy Now' && wasNotBuyNow && usersWithTelegram.length > 0) {
        const coinData = {
          coin_id,
          symbol: metric.symbol,
          name: metric.name,
          price: metric.price < 0.0001 ? metric.price.toExponential(2) : `$${metric.price.toFixed(6)}`,
          safety_score,
          momentum_score,
        };
        for (const user of usersWithTelegram) {
          sendBuyNowAlert(user.telegram_chat_id, coinData).catch(err =>
            console.error(`[Telegram] Failed to alert ${user.telegram_chat_id}:`, err.message)
          );
        }
      }
    }
  } catch (err) {
    console.error(err.message);
  }
}

module.exports = { runScoringEngine };

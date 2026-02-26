const https = require('https');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function sendMessage(chatId, text) {
  const body = JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' });
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TOKEN}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sendBuyNowAlert(chatId, coin) {
  const text =
    `🟢 *Buy Now — $${coin.symbol}*\n` +
    `${coin.name}\n\n` +
    `💰 Price: \`${coin.price}\`\n` +
    `🛡 Safety: ${coin.safety_score} | ⚡ Momentum: ${coin.momentum_score}\n\n` +
    `👉 [View on PumpRadar](https://pumparadar.vercel.app/coin/${coin.coin_id})`;
  return sendMessage(chatId, text);
}

async function sendSellAlert(chatId, coin, pnl, pnlPct) {
  const pnlText = pnl >= 0 ? `+$${pnl.toFixed(2)} (+${pnlPct}%)` : `-$${Math.abs(pnl).toFixed(2)} (${pnlPct}%)`;
  const emoji = pnl >= 0 ? '🟢' : '🔴';
  const text =
    `🚨 *Sell Alert: $${coin.symbol}*\n` +
    `${coin.name}\n\n` +
    `Signal is now *${coin.signal || 'Sell'}*. Consider taking profit.\n\n` +
    `💰 Current Price: \`${coin.price}\`\n` +
    `${emoji} P&L: *${pnlText}*\n\n` +
    `👉 [View on PumpRadar](https://pumparadar.vercel.app/coin/${coin.coin_id})`;
  return sendMessage(chatId, text);
}

async function sendTakeProfitAlert(chatId, coin, pnl, pnlPct, milestone) {
  const text =
    `🤑 *Take Profit — $${coin.symbol}*\n` +
    `${coin.name}\n\n` +
    `Your holding is up *+${milestone}%* from your buy price!\n\n` +
    `💰 Current Price: \`${coin.price}\`\n` +
    `🟢 P&L: *+$${pnl.toFixed(2)} (+${pnlPct}%)*\n\n` +
    `👉 [View on PumpRadar](https://pumparadar.vercel.app/coin/${coin.coin_id})`;
  return sendMessage(chatId, text);
}

function startPolling() {
  let offset = 0;
  setInterval(async () => {
    try {
      const body = JSON.stringify({ timeout: 10, offset });
      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${TOKEN}/getUpdates`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      };
      const data = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let d = '';
          res.on('data', chunk => d += chunk);
          res.on('end', () => resolve(JSON.parse(d)));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
      });
      for (const update of (data.result || [])) {
        offset = update.update_id + 1;
        const message = update.message;
        if (message?.text === '/start') {
          const chatId = message.chat.id;
          await sendMessage(chatId,
            `👋 Welcome to *PumpRadar*!\n\nYour Chat ID is:\n\`${chatId}\`\n\nCopy it and paste it into your PumpRadar account page to activate Buy Now alerts.`
          );
          console.log(`[Telegram] /start from chat_id: ${chatId}`);
        }
      }
    } catch (err) {
      console.error('[Telegram] Polling error:', err.message);
    }
  }, 3000);
}

async function setWebhook(url) {
  const body = JSON.stringify({ url });
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${TOKEN}/setWebhook`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { sendMessage, sendBuyNowAlert, sendSellAlert, sendTakeProfitAlert, setWebhook, startPolling };

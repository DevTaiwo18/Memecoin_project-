const axios = require('axios');

const BASE_URL = 'https://api.dexscreener.com';

async function getTrendingSolana() {
  const [boostedRes, latestRes] = await Promise.allSettled([
    axios.get(`${BASE_URL}/token-boosts/top/v1`),
    axios.get(`${BASE_URL}/token-profiles/latest/v1`),
  ]);

  const boosted = boostedRes.status === 'fulfilled' ? (boostedRes.value.data || []) : [];
  const latest  = latestRes.status  === 'fulfilled' ? (latestRes.value.data  || []) : [];

  const seen = new Set();
  const combined = [];
  for (const token of [...boosted, ...latest]) {
    if (token.chainId === 'solana' && token.tokenAddress && !seen.has(token.tokenAddress)) {
      seen.add(token.tokenAddress);
      combined.push(token);
    }
  }

  const pairs = await Promise.all(
    combined.slice(0, 100).map(async (token) => {
      try {
        const res = await axios.get(`${BASE_URL}/latest/dex/tokens/${token.tokenAddress}`);
        return res.data.pairs?.[0] || null;
      } catch {
        return null;
      }
    })
  );

  return pairs.filter(Boolean);
}

async function getTokenByAddress(address) {
  const response = await axios.get(`${BASE_URL}/latest/dex/tokens/${address}`);
  return response.data.pairs || [];
}

module.exports = { getTrendingSolana, getTokenByAddress };

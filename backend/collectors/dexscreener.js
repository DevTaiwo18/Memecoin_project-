const axios = require('axios');

const BASE_URL = 'https://api.dexscreener.com';

async function getTrendingSolana() {
  const response = await axios.get(`${BASE_URL}/token-boosts/top/v1`);
  const tokens = response.data || [];
  const solanaTokens = tokens.filter(t => t.chainId === 'solana');

  const pairs = await Promise.all(
    solanaTokens.slice(0, 50).map(async (token) => {
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

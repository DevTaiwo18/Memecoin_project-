require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require('cors');

const { collectAndStore, cleanupStaleCoins } = require('./collectors');
const { runScoringEngine } = require('./scoring/engine');
const { sendMessage, startPolling } = require('./telegram');
const coinRoutes = require('./routes/coins');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/coins', coinRoutes);
app.use('/api/users', userRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'Memecoin Platform API is running' });
});

// Telegram webhook — bot replies to /start with the user's Chat ID
app.post('/api/telegram/webhook', (req, res) => {
  const message = req.body?.message;
  if (message?.text === '/start') {
    const chatId = message.chat.id;
    sendMessage(chatId,
      `👋 Welcome to *PumpRadar*!\n\nYour Chat ID is:\n\`${chatId}\`\n\nCopy it and paste it into your PumpRadar account page to activate Buy Now alerts.`
    ).catch(console.error);
  }
  res.sendStatus(200);
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));

    startPolling();
    collectAndStore().then(() => runScoringEngine());

    cron.schedule('*/5 * * * *', async () => {
      await collectAndStore();
      await runScoringEngine();
      await cleanupStaleCoins();
    });
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });

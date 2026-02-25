require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const cors = require('cors');

const { collectAndStore } = require('./collectors');
const coinRoutes = require('./routes/coins');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/coins', coinRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'Memecoin Platform API is running' });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));

    collectAndStore();

    cron.schedule('*/5 * * * *', () => collectAndStore());
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });

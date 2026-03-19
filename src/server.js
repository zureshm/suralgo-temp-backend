const express = require("express");
const loadCSV = require("./csvLoader");
const cors = require("cors");
const { watchlist, accountDetails } = require("./mockData");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 2000;

let rows = [];
let currentIndex = 0;

loadCSV("./data/NIFTY_10MAR26_24900_PE.csv")
  .then((data) => {
    rows = data;
    console.log("CSV loaded");
    console.log("Total candles:", rows.length);
  })
  .catch((err) => {
    console.error("CSV load error:", err);
  });

  setInterval(() => {

  if (rows.length === 0) return;

  if (currentIndex < rows.length - 1) {
    currentIndex++;
    console.log("New candle:", rows[currentIndex].time);
  }

}, 1000);

app.get("/", (req, res) => {
  res.send("Market simulator running");
});

app.get("/next-candle", (req, res) => {
  if (currentIndex >= rows.length) {
    return res.json({
      message: "No more candles left"
    });
  }

  const candle = rows[currentIndex];
  currentIndex++;

  res.json(candle);
});

app.get("/reset", (req, res) => {
  currentIndex = 0;

  res.json({
    message: "Simulator reset successful"
  });
});

app.get("/status", (req, res) => {
  res.json({
    currentIndex,
    totalCandles: rows.length,
    nextCandleTime: rows[currentIndex]?.time || null
  });
});

app.get("/current-candle", (req, res) => {
  if (currentIndex >= rows.length) {
    return res.json({ message: "No more candles left" });
  }

  res.json(rows[currentIndex]);
});

app.get("/watchlist", (req, res) => {
  const currentCandle = rows[currentIndex] || null;

  const watchlistWithPrice = watchlist.map((item) => ({
    symbol: item.symbol,
    ltp: currentCandle ? currentCandle.close : null
  }));

  res.json(watchlistWithPrice);
});

app.get("/account-details", (req, res) => {
  res.json(accountDetails);
});

app.post("/watchlist", (req, res) => {
  const { symbol } = req.body;

  if (!symbol) {
    return res.status(400).json({ message: "Symbol is required" });
  }

  watchlist.push({ symbol });

  res.json({
    message: "Symbol added",
    watchlist
  });
});

app.delete("/watchlist", (req, res) => {
  const { symbol } = req.body;

  if (!symbol) {
    return res.status(400).json({ message: "Symbol is required" });
  }

  const index = watchlist.findIndex((item) => item.symbol === symbol);

  if (index === -1) {
    return res.status(404).json({ message: "Symbol not found" });
  }

  watchlist.splice(index, 1);

  res.json({
    message: "Symbol deleted",
    watchlist
  });
});

app.get("/prices", (req, res) => {
  const symbolsParam = req.query.symbols;

  if (!symbolsParam) {
    return res.json([]);
  }

  const symbols = symbolsParam.split(",");

  const currentCandle = rows[currentIndex] || null;

  const prices = symbols.map((symbol) => ({
    symbol,
    ltp: currentCandle ? Number(currentCandle.close) : null
  }));

  res.json(prices);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
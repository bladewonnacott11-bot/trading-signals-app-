/* ============================================================
   1. SHARED SIGNAL DATA
   ============================================================ */
const SIGNALS = {
  swing: [
    {
      symbol: 'AAPL 190C',
      direction: 'long',
      entry: 4.20,
      target: 6.10,
      stop: 3.20,
      confidence: 78,
      timeframe: 'Daily',
      status: 'active',
    },
    {
      symbol: 'NVDA 900P',
      direction: 'short',
      entry: 12.50,
      target: 8.40,
      stop: 15.20,
      confidence: 64,
      timeframe: '4H',
      status: 'active',
    },
  ],
  scalping: [
    {
      symbol: 'SPY 520C',
      direction: 'long',
      entry: 1.85,
      target: 2.40,
      stop: 1.55,
      confidence: 71,
      timeframe: '5m',
      status: 'active',
    },
    {
      symbol: 'TSLA 250P',
      direction: 'short',
      entry: 3.10,
      target: 2.30,
      stop: 3.60,
      confidence: 58,
      timeframe: '1m',
      status: 'pending',
    },
    {
      symbol: 'QQQ 440C',
      direction: 'long',
      entry: 2.05,
      target: 2.75,
      stop: 1.70,
      confidence: 66,
      timeframe: '3m',
      status: 'active',
    },
  ],
};

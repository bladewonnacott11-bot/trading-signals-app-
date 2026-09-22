/* ============================================================
   1. SERVERLESS FUNCTION — GET /api/quote?symbol=AAPL%20190C
   ============================================================ */

const ALPACA_BASE = 'https://data.alpaca.markets';

/* ------------------------------------------------------------
   1.1 Parse the underlying ticker out of a signal symbol
   ------------------------------------------------------------ */
function parseUnderlying(symbol) {
  if (!symbol) return null;
  const root = symbol.trim().split(/\s+/)[0].toUpperCase();
  const clean = root.replace(/[^A-Z.]/g, '');
  return clean.length ? clean : null;
}

/* ------------------------------------------------------------
   1.2 Handler
   ------------------------------------------------------------ */
export default async function handler(req, res) {
  const { symbol } = req.query;

  // --- 1.2.1 Validate input ---
  const underlying = parseUnderlying(symbol);
  if (!underlying) {
    return res.status(400).json({ error: 'A valid symbol is required' });
  }

  // --- 1.2.2 Check credentials ---
  const KEY = process.env.ALPACA_API_KEY;
  const SECRET = process.env.ALPACA_API_SECRET;
  const FEED = process.env.ALPACA_FEED || 'iex';

  if (!KEY || !SECRET) {
    return res.status(503).json({
      error: 'Live data is not configured',
      code: 'NO_KEYS',
    });
  }

  // --- 1.2.3 Fetch snapshot from Alpaca ---
  try {
    const url = `${ALPACA_BASE}/v2/stocks/snapshots?symbols=${encodeURIComponent(underlying)}&feed=${FEED}`;

    const upstream = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': KEY,
        'APCA-API-SECRET-KEY': SECRET,
        Accept: 'application/json',
      },
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(502).json({
        error: 'Upstream market data error',
        status: upstream.status,
        detail: detail.slice(0, 200),
      });
    }

    const payload = await upstream.json();
    const snap = payload?.[underlying];

    if (!snap) {
      return res.status(404).json({ error: `No market data for ${underlying}` });
    }

    // --- 1.2.4 Normalise the response ---
    const price = snap.latestTrade?.p ?? snap.dailyBar?.c ?? null;
    const prevClose = snap.prevDailyBar?.c ?? null;

    const change =
      price != null && prevClose != null ? price - prevClose : null;
    const changePct =
      change != null && prevClose ? (change / prevClose) * 100 : null;

    // --- 1.2.5 Cache briefly to protect your API quota ---
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');

    return res.status(200).json({
      symbol: symbol || underlying,
      underlying,
      price,
      prevClose,
      change,
      changePct,
      dayHigh: snap.dailyBar?.h ?? null,
      dayLow: snap.dailyBar?.l ?? null,
      dayVolume: snap.dailyBar?.v ?? null,
      feed: FEED,
      asOf: snap.latestTrade?.t ?? snap.dailyBar?.t ?? null,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach market data' });
  }
}

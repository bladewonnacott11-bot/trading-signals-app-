/* ============================================================
   1. SERVERLESS FUNCTION — GET /api/bars?symbol=AAPL&timeframe=5Min
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
  const { symbol, timeframe = '5Min', limit = '300' } = req.query;

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

  // --- 1.2.3 Validate timeframe + clamp limit ---
  const VALID = ['1Min', '5Min', '15Min', '30Min', '1Hour', '1Day'];
  const tf = VALID.includes(timeframe) ? timeframe : '5Min';
  const lim = Math.min(Math.max(parseInt(limit, 10) || 300, 10), 1000);

  // --- 1.2.4 Fetch bars from Alpaca ---
  try {
    const url =
      `${ALPACA_BASE}/v2/stocks/${encodeURIComponent(underlying)}/bars` +
      `?timeframe=${tf}&limit=${lim}&feed=${FEED}&adjustment=split`;

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
    const bars = payload?.bars || [];

    // --- 1.2.5 Convert to Lightweight Charts format ---
    const candles = bars
      .map((b) => ({
        time: Math.floor(new Date(b.t).getTime() / 1000),
        open: b.o,
        high: b.h,
        low: b.l,
        close: b.c,
        volume: b.v,
      }))
      .filter((c) => c.time && c.open != null);

    // --- 1.2.6 Cache briefly to protect your quota ---
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');

    return res.status(200).json({
      symbol: symbol || underlying,
      underlying,
      timeframe: tf,
      feed: FEED,
      bars: candles,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach market data' });
  }
}

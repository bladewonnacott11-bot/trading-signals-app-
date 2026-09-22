/* ============================================================
   1. SIGNAL DATA
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

/* ============================================================
   2. CARD STYLE MAPS
   ============================================================ */
const directionStyles = {
  long: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  short: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
};

const statusStyles = {
  active: 'text-emerald-400',
  pending: 'text-amber-400',
  closed: 'text-slate-500',
};

/* ============================================================
   3. RENDER SIGNALS
   ============================================================ */
function renderSignals(strategy) {
  const grid = document.getElementById('signalGrid');
  const heading = document.getElementById('signalHeading');
  const count = document.getElementById('signalCount');
  const list = SIGNALS[strategy] || [];

  heading.textContent = strategy === 'swing' ? 'Swing signals' : 'Scalping signals';
  count.textContent = `${list.filter((s) => s.status === 'active').length} active`;

  if (!list.length) {
    grid.innerHTML = `
      <div class="col-span-full rounded-2xl border border-dashed border-white/10 p-12 text-center">
        <p class="text-sm text-slate-400">No signals for this strategy yet.</p>
      </div>`;
    return;
  }

  grid.innerHTML = list
    .map((s) => {
      const rr = Math.abs((s.target - s.entry) / (s.entry - s.stop)).toFixed(1);

      return `
        <article class="signal-card rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition hover:border-white/15 hover:bg-white/[0.04]">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-base font-semibold tracking-tight text-white">${s.symbol}</p>
              <p class="mt-0.5 text-[11px] text-slate-500">${s.timeframe} · R:R ${rr}</p>
            </div>
            <span class="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${directionStyles[s.direction]}">
              ${s.direction}
            </span>
          </div>

          <div class="mt-5 grid grid-cols-3 gap-3">
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-500">Entry</p>
              <p class="mt-1 text-sm font-medium text-slate-200">$${s.entry.toFixed(2)}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-500">Target</p>
              <p class="mt-1 text-sm font-medium text-emerald-300">$${s.target.toFixed(2)}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider text-slate-500">Stop</p>
              <p class="mt-1 text-sm font-medium text-rose-300">$${s.stop.toFixed(2)}</p>
            </div>
          </div>

          <div class="mt-5">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-[10px] uppercase tracking-wider text-slate-500">Confidence</span>
              <span class="text-[11px] font-medium text-slate-300">${s.confidence}%</span>
            </div>
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div class="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style="width: ${s.confidence}%"></div>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
            <span class="text-[11px] font-medium capitalize ${statusStyles[s.status]}">● ${s.status}</span>
            <button class="text-[11px] font-medium text-slate-400 transition hover:text-white">Details →</button>
          </div>
        </article>`;
    })
    .join('');
}

/* ============================================================
   4. STRATEGY SWITCHING
   ============================================================ */
function setupStrategyTabs() {
  const buttons = document.querySelectorAll('.strategy-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const strategy = btn.dataset.strategy;

      buttons.forEach((b) => {
        b.classList.remove('is-active');
        b.classList.add('border-white/8', 'bg-white/[0.02]', 'hover:border-white/15', 'hover:bg-white/[0.04]');
      });

      btn.classList.add('is-active');
      btn.classList.remove('border-white/8', 'bg-white/[0.02]', 'hover:border-white/15', 'hover:bg-white/[0.04]');

      renderSignals(strategy);
    });
  });
}

/* ============================================================
   5. INITIAL RENDER
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  setupStrategyTabs();
  renderSignals('swing');
});

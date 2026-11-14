'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type CoinTick,
  type CoinView,
  CONTRACT_ID,
  EXPLORER,
  fromUnits,
  indexer,
  loadChain,
  toUnits,
} from '@/lib/chain-meta';
import Icon from './Icon';
import { Modal, StatRow, SubHead } from './ui';

interface Props {
  open: boolean;
  account: string | null;
  onClose: () => void;
  onLog: (m: string) => void;
}

const errText = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  const panic = /Smart contract panicked: ([^"\\]+)/.exec(m);
  return (panic?.[1] ?? m).slice(0, 120);
};

function yoctoToDecimalString(yocto: string, decimals = 18): string {
  const clean = yocto.replace(/\D/g, '') || '0';
  const s = clean.padStart(decimals + 1, '0');
  const intPart = s.slice(0, s.length - decimals) || '0';
  const fracPart = s.slice(s.length - decimals).replace(/0+$/, '');
  return fracPart ? `${intPart}.${fracPart}` : intPart;
}

function formatNearAxis(val: number): string {
  if (val >= 1) return `${val.toFixed(2)} N`;
  if (val >= 0.01) return `${val.toFixed(3)} N`;
  return `${val.toPrecision(2)} N`;
}

function CoinChart({ history }: { history: CoinTick[] }) {
  const padLeft = 68;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 26;
  const plotW = 540 - padLeft - padRight;
  const plotH = 160 - padTop - padBottom;
  const plotBottom = padTop + plotH;
  const plotRight = padLeft + plotW;

  const count = history.length;
  const sorted = count > 1 ? [...history].sort((a, b) => a.ts - b.ts) : history;

  const prices = sorted.map((t) => fromUnits(t.price, 24));
  const navs = sorted.map((t) => fromUnits(t.nav, 24));
  const peak = Math.max(...prices, ...navs, 1e-12);
  const maxVal = peak * 1.15;

  let pricePoly = '';
  let navPoly = '';
  let lastX = plotRight;
  let lastYP = plotBottom;
  let lastYN = plotBottom;

  if (count > 1) {
    const tMin = sorted[0]!.ts;
    const tMax = sorted[sorted.length - 1]!.ts;
    const dt = tMax - tMin;

    pricePoly = sorted
      .map((t, i) => {
        const x = dt > 0 ? padLeft + ((t.ts - tMin) / dt) * plotW : padLeft + (i / (count - 1)) * plotW;
        const y = plotBottom - (fromUnits(t.price, 24) / maxVal) * plotH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    navPoly = sorted
      .map((t, i) => {
        const x = dt > 0 ? padLeft + ((t.ts - tMin) / dt) * plotW : padLeft + (i / (count - 1)) * plotW;
        const y = plotBottom - (fromUnits(t.nav, 24) / maxVal) * plotH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const lastTick = sorted[sorted.length - 1]!;
    lastX = plotRight;
    lastYP = plotBottom - (fromUnits(lastTick.price, 24) / maxVal) * plotH;
    lastYN = plotBottom - (fromUnits(lastTick.nav, 24) / maxVal) * plotH;
  } else if (count === 1) {
    const tick = sorted[0]!;
    lastYP = plotBottom - (fromUnits(tick.price, 24) / maxVal) * plotH;
    lastYN = plotBottom - (fromUnits(tick.nav, 24) / maxVal) * plotH;
  }

  return (
    <div className="well p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-[var(--paper-dim)]">Market Price vs NAV</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1 w-3 bg-[var(--gold)]" />
            <span className="text-[var(--paper-dim)]">Price (NEAR)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1 w-3 border-b-2 border-dashed border-[var(--good)]" />
            <span className="text-[var(--paper-dim)]">NAV (NEAR)</span>
          </span>
        </div>
      </div>
      <div className="relative aspect-[540/160] w-full overflow-hidden border-2 border-[var(--ink)] bg-[var(--slab-lo)]">
        <svg viewBox="0 0 540 160" className="h-full w-full select-none" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1={padLeft} y1={padTop} x2={plotRight} y2={padTop} stroke="var(--slab-hi)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padLeft} y1={padTop + plotH / 2} x2={plotRight} y2={padTop + plotH / 2} stroke="var(--slab-hi)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={padLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="var(--ink)" strokeWidth="2" />
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={plotBottom} stroke="var(--ink)" strokeWidth="2" />

          {/* Y-axis labels */}
          <text x={padLeft - 6} y={padTop + 4} fill="var(--paper-dim)" textAnchor="end" fontSize="10" fontFamily="var(--font-body)">
            {formatNearAxis(maxVal)}
          </text>
          <text x={padLeft - 6} y={padTop + plotH / 2 + 4} fill="var(--paper-dim)" textAnchor="end" fontSize="10" fontFamily="var(--font-body)">
            {formatNearAxis(maxVal / 2)}
          </text>
          <text x={padLeft - 6} y={plotBottom + 3} fill="var(--paper-dim)" textAnchor="end" fontSize="10" fontFamily="var(--font-body)">
            0 N
          </text>

          {/* 0 points state */}
          {count === 0 && (
            <text x={padLeft + plotW / 2} y={padTop + plotH / 2 + 4} fill="var(--paper-dim)" textAnchor="middle" fontSize="12" fontFamily="var(--font-display)">
              No trade history recorded yet
            </text>
          )}

          {/* 1 point state */}
          {count === 1 && (
            <>
              <line x1={padLeft} y1={lastYP} x2={plotRight} y2={lastYP} stroke="var(--gold)" strokeWidth="2" strokeDasharray="3 3" />
              <line x1={padLeft} y1={lastYN} x2={plotRight} y2={lastYN} stroke="var(--good)" strokeWidth="2" strokeDasharray="4 2" />
              <rect x={padLeft + plotW / 2 - 3} y={lastYP - 3} width="6" height="6" fill="var(--gold)" stroke="var(--ink)" strokeWidth="1" />
              <rect x={padLeft + plotW / 2 - 3} y={lastYN - 3} width="6" height="6" fill="var(--good)" stroke="var(--ink)" strokeWidth="1" />
              <text x={padLeft + plotW / 2} y={plotBottom + 16} fill="var(--paper-dim)" textAnchor="middle" fontSize="10" fontFamily="var(--font-body)">
                {new Date(sorted[0]!.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </text>
            </>
          )}

          {/* Multi-point lines */}
          {count > 1 && (
            <>
              <polyline points={pricePoly} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinejoin="round" />
              <polyline points={navPoly} fill="none" stroke="var(--good)" strokeWidth="2" strokeDasharray="4 2" strokeLinejoin="round" />
              <rect x={lastX - 3} y={lastYP - 3} width="6" height="6" fill="var(--gold)" stroke="var(--ink)" strokeWidth="1" />
              <rect x={lastX - 3} y={lastYN - 3} width="6" height="6" fill="var(--good)" stroke="var(--ink)" strokeWidth="1" />

              <text x={padLeft} y={plotBottom + 16} fill="var(--paper-dim)" textAnchor="start" fontSize="10" fontFamily="var(--font-body)">
                {new Date(sorted[0]!.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </text>
              <text x={plotRight} y={plotBottom + 16} fill="var(--paper-dim)" textAnchor="end" fontSize="10" fontFamily="var(--font-body)">
                {new Date(sorted[sorted.length - 1]!.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

export default function CoinPanel({ open, account, onClose, onLog }: Props) {
  const [coin, setCoin] = useState<CoinView | null>(null);
  const [history, setHistory] = useState<CoinTick[]>([]);
  const [balance, setBalance] = useState<string | null>(null);

  const [buyNear, setBuyNear] = useState('');
  const [buyQuote, setBuyQuote] = useState<string | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);

  const [sellMetro, setSellMetro] = useState('');
  const [sellQuote, setSellQuote] = useState<string | null>(null);
  const [sellLoading, setSellLoading] = useState(false);

  const [isTrading, setIsTrading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // the pool itself from the chain (so a trade shows at once), its history from the indexer
    const [direct, idx] = await Promise.all([
      loadChain().then((chain) => chain.view<CoinView>('get_coin')).catch(() => undefined),
      indexer<{ coin: CoinView | null; history: CoinTick[] }>('coin'),
    ]);
    const c = direct ?? idx?.coin ?? null;
    setCoin(c);
    setHistory(idx?.history ?? []);
    if (!c && direct === undefined && !idx) setErr(`Cannot reach ${CONTRACT_ID} right now. Try again in a moment.`);

    if (account) {
      try {
        const chain = await loadChain();
        const b = await chain.view<string>('ft_balance_of', { account_id: account });
        setBalance(b ?? '0');
      } catch {
        setBalance('0');
      }
    } else {
      setBalance(null);
    }
  }, [account]);

  useEffect(() => {
    if (!open) return;
    void refresh();
    const t = setInterval(() => void refresh(), 30_000);
    return () => clearInterval(t);
  }, [open, refresh]);

  // Live quote for Buy
  useEffect(() => {
    if (!open) return;
    const num = Number(buyNear);
    if (!buyNear || isNaN(num) || num <= 0) {
      setBuyQuote(null);
      setBuyLoading(false);
      return;
    }
    let cancelled = false;
    setBuyLoading(true);
    const timer = setTimeout(async () => {
      try {
        const chain = await loadChain();
        const nearIn = toUnits(buyNear.trim(), 24);
        if (nearIn === '0' || !nearIn) {
          if (!cancelled) {
            setBuyQuote(null);
            setBuyLoading(false);
          }
          return;
        }
        const q = await chain.view<string>('quote_buy', { near_in: nearIn });
        if (!cancelled) {
          setBuyQuote(q ?? null);
          setBuyLoading(false);
        }
      } catch {
        if (!cancelled) {
          setBuyQuote(null);
          setBuyLoading(false);
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [buyNear, open]);

  // Live quote for Sell
  useEffect(() => {
    if (!open) return;
    const num = Number(sellMetro);
    if (!sellMetro || isNaN(num) || num <= 0) {
      setSellQuote(null);
      setSellLoading(false);
      return;
    }
    let cancelled = false;
    setSellLoading(true);
    const timer = setTimeout(async () => {
      try {
        const chain = await loadChain();
        const metroIn = toUnits(sellMetro.trim(), 18);
        if (metroIn === '0' || !metroIn) {
          if (!cancelled) {
            setSellQuote(null);
            setSellLoading(false);
          }
          return;
        }
        const q = await chain.view<string>('quote_sell', { metro_in: metroIn });
        if (!cancelled) {
          setSellQuote(q ?? null);
          setSellLoading(false);
        }
      } catch {
        if (!cancelled) {
          setSellQuote(null);
          setSellLoading(false);
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sellMetro, open]);

  if (!open) return null;

  const poolEmpty = !coin || BigInt(coin.near_reserve || '0') === 0n || BigInt(coin.metro_reserve || '0') === 0n;
  const disabled = !account || poolEmpty;

  const navBi = coin ? BigInt(coin.nav || '0') : 0n;
  let mnavText = '0.00x';
  let mnavLabel = 'No cities saved yet';
  let mnavColor = 'var(--paper-dim)';

  if (navBi === 0n) {
    mnavText = '-';
    mnavLabel = 'No cities saved yet';
    mnavColor = 'var(--paper-dim)';
  } else if (coin) {
    const mnavPm = BigInt(coin.mnav_pm || '0');
    mnavText = `${(Number(mnavPm) / 1000).toFixed(2)}x`;
    if (mnavPm < 900n) {
      mnavLabel = 'Cheap vs its cities';
      mnavColor = 'var(--good)';
    } else if (mnavPm < 2000n) {
      mnavLabel = 'Fair';
      mnavColor = 'var(--accent)';
    } else {
      mnavLabel = 'Expensive: new METRO will be issued';
      mnavColor = 'var(--bad)';
    }
  }

  const handleBuy = async () => {
    if (!account || !buyQuote || isTrading) return;
    const num = Number(buyNear);
    if (isNaN(num) || num <= 0) return;
    setIsTrading(true);
    setErr(null);
    try {
      const chain = await loadChain();
      const nearIn = toUnits(buyNear.trim(), 24);
      if (BigInt(nearIn) <= 0n) return;
      const minOutBi = (BigInt(buyQuote) * 97n) / 100n;
      const outcome = await chain.call('buy_metro', { min_out: minOutBi.toString() }, nearIn);
      const received = chain.returnValue<string>(outcome);
      const metroOut = fromUnits(received || buyQuote, 18).toLocaleString('en-US', { maximumFractionDigits: 4 });
      onLog(`Bought ${metroOut} METRO`);
      void fetch('/api/chain/poke', { method: 'POST' }).catch(() => undefined);
      setBuyNear('');
      setBuyQuote(null);
      await refresh();
    } catch (e) {
      const msg = errText(e);
      setErr(`Buy failed: ${msg}`);
      onLog(`Buy failed: ${msg}`);
    } finally {
      setIsTrading(false);
    }
  };

  const handleSell = async () => {
    if (!account || !sellQuote || isTrading) return;
    const num = Number(sellMetro);
    if (isNaN(num) || num <= 0) return;
    setIsTrading(true);
    setErr(null);
    try {
      const chain = await loadChain();
      const metroIn = toUnits(sellMetro.trim(), 18);
      if (BigInt(metroIn) <= 0n) return;
      const minOutBi = (BigInt(sellQuote) * 97n) / 100n;
      const outcome = await chain.call('sell_metro', { amount: metroIn, min_out: minOutBi.toString() }, '1');
      const received = chain.returnValue<string>(outcome);
      const nearOut = fromUnits(received || sellQuote, 24).toLocaleString('en-US', { maximumFractionDigits: 4 });
      onLog(`Sold ${sellMetro.trim()} METRO for ${nearOut} NEAR`);
      void fetch('/api/chain/poke', { method: 'POST' }).catch(() => undefined);
      setSellMetro('');
      setSellQuote(null);
      await refresh();
    } catch (e) {
      const msg = errText(e);
      setErr(`Sell failed: ${msg}`);
      onLog(`Sell failed: ${msg}`);
    } finally {
      setIsTrading(false);
    }
  };

  const handleMaxSell = () => {
    if (!balance) return;
    setSellMetro(yoctoToDecimalString(balance, 18));
  };

  return (
    <Modal
      title="$METRO Market"
      icon="coin"
      onClose={onClose}
      width="max-w-4xl"
      headerRight={
        <a
          href={`${EXPLORER}/address/${CONTRACT_ID}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-normal text-[var(--paper-dim)] underline"
        >
          {CONTRACT_ID}
        </a>
      }
    >
      {err && (
        <p role="alert" className="well mb-3 border-l-4 border-l-[var(--bad)] p-2.5 text-xs text-[var(--bad)]">
          {err}
        </p>
      )}

      {/* Account / Pool alerts */}
      {!account && (
        <div className="well mb-3 flex items-center justify-between gap-2 border-l-4 border-l-[var(--gold)] p-2.5">
          <span className="text-xs text-[var(--paper-dim)]">Connect a NEAR wallet to trade</span>
          <button
            type="button"
            className="btn btn-quiet px-2.5 py-1 text-xs"
            onClick={() => void loadChain().then((c) => c.openModal())}
          >
            Connect wallet
          </button>
        </div>
      )}

      {account && poolEmpty && (
        <div className="well mb-3 border-l-4 border-l-[var(--bad)] p-2.5 text-xs text-[var(--bad)]">
          The pool is empty. Trading will open once liquidity is seeded.
        </div>
      )}

      {/* Key Headline Stats */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="well p-2.5">
          <span className="block text-xs text-[var(--paper-dim)]">Price</span>
          <b className="font-display block text-base tabular-nums text-[var(--gold)] sm:text-lg">
            {fromUnits(coin?.price, 24).toLocaleString('en-US', { maximumSignificantDigits: 4 })}{' '}
            <span className="text-xs font-normal text-[var(--paper-dim)]">NEAR</span>
          </b>
        </div>
        <div className="well p-2.5">
          <span className="block text-xs text-[var(--paper-dim)]">NAV</span>
          <b className="font-display block text-base tabular-nums sm:text-lg">
            {navBi === 0n ? (
              <span className="text-xs text-[var(--paper-dim)]">0 NEAR</span>
            ) : (
              <>
                {fromUnits(coin?.nav, 24).toLocaleString('en-US', { maximumSignificantDigits: 4 })}{' '}
                <span className="text-xs font-normal text-[var(--paper-dim)]">NEAR</span>
              </>
            )}
          </b>
        </div>
        <div className="well p-2.5">
          <span className="block text-xs text-[var(--paper-dim)]">mNAV</span>
          <b className="font-display block text-base tabular-nums sm:text-lg" style={{ color: mnavColor }}>
            {mnavText}
          </b>
          <span className="block truncate text-[11px] font-bold" style={{ color: mnavColor }} title={mnavLabel}>
            {mnavLabel}
          </span>
        </div>
        <div className="well p-2.5">
          <span className="block text-xs text-[var(--paper-dim)]">Your balance</span>
          <b className="font-display block truncate text-base tabular-nums text-[var(--accent)] sm:text-lg">
            {account ? (
              <>
                {fromUnits(balance ?? '0', 18).toLocaleString('en-US', { maximumFractionDigits: 2 })}{' '}
                <span className="text-xs font-normal text-[var(--paper-dim)]">METRO</span>
              </>
            ) : (
              <span className="text-xs font-normal text-[var(--paper-dim)]">Not connected</span>
            )}
          </b>
        </div>
      </div>

      {/* Chart */}
      <CoinChart history={history} />

      {/* Buy & Sell Boxes */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Buy Box */}
        <div className="well flex flex-col justify-between p-3">
          <div>
            <h4 className="font-display flex items-center gap-1.5 text-sm font-bold text-[var(--gold)]">
              <Icon name="coin" size={15} /> Buy $METRO
            </h4>
            <div className="mt-2">
              <label htmlFor="buy-near-amount" className="text-xs text-[var(--paper-dim)]">
                NEAR to spend
              </label>
              <div className="relative mt-1">
                <input
                  id="buy-near-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={buyNear}
                  onChange={(e) => setBuyNear(e.target.value)}
                  disabled={poolEmpty || isTrading}
                  className="field w-full pr-14 tabular-nums"
                />
                <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs font-bold text-[var(--paper-dim)]">
                  NEAR
                </span>
              </div>
            </div>

            <div className="min-h-12 py-2 text-xs" aria-live="polite">
              {buyLoading ? (
                <span className="text-[var(--paper-dim)]">Fetching quote...</span>
              ) : buyQuote ? (
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-[var(--paper-dim)]">You get:</span>
                    <b className="tabular-nums text-[var(--good)]">
                      ~{fromUnits(buyQuote, 18).toLocaleString('en-US', { maximumFractionDigits: 4 })} METRO
                    </b>
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--paper-dim)]">
                    <span>Min (3% slippage):</span>
                    <span className="tabular-nums">
                      {fromUnits(((BigInt(buyQuote) * 97n) / 100n).toString(), 18).toLocaleString('en-US', {
                        maximumFractionDigits: 4,
                      })}{' '}
                      METRO
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-[var(--paper-dim)]">Enter NEAR amount to preview quote</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-gold w-full py-1.5 text-sm"
            disabled={disabled || !buyQuote || isTrading || buyLoading}
            onClick={handleBuy}
          >
            {isTrading ? 'Confirming...' : 'Buy METRO'}
          </button>
        </div>

        {/* Sell Box */}
        <div className="well flex flex-col justify-between p-3">
          <div>
            <div className="flex items-baseline justify-between">
              <h4 className="font-display flex items-center gap-1.5 text-sm font-bold text-[var(--accent)]">
                <Icon name="coin" size={15} /> Sell $METRO
              </h4>
              {account && (
                <button
                  type="button"
                  onClick={handleMaxSell}
                  disabled={disabled || isTrading}
                  className="cursor-pointer text-xs font-bold text-[var(--accent)] hover:underline"
                >
                  Max: {fromUnits(balance ?? '0', 18).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </button>
              )}
            </div>
            <div className="mt-2">
              <label htmlFor="sell-metro-amount" className="text-xs text-[var(--paper-dim)]">
                METRO to sell
              </label>
              <div className="relative mt-1">
                <input
                  id="sell-metro-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={sellMetro}
                  onChange={(e) => setSellMetro(e.target.value)}
                  disabled={poolEmpty || isTrading}
                  className="field w-full pr-16 tabular-nums"
                />
                <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs font-bold text-[var(--paper-dim)]">
                  METRO
                </span>
              </div>
            </div>

            <div className="min-h-12 py-2 text-xs" aria-live="polite">
              {sellLoading ? (
                <span className="text-[var(--paper-dim)]">Fetching quote...</span>
              ) : sellQuote ? (
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-[var(--paper-dim)]">You get:</span>
                    <b className="tabular-nums text-[var(--good)]">
                      ~{fromUnits(sellQuote, 24).toLocaleString('en-US', { maximumFractionDigits: 4 })} NEAR
                    </b>
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--paper-dim)]">
                    <span>Min (3% slippage):</span>
                    <span className="tabular-nums">
                      {fromUnits(((BigInt(sellQuote) * 97n) / 100n).toString(), 24).toLocaleString('en-US', {
                        maximumFractionDigits: 4,
                      })}{' '}
                      NEAR
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-[var(--paper-dim)]">Enter METRO amount to preview quote</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-accent w-full py-1.5 text-sm"
            disabled={disabled || !sellQuote || isTrading || sellLoading}
            onClick={handleSell}
          >
            {isTrading ? 'Confirming...' : 'Sell METRO'}
          </button>
        </div>
      </div>

      {/* Secondary Stats */}
      <SubHead>Coin & Pool Ledger</SubHead>
      <div className="well p-3">
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <div>
            <StatRow
              k="Total supply"
              v={`${fromUnits(coin?.supply, 18).toLocaleString('en-US', { maximumFractionDigits: 2 })} METRO`}
            />
            <StatRow
              k="Pool reserves"
              v={`${fromUnits(coin?.metro_reserve, 18).toLocaleString('en-US', { maximumFractionDigits: 0 })} METRO / ${fromUnits(coin?.near_reserve, 24).toLocaleString('en-US', { maximumFractionDigits: 2 })} NEAR`}
            />
            <StatRow
              k="Treasury (1% fee)"
              v={`${fromUnits(coin?.treasury, 24).toLocaleString('en-US', { maximumFractionDigits: 4 })} NEAR`}
            />
          </div>
          <div>
            <StatRow
              k="Issued by rule"
              v={`${fromUnits(coin?.issued, 18).toLocaleString('en-US', { maximumFractionDigits: 2 })} METRO`}
              hint="0.5% minted into pool when mNAV >= 2.0x"
            />
            <StatRow
              k="Burned by rule"
              v={`${fromUnits(coin?.burned, 18).toLocaleString('en-US', { maximumFractionDigits: 2 })} METRO`}
              hint="10% treasury buyback & burn when mNAV < 0.9x"
            />
            <StatRow k="Total swaps" v={(coin?.swaps ?? 0).toLocaleString('en-US')} />
          </div>
        </div>
      </div>

      {/* How $METRO Works */}
      <section className="lore mt-3 space-y-1.5 p-3 text-xs leading-relaxed">
        <h4 className="font-display text-sm font-bold text-[var(--gold)]">How $METRO works</h4>
        <p>
          $METRO is Metropolix&apos;s NEP-141 token backed by all player cities. Its Net Asset Value (NAV) is computed
          from the treasury plus the cities&apos; gold index, divided by total supply.
        </p>
        <p>
          mNAV measures pool price relative to NAV. When mNAV &ge; 2.0x, the contract mints 0.5% new METRO to cool price.
          When mNAV &lt; 0.9x, the treasury buys back and burns 10% worth of METRO.
        </p>
        <p>
          Raids between players loot gold, shifting city reserves and directly moving NAV, so players can pump, dump,
          and play the gap between market price and city wealth.
        </p>
      </section>
    </Modal>
  );
}

'use client';

import CityPanel from './CityPanel';
import WarRoom from './WarRoom';
import Guide, { type GuideTarget } from './Guide';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import * as sim from '@metropolix/sim';
import { CityRenderer, type Quality } from '@/lib/renderer';
import { loadState, saveState } from '@/lib/persist';
import { loadChain } from '@/lib/chain-meta';
import ChainPanel, { useAccount } from './ChainPanel';
import Shop from './Shop';
import SocialDrawer from './SocialDrawer';
import CubeIcon from './CubeIcon';
import ArcPicker from './ArcPicker';
import Icon, { type IconName } from './Icon';
import NpcDialog, { type NpcTalk } from './NpcDialog';
import Marketplace from './Marketplace';
import Vault from './Vault';
import CoinPanel from './CoinPanel';
import FindReveal from './FindReveal';
import Profile from './Profile';
import Portrait from './Portrait';
import { CloseX } from './ui';
import BuildingPanel from './BuildingPanel';
import NamePrompt from './NamePrompt';
import { ItemThumb } from './ItemThumb';
import { Banners, Floaters, classify, fx, type FloatPart } from './Fx';
import { npcName } from '@/lib/citizens';
import TileTip from './TileTip';
import { HudTip, type TipInfo } from './HudTip';
import { hudInfo } from './hudInfo';
import { useEscape } from '@/lib/escape';

const { BUILDINGS, RIVALS } = sim;
type Tool = sim.BuildingKind | 'demolish' | 'pack' | 'select';

export default function Game() {
  const hostRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CityRenderer | null>(null);
  const stateRef = useRef<sim.GameState | null>(null);
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const [tool, setTool] = useState<Tool>('select'); // 'select': taps open buildings instead of building
  const [inspect, setInspect] = useState<{ x: number; y: number } | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [warOpen, setWarOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [coinOpen, setCoinOpen] = useState(false);
  const [reveal, setReveal] = useState<sim.RelicKind | null>(null);
  const findsSeen = useRef<number | null>(null);
  const [profileOf, setProfileOf] = useState<sim.PlayerRow | 'you' | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [guideTarget, setGuideTarget] = useState<GuideTarget>(null);
  const [talk, setTalk] = useState<NpcTalk | null>(null);
  const talkOpenRef = useRef(false);
  talkOpenRef.current = talk !== null;
  const toolRef = useRef<Tool>(tool);
  toolRef.current = tool;
  const account = useAccount();
  const [gfx, setGfx] = useState<Gfx>('auto'); // read from storage after mount so server and client HTML match
  const [gfxNow, setGfxNow] = useState<Quality>('high');
  const gfxRef = useRef(gfx);
  gfxRef.current = gfx;

  const pointer = useRef({ x: 0, y: 0 });
  const snapRef = useRef<Snap | null>(null);
  const seenSeq = useRef<number | null>(null);

  /** Turn new log lines into banners. Lines caused by your own tap already got a floater, so only level-ups pass. */
  const announce = useCallback((fromAction: boolean) => {
    const s = stateRef.current; if (!s) return;
    if (seenSeq.current === null) { seenSeq.current = s.logSeq ?? 0; return; }
    const fresh = Math.min(5, (s.logSeq ?? 0) - seenSeq.current);
    seenSeq.current = s.logSeq ?? 0;
    for (const msg of s.log.slice(0, Math.max(0, fresh)).reverse()) {
      const c = classify(msg);
      if (c && (!fromAction || c.big)) fx.banner(msg, c.tone, c.icon, c.big);
    }
  }, []);

  const redraw = useCallback(() => {
    const s = stateRef.current; if (!s) return;
    rendererRef.current?.draw(s);
    announce(false);
    // a new Epic or rarer relic gets the full reveal; Rare ones only get the banner from announce()
    if (findsSeen.current !== null && s.finds > findsSeen.current && s.lastFind && sim.RELICS[s.lastFind.kind].rarity !== 'rare') setReveal(s.lastFind.kind);
    findsSeen.current = s.finds;
    snapRef.current = snap(s);
    bump();
  }, [announce]);

  const act = useCallback((r: sim.Result | undefined) => {
    const s = stateRef.current; if (!s) return;
    const { x, y } = pointer.current;
    if (r && !r.ok) {
      sim.pushLog(s, r.msg);
      fx.float(x, y, [{ text: r.msg, tone: 'bad' }]);
    } else if (snapRef.current) {
      fx.float(x, y, diffParts(snapRef.current, snap(s)));
    }
    announce(true);
    saveState(s);
    redraw();
  }, [redraw, announce]);

  useEffect(() => {
    const h = (e: PointerEvent) => { pointer.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('pointerdown', h, true);
    return () => window.removeEventListener('pointerdown', h, true);
  }, []);

  // boot: load state, start renderer and the 1s game loop
  useEffect(() => {
    stateRef.current = loadState();
    const r = new CityRenderer();
    rendererRef.current = r;
    // dev-only handle for visual and performance QA from the browser console
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __renderer?: CityRenderer }).__renderer = r;
    spriteUrl = (k) => r.previewUrl(k);
    const saved = readGfx();
    setGfx(saved);
    setGfxNow(r.setQuality(saved));
    r.onQualityChange = setGfxNow;
    r.onNpcClick = (n) => {
      const s = stateRef.current; if (!s || !s.arc) return;
      r.pauseNpc(n.id);
      setTalk({ id: n.id, variant: n.variant, name: npcName(s.arc, n.id), x: n.x, y: n.y, encounter: sim.npcEncounter(s, n.variant), reply: null });
      saveState(s);
    };
    r.onTileClick = ({ x, y }) => {
      const s = stateRef.current; if (!s) return;
      if (talkOpenRef.current) { r.pauseNpc(-1); setTalk(null); return; }
      const t = toolRef.current;
      if (t === 'demolish') return act(sim.demolish(s, x, y));
      if (t === 'pack') return act(sim.packUp(s, x, y));
      // tapping a building (in any build mode) opens it, so you can see and upgrade it
      if (s.grid[y]![x]) { setInspect({ x, y }); return; }
      if (t === 'select') return;
      act(sim.build(s, x, y, t));
    };
    r.onTileHover = (t) => setTip(t ? { x: t.x, y: t.y } : null);
    r.hoverCheck = (t) => {
      const s = stateRef.current; if (!s) return false;
      const k = toolRef.current;
      if (k === 'demolish' || k === 'pack') return !!s.grid[t.y]![t.x]; // red marks what will go
      if (k === 'select' || s.grid[t.y]![t.x]) return false; // a building: tapping opens it
      return sim.buildBlocker(s, t.x, t.y, k) !== null;
    };
    let cancelled = false;
    r.init(hostRef.current!).then(() => { if (!cancelled) redraw(); });
    const timer = setInterval(() => {
      const s = stateRef.current; if (!s || elsewhereRef.current) return;
      sim.step(s);
      if (s.tick % 5 === 0) saveState(s);
      redraw();
    }, 1000);
    return () => { cancelled = true; clearInterval(timer); r.destroy(); rendererRef.current = null; spriteUrl = null; };
  }, [act, redraw]);

  useEffect(() => { rendererRef.current?.setPlacing(tool !== 'demolish' && tool !== 'pack' && tool !== 'select'); }, [tool]);
  const pickGfx = () => {
    // read the ref, not the render-time value, so two quick clicks advance two steps
    const cur = gfxRef.current;
    const next: Gfx = cur === 'auto' ? 'high' : cur === 'high' ? 'lite' : 'auto';
    gfxRef.current = next;
    setGfx(next);
    try { localStorage.setItem(GFX_KEY, next); } catch { /* private mode: keep it for this visit only */ }
    const r = rendererRef.current; if (r) setGfxNow(r.setQuality(next));
  };
  // a full window hides the map, so stop drawing it until the window closes
  // One city, one tab: two tabs would overwrite each other's save. The newest tab plays;
  // older ones freeze and offer to take over.
  const [elsewhere, setElsewhere] = useState(false);
  const elsewhereRef = useRef(false);
  elsewhereRef.current = elsewhere;
  const channel = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel('metropolix-tabs');
    channel.current = ch;
    ch.onmessage = (e) => {
      if (e.data !== 'playing-here' || elsewhereRef.current) return;
      const s = stateRef.current; if (s) saveState(s); // hand over our latest progress first
      elsewhereRef.current = true;
      setElsewhere(true);
    };
    ch.postMessage('playing-here');
    // an older tab saves when it hears us; pick that up if it is newer than what we loaded
    const t = window.setTimeout(() => {
      const fresh = loadState(), cur = stateRef.current;
      if (cur && fresh.tick > cur.tick) { stateRef.current = fresh; seenSeq.current = null; findsSeen.current = null; }
    }, 150);
    return () => { window.clearTimeout(t); ch.close(); channel.current = null; };
  }, []);
  const playHere = () => {
    channel.current?.postMessage('playing-here');
    // give the other tab a moment to save, then continue from the newest save
    window.setTimeout(() => { stateRef.current = loadState(); seenSeq.current = null; findsSeen.current = null; elsewhereRef.current = false; setElsewhere(false); redraw(); }, 150);
  };
  const covered = cityOpen || warOpen || marketOpen || vaultOpen || profileOf !== null || inspect !== null || elsewhere || stateRef.current?.arc === null;
  useEffect(() => { rendererRef.current?.setPaused(covered); }, [covered]);
  const arcId = stateRef.current?.arc ?? null;
  useEffect(() => { rendererRef.current?.setArc(arcId); }, [arcId]);
  useEffect(() => { if (arcId) document.body.dataset.arc = arcId; else delete document.body.dataset.arc; }, [arcId]);

  const s = stateRef.current;
  const st = s ? sim.stats(s) : null;
  const others = s ? sim.worldRows(s) : [];

  const arc = s ? sim.arcDef(s.arc) : null;
  const myName = s?.name || account || 'Mayor';
  const profile = (() => {
    if (!s || !profileOf) return null;
    const all = [...others, sim.myRow(s, myName)];
    const p = profileOf === 'you' ? sim.myProfile(s, myName) : sim.simProfile(profileOf, s);
    const pos = sim.ranked(all, 'chainPower').find((r) => r.id === p.id)?.rank;
    return { p, rank: pos ? { pos, of: all.length } : undefined };
  })();
  const closeTalk = () => { rendererRef.current?.pauseNpc(-1); setTalk(null); };
  // Escape as a back button, one layer per press: NPC talk, the shop drawer, then a tool mode
  useEscape(talk !== null, closeTalk);
  useEscape(shopOpen, () => setShopOpen(false));
  useEscape(tool !== 'select', () => setTool('select'));
  const talkAct = (a: sim.NpcAction) => { if (!s || !talk) return; const reply = sim.npcAct(s, a); act(undefined); setTalk({ ...talk, reply }); };
  const talkMore = () => { if (!s || !talk) return; setTalk({ ...talk, encounter: sim.npcEncounter(s, talk.variant), reply: null }); };
  const pulse = (t: GuideTarget) => (guideTarget === t ? 'nudge outline-3 outline-offset-2 outline-[var(--gold)] outline' : '');

  return (
    <div className="flex h-screen flex-col">
      <header className="panel z-20 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-none border-x-0 border-t-0 px-3 py-1.5">
        <h1 className="font-display text-xl font-bold text-[var(--accent)]">Metropolix</h1>
        {s && st && (
          <div className="flex flex-1 flex-wrap gap-1.5">
            {(() => { const info = hudInfo(s, st); return (<>
            <Chip icon="coin" info={info.gold} value={s.gold} n={s.gold} rate={st.net} extra={`${st.net >= 0 ? '+' : ''}${st.net}/s`} bad={st.net < 0} />
            <Chip icon="people" info={info.citizens} value={`${s.pop}/${st.housing}`} />
            <Chip icon="smile" info={info.happiness} value={`${Math.round(st.happinessPm / 10)}%`} bad={st.happinessPm < 250} />
            <Chip icon="book" info={info.education} value={`${Math.round(st.eduCoverPm / 10)}%`} />
            <Chip icon="wood" info={info.wood} value={s.wood} n={s.wood} rate={sim.unitsPerSec(st.woodMilli)} extra={st.woodMilli ? `+${sim.unitsPerSec(st.woodMilli)}/s` : undefined} />
            <Chip icon="ore" info={info.ore} value={s.ore} n={s.ore} rate={sim.unitsPerSec(st.oreMilli)} extra={st.oreMilli ? `+${sim.unitsPerSec(st.oreMilli)}/s` : undefined} />
            <Chip icon="food" info={info.food} value={s.food} n={s.food} rate={sim.unitsPerSec(st.foodMilli - st.foodUse * 1000)} extra={`${st.foodMilli >= st.foodUse * 1000 ? '+' : ''}${sim.unitsPerSec(st.foodMilli - st.foodUse * 1000)}/s`} bad={st.foodMilli < st.foodUse * 1000} />
            <Chip icon="crown" info={info.chainPower} value={st.chainPower} n={st.chainPower} accent />
            </>); })()}
          </div>
        )}
        <button className={`btn btn-quiet ${pulse('social')}`} onClick={() => setSocialOpen((v) => !v)} aria-expanded={socialOpen}>
          <Icon name="chat" size={18} /> Social
        </button>
        <button className="btn btn-quiet" onClick={() => { void loadChain().then((chain) => (account ? chain.signOut() : chain.openModal())); }}>
          {account ? <><span className="max-w-[10rem] truncate">{account}</span><span className="text-[var(--paper-dim)]">Sign out</span></> : 'Connect NEAR'}
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="max-h-[36vh] overflow-auto border-b-2 border-[var(--ink)] bg-[var(--slab-lo)] p-2 md:max-h-none md:w-48 md:border-r-2 md:border-b-0">
          {s && st && (
            <button className="panel profile-card mb-2 flex w-full items-center gap-2 p-2 text-left" onClick={() => setProfileOf('you')} title="Open your profile">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[var(--ink)] bg-[var(--accent)] text-xl font-bold text-[var(--accent-ink)] [clip-path:polygon(50%_0,100%_22%,100%_70%,50%_100%,0_70%,0_22%)]" title={`Level ${st.level}`}>{st.level}</div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="truncate font-bold">{myName}</div>
                <div className="text-[var(--paper-dim)]">{arc?.name ?? 'No race yet'}</div>
                <XpBar xp={s.xp} />
                <div className="flex items-center gap-2"><span className="flex items-center gap-1" title="Trophies"><Icon name="trophy" size={14} />{s.trophies}</span>{s.shieldUntil > s.tick && <span className="flex items-center gap-1" title="Shield: raids are blocked"><Icon name="shield" size={14} />{s.shieldUntil - s.tick}s</span>}</div>
              </div>
            </button>
          )}
          <div className="grid grid-cols-6 gap-2 md:grid-cols-1">
            <SideBtn icon="swords" label="Attack" tone="btn-accent" onClick={() => setWarOpen(true)} big />
            <SideBtn icon="city" label="City" onClick={() => setCityOpen(true)} />
            <SideBtn icon="bag" label={shopOpen ? 'Close shop' : 'Shop'} tone="btn-gold" extra={pulse('shop')} onClick={() => setShopOpen((v) => !v)} />
            <SideBtn icon="scale" label="Market" onClick={() => setMarketOpen(true)} />
            <SideBtn icon="chest" label="Vault" onClick={() => setVaultOpen(true)} />
            <SideBtn icon="hammer" label={tool === 'demolish' ? 'Demolishing' : 'Demolish'} tone={tool === 'demolish' ? 'btn-bad' : ''} onClick={() => setTool((t) => (t === 'demolish' ? 'select' : 'demolish'))} />
          </div>
          {s && (
            <div className={`well tool-box mt-2 flex items-center gap-1 p-1 ${tool === 'demolish' ? '!border-[var(--bad)]' : tool === 'select' ? '' : '!border-[var(--accent)]'}`} aria-live="polite">
              {/* the box opens the shop to pick (or change) a building; the X goes back to just looking around */}
              <button className="flex min-w-0 flex-1 items-center gap-2 p-0.5 text-left" onClick={() => { setTool((t) => (t === 'demolish' || t === 'pack' ? 'select' : t)); setShopOpen(true); }}
                title={tool === 'select' ? 'Pick a building to build' : 'Pick another building'}>
                <span className="flex h-10 w-10 shrink-0 items-end justify-center overflow-hidden bg-[var(--slab)]">
                  {tool === 'demolish' || tool === 'pack' || tool === 'select' ? <span className="self-center"><Icon name={tool === 'pack' ? 'box' : tool === 'select' ? 'bag' : 'hammer'} size={24} /></span> : <Sprite kind={tool} />}
                </span>
                <span className="min-w-0 text-xs leading-tight">
                  <span className="block text-[var(--paper-dim)]">{tool === 'select' ? 'Tap a building to open it' : tool === 'demolish' || tool === 'pack' ? 'Tap a building' : 'Tap the map to build'}</span>
                  <b className={`block truncate text-sm ${tool === 'demolish' ? 'text-[var(--bad)]' : tool === 'select' ? 'text-[var(--gold)]' : ''}`}>{tool === 'select' ? 'Choose a building' : tool === 'demolish' ? 'Demolish, 40% back' : tool === 'pack' ? 'Pack into storage' : BUILDINGS[tool].name}</b>
                </span>
              </button>
              {tool !== 'select' && <CloseX onClick={() => setTool('select')} label={tool === 'pack' ? 'Stop packing' : tool === 'demolish' ? 'Stop demolishing' : 'Stop building'} className="!h-7 !w-7 self-start" />}
            </div>
          )}
          {s && sim.BUILDING_KINDS.some((k) => (s.inventory[k] ?? 0) > 0) && (
            <>
              <Heading>In storage</Heading>
              <div className="space-y-1">
                {sim.BUILDING_KINDS.filter((k) => (s.inventory[k] ?? 0) > 0).map((k) => (
                  <button key={k} onClick={() => setTool(k)} aria-pressed={tool === k} className="btn btn-quiet w-full justify-start text-sm">
                    <span className="flex h-7 w-7 shrink-0 items-end justify-center overflow-hidden"><Sprite kind={k} size={28} /></span>
                    <span className="truncate">{BUILDINGS[k].name}</span> <b className="ml-auto text-[var(--good)] tabular-nums">x{s.inventory[k]}</b>
                  </button>
                ))}
              </div>
            </>
          )}
          {s && (
            <>
              <Heading>Storehouse</Heading>
              <ul className="well space-y-1 p-2 text-xs tabular-nums">
                {sim.GOOD_KINDS.map((g) => (
                  <li key={g} className={`flex items-center gap-1 ${s.goods[g] > 0 ? '' : 'text-[var(--paper-dim)]'}`} title={`${sim.RESOURCES[g].name}: ${sim.RESOURCES[g].desc}`}>
                    <ItemThumb k={g} size={16} /><span className="truncate">{sim.RESOURCES[g].name}</span><b className="ml-auto">{s.goods[g]}</b>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className={`well mt-2 p-2 text-xs ${pulse('tax')}`}>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><Icon name="coin" size={14} /> Tax rate</span><b className="text-sm tabular-nums">{s?.taxRate ?? 10}%</b></div>
            <input type="range" min={0} max={30} value={s?.taxRate ?? 10} aria-label="Tax rate" className="mt-1 w-full"
              onChange={(e) => { if (s) { sim.setTax(s, +e.target.value); act(undefined); } }} />
            <p className="text-xs text-[var(--paper-dim)]">More gold, fewer smiles.</p>
          </div>
        </aside>

        <section className="relative min-h-[50vh] min-w-0 flex-1">
          <div ref={hostRef} className="absolute inset-0 cursor-crosshair" />
          {s && tip && !talk && !shopOpen && <TileTip s={s} tile={tip} tool={tool} preview={(k) => rendererRef.current?.previewUrl(k) ?? null} />}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
            <button onClick={() => rendererRef.current?.zoomBy(1.3)} className="btn btn-quiet h-9 w-9 !p-0 text-lg" aria-label="Zoom in">+</button>
            <button onClick={() => rendererRef.current?.zoomBy(1 / 1.3)} className="btn btn-quiet h-9 w-9 !p-0 text-lg" aria-label="Zoom out">−</button>
            <button onClick={() => rendererRef.current?.resetView()} className="btn btn-quiet h-9 w-9 !p-0" aria-label="Reset view"><Icon name="tent" size={18} /></button>
            <button onClick={pickGfx} className="btn btn-quiet h-9 w-9 !p-0 text-[10px] leading-none font-bold"
              title={`Graphics: ${GFX_HINT[gfx]}${gfx === 'auto' ? ` (now ${gfxNow === 'high' ? 'HD' : 'Lite'})` : ''}. Click to change.`}
              aria-label={`Graphics quality: ${gfx === 'auto' ? 'automatic' : gfx === 'high' ? 'HD' : 'Lite'}`}>
              {gfx === 'auto' ? <span className="flex flex-col items-center gap-0.5"><span>Auto</span><span className="text-[9px] text-[var(--paper-dim)]">{gfxNow === 'high' ? 'HD' : 'Lite'}</span></span> : gfx === 'high' ? 'HD' : 'Lite'}
            </button>
          </div>
          <p className="pointer-events-none absolute bottom-2 left-3 text-[11px] text-[var(--paper-dim)] [text-shadow:0_1px_0_#000]">Drag to pan. Scroll or use + and − to zoom. Click a citizen to talk.</p>
          {s && s.arc && talk && <NpcDialog talk={talk} arc={s.arc} width={hostRef.current?.clientWidth ?? 800} onAct={talkAct} onMore={talkMore} onClose={closeTalk} />}
          {s && (
            <Shop open={shopOpen} s={s} tool={tool} preview={(k) => rendererRef.current?.previewUrl(k) ?? null} onSelect={(k) => { setTool(k); setShopOpen(false); }} onClose={() => setShopOpen(false)} />
          )}
        </section>

        <aside className="max-h-[30vh] overflow-auto border-t-2 border-[var(--ink)] bg-[var(--slab-lo)] p-2 md:max-h-none md:w-64 md:border-t-0 md:border-l-2">
          {s && st && (
            <>
              <section className="panel p-2.5">
                <h2 className="font-display mb-1.5 flex items-center gap-1.5 text-base font-bold"><Icon name="swords" size={18} /> Army <span className="ml-auto text-sm font-normal tabular-nums [font-family:var(--font-body)]">{s.troops} of {st.troopCap}</span></h2>
                <div className="meter mb-2" role="meter" aria-label={`${arc?.troop ?? 'Troop'}s`} aria-valuenow={s.troops} aria-valuemin={0} aria-valuemax={st.troopCap}><i style={{ width: `${Math.min(100, (s.troops * 100) / Math.max(1, st.troopCap))}%` }} /></div>
                <div className="flex gap-3 text-sm tabular-nums">
                  <span className="flex items-center gap-1" title="Attack"><Icon name="swords" size={14} />{st.attack}</span>
                  <span className="flex items-center gap-1" title="Defense"><Icon name="shield" size={14} />{st.defense}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <button className="btn btn-quiet text-xs" onClick={() => act(sim.trainTroops(s, 1))}>Train 1</button>
                  <button className="btn btn-quiet text-xs" onClick={() => act(sim.trainTroops(s, 5))}>Train 5</button>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--paper-dim)] tabular-nums">Each: <Icon name="coin" size={11} />{st.troopCost} <Icon name="ore" size={11} />{sim.TROOP_ORE_COST}</p>
                <button className="btn btn-accent mt-2 w-full text-sm" onClick={() => setWarOpen(true)}>Open war room</button>
              </section>

              <section className="panel mt-2.5 p-2.5">
                <h2 className="font-display mb-1.5 flex items-center gap-1.5 text-base font-bold"><Icon name="city" size={18} /> Nearby mayors</h2>
                <ul className="space-y-1.5">
                  {[...s.world.mayors].sort((x, y) => Math.abs(sim.mayorPower(x) - (st?.chainPower ?? 0)) - Math.abs(sim.mayorPower(y) - (st?.chainPower ?? 0))).slice(0, 5).map((m) => {
                    const cd = Math.max(0, (s.cooldowns[m.id] ?? 0) - s.tick);
                    const sh = sim.shieldLeft(s, m);
                    return (
                      <li key={m.id} className="well flex items-center gap-2 px-2 py-1.5 text-sm">
                        <Portrait id={sim.mayorPortrait(m)} className="h-9 w-8 shrink-0 border border-[var(--ink)]" title="" />
                        <div className="min-w-0 flex-1"><b className="block truncate">{m.name}</b>
                          <span className="flex gap-2.5 text-xs text-[var(--paper-dim)] tabular-nums">
                            <span className="flex items-center gap-0.5" title="Defense"><Icon name="shield" size={11} />{sim.mayorDefense(m)}</span>
                            <span className="flex items-center gap-0.5" title="Treasury"><Icon name="coin" size={11} />{m.gold}</span>
                          </span>
                        </div>
                        <button className="btn btn-quiet w-14 text-xs tabular-nums" disabled={cd > 0 || sh > 0 || s.troops === 0} onClick={() => act(sim.attackRival(s, m.id))} title={sh > 0 ? 'Shielded after a recent raid' : cd > 0 ? 'Your troops are resting' : `Quick raid on ${m.name}`}>{sh > 0 ? `${sh}s` : cd > 0 ? `${cd}s` : 'Raid'}</button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <ChainPanel
                getState={() => stateRef.current}
                onChange={() => act(undefined)}
                onLog={(m) => { sim.pushLog(s, m); redraw(); }}
                onOpenCoin={() => setCoinOpen(true)}
                onReplace={() => { seenSeq.current = null; findsSeen.current = null; act(undefined); }}
              />

              <section className="panel mt-2.5 p-2.5">
                <h2 className="font-display mb-1 flex items-center gap-1.5 text-base font-bold"><Icon name="scroll" size={18} /> Log</h2>
                <ol className="text-xs text-[var(--paper-dim)]" aria-live="polite">
                  {groupLog(s.log, 10).map(({ text, n }, i) => (
                    <li key={`${i}-${text}`} className="flex items-baseline gap-2 border-b border-[var(--slab-hi)] py-1 last:border-0 first:text-[var(--paper)]">
                      <span className="flex-1">{text}</span>{n > 1 && <span className="shrink-0 tabular-nums text-[var(--paper-dim)]">x{n}</span>}
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}
        </aside>
      </main>
      {s && <Guide s={s} shopOpen={shopOpen} socialOpen={socialOpen} onTarget={setGuideTarget} />}
      <Marketplace open={marketOpen} s={s} act={act} onClose={() => setMarketOpen(false)} preview={(k) => rendererRef.current?.previewUrl(k) ?? null}
        onPackUp={() => { setMarketOpen(false); setShopOpen(false); setTool('pack'); }} />
      {s && inspect && (
        <BuildingPanel s={s} x={inspect.x} y={inspect.y} act={act} onClose={() => setInspect(null)} preview={(k) => rendererRef.current?.previewUrl(k) ?? null}
          onPack={() => { act(sim.packUp(s, inspect.x, inspect.y)); setInspect(null); }}
          onDemolish={() => { act(sim.demolish(s, inspect.x, inspect.y)); setInspect(null); }} />
      )}
      {profile && (
        <Profile p={profile.p} rank={profile.rank} xp={profileOf === 'you' ? s?.xp : undefined} renameCost={s ? sim.renameCost(s) : 0} onClose={() => setProfileOf(null)}
          onRename={profileOf === 'you' ? () => setRenaming(true) : undefined} />
      )}
      {s && s.arc !== null && !elsewhere && (!s.name || renaming) && (
        <NamePrompt arc={s.arc} initial={renaming ? s.name : ''} cost={renaming ? sim.renameCost(s) : 0} gold={s.gold}
          onCancel={renaming ? () => setRenaming(false) : undefined}
          onSave={(n) => { const r = sim.setName(s, n); if (r.ok) { setRenaming(false); act(r); } return r; }} />
      )}
      <CoinPanel open={coinOpen} account={account} onClose={() => setCoinOpen(false)} onLog={(m) => { if (s) { sim.pushLog(s, m); redraw(); } }} />
      <Vault open={vaultOpen} s={s} account={account} act={act} onClose={() => setVaultOpen(false)} />
      {s && reveal && (
        <FindReveal s={s} kind={reveal} onClose={() => setReveal(null)}
          onDisplay={() => { act(sim.displayRelic(s, reveal)); setReveal(null); }}
          onVault={() => { setReveal(null); setVaultOpen(true); }} />
      )}
      <WarRoom open={warOpen} s={s} act={act} onClose={() => setWarOpen(false)} />
      <CityPanel open={cityOpen} s={s} act={act} onClose={() => setCityOpen(false)} onWar={() => { setCityOpen(false); setWarOpen(true); }} />
      {elsewhere && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#05070bdd] p-4" role="alertdialog" aria-labelledby="elsewhere-title">
          <div className="window win-in w-full max-w-sm"><div className="p-5">
            <h2 id="elsewhere-title" className="font-display flex items-center gap-2 text-xl font-bold"><Icon name="city" size={24} /> Open in another tab</h2>
            <p className="mt-2 text-sm text-[var(--paper-dim)]">Your city is running in another tab, so this one paused to keep your save safe.</p>
            <button className="btn btn-accent mt-4 w-full py-2 text-base" onClick={playHere} autoFocus>Play here</button>
          </div></div>
        </div>
      )}
      {s && s.arc === null && <ArcPicker onChoose={(id) => act(sim.chooseArc(s, id))} />}
      <Floaters />
      <Banners />
      <SocialDrawer open={socialOpen} onClose={() => setSocialOpen(false)} s={s} act={act} playerName={myName} players={others} onProfile={(p) => setProfileOf(p.isYou ? 'you' : p)} preview={(k) => rendererRef.current?.previewUrl(k) ?? null} />
    </div>
  );
}

const PLAYER_SEED = 2026;
type Gfx = Quality | 'auto';
const GFX_KEY = 'metropolix-gfx';
const GFX_HINT: Record<Gfx, string> = {
  auto: 'automatic, drops to Lite when the game runs slow',
  high: 'HD, sharp pixels at 60 fps',
  lite: 'Lite, 30 fps and fewer walkers for older devices',
};
function readGfx(): Gfx {
  try { const v = localStorage.getItem(GFX_KEY); if (v === 'high' || v === 'lite' || v === 'auto') return v; } catch { /* storage blocked */ }
  return 'auto';
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display mt-3 mb-1.5 text-sm font-bold text-[var(--paper-dim)]">{children}</h2>;
}
/**
 * One resource in the top bar. `n` is the raw number: when it jumps by more than its normal
 * per-second drift (a purchase, a raid, a sale) the chip flashes green or red for a moment.
 */
function Chip({ icon, info, value, n, rate = 0, extra, accent, bad }: { icon: IconName; info: TipInfo; value: React.ReactNode; n?: number; rate?: number; extra?: string; accent?: boolean; bad?: boolean }) {
  const prev = useRef(n);
  const [flash, setFlash] = useState<{ dir: 'up' | 'down'; key: number } | null>(null);
  useEffect(() => {
    if (n === undefined || prev.current === undefined) { prev.current = n; return; }
    const d = n - prev.current;
    prev.current = n;
    if (Math.abs(d - rate) > Math.max(2, Math.abs(rate))) setFlash({ dir: d > 0 ? 'up' : 'down', key: Date.now() });
  }, [n, rate]);
  return (
    <HudTip icon={icon} info={info} className="well relative isolate flex items-center gap-1.5 px-2 py-0.5 text-sm">
      {flash && <span key={flash.key} aria-hidden className={`absolute inset-0 -z-10 ${flash.dir === 'up' ? 'chip-up' : 'chip-down'}`} />}
      <Icon name={icon} size={18} />
      <b className={`text-base tabular-nums ${accent ? 'text-[var(--accent)]' : ''}`}>{typeof value === 'number' ? value.toLocaleString('en-US') : value}</b>
      {extra && <small className={bad ? 'text-[var(--bad)]' : 'text-[var(--paper-dim)]'}>{extra}</small>}
    </HudTip>
  );
}
function XpBar({ xp }: { xp: number }) {
  const lv = sim.levelFromXp(xp);
  const lo = sim.LEVEL_XP[lv - 1] ?? 0;
  const hi = sim.LEVEL_XP[lv];
  const pct = hi === undefined ? 100 : Math.floor(((xp - lo) * 100) / (hi - lo));
  return <div className="meter my-1" title={hi === undefined ? 'Max level' : `${xp - lo} of ${hi - lo} XP to level ${lv + 1}`}><i style={{ width: `${pct}%` }} /></div>;
}
/** Building art from the live sprite bank, with a cube as a fallback before Pixi is ready. */
function Sprite({ kind, size = 40 }: { kind: sim.BuildingKind; size?: number }) {
  const url = spriteUrl?.(kind) ?? null;
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img src={url} alt="" width={size} height={size} style={{ imageRendering: 'pixelated' }} /> : <CubeIcon color={BUILDINGS[kind].color} height={BUILDINGS[kind].height} size={size * 0.7} />;
}
let spriteUrl: ((k: sim.BuildingKind) => string | null) | null = null;

/**
 * Collapse repeats so a warning that fires every few seconds shows once with a count,
 * at the spot of its newest copy, even when other lines arrive in between.
 */
function groupLog(log: string[], max: number): { text: string; n: number }[] {
  const out: { text: string; n: number }[] = [];
  const at = new Map<string, { text: string; n: number }>();
  for (const text of log.slice(0, 60)) {
    const hit = at.get(text);
    if (hit) { hit.n++; continue; }
    if (out.length === max) continue;
    const row = { text, n: 1 };
    at.set(text, row); out.push(row);
  }
  return out;
}

type Snap = Record<'gold' | 'wood' | 'ore' | 'food' | 'xp' | 'troops' | sim.GoodKind, number>;
const snap = (s: sim.GameState): Snap => ({ gold: s.gold, wood: s.wood, ore: s.ore, food: s.food, xp: s.xp, troops: s.troops, ...s.goods });
const SNAP_ICON: Record<keyof Snap, IconName> = { gold: 'coin', wood: 'wood', ore: 'ore', food: 'food', xp: 'star', troops: 'swords', moonleaf: 'moonleaf', spice: 'spice', hides: 'hides', emberstone: 'emberstone', gears: 'gears' };

/** What one action changed, as floating numbers: spending in red, gains in green or gold. */
function diffParts(a: Snap, b: Snap): FloatPart[] {
  const out: FloatPart[] = [];
  for (const k of Object.keys(SNAP_ICON) as (keyof Snap)[]) {
    const d = (b[k] ?? 0) - (a[k] ?? 0);
    if (d === 0) continue;
    out.push({ icon: SNAP_ICON[k], text: `${d > 0 ? '+' : ''}${d.toLocaleString('en-US')}${k === 'xp' ? ' XP' : ''}`, tone: d < 0 ? 'bad' : k === 'gold' || k === 'xp' ? 'gold' : 'good' });
  }
  return out.slice(0, 4);
}

function SideBtn({ icon, label, tone = 'btn-quiet', onClick, big, extra = '' }: { icon: IconName; label: string; tone?: string; onClick: () => void; big?: boolean; extra?: string }) {
  return (
    <button onClick={onClick} className={`btn ${tone || 'btn-quiet'} flex-col md:flex-row md:justify-start md:gap-2.5 ${big ? 'py-2.5 md:py-3.5 md:text-lg' : 'py-1.5 md:py-2.5'} ${extra}`}>
      <Icon name={icon} size={big ? 30 : 26} />
      <span>{label}</span>
    </button>
  );
}

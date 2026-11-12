'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as sim from '@metropolix/sim';
import Portrait from './Portrait';
import Icon from './Icon';
import { CloseX } from './ui';
import { useEscape } from '@/lib/escape';

type Tab = 'chat' | 'news' | 'board' | 'players';
const TABS: { id: Tab; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'news', label: 'News' },
  { id: 'board', label: 'Ranks' },
  { id: 'players', label: 'Players' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  s: sim.GameState | null;
  act: (r?: sim.Result) => void;
  playerName: string;
  players: sim.PlayerRow[];
  onProfile: (p: sim.PlayerRow) => void;
  preview?: (k: sim.BuildingKind) => string | null;
}

const PLAYER_SEED = 2026; // chat bot lines only; the player list comes from Game

export default function SocialDrawer({ open, onClose, s, act, playerName, players: sim_players, onProfile, preview }: Props) {
  const [tab, setTab] = useState<Tab>('chat');
  useEscape(open, onClose);
  // the chat only needs who is out there, so it must not restart every time a treasury changes
  const idKey = sim_players.map((p) => p.id).join();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chatPlayers = useMemo(() => sim_players, [idKey]);

  return (
    <aside
      className={`panel fixed top-0 right-0 z-30 flex h-full w-[min(380px,100vw)] flex-col rounded-none border-y-0 border-r-0 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      aria-hidden={!open} inert={!open} aria-label="Social"
    >
      <div className="window-title m-1 mb-0 flex items-center justify-between px-3 py-2">
        <h2 className="font-display flex items-center gap-2 text-xl font-bold"><Icon name="chat" size={22} /> Social</h2>
        <CloseX onClick={onClose} label="Close social" />
      </div>
      <div className="flex gap-1 border-b-2 border-[var(--ink)] bg-[var(--slab-lo)] px-2 pt-1.5" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className="tab flex-1 text-sm">
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {/* Chat stays mounted so bots keep talking while other tabs are open */}
        <div className={tab === 'chat' ? 'h-full' : 'hidden'}>{chatPlayers.length > 0 && <Chat players={chatPlayers} name={playerName} me={s?.portrait} />}</div>
        {tab === 'news' && s && <News s={s} />}
        {tab === 'board' && s && <Board s={s} players={sim_players} name={playerName} onProfile={onProfile} />}
        {tab === 'players' && s && <Players s={s} players={sim_players} name={playerName} onProfile={onProfile} />}
      </div>
      <p className="border-t-2 border-[var(--ink)] bg-[var(--slab-lo)] px-3 py-1.5 text-xs text-[var(--paper-dim)]">
        Offline demo: the other mayors, their chat and their listings are simulated until the game server goes live.
      </p>
    </aside>
  );
}

/* ---------------- Chat ---------------- */
function Chat({ players, name, me }: { players: sim.PlayerRow[]; name: string; me?: number }) {
  const faceOf = (m: sim.ChatMessage) => (m.you ? me : players.find((p) => p.name === m.from)?.portrait);
  const [msgs, setMsgs] = useState<sim.ChatMessage[]>(() => Array.from({ length: 5 }, (_, i) => sim.botMessage(PLAYER_SEED, i, players)));
  const [text, setText] = useState('');
  const n = useRef(100);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      n.current += 1;
      setMsgs((m) => [...m.slice(-79), sim.botMessage(PLAYER_SEED + (Date.now() & 0xff), n.current, players)]);
    }, 9000);
    return () => clearInterval(t);
  }, [players]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs]);

  const send = () => {
    const t = text.trim().slice(0, 200);
    if (!t) return;
    n.current += 1;
    setMsgs((m) => [...m.slice(-79), { id: n.current, from: name, text: t, simulated: false, you: true }]);
    setText('');
  };

  return (
    <div className="flex h-full flex-col">
      <p className="px-3 pt-2 text-xs text-[var(--paper-dim)]">World chat. Your messages stay on this device for now.</p>
      <div className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
        {msgs.map((m) => (
          <div key={m.id} className={m.you ? 'text-right' : ''}>
            <span className={`flex items-center gap-1 text-xs font-bold ${m.you ? 'flex-row-reverse text-[var(--gold)]' : 'text-[var(--accent)]'}`}>
              {faceOf(m) ? <Portrait id={faceOf(m)!} className="h-5 w-[18px] border border-[var(--ink)]" title="" /> : null}{m.from}
            </span>
            <div className={`inline-block max-w-[85%] border-2 border-[var(--ink)] px-2 py-1 ${m.you ? 'bg-[var(--accent)] text-[var(--accent-ink)]' : 'bg-[var(--slab-lo)]'}`}>{m.text}</div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="flex gap-1 border-t-2 border-[var(--ink)] p-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} maxLength={200}
          placeholder="Say something..." className="field min-w-0 flex-1" aria-label="Chat message" />
        <button onClick={send} className="btn btn-accent text-sm">Send</button>
      </div>
    </div>
  );
}

/* ---------------- World news ---------------- */
function News({ s }: { s: sim.GameState }) {
  const items = s.world.news;
  const ago = (t: number) => { const d = Math.max(0, s.tick - t); return d < 60 ? `${d}s` : `${Math.floor(d / 60)}m`; };
  return (
    <div className="h-full overflow-y-auto p-3">
      <p className="mb-2 text-xs text-[var(--paper-dim)]">Raids and rises across the realm. Gold taken is gold lost from a treasury.</p>
      {items.length === 0 && <p className="text-sm text-[var(--paper-dim)]">All quiet for now. Give the mayors a minute.</p>}
      <ul className="space-y-1.5">
        {items.map((n) => (
          <li key={n.id} className={`flex items-start gap-2 border-2 px-2 py-1 text-sm ${n.kind === 'you' ? 'border-[var(--accent)] bg-[var(--slab-hi)]' : 'border-transparent bg-[var(--slab-lo)]'}`}>
            <Icon name={n.kind === 'rise' ? 'star' : 'swords'} size={14} />
            <span className="min-w-0 flex-1">{n.text}</span>
            <span className="shrink-0 text-xs text-[var(--paper-dim)] tabular-nums">{ago(n.tick)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Leaderboard ---------------- */
function Board({ s, players, name, onProfile }: { s: sim.GameState; players: sim.PlayerRow[]; name: string; onProfile: (p: sim.PlayerRow) => void }) {
  const [metric, setMetric] = useState<'chainPower' | 'wealth' | 'level'>('chainPower');
  const rows = useMemo(() => sim.ranked([...players, sim.myRow(s, name)], metric), [players, s, name, metric]);
  const top = rows.slice(0, 15);
  const me = rows.find((r) => r.isYou)!;
  const label = { chainPower: 'ChainPower', wealth: 'Wealth', level: 'Level' } as const;
  const Row = ({ r }: { r: (typeof rows)[number] }) => (
    <button onClick={() => onProfile(r)} title={`Open ${r.isYou ? 'your' : `${r.name}'s`} profile`} className={`player-row flex w-full items-center gap-2 border-2 px-2 py-1 text-left text-sm ${r.isYou ? 'border-[var(--accent)] bg-[var(--slab-hi)]' : 'border-transparent bg-[var(--slab-lo)]'}`}>
      <span className={`w-6 text-right font-bold tabular-nums ${r.rank <= 3 ? 'text-[var(--gold)]' : 'text-[var(--paper-dim)]'}`}>{r.rank}</span>
      {r.portrait ? <Portrait id={r.portrait} className="h-7 w-6 shrink-0 border border-[var(--ink)]" title="" /> : <span className="h-7 w-6 shrink-0" />}
      <span className="min-w-0 flex-1 truncate">{r.name}{r.isYou && ' (you)'}</span>
      <span className="text-xs text-[var(--paper-dim)]">Lv {r.level}</span>
      <span className="w-16 text-right font-bold tabular-nums">{r[metric]}</span>
    </button>
  );
  return (
    <div className="flex h-full flex-col">
      <div className="seg m-2 self-start" role="group" aria-label="Rank by">
        {(['chainPower', 'wealth', 'level'] as const).map((m) => (
          <button key={m} onClick={() => setMetric(m)} aria-pressed={metric === m}>{label[m]}</button>
        ))}
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2 pt-1">
        {top.map((r) => <Row key={r.id} r={r} />)}
        {me.rank > 15 && (<><div aria-hidden className="my-1.5 border-t-2 border-dashed border-[var(--slab-hi)]" /><Row r={me} /></>)}
      </div>
    </div>
  );
}

/* ---------------- Players list with filters ---------------- */
function Players({ s, players, name, onProfile }: { s: sim.GameState; players: sim.PlayerRow[]; name: string; onProfile: (p: sim.PlayerRow) => void }) {
  const [q, setQ] = useState<sim.PlayerQuery>(sim.DEFAULT_QUERY);
  const rows = useMemo(() => sim.queryPlayers([...players, sim.myRow(s, name)], q), [players, s, name, q]);
  const field = 'field text-sm';
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2 p-2">
        <input value={q.search} onChange={(e) => setQ({ ...q, search: e.target.value })} placeholder="Search name..." className={`${field} w-full`} aria-label="Search players" />
        <div className="flex gap-1">
          <select value={q.sort} onChange={(e) => setQ({ ...q, sort: e.target.value as sim.SortKey })} className={`${field} flex-1`} aria-label="Sort by">
            <option value="chainPower">ChainPower</option>
            <option value="wealth">Wealth</option>
            <option value="level">Level</option>
            <option value="name">Name</option>
          </select>
          <button onClick={() => setQ({ ...q, dir: q.dir === 'asc' ? 'desc' : 'asc' })} className={`${field} w-24`} aria-label="Toggle sort direction">
            {q.dir === 'asc' ? (q.sort === 'name' ? 'A → Z' : 'Low → High') : (q.sort === 'name' ? 'Z → A' : 'High → Low')}
          </button>
          <select value={q.minLevel} onChange={(e) => setQ({ ...q, minLevel: +e.target.value })} className={`${field} w-24`} aria-label="Minimum level">
            {Array.from({ length: sim.MAX_LEVEL }, (_, i) => i + 1).map((l) => <option key={l} value={l}>Lv {l}+</option>)}
          </select>
        </div>
        <p className="text-xs text-[var(--paper-dim)]">{rows.length} mayors</p>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2 pt-0">
        {rows.map((p) => (
          <button key={p.id} onClick={() => onProfile(p)} title={`Open ${p.isYou ? 'your' : `${p.name}'s`} profile`} className={`player-row grid w-full grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 border-2 px-2 py-1 text-left text-sm ${p.isYou ? 'border-[var(--accent)] bg-[var(--slab-hi)]' : 'border-transparent bg-[var(--slab-lo)]'}`}>
            {p.portrait ? <Portrait id={p.portrait} className="h-7 w-6 border border-[var(--ink)]" title="" /> : <span className="h-7 w-6" />}
            <span className="truncate">{p.name}{p.isYou && ' (you)'}</span>
            <span className="text-xs text-[var(--paper-dim)]">Lv {p.level}</span>
            <span className="w-14 text-right text-xs text-[var(--accent)] tabular-nums" title="ChainPower">{p.chainPower}</span>
            <span className="flex w-16 items-center justify-end gap-0.5 text-xs text-[var(--gold)] tabular-nums" title="Wealth"><Icon name="coin" size={10} />{p.wealth}</span>
          </button>
        ))}
        {rows.length === 0 && <p className="text-sm text-[var(--paper-dim)]">No players match.</p>}
      </div>
    </div>
  );
}

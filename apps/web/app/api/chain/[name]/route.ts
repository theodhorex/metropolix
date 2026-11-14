// Read API over the indexer (lib/server/indexer.ts). Every read first refreshes the data when it is older than
// five minutes; GitHub Actions also calls /api/chain/sync every five minutes (Authorization: Bearer SYNC_SECRET).
import { battles, city, coin, leaderboard, maybeSync, relics, status } from '@/lib/server/indexer';

const num = (v: string | null, d: number, max: number) => Math.min(max, Math.max(1, Number(v) || d));

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const q = new URL(req.url).searchParams;
  if (name === 'sync') return sync(req);
  await maybeSync();
  switch (name) {
    case 'leaderboard': return Response.json(await leaderboard(num(q.get('limit'), 20, 100)));
    case 'city': return Response.json(await city(q.get('account') ?? ''));
    case 'battles': return Response.json(await battles(q.get('account'), num(q.get('limit'), 50, 200)));
    case 'coin': return Response.json(await coin());
    case 'relics': return Response.json(await relics(q.get('owner')));
    case 'status': return Response.json(await status());
    default: return Response.json({ error: 'unknown' }, { status: 404 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (name === 'sync') return sync(req);
  // a player just did something on chain: let the next read see it (still at most once a minute)
  if (name === 'poke') {
    const s = await status();
    if (Date.now() - s.last_sync > 60_000) await maybeSync(true);
    return Response.json(await status());
  }
  return Response.json({ error: 'unknown' }, { status: 404 });
}

async function sync(req: Request) {
  const secret = process.env.SYNC_SECRET;
  const auth = req.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    await maybeSync();
    return Response.json(await status());
  }
  return Response.json(await maybeSync(true));
}

import { memo, useEffect, useState } from 'react';
// Hand-drawn 12x12 pixel icons. One letter = one pixel; '.' is transparent.
const PAL: Record<string, string> = {
  o: '#12151d', y: '#f2c14e', Y: '#b8862a', w: '#fff3c9', n: '#9a6a3a', N: '#65431f', s: '#aab3c2', S: '#68728a',
  b: '#6ec8ff', B: '#2f7fc0', g: '#7fcf6a', G: '#3e8a3a', r: '#ea6a55', R: '#a13425', p: '#f0c8a0', P: '#c48a62', k: '#2a2f3c', v: '#b58cf0', V: '#6c47b8', e: '#ff9a3c', m: '#a8f0d8',
  c: '#4ef2ea', C: '#18989e', u: '#e59bff', U: '#3b1d6e', E: '#d95b16',
};

const ICONS = {
  coin: ['...oooooo...', '.oowwyyyyoo.', '.owyyyyyyyYo', 'owyyyYYyyyYo', 'owyyYooYyyYo', 'oyyyYooYyyYo', 'oyyyYooYyyYo', 'oyyyYYYYyyYo', 'oyyyyyyyyyYo', '.oyyyyyyyYYo', '.ooYYYYYYoo.', '...oooooo...'],
  wood: ['..ooooooooo.', '.oyyonnnnnNo', 'oyYYyonnnNNo', 'oyYYyoNNNNNo', '.oyyonnnnNoo', '..oooooooo..'],
  ore: ['.....oo.....', '....oBbo.oo.', '...oBbwboBbo', '..oBbbbooBbo', '.ossssooSSso', 'osswsssSSSSo', 'osssssSSSSSo', '.oSSSSSSSSo.', '..oooooooo..'],
  people: ['....oooo....', '...oppppo...', '...opkpko...', '...oppppo...', '..oooooooo..', '.oBBBBBBBBo.', '.oBBbbbbBBo.', '.oBBbbbbBBo.', '.oBBBooBBBo.', '..ooo..ooo..'],
  smile: ['...oooooo...', '..oyyyyyyo..', '.oyyyyyyyyo.', 'oyyokyyokyyo', 'oyyokyyokyyo', 'oyyyyyyyyyyo', 'oyokyyyykoyo', '.oyokkkkoyo.', '..oyyooyyo..', '...oooooo...'],
  book: ['.oooooooooo.', 'oBBBBooVVVVo', 'oBbbBooVvvVo', 'oBBBBooVVVVo', 'oBbbBooVvvVo', 'oBBBBooVVVVo', 'oBbbBooVvvVo', 'oBBBBooVVVVo', '.oooooooooo.'],
  trophy: ['oooooooooooo', 'oyyyyyyyyyyo', 'oywyyyyyyyyo', 'oywyyyyyyYyo', '.oywyyyyYYo.', '..oywyyYYo..', '...oyyYYo...', '....oyYo....', '....oyYo....', '...oyyYYo...', '..oyyyYYYo..', '..oooooooo..'],
  shield: ['.oooooooooo.', 'oBBbbooBBBBo', 'oBbwbooBBBBo', 'oBbbbooBBBBo', 'oBbbbooBBBBo', 'oBBbbooBBBBo', '.oBBbooBBBo.', '..oBBooBBo..', '...oBooBo...', '....oooo....'],
  swords: ['oo........oo', 'osso....osso', '.osso..osso.', '..osso.osso.'.slice(0, 12), '...ossoss...', '....osss....', '...onsssn...'.slice(0, 12), '..onNossNno.', '.onNo.onNNo.', '.ooo...ooo..'],
  city: ['.........oo.', '..oo....oBBo', '.oBBo...oBbo', '.oBbo.oooBbo', '.oBbo.oBBBbo', 'ooBbooosBbBo', 'oBBbbooBBbBo', 'oBybbooBybBo', 'oBBbbooBBbBo', 'oBBBBooBBBBo', 'oooooooooooo'],
  bag: ['....oooo....', '...oYooYo...', '..oyyyyyyo..', '.oyywyyyyyo.', 'oyywyyyyyyYo', 'oywyyyoyyyYo', 'oyyyyyoyyyYo', 'oyyyyyyyyyYo', 'oyyyyyyyyYYo', '.ooYYYYYYoo.'].slice(0, 10),
  hammer: ['.oooooooo...', 'osssssssso..', 'osswsssSSo..', 'osssssSSSo..', '.ooosSSSoo..', '...onNNo....', '...onNNo....', '...onNNo....', '...onNNo....', '...ooooo....'],
  chart: ['o...........', 'o...........', 'o........oo.', 'o...oo..orro', 'o...obbooRRo', 'o.oogbbbbRRo', 'oobGgbbBBRRo', 'obbGgbbBBRRo', 'oBBGGBBBBRRo', 'oooooooooooo'],
  flame: ['.....oo.....', '....orro....', '...orrro....', '...orryro...', '..orryyrro..', '.orryywyrro.', '.orryywyrro.', '.orryyyyrro.', '..orryyrro..', '...oorrroo..', '.....ooo....'],
  heart: ['.oo....oo...', 'orrooooorro.', 'orwrrrrrrRo.', 'orwrrrrrrRo.', 'orrrrrrrrRo.', '.orrrrrrRo..', '..orrrrRo...', '...orrRo....', '....oRo.....', '.....o......'],
  ram: ['...ooo......', '..osssoooooo', '.osssoNnnnno', 'ossoSoNnnnNo', '.osssoNNNNNo', '..ossoooooo.', '..o..o..o...', '.oo.oo.oo...'],
  crown: ['o..o....o..o', 'oyoyo..oyoyo', 'oyyoyooyyyyo', 'oyyyyyyyyyyo', 'oyyyryyybyyo', 'oyyyyyyyyyyo', 'oYYYYYYYYYYo', '.oooooooooo.'],
  star: ['.....oo.....', '....oyyo....', '....oyyo....', 'oooooyyoooo.', 'oyyyyyyyyyyo', '.oyyyyyyyyo.', '..oyyyyyyo..', '..oyyyooyyo.', '.oyyoo.ooyyo', '.ooo....ooo.'],
  close: ['oo......oo', 'orro...orro', '.orro.orro.', '..orrorro..'.slice(0, 11), '...orro....', '..orrorro..', '.orro.orro.', 'orro...orro', 'oo......oo'],
  cross: ['ww....ww', 'www..www', '.wwwwww.', '..wwww..', '..wwww..', '.wwwwww.', 'www..www', 'ww....ww'],
  food: ['............', '...oooooo...', '..oyyyyyyo..', '.oywyyyywyo.', '.oyywyyyywo.', 'oyyyyyyyyyYo', 'oYyyyyyyyYYo', '.oYYYYYYYYo.', '..oooooooo..'],
  moonleaf: ['.........oo.', '.......oommo', '.....oommmGo', '....ommmmGo.', '...ommmmGGo.', '..ommmmGGo..', '..ommmGGo...', '.ommmGGo....', '.oGGGoo.....', 'oGooo.......', 'oo..........'],
  spice: ['....oooo....', '...oNnnNo...', '....onno....', '...orrrro...', '..orrwrrro..', '.orrrrrrrro.', '.orrRrrrrRo.', 'orrrRRrrRRro', 'oRRRRRRRRRRo', '.oooooooooo.'],
  hides: ['oo........oo', 'onoooooooono', '.onnnPnnnno.', '.onPnnnnnno.', '.onnnnnPnno.', '.onnPnnnnno.', '.onnnnnnPno.', 'onoooooooono', 'oo........oo'],
  emberstone: ['.....oo.....', '....oeeo....', '...oeyeeo...', '..oeyeeeRo..', '..oeyeeeRo..', '.oeeeeeRRRo.', '.oeeeeRRRRo.', '..oeeRRRRo..', '...oRRRRo...', '....oooo....'],
  gears: ['....o..o....', '...osoosso..', '..osssssSo..', '.oossooSSoo.', 'osssoooSSSSo', '.oSso..oSSo.', '.oSso..oSSo.', 'osssoooSSSSo', '.oossSSSSoo.', '..oSSSSSSo..', '...oSooSo...', '....o..o....'],
  scale: ['.....oo.....', 'ooooooooooo.', 'oyyyyyyyyyyo', 'ooooooooooo.', '.o...oo..o..', 'oyo..oo.oyo.', 'oyyo.oo.oyyo', '.oo..oo..oo.', '.....oo.....', '...oyyyyo...', '...oooooo...'],
  box: ['.oooooooooo.', 'onnnnnnnnnNo', 'onwwwwwwwwNo', 'oNNNNNNNNNNo', 'onnnnoonnnNo', 'onnnnyynnnNo', 'onnnnoonnnNo', 'onnnnnnnnnNo', 'oNNNNNNNNNNo', '.oooooooooo.'],
  scroll: ['.ooooooooo..', 'owwwwwwwwwo.', 'owkkkkkkwwo.', 'owwwwwwwwwo.', 'owkkkkkkkwo.', 'owwwwwwwwwo.', 'owkkkkwwwwo.', '.ooooooooo..'],
  gear: ['....oo......', '.oo.ss.oo...', '.osossooso..', '..osSSso....', 'ooosSSsooo..', 'ssSSooSSss..', 'ssSSooSSss..', 'ooosSSsooo..', '..osSSso....', '.osossooso..', '.oo.ss.oo...', '....oo......'],
  chat: ['.oooooooooo.', 'obbbbbbbbbbo', 'obwwbwwbwwbo', 'obbbbbbbbbbo', 'obwwbwwbbbbo', 'obbbbbbbbbbo', '.ooooBboooo.', '....oBbo....', '.....oo.....'],
  tent: ['.....oo.....', '....oyyo....', '...oyYYyo...', '..oyyYYyyo..', '.oyyyYYyyyo.', 'oyyyyoooyyyo', 'oyyyyokkyyyo', 'oooooookkooo'.slice(0, 12)],
  dice: ['.oooooooooo.', 'owwwwwwwwwso', 'owkkwwwwkkSo', 'owkkwwwwkkSo', 'owwwwkkwwwSo', 'owwwwkkwwwSo', 'owkkwwwwkkSo', 'owkkwwwwkkSo', 'owwwwwwwwsSo', 'osSSSSSSSSSo', '.oooooooooo.'],
  chest: ['..oooooooo..', '.oywyyyyyYo.', 'oywnnnnnnyYo', 'oyynNNNNnyYo', 'oYYYYooYYYYo', 'oyynowyonyYo', 'oyynoyYonyYo', 'oyyNNooNNyYo', 'oyyNNNNNNyYo', 'oYYYYYYYYYYo', '.oooooooooo.'],
  goldtimber: ['......ooo...', '..oooooyyoo.', '.oywyyonYyoo', 'oywYYyonywyo', 'oyYwyYonnyYo', 'oywYYyoNyyNo', 'oyyyyyonyYNo', '.oyYYooNNNNo', '..ooooooooo.'],
  goblinskull: ['....oo..o...', '...oywooYo..', '...oyyyyYYo.', '..ooooooooo.', 'ooogmggggSoo', 'ogmggggggGSo', '.oogookGooGo', '...ogokGooSo', '...ogggggSo.', '...ogwggwSo.', '....oGGGSo..', '.....oooo...'],
  dragonscale: ['.....oo.....', '...oorRoo...', '..orwwrrRo..', '.orRrwrrrRo.', 'orRrrwrrrrRo', 'oRrrrwrrrRRo', 'oRrrrprrrRRo', '.oRRrprrRRo.', '..oRRprRRo..', '...oRRRRo...', '....oRRo....', '.....oo.....'],
  moonpearl: ['....oooo....', '..oowwbvoo..', '.owwbbvvvVo.', '.owbbbuvvVo.', '.obbbuvvvVo.', 'oobbuvvVVVoo', 'opobvvvvVopo', 'oppovVVVoPpo', '.opPooooPPo.', '.opPpPnPPPo.', '..oPPnPnPo..', '...oooooo...'],
  grimoire: ['..ooooooooo.', '.ovvvvvvvvVo', 'ovVVeyweVVUo', 'ovVeyokyeVUo', 'ovVVeyyeVVUo', 'ossssyysssSo', 'oSSSSyyYSSSo', '.ovVoyyYoVUo', '.ovVVooooVUo', '.oUUVVVVVUUo', '.oUwwwwwwwpo', '..ooooooooo.'],
  mandrake: ['..oo..oo.oo.', '.oggooggogGo', '..oGggggGGo.', '...ooGGGGoo.', '...opppppno.', '..opokppkono', '.opppooooPno', 'ooppoookoPno', '.ooPppppPnno', '...opPooNno.', '..opPo..onNo', '..ooo....ooo'],
  ironbark: ['..oooooooo..', '.oswppppPSo.', '.osPppnPPso.', '..oooooooo..', '.osssSSkkko.', 'oosokssSkooo', 'oswokssSwkko', 'ooSssssSSkoo', '.osSSkokoSo.', '.oSSSSkkkko.', '..oooooooo..'],
  tankard: ['..ooo.ooo...', '.owwwowwpo..', 'owwwwwwwpo..', 'owwwoonNooo.', '.owosssSosso', '.oPnnnNo.oso', '.oPnnnNo.oSo', '.oPnnnNo.oSo', '.ossssSooSSo', '.onNNNNoooo.', '.ooooooo....'],
  phoenixfeather: ['.o...oooooo.', 'owo.orrrrrRo', '.o.orrerrrRo', '..orreeyrrRo', '..oreeyyerRo', '.ooeeywyeRoo', '.oeyywyyeeRo', '.oyywyyeeRoo', '.oywyyeoooo.', '.oywyoo..oyo', 'oowyoo....o.', 'oooo........'],
  titanbone: ['..ooo..oooo.', '.owwwoowwwpo', 'owwwwwwwwwpo', 'owwwppokppPo', '.oPpppokpPoo', '..ooopkopoo.', '.oowpkpppooo', 'owwpppppppPo', 'owpppppppPPo', 'owppPooPppPo', '.oPPo..oPPo.', '..oo....oo..'],
  wardenbanner: ['.....oo.....', 'ooooosSooooo', 'onnnnnnnnnNo', '.obbbBBBSSo.', '.obbByyBBSo.', '.obBywyYBSo.', '.oBBByYBBSo.', '.oBBBooBSSo.', '.oBBo..oSSo.', '.oBo...ooSo.', '.oo.....oSo.', '.........oo.'],
  clockheart: ['.ooo...ooo..', 'oywyo.oyyYo.', 'oywyyoyyyYoo', 'oyysksosyyYo', 'oysurwrusYYo', 'oykrwwwrkYYo', 'oysurwrusYYo', '.oYssksSYYo.', '..oYyyyYYoo.', '...oYYYYoowo', '....oYYo..o.', '.....oo.....'],
  geode: ['..ooo..ooo..', '.oswmoomcSo.', 'oswmccmcCCSo', 'osmcwcCcCCSo', 'oscCcccCCCSo', 'osCCCcCCCCSo', 'osSCCCCCCSSo', 'osSSCCCCSSSo', '.osSSSSSSSo.', '..oSSSSSSo..', '...oooooo...'],
  starmetal: ['..o....ooo..', '.owo..okSko.', '..o..okbwSko', '....okbwbkko', '..oooSbskkko', '.okSwssSkkko', 'okkkbswSkkSo', 'okkbwbsskkSo', 'okkkbskssSSo', '.okkkkkssSo.', '..oSSSSSSo..', '...oooooo...'],
  voidheart: ['..ooo..ooo..', '.ovwUooUvko.', 'ovUUUooUUkko', 'ovUvvuuVUkko', 'oUvuwwwwuvko', 'oUvuwuuwuvko', 'oUvvuuuuVuko', '.oUVvvvvUko.', '..oUVVVwko..', '...oVUUko...', '....oUko....', '.....oo.....'],
  cog: ['....oooo....', '.oo.oyyo.oo.', 'oywoyyyyoYyo', '.oyyyvvyyYo.', 'ooYyuwwvyYoo', 'oyyyuvvVyYYo', 'oyyYvvVVyYYo', 'ooYYvVVVyYoo', '.oYYyVVyYYo.', 'oyYoYYYYoYYo', '.oo.oYYo.oo.', '....oooo....'],
  sunengine: ['....oooo....', '..ooywyyoo..', '.oywkeekyyo.', '.oykyyyekYo.', 'ooYkewwekYoo', 'oyyeewwyeyYo', 'oyyeewweeyYo', 'ooYkeEEekYoo', '.oYkyEEykYo.', '.oYYkeekYYo.', '..ooYYYYoo..', '....oooo....'],
  whetstone: ['..oooooooo..', '.oswwssssso.', 'osssbBbwbsSo', 'osBbwbbwbBSo', 'ossbBbbBssSo', 'osssssSSSSSo', '.oSSSSSSSSo.', '..oooooooo..'],
  masterhammer: ['....oooo....', '.oooywyyooo.', 'oswyssssySso', 'oswyyyyyySSo', 'osYySSSSYYSo', '.ooooyyoooo.', '....oYYo....', '....onNo....', '....oyYo....', '....onNo....', '...oyyyYo...', '...oooooo...'],
  kingsblade: ['.....oo.....', '....owso....', '...owssSo...', '...owbsSo...', '...owbsSo...', '...owsSSo...', '.oooyyyYooo.', 'oywyyrrYYyYo', '.oooyRRYooo.', '....onNo....', '...oywyYo...', '...oooooo...'],
  aetheranvil: ['..oo....oo..', '.ouwo..ovuo.', '..ooooooooo.', '.owmmmmmmmco', 'owwmmmmcccCo', '.oooomcccCoo', '....omcCCo..', '...oomcCCoo.', '..owmmcccCCo', '.oomccCCCCCo', '.oCCCooCCCCo', '.oooooooooo.'],
  amber: ['.....oo.....', '....oyeo....', '...owyeeo...', '..owyyyyEo..', '.owykykyyeo.', '.oyykkkyyEo.', 'oeyykNkyyeEo', 'oeykyNkyeeEo', 'oeyyyNyyeeEo', '.oeeeeeEEEo.', '..oEEEEEEo..', '...oooooo...'],
  heartwood: ['......ooo...', '..oo.oywyo..', '.oywooyyYo..', '.oyYoomgGo..', '..ooommgGo..', '...ommgGoooo', '..ommgGoywyo', '.ommgGooyYYo', '.omgGoo.ooo.', 'omgGGo......', 'oGGGo.......', '.ooo........'],
  goldenseed: ['..ooo..ooo..', '.omggooggGo.', '.oggGooGggo.', '..oooggGoo..', '....ogGo....', '...ooyyoo...', '..oywyyyYo..', '.oywyyYyyYo.', '.oyyyyYyyYo.', '.oyyYYYYYYo.', '..oYYYYYYo..', '...oooooo...'],
} as const;

export type IconName = keyof typeof ICONS;

interface Compiled { side: number; paths: [string, string][] }
const compiled = new Map<IconName, Compiled>();

/**
 * Turn one pixel grid into a few paths: one per colour, each horizontal run of same-colour
 * pixels becomes a single rectangle. Done once per icon, then shared by every instance.
 */
function compile(name: IconName): Compiled {
  const hit = compiled.get(name);
  if (hit) return hit;
  const rows = ICONS[name] as readonly string[];
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const side = Math.max(w, h);
  const ox = Math.floor((side - w) / 2), oy = Math.floor((side - h) / 2);
  const byColor = new Map<string, string>();
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const c = row[x]!, fill = PAL[c];
      let run = 1;
      while (x + run < row.length && row[x + run] === c) run++;
      if (fill) byColor.set(fill, `${byColor.get(fill) ?? ''}M${x + ox} ${y + oy}h${run}v1h-${run}z`);
      x += run;
    }
  });
  const out = { side, paths: [...byColor.entries()] };
  compiled.set(name, out);
  return out;
}

let renderedIcons: Set<string> | null = null;
let renderedIconsP: Promise<void> | null = null;
const iconListeners = new Set<() => void>();

function loadRenderedIcons() {
  if (renderedIcons !== null || typeof window === 'undefined') return;
  renderedIconsP ??= fetch('/art/ui/icons.json')
    .then((r) => (r.ok ? (r.json() as Promise<string[]>) : []))
    .catch(() => [] as string[])
    .then((names) => {
      renderedIcons = new Set(Array.isArray(names) ? names : []);
      iconListeners.forEach((fn) => fn());
      iconListeners.clear();
    });
}

function IconImpl({ name, size = 20, className = '', title }: { name: IconName; size?: number; className?: string; title?: string }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (renderedIcons !== null) return;
    const onLoaded = () => setTick((t) => t + 1);
    iconListeners.add(onLoaded);
    loadRenderedIcons();
    return () => { iconListeners.delete(onLoaded); };
  }, []);

  if (renderedIcons?.has(name)) {
    return (
      <img
        src={`/art/ui/${name}.webp`}
        width={size}
        height={size}
        alt={title ?? ''}
        title={title}
        role={title ? 'img' : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        draggable={false}
        onError={() => {
          renderedIcons?.delete(name);
          setTick((t) => t + 1);
        }}
        style={{ width: size, height: size, imageRendering: 'auto' }}
        className={`inline-block shrink-0 select-none ${className}`}
      />
    );
  }

  const { side, paths } = compile(name);
  return (
    <svg viewBox={`0 0 ${side} ${side}`} width={size} height={size} shapeRendering="crispEdges" className={`inline-block shrink-0 ${className}`} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {title && <title>{title}</title>}
      {paths.map(([fill, d]) => <path key={fill} d={d} fill={fill} />)}
    </svg>
  );
}

const Icon = memo(IconImpl);
export default Icon;

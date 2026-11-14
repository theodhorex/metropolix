import Link from 'next/link';
import { ARCS, GRID, SHIELD_TICKS, WORLD_MAYORS } from '@metropolix/sim';
import T from './prefs/T';
import './faq.css';

// Every answer here must stay true to the code: on chain means NEAR testnet, no money promises.
const REPO = 'https://github.com/theodhorex/metropolix';
const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
const SHIELD_MIN = Math.round(SHIELD_TICKS / 60);

const QA: {
  key: string;
  q: { en: string; id: string; ko: string; zh: string };
  a: { en: React.ReactNode; id: React.ReactNode; ko: React.ReactNode; zh: React.ReactNode };
}[] = [
  {
    key: 'what',
    q: {
      en: 'What is Metropolix?',
      id: 'Metropolix itu apa?',
      ko: 'Metropolix는 어떤 게임인가요?',
      zh: '什么是 Metropolix？',
    },
    a: {
      en: <>A fantasy city builder in pixel art. You pick one of {ARCS.length} peoples, raise a city on a {GRID}×{GRID} map, keep your citizens fed, housed and happy, and raid rival mayors for their gold. One session of about ten minutes is enough to feel how it plays.</>,
      id: <>Game membangun kota fantasi bergaya pixel art. Kamu memilih satu dari {ARCS.length} bangsa, membangun kota di peta {GRID}×{GRID}, menjaga warga tetap kenyang, punya rumah dan bahagia, lalu menyerbu mayor rival untuk merebut emas mereka. Sekitar sepuluh menit sudah cukup untuk merasakan permainannya.</>,
      ko: <>픽셀 아트로 즐기는 판타지 도시 건설 게임입니다. {ARCS.length}개 종족 중 하나를 골라 {GRID}×{GRID} 지도 위에 도시를 건설하고, 시민들을 먹이고 거처를 마련해 행복하게 유지하며, 라이벌 시장을 약탈해 골드를 차지하세요. 게임의 재미를 느끼는 데는 10분 정도의 세션 하나면 충분합니다.</>,
      zh: <>一款像素艺术风格的奇幻城市建造游戏。从 {ARCS.length} 大种族中择一效忠，在 {GRID}×{GRID} 的地图上拔地建城，保障市民温饱居所与幸福度，并突袭对手城主掠夺金币。只需约十分钟的一局体验，即可领略完整玩法。</>,
    },
  },
  {
    key: 'free',
    q: {
      en: 'Do I need to sign up, download anything or pay?',
      id: 'Perlu daftar, unduh sesuatu, atau bayar?',
      ko: '가입하거나 다운로드하거나 결제해야 하나요?',
      zh: '我需要注册、下载或付费吗？',
    },
    a: {
      en: <>No. Press <Link href="/play">Play now</Link> and the game runs in your browser, with no account and no download. A NEAR testnet wallet is optional: it adds the on-chain features, with free testnet NEAR.</>,
      id: <>Tidak. Tekan <Link href="/play">Play now</Link> dan game langsung berjalan di browser, tanpa akun dan tanpa unduhan. Dompet NEAR testnet itu opsional: untuk fitur on-chain, dengan NEAR testnet yang gratis.</>,
      ko: <>아닙니다. <Link href="/play">지금 플레이</Link>를 누르면 계정이나 다운로드 없이 브라우저에서 바로 실행됩니다. NEAR testnet 지갑은 선택 사항이며, 무료 testnet NEAR로 온체인 기능을 쓸 수 있습니다.</>,
      zh: <>不需要。点击<Link href="/play">立即开玩</Link>即可在浏览器中直接畅玩，无须账号、无须下载。NEAR testnet 钱包为可选项，用免费的 testnet NEAR 即可解锁链上功能。</>,
    },
  },
  {
    key: 'chain',
    q: {
      en: 'Is the game on the blockchain already?',
      id: 'Apakah game ini sudah ada di blockchain?',
      ko: '게임이 이미 블록체인에 올라가 있나요?',
      zh: '游戏目前已经在区块链上了吗？',
    },
    a: {
      en: <>Yes, on NEAR testnet. Connect a NEAR wallet in the game and your city is saved to the contract <a href="https://testnet.nearblocks.io/address/metropolix.testnet" {...ext}>metropolix.testnet</a> every five minutes, other players can raid it, and you can trade $METRO and mint treasures as NFTs. The code is in <a href={`${REPO}/tree/HEAD/contracts/metropolix`} {...ext}>contracts/metropolix</a>.</>,
      id: <>Ya, di NEAR testnet. Hubungkan dompet NEAR di dalam game dan kotamu disimpan ke kontrak <a href="https://testnet.nearblocks.io/address/metropolix.testnet" {...ext}>metropolix.testnet</a> tiap lima menit, pemain lain bisa menyerbunya, dan kamu bisa memperdagangkan $METRO serta mencetak harta karun sebagai NFT. Kodenya ada di <a href={`${REPO}/tree/HEAD/contracts/metropolix`} {...ext}>contracts/metropolix</a>.</>,
      ko: <>네, NEAR testnet에 있습니다. 게임에서 NEAR 지갑을 연결하면 도시가 5분마다 <a href="https://testnet.nearblocks.io/address/metropolix.testnet" {...ext}>metropolix.testnet</a> 컨트랙트에 저장되고, 다른 플레이어가 약탈할 수 있으며, $METRO를 거래하고 보물을 NFT로 발행할 수 있습니다. 코드는 <a href={`${REPO}/tree/HEAD/contracts/metropolix`} {...ext}>contracts/metropolix</a>에 있습니다.</>,
      zh: <>是的，已上线 NEAR testnet。在游戏中连接 NEAR 钱包后，你的城市每五分钟保存到合约 <a href="https://testnet.nearblocks.io/address/metropolix.testnet" {...ext}>metropolix.testnet</a>，其他玩家可以突袭它，你还可以交易 $METRO 并将宝藏铸造为 NFT。代码见 <a href={`${REPO}/tree/HEAD/contracts/metropolix`} {...ext}>contracts/metropolix</a>。</>,
    },
  },
  {
    key: 'save',
    q: {
      en: 'Where is my city saved?',
      id: 'Kotaku disimpan di mana?',
      ko: '내 도시는 어디에 저장되나요?',
      zh: '我的城市进度保存在哪里？',
    },
    a: {
      en: <>In your browser, and on NEAR testnet once you connect a wallet and turn on autosave. On a new browser or device, connect the same wallet and load your city back from the chain.</>,
      id: <>Di browsermu, dan di NEAR testnet setelah kamu menghubungkan dompet dan menyalakan simpan otomatis. Di browser atau perangkat baru, hubungkan dompet yang sama lalu muat kembali kotamu dari chain.</>,
      ko: <>브라우저에 저장되며, 지갑을 연결하고 자동 저장을 켜면 NEAR testnet에도 저장됩니다. 새 브라우저나 기기에서는 같은 지갑을 연결해 체인에서 도시를 불러오세요.</>,
      zh: <>保存在你的浏览器中；连接钱包并开启自动保存后，也会保存到 NEAR testnet。换用新的浏览器或设备时，连接同一个钱包即可从链上读回你的城市。</>,
    },
  },
  {
    key: 'one',
    q: {
      en: 'Can I have more than one city, or change my people later?',
      id: 'Bisa punya lebih dari satu kota, atau ganti bangsa nanti?',
      ko: '여러 도시를 소유하거나 나중에 종족을 바꿀 수 있나요?',
      zh: '我可以拥有多座城市，或者稍后更换种族吗？',
    },
    a: {
      en: <>No. One player, one city, and the people you choose is yours for good. That choice decides your land, your army and your trade good, so pick with care.</>,
      id: <>Tidak. Satu pemain, satu kota, dan bangsa yang kamu pilih berlaku selamanya. Pilihan itu menentukan tanahmu, pasukanmu, dan barang dagangmu, jadi pilih dengan cermat.</>,
      ko: <>안 됩니다. 플레이어 한 명당 한 도시만 가질 수 있으며, 한 번 선택한 종족은 영구적입니다. 이 선택이 당신의 영토, 군대, 무역품을 결정하므로 신중하게 선택하세요.</>,
      zh: <>不可以。每位玩家对应一座城市，且选定的种族不可更改。该选择决定了你的领地环境、军队兵种与贸易特产，因此请慎重抉择。</>,
    },
  },
  {
    key: 'mayors',
    q: {
      en: 'Are the other mayors real players?',
      id: 'Apakah mayor lain itu pemain sungguhan?',
      ko: '다른 시장들은 실제 플레이어인가요?',
      zh: '其他城主是真实玩家吗？',
    },
    a: {
      en: <>Both. The {WORLD_MAYORS} nearby rival mayors are simulated in your browser: they grow, level up and raid each other and you. Real players who saved their city on chain are listed under Players on chain, and raiding them takes gold out of their on-chain treasury.</>,
      id: <>Keduanya. Ke-{WORLD_MAYORS} mayor rival di sekitarmu disimulasikan di browser: mereka tumbuh, naik level, dan saling menyerbu termasuk menyerbumu. Pemain sungguhan yang menyimpan kotanya di chain muncul di Players on chain, dan menyerbu mereka mengambil emas dari kas on-chain mereka.</>,
      ko: <>둘 다입니다. 주변의 라이벌 시장 {WORLD_MAYORS}명은 브라우저에서 시뮬레이션되며 스스로 성장하고 서로를, 그리고 당신을 약탈합니다. 체인에 도시를 저장한 실제 플레이어는 Players on chain 목록에 나타나며, 그들을 약탈하면 온체인 금고에서 골드를 가져옵니다.</>,
      zh: <>两者都有。附近的 {WORLD_MAYORS} 位对手城主在你的浏览器中模拟运行，会自主发展、升级并互相突袭（包括你）。已将城市保存到链上的真实玩家会出现在 Players on chain 列表中，突袭他们会从其链上国库中夺取金币。</>,
    },
  },
  {
    key: 'raid',
    q: {
      en: 'What happens when a rival raids me?',
      id: 'Apa yang terjadi kalau rival menyerangku?',
      ko: '라이벌이 나를 약탈하면 어떻게 되나요?',
      zh: '当对手突袭我时会发生什么？',
    },
    a: {
      en: <>If their attack beats your defense they take part of your gold and some troops. Your city then gets a shield for {SHIELD_MIN} minutes of game time, so you are not raided again straight away. Towers, troops and a defense plan in the war room make you harder to break.</>,
      id: <>Kalau serangan mereka lebih kuat dari pertahananmu, mereka mengambil sebagian emas dan sebagian pasukanmu. Setelah itu kotamu mendapat perisai selama {SHIELD_MIN} menit waktu game, jadi tidak langsung diserang lagi. Menara, pasukan, dan rencana pertahanan di war room membuatmu lebih sulit ditembus.</>,
      ko: <>적의 공격력이 당신의 방어력을 넘어서면 골드의 일부와 병력 일부를 빼앗깁니다. 약탈당한 도시는 게임 시간 기준 {SHIELD_MIN}분 동안 보호막을 얻어 곧바로 다시 공격받지 않습니다. 작전실의 방어 타워, 병력, 방어 전략을 통해 함락하기 어려운 도시로 만드세요.</>,
      zh: <>如果对方的攻势击溃了你的防守，他们将掠夺你的一部分金币和兵力。随后你的城市将获得为期 {SHIELD_MIN} 分钟游戏时间的护盾，防止立即再次遭受突袭。建造防御塔、部署军队并在作战室制定防守方案能让你的城池更坚不可摧。</>,
    },
  },
  {
    key: 'money',
    q: {
      en: 'Can I earn money by playing?',
      id: 'Bisa dapat uang dari bermain?',
      ko: '게임을 플레이해서 돈을 벌 수 있나요?',
      zh: '玩这款游戏能赚钱吗？',
    },
    a: {
      en: <>No. Everything on chain runs on NEAR testnet: $METRO, its pool and the treasure NFTs are testnet tokens with no real value, and nothing can be cashed out.</>,
      id: <>Tidak. Semua yang on-chain berjalan di NEAR testnet: $METRO, pool-nya, dan NFT harta karun adalah token testnet tanpa nilai nyata, dan tidak ada yang bisa dicairkan.</>,
      ko: <>아닙니다. 온체인의 모든 것은 NEAR testnet에서 동작합니다. $METRO와 그 풀, 보물 NFT는 실제 가치가 없는 testnet 토큰이며 현금화할 수 없습니다.</>,
      zh: <>不能。所有链上内容都运行在 NEAR testnet：$METRO、其资金池和宝藏 NFT 都是没有真实价值的测试网代币，无法兑现。</>,
    },
  },
  {
    key: 'phone',
    q: {
      en: 'Does it work on my phone?',
      id: 'Bisa dimainkan di ponsel?',
      ko: '스마트폰에서도 플레이할 수 있나요?',
      zh: '可以在手机上游玩吗？',
    },
    a: {
      en: <>It runs in a mobile browser and you can tap to build. It plays best on a larger screen with a mouse, where the map and the side panels have room.</>,
      id: <>Bisa dibuka di browser ponsel dan kamu bisa mengetuk untuk membangun. Paling nyaman dimainkan di layar yang lebih besar dengan mouse, karena peta dan panel samping punya ruang.</>,
      ko: <>모바일 브라우저에서도 실행되며 탭하여 건설할 수 있습니다. 다만 지도와 측면 패널 공간이 넉넉한 더 큰 화면과 마우스 환경에서 가장 쾌적하게 플레이할 수 있습니다.</>,
      zh: <>支持在移动端浏览器中运行，你可以通过点击触控来进行建造。不过在屏幕空间充裕且使用鼠标的桌面端上体验最佳，地图与侧边栏面板能够舒展呈现。</>,
    },
  },
  {
    key: 'code',
    q: {
      en: 'Can I see the code?',
      id: 'Bisa lihat kodenya?',
      ko: '소스 코드를 볼 수 있나요?',
      zh: '我可以查看源代码吗？',
    },
    a: {
      en: <>Yes, the whole project is public on <a href={REPO} {...ext}>GitHub</a>: the simulation, the web game and the contract.</>,
      id: <>Bisa, seluruh proyek terbuka untuk umum di <a href={REPO} {...ext}>GitHub</a>: simulasinya, game web-nya, dan kontraknya.</>,
      ko: <>네, 시뮬레이션과 웹 게임, 스마트 컨트랙트를 포함한 전체 프로젝트가 <a href={REPO} {...ext}>GitHub</a>에 오픈소스로 공개되어 있습니다.</>,
      zh: <>可以，整个项目均已在 <a href={REPO} {...ext}>GitHub</a> 上公开：包括模拟引擎、网页端游戏以及智能合约。</>,
    },
  },
];

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="faq">
      <div className="faq-inner">
        <span className="faq-pill font-display"><T en="Questions" id="Pertanyaan" ko="질문" zh="问题" /></span>
        <h2 id="faq-title" className="faq-title font-serif-display" data-reveal-words>
          <T
            en={<>Before you <em>take office</em></>}
            id={<>Sebelum kamu <em>mulai berkuasa</em></>}
            ko={<><em>취임하기</em> 전에</>}
            zh={<><em>执政</em>之前</>}
          />
        </h2>
        <p className="faq-lead">
          <T
            en="Straight answers about what works today and what is still on the way."
            id="Jawaban apa adanya: apa yang sudah jalan hari ini dan apa yang masih dalam perjalanan."
            ko="현재 구현된 기능과 앞으로 지원될 기능에 대한 솔직한 답변입니다."
            zh="关于现已实现的功能与后续规划的坦诚解答。"
          />
        </p>
        <div className="faq-list">
          {QA.map(({ key, q, a }, i) => (
            <details key={key} className="faq-item" name="faq" open={i === 0}>
              <summary>
                <span className="faq-num font-display" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="faq-q"><T en={q.en} id={q.id} ko={q.ko} zh={q.zh} /></span>
                <span className="faq-chevron" aria-hidden="true" />
              </summary>
              <div className="faq-a"><T en={a.en} id={a.id} ko={a.ko} zh={a.zh} /></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { ARCS, GRID, SHIELD_TICKS, WORLD_MAYORS } from '@metropolix/sim';
import T from './prefs/T';
import './faq.css';

// Every answer here must stay true to the code: no claim the game is on chain yet, no money promises.
const REPO = 'https://github.com/theodhorex/metropolix';
const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
const SHIELD_MIN = Math.round(SHIELD_TICKS / 60);

const QA: { key: string; q: [string, string]; a: [React.ReactNode, React.ReactNode] }[] = [
  {
    key: 'what',
    q: ['What is Metropolix?', 'Metropolix itu apa?'],
    a: [
      <>A fantasy city builder in pixel art. You pick one of {ARCS.length} peoples, raise a city on a {GRID}×{GRID} map, keep your citizens fed, housed and happy, and raid rival mayors for their gold. One session of about ten minutes is enough to feel how it plays.</>,
      <>Game membangun kota fantasi bergaya pixel art. Kamu memilih satu dari {ARCS.length} bangsa, membangun kota di peta {GRID}×{GRID}, menjaga warga tetap kenyang, punya rumah dan bahagia, lalu menyerbu mayor rival untuk merebut emas mereka. Sekitar sepuluh menit sudah cukup untuk merasakan permainannya.</>,
    ],
  },
  {
    key: 'free',
    q: ['Do I need to sign up, download anything or pay?', 'Perlu daftar, unduh sesuatu, atau bayar?'],
    a: [
      <>No. Press <Link href="/play">Play now</Link> and the game runs in your browser. There is no account, no download and nothing to buy.</>,
      <>Tidak. Tekan <Link href="/play">Play now</Link> dan game langsung berjalan di browser. Tanpa akun, tanpa unduhan, dan tidak ada yang perlu dibeli.</>,
    ],
  },
  {
    key: 'chain',
    q: ['Is the game on the blockchain already?', 'Apakah game ini sudah ada di blockchain?'],
    a: [
      <>Not yet. The NEAR smart contract that will hold your city, its ChainPower and your battle results is written in Rust and tested (see <a href={`${REPO}/tree/HEAD/contracts/metropolix`} {...ext}>contracts/metropolix</a>). The next step is deploying it to NEAR testnet and signing in with a NEAR wallet. Until then everything runs in your browser.</>,
      <>Belum. Smart contract NEAR yang nanti menyimpan kotamu, ChainPower-nya, dan hasil pertempuranmu sudah ditulis dalam Rust dan diuji (lihat <a href={`${REPO}/tree/HEAD/contracts/metropolix`} {...ext}>contracts/metropolix</a>). Langkah berikutnya adalah memasangnya di NEAR testnet dan masuk dengan dompet NEAR. Sampai saat itu, semuanya berjalan di browsermu.</>,
    ],
  },
  {
    key: 'save',
    q: ['Where is my city saved?', 'Kotaku disimpan di mana?'],
    a: [
      <>On this device, in your browser. Clearing this site&apos;s data deletes the city, and a different browser or device starts fresh.</>,
      <>Di perangkat ini, di dalam browsermu. Menghapus data situs ini akan menghapus kotamu, dan browser atau perangkat lain mulai dari awal.</>,
    ],
  },
  {
    key: 'one',
    q: ['Can I have more than one city, or change my people later?', 'Bisa punya lebih dari satu kota, atau ganti bangsa nanti?'],
    a: [
      <>No. One player, one city, and the people you choose is yours for good. That choice decides your land, your army and your trade good, so pick with care.</>,
      <>Tidak. Satu pemain, satu kota, dan bangsa yang kamu pilih berlaku selamanya. Pilihan itu menentukan tanahmu, pasukanmu, dan barang dagangmu, jadi pilih dengan cermat.</>,
    ],
  },
  {
    key: 'mayors',
    q: ['Are the other mayors real players?', 'Apakah mayor lain itu pemain sungguhan?'],
    a: [
      <>Not yet. The {WORLD_MAYORS} rival mayors are simulated: they grow, level up and raid each other and you, and every raid takes gold out of a real treasury in the simulation. They are built to be replaced by real players once the game is on chain.</>,
      <>Belum. Ke-{WORLD_MAYORS} mayor rival itu simulasi: mereka tumbuh, naik level, dan saling menyerbu termasuk menyerbumu, dan setiap serbuan mengambil emas dari kas sungguhan di dalam simulasi. Mereka dirancang untuk digantikan pemain sungguhan setelah game ada di blockchain.</>,
    ],
  },
  {
    key: 'raid',
    q: ['What happens when a rival raids me?', 'Apa yang terjadi kalau rival menyerangku?'],
    a: [
      <>If their attack beats your defense they take part of your gold and some troops. Your city then gets a shield for {SHIELD_MIN} minutes of game time, so you are not raided again straight away. Towers, troops and a defense plan in the war room make you harder to break.</>,
      <>Kalau serangan mereka lebih kuat dari pertahananmu, mereka mengambil sebagian emas dan sebagian pasukanmu. Setelah itu kotamu mendapat perisai selama {SHIELD_MIN} menit waktu game, jadi tidak langsung diserang lagi. Menara, pasukan, dan rencana pertahanan di war room membuatmu lebih sulit ditembus.</>,
    ],
  },
  {
    key: 'money',
    q: ['Can I earn money by playing?', 'Bisa dapat uang dari bermain?'],
    a: [
      <>No, not today. A city coin backed by your city&apos;s treasury is planned for after the move to NEAR. Nothing can be bought, sold or withdrawn right now, and this page will say so plainly when that changes.</>,
      <>Tidak, untuk saat ini. Koin kota yang dijamin oleh kas kotamu direncanakan setelah game pindah ke NEAR. Sekarang tidak ada yang bisa dibeli, dijual, atau ditarik, dan halaman ini akan mengatakannya dengan jelas bila hal itu berubah.</>,
    ],
  },
  {
    key: 'phone',
    q: ['Does it work on my phone?', 'Bisa dimainkan di ponsel?'],
    a: [
      <>It runs in a mobile browser and you can tap to build. It plays best on a larger screen with a mouse, where the map and the side panels have room.</>,
      <>Bisa dibuka di browser ponsel dan kamu bisa mengetuk untuk membangun. Paling nyaman dimainkan di layar yang lebih besar dengan mouse, karena peta dan panel samping punya ruang.</>,
    ],
  },
  {
    key: 'code',
    q: ['Can I see the code?', 'Bisa lihat kodenya?'],
    a: [
      <>Yes, the whole project is public on <a href={REPO} {...ext}>GitHub</a>: the simulation, the web game and the contract.</>,
      <>Bisa, seluruh proyek terbuka untuk umum di <a href={REPO} {...ext}>GitHub</a>: simulasinya, game web-nya, dan kontraknya.</>,
    ],
  },
];

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="faq">
      <div className="faq-inner">
        <span className="faq-pill font-display"><T en="Questions" id="Pertanyaan" /></span>
        <h2 id="faq-title" className="faq-title font-serif-display" data-reveal-words>
          <T en={<>Before you <em>take office</em></>} id={<>Sebelum kamu <em>mulai berkuasa</em></>} />
        </h2>
        <p className="faq-lead">
          <T en="Straight answers about what works today and what is still on the way." id="Jawaban apa adanya: apa yang sudah jalan hari ini dan apa yang masih dalam perjalanan." />
        </p>
        <div className="faq-list">
          {QA.map(({ key, q, a }, i) => (
            <details key={key} className="faq-item" name="faq" open={i === 0}>
              <summary>
                <span className="faq-num font-display" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="faq-q"><T en={q[0]} id={q[1]} /></span>
                <span className="faq-chevron" aria-hidden="true" />
              </summary>
              <div className="faq-a"><T en={a[0]} id={a[1]} /></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

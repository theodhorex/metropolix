'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import T from './prefs/T';
import GateScene from './closing/GateScene';
import './closing.css';

/**
 * The closing scene: the great gate of the realm. The portcullis lifts a little when the gate comes
 * into view and all the way while Play now is hovered or focused, flooding the arch with warm light.
 * Embers drift up from the torches. CSS does the motion; this component only flags visibility.
 */
const EMBERS = [
  [8, 0, 9], [15, 2.4, 11], [24, 5.1, 8], [33, 1.3, 12], [41, 6.2, 10], [50, 3.3, 9], [58, 0.7, 13],
  [66, 4.4, 10], [74, 2.1, 11], [82, 5.6, 9], [90, 1.8, 12], [96, 3.9, 10], [20, 7.2, 14], [70, 7.9, 13],
] as const; // [left %, delay s, duration s]

export default function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      const on = !!e?.isIntersecting;
      el.toggleAttribute('data-offscreen', !on);
      if (on) el.setAttribute('data-open', '');
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={root} id="cta" aria-labelledby="cta-h" className="night-cta relative flex items-center justify-center overflow-hidden px-4 py-24">
      <div className="night-scene" aria-hidden="true">
        <GateScene className="night-img" />
        <div className="night-flies">
          {EMBERS.map(([left, delay, dur], i) => (
            <span key={i} className={`night-fly ${i >= 8 ? 'night-fly-extra' : ''}`} style={{ left: `${left}%`, animationDelay: `-${delay}s`, animationDuration: `${dur}s` }} />
          ))}
        </div>
      </div>

      <div className="night-card relative z-20 mx-auto w-full max-w-xl px-6 py-12 text-center sm:px-10 sm:py-14" data-reveal>
        <div className="mb-3"><span className="landing-pill"><T en="Your turn" id="Giliranmu" ko="당신의 차례" zh="轮到你了" /></span></div>
        <h2 id="cta-h" data-reveal-words className="night-title font-serif-display">
          <T
            en={<>Your realm is <em>waiting.</em></>}
            id={<>Negerimu sudah <em>menunggu.</em></>}
            ko={<>당신의 왕국이 <em>기다리고 있습니다.</em></>}
            zh={<>你的王国正<em>静候君临。</em></>}
          />
        </h2>
        <p className="night-line mx-auto mt-4 max-w-md text-base sm:text-lg">
          <T
            en="Free, in your browser. Your city is saved on this device."
            id="Gratis, langsung di browser. Kotamu disimpan di perangkat ini."
            ko="무료로 브라우저에서 바로 즐기세요. 도시는 이 기기에 저장됩니다."
            zh="免费畅玩，直接在浏览器中运行。城市数据保存在当前设备。"
          />
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/play" data-magnetic className="night-play btn btn-gold px-10 py-4 text-xl">
            <T en="Play now" id="Main sekarang" ko="지금 플레이" zh="立即开玩" />
          </Link>
        </div>
        <p className="night-hint font-display" aria-hidden="true">
          <T
            en="Point at Play now to raise the gate"
            id="Arahkan ke Main sekarang untuk membuka gerbang"
            ko="지금 플레이 버튼에 마우스를 올리면 성문이 열립니다"
            zh="将光标悬停在“立即开玩”上方开启城门"
          />
        </p>
      </div>
    </section>
  );
}

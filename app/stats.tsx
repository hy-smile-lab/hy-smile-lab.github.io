'use client';
import {useEffect, useRef, useState} from 'react';
import {useAchievements} from './achievements';
import {usePeople} from './people';

/* 화면에 들어오면 0부터 목표값까지 숫자가 올라가는 카운터 */
function CountUp({value}: {value: number}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return; }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1800;
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        setN(Math.round(value * (1 - Math.pow(1 - k, 4))));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, {threshold: 0.4});
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref}>{n.toLocaleString('ko-KR')}</span>;
}

function StatIcon({name}: {name: string}) {
  const p = {fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg viewBox="0 0 32 32" width="30" height="30">
      {name === 'cap' && <g {...p}><path d="M3 12 16 6l13 6-13 6Z" /><path d="M9 15v6c0 2 3 4 7 4s7-2 7-4v-6" /><path d="M29 12v7" /></g>}
      {name === 'globe' && <g {...p}><circle cx="16" cy="16" r="11" /><path d="M5 16h22M16 5c4 4 4 18 0 22M16 5c-4 4-4 18 0 22" /></g>}
      {name === 'book' && <g {...p}><path d="M5 7c4-1 8-1 11 2v17c-3-3-7-3-11-2Z" /><path d="M27 7c-4-1-8-1-11 2v17c3-3 7-3 11-2Z" /></g>}
      {name === 'mic' && <g {...p}><rect x="12" y="4" width="8" height="14" rx="4" /><path d="M8 14c0 5 4 8 8 8s8-3 8-8M16 22v5M11 27h10" /></g>}
    </svg>
  );
}

/* 연구실 주요 실적 수치 — achievements.json·people.json에서 자동 집계 */
export default function Stats({compact = false}: {compact?: boolean}) {
  const data = useAchievements();
  const people = usePeople();
  const by = (k: string) => data.items.filter(i => i.kind === k);
  const sci = by('국외논문').filter(i => /SCI|SSCI/i.test(i.fields.find(f => f.label === '색인')?.value || '')).length;
  const firstYear = Math.min(...data.items.filter(i => ['국내논문', '국외논문'].includes(i.kind)).map(i => +i.year).filter(Boolean));
  const cards = [
    {label: '졸업생', value: people.alumni.length, unit: '명', note: '연구기관·대학·기업으로 진출', tone: 'blue', icon: 'cap'},
    {label: 'SCI·SSCI 논문', value: sci, unit: '편', note: 'SCI·SCIE·SSCI 등재 학술지', tone: 'orange', icon: 'globe'},
    {label: '국내 학술지 논문', value: by('국내논문').length, unit: '편', note: `${firstYear}년부터 누적`, tone: 'green', icon: 'book'},
    {label: '학술대회 발표', value: by('학술대회 참여').length, unit: '건', note: '국내외 학술대회', tone: 'gold', icon: 'mic'},
  ];
  return (
    <section className={'stats' + (compact ? ' compact' : '')} aria-label="연구실 주요 실적">
      {!compact && (
        <div className="stats-head">
          <span className="stats-watermark" aria-hidden="true">ACHIEVEMENTS</span>
          <h2><b>O</b>ur <b>A</b>chievements</h2>
        </div>
      )}
      <div className="stats-grid">
        {cards.map(c => (
          <div key={c.label} className={'stat-tile tone-' + c.tone}>
            <span className="stat-icon" aria-hidden="true"><StatIcon name={c.icon} /></span>
            <p className="stat-label">{c.label}</p>
            <p className="stat-number"><CountUp value={c.value} /><small>{c.unit}</small></p>
            <p className="stat-note">{c.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

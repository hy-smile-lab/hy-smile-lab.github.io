'use client';
import {withBase} from './base';
import {useMemo} from 'react';
import {feature} from 'topojson-client';
import {geoNaturalEarth1, geoPath} from 'd3-geo';
import world from 'world-atlas/countries-110m.json';
import type {Achievement} from './achievements';
import overseas from '../public/overseas.json';
import albums from '../public/albums.json';
import Flag from './flag';

/* 국외 학술대회: 영문 학술대회 중 해외에서 개최된 것 (국내 개최 국제학술대회는 국내로 분류) */
export const isInternational = (i: Achievement) => !/[가-힣]/.test(i.venue) && conferenceCountry(i)?.code !== 'KR';

/* 개최지(장소·학술대회명)로 국가 판정. 새 개최국은 여기에 한 줄 추가 (code: 국기용 ISO 코드) */
const COUNTRIES: {code: string; name: string; keys: RegExp}[] = [
  {code: 'US', name: '미국', keys: /USA|United States|Washington|Detroit|Detrot|TRB|Transportation research board/i},
  {code: 'JP', name: '일본', keys: /Japan|Tokyo/i},
  {code: 'FR', name: '프랑스', keys: /France|Bordeaux/i},
  {code: 'GR', name: '그리스', keys: /Greece|Athens/i},
  {code: 'PH', name: '필리핀', keys: /Philippines|Cebu/i},
  {code: 'RO', name: '루마니아', keys: /Romania/i},
  {code: 'TW', name: '대만', keys: /Taiwan|Taipei/i},
  {code: 'KR', name: '대한민국', keys: /Korea|Seoul|Busan|제주|서울|부산/i},
];
export function conferenceCountry(i: Achievement) {
  const place = (i.fields.find(f => f.label === '장소')?.value || '') + ' ' + i.venue;
  return COUNTRIES.find(c => c.keys.test(place));
}

type Place = (typeof overseas.places)[number] & {album?: string; photo?: string};
type Geo = {type: string; features: {id: string; properties: {name: string}}[]};
const land = feature(world as never, (world as never as {objects: {countries: never}}).objects.countries) as unknown as Geo;
const albumPhoto = (id?: string) => {
  const a = (albums.items as {id: string; images: {path: string}[]}[]).find(x => x.id === id);
  const p = a?.images[0]?.path;
  return p ? (globalThis as typeof globalThis & {HY_ALBUMS?: Record<string, string>}).HY_ALBUMS?.[p] || withBase(p) : '';
};
const asset = (p: string) => (globalThis as typeof globalThis & {HY_ASSETS?: Record<string, string>}).HY_ASSETS?.[p] || withBase(p);
const lastYear = (p: {events: {year: string}[]}) => Math.max(...p.events.map(e => +e.year.slice(-4)));
const COLOR = {conference: '#A6CE39', exchange: '#F7931E'};
const SEOUL: [number, number] = [126.98, 37.57];

/* 레이아웃 (viewBox 단위): 사진 카드가 지도 둘레를 감싸고, 지시선으로 개최지 핀과 연결 */
const W = 1200, H = 1000, CW = 160, CH = 190;
const SIDE = (k: number) => CH + 16 + k * ((H - 2 * (CH + 16) - CH) / 2);
const SLOTS: [number, number][] = [
  ...Array.from({length: 7}, (_, k) => [k * (W - CW) / 6, 0] as [number, number]),
  ...[0, 1, 2].map(k => [W - CW, SIDE(k)] as [number, number]),
  ...Array.from({length: 7}, (_, k) => [(6 - k) * (W - CW) / 6, H - CH] as [number, number]),
  ...[2, 1, 0].map(k => [0, SIDE(k)] as [number, number]),
];

export default function ConferenceMap() {
  const {proj, path, cards, pins} = useMemo(() => {
    const proj = geoNaturalEarth1().rotate([-150, 0]).fitExtent([[20, 150], [W - 20, H - 70]], {type: 'Sphere'} as never);
    const path = geoPath(proj);
    const pins = (overseas.places as Place[]).map(p => ({...p, xy: proj([p.lon, p.lat]) as [number, number], photo: p.photo ? asset(p.photo) : albumPhoto(p.album)}));
    /* 카드 자리가 모자라면 최근 연도 순으로 남김 (나머지는 국기 핀으로 표시) */
    const withPhoto = pins.filter(p => p.photo).sort((a, b) => lastYear(b) - lastYear(a)).slice(0, SLOTS.length);
    /* 핀과 슬롯을 지도 중심 기준 각도 순으로 짝지어 지시선이 서로 엇갈리지 않게 배치 */
    const cx = W / 2, cy = H / 2;
    const ang = ([x, y]: [number, number]) => Math.atan2(y - cy, x - cx);
    const sorted = [...withPhoto].sort((a, b) => ang(a.xy) - ang(b.xy));
    const slots = [...SLOTS].sort((a, b) => ang([a[0] + CW / 2, a[1] + CH / 2]) - ang([b[0] + CW / 2, b[1] + CH / 2]));
    let best: {cost: number; pick: [number, number][]} = {cost: Infinity, pick: []};
    for (let skip = 0; skip < slots.length; skip++) {
      const use = slots.filter((_, i) => i < skip || i >= skip + slots.length - sorted.length);
      for (let shift = 0; shift < use.length; shift++) {
        const pick = sorted.map((_, i) => use[(i + shift) % use.length]);
        const cost = sorted.reduce((s, p, i) => s + Math.hypot(pick[i][0] + CW / 2 - p.xy[0], pick[i][1] + CH / 2 - p.xy[1]), 0);
        if (cost < best.cost) best = {cost, pick};
      }
    }
    /* 지시선 교차 제거: 두 카드의 슬롯을 바꿔 총 길이가 줄면 교환 (빈 슬롯 포함) */
    const pick = [...best.pick];
    const free = slots.filter(s => !pick.includes(s));
    const d = (p: {xy: [number, number]}, s: [number, number]) => Math.hypot(s[0] + CW / 2 - p.xy[0], s[1] + CH / 2 - p.xy[1]);
    for (let round = 0, changed = true; changed && round < 50; round++) {
      changed = false;
      for (let a = 0; a < sorted.length; a++) {
        for (let b = a + 1; b < sorted.length; b++) {
          if (d(sorted[a], pick[b]) + d(sorted[b], pick[a]) < d(sorted[a], pick[a]) + d(sorted[b], pick[b]) - .5) { [pick[a], pick[b]] = [pick[b], pick[a]]; changed = true; }
        }
        for (let f = 0; f < free.length; f++) {
          if (d(sorted[a], free[f]) < d(sorted[a], pick[a]) - .5) { [pick[a], free[f]] = [free[f], pick[a]]; changed = true; }
        }
      }
    }
    const cards = sorted.map((p, i) => ({...p, slot: pick[i]}));
    return {proj, path, cards, pins};
  }, []);
  const carded = new Set(cards.map(c => c.id));
  const seoul = proj(SEOUL) as [number, number];
  const anchor = (slot: [number, number], [px, py]: [number, number]): [number, number] => [Math.max(slot[0], Math.min(slot[0] + CW, px)), Math.max(slot[1], Math.min(slot[1] + CH, py))];
  const countries = new Set(pins.map(p => p.country)).size;

  return (
    <div className="conf-map">
      <div className="conf-map-top">
        <p className="conf-legend-line"><span><i style={{background: COLOR.conference}} />국외 학술대회 참가</span><span><i style={{background: COLOR.exchange}} />해외 기관 교류</span></p>
        <p className="conf-flags" aria-label={countries + '개국'}>{[...new Set(pins.map(p => p.country))].map(c => <Flag key={c} code={c} />)}</p>
      </div>
      <div className="conf-stage" style={{aspectRatio: `${W} / ${H}`}}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={'국외 학술대회 및 교류 지역: ' + pins.map(p => p.city).join(', ')}>
          <defs>
            <radialGradient id="cm-sea" cx=".5" cy=".5" r=".6"><stop offset="0" stopColor="#eef4fa" /><stop offset="1" stopColor="#dfe9f3" /></radialGradient>
          </defs>
          <path d={path({type: 'Sphere'} as never) || ''} fill="url(#cm-sea)" />
          {land.features.map(f => <path key={String(f.id) + f.properties.name} d={path(f as never) || ''} fill={f.id === '410' ? '#00457E' : '#c9d5e1'} stroke="#fff" strokeWidth=".6" />)}
          {pins.map(p => {
            const [x, y] = p.xy; const mx = (x + seoul[0]) / 2, my = (y + seoul[1]) / 2 - Math.hypot(x - seoul[0], y - seoul[1]) * .28;
            return <path key={'a' + p.id} className="conf-arc" d={`M${seoul[0]} ${seoul[1]} Q${mx} ${my} ${x} ${y}`} stroke={COLOR[p.type as keyof typeof COLOR]} />;
          })}
          {cards.map(c => { const [ax, ay] = anchor(c.slot, c.xy); return <line key={'l' + c.id} className="conf-leader" x1={ax} y1={ay} x2={c.xy[0]} y2={c.xy[1]} stroke={COLOR[c.type as keyof typeof COLOR]} />; })}
          {pins.map(p => (
            <g key={p.id} transform={`translate(${p.xy[0]} ${p.xy[1]})`} className="conf-pin">
              <title>{p.events.map(e => `${e.name} ${e.year}`).join(', ') + ' · ' + p.city}</title>
              {carded.has(p.id) && <circle r="7" fill={COLOR[p.type as keyof typeof COLOR]} className="conf-pulse" />}
              <circle r="6" fill={COLOR[p.type as keyof typeof COLOR]} stroke="#fff" strokeWidth="2" />
            </g>
          ))}
          <g transform={`translate(${seoul[0]} ${seoul[1]})`}>
            <circle r="9" fill="#00457E" stroke="#fff" strokeWidth="3" />
            <text y="-15" textAnchor="middle" className="conf-home">HY-SMILE</text>
          </g>
        </svg>
        <div className="conf-cards">
          {cards.map(c => (
            <article key={c.id} className={'conf-card ' + c.type} style={{left: (c.slot[0] / W * 100) + '%', top: (c.slot[1] / H * 100) + '%', width: (CW / W * 100) + '%', height: (CH / H * 100) + '%'}}>
              <img src={c.photo} alt={c.events[0].name + ' 사진'} loading="lazy" />
              <div>
                <p className="conf-card-top"><Flag code={c.country} /><b>{c.events[0].year}</b></p>
                <h3>{c.events[0].name}</h3>
                <p className="conf-card-city">{c.city}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

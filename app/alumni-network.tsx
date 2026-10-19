'use client';
import {withBase} from './base';
import {useState, type SyntheticEvent} from 'react';
import {tiltMove, tiltReset} from './tilt';
import registry from '../public/organizations.json';
import people from '../public/people.json';

export function getOrganization(affiliation: string) {
  return registry.organizations.find(o => o.matches.some(m => affiliation.toLowerCase().includes(m.toLowerCase())));
}
const logoSrc = (p: string) => (globalThis as typeof globalThis & {HY_ORG_LOGOS?: Record<string, string>}).HY_ORG_LOGOS?.[p] || withBase(p);

/* 졸업생 진출 기관 카드 (홈: 대표 기관만, 졸업생 페이지: 분류 필터 포함 전체) */
export default function AlumniNetwork({compact = false, alumni = people.alumni}: {compact?: boolean; alumni?: {name: string; affiliation: string}[]}) {
  const [filter, setFilter] = useState('전체');
  const [failed, setFailed] = useState<string[]>([]);
  const entries = registry.organizations
    .map(o => ({...o, members: alumni.filter(p => getOrganization(p.affiliation)?.id === o.id)}))
    .filter(o => o.members.length && (!compact || o.featured) && (filter === '전체' || o.category === filter));
  return (
    <div className="network">
      {!compact && (
        <div className="pill-tabs">
          {['전체', '연구·공공', '대학', '기업·산업'].map(f => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      )}
      <div className="org-grid">
        {entries.map(o => (
          <a key={o.id} href={o.url} target="_blank" rel="noopener noreferrer" className="org-card" onPointerMove={e => tiltMove(e, 8)} onPointerLeave={tiltReset} aria-label={o.name + ' 공식 홈페이지 (새 창)'}>
            <span className="org-cat">{o.category}</span>
            <span className="org-logo">
              {o.logo && !failed.includes(o.id)
                ? <img src={logoSrc(o.logo)} alt={o.name + ' 로고'} onError={() => setFailed(v => [...v, o.id])} />
                : <span className="org-word">{o.wordmark}</span>}
              {o.logoWordmark && <span className="org-word small">{o.logoWordmark}</span>}
            </span>
            <span className="org-name">{o.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* 로고 가로세로비에 따라 높이를 보정해 시각적 크기를 비슷하게 맞춤 */
function fitLogo(e: SyntheticEvent<HTMLImageElement>) {
  const im = e.currentTarget; const ar = im.naturalWidth / Math.max(1, im.naturalHeight);
  const h = Math.max(20, Math.min(46, 44 / Math.pow(ar, 0.42)));
  im.style.height = h + 'px'; im.style.width = 'auto'; im.style.maxWidth = '150px';
}

/* 홈 화면용: 진출 기관 로고가 끊임없이 흐르는 띠 */
export function LogoMarquee() {
  const orgs = registry.organizations.filter(o => o.logo && people.alumni.some(p => getOrganization(p.affiliation)?.id === o.id));
  const row = orgs.map(o => (
    <a key={o.id} href={o.url} target="_blank" rel="noopener noreferrer" className="mq-item" aria-label={o.name}>
      <img src={logoSrc(o.logo)} alt={o.name + ' 로고'} onLoad={fitLogo} />
      {o.logoWordmark && <span className="mq-word">{o.logoWordmark}</span>}
    </a>
  ));
  return (
    <div className="marquee">
      <div className="mq-track"><div className="mq-row">{row}</div><div className="mq-row" aria-hidden="true" inert>{row}</div></div>
    </div>
  );
}

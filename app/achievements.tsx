'use client';
import {withBase} from './base';
import {Fragment, useEffect, useMemo, useState} from 'react';
import {PaperAction, JournalBadges, type PaperLink} from './publications';
import seed from '../public/achievements.json';
import ConferenceMap, {conferenceCountry, isInternational} from './conference-map';
import Flag from './flag';
import {OngoingProjects} from './research';
import ongoing from '../public/projects-ongoing.json';
const replaced = new Set((ongoing.items as {replaces?: string}[]).map(i => i.replaces).filter(Boolean));

export type Achievement = {
  id: string; kind: string; title: string; date: string; year: string; authors: string; venue: string;
  paperLink?: PaperLink; fields: {label: string; value: string}[]; source: {sheet: string; rows: number[]; range: string};
};
export type AchievementData = {version: number; updated: string; sourceFile: string; sourceDate: string; items: Achievement[]};

const kinds: Record<string, string[]> = {
  논문: ['국내논문', '국외논문'], 프로젝트: ['연구과제수행'], 특허: ['특허'], 수상실적: ['수상실적'],
  '학술대회 참여': ['학술대회 참여'], 저서: ['저서'], 기술이전: ['기술이전'],
};
export const achievementPages = Object.keys(kinds);
/* 검색창은 RESEARCH·PUBLICATIONS 목록에만 표시 */
export const searchablePages = ['프로젝트', '특허', '기술이전', '논문', '학술대회 참여'];

const field = (i: Achievement, label: string) => i.fields.find(f => f.label === label)?.value || '';
const PER_PAGE = 20;

function valid(v: unknown): v is AchievementData {
  const d = v as AchievementData;
  return !!d && d.version === 1 && Array.isArray(d.items) && d.items.every(i => i && typeof i.title === 'string' && Array.isArray(i.fields));
}

/* 실적 데이터: achievements.json을 주기적으로 다시 읽어 공유드라이브 갱신분을 반영 */
export function useAchievements() {
  const [data, setData] = useState<AchievementData>(seed as AchievementData);
  useEffect(() => {
    if (location.protocol === 'file:') return;
    const sync = () => fetch(withBase('/achievements.json'), {cache: 'no-store'}).then(r => (r.ok ? r.json() : Promise.reject())).then(d => { if (valid(d)) setData(d); }).catch(() => {});
    sync();
    const t = setInterval(sync, 60000);
    return () => clearInterval(t);
  }, []);
  return data;
}

function Paper({i}: {i: Achievement}) {
  const apa = field(i, 'APA 서지정보');
  const intl = i.kind === '국외논문';
  return (
    <article className={'row-card paper ' + (intl ? 'intl' : 'dom')}>
      <div className="row-side"><span className="year">{i.year}</span><span className={'badge ' + (intl ? 'blue' : 'green')}>{intl ? '국외' : '국내'}</span></div>
      <div className="row-main">
        <h3 className="ptitle">{i.title}</h3>
        {i.authors && <p>{i.authors}</p>}
        <p className="meta"><b className="venue">{i.venue}</b>{i.date && ' · ' + i.date}</p>
        {apa && <details className="cite"><summary>인용</summary><p>{apa}</p></details>}
      </div>
      <div className="row-actions"><JournalBadges paper={i} /><PaperAction paper={i} /></div>
    </article>
  );
}

/* 사업구분·연구유형별 색 구분 */
const FUND: Record<string, string> = {정부지원연구: 'blue', 산업체지원연구: 'green', 교비지원연구: 'gold', 간접비지원연구: 'silver'};
function Project({i}: {i: Achievement}) {
  const fund = field(i, '사업구분'), type = field(i, '연구유형');
  const [from, to] = i.date.split(' ~ ');
  return (
    <article className={'line-row project f-' + (FUND[fund] || 'silver')}>
      <span className="line-date">{from?.slice(0, 7)}<i>~</i>{to?.slice(0, 7)}</span>
      <h3>{i.title}</h3>
      <span className="line-org">{i.venue}</span>
      <span className="line-tags">
        {fund && <span className={'tag ' + (FUND[fund] || 'silver')}>{fund.replace('지원연구', '')}</span>}
        {type && <span className={'tag ' + (type === 'RND' ? 'orange' : 'outline')}>{type === 'RND' ? 'R&D' : type}</span>}
      </span>
    </article>
  );
}

function Patent({i}: {i: Achievement}) {
  const status = field(i, '등록 여부') || '출원';
  const no = field(i, '등록번호') || field(i, '출원번호');
  const day = field(i, '등록일자') || field(i, '출원일자');
  return (
    <article className={'line-row patent ' + (status === '등록' ? 's-reg' : 's-app')}>
      <span className={'badge ' + (status === '등록' ? 'blue' : 'orange')}>{status}</span>
      <div className="line-main">
        <h3>{i.title}</h3>
        {i.authors && <p className="meta">{i.authors}</p>}
      </div>
      <span className="line-no"><small>{field(i, '등록번호') ? '등록번호' : '출원번호'}</small>{no}</span>
      <span className="line-date">{day}</span>
    </article>
  );
}

function Transfer({i}: {i: Achievement}) {
  return (
    <article className="line-row transfer">
      <span className="badge green">기술이전</span>
      <h3>{i.title}</h3>
      <span className="line-org">{i.venue}</span>
      <span className="line-date">{i.date.split(' ~ ')[0]}</span>
    </article>
  );
}

/* 수상실적: 연도별 타임라인. 학술상·특별상 등은 금색, 국제 수상은 주황색으로 강조 */
const awardTone = (i: Achievement) => /국외|국제/.test(field(i, '국내/국제')) ? 'tone-intl' : /학술상|특별상|100대|Best Paper/.test(i.title + field(i, '수상내용')) ? 'tone-major' : 'tone-paper';
function AwardTimeline({items}: {items: Achievement[]}) {
  const years = [...new Set(items.map(i => i.year))];
  return (
    <div className="award-timeline">
      <p className="award-legend"><span className="tone-major">학술상·특별상</span><span className="tone-intl">국제 수상</span><span className="tone-paper">우수논문상</span></p>
      {years.map(y => {
        const list = items.filter(i => i.year === y);
        const groups = list.reduce<{i: Achievement; n: number}[]>((g, i) => { const f = g.find(x => x.i.title === i.title && x.i.venue === i.venue && x.i.date === i.date && field(x.i, '수상자') === field(i, '수상자')); if (f) f.n++; else g.push({i, n: 1}); return g; }, []);
        return (
          <section key={y} className="award-year">
            <h3 className="award-y">{y}</h3>
            <ul>
              {groups.map(({i, n}) => (
                <li key={i.id} className={'award-item ' + awardTone(i)}>
                  <svg className="medal" viewBox="0 0 48 48" aria-hidden="true"><path d="M14 4h8l4 12-8 2zM34 4h-8l-4 12 8 2z" /><circle cx="24" cy="30" r="14" /><circle cx="24" cy="30" r="9" fill="none" stroke="#fff" strokeWidth="2" /></svg>
                  <div><b>{i.title}</b><span>{i.venue === '미국' ? 'TRB (미국)' : i.venue} · {i.date.slice(5)}</span>{field(i, '수상자') && <span className="award-winners">{field(i, '수상자')}</span>}</div>
                  {n > 1 && <em>×{n}</em>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Conference({i}: {i: Achievement}) {
  const intl = isInternational(i);
  const c = conferenceCountry(i);
  return (
    <article className="row-card conference">
      <div className="row-side"><span className="year">{i.year}</span>{intl && c && <span className="flag-chip"><Flag code={c.code} />{c.name}</span>}</div>
      <div className="row-main">
        <h3>{i.title}</h3>
        <p>{[i.authors, field(i, '공저자')].filter(Boolean).join(', ')}</p>
        <p className="meta">{i.venue}{field(i, '장소') && ' · ' + field(i, '장소')}</p>
      </div>
    </article>
  );
}

function Book({i}: {i: Achievement}) {
  const [main, ...rest] = i.title.split(' ');
  return (
    <article className="book">
      <div className="book-3d has-cover" aria-hidden="true">
        <img className="book-cover-img" src={(globalThis as typeof globalThis & {HY_ASSETS?: Record<string, string>}).HY_ASSETS?.['/assets/book-cover.webp'] || withBase('/assets/book-cover.webp')} alt="" />
        <div className="book-cover">
          <span className="book-edition">{rest.join(' ')}</span>
          <span className="book-title">{main}</span>
          <svg viewBox="0 0 120 70"><path d="M0 60 L60 20 L120 60" fill="none" stroke="#A6CE39" strokeWidth="5" /><path d="M20 70 L60 34 L100 70" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="6 6" /></svg>
          <span className="book-authors">{i.authors}</span>
        </div>
        <div className="book-spine" />
        <div className="book-pages" />
      </div>
      <div className="book-info">
        <p className="eyebrow">BOOK</p>
        <h3>{i.title}</h3>
        <p>{i.authors}</p>
        <dl className="facts">
          <dt>출판사</dt><dd>{i.venue}</dd>
          <dt>발행일</dt><dd>{i.date}</dd>
          {i.fields.filter(f => f.label !== '발간등록번호').map(f => <Fragment key={f.label}><dt>{f.label === '비고' ? '분량' : f.label}</dt><dd>{f.value}</dd></Fragment>)}
        </dl>
      </div>
    </article>
  );
}

export default function Achievements({category, query}: {category: string; query: string}) {
  const data = useAchievements();
  const [scope, setScope] = useState('전체');
  const [year, setYear] = useState('전체');
  const [page, setPage] = useState(1);
  const isConf = category === '학술대회 참여';
  useEffect(() => { setPage(1); setScope(isConf ? '국외' : '전체'); setYear('전체'); }, [category, isConf]);
  useEffect(() => { setPage(1); }, [query, scope, year]);

  const all = useMemo(() => data.items.filter(i => kinds[category]?.includes(i.kind) && !replaced.has(i.id)).sort((a, b) => b.date.localeCompare(a.date)), [data, category]);
  const scopes = isConf ? ['국외', '국내'] : ['전체', ...(kinds[category].length > 1 ? kinds[category] : [])];
  const inScope = (i: Achievement) => isConf ? (scope === '국외') === isInternational(i) : scope === '전체' || i.kind === scope;
  const count = (s: string) => isConf ? all.filter(i => (s === '국외') === isInternational(i)).length : s === '전체' ? all.length : all.filter(i => i.kind === s).length;
  const years = [...new Set(all.filter(inScope).map(i => i.year).filter(Boolean))].sort().reverse();
  const shown = all.filter(i => inScope(i) && (year === '전체' || i.year === year) && [i.title, i.authors, i.venue, ...i.fields.map(f => f.value)].join(' ').toLowerCase().includes(query.toLowerCase()));
  const totalPages = category === '수상실적' ? 1 : Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const rows = shown.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  if (category === '저서') return <section className="achievements">{all.map(i => <Book key={i.id} i={i} />)}</section>;

  const Item = {논문: Paper, 프로젝트: Project, 특허: Patent, 기술이전: Transfer, '학술대회 참여': Conference}[category] || Paper;
  const tiles = false;
  const lines = ['프로젝트', '특허', '기술이전'].includes(category);
  return (
    <section className="achievements">
      {isConf && scope === '국외' && <ConferenceMap />}
      {category === '프로젝트' && <OngoingProjects />}
      {all.length > 6 && (
        <div className="toolbar">
          {scopes.length > 1 && (
            <div className="pill-tabs">
              {scopes.map(k => <button key={k} className={scope === k ? 'active' : ''} onClick={() => setScope(k)}>{k} <span>{count(k)}</span></button>)}
            </div>
          )}
          <label className="select">연도
            <select value={year} onChange={e => setYear(e.target.value)}>
              <option>전체</option>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </label>
        </div>
      )}
      {category === '수상실적' ? <AwardTimeline items={shown} /> : <div className={tiles ? 'tile-grid' : lines ? 'line-list' : 'row-list'}>{rows.map(i => <Item key={i.id} i={i} />)}</div>}
      {!rows.length && <p className="empty">조건에 맞는 자료가 없습니다.</p>}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={current <= 1} onClick={() => setPage(current - 1)}>← 이전</button>
          <span>{current} / {totalPages}</span>
          <button disabled={current >= totalPages} onClick={() => setPage(current + 1)}>다음 →</button>
        </div>
      )}
    </section>
  );
}

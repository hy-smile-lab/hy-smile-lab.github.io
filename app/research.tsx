'use client';
import research from '../public/research.json';
import ongoing from '../public/projects-ongoing.json';
import ResearchScene, {AreaScene} from './research-scenes';


/* 연구 분야: 홈(compact)과 연구 분야 페이지(full)에서 함께 사용 */
export default function Research({compact = false, onExplore}: {compact?: boolean; onExplore?: () => void; onNavigate?: (page: string) => void}) {
  return (
    <div className={'area-grid' + (compact ? ' compact' : '')}>
      {research.areas.map(a => (
        <article key={a.id} className={'area-card tone-' + a.tone} id={a.id}>
          <AreaScene id={a.id} />
          <div className="area-body">
            <p className="eyebrow">{a.english}</p>
            <h3>{a.title}</h3>
            <ul className="area-items">{a.items.map(t => <li key={t}>{t}</li>)}</ul>
            {compact && <button className="link" onClick={onExplore}>연구 분야 보기 ↗</button>}
          </div>
        </article>
      ))}
    </div>
  );
}

/* 수행 중인 과제: 대표 과제는 연구 장면 애니메이션과 함께 표시 */
export function OngoingProjects() {
  const items = ongoing.items as {id: string; title: string; subtitle?: string; org: string; fund: string; type: string; start: string; scene?: number; english?: string; summary?: string; tags?: string[]}[];
  const featured = items.filter(i => i.type === 'RND');
  const rest = items.filter(i => i.type !== 'RND');
  return (
    <section className="ongoing">
      <h2 className="block-title">수행 중인 과제 <span className="live-dot">Ongoing</span></h2>
      <div className="research-grid ongoing-grid">
        {featured.map(p => (
          <article key={p.id} className="research-card">
            <ResearchScene index={p.scene!} />
            <div className="research-body">
              <p className="ongoing-meta"><span className={'tag ' + (p.type === 'RND' ? 'orange' : 'outline')}>{p.type === 'RND' ? 'R&D' : p.type}</span><span>{p.start} ~ 진행 중</span></p>
              <h3 className="h-wrap">{p.title}</h3>
              {p.subtitle && <p className="meta">{p.subtitle}</p>}
              <p className="line-org">{p.org}</p>
            </div>
          </article>
        ))}
      </div>
      {!!rest.length && (
        <div className="line-list ongoing-list">
          {rest.map(p => (
            <article key={p.id} className="line-row project f-blue">
              <span className="line-date">{p.start}<i>~</i>진행 중</span>
              <h3>{p.title}</h3>
              <span className="line-org">{p.org}</span>
              <span className="line-tags"><span className="tag blue">{p.fund.replace('지원연구', '')}</span><span className={'tag ' + (p.type === 'RND' ? 'orange' : 'outline')}>{p.type === 'RND' ? 'R&D' : p.type}</span></span>
            </article>
          ))}
        </div>
      )}
      <h2 className="block-title">수행 완료 과제</h2>
    </section>
  );
}

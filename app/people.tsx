'use client';
import {withBase} from './base';
import {useEffect, useState} from 'react';
import seed from '../public/people.json';
import {ProfilePublications} from './publications';
import AlumniNetwork, {getOrganization} from './alumni-network';

export type Person = {
  id: string; name: string; role: string; affiliation: string; research: string; email: string; photo: string;
  photoCrop?: number[]; website?: string; degree?: string; publicationNames?: string[];
  sections: {title: string; items: string[]}[];
};
export type PeopleData = {version: number; updated: string; sourceNote: string; sources: string[]; professor: Person[]; members: Person[]; alumni: Person[]};

export const photoSrc = (p: string) => (globalThis as typeof globalThis & {HY_PHOTOS?: Record<string, string>}).HY_PHOTOS?.[p] || withBase(p);

function valid(v: unknown): v is PeopleData {
  const d = v as PeopleData;
  return !!d && d.version === 1 && (['professor', 'members', 'alumni'] as const).every(k => Array.isArray(d[k]) && d[k].every(p => p && typeof p.name === 'string' && typeof p.photo === 'string' && Array.isArray(p.sections)));
}

/* 구성원 데이터: people.json을 주기적으로 다시 읽어 공유드라이브 갱신분을 반영 */
export function usePeople() {
  const [data, setData] = useState<PeopleData>(seed as PeopleData);
  useEffect(() => {
    if (location.protocol === 'file:') return;
    const sync = () => fetch(withBase('/people.json'), {cache: 'no-store'}).then(r => (r.ok ? r.json() : Promise.reject())).then(v => { if (valid(v)) setData(v); }).catch(() => {});
    sync();
    const t = setInterval(sync, 60000);
    return () => clearInterval(t);
  }, []);
  return data;
}

function Portrait({p}: {p: Person}) {
  return (
    <div className="portrait">
      {p.photo ? (
        <img src={photoSrc(p.photo)} alt={p.name + ' 사진'} onError={e => { e.currentTarget.style.display = 'none'; }} />
      ) : (
        <svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="62" r="28" /><path d="M24 160v-14a56 56 0 0 1 112 0v14Z" /></svg>
      )}
    </div>
  );
}

function orgUrl(p: Person) { return p.website || getOrganization(p.affiliation)?.url || ''; }

export default function People({category}: {category: string}) {
  const data = usePeople();
  const [detail, setDetail] = useState<Person | null>(null);
  const key = category === '교수 소개' ? 'professor' : category === '구성원' ? 'members' : 'alumni';
  const rows = data[key];

  useEffect(() => {
    if (!detail) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setDetail(null);
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [detail]);

  if (key === 'professor') {
    return (
      <section className="professor">
        {rows.map(p => (
          <article key={p.id} className="professor-card">
            <aside>
              <Portrait p={p} />
              <p className="role">{p.role}</p>
              <h2>{p.name}</h2>
              <p className="meta">{p.affiliation}</p>
              {p.email && <p className="meta">{p.email}</p>}
              {p.website && <a className="link" href={p.website} target="_blank" rel="noreferrer">Google Scholar ↗</a>}
            </aside>
            <div className="cv">
              {p.sections.map(s => (
                <section key={s.title}>
                  <h3>{s.title.replace(/^(\S)(\s+\S)+$/, t => t.replace(/\s+/g, '')).replace(/\s+/g, ' ')}</h3>
                  <ul className="dot-list">{s.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                </section>
              ))}
            </div>
          </article>
        ))}
      </section>
    );
  }

  return (
    <section className="people">
      {key === 'alumni' && (
        <>
          <h2 className="block-title">진출 분야</h2>
          <AlumniNetwork alumni={data.alumni} />
          <h2 className="block-title">졸업생</h2>
        </>
      )}
      <div className={'people-grid ' + key}>
        {rows.map(p => (
          <article key={p.id} className="person-card">
            <div className="person-top"><Portrait p={p} /></div>
            <div className="person-body">
              <p className="role">{p.role || '졸업생'}</p>
              <h3>{p.name}</h3>
              {key === 'alumni' && <p className="meta">{p.affiliation}</p>}
              {key === 'members' && <p className="research">{p.research}</p>}
              <p className="email">{p.email}</p>
              <div className="link-row">
                {key === 'alumni' && orgUrl(p) && <a className="link" href={orgUrl(p)} target="_blank" rel="noopener noreferrer">소속 기관 ↗</a>}
                {key === 'members' && <button className="link" onClick={() => setDetail(p)}>프로필 보기 ↗</button>}
              </div>
            </div>
          </article>
        ))}
      </div>
      {detail && (
        <div className="modal" onClick={() => setDetail(null)}>
          <article role="dialog" aria-modal="true" aria-label={detail.name} onClick={e => e.stopPropagation()}>
            <button className="close" autoFocus onClick={() => setDetail(null)}>닫기 ×</button>
            <div className="modal-head">
              <Portrait p={detail} />
              <div>
                <p className="role">{detail.role}</p>
                <h2>{detail.name}</h2>
                {detail.research && <p>{detail.research}</p>}
                {detail.email && <p className="meta">{detail.email}</p>}
              </div>
            </div>
            {detail.sections.map((s, i) => (
              <section key={i}><h3>{s.title}</h3><ul className="dot-list">{s.items.map((it, j) => <li key={j}>{it}</li>)}</ul></section>
            ))}
            <ProfilePublications person={detail} />
          </article>
        </div>
      )}
    </section>
  );
}

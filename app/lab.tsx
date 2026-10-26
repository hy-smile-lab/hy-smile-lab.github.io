'use client';
import {withBase} from './base';
import {useEffect, useState} from 'react';
import People, {usePeople, photoSrc} from './people';
import Network from './network';
import Gallery from './gallery';
import Achievements, {achievementPages, searchablePages, useAchievements} from './achievements';
import Research from './research';
import {LogoMarquee} from './alumni-network';
import Stats from './stats';
import scene from '../public/motion-scene.json';
import {About, Equipment, Location} from './pages';
import {tiltMove, tiltReset} from './tilt';
import {visibleAlbums} from './albums';

const orgLogo = (p: string) => (globalThis as typeof globalThis & {HY_ORG_LOGOS?: Record<string, string>}).HY_ORG_LOGOS?.[p] || withBase(p);

const groups: [string, string[]][] = [
  ['ABOUT', ['연구실 소개', '교수 소개', '구성원', '졸업생', '오시는 길']],
  ['RESEARCH', ['연구 분야', '프로젝트', '특허', '기술이전', '연구 장비']],
  ['PUBLICATIONS', ['논문', '학술대회 참여', '저서', '수상실적']],
  ['LIFE', ['사진 앨범']],
];
const pages = groups.flatMap(g => g[1]);

/* 하위 페이지 상단 띠: 메인 지도 그림을 배경으로 은은하게 배치 */
function HeadDecor() {
  return <div className="head-map" aria-hidden="true" dangerouslySetInnerHTML={{__html: scene.markup}} />;
}

const normDate = (d: string) => d.replace(/-/g, '.').slice(0, 10);

function useNews() {
  const data = useAchievements();
  const awards = data.items.filter(i => i.kind === '수상실적').map(i => ({id: i.id, date: normDate(i.date), tag: '수상', title: `${i.venue} ${i.title} 수상`, page: '수상실적'}));
  const photos = (visibleAlbums as {id: string; postedDate: string; title: string}[]).map(a => ({id: a.id, date: normDate(a.postedDate), tag: '앨범', title: a.title, page: '사진 앨범'}));
  const seen = new Set<string>();
  return [...awards, ...photos].sort((a, b) => b.date.localeCompare(a.date)).filter(n => !seen.has(n.date + n.title) && !!seen.add(n.date + n.title)).slice(0, 6);
}

function Home({navigate}: {navigate: (p: string) => void}) {
  const people = usePeople();
  const news = useNews();
  const prof = people.professor[0];
  return (
    <>
      <div className="hero-band">
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow">HANYANG UNIVERSITY · ERICA</p>
            <div className="lab-id">
              <h1 className="lab-name"><strong>HY-SMILE</strong><span>스마트 모빌리티 안전 연구실</span></h1>
              <p className="lab-en"><b>H</b>anyang <b>S</b>mart &amp; Safe <b>M</b>obility <b>I</b>nnovation <b>L</b>aboratory at <b>E</b>RICA</p>
            </div>
            <p className="slogan" aria-label="Remember HY-SMILE every time you smile!">
              <span>Remember <mark>HY-SMILE</mark></span>
              <span>every time you <em>smile!</em></span>
            </p>
            <button className="btn light" onClick={() => navigate('연구 분야')}>우리의 연구 살펴보기 ↗</button>
          </div>
          <div className="hero-art"><Network /></div>
        </section>
      </div>

      <section className="section stats-section"><div className="wrap"><Stats onNavigate={navigate} /></div></section>

      <section className="section research-section">
        <div className="wrap">
          <div className="sec-head"><h2>Our Research</h2><button className="link" onClick={() => navigate('프로젝트')}>수행 중인 과제 ↗</button></div>
          <Research compact onExplore={() => navigate('연구 분야')} />
        </div>
      </section>

      <section className="section news-section">
        <div className="wrap">
          <div className="sec-head"><h2>News &amp; Highlights</h2><button className="link" onClick={() => navigate('수상실적')}>더 보기 ↗</button></div>
          <ul className="news-list">
            {news.map(n => (
              <li key={n.id}>
                <button onClick={() => navigate(n.page)}>
                  <span className={'badge ' + (n.tag === '수상' ? 'gold' : 'blue')}>{n.tag}</span>
                  <span className="news-title">{n.title}</span>
                  <time>{n.date}</time>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="join">
        <div className="wrap join-inner">
          <div className="join-copy">
            <h2>People</h2>
            <div className="faces">
              {prof && <button className="face prof" onClick={() => navigate('교수 소개')} title={prof.name + ' 교수'}><img src={photoSrc(prof.photo)} alt={prof.name + ' 교수'} /></button>}
              {people.members.filter(m => m.photo).map(m => (
                <button key={m.id} className="face" onClick={() => navigate('구성원')} title={m.name + ' · ' + m.role}><img src={photoSrc(m.photo)} alt={m.name} /></button>
              ))}
            </div>
            <div className="btn-row">
              <button className="btn light" onClick={() => navigate('구성원')}>구성원 보기 ↗</button>
            </div>
          </div>
          <div className="join-word" aria-hidden="true" onPointerMove={e => tiltMove(e, 14)} onPointerLeave={tiltReset}><span><img src={withBase('/hy-smile-logo.png')} alt="" /></span></div>
        </div>
      </section>

      <section className="section network-section">
        <div className="wrap">
          <div className="sec-head"><h2>Alumni Network</h2><button className="link" onClick={() => navigate('졸업생')}>졸업생 모두 보기 ↗</button></div>
        </div>
        <LogoMarquee />
      </section>
    </>
  );
}

export default function Lab() {
  const [page, setPage] = useState('Home');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const read = () => { const p = decodeURIComponent(location.hash.slice(1)); setPage(pages.includes(p) ? p : 'Home'); };
    read();
    addEventListener('hashchange', read);
    return () => removeEventListener('hashchange', read);
  }, []);
  function navigate(p: string) {
    (document.activeElement as HTMLElement | null)?.blur();
    setPage(p);
    setQuery('');
    history.replaceState(null, '', p === 'Home' ? location.pathname : '#' + encodeURIComponent(p));
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
  const group = groups.find(g => g[1].includes(page));
  return (
    <>
      <header className="site-head">
        <div className="wrap head-row">
          <div className="brands">
            <button className="lab-logo" onClick={() => navigate('Home')}><img src={withBase('/hy-smile-logo.png')} alt="HY-SMILE 홈" /></button>
          </div>
          <nav aria-label="주 메뉴">
            {groups.map(([g, items]) => (
              <div className={'nav-group' + (group?.[0] === g ? ' current' : '')} key={g}>
                <button onClick={() => navigate(items[0])}>{g}</button>
                <div className="dropdown">{items.map(c => <button key={c} onClick={() => navigate(c)}>{c}</button>)}</div>
              </div>
            ))}
          </nav>
        </div>
      </header>

      {page === 'Home' ? <Home navigate={navigate} /> : (
        <main>
          <div className="page-head">
            <HeadDecor />
            <div className="wrap">
              <p className="crumb">{group?.[0]}</p>
              <h1>{page}</h1>
              <div className="page-tabs">{group?.[1].map(c => <button key={c} className={c === page ? 'active' : ''} onClick={() => navigate(c)}>{c}</button>)}</div>
            </div>
          </div>
          <div className="wrap page-body">
            {searchablePages.includes(page) && <input className="search" aria-label={page + ' 검색'} placeholder="제목, 저자, 기관으로 검색" value={query} onChange={e => setQuery(e.target.value)} />}
            {page === '연구실 소개' ? <About navigate={navigate} />
              : ['교수 소개', '구성원', '졸업생'].includes(page) ? <People category={page} />
              : page === '오시는 길' ? <Location />
              : page === '연구 장비' ? <Equipment />
              : page === '사진 앨범' ? <Gallery query="" />
              : page === '연구 분야' ? <Research onNavigate={navigate} />
              : achievementPages.includes(page) ? <Achievements category={page} query={query} />
              : null}
          </div>
        </main>
      )}

      <footer>
        <div className="wrap foot-row">
          <div className="foot-brand">
            <div className="foot-logos"><img src={orgLogo('/organizations/hanyang.png')} alt="한양대학교" /><img src={withBase('/hy-smile-logo.png')} alt="HY-SMILE" /></div>
            <p>한양대학교 스마트 모빌리티 안전 연구실<br />Hanyang Smart &amp; Safe Mobility Innovation Laboratory at ERICA</p>
          </div>
          <div className="foot-info">
            <p>경기도 안산시 상록구 한양대학로 55 한양대학교 ERICA 제2공학관</p>
            <p>T. 031-400-4503</p>
            <button className="link light" onClick={() => navigate('오시는 길')}>오시는 길 ↗</button>
          </div>
        </div>
        <div className="wrap foot-bottom">
          <span>© {new Date().getFullYear()} HY-SMILE LAB. HANYANG UNIVERSITY.</span>
        </div>
      </footer>
    </>
  );
}

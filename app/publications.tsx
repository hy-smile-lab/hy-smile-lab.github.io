'use client';
import {withBase} from './base';
import {useEffect,useState} from 'react';
import seed from '../public/achievements.json';
import journalSeed from '../public/journals.json';
import type {Achievement} from './achievements';
import type {Person} from './people';
export type PaperLink={url:string;type:string;checked?:string};
export type Journal={name:string;aliases:string[];indexes:string[];indexYear?:number;indexNote?:string;impactFactor:number|null;metricYear:number|null;checked:string;sources:{label:string;url:string}[];note?:string};
export const journalKey=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'').replace('and','');
export function getJournal(venue:string){return (journalSeed.journals as Journal[]).find(j=>[j.name,...j.aliases].some(a=>journalKey(a)===journalKey(venue)))}
export function PaperAction({paper}:{paper:Achievement}){const link=paper.paperLink;const direct=link&&['doi','publisher','kci'].includes(link.type)&&/^https?:\/\//.test(link.url);const href=link&&/^https?:\/\//.test(link.url)?link.url:'https://scholar.google.com/scholar?q='+encodeURIComponent('"'+paper.title+'"');return <a className={'paper-action '+(direct?'direct':'search')} href={href} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}>{direct?'논문 바로가기 ↗':'논문 검색 ↗'}</a>}
// 학술지 색인(SCI-E 등)만 표시. IF는 표시하지 않음
export function JournalBadges({paper}:{paper:Achievement}){if(paper.kind!=='국외논문')return null;const idx=paper.fields.find(f=>f.label==='색인')?.value||getJournal(paper.venue)?.indexes.join(' · ');return idx?<span className="badge">{idx}</span>:null}
export function JournalInfo(_:{paper:Achievement}){return null}
const normalName=(s:string)=>s.toLowerCase().replace(/[\s.\-]/g,'');
export function achievementsForPerson(person:Person,items:Achievement[],kinds:string[]){
 const names=[person.name,...(person.publicationNames||[])].map(normalName).filter(Boolean);
 return items.filter(item=>{
  if(!kinds.includes(item.kind))return false;
  const contributors=[item.authors,...(item.kind==='학술대회 참여'?item.fields.filter(f=>['공저자','공동저자'].includes(f.label)).map(f=>f.value):[])];
  return contributors.some(value=>value.split(/[,;，、&]|\band\b/i).some(name=>names.includes(normalName(name.trim()))));
 }).sort((a,b)=>b.date.localeCompare(a.date));
}
export function papersForPerson(person:Person,papers:Achievement[]){return achievementsForPerson(person,papers,['국내논문','국외논문'])}
export function ProfilePublications({person}:{person:Person}){
 const [items,setItems]=useState<Achievement[]>(seed.items);
 useEffect(()=>{if(location.protocol==='file:')return;const sync=()=>fetch(withBase('/achievements.json'),{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then((value:unknown)=>{const d=value as {items?:Achievement[]};if(Array.isArray(d?.items)&&d.items.every((p:Achievement)=>typeof p.title==='string'&&typeof p.authors==='string'&&typeof p.date==='string'&&Array.isArray(p.fields)))setItems(d.items)}).catch(()=>{});sync();const t=setInterval(sync,15000);return()=>clearInterval(t)},[]);
 const groups=[{title:'참여 논문',label:'PUBLICATIONS',kinds:['국내논문','국외논문'],empty:'등록된 실적 자료에서 저자가 확인된 논문이 없습니다.'},{title:'학술대회',label:'CONFERENCES',kinds:['학술대회 참여'],empty:'등록된 실적 자료에서 발표자 또는 공저자로 확인된 학술대회 실적이 없습니다.'},{title:'특허',label:'PATENTS',kinds:['특허'],empty:'등록된 실적 자료에서 발명자로 확인된 특허가 없습니다.'}];
 return <>{groups.map(group=>{const rows=achievementsForPerson(person,items,group.kinds);const isPaper=group.label==='PUBLICATIONS';return <details className="profile-publications profile-achievement-group" key={person.id+group.label}><summary className="profile-group-heading"><span><span className="eyebrow">{group.label}</span><span className="profile-group-title">{group.title} <span className="profile-group-count">{rows.length ? rows.length + "건" : "-"}</span></span></span><span className="profile-group-chevron" aria-hidden="true">⌄</span></summary><div className="profile-group-body">{rows.length?<ol>{rows.map(p=><li key={p.id}><small>{p.date||p.year} · {p.kind}</small><h4>{p.title}</h4>{p.venue&&<p className="achievement-venue">{p.venue}</p>}{isPaper?<><JournalBadges paper={p}/><PaperAction paper={p}/><details><summary>인용</summary><p>{p.fields.find(f=>f.label==='APA 서지정보')?.value||'서지정보 미기재'}</p><JournalInfo paper={p}/></details></>:<details><summary>{group.title} 상세정보</summary><dl className="profile-achievement-fields">{p.fields.filter(f=>!/발표자|저자|발명자|참여자|참여인력|연구원|책임자|성명|이름/.test(f.label)).map((f,i)=><div key={i}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl></details>}</li>)}</ol>:<p className="profile-empty">{group.empty}</p>}</div></details>})}</>;
}

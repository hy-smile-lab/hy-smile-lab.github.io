'use client';
import {withBase} from './base';
import research from '../public/research.json';
import {AreaScene} from './research-scenes';
import Stats from './stats';
import {usePeople, photoSrc} from './people';

const asset = (p: string) => (globalThis as typeof globalThis & {HY_ASSETS?: Record<string, string>}).HY_ASSETS?.[p] || withBase(p);

/* 연구실 소개 */
export function About({navigate}: {navigate: (p: string) => void}) {
  const people = usePeople();
  const prof = people.professor[0];
  return (
    <div className="about">
      <section className="about-lead">
        <div>
          <p className="eyebrow">ABOUT HY-SMILE</p>
          <h2>사람을 위한 모빌리티,<br />안전을 향한 혁신</h2>
        </div>
        <div className="about-text">
          <p>한양대학교 ERICA 스마트 모빌리티 안전 연구실(HY-SMILE)은 교통사고 없는 사람 중심의 미래 교통·물류시스템을 연구합니다.</p>
          <p>{research.intro}</p>
          <p>실시간 교통안전정보시스템, 자율주행 기반 교통운영관리, 통계 및 머신러닝 기반 교통사고 분석, 주행·교통 시뮬레이션 기술을 다룹니다.</p>
        </div>
      </section>

      <section className="about-axis" aria-label="연구의 세 축">
        {[['사람', '탑승자·운전자·보행자의 반응과 안전'], ['차량', '자율주행차의 주행 행태와 운전 능력'], ['도로 인프라', '자율협력주행을 지원하는 도로와 서비스']].map(([t, d], i) => (
          <div key={t} className="axis-item"><span className="axis-no">{i + 1}</span><h3>{t}</h3><p>{d}</p></div>
        ))}
      </section>

      <section>
        <h2 className="block-title">연구 실적</h2>
        <Stats compact />
      </section>

      <section>
        <h2 className="block-title">연구 분야</h2>
        <div className="about-topics">
          {research.areas.map(t => (
            <button key={t.id} className={'about-topic tone-' + t.tone} onClick={() => navigate('연구 분야')}>
              <AreaScene id={t.id} />
              <span className="eyebrow">{t.english}</span>
              <h3>{t.title}</h3>
            </button>
          ))}
        </div>
      </section>

      {prof && (
        <section className="about-people">
          <div className="about-prof">
            <img src={photoSrc(prof.photo)} alt={prof.name + ' 교수 사진'} />
            <div>
              <p className="eyebrow">PROFESSOR</p>
              <h3>{prof.name} 교수</h3>
              <p>{prof.affiliation}</p>
              <button className="link" onClick={() => navigate('교수 소개')}>교수 소개 ↗</button>
            </div>
          </div>
          <div className="about-count">
            <span className="stat-value">{people.members.length}<small>명</small></span><span className="stat-label">재학 구성원</span>
            <button className="link" onClick={() => navigate('구성원')}>구성원 ↗</button>
          </div>
          <div className="about-count">
            <span className="stat-value">{people.alumni.length}<small>명</small></span><span className="stat-label">졸업생</span>
            <button className="link" onClick={() => navigate('졸업생')}>졸업생 ↗</button>
          </div>
        </section>
      )}
    </div>
  );
}

/* 오시는 길: 실제 사이트에서는 Google 지도가 표시됨 */
export function Location() {
  const q = encodeURIComponent('경기도 안산시 상록구 한양대학로 55 한양대학교 ERICA 제2공학관');
  return (
    <div className="location">
      <div className="map-frame">
        <iframe title="한양대학교 ERICA 지도" src={`https://maps.google.com/maps?q=${q}&z=16&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <a className="map-fallback" href={`https://maps.google.com/?q=${q}`} target="_blank" rel="noreferrer">지도가 보이지 않으면 Google 지도에서 열기 ↗</a>
      </div>
      <div className="location-info">
        <div><p className="label">주소</p><p>경기도 안산시 상록구 한양대학로 55<br />한양대학교 ERICA 제2공학관</p></div>
        <div><p className="label">전화</p><p>031-400-4503</p></div>
        <div><p className="label">소속</p><p>한양대학교 ERICA 교통물류공학과<br />스마트 모빌리티 안전 연구실 (HY-SMILE)</p></div>
      </div>
    </div>
  );
}

/* 연구 장비 (사진: 기존 연구실 홈페이지 장비 게시판) */
const EQUIPMENT = [
  {img: '/equipment/mads.webp', name: 'Multi-Agent Driving Simulator', en: 'MADS', desc: '여러 운전자가 같은 가상 도로에서 동시에 주행하며, 운전 조작과 차량 운동 정보를 수집하는 다중 주행 시뮬레이터'},
  {pos: 'center 35%', img: '/equipment/vr.webp', name: 'VR 헤드셋·컨트롤러', en: 'VR', desc: '가상환경과 상호작용하며 인적 요인 정보를 수집하는 사용자 인터페이스 장치'},
  {pos: 'center 18%', img: '/equipment/eeg.webp', name: '뇌파 수집 장비', en: 'EEG', desc: '주행 중 운전자의 뇌파를 측정하고 수집하는 장치'},
  {pos: 'center 30%', img: '/equipment/eyeglass.webp', name: '아이트래커', en: 'Eye Tracker', desc: '시선 데이터를 실시간으로 추적·수집하는 안경형 장치'},
  {img: '/equipment/kinect.webp', name: 'Kinect', en: 'Motion Sensor', desc: '별도 컨트롤러 없이 사람의 신체와 음성을 감지하는 3차원 동작인식 카메라'},
  {img: '/equipment/drone.webp', name: '드론', en: 'Drone', desc: '교통정보 자료 수집에 활용하는 무인 항공기'},
];
const SENSORS = [
  {img: '/equipment/biopac.webp', name: 'Biopac MP100 System', desc: '생체신호 측정 시스템'},
  {img: '/equipment/imu.webp', name: 'myIMU-DX', desc: '관성측정장치(IMU)'},
  {img: '/equipment/dgps.webp', name: 'DGPS 수집장치', desc: '차량 위치 정밀 측정'},
  {img: '/equipment/gps850.webp', name: 'GPS850', desc: '자전거 주행 경로 수집'},
  {img: '/equipment/nc200.webp', name: 'NC-200', desc: '노면 설치형 교통량·속도 측정기'},
  {img: '/equipment/pvms.webp', name: 'PVMS', desc: '이동형 도로전광표지'},
  {img: '/equipment/mesh.webp', name: 'MESH 장비', desc: ''},
  {img: '/equipment/mr5010a.webp', name: 'MR-5010A', desc: ''},
];
export function Equipment() {
  return (
    <div className="equipment">
      <div className="equip-grid">
        {EQUIPMENT.map(e => (
          <article key={e.name} className={'equip-card' + ((e as {wide?: boolean}).wide ? ' wide' : '')}>
            <div className="equip-photo"><img src={asset(e.img)} alt={e.name} loading="lazy" style={{objectPosition: (e as {pos?: string}).pos}} /></div>
            <div className="equip-body"><p className="eyebrow">{e.en}</p><h3>{e.name}</h3><p>{e.desc}</p></div>
          </article>
        ))}
      </div>
      <h2 className="block-title">측정 장비</h2>
      <div className="sensor-grid">
        {SENSORS.map(e => (
          <article key={e.name} className="sensor-card">
            <div className="sensor-photo"><img src={asset(e.img)} alt={e.name} loading="lazy" /></div>
            <h3>{e.name}</h3>
            {e.desc && <p className="meta">{e.desc}</p>}
          </article>
        ))}
      </div>
      <p className="note">이 밖에 LiDAR, m-HTS, 휘도계 등을 보유하고 있습니다.</p>
      <section className="collect">
        <h2 className="block-title">수집 데이터</h2>
        <div className="chips large">
          {['운전자 주행행태', '선행 차량 주행행태', '영상 기반 주행행태', '운전자 시각 행태', '자전거·PV 주행행태'].map(t => <span key={t}>{t}</span>)}
        </div>
      </section>
    </div>
  );
}

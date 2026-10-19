'use client';
import React, {useEffect, useRef} from 'react';

/* 연구 분야 4종 일러스트 애니메이션 — 메인 지도와 같은 화풍(입체 건물·그림자·가로수·차선), 한양 팔레트만 사용 */
const B = '#00457E', BD = '#002a4d', G = '#A6CE39', GD = '#7d9d26', O = '#F7931E', S = '#939396', GO = '#AB863F', GR = '#3F3D42';

function Defs({id}: {id: string}) {
  return (
    <defs>
      <linearGradient id={id + 'bg'} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6faec" /><stop offset="1" stopColor="#e3eecb" /></linearGradient>
      <linearGradient id={id + 'road'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f6f8" /><stop offset="1" stopColor="#e3e8ec" /></linearGradient>
      <linearGradient id={id + 'top'} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eef3f8" /><stop offset="1" stopColor="#cddbe8" /></linearGradient>
      <linearGradient id={id + 'car'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dfe7ee" /></linearGradient>
      <linearGradient id={id + 'av'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c5e06e" /><stop offset="1" stopColor={GD} /></linearGradient>
      <linearGradient id={id + 'scr'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cfe0ef" /><stop offset=".55" stopColor="#e9f1f7" /><stop offset=".56" stopColor="#c9dd98" /><stop offset="1" stopColor="#a9c46a" /></linearGradient>
      <radialGradient id={id + 'glow'}><stop offset="0" stopColor={G} stopOpacity=".55" /><stop offset="1" stopColor={G} stopOpacity="0" /></radialGradient>
      <pattern id={id + 'grid'} width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke={G} strokeOpacity=".22" /></pattern>
      <filter id={id + 'sh'} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="6" floodColor={B} floodOpacity=".18" /></filter>
    </defs>
  );
}
function Land({id}: {id: string}) {
  return <><rect width="640" height="360" fill={`url(#${id}bg)`} /><rect width="640" height="360" fill={`url(#${id}grid)`} /></>;
}
/* 입체 건물: 옆면 + 윗면 + 창문 */
function Building({id, x, y, w, d, h, rows = 2}: {id: string; x: number; y: number; w: number; d: number; h: number; rows?: number}) {
  const cols = Math.max(2, Math.floor(w / 18));
  return (
    <g>
      <ellipse cx={x + w / 2 + 14} cy={y + d + h + 6} rx={w * 0.62} ry="10" fill={B} opacity=".12" />
      <path d={`M${x} ${y + d} h${w} v${h} h${-w}Z`} fill="#a9bfd5" />
      <path d={`M${x + w} ${y + d} l${0} ${h}`} stroke="#8fa8c2" strokeWidth="2" />
      {Array.from({length: rows}).map((_, r) => Array.from({length: cols}).map((__, c) => (
        <rect key={r + '-' + c} x={x + 6 + c * ((w - 12) / cols)} y={y + d + 8 + r * 14} width={(w - 12) / cols - 5} height="7" rx="1.5" fill="#eaf1f8" opacity=".9" />
      )))}
      <rect x={x} y={y} width={w} height={d} rx="5" fill={`url(#${id}top)`} stroke="#fff" strokeWidth="2" />
      <rect x={x + w * 0.62} y={y + d * 0.25} width={w * 0.24} height={d * 0.4} rx="2" fill="#bfd0e1" />
    </g>
  );
}
function Tree({x, y, s = 1}: {x: number; y: number; s?: number}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="6" cy="14" rx="15" ry="5" fill={GD} opacity=".25" />
      <rect x="-2" y="2" width="4" height="12" rx="2" fill={GO} />
      <circle cx="0" cy="-4" r="13" fill={GD} />
      <circle cx="-3" cy="-7" r="10" fill={G} />
      <circle cx="-6" cy="-10" r="4" fill="#fff" opacity=".35" />
    </g>
  );
}
/* 위에서 본 승용차 (길이 방향 = x축) */
function Car({id, av = false, color}: {id: string; av?: boolean; color?: string}) {
  return (
    <g>
      <ellipse cx="3" cy="9" rx="30" ry="9" fill={BD} opacity=".18" />
      <rect x="-24" y="-16" width="8" height="5" rx="2" fill={GR} /><rect x="14" y="-16" width="8" height="5" rx="2" fill={GR} />
      <rect x="-24" y="11" width="8" height="5" rx="2" fill={GR} /><rect x="14" y="11" width="8" height="5" rx="2" fill={GR} />
      <rect x="-28" y="-13" width="56" height="26" rx="11" fill={color || (av ? `url(#${id}av)` : `url(#${id}car)`)} stroke={av ? GD : B} strokeWidth="2" />
      <path d="M2 -10 H12 Q18 0 12 10 H2 Q6 0 2 -10Z" fill={BD} opacity=".75" />
      <path d="M-14 -9 H-6 Q-9 0 -6 9 H-14 Q-17 0 -14 -9Z" fill={BD} opacity=".55" />
      <rect x="-5" y="-9" width="8" height="18" rx="2" fill="#fff" opacity=".35" />
      <circle cx="26" cy="-8" r="2.4" fill="#fff6d8" /><circle cx="26" cy="8" r="2.4" fill="#fff6d8" />
      <rect x="-29" y="-10" width="2.4" height="5" rx="1" fill={O} /><rect x="-29" y="5" width="2.4" height="5" rx="1" fill={O} />
      {av && <g><circle cx="-2" cy="0" r="5" fill={B} /><circle cx="-2" cy="0" r="2" fill={G} /></g>}
    </g>
  );
}
function Person({x, y, c = B}: {x: number; y: number; c?: string}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="2" cy="1" rx="8" ry="3" fill={BD} opacity=".18" />
      <path d="M-5 0 L-3 -16 H3 L5 0" fill={c} />
      <rect x="-6" y="-28" width="12" height="14" rx="5" fill={c} />
      <circle cy="-33" r="5.5" fill="#f3d9c4" stroke={c} strokeWidth="1.5" />
    </g>
  );
}

/* 1. 자율주행 공유차 서비스 최적화 */
function SharedMobility() {
  const id = 'sm';
  const route = 'M80 278 C80 180 160 112 300 112 S528 120 548 204 S470 300 330 284 S140 306 80 278Z';
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="공유 자율주행차가 정류장을 순환하며 자율주행 스트레스를 측정하는 그림">
      <Defs id={id} />
      <Land id={id} />
      <path d={route} fill="none" stroke={B} strokeOpacity=".1" strokeWidth="50" transform="translate(0 6)" />
      <path d={route} fill="none" stroke="#fff" strokeWidth="44" strokeLinejoin="round" />
      <path d={route} fill="none" stroke={`url(#${id}road)`} strokeWidth="40" strokeLinejoin="round" />
      <path d={route} fill="none" stroke="#fff" strokeWidth="2.4" strokeDasharray="14 12" />
      <Building id={id} x={196} y={150} w={92} d={34} h={38} />
      <Building id={id} x={318} y={160} w={78} d={30} h={30} />
      <Tree x={170} y={210} /><Tree x={420} y={212} s={.9} /><Tree x={452} y={182} s={.8} /><Tree x={150} y={58} s={.8} /><Tree x={600} y={300} />
      {/* 정류장 */}
      {[[80, 278, '정류장 A'], [300, 112, '정류장 B'], [548, 204, '정류장 C']].map(([x, y, t], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="22" fill={`url(#${id}glow)`} />
          <path d="M0 -10 V-38" stroke={S} strokeWidth="3" />
          <rect x="-16" y="-54" width="32" height="18" rx="6" fill={i === 1 ? O : B} />
          <text y="-41" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">{String(t).slice(-1)}</text>
          <circle r="7" fill="#fff" stroke={B} strokeWidth="3" />
        </g>
      ))}
      <Person x={108} y={250} c={GO} /><Person x={322} y={92} />
      <g><animateMotion dur="11s" repeatCount="indefinite" rotate="auto" path={route} /><Car id={id} av /></g>
      <g><animateMotion dur="11s" begin="-5.5s" repeatCount="indefinite" rotate="auto" path={route} /><Car id={id} /></g>
      {/* 자율주행 스트레스 패널 */}
      <g transform="translate(436 22)" filter={`url(#${id}sh)`}>
        <rect width="184" height="92" rx="16" fill="#fff" />
        <text x="16" y="24" fontSize="11" fontWeight="700" fill={B}>자율주행 스트레스</text>
        <path d="M16 56 H40 L48 40 L58 70 L66 46 L74 56 H168" fill="none" stroke={O} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="170" strokeDashoffset="170">
          <animate attributeName="stroke-dashoffset" values="170;0;0;170" keyTimes="0;.45;.85;1" dur="3.4s" repeatCount="indefinite" />
        </path>
        <rect x="16" y="74" width="152" height="8" rx="4" fill="#eef2f6" />
        <rect x="16" y="74" width="60" height="8" rx="4" fill={G}>
          <animate attributeName="width" values="40;120;70;40" dur="5s" repeatCount="indefinite" />
          <animate attributeName="fill" values={`${G};${O};${G};${G}`} dur="5s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
}

/* 2. 차세대 도로 인프라 설계 */
function RoadInfra() {
  const id = 'ri';
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="도로변 센서가 도로 구간을 감지하고 자율주행 취약구간을 표시하는 그림">
      <Defs id={id} />
      <Land id={id} />
      <Building id={id} x={36} y={26} w={120} d={36} h={40} rows={2} />
      <Building id={id} x={470} y={14} w={130} d={38} h={44} rows={2} />
      <Tree x={200} y={78} /><Tree x={238} y={70} s={.85} /><Tree x={420} y={64} s={.9} /><Tree x={60} y={320} /><Tree x={560} y={334} s={1.1} />
      {/* 4차로 도로 */}
      <g transform="rotate(-8 320 230)">
        <rect x="-60" y="166" width="760" height="132" fill={B} opacity=".1" transform="translate(0 8)" />
        <rect x="-60" y="160" width="760" height="132" fill={`url(#${id}road)`} />
        <rect x="-60" y="156" width="760" height="6" fill="#fff" /><rect x="-60" y="290" width="760" height="6" fill="#fff" />
        <path d="M-60 192 H700 M-60 260 H700" stroke="#fff" strokeWidth="2.4" strokeDasharray="18 16" />
        <path d="M-60 224 H700 M-60 228 H700" stroke={GO} strokeWidth="2" />
        {/* 취약구간 */}
        <rect x="300" y="162" width="120" height="128" fill={O} opacity=".14"><animate attributeName="opacity" values=".06;.26;.06" dur="2.6s" repeatCount="indefinite" /></rect>
        <path d="M300 162 V290 M420 162 V290" stroke={O} strokeWidth="2" strokeDasharray="6 6" />
        <g><animateMotion dur="7.5s" repeatCount="indefinite" path="M-80 244 H720" /><Car id={id} av /></g>
        <g><animateMotion dur="9s" begin="-3s" repeatCount="indefinite" path="M-80 276 H720" /><Car id={id} /></g>
        <g><animateMotion dur="8s" begin="-2s" repeatCount="indefinite" rotate="auto" path="M720 208 H-80" /><Car id={id} /></g><g><animateMotion dur="10s" begin="-6s" repeatCount="indefinite" rotate="auto" path="M720 176 H-80" /><Car id={id} color="#fff" /></g>
      </g>
      <g transform="translate(360 196)">
        <path d="M0-24L22 12H-22Z" fill={O} stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0-12V0" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" /><circle cy="5" r="2" fill="#fff" />
      </g>
      {/* RSU 센서 + 감지 범위 */}
      {[[150, 164, 0], [508, 116, 1.4]].map(([x, y, b]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <path d="M0 -40 L-80 120 L84 96Z" fill={G} opacity=".18"><animate attributeName="opacity" values=".08;.3;.08" dur="3s" begin={`${b}s`} repeatCount="indefinite" /></path>
          <ellipse cx="4" cy="4" rx="10" ry="4" fill={BD} opacity=".2" />
          <path d="M0 2 V-56" stroke={S} strokeWidth="5" strokeLinecap="round" />
          <path d="M0 -50 H22" stroke={S} strokeWidth="4" strokeLinecap="round" />
          <rect x="14" y="-62" width="20" height="16" rx="4" fill={B} /><circle cx="24" cy="-54" r="3" fill={G} />
          <g fill="none" stroke={GD} strokeWidth="2.6" strokeLinecap="round"><path d="M38 -64a12 12 0 0 1 8 10" /><path d="M42 -76a24 24 0 0 1 16 22" /></g>
        </g>
      ))}
      <g transform="translate(24 300)" filter={`url(#${id}sh)`}>
        <rect width="150" height="40" rx="12" fill="#fff" />
        <circle cx="20" cy="20" r="7" fill={O} /><text x="34" y="24" fontSize="11" fontWeight="700" fill={B}>자율주행 취약구간</text>
      </g>
    </svg>
  );
}

/* 3. 자율주행차 운전 능력 평가 */
function DrivingPerformance() {
  const id = 'dp';
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="주행 시뮬레이터에서 탑승자의 뇌파와 시선을 측정해 운전 능력을 평가하는 그림">
      <Defs id={id} />
      <rect width="640" height="360" fill="#eef3f7" />
      <rect y="250" width="640" height="110" fill="#dfe7ee" />
      <path d="M0 250 H640" stroke="#fff" strokeWidth="3" />
      {/* 3면 시뮬레이터 스크린 */}
      {[[-1, 64, 52], [0, 196, 36], [1, 328, 52]].map(([k, x, y]) => (
        <g key={k} transform={`translate(${x} ${y}) skewY(${k * 7})`} filter={`url(#${id}sh)`}>
          <rect width="124" height="88" rx="8" fill={BD} />
          <rect x="6" y="6" width="112" height="76" rx="4" fill={`url(#${id}scr)`} />
          <path d={`M62 48 L${k === 0 ? 40 : k < 0 ? 20 : 60} 82 M62 48 L${k === 0 ? 84 : k < 0 ? 64 : 104} 82`} stroke="#fff" strokeWidth="3" />
          <path d="M62 52 V82" stroke="#fff" strokeWidth="2" strokeDasharray="5 5" />
          {k === 0 && <g><animateTransform attributeName="transform" type="translate" values="40 0;-40 0;40 0" dur="6s" repeatCount="indefinite" /><rect x="54" y="56" width="16" height="10" rx="3" fill={B} /></g>}
          {k !== 0 && <><Tree x={k < 0 ? 26 : 96} y={44} s={.6} /><rect x={k < 0 ? 70 : 20} y="26" width="22" height="22" fill="#a9bfd5" /></>}
          <rect x="54" y="88" width="16" height="16" fill={S} />
        </g>
      ))}
      {/* 운전석 */}
      <g transform="translate(262 262)">
        <ellipse cx="0" cy="70" rx="120" ry="18" fill={BD} opacity=".15" />
        <path d="M-52 70 V0 Q-52 -24 -28 -24 H28 Q52 -24 52 0 V70Z" fill={GR} />
        <path d="M-40 70 V6 Q-40 -12 -22 -12 H22 Q40 -12 40 6 V70Z" fill="#5a585e" />
        <circle cy="-62" r="24" fill="#f3d9c4" />
        <path d="M-26 -66 Q-24 -94 0 -94 Q26 -94 26 -66 Q12 -80 -26 -66Z" fill={GR} />
        {/* EEG 캡 */}
        <path d="M-27 -66 Q-26 -98 0 -98 Q27 -98 27 -66" fill="none" stroke={GD} strokeWidth="4" />
        {[-20, -8, 4, 16].map(x => <circle key={x} cx={x + 2} cy={-90 + Math.abs(x) * 0.6} r="3.4" fill={G} stroke={GD} />)}
        {/* 아이트래커 */}
        <rect x="-18" y="-66" width="14" height="9" rx="3" fill="none" stroke={BD} strokeWidth="2.4" />
        <rect x="4" y="-66" width="14" height="9" rx="3" fill="none" stroke={BD} strokeWidth="2.4" />
        <path d="M-4 -62 H4" stroke={BD} strokeWidth="2" />
        <path d="M-60 -6 Q0 -40 60 -6" fill="none" stroke={BD} strokeWidth="4" />
        <circle cx="0" cy="-14" r="26" fill="none" stroke={BD} strokeWidth="6" />
        <path d="M-26 -14 H26 M0 -14 V12" stroke={BD} strokeWidth="4" />
      </g>
      {/* 시선 */}
      <path d="M262 196 L150 110" stroke={O} strokeWidth="2.4" strokeDasharray="5 6">
        <animate attributeName="d" values="M262 196 L150 110;M262 196 L258 90;M262 196 L390 110;M262 196 L150 110" dur="6s" repeatCount="indefinite" />
      </path>
      <circle r="9" fill="none" stroke={O} strokeWidth="2.6">
        <animate attributeName="cx" values="150;258;390;150" dur="6s" repeatCount="indefinite" />
        <animate attributeName="cy" values="110;90;110;110" dur="6s" repeatCount="indefinite" />
      </circle>
      {/* 측정 패널 */}
      <g transform="translate(470 30)" filter={`url(#${id}sh)`}>
        <rect width="150" height="196" rx="16" fill="#fff" />
        <text x="16" y="26" fontSize="11" fontWeight="700" fill={B}>EEG</text>
        <path d="M16 50 h16 l6 -12 l8 24 l6 -18 l6 10 l8 -6 h74" fill="none" stroke={B} strokeWidth="2.4" strokeLinejoin="round" strokeDasharray="150" strokeDashoffset="150">
          <animate attributeName="stroke-dashoffset" values="150;0;0" keyTimes="0;.6;1" dur="2.6s" repeatCount="indefinite" />
        </path>
        <text x="16" y="88" fontSize="11" fontWeight="700" fill={B}>운전 능력 지표</text>
        {[[102, G, '반응'], [128, B, '주시'], [154, GO, '부하']].map(([y, c, t], i) => (
          <g key={i}>
            <text x="16" y={(y as number) + 9} fontSize="9" fill={S}>{t}</text>
            <rect x="44" y={y as number} width="92" height="10" rx="5" fill="#eef2f6" />
            <rect x="44" y={y as number} width="40" height="10" rx="5" fill={c as string}>
              <animate attributeName="width" values={`${30 + i * 14};${86 - i * 10};${50 + i * 8};${30 + i * 14}`} dur={`${4 + i}s`} repeatCount="indefinite" />
            </rect>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* 4. 자율협력주행 서비스 발굴 */
function Cooperative() {
  const id = 'cp';
  const links: [number, number, number, number, string][] = [
    [320, 82, 150, 246, B], [320, 82, 486, 236, B], [150, 246, 486, 236, GD], [96, 132, 150, 246, GD], [552, 118, 486, 236, GD], [320, 82, 318, 250, B],
  ];
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="차량과 도로 인프라, 통합센터가 정보를 주고받는 협력주행 그림">
      <Defs id={id} />
      <Land id={id} />
      <Tree x={40} y={60} /><Tree x={600} y={56} s={.9} /><Tree x={210} y={70} s={.8} /><Tree x={430} y={64} s={.85} />
      {/* 고가 도로 */}
      <path d="M-20 262 Q320 196 660 254" stroke={B} strokeOpacity=".12" strokeWidth="118" fill="none" transform="translate(0 12)" />
      <path d="M-20 262 Q320 196 660 254" stroke="#fff" strokeWidth="112" fill="none" />
      <path d="M-20 262 Q320 196 660 254" stroke={`url(#${id}road)`} strokeWidth="104" fill="none" />
      <path d="M-20 232 Q320 166 660 224 M-20 292 Q320 226 660 284" stroke="#fff" strokeWidth="2.4" strokeDasharray="18 16" fill="none" />
      <path d="M-20 262 Q320 196 660 254" stroke={GO} strokeWidth="2" fill="none" />
      {/* 통합센터 */}
      <g transform="translate(266 26)">
        <Building id={id} x={0} y={18} w={108} d={30} h={34} />
        <path d="M30 18 V4 H78 V18" fill="#eef3f8" stroke={B} strokeWidth="2.4" />
        <circle cx="54" cy="-8" r="13" fill="#fff" stroke={B} strokeWidth="2.6" />
        <path d="M54 -8 L54 -16 M54 -8 L60 -4" stroke={B} strokeWidth="2" />
      </g>
      {/* RSU */}
      {[[96, 132], [552, 118]].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <ellipse cx="4" cy="74" rx="10" ry="4" fill={BD} opacity=".2" />
          <path d="M0 0 V72" stroke={S} strokeWidth="5" strokeLinecap="round" />
          <rect x="-14" y="-14" width="28" height="22" rx="5" fill={B} /><circle cy="-3" r="3" fill={G} />
          <circle r="34" fill="none" stroke={G} strokeWidth="2.4">
            <animate attributeName="r" values="14;50" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values=".9;0" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      {links.map(([x1, y1, x2, y2, c], i) => (
        <g key={i}>
          <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={c} strokeWidth="2" strokeDasharray="6 7" opacity=".5" />
          <circle r="5" fill={i % 2 ? O : c} stroke="#fff" strokeWidth="1.5">
            <animateMotion dur={`${2.2 + i * 0.3}s`} repeatCount="indefinite" path={`M${x1} ${y1} L${x2} ${y2}`} />
          </circle>
        </g>
      ))}
      <g transform="translate(150 246) rotate(-11)"><Car id={id} av /></g>
      <g transform="translate(486 236) rotate(5)"><Car id={id} /></g>
      <g transform="translate(318 250) rotate(-2)"><g><animateTransform attributeName="transform" type="translate" values="-34 4;40 -3;-34 4" dur="8s" repeatCount="indefinite" /><Car id={id} av /></g></g>
      <g transform="translate(470 300)" filter={`url(#${id}sh)`}>
        <rect width="150" height="40" rx="12" fill="#fff" />
        <circle cx="20" cy="20" r="6" fill={O} /><text x="34" y="24" fontSize="11" fontWeight="700" fill={B}>V2X 안전정보 공유</text>
      </g>
    </svg>
  );
}


/* ===== 연구 분야 4종 (교통안전 · C-ITS · 교통운영 · 자율주행) ===== */
function Truck({len = 96}: {len?: number; av?: boolean}) {
  return (
    <g>
      <ellipse cx={len / 2 - 26} cy="12" rx={len / 2 + 4} ry="9" fill={BD} opacity=".18" />
      {[-18, 14, 40].map(x => <g key={x}><rect x={x} y="-17" width="12" height="4" rx="2" fill={GR} /><rect x={x} y="13" width="12" height="4" rx="2" fill={GR} /></g>)}
      <rect x={len - 40} y="-17" width="10" height="4" rx="2" fill={GR} /><rect x={len - 40} y="13" width="10" height="4" rx="2" fill={GR} />
      <rect x="-30" y="-15" width={len - 30} height="30" rx="3" fill="#fff" stroke="#b9c7d4" strokeWidth="1.5" />
      <rect x="-30" y="-3" width={len - 30} height="6" fill={B} opacity=".85" />
      <rect x={len - 58} y="-13" width="26" height="26" rx="6" fill={G} stroke={GD} strokeWidth="2" />
      <path d={`M${len - 40} -10 Q${len - 34} 0 ${len - 40} 10`} fill="none" stroke={BD} strokeWidth="4" opacity=".75" />
      <circle cx={len - 47} cy="0" r="4" fill={B} />
      <circle cx={len - 33} cy="-8" r="2" fill="#fff6d8" /><circle cx={len - 33} cy="8" r="2" fill="#fff6d8" />
    </g>
  );
}
function Cone({x, y}: {x: number; y: number}) {
  return <g transform={`translate(${x} ${y})`}><ellipse cx="2" cy="2" rx="8" ry="3" fill={BD} opacity=".2" /><path d="M-6 2 L0 -18 L6 2Z" fill={O} /><path d="M-4 -5 H4" stroke="#fff" strokeWidth="2.4" /><rect x="-8" y="0" width="16" height="4" rx="1.5" fill={O} /></g>;
}
function Panel({id, x, y, w, h, title, children}: {id: string; x: number; y: number; w: number; h: number; title: string; children?: React.ReactNode}) {
  return (
    <g transform={`translate(${x} ${y})`} filter={`url(#${id}sh)`}>
      <rect width={w} height={h} rx="14" fill="#fff" />
      <text x="14" y="22" fontSize="11" fontWeight="700" fill={B}>{title}</text>
      {children}
    </g>
  );
}
/* 직선 4차로 도로 (y: 도로 윗선) */
function Highway({id, y, h = 128}: {id: string; y: number; h?: number}) {
  return (
    <g>
      <rect x="-20" y={y + 8} width="680" height={h} fill={B} opacity=".1" />
      <rect x="-20" y={y} width="680" height={h} fill={`url(#${id}road)`} />
      <rect x="-20" y={y - 4} width="680" height="5" fill="#fff" /><rect x="-20" y={y + h - 1} width="680" height="5" fill="#fff" />
      <path d={`M-20 ${y + h / 4} H660 M-20 ${y + h * 3 / 4} H660`} stroke="#fff" strokeWidth="2.4" strokeDasharray="18 16" />
      <path d={`M-20 ${y + h / 2 - 2} H660 M-20 ${y + h / 2 + 2} H660`} stroke={GO} strokeWidth="1.8" />
    </g>
  );
}

/* 이동 헬퍼: keyPoints/keyTimes로 정지·출발을 표현 (오른쪽 통행: 위 2차로 ←, 아래 2차로 →) */
function Move({path, dur, begin = 0, kp, kt, rotate = 'auto', children}: {path: string; dur: number; begin?: number; kp?: string; kt?: string; rotate?: string; children: React.ReactNode}) {
  return <g><animateMotion dur={dur + 's'} begin={begin + 's'} repeatCount="indefinite" rotate={rotate} path={path} {...(kp ? {keyPoints: kp, keyTimes: kt, calcMode: 'linear'} : {})} />{children}</g>;
}
const E = (y: number) => `M-80 ${y} H720`;
const W = (y: number) => `M720 ${y} H-80`;

/* A. 교통안전: 보행자 횡단 시 정지 · 위험운전(사행) 검지 · TTC 분석 */
function TrafficSafety() {
  const id = 'ts', T = 10;
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="보행자 횡단 시 차량이 정지하고, 사행 운전 차량을 위험운전으로 검지하는 교통안전 그림">
      <Defs id={id} />
      <Land id={id} />
      <Building id={id} x={30} y={20} w={110} d={34} h={36} />
      <Tree x={180} y={70} /><Tree x={214} y={60} s={.8} /><Tree x={600} y={330} /><Tree x={250} y={330} s={.85} />
      <Highway id={id} y={150} h={128} />
      {Array.from({length: 7}).map((_, i) => <rect key={i} x="500" y={156 + i * 17} width="44" height="9" rx="2" fill="#fff" />)}
      <path d="M484 216 V278 M560 150 V212" stroke="#fff" strokeWidth="4" />
      {/* 보행자: 횡단 후 사라짐 */}
      <g opacity="0">
        <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.08;.44;.5;1" dur={T + 's'} repeatCount="indefinite" />
        <Move path="M522 152 V292" dur={T} kp="0;0;1;1" kt="0;.08;.46;1" rotate="0"><Person x={0} y={0} c={O} /></Move>
      </g>
      {/* 동측(→) 차량: 정지선에서 대기 후 출발 */}
      <Move path={E(262)} dur={T} kp="0;.655;.655;1;1" kt="0;.2;.52;.82;1"><Car id={id} /></Move>
      <Move path={E(262)} dur={T} kp="0;.56;.56;1;1" kt="0;.3;.56;.9;1"><Car id={id} color="#ffe2bd" /></Move>
      <Move path={E(230)} dur={T} kp="0;.655;.655;1;1" kt="0;.26;.52;.86;1"><Car id={id} av /></Move>
      {/* 서측(←) 차량 */}
      <Move path={W(198)} dur={T} kp="0;.16;.16;1;1" kt="0;.15;.52;.9;1"><Car id={id} /></Move>
      {/* 사행(위험)운전 차량 + 검지 표시 */}
      <Move path="M720 168 C650 162 610 184 540 182 S420 160 340 168 S200 186 120 176 S0 164 -80 170" dur={T} kp="0;0;1;1" kt="0;.5;.98;1">
        <g>
          <Car id={id} color="#ffd2c2" />
          <rect x="-36" y="-20" width="72" height="40" rx="8" fill="none" stroke={O} strokeWidth="2.2" strokeDasharray="5 4" />
        </g>
      </Move>
      <Panel id={id} x={430} y={20} w={190} h={110} title="TTC · 위험도 분석">
        <path d="M14 92 H176 M14 92 V36" stroke="#dde5ec" strokeWidth="2" />
        <path d="M18 88 C50 86 70 60 96 52 S150 40 176 38" fill="none" stroke={B} strokeWidth="2.4" />
        <path d="M14 70 H176" stroke={O} strokeWidth="1.6" strokeDasharray="5 5" />
        <circle r="5" fill={O}><animateMotion dur="4s" repeatCount="indefinite" path="M18 88 C50 86 70 60 96 52 S150 40 176 38" /></circle>
      </Panel>
      <g transform="translate(24 300)" filter={`url(#${id}sh)`}>
        <rect width="168" height="40" rx="12" fill="#fff" />
        <rect x="12" y="11" width="22" height="18" rx="4" fill="none" stroke={O} strokeWidth="2" strokeDasharray="4 3" /><text x="44" y="24" fontSize="11" fontWeight="700" fill={B}>위험운전 이벤트 검지</text>
      </g>
    </svg>
  );
}

/* B. C-ITS: 전방 사고 → 센터·RSU·VMS 경고 → 차로 변경 회피 */
function CITS() {
  const id = 'ci', T = 9;
  const detour = 'M-80 254 H300 C350 254 370 285 420 285 H720';
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="전방 사고 정보를 교통관리센터와 노변장치가 차량에 제공해 차량이 차로를 바꿔 회피하는 C-ITS 그림">
      <Defs id={id} />
      <Land id={id} />
      <g transform="translate(250 6)"><Building id={id} x={0} y={30} w={120} d={34} h={40} rows={2} /><text x="60" y="22" textAnchor="middle" fontSize="12" fontWeight="800" fill={B}>TMC</text></g>
      <Tree x={60} y={70} /><Tree x={100} y={56} s={.8} /><Tree x={580} y={70} s={.9} /><Tree x={600} y={334} />
      <Highway id={id} y={176} h={124} />
      {/* 전방 사고 (동측 1차로) */}
      <g transform="translate(540 254)"><circle r="30" fill={O} opacity=".18"><animate attributeName="r" values="22;36;22" dur="1.8s" repeatCount="indefinite" /></circle><g transform="rotate(14)"><Car id={id} color="#ffd2c2" /></g></g>
      <g transform="translate(584 238)"><path d="M0-14L13 9H-13Z" fill={O} stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" /><path d="M0-6V1" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></g>
      {/* VMS */}
      <g transform="translate(120 118)">
        <path d="M-40 58 V0 M40 58 V0" stroke={S} strokeWidth="4" />
        <rect x="-58" y="-26" width="116" height="38" rx="5" fill={BD} />
        <text y="-2" textAnchor="middle" fontSize="12" fontWeight="800" fill={O}>전방 사고 주의<animate attributeName="opacity" values="1;.35;1" dur="1.4s" repeatCount="indefinite" /></text>
      </g>
      {/* RSU + 센터 링크 */}
      <g transform="translate(400 150)">
        <path d="M0 26 V-30" stroke={S} strokeWidth="5" strokeLinecap="round" /><rect x="-14" y="-44" width="28" height="18" rx="4" fill={B} /><circle cy="-35" r="3" fill={G} />
        <circle cy="-35" r="20" fill="none" stroke={G} strokeWidth="2.4"><animate attributeName="r" values="12;60" dur="2.2s" repeatCount="indefinite" /><animate attributeName="opacity" values="1;0" dur="2.2s" repeatCount="indefinite" /></circle>
      </g>
      <path d="M310 74 L400 112" stroke={B} strokeWidth="2" strokeDasharray="6 6" opacity=".6" />
      <circle r="4.5" fill={O}><animateMotion dur="1.8s" repeatCount="indefinite" path="M310 74 L400 112" /></circle>
      {/* 동측(→): 경고 수신 후 차로 변경 */}
      {[0, -T / 2].map(b => (
        <Move key={b} path={detour} dur={T} begin={b}>
          <Car id={id} av={b === 0} />
          <g transform="translate(0 -26)" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.28;.32;.6;.64" dur={T + 's'} begin={b + 's'} repeatCount="indefinite" /><rect x="-11" y="-10" width="22" height="16" rx="5" fill={O} /><path d="M0 -6 V0" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /><circle cy="3" r="1.4" fill="#fff" /></g>
        </Move>
      ))}
      {/* 서측(←) */}
      <Move path={W(191)} dur={10}><Car id={id} /></Move>
      <Move path={W(222)} dur={12} begin={-5}><Car id={id} color="#fff" /></Move>
      <Panel id={id} x={456} y={24} w={164} h={92} title="경고정보 제공">
        <rect x="14" y="36" width="64" height="40" rx="8" fill="#eef3f8" /><text x="46" y="61" textAnchor="middle" fontSize="11" fontWeight="800" fill={B}>V2I</text>
        <rect x="86" y="36" width="64" height="40" rx="8" fill="#f3f8e6" /><text x="118" y="61" textAnchor="middle" fontSize="11" fontWeight="800" fill={GD}>V2V</text>
      </Panel>
    </svg>
  );
}

/* C. 교통운영: 공사구간 차로 폐쇄 → 사전 합류 · 가변 제한속도 · 검지기 */
function TrafficManagement() {
  const id = 'tm', T = 8;
  const merge = 'M-80 262 H220 C270 262 290 230 340 230 H720';
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="공사구간 차로 폐쇄 전 차량이 합류하고 가변 제한속도로 교통류를 관리하는 그림">
      <Defs id={id} />
      <Land id={id} />
      <Tree x={300} y={64} s={.9} /><Tree x={340} y={52} s={.75} /><Tree x={600} y={60} /><Tree x={250} y={330} s={.9} />
      <Highway id={id} y={150} h={128} />
      {/* 공사구간: 동측 바깥 차로 폐쇄 */}
      <path d="M350 278 L420 246 H640 V278Z" fill={O} opacity=".16" />
      {[350, 372, 396, 420, 456, 492, 528, 564, 600, 636].map((x, i) => <Cone key={x} x={x} y={i < 4 ? 276 - i * 10 : 248} />)}
      <g transform="translate(540 312)"><rect x="-38" y="-14" width="76" height="26" rx="5" fill={O} /><text y="4" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">공사구간</text></g>
      {/* 동측(→) */}
      <Move path={E(230)} dur={T} begin={-3.2}><Car id={id} av /></Move>
      <Move path={merge} dur={T}><Car id={id} /></Move>
      <Move path={merge} dur={T} begin={-6.4}><Car id={id} color="#ffe2bd" /></Move>
      {/* 서측(←) */}
      <Move path={W(166)} dur={9} begin={-2}><Car id={id} /></Move>
      <Move path={W(198)} dur={11} begin={-7}><Car id={id} color="#fff" /></Move>
      {/* 가변 제한속도(VSL) 갠트리: 동측 차로 위 */}
      <g>
        <rect x="132" y="204" width="14" height="92" rx="4" fill={GR} opacity=".85" />
        {[230, 262].map(y => (
          <g key={y} transform={`translate(139 ${y})`}>
            <circle r="22" fill={O} opacity="0"><animate attributeName="opacity" values="0;0;.35;0;0" keyTimes="0;.48;.55;.7;1" dur="6s" repeatCount="indefinite" /><animate attributeName="r" values="16;16;30;30;16" keyTimes="0;.48;.6;.7;1" dur="6s" repeatCount="indefinite" /></circle>
            <circle r="15" fill="#fff" stroke="#d6453a" strokeWidth="4" />
            <text y="5" textAnchor="middle" fontSize="13" fontWeight="800" fill={BD}>80<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.48;.5;.97;1" dur="6s" repeatCount="indefinite" /></text>
            <text y="5" textAnchor="middle" fontSize="13" fontWeight="800" fill="#d6453a" opacity="0">60<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.48;.5;.97;1" dur="6s" repeatCount="indefinite" /></text>
          </g>
        ))}
      </g>
      <Panel id={id} x={20} y={18} w={210} h={104} title="가변 제한속도 (VSL)">
        <g transform="translate(14 36)">
          <circle cx="30" cy="30" r="28" fill="#fff" stroke="#d6453a" strokeWidth="6" />
          <text x="30" y="39" textAnchor="middle" fontSize="24" fontWeight="800" fill={BD}>80<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.48;.5;.97;1" dur="6s" repeatCount="indefinite" /></text>
          <text x="30" y="39" textAnchor="middle" fontSize="24" fontWeight="800" fill="#d6453a" opacity="0">60<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.48;.5;.97;1" dur="6s" repeatCount="indefinite" /></text>
          <text x="72" y="22" fontSize="11" fontWeight="700" fill={GR}>공사구간 접근</text>
          <text x="72" y="42" fontSize="11" fill={S}>단계적 감속 유도</text>
          <path d="M72 52 H176" stroke="#eef2f6" strokeWidth="6" strokeLinecap="round" />
          <path d="M72 52 H176" stroke={O} strokeWidth="6" strokeLinecap="round" strokeDasharray="104" strokeDashoffset="104"><animate attributeName="stroke-dashoffset" values="104;104;0;0;104" keyTimes="0;.48;.62;.97;1" dur="6s" repeatCount="indefinite" /></path>
        </g>
      </Panel>
    </svg>
  );
}

/* D. 자율주행: 화물차 군집주행(V2V) · 자율주행차 센서 인지 · 혼합교통 */
function AutomatedDriving() {
  const id = 'ad';
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="자율주행 화물차 군집주행과 자율주행차의 라이다 인지를 표현한 그림">
      <Defs id={id} />
      <Land id={id} />
      <Building id={id} x={470} y={18} w={130} d={36} h={40} rows={2} />
      <Tree x={260} y={64} /><Tree x={300} y={52} s={.8} /><Tree x={380} y={60} s={.9} /><Tree x={610} y={334} s={.9} /><Tree x={440} y={334} />
      <Highway id={id} y={140} h={150} />
      {/* 군집주행: 동측 바깥 차로, 일정 간격·일정 속도 */}
      <g><animateTransform attributeName="transform" type="translate" values="-480 0;700 0" dur="16s" repeatCount="indefinite" />
        {[0, 132, 264].map((x, i) => (
          <g key={x} transform={`translate(${x} 271)`}>
            <Truck />
            {i < 2 && <g>
              <path d="M66 0 H100" stroke={G} strokeWidth="2.6" strokeDasharray="4 4" />
              <circle r="3.6" fill={GD}><animateMotion dur="1s" repeatCount="indefinite" path="M66 0 H100" /></circle>
              <g transform="translate(83 29)"><rect x="-18" y="-9" width="36" height="16" rx="8" fill="#fff" stroke={GD} strokeWidth="1.5" /><text y="3" textAnchor="middle" fontSize="9" fontWeight="800" fill={GD}>V2V</text></g>
            </g>}
          </g>
        ))}
      </g>
      {/* 동측 안쪽 차로: 자율주행차 라이다 인지 */}
      <Move path={E(234)} dur={9}>
        <circle r="34" fill="none" stroke={G} strokeWidth="2" strokeDasharray="4 5" opacity=".9"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="3s" repeatCount="indefinite" /></circle>
        <path d="M26 0 L118 -26 A96 96 0 0 1 118 26Z" fill={G} opacity=".22"><animate attributeName="opacity" values=".12;.32;.12" dur="1.6s" repeatCount="indefinite" /></path>
        <Car id={id} av />
      </Move>
      <Move path={E(234)} dur={9} begin={-4.5}><Car id={id} /></Move>
      {/* 서측(←) */}
      <Move path={W(159)} dur={10} begin={-3}><Car id={id} color="#fff" /></Move>
      <Move path={W(196)} dur={9} begin={-6}><Car id={id} /></Move>
      <Panel id={id} x={20} y={18} w={190} h={92} title="자율주행 인지 · 통신">
        <circle cx="22" cy="46" r="7" fill={G} stroke={GD} strokeWidth="2" /><text x="36" y="50" fontSize="11" fill={GR}>LiDAR 주변 인지</text>
        <rect x="15" y="64" width="14" height="14" rx="4" fill="#fff" stroke={GD} strokeWidth="2" /><text x="36" y="75" fontSize="11" fill={GR}>V2V 화물차 군집주행</text>
      </Panel>
    </svg>
  );
}

const areaScenes: Record<string, () => React.JSX.Element> = {'traffic-safety': TrafficSafety, 'c-its': CITS, 'traffic-management': TrafficManagement, 'automated-driving': AutomatedDriving};
export function AreaScene({id}: {id: string}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) svg.pauseAnimations();
  }, []);
  const Scene = areaScenes[id] || TrafficSafety;
  return <div className="research-scene" ref={ref}><Scene /></div>;
}

const scenes = [SharedMobility, RoadInfra, DrivingPerformance, Cooperative];

export default function ResearchScene({index}: {index: number}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => (mq.matches ? svg.pauseAnimations() : svg.unpauseAnimations());
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  const Scene = scenes[index] || SharedMobility;
  return <div className="research-scene" ref={ref}><Scene /></div>;
}

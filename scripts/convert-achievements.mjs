/* 통합 실적 관리자료(xlsx) → public/achievements.json 변환
   - 시트 구성(1-1 국내논문, 1-2 국외논문, 2. 연구과제, 3. 경력, 4-1 기술이전, 4-2 특허, 5. 수상, 6. 학술대회, 7. 저서)은 기존 엑셀 양식 기준
   - 홈페이지에서 따로 보강한 정보(논문 링크, 색인 등)는 기존 achievements.json에서 제목 기준으로 이어받음
   - public/overrides.json: exclude(숨길 실적 제목), add(엑셀에 없는 실적 직접 추가) */
import XLSX from 'xlsx';

const clean = v => String(v ?? '').replace(/ /g, ' ').replace(/[\t\r\n]+/g, ' ').replace(/ +/g, ' ').trim();
const date = v => { v = clean(v); if (/^\d{1,2}\.\d{6,}$/.test(v)) return String(Number(Number(v).toFixed(2))); return v; };
const norm = s => clean(s).toLowerCase().replace(/[^0-9a-z가-힣]/g, '');

/* 엑셀 → 시트별 행 목록 [{name, rows:[{row, cells:{A12: '...'}}]}] */
export function readWorkbook(buffer) {
  const wb = XLSX.read(buffer, {type: 'buffer', cellDates: false, raw: false});
  return wb.SheetNames.map(name => {
    const ws = wb.Sheets[name];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
    const rows = [];
    for (let r = range.s.r; r <= range.e.r; r++) {
      const cells = {};
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({r, c});
        const cell = ws[addr];
        const val = cell ? (cell.t === 'n' ? String(cell.v) : (cell.w ?? cell.v)) : ''; if (clean(val) !== '') cells[addr] = clean(val);
      }
      if (Object.keys(cells).length) rows.push({row: r + 1, cells});
    }
    return {name, rows};
  });
}

export function convert(raw, {previous, overrides = {}, sourceFile, sourceDate}) {
  const items = [];
  const push = (s, r, kind, title, dt, authors, venue, fields) => {
    const year = dt.match(/(?:19|20)\d{2}/)?.[0] || '';
    items.push({
      id: 'achievement-' + raw.indexOf(s) + '-' + r.row, kind, title: clean(title), date: dt, year, authors: clean(authors), venue: clean(venue),
      fields: fields.filter(f => f.value).map(f => ({label: f.label, value: clean(f.value)})),
      source: {sheet: s.name, rows: [r.row], range: 'A' + r.row + ':' + (s.name.startsWith('2.') ? 'M' : s.name.startsWith('6.') ? 'J' : 'K') + r.row},
    });
  };
  for (const s of raw) for (const r of s.rows.slice(1)) {
    const c = Object.fromEntries(Object.entries(r.cells).map(([k, v]) => [k.replace(/\d+$/, ''), clean(v)]));
    const f = (label, col) => ({label, value: c[col] || ''});
    if (s.name.startsWith('1-1') || s.name.startsWith('1-2')) {
      if (!c.A) continue;
      const domestic = s.name.startsWith('1-1');
      push(s, r, domestic ? '국내논문' : '국외논문', c.A, date(c.C), c.B, c.D, [f('APA 서지정보', domestic ? 'E' : 'F'), ...(!domestic ? [f('색인', 'E')] : [])]);
    } else if (s.name.startsWith('2.')) push(s, r, '연구과제수행', c.E, date(c.G), '', c.H, [f('사업구분', 'L'), f('연구유형', 'M'), f('과제구분', 'C'), {label: '과제상태 (자료 기준)', value: c.I}]);
    else if (s.name.startsWith('3.')) push(s, r, '경력', c.A, date(c.C) + (c.D ? ' ~ ' + (c.D === '~' ? '현재' : date(c.D)) : ''), '', c.B, [f('직위', 'B'), f('근무기간', 'E')]);
    else if (s.name.startsWith('4-1')) push(s, r, '기술이전', c.A, date(c.B), '', c.C, []);
    else if (s.name.startsWith('4-2')) {
      const existing = items.find(i => i.kind === '특허' && i.fields.some(x => x.label === '출원번호' && x.value === c.D));
      if (existing) {
        existing.source.rows.push(r.row);
        if (c.F) {
          existing.title = c.H; existing.date = date(c.G || c.E); existing.year = existing.date.match(/(?:19|20)\d{2}/)?.[0] || '';
          for (const [label, col] of [['등록번호', 'F'], ['등록일자', 'G']]) { const found = existing.fields.find(x => x.label === label); if (found) found.value = c[col] || found.value; else if (c[col]) existing.fields.push({label, value: c[col]}); }
          const status = existing.fields.find(x => x.label === '등록 여부'); if (status) status.value = '등록';
        }
        continue;
      }
      push(s, r, '특허', c.H, date(c.G || c.E), c.I, c.J, [f('국가', 'B'), f('출원번호', 'D'), f('출원일자', 'E'), f('등록번호', 'F'), f('등록일자', 'G'), {label: '등록 여부', value: c.F ? '등록' : '출원'}, f('관련 과제', 'K')]);
    } else if (s.name.startsWith('5.')) push(s, r, '수상실적', c.E, date(c.B), '', c.C, [f('국내/국제', 'D'), f('수상내용', 'F')]);
    else if (s.name.startsWith('6.')) { if (!c.H && !c.D) continue; push(s, r, '학술대회 참여', c.H || c.D, (c.B || '') + (c.C ? ' / ' + date(c.C) : ''), c.F, c.D, [f('공저자', 'G'), f('주관', 'E'), f('장소', 'I')]); }
    else if (s.name.startsWith('7.')) push(s, r, '저서', c.C, date(c.A), c.D, c.B, [f('ISBN', 'E'), f('발간등록번호', 'F'), f('비고', 'G')]);
  }

  /* 기존 데이터에서 보강 정보 이어받기 (논문 링크·추가 필드) */
  const prevByKey = new Map((previous?.items || []).map(i => [i.kind + '|' + norm(i.title), i]));
  for (const it of items) {
    const p = prevByKey.get(it.kind + '|' + norm(it.title));
    if (!p) continue;
    if (p.paperLink && !it.paperLink) it.paperLink = p.paperLink;
    for (const pf of p.fields || []) if (!it.fields.some(x => x.label === pf.label)) it.fields.push(pf);
  }

  /* 수동 설정: 숨김·추가 */
  const hide = new Set((overrides.exclude || []).map(norm));
  let out = items.filter(i => !hide.has(norm(i.title)) && !hide.has(norm(i.venue + ' ' + i.title)));
  for (const a of overrides.add || []) if (!out.some(i => i.kind === a.kind && norm(i.title) === norm(a.title))) out.push(a);

  out.sort((a, b) => b.year.localeCompare(a.year) || b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  return {version: 1, updated: new Date().toISOString().slice(0, 10), sourceFile, sourceDate, items: out};
}

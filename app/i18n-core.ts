/* 한→영 번역 엔진: 사전(정확 일치) + 이름 로마자 + 반복 패턴 분해 */
export type Dict = Record<string, string>;
const HANGUL = /[가-힣]/;

/* 성씨 관용 표기 */
const SURNAME: Record<string, string> = {'김': 'Kim', '이': 'Lee', '박': 'Park', '최': 'Choi', '정': 'Jeong', '조': 'Cho', '오': 'Oh', '장': 'Jang', '윤': 'Yoon', '한': 'Han', '강': 'Kang', '임': 'Lim', '신': 'Shin', '송': 'Song', '유': 'Yoo', '류': 'Ryu', '홍': 'Hong', '고': 'Ko', '문': 'Moon', '양': 'Yang', '손': 'Son', '배': 'Bae', '백': 'Baek', '허': 'Heo', '남': 'Nam', '노': 'Noh', '하': 'Ha', '곽': 'Kwak', '성': 'Sung', '차': 'Cha', '주': 'Joo', '우': 'Woo', '구': 'Koo', '나': 'Na', '민': 'Min', '진': 'Jin', '지': 'Jee', '엄': 'Eom', '채': 'Chae', '원': 'Won', '천': 'Cheon', '방': 'Bang', '공': 'Kong', '현': 'Hyun', '함': 'Ham', '변': 'Byun', '염': 'Yeom', '여': 'Yeo', '추': 'Choo', '도': 'Do', '소': 'So', '석': 'Seok', '선': 'Sun', '설': 'Seol', '마': 'Ma', '길': 'Gil', '연': 'Yeon', '위': 'Wi', '표': 'Pyo', '명': 'Myung', '기': 'Ki', '반': 'Ban', '왕': 'Wang', '금': 'Keum', '옥': 'Ok', '육': 'Yook', '인': 'In', '맹': 'Maeng', '제': 'Je', '모': 'Mo', '탁': 'Tak', '국': 'Kook', '어': 'Eo', '은': 'Eun', '편': 'Pyeon', '용': 'Yong', '전': 'Jeon', '안': 'Ahn', '황': 'Hwang', '서': 'Seo', '권': 'Kwon', '심': 'Sim', '남궁': 'Namgung', '선우': 'Sunwoo', '황보': 'Hwangbo', '제갈': 'Jegal'};
const INI = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const MED = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const FIN = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
function rr(word: string) {
  let out = '';
  for (const ch of word) {
    const c = ch.charCodeAt(0) - 0xac00;
    if (c < 0 || c > 11171) { out += ch; continue; }
    out += INI[Math.floor(c / 588)] + MED[Math.floor((c % 588) / 28)] + FIN[c % 28];
  }
  return out.replace(/^r/, 'r');
}
export function romanize(name: string, known: Dict) {
  const n = name.replace(/\s+/g, '');
  if (known[n]) return known[n];
  const sur = n.length >= 3 && ['남궁', '선우', '황보', '제갈'].includes(n.slice(0, 2)) ? n.slice(0, 2) : n.slice(0, 1);
  const given = rr(n.slice(sur.length));
  return (given.charAt(0).toUpperCase() + given.slice(1)) + ' ' + (SURNAME[sur] || (rr(sur).charAt(0).toUpperCase() + rr(sur).slice(1)));
}

const NAME = /^[가-힣]{2,4}$/;
const NAME_LIST = /^[가-힣]{2,4}(\s*,\s*([가-힣]{2,4}|[A-Z][A-Za-z.\- ]+))+$/;

export function makeTranslator(dict: Dict, names: Dict, miss?: Set<string>) {
  const cache = new Map<string, string>();
  const nm = (s: string) => /[가-힣]/.test(s) ? romanize(s.trim(), names) : s.trim();
  const patterns: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/^(\d+)개의 앨범$/, m => `${m[1]} album${m[1] === '1' ? '' : 's'}`],
    [/^사진 (\d+)장$/, m => `${m[1]} photo${m[1] === '1' ? '' : 's'}`],
    [/^(\d+)개국$/, m => `${m[1]} countries`],
    [/^(\d+)년(?: (\d+)개월)?$/, m => `${m[1]} yr${m[2] ? ' ' + m[2] + ' mo' : ''}`],
    [/^(\d+)개월$/, m => `${m[1]} mo`],
    [/^(\d+)건$/, m => `${m[1]}`],
    [/^(\d+)명$/, m => `${m[1]}`],
    [/^(\d+)편$/, m => `${m[1]}`],
    [/^(.+) 대표 사진$/, m => t(m[1]) + ' cover photo'],
    [/^(.+) · 사진 (\d+)$/, m => t(m[1]) + ' · photo ' + m[2]],
    [/^사진 (\d+) 보기$/, m => 'View photo ' + m[1]],
    [/^(.+) 공식 홈페이지 \(새 창\)$/, m => t(m[1]) + ' official website (new window)'],
    [/^(.+) 로고$/, m => t(m[1]) + ' logo'],
    [/^(.+) 교수 사진$/, m => 'Prof. ' + nm(m[1]) + ' photo'],
    [/^(.+) 사진$/, m => t(m[1]) + ' photo'],
    [/^(.+) 교수$/, m => 'Prof. ' + nm(m[1])],
    [/^(.+) 검색$/, m => 'Search ' + t(m[1])],
    [/^♣축졸업♣\s*(.+)$/, m => t(m[1])],
    [/^(.+) 박사 졸업식?$/, m => 'Ph.D. Graduation of ' + nm(m[1])],
    [/^(.+) 석사 졸업식?$/, m => 'M.S. Graduation of ' + nm(m[1])],
    /* APA: 저자. (연도). 제목. 학술지, 권(호), 쪽. */
    [/^(.+?)\. \((\d{4}[a-z]?)\)\. (.+)\. ([^.]+?)((?:, [^.]*)?\.?)$/, m => {
      const authors = m[1].split(/,\s*(?:&\s*)?|\s*&\s*/).filter(Boolean).map(nm);
      const a = authors.length > 1 ? authors.slice(0, -1).join(', ') + ', & ' + authors[authors.length - 1] : authors[0];
      return `${a}. (${m[2]}). ${t(m[3])}. ${t(m[4])}${m[5]}`;
    }],
  ];
  function core(s: string): string {
    if (dict[s] !== undefined) return dict[s];
    if (NAME_LIST.test(s) && s.split(/\s*,\s*/).every(x => !/[가-힣]/.test(x) || names[x.replace(/\s/g, '')])) return s.split(/\s*,\s*/).map(nm).join(', ');
    if (NAME.test(s) && names[s]) return names[s];
    for (const [re, f] of patterns) { const m = s.match(re); if (m) return f(m); }
    if (s.includes(' · ')) return s.split(' · ').map(t).join(' · ');
    let m = s.match(/^([\d.\s~\-]*\d[\d.\s~\-]*?\s)(\S.*)$/);
    if (m) return m[1] + t(m[2]);
    m = s.match(/^(.+?)(\s*\([\d\-]+\))$/);
    if (m) return t(m[1]) + m[2];
    m = s.match(/^(.+?)(\s*\(\d+차\))$/);
    if (m) return t(m[1]) + m[2].replace(/\((\d+)차\)/, (_, n) => `(Phase ${n})`);
    miss?.add(s);
    return s;
  }
  function t(s: string): string {
    if (!s || !HANGUL.test(s)) return s;
    const lead = s.match(/^\s*/)![0], trail = s.match(/\s*$/)![0], core0 = s.trim();
    let r = cache.get(core0);
    if (r === undefined) { r = core(core0); cache.set(core0, r); }
    return lead + r + trail;
  }
  return t;
}

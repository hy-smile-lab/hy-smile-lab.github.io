/* 공유드라이브 → 홈페이지 데이터 동기화 (GitHub Actions에서 실행)
   필요 환경변수
     GDRIVE_SA_KEY   : 구글 서비스 계정 키(JSON 전체)
     DRIVE_FOLDER_ID : 연동할 폴더 ID. 여러 개면 쉼표로 구분 (예: 실적 폴더ID,앨범 폴더ID). 각 폴더를 서비스 계정 이메일에 '뷰어'로 공유
   폴더 구조
     <홈페이지 자료>/
       통합 실적 관리자료_YYYYMMDD.xlsx      ← 가장 최근에 수정된 파일 사용 (구글 스프레드시트도 가능)
       3. 연구실 앨범/                         ← 이름에 '앨범'이 들어간 폴더 (예: 사진 앨범, 3. 연구실 앨범)
         <분류 폴더>/                         ← 국제 학술활동 · 국내 학술활동 · 연구 및 대외활동 · 연구실 생활
           260520 앨범 제목/                  ← 폴더 이름 앞 날짜(yymmdd, 261022-23 등) = 행사일·연도, 뒤 = 앨범 제목
             사진들 (jpg, png, webp. heic·동영상·pdf는 제외)                        */
import fs from 'node:fs';
import path from 'node:path';
import {JWT} from 'google-auth-library';
import sharp from 'sharp';
import {readWorkbook, convert} from './convert-achievements.mjs';

const PUB = path.resolve('public');
const key = process.env.GDRIVE_SA_KEY, root = process.env.DRIVE_FOLDER_ID;
if (!key || !root) { console.log('GDRIVE_SA_KEY / DRIVE_FOLDER_ID 미설정: 동기화 건너뜀'); process.exit(0); }

const sa = JSON.parse(key);
const auth = new JWT({email: sa.client_email, key: sa.private_key, scopes: ['https://www.googleapis.com/auth/drive.readonly']});
const API = 'https://www.googleapis.com/drive/v3';
const common = 'supportsAllDrives=true&includeItemsFromAllDrives=true';

async function list(parent) {
  const out = []; let pageToken = '';
  do {
    const q = encodeURIComponent(`'${parent}' in parents and trashed = false`);
    const res = await auth.request({url: `${API}/files?q=${q}&fields=nextPageToken,files(id,name,mimeType,modifiedTime)&pageSize=1000&${common}${pageToken ? '&pageToken=' + pageToken : ''}`});
    out.push(...res.data.files); pageToken = res.data.nextPageToken || '';
  } while (pageToken);
  return out;
}
async function download(file) {
  const url = file.mimeType === 'application/vnd.google-apps.spreadsheet'
    ? `${API}/files/${file.id}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    : `${API}/files/${file.id}?alt=media&${common}`;
  const res = await auth.request({url, responseType: 'arraybuffer'});
  return Buffer.from(res.data);
}
const readJson = f => JSON.parse(fs.readFileSync(path.join(PUB, f), 'utf8'));
const writeJson = (f, d) => { const p = path.join(PUB, f), s = JSON.stringify(d, null, 2) + '\n'; if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== s) { fs.writeFileSync(p, s); console.log('갱신:', f); } };
const isFolder = f => f.mimeType === 'application/vnd.google-apps.folder';
/* 앨범 폴더 이름에서 날짜·제목 추출: '260112 TRB 참석', '20260112 …', '2026-01-12 …', '2026.1.12 …' 모두 인식 (없으면 폴더 수정일) */
function parseName(name, fallback) {
  const n = name.trim();
  let m = n.match(/^(\d{4})[-._](\d{1,2})[-._](\d{1,2})[\s_-]*(.*)$/) || n.match(/^(\d{4})(\d{2})(\d{2})[\s_-]*(.*)$/);
  if (!m) { const s = n.match(/^(\d{2})(\d{2})(\d{2})(?:-\d{1,2})?[\s_-]*(.*)$/); if (s) m = [s[0], '20' + s[1], s[2], s[3], s[4]]; }
  if (m && +m[2] >= 1 && +m[2] <= 12 && +m[3] >= 1 && +m[3] <= 31) return {posted: `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`, title: m[4].trim() || n};
  return {posted: fallback.slice(0, 10), title: n};
}

/* 연동 폴더: 쉼표로 여러 개 지정 가능. 지정한 폴더 자체가 '앨범' 폴더여도 되고, 그 안에 '앨범' 폴더가 있어도 됨 */
const roots = root.split(',').map(s => s.trim()).filter(Boolean);
const files = [];
for (const id of roots) {
  const meta = (await auth.request({url: `${API}/files/${id}?fields=id,name,mimeType,modifiedTime&${common}`})).data;
  files.push(meta, ...(await list(id)));
}

/* 1) 실적 엑셀 */
const sheet = files.filter(f => /통합\s*실적/.test(f.name) && (/\.xlsx$/i.test(f.name) || f.mimeType === 'application/vnd.google-apps.spreadsheet'))
  .sort((a, b) => b.modifiedTime.localeCompare(a.modifiedTime))[0];
if (sheet) {
  const previous = readJson('achievements.json');
  const overrides = fs.existsSync(path.join(PUB, 'overrides.json')) ? readJson('overrides.json') : {};
  const next = convert(readWorkbook(await download(sheet)), {previous, overrides, sourceFile: sheet.name, sourceDate: sheet.modifiedTime.slice(0, 10)});
  const same = JSON.stringify(previous.items) === JSON.stringify(next.items);
  if (!same) writeJson('achievements.json', next); else console.log('실적 변경 없음');
} else console.log('실적 엑셀을 찾지 못함');

/* 2) 사진 앨범 */
const albumRoot = files.find(f => isFolder(f) && /앨범/.test(f.name));
if (albumRoot) {
  const albums = readJson('albums.json');
  const rotateExtra = (fs.existsSync(path.join(PUB, 'overrides.json')) ? readJson('overrides.json') : {}).rotatePhotos || {};
  const seen = new Set();
  for (const cat of (await list(albumRoot.id)).filter(isFolder)) {
    const children = (await list(cat.id)).filter(isFolder);
    const folders = [];
    for (const ch of children) { if (/^\d{4}$/.test(ch.name.trim())) folders.push(...(await list(ch.id)).filter(isFolder)); else folders.push(ch); }
    for (const folder of folders) {
      const id = 'drive-' + folder.id; seen.add(id);
      const {posted, title} = parseName(folder.name, folder.modifiedTime);
      const photos = (await list(folder.id)).filter(f => /^image\/(jpeg|png|webp)$/.test(f.mimeType)).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      const stamp = photos.map(p => p.id + p.modifiedTime).join('|');
      const old = albums.items.find(a => a.id === id);
      if (old && old.driveStamp === stamp && old.title === title && old.category === cat.name.trim()) continue;
      const images = [];
      for (const [i, p] of photos.entries()) {
        const rel = `/album-photos/${id}-${String(i + 1).padStart(2, '0')}.webp`;
        let src = await sharp(await download(p), {failOn: 'none'}).rotate().toBuffer();
        if (rotateExtra[p.id]) src = await sharp(src).rotate(rotateExtra[p.id]).toBuffer();
        const buf = await sharp(src).resize({width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true}).webp({quality: 80}).toBuffer();
        fs.writeFileSync(path.join(PUB, rel), buf);
        const meta = await sharp(buf).metadata();
        images.push({path: rel, caption: '', width: meta.width, height: meta.height});
      }
      const entry = {id, sourceId: folder.id, category: cat.name.trim(), title, eventYear: posted.slice(0, 4), postedDate: posted, listedImageCount: images.length, sourceUrl: '', note: '공유드라이브 동기화', description: '', images, driveStamp: stamp};
      if (!images.length) continue;
      if (old) Object.assign(old, entry); else albums.items.push(entry);
      console.log((old ? '앨범 갱신: ' : '앨범 추가: ') + title);
    }
  }
  /* 드라이브에서 지운 앨범은 홈페이지에서도 제거 (전 홈페이지 이관 앨범은 데이터에 유지, 표시 여부는 overrides.json의 hideLegacyAlbums) */
  albums.items = albums.items.filter(a => !a.id.startsWith('drive-') || seen.has(a.id));
  for (const f of fs.readdirSync(path.join(PUB, 'album-photos'))) if (f.startsWith('drive-') && !seen.has(f.replace(/-\d+\.webp$/, ''))) fs.unlinkSync(path.join(PUB, 'album-photos', f));
  albums.items.sort((a, b) => b.postedDate.localeCompare(a.postedDate));
  writeJson('albums.json', albums);
} else console.log("'앨범' 폴더를 찾지 못함");

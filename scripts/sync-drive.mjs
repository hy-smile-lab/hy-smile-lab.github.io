/* 공유드라이브 → 홈페이지 데이터 동기화 (GitHub Actions에서 실행)
   필요 환경변수
     GDRIVE_SA_KEY   : 구글 서비스 계정 키(JSON 전체)
     DRIVE_FOLDER_ID : 홈페이지 자료 폴더 ID (서비스 계정 이메일에 '뷰어'로 공유)
   폴더 구조
     <홈페이지 자료>/
       통합 실적 관리자료_YYYYMMDD.xlsx      ← 가장 최근에 수정된 파일 사용 (구글 스프레드시트도 가능)
       사진 앨범/
         국제 행사 | 국내 행사 | 졸업 | 연구실 행사/
           2026-05-20 앨범 제목/   ← 폴더 이름 앞 날짜 = 게시일, 뒤 = 앨범 제목
             사진들 (jpg, png, heic 제외)                                          */
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

const files = await list(root);

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
const albumRoot = files.find(f => isFolder(f) && f.name.trim() === '사진 앨범');
if (albumRoot) {
  const albums = readJson('albums.json');
  const seen = new Set();
  for (const cat of (await list(albumRoot.id)).filter(isFolder)) {
    for (const folder of (await list(cat.id)).filter(isFolder)) {
      const id = 'drive-' + folder.id; seen.add(id);
      const m = folder.name.match(/^(\d{4})[-.](\d{1,2})[-.](\d{1,2})\s*(.*)$/);
      const posted = m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : folder.modifiedTime.slice(0, 10);
      const title = (m ? m[4] : folder.name).trim();
      const photos = (await list(folder.id)).filter(f => /^image\/(jpeg|png|webp)$/.test(f.mimeType)).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      const stamp = photos.map(p => p.id + p.modifiedTime).join('|');
      const old = albums.items.find(a => a.id === id);
      if (old && old.driveStamp === stamp && old.title === title && old.category === cat.name.trim()) continue;
      const images = [];
      for (const [i, p] of photos.entries()) {
        const rel = `/album-photos/${id}-${String(i + 1).padStart(2, '0')}.webp`;
        const buf = await sharp(await download(p), {failOn: 'none'}).rotate().resize({width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true}).webp({quality: 80}).toBuffer();
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
  /* 드라이브에서 지운 앨범은 홈페이지에서도 제거 (기존 홈페이지 이관 앨범은 유지) */
  albums.items = albums.items.filter(a => !a.id.startsWith('drive-') || seen.has(a.id));
  for (const f of fs.readdirSync(path.join(PUB, 'album-photos'))) if (f.startsWith('drive-') && !seen.has(f.replace(/-\d+\.webp$/, ''))) fs.unlinkSync(path.join(PUB, 'album-photos', f));
  albums.items.sort((a, b) => b.postedDate.localeCompare(a.postedDate));
  writeJson('albums.json', albums);
} else console.log("'사진 앨범' 폴더를 찾지 못함");

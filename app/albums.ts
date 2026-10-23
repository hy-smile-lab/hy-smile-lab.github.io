import seed from '../public/albums.json';
import overrides from '../public/overrides.json';

/* 홈페이지에 표시할 앨범: 드라이브로 옮겨져 중복되는 전 홈페이지(tris) 앨범은 숨김 */
const o = overrides as {hideLegacyAlbums?: boolean; hideLegacyAlbumIds?: string[]};
const hidden = new Set(o.hideLegacyAlbumIds || []);
export const visibleAlbums = seed.items.filter(a => !(a.id.startsWith('legacy-') && (o.hideLegacyAlbums || hidden.has(a.id))));

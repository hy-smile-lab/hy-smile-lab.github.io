'use client';
import US from 'country-flag-icons/string/3x2/US';
import JP from 'country-flag-icons/string/3x2/JP';
import FR from 'country-flag-icons/string/3x2/FR';
import GR from 'country-flag-icons/string/3x2/GR';
import PH from 'country-flag-icons/string/3x2/PH';
import RO from 'country-flag-icons/string/3x2/RO';
import TW from 'country-flag-icons/string/3x2/TW';
import KR from 'country-flag-icons/string/3x2/KR';
import AU from 'country-flag-icons/string/3x2/AU';
import CA from 'country-flag-icons/string/3x2/CA';
import DK from 'country-flag-icons/string/3x2/DK';
import SG from 'country-flag-icons/string/3x2/SG';
import AE from 'country-flag-icons/string/3x2/AE';
import VN from 'country-flag-icons/string/3x2/VN';
import CN from 'country-flag-icons/string/3x2/CN';
import NL from 'country-flag-icons/string/3x2/NL';
import AT from 'country-flag-icons/string/3x2/AT';
import ID from 'country-flag-icons/string/3x2/ID';
import IS from 'country-flag-icons/string/3x2/IS';
import UZ from 'country-flag-icons/string/3x2/UZ';
import EC from 'country-flag-icons/string/3x2/EC';
import TR from 'country-flag-icons/string/3x2/TR';

/* 국기 SVG (Windows에서 국기 이모지가 표시되지 않아 SVG 사용). 새 국가는 import 한 줄과 FLAGS에 추가 */
const FLAGS: Record<string, string> = {US, JP, FR, GR, PH, RO, TW, KR, AU, CA, DK, SG, AE, VN, CN, NL, AT, ID, IS, UZ, EC, TR};
export const flagUri = (code: string) => FLAGS[code] ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(FLAGS[code]) : '';

export default function Flag({code, title}: {code: string; title?: string}) {
  const src = flagUri(code);
  return src ? <img className="flag" src={src} alt={title || code} title={title} /> : null;
}

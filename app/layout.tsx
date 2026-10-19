import './site.css';
import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'HY-SMILE | 스마트 모빌리티 안전 연구실',
  description: '한양대학교 ERICA 스마트 모빌리티 안전 연구실(HY-SMILE). 사람 중심의 안전한 교통·물류시스템을 연구합니다.',
  icons: {icon: (process.env.NEXT_PUBLIC_BASE_PATH || '') + '/favicon.svg'},
};

export default function Layout({children}: {children: React.ReactNode}) {
  return <html lang="ko"><body>{children}</body></html>;
}

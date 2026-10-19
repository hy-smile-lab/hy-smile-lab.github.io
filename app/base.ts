/* GitHub Pages 하위 경로(예: /hy-smile) 배포 대응: '/'로 시작하는 정적 파일 경로 앞에 basePath를 붙임 */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const withBase = (p: string) => (p && p.startsWith('/') && !p.startsWith('//') ? BASE + p : p);

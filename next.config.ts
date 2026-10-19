import type {NextConfig} from 'next';

/* 정적 사이트로 내보내기(out/). GitHub Pages 하위 경로 배포 시 NEXT_PUBLIC_BASE_PATH=/저장소이름 */
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const nextConfig: NextConfig = {
  output: 'export',
  basePath: base || undefined,
  trailingSlash: true,
  images: {unoptimized: true},
};
export default nextConfig;

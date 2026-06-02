// 이 파일은 임시 진입점 역할을 합니다. 실제 퀴즈 페이지로 리다이렉트 시킵니다.
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    // 사용자가 진입하면 바로 핵심 Funnel인 퀴즈로 리다이렉트
    router.push('/diagnostic-quiz');
  }, [router]);

  return null; // 로딩 중 페이지는 비워둡니다.
};

export default Home;
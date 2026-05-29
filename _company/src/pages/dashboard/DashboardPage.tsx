import React, { useState, useEffect } from 'react';
import { useScrollLogger } from '../../hooks/useScrollLogger'; // Hook 임포트 확인
import StreamingDataComponent from './StreamingDataComponent';

// 타입 정의는 항상 엄격하게 가져가야 합니다. any? 절대 안 됩니다.
interface DashboardReport {
  isLoading: boolean;
  dataStream: Promise<Array<{ title: string, content: string }>>; // 스트리밍 데이터의 Promise 형태로 처리
}

/**
 * ⚠️ 경고: 이 페이지는 구조적 무결성 확보가 최우선입니다.
 */
const DashboardPage: React.FC = () => {
  // 스크롤 로거를 사용하여 페이지 레벨에서 전체 감시(Attention Point) 시작
  const loggerRef = useScrollLogger();

  // 💡 초기 상태 정의 및 API 호출 시뮬레이션 준비
  const [report, setReport] = useState<DashboardReport>({
    isLoading: true,
    dataStream: Promise.resolve([]) // 임시 더미 데이터 스트림
  });

  useEffect(() => {
    // 실제 환경에서는 여기에 비동기 API 호출이 들어갑니다. 
    // 여기서는 StreamingDataComponent가 이 역할을 전담하도록 위임합니다.
    setReport(prev => ({ ...prev, isLoading: false })); // 로딩은 컴포넌트 내부에서 처리할 예정

  }, []);


  return (
    <div className="min-h-[150vh] p-8 bg-gray-50"> 
      {/* min-h-[150vh]: 스크롤이 발생함을 강제하여 useScrollLogger 테스트 환경 조성 */}
      <h1 className="text-4xl font-extrabold text-red-700 mb-2">
        📊 시스템 무결성 감사 대시보드 (Dashboard) 
      </h1>
      <p className='mb-8'>
        사용자 행동 추적 및 실시간 리스크 스트리밍 분석 영역.
      </p>

      {/* Attention Point 1: 상단 요약 지표 */}
      <section id="attention_summary" className="py-20 bg-white shadow-lg rounded-xl mb-12">
        <h2 className="text-3xl font-bold border-b pb-2 text-gray-800">
          [Attention Point 1] 핵심 리스크 지표 요약 (KPIs)
        </h2>
        {/* 이 섹션이 스크롤되기 전에 중요한 정보를 보여줘야 합니다. */}
      </section>

      {/* Attention Point 2: 스트리밍 데이터 분석 영역 (핵심 로직 위치) */}
      <div className="py-16">
        <h2 className="text-3xl font-bold border-b pb-2 mb-8 text-gray-800">
          [Attention Point 2] 실시간 리스크 스트리밍 분석 (Async Stream Data)
        </h2>
        {/* 핵심 비동기 로직을 전담할 컴포넌트 배치 */}
        <StreamingDataComponent />
      </div>

      {/* Attention Point 3: 규제 준수 체크리스트 (이탈 방지 목적) */}
      <section id="attention_compliance" className="py-20 bg-red-50 border-l-4 border-red-600 shadow-xl rounded-lg">
        <h2 className="text-3xl font-bold text-red-800 mb-4">
          ⚠️ [Attention Point 3] 시스템 무결성 감사 체크리스트 확인 필수
        </h2>
        <p className="text-lg text-gray-700">
          이 부분의 스크롤은 사용자가 콘텐츠를 끝까지 탐색하게 만드는 마지막 장벽(Friction)입니다.
        </p>
      </section>
    </div>
  );
};

export default DashboardPage;
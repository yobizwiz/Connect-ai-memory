import React, { useState } from 'react';
import SystemFailureDisplay from './SystemFailureDisplay'; // 이미 생성된 컴포넌트 활용
// Red Zone 경고 스타일을 정의하는 유틸리티 (가정)
const getRedZoneStyles = () => ({
  backgroundColor: '#800000', 
  color: '#FFCCCC', 
  border: '2px solid #ff0000', 
  padding: '1rem', 
  animation: 'flash-red 0.5s infinite alternate' // 애니메이션 클래스 가정
});

// Type Definitions (TypeScript Strict)
interface WidgetProps {
  initialData: string;
}

const DiagnosticWidget: React.FC<WidgetProps> = ({ initialData }) => {
  const [input, setInput] = useState(initialData);
  const [result, setResult] = useState<{ score: number, message: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 핵심 상태: 시스템적 결함 발생 여부 (True일 때 Red Zone 강제)
  const [isCriticalFailure, setIsCriticalFailure] = useState<boolean>(false);

  /**
   * 리스크 분석 시뮬레이션 로직. 
   * 실제 API 호출 대신, 입력 데이터의 구조적 무결성을 검증하는 과정을 시뮬레이트합니다.
   */
  const handleAnalyzeRisk = async () => {
    if (!input) return;

    setIsLoading(true);
    setResult(null);
    setIsCriticalFailure(false); 

    // [지연 시간 부여] - 시스템 분석 시간을 체감하게 함 (Time Pressure 유발)
    await new Promise(resolve => setTimeout(resolve, 2500)); 

    try {
      let calculatedScore = 0;
      let message = "분석 완료: 현재 구조적 결함은 발견되지 않았습니다. 하지만 주의가 필요합니다.";

      // --- [핵심 로직]: 입력값 기반의 의도적인 실패 유발 시뮬레이션 (Structural Defect Detection) ---
      if (input.toLowerCase().includes('legacy') || input.length > 50) {
        // 특정 키워드나 너무 긴 데이터는 구조적 결함으로 간주하고 Red Zone 발동
        setIsCriticalFailure(true); 
        message = "⚠️ 치명적인 구조적 비일관성 감지: 레거시 시스템 종속성이 확인되었습니다. 즉각적인 개입이 필요합니다.";
      } else if (input.includes('high_risk')) {
        // 고위험 키워드 발견 -> Red Zone 경고 + 높은 점수 부여
        setIsCriticalFailure(true); 
        message = "🚨 치명적 리스크 감지: 외부 데이터 연동 실패가 임박했습니다. 법규 위반 위험도가 높습니다.";
      } else {
        // 성공 시나리오: 단순 계산 기반의 낮은 리스크 점수 산출
        calculatedScore = Math.min(10, input.length % 10 + (input.includes('secure') ? 2 : 0));
        setResult({ score: calculatedScore, message: `최적화 가능성이 있습니다. 현재는 ${calculatedScore}점의 낮은 위험도로 판단됩니다.` });
      }

    } catch (error) {
      console.error("Simulation Error:", error);
      // 예외 처리 자체도 시스템 실패로 간주하여 Red Zone 발동
      setIsCriticalFailure(true); 
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- [Rendering Logic]: 조건부 UI/UX 분기 ---

  if (isLoading) {
    return (
        <div style={getRedZoneStyles()}>
            <h3 className="text-red-500">SYSTEM ALERT: DATA STREAMING...</h3>
            <p>외부 데이터 소스 연동을 시도 중입니다. 구조적 무결성을 검증하는 과정이므로 시간이 소요됩니다.</p>
            {/* 여기에 실제 로딩 애니메이션 및 로그 스트리밍 UI가 들어갈 예정 */}
        </div>
    );
  }

  // 1. 실패 시나리오 (Red Zone 강제)
  if (isCriticalFailure && result === null) {
    const mockState = {
      loading: false,
      data: null,
      error: {
        code: 'API_CONTRACT_VIOLATION' as const,
        details: '503: EXTERNAL DATA SOURCE UNREACHABLE'
      }
    };
    return (
      <SystemFailureDisplay 
        state={mockState} 
        onRetry={() => {
          setIsCriticalFailure(false);
          setInput(initialData);
        }} 
      />
    );
  }

  // 2. 성공/경고 시나리오 통합
  const displayResult = result || { score: 0, message: "분석을 시작해 주세요." };

  return (
    <div className={`p-6 border ${isCriticalFailure ? 'border-red-700 bg-red-50' : 'border-gray-200 bg-white'} rounded-lg shadow-xl`}>
      {/* 입력 필드 */}
      <div className="mb-4">
        <label htmlFor="inputData" className="block text-sm font-medium text-gray-700">검증 대상 데이터 (핵심 증거 자료)</label>
        <textarea 
            id="inputData"
            rows={3}
            className="mt-1 block w-full p-2 border rounded-md focus:ring-red-500 focus:border-red-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* 버튼 */}
      <button 
          onClick={handleAnalyzeRisk} 
          disabled={isLoading || !input}
          className={`w-full py-2 px-4 rounded-md text-white ${
            isCriticalFailure ? 'bg-red-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition duration-150 disabled:opacity-50`}
      >
        {isLoading ? "분석 중..." : "진단 엔진 가동 및 리스크 분석 실행"}
      </button>

      {/* 결과 표시 영역 */}
      <div className="mt-6 p-4 border-t pt-4">
          {isCriticalFailure && result !== null ? (
              // Red Zone 경고가 뜨면서 동시에 결과 카드가 나오는 경우 (극도의 불안감)
             <div className="p-3 rounded" style={getRedZoneStyles()}>
                <h4 className="text-lg font-bold">경고: 구조적 결함이 발견되었습니다.</h4>
                <p>{displayResult.message}</p>
            </div>
          ) : (
              // 일반적인 결과 표시 영역
             <>
                <div className={`p-3 rounded ${isCriticalFailure ? 'bg-red-100' : 'bg-green-50'} border`}>
                    <h4 className="text-xl font-bold text-gray-800">진단 보고서 요약</h4>
                    <p><strong>리스크 점수:</strong> <span className={`font-mono ${isCriticalFailure ? 'text-red-600' : 'text-green-700'} text-2xl`}>{displayResult.score}</span> / 10</p>
                    <p className="mt-2">{displayResult.message}</p>
                </div>
             </>
          )}
      </div>
    </div>
  );
};

export default DiagnosticWidget;
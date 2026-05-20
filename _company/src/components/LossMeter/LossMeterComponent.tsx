import React, { useState, useCallback } from 'react';
import RedZoneEffect from '../RedZoneEffect'; // 새로 만들 컴포넌트
import './LossMeterComponent.css'; // 스타일 파일도 생성합니다

// 1. 데이터 인터페이스 정의 (TypeScript 엄격 준수)
interface RiskInputData {
  piiLeakageScore: number; // PII 누출 점수 (0-100)
  complianceDriftHours: number; // 규정 이탈 시간 (시간 단위)
}

// 2. 리스크 레벨 정의 및 임계치 설정
enum RiskLevel {
  SAFE = 'safe',   // 녹색: 위험 없음
  WARNING = 'warning', // 노란색: 주의 필요
  CRITICAL = 'critical' // 빨간색: 구조적 위협 (Red Zone)
}

const MAX_PII_SCORE = 100;
const CRITICAL_PII_THRESHOLD = 75;
const WARNING_PII_THRESHOLD = 40;
const CRITICAL_DRIFT_THRESHOLD = 24; // 24시간 이상 이탈 시 Critical

// 초기 상태 설정
const initialData: RiskInputData = { piiLeakageScore: 15, complianceDriftHours: 3 };

/**
 * 주어진 리스크 데이터를 기반으로 시스템적 위험 레벨을 계산합니다.
 * @param data PII Leakage Score와 Compliance Drift Hours를 포함한 데이터 객체
 * @returns RiskLevel Enum 값 (SAFE, WARNING, CRITICAL 중 하나)
 */
const calculateRiskLevel = (data: RiskInputData): RiskLevel => {
  let isCriticalByPii = data.piiLeakageScore >= CRITICAL_PII_THRESHOLD;
  let isWarningByPii = data.piiLeakageScore >= WARNING_PII_THRESHOLD;

  let isCriticalByDrift = data.complianceDriftHours >= CRITICAL_DRIFT_THRESHOLD;
  let isWarningByDrift = data.complianceDriftHours >= 12; // 12시간 이상 경고 레벨

  // Critical 우선순위 체크: PII가 매우 높거나, 드리프트 시간이 임계치를 초과할 경우
  if (isCriticalByPii || isCriticalByDrift) {
    return RiskLevel.CRITICAL;
  }

  // Warning 체크: 둘 중 하나라도 경고 레벨 이상일 경우
  if (isWarningByPii || isWarningByDrift) {
    return RiskLevel.WARNING;
  }

  // 기본적으로 Safe
  return RiskLevel.SAFE;
};

const LossMeterComponent: React.FC = () => {
  const [inputData, setInputData] = useState<RiskInputData>(initialData);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(calculateRiskLevel(initialData));
  const [isLoading, setIsLoading] = useState(false);

  // 사용자 입력 변경 핸들러 (구조적 무결성 확보를 위해 상태 업데이트 시 리스크 재계산)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: number;

    if (name === 'piiLeakageScore') {
      parsedValue = Math.min(Math.max(0, parseFloat(value) || 0), MAX_PII_SCORE);
    } else if (name === 'complianceDriftHours') {
      parsedValue = Math.max(0, parseFloat(value) || 0);
    } else {
      return;
    }

    setInputData(prev => ({ ...prev, [name]: parsedValue }));
  }, []);


  /**
   * '분석 중' 로직 시뮬레이션 (비동기 처리 및 시간적 압박 연출)
   */
  const analyzeRisk = useCallback(async () => {
    setIsLoading(true);
    // 3초 지연을 주어 로딩 상태를 체감하게 만듭니다. [근거: Self-RAG]
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newRiskLevel = calculateRiskLevel(inputData);
    setRiskLevel(newRiskLevel);
    setIsLoading(false);
  }, [inputData]);


  // 리스크 레벨에 따른 스타일 결정 (RedZoneEffect 컴포넌트로 전달)
  const getRiskStyleClass = (level: RiskLevel): string => {
    switch (level) {
      case RiskLevel.CRITICAL: return 'red-zone active'; // Red Zone 활성화 클래스
      case RiskLevel.WARNING: return 'yellow-warning'; // 경고 노란색 클래스
      default: return 'safe-status'; // 안전 녹색 클래스
    }
  };

  return (
    <div className="loss-meter-container">
      <h1>🚨 구조적 리스크 진단 시스템 (Loss Meter)</h1>
      <p>데이터를 입력하고 '진단 시작' 버튼을 눌러 고객의 잠재적 손실액(QLoss)을 확인하십시오.</p>

      {/* 1. 데이터 입력 섹션 */}
      <div className="data-input-section">
        <label htmlFor="piiLeakageScore">PII 누출 점수 (0-{MAX_PII_SCORE}):</label>
        <input
          id="piiLeakageScore"
          name="piiLeakageScore"
          type="range"
          min="0"
          max={MAX_PII_SCORE}
          value={inputData.piiLeakageScore}
          onChange={handleInputChange}
        />
        <span className="score-display">{inputData.piiLeakageScore}%</span>

        <label htmlFor="complianceDriftHours">규정 이탈 시간 (시간):</label>
        <input
          id="complianceDriftHours"
          name="complianceDriftHours"
          type="range"
          min="0"
          max="72" // 3일치 최대값
          step="1"
          value={inputData.complianceDriftHours}
          onChange={handleInputChange}
        />
        <span className="score-display">{inputData.complianceDriftHours}시간</span>
      </div>

      {/* 2. 진단 버튼 및 로딩 상태 */}
      <button onClick={analyzeRisk} disabled={isLoading} className={`analysis-button ${riskLevel === RiskLevel.CRITICAL ? 'critical' : ''}`}>
        {isLoading ? '시스템 분석 중... (3초)' : '진단 시작: 잠재적 손실액 측정'}
      </button>

      {/* 3. 리스크 결과 출력 섹션 */}
      <div className="result-output">
        <h2>📊 진단 결과</h2>
        
        {/* RedZoneEffect 컴포넌트 호출 - 핵심 비주얼 무기 */}
        <RedZoneEffect currentLevel={riskLevel} isLoading={isLoading} />

        <p className={`risk-summary ${getRiskStyleClass(riskLevel)}`}>
          최종 리스크 등급: <strong>{riskLevel.toUpperCase()}</strong>
        </p>
      </div>
    </div>
  );
};

export default LossMeterComponent;
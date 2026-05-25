import React, { createContext, useContext, useState, useCallback } from 'react';

// --- Types 정의: 시스템의 모든 상태를 통제하는 Contract ---
export type SystemLevel = 'SAFE' | 'WARNING' | 'CRITICAL';

interface ReportData {
  riskScore: number; // 0.0 ~ 1.0
  systemLevel: SystemLevel;
  reportDetails: Record<string, string>;
}

interface SystemContextType {
  currentReport: ReportData;
  setSystemState: (score: number, details: Record<string, string>) => Promise<void>; // 비동기 업데이트를 강제함
  isLoading: boolean;
}

// Context 초기화
const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const useSystemContext = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystemContext must be used within a SystemProvider');
  }
  return context;
};

// --- Provider Component: 모든 로직의 중심점 ---
export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentReport, setCurrentReport] = useState<ReportData>({
    riskScore: 0.1, // 기본값은 낮은 위험도로 시작
    systemLevel: 'SAFE',
    reportDetails: { critical_gap: "None", mitigation_required: "None", suggested_action: "" },
  });
  const [isLoading, setIsLoading] = useState(false);

  // 시스템 상태를 비동기적으로 업데이트하는 핵심 함수
  const setSystemState = useCallback(async (score: number, details: Record<string, string>) => {
    setIsLoading(true);
    console.log(`[SYSTEM LOG] Processing new risk score: ${score}`);
    
    // 1. QLoss Score에 따른 시스템 레벨 결정 로직
    let systemLevel: SystemLevel;
    if (score >= 0.8) {
      systemLevel = 'CRITICAL'; // Red Zone
    } else if (score >= 0.4) {
      systemLevel = 'WARNING'; // Yellow/Warning Zone
    } else {
      systemLevel = 'SAFE'; // Green Zone (가짜 안정감)
    }

    // 2. 보고서 데이터 구조화 및 상태 업데이트
    const newReport: ReportData = {
        riskScore: score,
        systemLevel: systemLevel,
        reportDetails: details || { critical_gap: "Analysis Complete.", mitigation_required: "Structural Immunity", suggested_action: "Gold Tier Consultation" }
    };

    // 3. 비동기 처리 시뮬레이션 (API 호출 대기 시간)
    await new Promise(resolve => setTimeout(resolve, 1500)); // 강제적인 체감 지연
    
    setCurrentReport(newReport);
    setIsLoading(false);

  }, []); // 의존성 배열 비워둠: 이 함수는 재정의되지 않음.

  const contextValue = {
    currentReport,
    setSystemState,
    isLoading,
  };

  return (
    <SystemContext.Provider value={contextValue}>
      {children}
    </SystemContext.Provider>
  );
};
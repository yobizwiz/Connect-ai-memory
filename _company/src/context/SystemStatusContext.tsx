import React, { createContext, useContext, useState, useCallback } from 'react';

// 시스템 상태 정의 (Red Zone 강도에 따라 구분)
export type SystemThreatLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'CRITICAL';

// 전역 시스템 상태 구조
interface SystemState {
  threatLevel: SystemThreatLevel;
  isSystemCompromised: boolean; // 시스템 마비 여부 (클라이맥스 실패 플래그)
  errorMessage?: string;      // 발생한 에러 메시지
}

const defaultState: SystemState = {
  threatLevel: 'GREEN',
  isSystemCompromised: false,
};

// Context Value의 명시적인 타입 규격 수립
interface SystemStatusContextType {
  state: SystemState;
  updateThreatLevel: (newLevel: SystemThreatLevel, error?: string) => void;
  triggerFailure: (message: string) => void;
}

// undefined 초기화를 통해 명확한 Provider 결속 여부 점검
export const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined);

// 중복 명명 버그(SystemProvider) 방지를 위해 고유 이름인 SystemStatusProvider로 변경
export const SystemStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SystemState>(defaultState);

  // 시스템 상태 업데이트 함수 (Threat Level 변경)
  const updateThreatLevel = useCallback((newLevel: SystemThreatLevel, error?: string) => {
    setState(prevState => ({ 
      ...prevState, 
      threatLevel: newLevel, 
      errorMessage: error,
      isSystemCompromised: false // 기본적으로는 마비 상태가 아님
    }));
  }, []);

  // 핵심 함수: 시스템적 실패 발생 처리 (클라이맥스)
  const triggerFailure = useCallback((message: string) => {
    console.error("SYSTEM FAILURE DETECTED:", message);
    setState(prevState => ({ 
      ...prevState, 
      isSystemCompromised: true, // ★ 마비 플래그 설정
      errorMessage: `[ERROR CODE ${Date.now() % 1000}]: 시스템 무결성 손상 감지. 더 이상의 데이터 처리는 불가능합니다.`,
      threatLevel: 'CRITICAL' // 최고 위험 단계로 강제 전환
    }));
  }, []);

  return (
    <SystemStatusContext.Provider value={{ state, updateThreatLevel, triggerFailure }}>
      {children}
    </SystemStatusContext.Provider>
  );
};

// Safe Context Hook Guard 적용
export const useSystemStatus = () => {
  const context = useContext(SystemStatusContext);
  if (!context) {
    throw new Error('useSystemStatus must be used within a SystemStatusProvider');
  }
  return context;
};
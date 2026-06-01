// 전역 상태 관리 Context 정의 및 로직 구현 (핵심)
import React, { createContext, useState, useContext, useCallback } from 'react';
import { DiagnosticQuestion, FormData, FunnelState, DiagnosisContextType } from '../types/diagnostic-types';

// Mock Question Data: Researcher가 제공한 데이터를 기반으로 초기 가중치 설정.
const initialQuestions: DiagnosticQuestion[] = [
    { id: 'q1', title: 'Provenance Mandate Failure', description: 'LLM 결과물 출처 증명 사슬 구축 여부.', riskWeight: 0.3 }, // 가장 중요
    { id: 'q2', title: 'Data Leakage Protocol', description: '민감 정보의 전송/저장 프로토콜 준수 여부.', riskWeight: 0.25 },
    { id: 'q3', title: 'Cross-Border Compliance', description: '국가 간 규제 변화에 대한 선제적 대응 능력.', riskWeight: 0.15 },
    { id: 'q4', title: 'Internal Audit Trail', description: '모든 의사결정의 감사 추적성 확보 여부.', riskWeight: 0.2 },
];

const DiagnosisContext = createContext<DiagnosisContextType | undefined>(undefined);

export const useDiagnosisContext = () => {
    const context = useContext(DiagnosisContext);
    if (!context) {
        throw new Error('useDiagnosisContext must be used within a DiagnosisProvider');
    }
    return context;
};

export const DiagnosisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [formData, setFormData] = useState<FormData>({});
    const [funnelState, setFunnelState] = useState<FunnelState>('INITIAL');

    // ⭐️ 핵심 로직: L_totalMax 실시간 계산 함수 (Defensive Coding 적용)
    const calculateAndSetLTotalMax = useCallback(() => {
        let totalScore = 0;
        // 현재 입력된 모든 답변을 순회하며 리스크 점수 합산
        initialQuestions.forEach(q => {
            const score = formData[q.id] ?? null;
            if (typeof score === 'number' && !isNaN(score)) {
                totalScore += score * q.riskWeight; // 가중치 적용
            } else {
                // 답변 누락 시 페널티 로직 추가 가능 (추가 개선 필요)
            }
        });

        // L_totalMax 점수를 0에서 100 사이로 스케일링 및 클램핑.
        const scaledScore = Math.min(100, Math.max(0, parseFloat(totalScore.toFixed(2))));

        console.log(`[DEBUG] Recalculated L_totalMax: ${scaledScore}`);
        // 실제 Context State에 점수를 저장하는 로직이 필요하지만, 여기서는 예시로 console 로그만 남김.
    }, [formData]);


    // 답변 업데이트 핸들러 (안전성 확보)
    const updateAnswer = useCallback((id: string, score: number) => {
        setFormData(prev => ({ ...prev, [id]: score }));
        calculateAndSetLTotalMax(); // 답변 변경 시 즉시 재계산
    }, [calculateAndSetLTotalMax]);

    // ⭐️ 최종 제출 로직 (Funneling Trigger)
    const handleSubmit = useCallback(async (): Promise<boolean> => {
        // 1. 모든 필수 필드가 채워졌는지 검증
        let allComplete = true;
        initialQuestions.forEach(q => {
            if ((typeof formData[q.id] === 'undefined' || formData[q.id] === null) && q.riskWeight > 0) {
                allComplete = false;
            }
        });

        if (!allComplete) {
            alert("경고: 진단 리포트를 제출하려면 모든 필수 질문에 답변해야 합니다.");
            return false; // Funneling 실패
        }

        // 2. L_totalMax 값 확인 (예: 점수가 특정 임계치 미만이면 경고 메시지 표시)
        if (parseFloat(useDiagnosisContext().lTotalMaxScore) > 85) {
             console.warn("L_totalMax가 매우 높습니다. 즉각적인 조치가 필요합니다.");
        }

        // 3. Funneling State 전환: 결제 모달 배리어 진입
        setFunnelState('FUNNELING_PAYWALL');
        return true; // 성공적으로 Funneling 시작
    }, [formData, calculateAndSetLTotalMax]);


    const contextValue = {
        formData,
        lTotalMaxScore: 0.0, // Context 내부에서 점수 관리가 필요함.
        funnelState,
        updateAnswer,
        calculateAndSetLTotalMax,
        handleSubmit,
    };

    return (
        <DiagnosisContext.Provider value={contextValue}>
            {children}
        </DiagnosisContext.Provider>
    );
};
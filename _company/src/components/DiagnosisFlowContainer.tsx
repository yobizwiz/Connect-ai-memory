import React, { useState, useCallback } from 'react';
import axios from 'axios'; // API 호출 시뮬레이션용
import { RiskScoreData } from '../lib/api/riskService'; // 가상의 타입 임포트
import TREScoreDisplay from './TREScoreDisplay';

// --- [가상 API 함수] ---
// 실제 추적 시스템에 연결되는 로직을 모킹합니다.
const trackAttentionPoint = async (stage: 'CLICK' | 'SCROLL_STOP') => {
    console.log(`[TRACKING]: User attention logged at stage: ${stage}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // API 호출 지연 시뮬레이션
};

// --- [진단 로직] ---
/**
 * 비동기적으로 리스크를 계산하고 상태를 Paywall로 전환하는 메인 워크플로우.
 * @param initialData 사용자가 입력한 초기 진단 데이터
 */
const calculateRiskAndAdvance = async (initialData: any) => {
    console.log("Diagnosis Flow Started...");

    // 1. [ATTENTION POINT 로깅] 버튼 클릭 시점 기록
    await trackAttentionPoint('CLICK');

    // 2. [강제 지연 및 긴장감 조성] 사용자가 결과를 기다리게 만듭니다 (3초).
    console.log("Analyzing data... Please wait.");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. 리스크 계산 서비스 호출 (가정: riskService가 이 역할을 수행)
    const calculatedData = await calculateRiskFromService(initialData); // 실제 서비스 호출 모킹
    return calculatedData;
};


// --- [State Machine Component] ---
export const DiagnosisFlowContainer: React.FC<{ initialInput: any }> = ({ initialInput }) => {
    const [riskResult, setRiskResult] = useState<RiskScoreData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPaywalled, setIsPaywalled] = useState(false);

    /**
     * 진단 요청 버튼 클릭 핸들러. 상태 머신을 구동합니다.
     */
    const handleDiagnosisRequest = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        setRiskResult(null);
        setIsPaywalled(false);

        try {
            // 1. 비동기 리스크 계산 및 흐름 진행
            const result = await calculateRiskAndAdvance(initialInput);

            // 2. 결과 수신 및 상태 업데이트
            setRiskResult(result);

            // 3. Paywall 결정 로직 (가정: TRE 점수가 임계치를 넘으면 강제 전환)
            if (result && result.treScore > 75) { // 가상의 위험 임계값
                setIsPaywalled(true);
            } else {
                 alert("진단 완료! 리스크는 낮습니다. 다음 단계로 진행하세요.");
                 // 실제로는 여기서 다음 페이지로 이동하거나, 다른 액션을 취해야 함
            }

        } catch (error) {
            console.error("Diagnosis failed:", error);
            setRiskResult(null); // 실패 시 결과 초기화
        } finally {
            setIsLoading(false);
        }
    }, [initialInput]);


    // ----------------- UI 렌더링 -----------------

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="loading-state">
                    {/* Red Zone 애니메이션과 함께 로딩 인디케이터를 보여줘야 함 */}
                    <h2 className="neon-red text-xl animate-pulse">⚠️ 데이터 구조 분석 중...</h2>
                    <p>시스템이 당신의 잠재적 위험 노출도를 계산하고 있습니다. 이 과정은 최소 3초가 소요됩니다.</p>
                </div>
            );
        }

        if (isPaywalled) {
            return <div className="paywall-state"><h3>🚨 Critical Alert: Structural Integrity Compromised!</h3><p>이 수준의 리스크는 자가 진단만으로는 해결할 수 없습니다. 전문 컨설팅(Survival Insura)이 필요합니다.</p><button className="authority-blue">솔루션 구매하기</button></div>;
        }

        if (riskResult) {
            return <TREScoreDisplay data={riskResult} />; // 계산된 결과를 보여줌
        }

        // 초기 상태
        return <div>진단 시작 전입니다. 필요한 정보를 입력해 주세요.</div>;
    };


    return (
        <div className="diagnosis-flow">
            <h1>구조적 위험 진단 요청</h1>
            <button 
                onClick={handleDiagnosisRequest} 
                disabled={isLoading}
                className={`cta-button ${!isLoading ? 'authority-blue' : 'disabled'}`}
            >
                {isLoading ? '진행 중...' : '무료 구조적 위험 진단 요청하기'}
            </button>

            <div className="result-area mt-8">
                {renderContent()}
            </div>
        </div>
    );
};

// --- [가정된 보조 함수] ---
const calculateRiskFromService = async (data: any): Promise<RiskScoreData> => {
    // 실제 riskService.ts의 로직을 비동기적으로 모킹하여 실행한다고 가정합니다.
    return new Promise(resolve => setTimeout(() => resolve({ treScore: Math.floor(Math.random() * 100), details: "Test Data" }), 500));
}

// 가상의 타입 정의 (src/lib/api/riskService.ts에서 가져왔다고 가정)
export interface RiskScoreData {
    treScore: number; // Total Risk Exposure Score (0-100)
    details: string;
}
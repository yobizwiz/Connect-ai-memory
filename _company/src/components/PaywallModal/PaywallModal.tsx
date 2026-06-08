import React, { useState, useEffect } from 'react';
// Mock API를 사용한다고 가정합니다. 실제로는 Context 또는 Service Layer에서 주입받습니다.
import * as api from '../../services/riskApi'; 

interface PaywallProps {
    onDiagnosisComplete: () => void; // 진단 완료 시 부모에게 알리는 핸들러
}

const PaywallModal: React.FC<PaywallProps> = ({ onDiagnosisComplete }) => {
    // 상태 관리 개선: 로딩, 성공, 실패(API/데이터), 비활성화 등 명시적 상태 사용
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [riskData, setRiskData] = useState<{ currentLevel: string; maxLoss: number } | null>(null);

    useEffect(() => {
        // 컴포넌트 마운트 시 진단 결과 데이터를 불러오는 로직 (State Transition의 시작점)
        const fetchAndAnalyze = async () => {
            setIsLoading(true);
            setErrorDetails(null);
            try {
                // 1. 핵심 API 호출: 손실 지표를 비동기적으로 가져옵니다.
                const data = await api.fetchLossMetrics(); 
                
                if (!data || !data.maxLoss) {
                    throw new Error("데이터 누락 오류: 최대 예상 손실액(L_max)을 확인할 수 없습니다.");
                }

                // 2. 데이터 검증 및 상태 업데이트
                setRiskData({ currentLevel: data.currentLevel, maxLoss: data.maxLoss });
                setIsError(false);

            } catch (e) {
                // API 호출 실패 또는 데이터 파싱 오류 처리
                console.error("Paywall Modal 로드 중 치명적 오류 발생:", e);
                setErrorDetails(`시스템 연결 장애 또는 데이터 무결성 문제: ${e instanceof Error ? e.message : '알 수 없는 오류'}. 잠시 후 다시 시도해주세요.`);
                setIsError(true);

            } finally {
                // 로딩 종료 및 상태 정리 (최소 지연 시간 포함)
                setTimeout(() => setIsLoading(false), 1500); 
            }
        };

        fetchAndAnalyze();
    }, [onDiagnosisComplete]);


    // 결제 시도 핸들러
    const handlePurchaseAttempt = async () => {
        if (isLoading || isError) return; // 로딩 중이거나 에러 상태면 구매 불가

        try {
            // 실제 결제 게이트웨이 API 호출 Mock
            await api.processPayment('dummy_token'); 
            alert("✅ 성공! 시스템 무결성 확보 완료.");
            onDiagnosisComplete(); // 목표 달성 -> 다음 단계로 이동
        } catch (e) {
            console.error("결제 실패:", e);
            // 결제 실패 시, 사용자에게 재정적 위협을 다시 상기시키는 UX가 필요함
            alert("❌ 결제 게이트웨이 오류: 시스템 무효화 위험 회피 조치에 실패했습니다. 관리자에게 문의하십시오.");
        }
    };

    if (isLoading) {
        return <div className="modal-overlay">데이터를 로드하며, 귀사의 리스크 레벨을 분석 중입니다... ⚙️</div>;
    }

    // --- [시스템적 위기 경고 블루프린트] 구현 영역 ---
    if (isError && errorDetails) {
        return (
            <div className="modal-overlay paywall-error-state">
                <div className="warning-container red-zone-alert">
                    <h1>🛑 시스템 무결성 검증 실패</h1>
                    <p>경고: 현재 데이터 흐름에 **치명적인 구조적 결함**이 감지되었습니다. ({errorDetails})</p>
                    <small>* 이는 임시 오류가 아닙니다. 즉각적인 전문 진단(유료)을 통해서만 해결 가능합니다.</small>
                </div>
            </div>
        );
    }

    // 성공적으로 데이터 로드 되었으나, 구매를 유도하는 메인 Paywall UI
    if (riskData) {
        const { currentLevel, maxLoss } = riskData;
        return (
            <div className="modal-overlay paywall-success-state">
                <div className={`paywall-container ${currentLevel.toLowerCase()}-zone`}>
                    <h2>⚠️ [🚨 시스템 위협 경고]</h2>
                    <p>귀사의 현재 리스크 레벨은 **{currentLevel}**로 진단되었습니다.</p>
                    <p className="danger-text">방치 시 예상되는 최대 재무 손실액($L_{max}$): <span style={{ color: 'red' }}>${maxLoss.toLocaleString()}</span></p>
                    
                    <div className="cta-group">
                        <button 
                            className="btn btn-primary" 
                            onClick={handlePurchaseAttempt}
                        >
                            ✅ 즉시 시스템 무결성 확보 및 방어막 구축 (진단 보고서 다운로드)
                        </button>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => alert("추가 정보 요청...")}
                        >
                            정보 문의 (Free Consultation)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <div className="modal-overlay">진단 결과를 불러오는 중입니다... ⏳</div>;
};

export default PaywallModal;
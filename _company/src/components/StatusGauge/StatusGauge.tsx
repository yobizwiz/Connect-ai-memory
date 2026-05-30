import React, { useState, useEffect, useCallback } from 'react';
import { calculateComplexityScore, fetchMasterRiskDataset, ComplexityScore } from '../../utils/complexity-calculator';
import './StatusGauge.css'; // 글리치 효과를 위한 CSS 파일

/**
 * @description M_Complexity 점수를 시각화하고 Paywall 진입 게이트 역할을 하는 컴포넌트.
 */
const StatusGauge: React.FC = () => {
    // 상태 관리: 로딩 -> 데이터 보유 (점수) -> 오류
    const [score, setScore] = useState<ComplexityScore | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * @description 데이터를 불러오고 점수를 계산하는 핵심 핸들러.
     */
    const loadRiskData = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. 데이터 로드 (Mock API 호출)
            const dataset = await fetchMasterRiskDataset();

            // 2. 점수 계산 로직 실행
            const calculatedScore = calculateComplexityScore(dataset);
            setScore(calculatedScore);

        } catch (error) {
            console.error("❌ [Fatal Error] 리스크 데이터 처리 중 치명적인 오류가 발생했습니다.", error);
            // 에러 상태를 명시적으로 관리하여 UI에 표시해야 함.
            setScore({ value: 0, isCritical: false, message: "시스템 아키텍처 초기화 실패." });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRiskData();
    }, [loadRiskData]);

    // --- 렌더링 로직 분리 (가독성과 유지보수성 향상) ---

    const renderGaugeContent = () => {
        if (isLoading) {
            return <div className="loading-state">데이터 로딩 중... 시스템 점검을 위해 대기해주세요.</div>;
        }
        if (!score) {
             return <div className="error-state">점수 계산에 실패했습니다. 로그를 확인해주세요.</div>;
        }

        // 핵심: isCritical 상태에 따라 클래스 이름 변경 및 글리치 효과 적용
        const gaugeClassName = `status-gauge ${score.isCritical ? 'critical' : score.value > 0.5 ? 'warning' : 'stable'}`;

        return (
            <div className={gaugeClassName}>
                <h2>M_Complexity 점수: {`${score.value * 100}%`}</h2>
                <p className={`message ${score.isCritical ? 'alert-red' : ''}`}>{score.message}</p>
                <div className="gauge-details">
                    {/* 여기에 그래프와 같은 복잡한 시각화 컴포넌트가 붙을 예정입니다. */}
                    <p>현재 리스크 상태: {score.isCritical ? "🔴 구조적 재앙 임박" : score.value > 0.5 ? "🟠 주의 단계" : "🟢 안정 범위"}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="status-gauge-container">
            <h1>ระบบ Health Check: M_Complexity Audit</h1>
            {renderGaugeContent()}
            
            {/* Paywall 진입 게이트 뼈대 */}
            <button 
                className={`paywall-cta ${score?.isCritical ? 'active-red' : ''}`} 
                onClick={() => {
                    if (score && score.isCritical) {
                        alert("🚨 경고! 시스템 점검이 필수입니다. Paywall로 이동합니다.");
                        // 실제로는 라우터 변경 및 결제 모달 오픈 로직 구현
                    } else if (score) {
                         alert(`시스템 안정적입니다. ${Math.round(score.value * 100)}% 수준으로 진입 가능.`);
                    }
                }}
            >
                {score?.isCritical ? "🔴 [운영 중단] 즉시 보험 가입 필요" : score ? "✅ 다음 단계 진행 (진단 보고서 구매)" : "대기"}
            </button>
        </div>
    );
};

export default StatusGauge;
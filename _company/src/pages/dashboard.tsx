import React, { useEffect } from 'react';
import RiskAlertDisplay from '../components/RiskAlertDisplay';
import { useTarsContext } from '../context/riskContext';
import { RiskInputs } from '../services/riskCalculationService';

const Dashboard: React.FC = () => {
    const { currentRiskScore, calculateTars } = useTarsContext();

    // 컴포넌트 마운트 시점에 초기 TARS 점수 계산을 강제 실행합니다.
    useEffect(() => {
        console.log("--- [Dashboard] Initializing TARS Calculation ---");
        const initialInputs: RiskInputs = {
            initialTRE: 50, // Mock Value
            estimatedDays: 30, // Mock Value: 한 달 경과 예상 시나리오
            alphaMultiplier: 1.2,
            betaMultiplier: 0.8,
            gammaMultiplier: 0.5
        };

        // 초기 실행을 통해 상태를 'NORMAL'에서 'CRITICAL'로 강제 이동시켜 테스트합니다.
        calculateTars(initialInputs);
    }, [calculateTars]);


    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-extrabold mb-6 border-b-2 border-red-700 pb-2">🛡️ 시스템 아키텍처 대시보드</h1>

            {/* 🔴 TARS 경고 컴포넌트 (가장 먼저 노출되어야 할 곳) */}
            <RiskAlertDisplay />

            {/* 나머지 핵심 기능 영역 */}
            <div className="grid grid-cols-2 gap-6 mt-10">
                <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
                    <h3 className="text-xl font-semibold text-red-400 mb-3">📊 리스크 데이터 분석</h3>
                    <p>여기에 TARS 기반의 세부 지표(예: 법규 변화 민감도 그래프)가 표시됩니다.</p>
                </div>
                <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
                    <h3 className="text-xl font-semibold text-red-400 mb-3">📈 대응 시뮬레이션</h3>
                    <button 
                        onClick={() => {
                            // 사용자 액션을 통해 TARS 재계산 로직 호출 (예: "리스크 감소 조치 시행")
                            const inputsMock2: RiskInputs = { initialTRE: 50, estimatedDays: 15, alphaMultiplier: 1.0, betaMultiplier: 0.6, gammaMultiplier: 0.4 };
                            calculateTars(inputsMock2);
                        }}
                        className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition"
                    >
                        [시뮬레이션] 리스크 완화 조치 시행 (15일 예측)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
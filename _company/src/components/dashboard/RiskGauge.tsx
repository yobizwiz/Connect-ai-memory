import React, { useState, useEffect } from 'react';

// --- 🚨 Type Definitions (TypeScript Strictness) ---
interface RiskScoresData {
    data_sovereignty_index_dsi: number;
    structural_gap_risk_sgr: number;
    compliance_violation_potential_cvp: number;
    timestamp: string;
}

// API 호출을 시뮬레이션하는 함수 (실제로는 axios 등을 사용)
const fetchRiskData = async (): Promise<RiskScoresData> => {
    console.log("Fetching risk data from backend stub...");
    // 실제 환경에서는 /api/v1/risk-coefficients 엔드포인트로 POST 요청을 보냅니다.
    // 여기서는 로컬 시뮬레이션 데이터와 가짜 API 호출 지연 시간을 사용합니다.
    await new Promise(resolve => setTimeout(resolve, 800));

    // 테스트용 더미 데이터를 반환 (실제 서버 연동 시 삭제 필요)
    return {
        data_sovereignty_index_dsi: Math.random() * 50 + 30, // 30 ~ 80 사이의 점수
        structural_gap_risk_sgr: Math.random() * 40 + 10,  // 10 ~ 50 사이의 점수
        compliance_violation_potential_cvp: Math.random() * 60 + 20, // 20 ~ 80 사이의 점수
        timestamp: new Date().toLocaleTimeString(),
    };
};

/**
 * @component RiskGauge
 * R_Future 기반 예측 위험 지수를 시각화하는 대시보드 컴포넌트.
 * Glassmorphism 및 애니메이션을 적용하여 '경고' 메시지 전달력을 높입니다.
 */
const RiskGauge: React.FC = () => {
    const [riskData, setRiskData] = useState<RiskScoresData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 데이터 로딩 및 업데이트 이펙트 (5초마다 자동 재갱신)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchRiskData();
                setRiskData(data);
            } catch (e) {
                console.error("Failed to fetch risk data:", e);
                setError("데이터 로딩에 실패했습니다. API 연결을 확인하세요.");
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // 초기 로드
        const intervalId = setInterval(fetchData, 5000); // 5초마다 업데이트
        return () => clearInterval(intervalId); // 클린업 함수
    }, []);

    // 컴포넌트 렌더링 로직
    if (loading) {
        return <div className="p-6 bg-white/30 backdrop-blur-lg rounded-xl shadow-2xl border border-blue-500/30 flex justify-center items-center h-full">데이터 로딩 중... ⚙️</div>;
    }

    if (error) {
        return <div className="p-6 bg-red-700/30 backdrop-blur-lg rounded-xl shadow-2xl border border-red-500/50 text-white">{error}</div>;
    }

    // 점수별 경고 레벨 결정 로직 (규제에 기반한 공포 조성)
    const getLevel = (score: number): 'Low' | 'Medium' | 'High' => {
        if (score > 70) return 'High'; // 임계점 설정
        if (score > 45) return 'Medium';
        return 'Low';
    };

    const renderGauge = (title: string, score: number): React.ReactElement => {
        const level = getLevel(score);
        let colorClass = '';
        let statusText = '';
        if (level === 'High') {
            colorClass = 'text-red-600 bg-red-500/10';
            statusText = '🚨 임계치 초과 - 즉각적 대응 필요!';
        } else if (level === 'Medium') {
            colorClass = 'text-yellow-600 bg-yellow-500/10';
            statusText = '⚠️ 주의 단계 - 모니터링 강화 필요.';
        } else {
            colorClass = 'text-green-600 bg-green-500/10';
            statusText = '✅ 안정적 - 현행 유지 가능 범위 내.';
        }

        return (
            <div key={title} className="p-4 flex flex-col items-center border-r border-gray-600 last:border-r-0">
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <div className={`text-5xl font-extrabold transition-all duration-1000 ${colorClass}`}>
                    {score.toFixed(2)}
                </div>
                <p className={`mt-1 px-3 py-1 rounded text-sm font-medium ${colorClass} ${level === 'High' ? 'text-red-400' : level === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {statusText}
                </p>
            </div>
        );
    };

    return (
        <div className="bg-white/15 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-blue-500/30 w-full">
            <h2 className="text-2xl font-bold text-white mb-4 tracking-wider">
                🔮 R_Future 예측 위험 계수 (Predictive Risk Coefficients)
            </h2>
            <p className="text-sm text-gray-300 mb-6">
                (최종 업데이트: {riskData?.timestamp || 'N/A'})
            </p>

            {/* Gauge Container */}
            <div className="flex justify-between space-x-4">
                {renderGauge("데이터 주권 위반 지수 (DSI)", riskData?.data_sovereignty_index_dsi)}
                {renderGauge("구조적 공백 리스크 (SGR)", riskData?.structural_gap_risk_sgr)}
                {renderGauge("규정 준수 잠재력 (CVP)", riskData?.compliance_violation_potential_cvp)}
            </div>

             <div className="mt-6 text-right text-xs text-gray-400">
                * 이 점수는 실시간 데이터 변동성 및 글로벌 규제 변화를 기반으로 예측됩니다.
            </div>
        </div>
    );
};

export default RiskGauge;
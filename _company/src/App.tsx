import React, { useState } from 'react';
import RiskScoreGauge from './components/RiskScoreGauge';
import CriticalStateBarrierModal from './components/CriticalStateBarrierModal';
import { useRiskEngine } from './hooks/useRiskEngine';
import { RiskParameters } from './types/risk-types';

// L_max 임계값 정의 (여기서 시스템 설정을 가져와야 함)
const MAX_RISK_THRESHOLD = 150.0; // $L_{max}$를 150으로 가정합니다.

const App: React.FC = () => {
    // 훅을 초기화하여 실시간 리스크 점수 계산 시작
    const riskParams: RiskParameters = {
        lMaxThreshold: MAX_RISK_THRESHOLD,
        initialScore: 25.0 // 초기점수는 안전한 수준으로 설정
    };

    const { isCritical, currentScore } = useRiskEngine(riskParams);
    
    // Critical State 여부에 따라 Modal의 열림 상태를 결정합니다. (핵심 로직)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // 리스크 점수가 임계값을 넘었는지 감지하여 모달을 강제 오픈하는 Effect (실제로는 API 콜 후 처리 필요)
    React.useEffect(() => {
        if (riskParams.lMaxThreshold > 0 && isCritical && !isModalOpen) {
            console.warn("🚨 [SYSTEM ALERT] L_max 임계값 돌파 감지! Paywall Barrier 활성화.");
            setIsModalOpen(true);
        } else if (!isCritical && isModalOpen) {
             // 점수가 안전해지면 모달을 닫는 로직 (옵션)
             // setIsModalOpen(false); 
        }
    }, [isCritical, riskParams.lMaxThreshold]);


    const handleCloseModal = () => {
        // Modal에서 버튼 클릭 후 호출되며, 결제가 이루어지지 않았을 경우의 폴백 로직 처리
        alert("🚨 경고: 보고서 구매가 완료되지 않아 서비스 접근이 제한됩니다.");
        setIsModalOpen(false);
    };


    return (
        <div style={{ padding: '50px', fontFamily: 'Inter, sans-serif' }}>
            <h1>yobizwiz 시스템 리스크 대시보드</h1>
            <p>시스템 상태를 실시간으로 모니터링하며 $L_{max}$ 임계값 도달 여부를 테스트합니다.</p>
            
            {/* 1. 리스크 게이지 컴포넌트 */}
            <div style={{ maxWidth: '600px', margin: '40px auto' }}>
                <RiskScoreGauge params={riskParams} />
            </div>

            {/* 2. Paywall Barrier Modal (상태에 의해 제어됨) */}
            <CriticalStateBarrierModal 
                isOpen={isModalOpen} 
                onCloseAction={handleCloseModal} 
            />
        </div>
    );
};

export default App;
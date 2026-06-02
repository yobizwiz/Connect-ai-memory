import React, { useState } from 'react';
import PaywallBarrierMock from './components/PaywallBarrierMock';

const App: React.FC = () => {
    // 🧪 시나리오 제어용 상태 (테스트 편의를 위해)
    const [mockRiskData, setMockRiskData] = useState<RiskData>({ treScore: 50 }); // 초기값: 안전함

    const handleRiskChange = (score: number) => {
        setMockRiskData({ treScore: score });
    };

    return (
        <div>
            <h1>yobizwiz - 시스템 위험 진단 대시보드</h1>
            <div style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
                <p>Mock $\text{TRE}$ 점수 제어:</p>
                <button onClick={() => handleRiskChange(50)}>✅ 안전 영역 (Score 50)</button>
                <button style={{marginLeft: '20px'}} onClick={() => handleRiskChange(92)}>🚨 위험 임계치 초과 (Score 92)</button>
            </div>

            {/* Paywall 컴포넌트가 여기에 마운트됨 */}
            <PaywallBarrierMock riskData={mockRiskData} />
        </div>
    );
};

export default App;
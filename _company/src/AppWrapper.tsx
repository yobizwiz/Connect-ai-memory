import React from 'react';
// 🚀 핵심 컴포넌트 임포트
import PanicGateProvider, { useRiskContext } from './context/RiskContext';
import AlertOverlay from './components/AlertOverlay';
import RiskDiagnosticTool from './components/RiskDiagnosticTool';

const AppContent: React.FC = () => {
    // Context를 사용해 현재 상태를 감지하고 Overlay의 가시성을 결정합니다.
    const { status } = useRiskContext();

    return (
        <div style={{ minHeight: '100vh', padding: '20px' }}>
            <h1>yobizwiz System Diagnostic Dashboard</h1>
            {/* 🛠️ 실제 비즈니스 로직과 진단 도구를 배치합니다. */}
            <RiskDiagnosticTool />
            <p style={{ marginTop: '50px', color: '#666' }}>이 영역은 일반적인 웹 콘텐츠가 표시되는 곳입니다.</p>
        </div>
    );
};

const AppWrapper: React.FC = () => {
    return (
        // 👑 모든 애플리케이션을 PanicGateProvider로 감싸서 전역 상태를 제어합니다.
        <PanicGateProvider>
            {/* AlertOverlay는 항상 최상위에 배치되어야 합니다. */}
            <AlertOverlay isVisible={useRiskContext()?.status === 'CRITICAL' || useRiskContext()?.status === 'PAYWALL_ACTIVE'} />
            <AppContent />
        </PanicGateProvider>
    );
};

export default AppWrapper;
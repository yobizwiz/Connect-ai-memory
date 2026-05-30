/**
 * @fileoverview 메인 앱 진입점 (Root Component).
 * PaywallProvider로 FunnelComponentMockup을 감싸서 전역 상태 관리를 활성화합니다.
 */
import React from 'react';
import { PaywallProvider } from './context/PaywallContext';
import FunnelComponentMockup from './components/FunnelComponentMockup';

const App: React.FC = () => {
    return (
        <div className="App">
            {/* 🚨 모든 컴포넌트를 Provider로 감싸서 전역 상태(State)를 공급합니다. */}
            <PaywallProvider>
                <FunnelComponentMockup />
            </PaywallProvider>
        </div>
    );
};

export default App;
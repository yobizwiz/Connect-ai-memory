import React from 'react';
import { PaywallEngine } from '../components/PaywallEngine';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            {/* 메인 엔진 컴포넌트 배치 */}
            <PaywallEngine />
        </div>
    );
};

export default LandingPage;
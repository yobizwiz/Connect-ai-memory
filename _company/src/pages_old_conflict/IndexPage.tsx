import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useMockRiskStream } from '../services/useMockRiskStream';

/**
 * @component IndexPage
 * 실제 애플리케이션의 메인 진입점 역할을 하며, 리스크 스트림을 훅으로 관리하고 하위 컴포넌트에 전달합니다.
 */
const IndexPage: React.FC = () => {
    // 핵심 로직 호출: Mock API Stream 데이터 가져오기
    const riskData = useMockRiskStream();

    return (
        <div className="font-sans">
            {/* 리스크 데이터를 DashboardLayout에 전달 */}
            <DashboardLayout data={riskData} />
        </div>
    );
};

export default IndexPage;
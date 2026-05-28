import React from 'react';
import StatusGauge from './StatusGauge';
import { CombinedDashboardData } from '../services/riskTypes';

/**
 * @component DashboardLayout
 * 리스크 대시보드의 전체 구조를 정의하고, 상태 변화에 따른 인터랙티브 경험을 제공합니다.
 */
const DashboardLayout: React.FC<{ data: CombinedDashboardData | null }> = ({ data }) => {
    if (!data) {
        return <div className="text-center py-10 text-gray-500">Loading system metrics...</div>;
    }

    // 데이터가 존재하는 경우에만 렌더링 로직 실행
    const { status, level, treValue, pigScore, arsIndex, cdrRatio, ailFactor, ksdDeviation, message, isGlitchActive, stateLog } = data;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <header className="mb-12 border-b pb-6">
                <h1 className={`text-4xl font-extrabold ${status === 'CRITICAL' ? 'text-red-700 drop-shadow-lg' : 'text-gray-800'}`}>
                    YOBIZWIZ :: 실시간 위험 대시보드 (Structural Integrity Check)
                </h1>
                <p className="mt-2 text-xl text-gray-600">
                    현재 시스템의 구조적 생존 위협(Systemic Survival Threat)을 추적합니다.
                </p>
            </header>

            {/* 1. 핵심 리스크 게이지 (가장 중요, 중앙 배치) */}
            <div className="mb-12 max-w-4xl mx-auto">
                <StatusGauge data={data} />
            </div>

            {/* 2. KPI 패널: 구조적 지표 상세 분석 */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
                {/* KPI 컴포넌트 (재활용 가능하도록 설계) */}
                <div className={`p-6 rounded-lg shadow-md transition-all duration-500 ${level === 3 ? 'bg-red-900/70 border-l-4 border-red-500' : 'bg-white border-l-4 border-blue-500'}`}>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Potential Impact Gap Score (PIG)</h4>
                    <p className="text-3xl font-bold mt-1">{Math.round(pigScore)} / 100</p>
                    <p className='text-sm text-gray-600'>시스템의 잠재적 손실 공백 크기.</p>
                </div>
                 <div className={`p-6 rounded-lg shadow-md transition-all duration-500 ${level === 3 ? 'bg-red-900/70 border-l-4 border-red-500' : 'bg-white border-l-4 border-blue-500'}`}>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Attack Resilience Score (ARS)</h4>
                    <p className="text-3xl font-bold mt-1">{Math.round(arsIndex)} / 100</p>
                    <p className='text-sm text-gray-600'>외부 위협에 대한 시스템의 복원력.</p>
                </div>
                 <div className={`p-6 rounded-lg shadow-md transition-all duration-500 ${level === 3 ? 'bg-red-900/70 border-l-4 border-red-500' : 'bg-white border-l-4 border-blue-500'}`}>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Compliance Deviation Ratio (CDR)</h4>
                    <p className={`text-3xl font-bold mt-1 ${cdrRatio > 0.8 ? 'text-red-600' : 'text-green-600'}`}>{Math.round(cdrRatio * 100)}%</p>
                    <p className='text-sm text-gray-600'>규정 준수율 이탈 정도.</p>
                </div>
            </section>

             {/* 3. 상태 변화 로그 (Audit Trail) */}
            <section className="max-w-5xl mx-auto mt-12 p-8 bg-white shadow-lg rounded-xl">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-700">Audit Log: 구조적 변화 기록</h2>
                <p className="mb-3 text-sm italic text-gray-500">
                    이 로그는 시스템의 모든 주요 상태 변화를 추적합니다. (Immutable Ledger 원칙)
                </p>
                <div className={`p-4 rounded ${status === 'CRITICAL' ? 'bg-red-100 border-l-4 border-red-500' : status === 'WARNING' ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'bg-green-100 border-l-4 border-green-500'} transition-all`}>
                    <p className="font-semibold text-lg mb-1">{status} Zone 진입/유지</p>
                    <p className='text-sm'>[${stateLog.timestamp}] ${stateLog.previousStatus ? `(Prev: ${stateLog.previousStatus})` : ''} $\to$ **${stateLog.newStatus}** | Trigger: ${stateLog.triggerReason}</p>
                </div>
            </section>

        </div>
    );
};

export default DashboardLayout;
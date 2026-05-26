/**
 * @fileoverview RedZoneDisplay component: 위험 레벨에 따른 시각적 경고 UI를 담당합니다.
 * 핵심 컴포넌트이며, 공포감을 극대화하는 역할을 수행해야 합니다.
 */

import React from 'react';
import { RiskReport } from '@/hooks/useRiskDiagnosis'; // 경로 조정 필요

interface RedZoneDisplayProps {
    report: RiskReport;
}

const getRedZoneStyles = (level: RiskReport['riskLevel']): { bg: string, color: string, glow: string } => {
    switch (level) {
        case 'Critical':
            return { bg: 'bg-red-900/70', color: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(255,0,0,0.8)]' };
        case 'High':
            return { bg: 'bg-yellow-900/60', color: 'text-yellow-400', glow: 'shadow-[0_0_15px_rgba(255,165,0,0.7)]' };
        case 'Medium':
            return { bg: 'bg-blue-900/50', color: 'text-blue-300', glow: 'shadow-[0_0_10px_rgba(54,163,239,0.5)]' };
        case 'Low':
        default:
            return { bg: 'bg-gray-800/70', color: 'text-green-400', glow: 'shadow-[0_0_5px_rgba(163,239,171,0.3)]' };
    }
};

const RedZoneDisplay: React.FC<RedZoneDisplayProps> = ({ report }) => {
    const styles = getRedZoneStyles(report.riskLevel);
    
    return (
        <div className={`p-8 rounded-xl border-4 ${styles.glow} ${styles.bg} transition duration-500 ease-in-out`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-3xl font-bold uppercase tracking-wider text-red-500`}>
                    🚨 DIAGNOSTIC ALERT: {report.riskLevel} Threat Level Detected
                </h2>
                <span className={`text-4xl font-mono p-2 rounded ${styles.color} bg-black/30 border border-current`}>
                    SCORE: {report.riskScore}/100
                </span>
            </div>
            
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-white flex items-center"><span className="mr-2 text-red-400">⚠️</span> 핵심 진단 요약</h3>
                <p className={`text-lg italic ${styles.color}`}>{report.summary}</p>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-1">추가 권고 사항 (Action Items)</h3>
                <ul className="space-y-2 list-disc pl-5 text-sm ${styles.color}">
                    {report.recommendedAction.map((action, index) => (
                        <li key={index}>{action}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RedZoneDisplay;
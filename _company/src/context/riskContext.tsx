import React, { createContext, useState, useContext, useEffect } from 'react';
import { RiskInputs, getTarsApiEndpoint, determineRiskLevel } from '../services/riskCalculationService';

// 🚨 전역 리스크 상태 정의 (State Machine)
type RiskStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

interface TarsContextType {
    currentRiskScore: number;
    currentRiskStatus: RiskStatus;
    isLoading: boolean;
    calculateTars: (inputs: RiskInputs) => Promise<{ score: number; status: RiskStatus }>;
}

const TARS_CONTEXT = createContext<TarsContextType | undefined>(undefined);

export const RiskContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentRiskScore, setCurrentRiskScore] = useState(0);
    const [currentRiskStatus, setCurrentRiskStatus] = useState<'NORMAL' | 'WARNING' | 'CRITICAL'>('NORMAL');
    const [isLoading, setIsLoading] = useState(false);

    // TARS 계산을 실행하고 상태를 업데이트하는 함수 (핵심)
    const calculateTars = async (inputs: RiskInputs): Promise<{ score: number; status: RiskStatus }> => {
        setIsLoading(true);
        try {
            // Mock API 호출 대신, 서비스 레이어의 로직을 직접 사용합니다.
            const result = await getTarsApiEndpoint(inputs);

            setCurrentRiskScore(result.tarsScore);
            setCurrentRiskStatus(result.riskLevel);
            return { score: parseFloat(result.tarsScore), status: result.riskLevel };

        } catch (error) {
            console.error("TARS 계산 실패:", error);
            // 폴백 처리: 오류 발생 시 가장 보수적인 상태로 설정합니다.
            setCurrentRiskStatus('WARNING');
            alert('⚠️ TARS 계산 서비스에 연결 문제가 발생했습니다. 경고 레벨로 기본 설정됩니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TARS_CONTEXT.Provider value={{ currentRiskScore, currentRiskStatus, isLoading, calculateTars }}>
            {children}
        </TARS_CONTEXT.Provider>
    );
};

// 사용 편의성을 위한 Hook 제공
export const useTarsContext = () => {
    const context = useContext(TARS_CONTEXT);
    if (context === undefined) {
        throw new Error('useTarsContext must be used within a RiskContextProvider');
    }
    return context;
};
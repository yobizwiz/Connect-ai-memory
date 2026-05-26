import React, { useState } from 'react';
import axios from 'axios'; // API 통신 라이브러리 가정

// --- 1. 타입 정의 (TypeScript 강제) ---
interface RiskResult {
    success: boolean;
    risk_score: number;
    risk_level: string;
    loss_amount: number;
    status: string;
    diagnosis: string;
}

interface InputData {
    documentationStatus: boolean;
    auditTrailAvailable: boolean;
    regulatoryCompliance: boolean;
}

// API 호출 시뮬레이션 (실제는 백엔드 라우터 엔드포인트로 변경되어야 함)
const API_ENDPOINT = '/api/compliance-check'; 

/**
 * 리스크 레벨에 따라 배경색을 결정하는 유틸리티 함수.
 */
const getRedZoneStyles = (level: string): React.CSSProperties => {
    if (level.includes("CRITICAL")) {
        return { backgroundColor: '#8B0000', color: 'white' }; // Deep Red Zone
    } else if (level.includes("WARNING") || level.includes("AMBER")) {
        return { backgroundColor: '#FF8C00', color: 'black' }; // Amber Warning
    } else {
        return { backgroundColor: '#2ecc71', color: 'white' }; // Green Safe Zone
    }
};

const LossMeterComponent: React.FC = () => {
    // 초기 상태 정의 (모두 합격 가정)
    const [inputs, setInputs] = useState<InputData>({
        documentationStatus: true,
        auditTrailAvailable: true,
        regulatoryCompliance: true,
    });
    const [result, setResult] = useState<RiskResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * 사용자 입력값 변경 핸들러. 
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, checked } = e.target;
        setInputs(prev => ({ ...prev, [id]: checked }));
        // 입력값이 바뀌면 결과를 초기화하여 사용자가 재진단하게 유도합니다.
        setResult(null); 
    };

    /**
     * 구조적 결함 진단 API 호출 로직 (비동기 처리 및 시간 압박 구현).
     */
    const runDiagnosis = async () => {
        setIsLoading(true);
        setResult(null);

        // [개인 메모리 활용] 3초 지연을 주어 로딩 상태를 체감하게 만듭니다. (Time Pressure)
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
interface ApiResponse {
    success: boolean;
    report: RiskResult;
    message?: string;
}

            // 실제 백엔드 API 호출 시뮬레이션
            const response = await axios.post(API_ENDPOINT, inputs) as { data: ApiResponse };
            
            if (response.data.success) {
                setResult(response.data.report);
            } else {
                throw new Error("API 응답 실패: " + response.data.message);
            }

        } catch (error) {
            console.error("Diagnosis Failed:", error);
            setResult({ 
                success: false, 
                risk_score: 0, 
                risk_level: "🔴 CRITICAL (RED ZONE)", 
                loss_amount: 9999999, // 최대 손실액으로 강제 설정
                status: "System Error", 
                diagnosis: "API 호출에 실패했습니다. 네트워크 또는 시스템 계약 오류를 확인하십시오." 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // --- UI 렌더링 로직 ---
    return (
        <div style={{ maxWidth: '900px', margin: '50px auto', fontFamily: 'monospace' }}>
            <h1>⚠️ Compliance Gatekeeper Pro</h1>
            <p>시스템의 구조적 무결성을 진단하여 숨겨진 재무 손실액($X)을 감지합니다. [근거: 🏢 회사 정체성]</p>

            {/* --- 사용자 입력 섹션 (Inputs) --- */}
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h2>🔬 시스템 데이터 입력</h2>
                <p>다음 질문에 답하여 귀사의 프로세스 상태를 시뮬레이션하세요.</p>

                {/* Input 1 */}
                <div>
                    <label htmlFor="documentationStatus" style={{ display: 'block', marginBottom: '5px' }}>
                        [필수] 모든 핵심 프로세스가 문서화되어 있습니까? (SOP)
                    </label>
                    <input 
                        type="checkbox" 
                        id="documentationStatus" 
                        checked={inputs.documentationStatus} 
                        onChange={handleInputChange}
                    />
                </div>

                {/* Input 2 */}
                <div>
                    <label htmlFor="auditTrailAvailable" style={{ display: 'block', marginBottom: '5px' }}>
                        [필수] 모든 트랜잭션에 대한 변경 추적(Audit Trail)이 완전합니까?
                    </label>
                    <input 
                        type="checkbox" 
                        id="auditTrailAvailable" 
                        checked={inputs.auditTrailAvailable} 
                        onChange={handleInputChange}
                    />
                </div>

                 {/* Input 3 */}
                <div>
                    <label htmlFor="regulatoryCompliance" style={{ display: 'block', marginBottom: '5px' }}>
                        [권장] 최신 법규 및 규제 준수 여부가 검증되었습니까?
                    </label>
                    <input 
                        type="checkbox" 
                        id="regulatoryCompliance" 
                        checked={inputs.regulatoryCompliance} 
                        onChange={handleInputChange}
                    />
                </div>

                <button 
                    onClick={runDiagnosis} 
                    disabled={isLoading}
                    style={{ padding: '10px 25px', fontSize: '1rem', cursor: isLoading ? 'default' : 'pointer', marginTop: '20px' }}
                >
                    {isLoading ? '🔍 시스템 진단 중... (3초 대기)' : '🚨 구조적 결함 즉시 진단 시작'}
                </button>
            </div>

            {/* --- 결과 출력 섹션 (Output) --- */}
            {result && (
                <div style={{ 
                    padding: '30px', 
                    borderRadius: '8px', 
                    border: `2px solid ${getRedZoneStyles(result.risk_level).backgroundColor}`,
                    ...getRedZoneStyles(result.risk_level) // 배경색 적용
                }}>
                    <h2 style={{ borderBottom: '3px solid rgba(255, 255, 255, 0.3)', paddingBottom: '10px' }}>
                        [진단 결과] {result.risk_level}
                    </h2>

                    {/* 재무 손실액 강조 (가장 중요한 CTA) */}
                    <div style={{ textAlign: 'center', margin: '20px 0', border: '3px dashed white', padding: '15px' }}>
                        <h3>📉 예상 구조적 생존 위협 규모</h3>
                        <h1>${result.loss_amount.toLocaleString('en-US')}</h1>
                        <p style={{ fontSize: '1.2em' }}>최소 예상 재무 손실액 ($X)</p>
                    </div>

                    {/* 상세 진단 */}
                    <div style={{ marginBottom: '20px' }}>
                        <h4>진단 상태: {result.status}</h4>
                        <p>{result.diagnosis}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LossMeterComponent;
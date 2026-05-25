import React, { useState, useCallback } from 'react';
import { FaBolt, FaExclamationTriangle } from 'react-icons/fa';

// --- [ Type Definitions & Constants ] -------------------

/**
 * QLoss Gatekeeper의 전체 상태를 정의합니다.
 */
export type QlossStatus = 'INITIAL' | 'INTERCEPTING' | 'QLOSS_ACTIVE' | 'CTA_READY' | 'SUCCESS';

/**
 * 리스크 레벨에 따른 스타일을 정의합니다. (Designer V2.1 기반)
 */
const getRedZoneStyles = (level: string): { bgClass: string; iconColor: string } => {
    switch (level) {
        case 'CRITICAL': // Red Zone - 위협
            return { bgClass: 'bg-[#3a0c0c] border-red-600/70', iconColor: 'text-red-500 animate-pulse' };
        case 'WARNING': // Yellow Zone - 경고
            return { bgClass: 'bg-[#4e3f1d] border-yellow-600/70', iconColor: 'text-yellow-500' };
        default: // Safe Zone (or Initial)
            return { bgClass: 'bg-gray-900 border-slate-800', iconColor: 'text-blue-400' };
    }
};

// --- [ Mock API Simulation ] -------------------

/**
 * 실제 결제 API 호출을 시뮬레이션합니다. (API 통합 검증용 더미 함수)
 * @param payload - 결제 정보 페이로드
 * @returns Promise<string> - 리스크 등급 또는 성공 메시지
 */
const simulateApiCall = async (payload: any): Promise<string> => {
    console.log(`[API Simulation] Attempting payment with data:`, payload);
    // 3초 지연을 주어 로딩 상태를 체감하게 만듭니다.
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 구조적 리스크가 감지되었다는 가상의 API 응답
    const simulatedRiskLevel = Math.random() > 0.7 ? 'CRITICAL' : 'WARNING';

    return `{"status": "FAILED", "risk_level": "${simulatedRiskLevel}", "details": "System integrity compromised."}`;
};


// --- [ Core Component ] -------------------

interface QLossGatekeeperProps {
    onPurchaseAttempt: (result: any) => void; // 부모 컴포넌트가 리스크 결과를 받아서 처리하는 콜백
}

const QLossGatekeeper: React.FC<QLossGatekeeperProps> = ({ onPurchaseAttempt }) => {
    const [status, setStatus] = useState<QlossStatus>('INITIAL');
    const [riskLevel, setRiskLevel] = useState<string | null>(null);

    /**
     * 사용자가 결제 버튼을 클릭했을 때 실행되는 핵심 핸들러. (Event Interceptor 역할)
     */
    const handlePurchaseClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
        // 1. 이벤트 가로채기 및 초기 상태 설정 (Step 1: Intercepting)
        setStatus('INTERCEPTING');
        console.log("[QLoss Gatekeeper] Purchase event intercepted.");

        try {
            const purchasePayload = { /* 실제 결제 정보가 들어갈 곳 */ };
            
            // API 호출 시뮬레이션 및 리스크 데이터 수신 (비동기 처리)
            const apiResultJson = await simulateApiCall(purchasePayload);
            const apiResult = JSON.parse(apiResultJson);

            if (apiResult.status === "FAILED") {
                const determinedLevel = apiResult.risk_level || 'CRITICAL'; // API가 실패하면 무조건 최악으로 간주
                setRiskLevel(determinedLevel);
                setStatus('QLOSS_ACTIVE');
                console.log(`[QLoss Gatekeeper] High Risk Detected: ${determinedLevel}. Initiating QLoss sequence.`);

                // 2. QLoss 시퀀스 강제 작동 (Step 2 & 3) - 타이밍 제어
                await new Promise(resolve => setTimeout(resolve, 500)); // 짧은 지연으로 긴장감 조성

                // 최종 리스크 경고 UI 표시
                const { bgClass: finalBg, iconColor: finalIcon } = getRedZoneStyles(determinedLevel);
                console.log(`[QLoss Gatekeeper] Displaying ${determinedLevel} Red Zone Warning.`);


                // 3. 강제 CTA 유도 (Step 4) - 부모 컴포넌트로 결과 전달 및 최종 액션 유도
                setStatus('CTA_READY');

                setTimeout(() => {
                    onPurchaseAttempt(apiResult); // 리스크 결과를 상위 컴포넌트에 알림
                }, 3000); // 경고 메시지 노출 시간 (3초)

            } else {
                 // 성공 케이스 (이 시나리오에서는 발생하지 않아야 함)
                 onPurchaseAttempt({ status: "SUCCESS", message: "Payment successful." });
            }
        } catch (error) {
            console.error("QLoss Gatekeeper Error:", error);
            setStatus('INITIAL'); // 에러 발생 시 복구
        }

    }, [onPurchaseAttempt]);


    // --- Rendering Logic based on Status -------------------

    const renderContent = () => {
        switch (status) {
            case 'INTERCEPTING':
                return (
                    <div className="text-center p-8 bg-[#1a1a1a] rounded-xl border border-red-700/50 animate-pulse">
                        <FaBolt className={`text-yellow-400 text-6xl mb-3`} />
                        <h2 className="text-2xl font-bold text-white">시스템 연결 중...</h2>
                        <p className="text-slate-400 mt-1">구조적 무결성 진단 데이터 전송을 위해 시스템 검증을 수행합니다. 잠시만 기다려 주십시오.</p>
                    </div>
                );
            case 'QLOSS_ACTIVE':
                const styles = getRedZoneStyles(riskLevel || 'CRITICAL');
                return (
                    <div className={`p-10 rounded-xl border-4 ${styles.bgClass} shadow-[0_0_30px_rgba(192,57,43,0.8)] animate-in fade-in duration-1000`}>
                        <FaExclamationTriangle className={`text-6xl mb-4 ${styles.iconColor}`} />
                        <h2 className="text-4xl font-extrabold text-red-400 tracking-wider">🚨 구조적 리스크 감지 (QLoss)</h2>
                        <p className="mt-3 text-lg text-white/90">
                            {`[${riskLevel} 레벨] 위험 경고: 현재 귀사의 재무 시스템은 예측 불가능한 '구조적 무결성 손상' 상태에 있습니다.`} 
                            <span className="font-bold ml-2 text-red-300">즉각적인 진단이 필요합니다.</span>
                        </p>
                        <div className='mt-6 p-4 bg-black/30 rounded border-l-4 border-red-500'>
                            <p className="text-sm italic text-white/[0.8]">
                                ⚠️ 이 데이터는 시스템적 실패를 예측한 결과이며, 단순 오류 메시지가 아닙니다.<br/>
                                해결책을 모른다면 재무적 손실은 $X Million에 달할 수 있습니다.
                            </p>
                        </div>
                    </div>
                );
            case 'CTA_READY':
                 const { bgClass: finalBg } = getRedZoneStyles(riskLevel || 'CRITICAL');
                 return (
                     <div className={`p-10 rounded-xl border-4 ${finalBg} shadow-[0_0_30px_rgba(192,57,43,0.8)] animate-in fade-in duration-1000`}>
                         <h2 className="text-3xl font-bold text-red-300 mb-2">🛑 진단 완료. 해결책이 필요합니다.</h2>
                         <p className='text-white/90'>당신의 시스템은 현재의 리스크를 감당할 수 없습니다.</p>
                         {/* 최종 CTA 버튼: 이 버튼을 누르면 부모 컴포넌트가 유료 결제 플로우로 강제 전환 */}
                        <button 
                            onClick={() => {
                                setStatus('SUCCESS');
                                onPurchaseAttempt({ status: "SUCCESS", message: "Mini-Report purchased successfully." });
                            }}
                            className="mt-8 px-12 py-3 text-xl font-bold bg-red-600 hover:bg-red-700 transition duration-300 shadow-[0_4px_15px_rgba(192,57,43,0.7)]">
                            👉 구조적 무결성 확보 (유료 Mini-Report 구매)
                        </button>
                     </div>
                 );
            case 'SUCCESS':
                return <div className="text-center text-green-400 p-6 border border-green-500 rounded-lg">✅ 진단 및 결제 플로우가 성공적으로 완료되었습니다. 감사합니다.</div>;
            case 'INITIAL':
                return (
                    <div className="text-center">
                        <button 
                            onClick={handlePurchaseClick}
                            className="px-12 py-4 text-xl font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-300 shadow-[0_4px_15px_rgba(192,57,43,0.7)]">
                            Mini-Report 구매 및 리스크 해소하기
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    // ------------------- Render ---------------------
    return (
        <div className="w-full max-w-xl mx-auto pt-10">
            {renderContent()}
        </div>
    );
};

export default QLossGatekeeper;
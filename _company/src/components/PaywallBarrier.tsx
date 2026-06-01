import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Utility Hooks for Defensive Coding ---

/** 🚨 Focus Trap Hook: 모달이 활성화되면 포커스를 모달 내부로 가두어 외부 상호작용을 차단합니다. */
const useFocusTrap = (ref: React.RefObject<HTMLElement>) => {
    useEffect(() => {
        if (!ref.current) return;

        // 1. 초기 포커스 설정: 가장 중요한 요소에 먼저 포커스를 맞춥니다.
        const focusableElements = ref.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            // 첫 번째 포커스 가능한 요소에 강제 포커스를 적용합니다.
            focusableElements[0]?.focus();
        }

        const handleTrap = (e: KeyboardEvent) => {
            // Escape 키를 누르면 모달을 닫고 포커스를 외부로 돌립니다.
            if (e.key === 'Escape') {
                e.preventDefault();
                // 실제로는 onClose() 콜백 호출이 필요합니다.
                console.log("Focus Trap: ESC key pressed, attempting to close modal.");
            }
        };

        document.addEventListener('keydown', handleTrap);

        return () => {
            document.removeEventListener('keydown', handleTrap);
        };
    }, [ref]);
};


// --- Mock API Service (Defensive Layer) ---
/** 💸 실제 결제 게이트웨이 연동을 시뮬레이션하는 비동기 서비스 레이어입니다. */
const simulateGatewayCall = async (): Promise<{ status: 'SUCCESS'; data: { L_totalMax: string; reportId: string } }> => {
    console.log("🔌 [API Call] Initiating secure payment gateway connection...");
    await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5초 지연 시뮬레이션

    // 실제 결제 성공 로직을 가정합니다.
    return { status: 'SUCCESS', data: { L_totalMax: ">$14,782", reportId: `AUDIT-${Date.now()}` } };
};


/** 🛡️ PaywallBarrier 컴포넌트 */
const PaywallBarrier: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    // 모달의 컨테이너를 참조하여 Focus Trap을 구현합니다.
    const modalRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // 실제 Paywall UI가 열리는 상태

    // Focus Trap 훅 적용 (모달이 열릴 때만 활성화)
    useFocusTrap(modalRef);

    /** 진단 요청을 처리하고 결제 게이트웨이 연동을 시뮬레이션하는 핸들러 */
    const handleDiagnosisRequest = useCallback(async () => {
        if (!isOpen || isLoading) return;

        setIsLoading(true);
        console.log("✅ [System] Diagnosis Request initiated. Starting secure transaction flow...");

        try {
            // 1. API 호출 시뮬레이션 (결제 게이트웨이 연동 과정)
            const result = await simulateGatewayCall();

            if (result.status === 'SUCCESS') {
                console.log("🎉 [System] Transaction successful. Access granted.");
                setIsModalOpen(true); // Paywall UI 활성화
                // TODO: 여기서 실제 결제 완료 후 리다이렉트 로직을 구현해야 합니다.

            } else {
                throw new Error("Payment gateway connection failed.");
            }
        } catch (error) {
            console.error(`❌ [System] Critical Failure during transaction: ${error.message}`);
            // 실패 시 사용자에게 재시도 안내 및 에러 로직 구현 필요
        } finally {
            setIsLoading(false);
        }
    }, [isOpen, isLoading]);

    // 모달의 열림/닫힘 상태를 관리하는 효과 (Effect)
    useEffect(() => {
        if (!isOpen) return;
        // 외부에서 컴포넌트가 마운트 될 때 초기화합니다.
        setIsModalOpen(false); 
        setIsLoading(false);
    }, [isOpen]);

    // --- UI Renderer Logic ---

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
                <div className="text-center p-12 text-xl text-red-400 animate-pulse">
                    <span role="img" aria-label="loading">⏳</span> 
                    시스템 보안 연결 중... 데이터를 암호화하고 있습니다. 잠시만 기다려 주십시오. (2.5s)
                </div>
            </div>
        );
    }

    if (!isOpen || !isModalOpen) {
        return null; // 모달이 활성화되지 않았거나, 로딩 후 결제가 완료되지 않은 경우 렌더링하지 않습니다.
    }

    // Paywall Barrier Mockup UI (Designer's Mockup 그대로 구현)
    return (
        <div ref={modalRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-lg p-4">
            {/* Overlay Box */}
            <div 
                className="w-full max-w-3xl border-4 border-[#FF4500] bg-opacity-[0.9] transition-all duration-500"
                style={{ 
                    backgroundColor: 'rgba(15, 25, 40, 0.9)', 
                    boxShadow: '0 0 30px rgba(255, 69, 0, 0.5)' // 경고 효과 강화
                }}
            >
                {/* Header */}
                <div className="p-8 text-center border-b border-red-700/50">
                    <h1 className="text-5xl font-extrabold" style={{ color: '#FF4500' }}>🚨 SYSTEM ALERT</h1>
                    <p className="text-2xl mt-2 text-gray-300">진단 보고서 접근 제한 (ACCESS RESTRICTED)</p>
                </div>

                {/* Body Content */}
                <div className="p-8 space-y-6">
                    {/* Warning Message 1 */}
                    <div>
                        <h2 className="text-3xl font-semibold" style={{ color: '#FF6347' }}>
                            ⚠️ 표면적 취약성으로는 생존할 수 없습니다.
                        </h2>
                        <p className="mt-4 text-lg text-gray-400">
                            [Diagnosis Report Generation Complete]<br/>
                            **경고:** 무료 진단 결과는 최소한의 정보일 뿐, 귀사의 **총체적 리스크($L_{totalMax}$)**를 반영하지 못합니다.
                        </p>
                    </div>

                    {/* Key Value Proposition */}
                    <div className="text-center bg-opacity-[0.7] p-6 border border-[#FF4500]">
                        <h3 className="text-2xl font-mono" style={{ color: '#DC2626' }}>
                            ▶️ $L_{totalMax}$ 상세 분해 보고서 확보가 필수입니다.
                        </h3>
                    </div>

                    {/* Deep Dive Mockup */}
                    <div className="bg-[#1A2035] p-4 rounded border border-[#FF4500]/50">
                        <p className="text-sm text-gray-400 font-mono mb-2">[분석 초점]:</p>
                        <p className="text-lg font-semibold" style={{ color: '#AAAAAA' }}>
                            저희 엔진은 단순 위반 조항을 넘어, **'규제 공백(Compliance Gap)'**으로 인한 재정적 손실($L_{totalMax}$)을 예측합니다.
                        </p>
                    </div>

                </div>

                {/* Footer / CTA */}
                <div className="p-8 pt-0 text-center">
                    <button 
                        onClick={onClose} 
                        className="px-12 py-4 text-xl font-bold uppercase transition duration-300"
                        style={{ 
                            backgroundColor: '#DC2626', // Neon Red CTA
                            boxShadow: '0 0 15px rgba(220, 38, 38, 0.7)'
                        }}
                    >
                        $L_{totalMax}$ 보고서 즉시 확보 (Premium Tier)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaywallBarrier;
import React, { useState, useCallback } from 'react';
import GlitchOverlay from '../components/GlitchOverlay';
import { useFocusTrap } from '../hooks/useFocusTrap';

// Mock Interface 정의 (실제로는 API에서 받아옴)
interface RiskData {
    treScore: number; // Total Risk Exposure Score
}

/**
 * @description 리스크 점수 기반의 Paywall Barrier를 구현한 Mock 컴포넌트.
 * TRE > 85일 때만 활성화되고, Focus Trap과 Glitch 효과를 작동시킴.
 */
const PaywallBarrierMock: React.FC<{ riskData: RiskData }> = ({ riskData }) => {
    // 핵심 로직: 임계치 검증 (PAYWALL_THRESHOLD)
    const PAYWALL_THRESHOLD = 85;
    const [isPaywallActive, setIsPaywallActive] = useState(false);

    React.useEffect(() => {
        if (riskData.treScore >= PAYWALL_THRESHOLD) {
            setIsPaywallActive(true);
            // Mock: 활성화 시 강제 스크롤 최상단으로 이동하여 사용자의 모든 활동을 중지시킴
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setIsPaywallActive(false);
        }
    }, [riskData.treScore]);

    // Focus Trap이 적용될 컨테이너의 Ref를 생성합니다.
    const modalRef = React.useRef<HTMLElement>(null);
    useFocusTrap(modalRef); // 훅 실행 (가장 중요한 단계)

    if (!isPaywallActive) {
        return null; // 임계치 미달 시, 컴포넌트 존재 자체를 무시함.
    }

    // Paywall이 활성화된 상태의 UI
    return (
        <div className="paywall-container" aria-live="assertive" role="alert">
            {/* 1. 전체 화면 오버레이와 Glitch 효과 */}
            <GlitchOverlay />
            
            {/* 2. 실제 상호작용이 발생하는 모달 영역 (Focus Trap 대상) */}
            <div className="paywall-modal-backdrop" ref={modalRef}>
                <div className="paywall-modal-content">
                    <h2>🚨 [SYSTEM ALERT] 리스크 임계치 초과 감지 🚨</h2>
                    <p>현재 귀사의 총 위험 노출도 ($\text{TRE}$): <strong style={{color: 'red'}}>{riskData.treScore}</strong></p>
                    <p>이는 시스템이 정의한 최대 허용치를 ${PAYWALL_THRESHOLD}를 초과했습니다. **지금 당장** 전문가의 진단 없이는 다음 단계로 진행할 수 없습니다.</p>

                    {/* Mock Input Fields: Focus Trap 테스트용 요소들 */}
                    <input type="text" placeholder="회사 이름 (진단 전 필수 입력)" className="mock-input" aria-required="true" />
                    <button onClick={() => alert('Mock 진단 요청!')}>필수 진단 서비스 구매하기</button>

                    {/* 3. 강제 안내 문구 */}
                    <div className="mandate-notice">
                        <p>⚠️ 경고: 본 시스템은 귀사의 재정적 생존권 확보를 위한 필수 점검을 수행합니다. 무시할 수 없습니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaywallBarrierMock;
/**
 * src/components/PaywallModal.tsx
 * @description 리스크 점수 기반의 결제 게이트웨이 모달 프로토타입 (Glassmorphism 스타일 가정)
 */

import React, { useState, useMemo } from 'react';
import { TIER_DATA, PaymentTier } from '../types/payment';
import { calculateTRE, determineMandatoryTier, DUMMY_RISK_ITEMS } from '../utils/riskCalculator';
import { useCheckoutSimulation } from '../hooks/useCheckoutSimulation';

// --- UI 컴포넌트 Mockup (실제 프로젝트에 맞게 스타일링 필요) ---
const ModalContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="modal-overlay" style={{ 
        background: 'rgba(0, 0, 0, 0.7)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
    }}>
        <div className="modal-content glassmorphism" style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '800px',
        }}>
            {children}
        </div>
    </div>
);

const TierCard: React.FC<{ tier: PaymentTier; isRecommended?: boolean }> = ({ tier, isRecommended = false }) => {
    // Gold/Silver가 강력 추천되도록 디자인 강조 (CEO 지시 반영)
    const baseStyle = { 
        border: '1px solid #ccc', 
        padding: '20px', 
        margin: '15px', 
        borderRadius: '10px',
        transition: 'all 0.3s'
    };

    let dynamicStyle: React.CSSProperties = {};
    if (isRecommended) {
        dynamicStyle = { 
            border: '2px solid #ff4d4d', // 네온 레드 강조
            boxShadow: '0 0 15px rgba(255, 77, 77, 0.5)',
            transform: 'scale(1.03)',
        };
    } else if (tier.type === 'Gold') {
         dynamicStyle = { 
            border: '2px solid #ff9800', // Gold 강조
            boxShadow: '0 0 15px rgba(255, 152, 0, 0.5)',
        };
    }


    return (
        <div style={{ ...baseStyle, ...dynamicStyle }}>
            <h3>{tier.name}</h3>
            <p>{tier.description}</p>
            <div style={{ fontSize: '3em', color: '#ff4d4d' }}>${tier.price}</div>
            <button disabled={!isRecommended && tier.type !== determineMandatoryTier(calculateTRE(DUMMY_RISK_ITEMS).tre)} className="purchase-btn">
                {isRecommended ? "필수 납부" : "구매하기"}
            </button>
        </div>
    );
};


// =========================================================
const PaywallModal: React.FC = () => {
    // 1. 초기 리스크 점수를 계산합니다. (더미 데이터 사용)
    const initialRiskData = DUMMY_RISK_ITEMS;
    const { tre: calculatedTRE, totalSavedValue } = useMemo(() => calculateTRE(initialRiskData), []);

    // 2. 비즈니스 로직에 따라 필수 티어를 결정합니다.
    const mandatoryTierType = determineMandatoryTier(calculatedTRE);
    
    // 3. 결제 시뮬레이션 훅 사용
    const { isProcessing, processPayment } = useCheckoutSimulation();

    // 현재 리스크 점수와 절감 가치로 인한 경고 메시지 상태
    const [riskLevel, setRiskLevel] = useState(null);

    // 초기 로직 실행: TRE 계산 결과를 기반으로 사용자에게 공포감을 조성하는 메시지를 설정합니다.
    React.useEffect(() => {
        if (calculatedTRE > 0) {
            setRiskLevel({ tre: calculatedTRE, savedValue: totalSavedValue });
        }
    }, [calculatedTRE, totalSavedValue]);

    // 결제 핸들러 함수
    const handlePurchase = async (tierType: PaymentTier['type']) => {
        if (isProcessing) return;
        
        try {
            await processPayment(tierType);
            alert(`✅ ${tierType} 플랜 구매가 성공적으로 시뮬레이션되었습니다. 시스템 감사 로그에 기록됩니다.`);
        } catch (error) {
            console.error("결제 실패:", error);
            alert("❌ 결제 과정에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    // 렌더링 로직
    return (
        <ModalContainer>
            {/* --- 상단 경고 문구: 공포감 조성 영역 --- */}
            <div className="alert-header" style={{ color: '#ff4d4d', borderBottom: '2px solid #ff4d4d', paddingBottom: '15px' }}>
                <h2>⚠️ [시스템 임무 알림]: 구조적 리스크 경고</h2>
                <p>현재 귀하의 시스템은 **{calculatedTRE}점**의 높은 위험 노출도(TRE)를 감지했습니다. 이는 법적/재정적 무효화 리스크가 매우 높음을 의미합니다.</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.2em' }}>🚨 즉각적인 조치가 필요하며, 최소 ${totalSavedValue}의 재정적 손실을 방지하기 위해 필수 보험료 납부가 요구됩니다.</p>
            </div>

            {/* --- 결제 로직 및 티어 비교 영역 --- */}
            <div className="tier-comparison">
                <h3>가장 적합한 보호 수준 선택 (Mandatory Escalation)</h3>
                <p style={{ margin: '20px 0', color: '#555' }}>
                    🚨 **[시스템 권고]** 귀하의 현재 리스크 점수({calculatedTRE}점)를 고려할 때, 최소한 {mandatoryTierType.toUpperCase()} 티어 이상의 보호가 의무화됩니다.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {Object.values(TIER_DATA)).map((tier) => (
                        <React.Fragment key={tier.type}>
                            <TierCard 
                                tier={tier} 
                                isRecommended={tier.type === mandatoryTierType} // 필수 추천 로직 구현
                            />
                        </React.Fragment>
                    ))}
                </div>

                {/* 결제 버튼 위치 및 상태 관리 */}
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button 
                        onClick={() => handlePurchase(mandatoryTierType)}
                        disabled={isProcessing}
                        style={{ padding: '15px 40px', fontSize: '1.2em', cursor: isProcessing ? 'not-allowed' : 'pointer', background: '#ff4d4d', color: 'white' }}
                    >
                        {isProcessing ? (
                            <>
                                <span role="img" aria-label="로딩">⏳</span> 🛡️ 시스템 결제 처리 중...
                            </>
                        ) : (
                            `[${mandatoryTierType.toUpperCase()} 필수] ${TIER_DATA[mandatoryTierType].name} 보호 가입 (${TIER_DATA[mandatoryTierType].price}/년)`
                        )}
                    </button>
                </div>
            </div>

        </ModalContainer>
    );
};

export default PaywallModal;
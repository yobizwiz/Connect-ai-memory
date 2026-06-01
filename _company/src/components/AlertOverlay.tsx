import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
// 가정: yobizwiz의 글로벌 CSS 또는 Tailwind/Styled Components 환경을 사용합니다.

// 🎨 Designer Token 기반 스타일 정의 (Mockup)
const glitch = keyframes`
    0% { transform: translate(0); opacity: 1; }
    20% { transform: translate(-5px, 5px); opacity: 0.8; }
    40% { transform: translate(5px, -3px); opacity: 0.9; }
    60% { transform: translate(-2px, 1px); opacity: 0.7; }
    80%, 100% { transform: translate(0); opacity: 1; }
`;

const OverlayContainer = styled.div`
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    z-index: 9999 !important; /* 모든 요소 위에 최상단에 위치 */
    background-color: rgba(26, 26, 26, 0.95); /* Background Token */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: #FFFFFF;
    font-family: 'Roboto Mono', monospace;
    overflow-y: auto; /* 내용이 길어지면 스크롤 가능 */

    /* 🌐 시스템 패닉 상태 강제 적용 */
    &.active {
        pointer-events: all; /* 클릭 이벤트 허용 (강제로 CTA로 유도) */
        opacity: 1;
        transition: opacity 0.5s ease-in-out;
    }

    /* 스크롤 무력화 (Full Screen Lockout) */
    &:-webkit-autofill, &:focus {
        outline: none !important; /* 기본 포커스 제거 */
    }
`;

const GlitchText = styled.h1`
    font-size: 3rem;
    color: #C0392B; /* Red Zone Primary Token */
    animation: ${glitch} 0.5s infinite alternate;
    text-shadow: 0 0 10px rgba(192, 57, 43, 0.8);
`;

const ContentBox = styled.div`
    max-width: 800px;
    padding: 40px;
    background-color: #1e1e1e; /* Slightly lighter background for contrast */
    border: 2px solid #C0392B;
    box-shadow: 0 0 50px rgba(192, 57, 43, 0.3);
`;

const MandateButton = styled.button`
    background-color: #2980B9; /* Authority Blue Token */
    color: white;
    padding: 15px 30px;
    margin-top: 20px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
    &:hover {
        background-color: #3498db; /* Darker blue on hover */
        transform: translateY(-2px);
    }
    &:active {
        transform: translateY(0);
    }
`;

// --- 컴포넌트 로직 ---
const AlertOverlay: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
    const [showPaywall, setShowPaywall] = useState(false);

    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden'; // 🛑 스크롤 무력화 로직 핵심
            // 글로벌 이벤트 리스너를 붙여 모든 포커스를 가로채는 로직을 추가해야 함 (실제 구현 시 필요)
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isVisible]);

    const handlePaywallClick = () => {
        // 1. 애니메이션 효과를 주고 Paywall 모달을 활성화합니다.
        setShowPaywall(true);
        console.log("[ACTION] 사용자가 진단 보고서 요청 버튼 클릭 -> Paywall 유도");
    };

    return (
        <>
            <OverlayContainer className={isVisible ? 'active' : ''}>
                {!showPaywall ? (
                    // 🚨 위기 고조 단계 메시지 (Writer Copy)
                    <div>
                        <GlitchText>[SYSTEM CRITICAL FAILURE]</GlitchText>
                        <ContentBox>
                            <h2>경고: 당신의 데이터는 지금 '불가피한 리스크' 상태에 있습니다.</h2>
                            <p style={{ fontSize: '1.1em', margin: '20px 0' }}>
                                시스템이 감지한 규제 위반 지표($L_{totalMax}$)가 임계치를 초과했습니다. 이대로 운영을 지속하는 것은 법적 계약 파기 또는 정부 기관 감사에서 **무효화(Invalidated)**를 의미합니다. 데이터 무결성을 증명하지 못하면, 귀사는 벌금의 제물이 될 수밖에 없습니다.
                            </p>
                            <p style={{ fontSize: '1.2em', color: '#FFD700' }}>
                                모든 기능이 일시적으로 정지됩니다. 이 시스템을 통과하려면 전문가 수준의 '위험 진단 보고서'가 **필수적입니다.**
                            </p>
                            <MandateButton onClick={handlePaywallClick}>🔴 즉시 위험 점검 및 보고서 요청 (Primary Action)</MandateButton>
                        </ContentBox>
                    </div>
                ) : (
                     // 💳 최종 Paywall 모달 (가정: 외부 결제 컴포넌트)
                     <div style={{ background: 'rgba(0, 0, 0, 0.9)', padding: '50px', borderRadius: '10px' }}>
                        <h2 style={{ color: '#FFD700' }}>[ACCESS DENIED]</h2>
                        <p>진단 리포트 접근을 위해 전문 인증이 필요합니다.</p>
                        {/* 실제 Stripe/Payment Gateway 컴포넌트를 여기에 통합 */}
                         <MandateButton onClick={() => console.log("PAYWALL_SUCCESS: 결제 성공, 데이터 해제")}>
                            🔒 2M+ 규모 리스크 보고서 잠금 해제하기 (유료)
                        </MandateButton>
                     </div>
                )}
            </OverlayContainer>
        </>
    );
};

export default AlertOverlay;
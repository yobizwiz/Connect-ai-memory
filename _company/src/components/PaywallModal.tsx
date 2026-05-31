import React from 'react';
import styled, { keyframes } from 'styled-components';

// --- [DESIGNER BLUETOOTH & WRITER COPY INTEGRATION] ---

const glitchAnimation = keyframes`
  0% { transform: translate(0); opacity: 1; }
  20% { transform: translate(-3px, -2px) scale(1.01); opacity: 0.8; }
  40% { transform: translate(3px, 1px) scale(1.01); opacity: 0.9; }
  60% { transform: translate(-2px, 0); opacity: 0.7; }
  100% { transform: translate(0); opacity: 1; }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(26, 26, 26, 0.95); /* Neutral Black */
    z-index: 1000; /* 최우선 레이어 보장 */
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(4px);
`;

const GlitchContent = styled.div`
    max-width: 90%;
    width: 800px;
    padding: 50px;
    background-color: #1A1A1A;
    border: 3px solid #FF0000; /* 네온 레드 경고 */
    box-shadow: 0 0 40px rgba(255, 0, 0, 0.6), inset 0 0 10px rgba(255, 0, 0, 0.3);
    animation: ${glitchAnimation} 1s infinite alternate; /* 지속적인 불안정성 연출 */
`;

const Headline = styled.h1`
    color: #FF4444; /* 강렬한 빨간색 */
    font-size: 2.5em;
    margin-bottom: 0.3em;
    text-transform: uppercase;
    letter-spacing: 3px;
`;

const SubHeadline = styled.h2`
    color: #F39C12; /* 경고 오렌지 */
    font-size: 1.4em;
    margin-bottom: 1.5em;
`;

const BodyText = styled.p`
    color: #B0B0B0;
    line-height: 1.6;
    margin-bottom: 2em;
    font-size: 1.1em;
`;

const ActionBlock = styled.div`
    border-top: 1px solid rgba(255, 0, 0, 0.4);
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const PrimaryButton = styled.button`
    background: linear-gradient(90deg, #CC0000, #FF3333);
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 1.2em;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
    &:hover {
        background: linear-gradient(90deg, #FF0000, #CC0000);
        transform: scale(1.03);
        box-shadow: 0 0 25px rgba(255, 0, 0, 1);
    }
`;

const SecondaryWarning = styled.p`
    color: #990000;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 2px;
`;


// --- [COMPONENT LOGIC] ---

interface PaywallModalProps {
    isVisible: boolean;
    onClose: () => void; // 강제 종료 로직 (A/B 테스트 변수)
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <ModalOverlay aria-modal="true" role="alertdialog">
            <GlitchContent>
                <Headline>⚠️ CRITICAL FAILURE IMMINENT: OPERATION BLACKOUT LEVEL 5 DETECTED.</Headline>
                <SubHeadline>시스템 운영 중단 임박: 블랙아웃 레벨 5 감지</SubHeadline>

                {/* Writer's Core Copy - Operational Blackout */}
                <BodyText>
                    당신의 데이터 무결성 게이지(TARS)가 이미 위험 임계치 $85$점을 초과했습니다. 현재 시스템 상태는 **'운영적 블랙아웃' 직전의 비정상적인 크리티컬 코드**에 진입한 것이 확인되었습니다. 즉각적인 개입 없이는, 다음 30분 내로 핵심 컴플라이언스 모듈이 연쇄적으로 실패하며 전면 서비스 중단(Operational Halt) 상태에 돌입합니다. **지금 당장 시스템을 복원하십시오.**
                </BodyText>

                {/* Writer's Core Copy - Patch Necessity */}
                <div style={{ marginBottom: '30px', borderLeft: '5px solid #F39C12', paddingLeft: '15px' }}>
                    <h3 style={{ color: '#F39C12', fontSize: '1.2em', margin: 0 }}>🚨 SYSTEM INTEGRITY PATCH REQUIRED</h3>
                    <p style={{ color: '#B0B0B0', fontSize: '0.95em', marginTop: '5px' }}>
                        현 상황은 단순한 '업데이트'가 아닙니다. 이는 법적 규제(GDPR, AI Act 등) 위반에 따른 **선제적 방어막 구축 및 무결성 재확립을 위한 필수 패치 과정**입니다... 이 자원은 선택 사항이 아닙니다. **존립을 위한 필수 유지 비용입니다.**
                    </p>
                </div>

                <ActionBlock>
                    <SecondaryWarning>경고: 구독 라이선스 없이 강제 종료 시, 데이터는 복구 불가능합니다.</SecondaryWarning>
                    <PrimaryButton onClick={onClose}>
                        규제 대응 프로토콜 라이선스($XXXX) 확보 및 진행 ⚙️
                    </PrimaryButton>
                </ActionBlock>
            </GlitchContent>
        </ModalOverlay>
    );
};

export default PaywallModal;
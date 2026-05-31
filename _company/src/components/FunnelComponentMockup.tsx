/**
 * @fileoverview Paywall Funnel Mockup Component.
 * Designer의 Blueprint를 기반으로, 상태 변화(State)와 사용자 상호작용 로깅을 통합한 모킹 환경입니다.
 */
import React, { useState } from 'react';
import { usePaywallContext, PaywallState } from '../context/PaywallContext';
import { logAttentionEvent } from '../services/AbtTestService';

// Mock UI Components (실제는 CSS와 애니메이션으로 대체됨)
const StageDisplay: React.FC<{ state: PaywallState }> = ({ state }) => {
    let color = 'blue';
    let message = '분석 중... 리스크 없음.';
    switch (state) {
        case 'IDLE':
            color = '#2980B9'; // Authority Blue
            message = '진단 보고서 로딩 완료. 임계치 감지 안 됨.';
            break;
        case 'ALERT_YELLOW':
            color = '#F59E0B'; // Warning Yellow
            message = '⚠️ 주의: 구조적 공백(Structural Gap)이 발견되었습니다. 추가 검토가 필요합니다.';
            break;
        case 'CRISIS_RED':
            color = '#C0392B'; // Critical Red
            message = '🚨 시스템 임계치 초과! 연간 예상 손실액($L_{max}$) 위험 경고 발생!';
            break;
        case 'LOCKED_PAYWALL':
            color = '#1a1a1a'; // Black/Dark
            message = '🛑 이 리스크는 해결할 수 없습니다. 유료 검증이 필수입니다.';
            break;
    }

    return (
        <div style={{ 
            padding: '20px', 
            border: `3px solid ${color}`, 
            backgroundColor: `${color}15`, // Light background based on color
            textAlign: 'center'
        }}>
            <h2>[{state.replace('_', ' ')}] 시스템 상태</h2>
            <p style={{ fontSize: '2em', color: color }}>{message}</p>
        </div>
    );
};


const FunnelComponentMockup: React.FC = () => {
    const { currentState, setState } = usePaywallContext();
    const [localClicks, setLocalClicks] = useState(0);

    /** 🎯 A/B 테스트가 연동되는 핵심 CTA 핸들러 */
    const handleCtaClick = async (variant: string) => {
        console.log(`\n--- 사용자 상호작용 발생 ---`);
        await logAttentionEvent({
            userId: 'mock-user-123',
            eventType: 'CLICK_BUTTON',
            funnelState: currentState,
            experimentVariant: variant // A/B 테스트 그룹 지정 가능
        });

        // CTA 클릭 성공 시, Paywall 상태를 최종적으로 잠금 처리합니다.
        await setState('LOCKED_PAYWALL');
    };

    /** 🚀 리스크 감지 -> 경고 단계로 진입시키는 Mock 함수 */
    const triggerCrisisState = async () => {
         if (currentState === 'IDLE') {
            // IDLE -> ALERT_YELLOW (1단계 전환)
            await setState('ALERT_YELLOW');

             // 딜레이 후, 임계치 초과 시뮬레이션으로 CRISIS_RED 진입
            setTimeout(async () => {
                await setState('CRISIS_RED');
            }, 2000);
        } else {
            console.warn("이미 Funnel이 진행 중입니다. 초기화 후 다시 시도해주세요.");
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', border: '1px solid #ddd' }}>
            <h1>🔐 Interactive Paywall Funnel Mockup</h1>
            <p>현재 시스템 상태: <strong>{currentState}</strong></p>

            {/* I. 상태 표시 영역 */}
            <StageDisplay state={currentState} />

            <hr style={{ margin: '30px 0' }}/>

            {/* II. 사용자 상호작용 및 컨트롤 패널 (테스트 대상) */}
            <h3>🛠️ 시스템 제어 및 테스트 인터페이스</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={triggerCrisisState} disabled={currentState !== 'IDLE'} style={{ background: '#F59E0B', padding: '10px 20px' }}>
                    {'▶️ 리스크 시뮬레이션 시작 (IDLE → CRISIS)'}
                </button>
            </div>

            {/* A/B 테스트가 적용되는 핵심 CTA */}
            <div style={{ borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
                <h3>✅ 최종 액션 포인트 (CTA Click Area)</h3>
                <p>사용자가 가장 집중할 영역입니다. 모든 클릭은 A/B 로깅됩니다.</p>
                <button 
                    onClick={() => handleCtaClick('A_STANDARD')} 
                    disabled={currentState !== 'CRISIS_RED'}
                    style={{ padding: '15px 30px', fontSize: '1.2em', backgroundColor: '#4CAF50', color: 'white' }}
                >
                    [Variant A] Silver Tier 구독 (클릭 로깅됨)
                </button>
            </div>

             {/* 디버그/테스트용 버튼 */}
            <div style={{ marginTop: '30px' }}>
                 <button onClick={() => setLocalClicks(c => c + 1)} style={{ marginRight: '10px', padding: '10px' }}>
                    [Mock] 스크롤 이벤트 발생 (로깅 테스트)
                </button>
            </div>

        </div>
    );
};

export default FunnelComponentMockup;
// 메인 진단 폼 컴포넌트 (전체 흐름 제어)
import React, { useState } from 'react';
import RiskGaugeComponent from './RiskGaugeComponent';
import QuestionCard from './QuestionCard';
import { useDiagnosisContext } from '../context/DiagnosisContext';

const DiagnosisForm: React.FC = () => {
    const context = useDiagnosisContext();
    const [isSubmitted, setIsSubmitted] = useState(false);

    // ⭐️ 결제 배리어 모달 컴포넌트 (Funneling Target)
    const PaymentBarrierModal = () => (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundColor: 'rgba(20, 20, 30, 0.95)', zIndex: 1000, 
            display: 'flex', justifyContent: 'center', alignItems: 'center' 
        }}>
            <div style={{ 
                width: '600px', padding: '40px', background: '#2A1E1E', border: `3px solid ${context.lTotalMaxScore >= 85 ? '#C0392B' : '#FFB700'}`, boxShadow: '0 0 30px rgba(192, 57, 43, 0.5)' }}>
                <h2 style={{ color: '#E0E0E0', borderBottom: '2px solid #C0392B', paddingBottom: '10px' }}>
                    [SYSTEM ALERT] 진단 완료. 리스크 노출도 ({context.lTotalMaxScore.toFixed(2)}/100) 기준, 즉각적 조치 필요.
                </h2>
                <p style={{ color: '#FFB700', fontSize: '1.2em' }}>
                    현재의 구조적 공백은 단순한 미비점이 아닙니다. 이는 **운영 자본 전체를 위협하는 치명적인 재정적 리스크**입니다.
                </p>
                <div style={{ margin: '30px 0', padding: '20px', backgroundColor: '#1A1A1A', borderLeft: '5px solid #C0392B' }}>
                    <p style={{ color: '#E0E0E0' }}>yobizwiz의 구독 서비스를 통해서만, 귀사의 시스템적 취약점을 실시간으로 감지하고 방어할 수 있습니다.</p>
                </div>
                <button 
                    onClick={() => { alert("결제 API 호출 및 Stripe Funneling 시작!"); setIsSubmitted(false); }}
                    style={{ padding: '15px 30px', fontSize: '1.2em', cursor: 'pointer', backgroundColor: '#C0392B', color: 'white', border: 'none' }}
                >
                    🛡️ 리스크 차단을 위해 즉시 구독하기 (Paywall 진입)
                </button>
            </div>
        </div>
    );


    // ⭐️ 제출 핸들러 로직
    const handleSubmitClick = async () => {
        if (!context.handleSubmit) return;

        const success = await context.handleSubmit(); // Context에서 Funneling 트리거 실행
        if (success) {
            setIsSubmitted(true);
        } else {
            // 실패 시 경고 메시지 처리
        }
    };


    return (
        <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '30px', backgroundColor: '#1A1A1A', color: '#E0E0E0' }}>
            <h1>🧬 진단 리포트 시스템 - $L_{totalMax}$ 측정</h1>
            <p style={{ borderBottom: '1px dashed #444', paddingBottom: '20px' }}>
                진단 과정에 답변할수록, 귀사의 재정적 최대 위험 노출도($L_{totalMax}$)가 실시간으로 계산됩니다.
            </p>

            {/* 1. 리스크 게이지 (Always Visible) */}
            <RiskGaugeComponent />

            {/* 2. 질문 섹션 */}
            <div style={{ border: '1px solid #333', paddingBottom: '30px' }}>
                {/* Researcher가 제공한 모든 질문을 순회하여 표시 */}
                {context.calculateAndSetLTotalMax.mockQuestions.map(q => (
                    <QuestionCard key={q.id} question={q} />
                ))}
            </div>

            {/* 3. 액션 버튼 섹션 */}
            <div style={{ textAlign: 'right', padding: '20px', borderTop: '1px dashed #444' }}>
                 <button 
                    onClick={handleSubmitClick}
                    disabled={context.funnelState === 'FUNNELING_PAYWALL'}
                    style={{ padding: '15px 30px', fontSize: '1.2em', cursor: 'pointer', backgroundColor: '#2980B9', color: 'white', border: 'none' }}
                >
                    진단 리포트 제출 및 다음 단계로 이동 →
                </button>
            </div>

            {/* 4. Funneling State 확인 */}
            {isSubmitted && <PaymentBarrierModal />}
        </div>
    );
};

export default DiagnosisForm;
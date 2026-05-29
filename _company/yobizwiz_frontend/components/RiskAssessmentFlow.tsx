import React, { useReducer, useCallback, useEffect, useState } from 'react';

// API 호출은 Mocking을 전제로 합니다. 실제로는 백엔드와 연동됩니다.
// import { calculateTotalRisk } from '../services/riskService'; 

/**
 * State Machine의 허용 상태 목록을 정의합니다.
 */
export type AssessmentState = 
  | 'IDLE' 
  | 'LOADING_RISK' 
  | 'WARNING_STATE' 
  | 'CRITICAL_STATE' 
  | 'LOADING_REPORT' 
  | 'PAYWALL';

/**
 * State Machine을 작동시키는 액션 객체 구조를 정의합니다.
 */
export type AssessmentAction =
  | { type: 'START_ASSESSMENT' }
  | { type: 'RISK_CALCULATED'; payload: { riskLevel: string } }
  | { type: 'REPORT_REQUESTED' }
  | { type: 'PAYWALL' }
  | { type: 'ERROR' };

/**
 * 컴포넌트 Props 데이터 모델 정의
 */
export interface RiskAssessmentFlowProps {
  initialData?: any;
}

/**
 * RiskAssessmentFlow 컴포넌트는 사용자가 리스크 진단부터 결제까지의 전 과정을 경험하도록 상태를 관리합니다.
 * @param {RiskAssessmentFlowProps} props - 필요한 입력 데이터 (예: 사용자 데이터)
 * @returns {JSX.Element}
 */
const RiskAssessmentFlow: React.FC<RiskAssessmentFlowProps> = ({ initialData }) => {
    // State Machine 정의: 사용자의 여정(Journey)을 엄격하게 제어합니다.
    const [state, dispatch] = useReducer((prevState: AssessmentState, action: AssessmentAction): AssessmentState => {
        switch (action.type) {
            case 'START_ASSESSMENT':
                return 'LOADING_RISK'; // 1. 진단 시작 -> 로딩 상태로 전환
            case 'RISK_CALCULATED':
                // 백엔드 API 호출 성공 후 리스크 등급에 따라 분기합니다.
                const riskLevel = action.payload.riskLevel;
                if (riskLevel === 'CRITICAL') return 'CRITICAL_STATE'; 
                if (riskLevel === 'WARNING') return 'WARNING_STATE';
                return 'IDLE'; // Normal 상태는 보고서 요청으로 바로 이동 가능하게 처리
            case 'REPORT_REQUESTED':
                return 'LOADING_REPORT'; // 임시 상태
            case 'PAYWALL':
                return 'PAYWALL'; // 최종 페이월 도달
            case 'ERROR':
                 return 'IDLE'; // 에러 발생 시 기본 상태로 복귀 (Fallback)
            default:
                return prevState;
        }
    }, 'IDLE');

    // 🚨 로딩 애니메이션을 통한 시간적 압박 조성 (Time Pressure)
    // 리듀서의 부작용(Side Effect)을 방지하기 위해 useEffect로 순수성 보장 및 타이머를 분리 처리합니다.
    useEffect(() => {
        if (state === 'LOADING_REPORT') {
            const timer = setTimeout(() => {
                dispatch({ type: 'PAYWALL' });
            }, 3000); // 3초 지연 후 Paywall 진입
            return () => clearTimeout(timer);
        }
    }, [state]);

    // 페이월 긴장감을 위한 카운트다운 타이머 구현 (CRO Loss Aversion Pacing)
    const [secondsLeft, setSecondsLeft] = useState<number>(300); // 5분
    useEffect(() => {
        if (state === 'PAYWALL' && secondsLeft > 0) {
            const timer = setInterval(() => {
                setSecondsLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [state, secondsLeft]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // API 호출 및 로직 핸들링 (실제 백엔드와 연동될 함수)
    const handleStartAssessment = useCallback(async () => {
        dispatch({ type: 'START_ASSESSMENT' });
        try {
            // 🚨 Mocking the actual API call to calculate total risk.
            await new Promise(resolve => setTimeout(resolve, 1500)); // 로딩 시뮬레이션
            const mockResult = { riskLevel: Math.random() > 0.8 ? 'CRITICAL' : (Math.random() > 0.3 ? 'WARNING' : 'NORMAL') };
            dispatch({ type: 'RISK_CALCULATED', payload: mockResult });

        } catch (error) {
            console.error("Risk calculation failed:", error);
            dispatch({ type: 'ERROR' });
        }
    }, []);

    // 🎨 UI Rendering Logic (상태에 따라 다른 컴포넌트가 보여야 함)
    const renderContent = () => {
        switch (state) {
            case 'IDLE':
                return (
                    <div className="diagnostic-card">
                        <p className="diagnostic-text">
                            귀사 비즈니스의 법적 규제 준수 현황과 취약점을 실시간 분석합니다. <br />
                            <strong>GDPR, CCPA, HIPAA 및 EU AI Act</strong>를 아우르는 시스템 위험 노출도(TRE)를 즉시 진단하십시오.
                        </p>
                        <button className="btn-primary" onClick={handleStartAssessment}>
                            실시간 리스크 진단 시작하기
                        </button>
                    </div>
                );

            case 'LOADING_RISK':
                // 🚨 강제적인 시간 지연과 긴장감 조성 시각화 요소
                return (
                    <div className="spinner-container">
                        <div className="custom-spinner"></div>
                        <div className="loading-text">위험 점수(TRE) 계산 및 취약점 분석 중...</div>
                        <p className="loading-subtext">주요 글로벌 규제 데이터셋 비교 분석을 진행하고 있습니다.</p>
                    </div>
                );

            case 'WARNING_STATE':
                return (
                    <div className="red-zone">
                        <div className="red-zone-tag warning">⚠️ WARNING</div>
                        <h3 className="red-zone-title">위험 노출도가 안전 임계치를 초과했습니다.</h3>
                        <p className="red-zone-desc">
                            귀사의 프로세스는 무효화 위협에 노출되어 있습니다. 신속한 보강 설계를 개입하십시오.
                        </p>
                        <blockquote className="mandate-quote">
                            "이것은 옵션이 아닙니다. 구조적 필수 보강입니다."
                        </blockquote>
                        <button 
                            className="btn-danger" 
                            onClick={() => dispatch({ type: 'REPORT_REQUESTED' })}
                        >
                            구조 무결성 진단 보고서 생성 요청
                        </button>
                    </div>
                );

            case 'CRITICAL_STATE':
                // 🚨 시각적 공포 극대화 (Red Zone Rendering)
                return (
                    <div className="red-zone critical">
                        <div className="red-zone-tag critical">🔥 CRITICAL BREACH</div>
                        <h3 className="red-zone-title">즉각적인 조치가 요구되는 생존 위험 노출 감지!</h3>
                        <p className="red-zone-desc">
                            보안 무결성 결여 및 치명적인 수준의 규제 위반 노출이 확인되었습니다. 막대한 벌금 리스크로부터 방어막을 구축하십시오.
                        </p>
                        <blockquote className="mandate-quote">
                            "이것은 옵션이 아닙니다. 구조적 필수 보강입니다."
                        </blockquote>
                        <button 
                            className="btn-danger" 
                            onClick={() => dispatch({ type: 'REPORT_REQUESTED' })}
                        >
                            즉각 구조 무결성 복구 및 방어 보고서 생성 요청
                        </button>
                    </div>
                );

            case 'LOADING_REPORT':
                 // 🚨 Paywall로 넘어가기 전, 반드시 시간을 지연시키고 경고 메시지를 노출해야 합니다. (Forced Acknowledgment)
                return (
                    <div className="spinner-container">
                        <div className="custom-spinner report-spinner"></div>
                        <div className="loading-text urgent">무결성 분석 및 방어벽 설계 구조 분석 보고서 생성 중...</div>
                        <div className="loading-steps">
                            <div className="loading-step active">✔ GDPR 규제 노출도 가중치 산출 완료</div>
                            <div className="loading-step active">✔ 예상 QLoss 벌금 한계 시뮬레이션 완료</div>
                            <div className="loading-step pulse">⌛ 구조적 필수 방어벽 설계 조합 계산 중...</div>
                        </div>
                    </div>
                );

            case 'PAYWALL':
                // 🚨 최종 목적지: Paywall Barrier (CRO Loss Aversion Design & Time Urgency)
                return (
                    <div className="paywall-card">
                        <div className="timer-box">
                            <span className="timer-label">⏰ 무결성 승인 유효 기한: </span>
                            <span className="timer-text">{formatTime(secondsLeft)}</span>
                        </div>
                        <h3 className="paywall-title">🔒 프리미엄 리스크 방어벽 및 구조 보고서 준비 완료</h3>
                        <p className="paywall-desc">
                            귀사 비즈니스의 파국적인 법적 무효화 시나리오를 원천 봉쇄할 수 있는 핵심 대응 체계가 준비되었습니다. 지금 즉시 승인하고 구조 무결성을 확보하십시오.
                        </p>
                        
                        <div className="price-container">
                            <div className="price-label">구조적 무결성 확보 및 리스크 방어벽 구축 비용</div>
                            <div className="price-value">₩299,000</div>
                        </div>
                        
                        <button className="btn-paywall">
                            구조 무결성 확보 및 리스크 방어벽 구축 승인
                        </button>
                        <p className="paywall-footnote">본 조치는 귀사의 법적 무결성을 증명하기 위한 필수 불가결한 투자입니다.</p>
                    </div>
                );
        }
    };

    return (
        <div className="assessment-container">
            <style dangerouslySetInnerHTML={{ __html: `
                .assessment-container {
                    background-color: #0A0A0C;
                    color: #E2E8F0;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    padding: 2.5rem;
                    border-radius: 16px;
                    max-width: 600px;
                    margin: 2rem auto;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(16px);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .assessment-header {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    padding-bottom: 1.25rem;
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .assessment-title {
                    font-size: 1.6rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                }

                .assessment-subtitle {
                    font-size: 0.875rem;
                    color: #94A3B8;
                    margin-top: 0.5rem;
                    letter-spacing: 0.02em;
                }

                /* Diagnostic card */
                .diagnostic-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                }

                .diagnostic-text {
                    font-size: 0.95rem;
                    color: #CBD5E1;
                    line-height: 1.7;
                    margin-bottom: 2rem;
                }

                .diagnostic-text strong {
                    color: #A5B4FC;
                }

                /* Spinner Container */
                .spinner-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 1rem;
                    text-align: center;
                }

                .custom-spinner {
                    width: 54px;
                    height: 54px;
                    border: 3px solid rgba(165, 180, 252, 0.1);
                    border-top-color: #6366F1;
                    border-radius: 50%;
                    animation: spin 1s infinite linear;
                    margin-bottom: 2rem;
                }

                .custom-spinner.report-spinner {
                    border-top-color: #F87171;
                }

                .loading-text {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #A5B4FC;
                    letter-spacing: 0.02em;
                    margin-bottom: 0.5rem;
                }

                .loading-text.urgent {
                    color: #F87171;
                }

                .loading-subtext {
                    font-size: 0.875rem;
                    color: #64748B;
                }

                .loading-steps {
                    margin-top: 2rem;
                    width: 100%;
                    max-width: 320px;
                    text-align: left;
                    font-size: 0.875rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 1.5rem;
                }

                .loading-step {
                    margin: 0.75rem 0;
                    color: #64748B;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .loading-step.active {
                    color: #10B981;
                    font-weight: 600;
                }

                .loading-step.pulse {
                    color: #F87171;
                    font-weight: 600;
                    animation: pulse 1.5s infinite;
                }

                /* Red Zone Warnings */
                .red-zone {
                    background: linear-gradient(135deg, rgba(30, 10, 10, 0.7) 0%, rgba(15, 3, 3, 0.95) 100%);
                    border: 1px solid rgba(239, 68, 68, 0.35);
                    box-shadow: 0 0 30px rgba(239, 68, 68, 0.15);
                    border-radius: 12px;
                    padding: 2.25rem;
                    position: relative;
                }

                .red-zone.critical {
                    border: 1px solid rgba(239, 68, 68, 0.6);
                    box-shadow: 0 0 40px rgba(239, 68, 68, 0.3);
                    background: linear-gradient(135deg, rgba(45, 5, 5, 0.8) 0%, rgba(20, 2, 2, 0.98) 100%);
                }

                .red-zone-tag {
                    display: inline-block;
                    padding: 0.3rem 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 800;
                    border-radius: 9999px;
                    margin-bottom: 1.25rem;
                    letter-spacing: 0.05em;
                }

                .red-zone-tag.warning {
                    background: rgba(245, 158, 11, 0.15);
                    color: #F59E0B;
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }

                .red-zone-tag.critical {
                    background: rgba(239, 68, 68, 0.2);
                    color: #FCA5A5;
                    border: 1px solid rgba(239, 68, 68, 0.4);
                    animation: pulse 1.5s infinite;
                }

                .red-zone-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #FFFFFF;
                    margin: 0 0 0.75rem 0;
                    line-height: 1.4;
                }

                .red-zone-desc {
                    font-size: 0.95rem;
                    color: #E2E8F0;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }

                .mandate-quote {
                    background: rgba(239, 68, 68, 0.08);
                    border-left: 3px solid #EF4444;
                    padding: 0.8rem 1rem;
                    margin: 1.5rem 0;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #FCA5A5;
                    font-style: normal;
                }

                /* Buttons */
                .btn-primary {
                    background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
                    color: #FFFFFF;
                    font-weight: 700;
                    font-size: 0.95rem;
                    padding: 0.85rem 1.75rem;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
                    transition: all 0.2s ease;
                    width: 100%;
                    letter-spacing: 0.02em;
                }

                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
                }

                .btn-danger {
                    background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
                    color: #FFFFFF;
                    font-weight: 700;
                    font-size: 0.95rem;
                    padding: 0.9rem 1.75rem;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);
                    transition: all 0.2s ease;
                    width: 100%;
                    letter-spacing: 0.02em;
                }

                .btn-danger:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5);
                    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
                }

                /* Paywall card */
                .paywall-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 2.25rem;
                    text-align: center;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
                }

                .timer-box {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.25);
                    border-radius: 8px;
                    padding: 0.5rem 1rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.75rem;
                }

                .timer-label {
                    font-size: 0.825rem;
                    color: #FCA5A5;
                    font-weight: 600;
                }

                .timer-text {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #EF4444;
                }

                .paywall-title {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #FFFFFF;
                    margin: 0 0 0.75rem 0;
                }

                .paywall-desc {
                    font-size: 0.925rem;
                    color: #94A3B8;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }

                .price-container {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    padding: 1.25rem;
                    margin: 2rem 0;
                }

                .price-label {
                    font-size: 0.8rem;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.5rem;
                }

                .price-value {
                    font-size: 2.25rem;
                    font-weight: 900;
                    color: #FFFFFF;
                    background: linear-gradient(135deg, #FFFFFF 30%, #818CF8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .btn-paywall {
                    background: linear-gradient(135deg, #818CF8 0%, #4F46E5 100%);
                    color: #FFFFFF;
                    font-weight: 800;
                    font-size: 1.05rem;
                    padding: 1.1rem 2rem;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    width: 100%;
                    letter-spacing: 0.03em;
                }

                .btn-paywall:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.6);
                    background: linear-gradient(135deg, #A5B4FC 0%, #4F46E5 100%);
                }

                .paywall-footnote {
                    font-size: 0.75rem;
                    color: #475569;
                    margin-top: 1rem;
                }

                /* Keyframes */
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            ` }} />

            <div className="assessment-header">
                <h2 className="assessment-title">yobizwiz 리스크 진단 시스템</h2>
                <p className="assessment-subtitle">글로벌 규제 무결성 보강 및 실시간 벌금 통제 프레임워크</p>
            </div>

            {renderContent()}
        </div>
    );
};

export default RiskAssessmentFlow;
// 이 파일은 실제 Next.js 페이지에 통합될 메인 State Machine 로직의 틀입니다.
import React, { useState } from 'react';
import axios from 'axios'; // 가상의 HTTP 클라이언트 사용 가정

interface DiagnosisState {
    stage: 'IDLE' | 'INPUTTING' | 'LOADING' | 'SUCCESS_REPORT' | 'ERROR' | 'PAYMENT';
    lmaxResult?: number;
    error?: string;
    inputData?: any; // 실제로는 타입 정의 필요
}

const DiagnosisFunnelFlow: React.FC = () => {
    const [state, setState] = useState<DiagnosisState>({ stage: 'IDLE' });
    
    // 1. 상태 초기화 및 입력 단계 전환
    const handleStartDiagnosis = (data: any) => {
        setState(prev => ({ ...prev, stage: 'LOADING', inputData: data, error: undefined }));
    };

    // 2. API 호출을 통해 진단 수행 (핵심 로직)
    const fetchDiagnosisReport = async (inputData: any) => {
        try {
            // 백엔드 API 호출
            const response = await axios.post("http://localhost:8000/api/v1/diagnosis", inputData);
            
            // 성공 시, 상태를 '성공 보고서'로 업데이트
            setState(prev => ({ 
                ...prev, 
                stage: 'SUCCESS_REPORT', 
                lmaxResult: response.data.total_risk_exposure_lmax, 
                error: undefined 
            }));

        } catch (err) {
            // 실패 시, 상태를 '에러'로 업데이트 및 에러 메시지 저장
            const errorMessage = (err as any).response?.data?.detail || "알 수 없는 API 오류가 발생했습니다.";
            setState(prev => ({ ...prev, stage: 'ERROR', error: `🚨 ${errorMessage}` }));
        }
    };

    // 3. 결제 모달로 진입 (Success -> Payment)
    const handleProceedToPayment = () => {
        if (state.lmaxResult && state.lmaxResult > 0) {
            setState(prev => ({ ...prev, stage: 'PAYMENT' }));
            // 여기에 실제 결제 모달 컴포넌트와 Stripe 연동 로직이 들어갑니다.
        } else {
             alert("진단 결과가 유효하지 않아 다음 단계로 진행할 수 없습니다.");
        }
    };


    // --- 🖥️ UI 렌더링 (State-based Rendering) ---

    const renderContent = () => {
        switch (state.stage) {
            case 'IDLE':
                return <InputForm onStart={handleStartDiagnosis} />; // 가상의 입력 폼 컴포넌트
            case 'LOADING':
                return <LoadingIndicator />; 
            case 'SUCCESS_REPORT':
                return (
                    <ReportSummary onProceed={handleProceedToPayment} result={state.lmaxResult!} />
                );
            case 'ERROR':
                return <ErrorDisplay message={state.error || "진단에 실패했습니다."} />; // 에러 메시지 표시 컴포넌트
            case 'PAYMENT':
                return <PaymentModal lmaxValue={state.lmaxResult!}/>; // 결제 모달 컴포넌트
            default:
                return null;
        }
    };

    return (
        <div className="diagnosis-funnel-container">
            <h1>🔍 리스크 진단 Funnel</h1>
            {renderContent()}
        </div>
    );
};

// --- 가상 컴포넌트 스텁들 (실제 구현 필요) ---
const InputForm = ({ onStart }: { onStart: (data: any) => void }) => <div className="input-form"><h3>1. 회사 정보 입력 (Input Stage)</h3><button onClick={() => onStart({ company_industry: 'Healthcare', employee_count: 20, data_pii_count: 50, compliance_gap_score: 0.8 })}>진단 시작 (테스트 데이터)</button></div>;
const LoadingIndicator = ({ lmaxEstimate }: { lmaxEstimate?: number }) => <div className="loading-indicator">⚙️ 분석 중... 데이터를 처리하는 데 시간이 걸립니다.</div>;
const ReportSummary = ({ onProceed, result }: { onProceed: () => void, result: number }) => <div className="report-summary"><h2>✅ 진단 보고서가 준비되었습니다!</h2><p>최대 위험 노출도 ({"$L_{max}$"}): ${result.toLocaleString()}원</p><button onClick={onProceed}>보고서 다운로드 및 결제 진행 💳</button></div>;
const ErrorDisplay = ({ message }: { message: string }) => <div className="error-display">❌ 오류 발생! {message} (다시 시도하거나 정보를 확인해주세요.)</div>;
const PaymentModal = ({ lmaxValue }: { lmaxValue: number }) => <div className="payment-modal">💵 Premium 진입: {"$L_{max}$"}를 해결하려면 월 ${lmaxValue/10_000_000}만 원의 보험이 필요합니다.</div>;

export default DiagnosisFunnelFlow;
//
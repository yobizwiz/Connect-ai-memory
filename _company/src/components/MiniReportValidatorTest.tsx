import React, { useState } from 'react';

// --- 1. API Contract Definition (TypeScript) ---
interface StructuralFlaw {
  code: string;
  description: string;
  impact: string; // 예: "$2,500,000+"
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
}

interface ValidationResult {
  is_valid: boolean;
  risk_score: number;
  structural_flaws: StructuralFlaw[];
  system_intervention_required: boolean; // 핵심 트리거 플래그
  suggested_action: string; 
}

interface ApiPayload {
    data_payload: string;
    report_type: 'Financial' | 'Legal';
    client_context: { session_id: string };
}


// --- 2. Mock API Call (실제 백엔드 호출을 대체) ---
/**
 * @description 가상의 구조적 무결성 검증 API를 호출합니다.
 * 실제로는 fetch('/api/v1/report/validation/structural-integrity', { method: 'POST', body: JSON.stringify(payload) }) 등을 사용합니다.
 */
const mockValidateStructuralIntegrity = async (payload: ApiPayload): Promise<ValidationResult> => {
    console.log("🌐 [API CALL] 구조적 무결성 검증 요청 중...");

    // 시뮬레이션 1: 리스크가 매우 높은 경우 (>= 0.9 트리거)
    if (payload.data_payload.includes("failure")) {
        await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5초 지연
        return {
            is_valid: false,
            risk_score: 0.934,
            structural_flaws: [
                { code: "C-100", description: "핵심 재무 데이터의 구조적 누락이 확인되었습니다.", impact: "$5M+", severity: "CRITICAL" },
                { code: "L-201", description: "관련 법규(SOX) 준수 체크리스트 항목 3개가 미비합니다.", impact: "$1.2M+", severity: "HIGH" }
            ],
            system_intervention_required: true, // 🔥 트리거 발동!
            suggested_action: "Mini-Report Premium Analysis Required"
        };
    }

    // 시뮬레이션 2: 정상적인 경우 (Low Risk)
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        is_valid: true,
        risk_score: 0.15,
        structural_flaws: [],
        system_intervention_required: false, // 🔥 트리거 미발동
        suggested_action: "Analysis Complete. Proceed to next step."
    };
};


// --- 3. Red Zone 모달 컴포넌트 (경험 설계) ---
const RedZoneModal = ({ flaws, action }: { flaws: StructuralFlaw[], action: string }) => (
    <div className="fixed inset-0 bg-red-900/80 z-[100] flex items-center justify-center p-4">
        <div className="bg-white border-8 border-red-600 shadow-2xl w-full max-w-3xl animate-pulse">
            <div className="text-center py-12 px-6">
                <h2 className="text-5xl font-extrabold text-red-700 tracking-tighter mb-4">🚨 SYSTEM INTEGRITY FAILURE DETECTED 🚨</h2>
                <p className="text-xl text-gray-700 mb-8 border-b pb-4">{`[SYSTEM ALERT]: 귀하의 데이터는 구조적 무결성 검증을 통과하지 못했습니다.`}</p>
                
                <div className="space-y-3 mt-6">
                    {flaws.map((f, index) => (
                        <div key={index} className={`p-4 rounded ${f.severity === 'CRITICAL' ? 'bg-red-100 border-l-4 border-red-800' : 'bg-yellow-50 border-l-4 border-yellow-700'} flex justify-between`}>
                            <div>
                                <p className="font-bold text-lg">{f.code}: {f.description}</p>
                                <p className="text-sm text-gray-600">Impact: 💰 {f.impact} 이상의 재무적 리스크 예상</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t flex justify-center">
                    <button 
                        className="px-10 py-4 bg-red-700 text-white font-bold text-lg hover:bg-red-800 transition duration-300 cursor-pointer"
                        onClick={() => alert(`[CTA]: ${action}을(를) 위해 프리미엄 진단 서비스를 신청해야 합니다.`)}
                    >
                        {action}
                    </button>
                </div>
            </div>
        </div>
    </div>
);


// --- 4. Main Component ---
export default function MiniReportValidatorTest() {
    const [payload, setPayload] = useState("sample_data_input"); // 테스트용 데이터
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        setResult(null);
        try {
            // 실제 API 호출을 시뮬레이션합니다.
            const resultData = await mockValidateStructuralIntegrity({
                data_payload: payload,
                report_type: 'Financial',
                client_context: { session_id: "test-session-123" }
            });

            setResult(resultData);
        } catch (error) {
            console.error("Validation failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Mini-Report 구조적 무결성 검증 시뮬레이터</h1>
            <p className="mb-8 text-sm text-red-700 bg-red-50 p-3 rounded">
                ⚠️ **주의**: 이 테스트는 단순한 UI Mockup이 아닙니다. 백엔드 API 응답 구조와 프론트엔드의 '강제 경험' 로직을 검증하는 핵심 단계입니다.
            </p>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <label htmlFor="dataInput" className="block text-sm font-medium text-gray-700 mb-2">테스트 데이터 입력 (무결성 실패 유도: 'failure' 포함)</label>
                <textarea 
                    id="dataInput"
                    rows={4} 
                    value={payload} 
                    onChange={(e) => setPayload(e.target.value)} 
                    className="w-full border border-gray-300 p-2 rounded focus:ring-red-500 focus:border-red-500"
                    disabled={isLoading}
                ></textarea>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`mt-4 px-6 py-2 text-white font-semibold rounded transition duration-150 ${
                        isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    {isLoading ? '🛡️ 시스템 검증 중... (잠시 대기)' : '▶ 구조적 무결성 검증 실행'}
                </button>
            </div>

            {/* 🚨 Red Zone 강제 모달 출력 */}
            {result?.system_intervention_required && <RedZoneModal flaws={result.structural_flaws} action={result.suggested_action} />}


            {/* ✅ 결과 표시 영역 */}
            {!isLoading && result && (
                <div className={`p-6 rounded-lg shadow-xl ${result.is_valid ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-800'} mb-12`}>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">🔍 검증 결과 요약</h3>
                    <p className={`mb-4 text-lg font-semibold ${result.is_valid ? 'text-green-700' : 'text-red-800'}`}>
                        ✅ 상태: {result.is_valid ? '구조적 무결성 확보됨 (PASS)' : `🚨 구조적 결함 감지 (${(result.risk_score * 100).toFixed(2)}%)` }
                    </p>
                    <div className="text-sm text-gray-600">
                        <strong>System Intervention Required:</strong> {String(result.system_intervention_required)} <br/>
                        <strong>다음 액션 제안:</strong> {result.suggested_action}
                    </div>

                    {!result.structural_flaws?.length && result.is_valid ? (
                         <p className="mt-4 text-green-600">테스트 성공! 데이터는 현재의 구조적 위험을 포함하고 있지 않습니다.</p>
                     ) : (
                        <div className="mt-6 space-y-3">
                            <h4 className="text-xl font-semibold text-red-700 border-b pb-2">🚩 발견된 치명적인 결함 목록 ({result.structural_flaws?.length}건)</h4>
                            {result.structural_flaws?.map((f, index) => (
                                <div key={index} className={`p-3 rounded ${f.severity === 'CRITICAL' ? 'bg-red-100' : 'bg-yellow-100'} border border-red-200 flex justify-between items-center`}>
                                    <div>
                                        <p className="font-bold text-red-800">{f.code} ({f.severity})</p>
                                        <p>{f.description}</p>
                                    </div>
                                    <span className="text-xl font-extrabold text-red-900">Impact: {f.impact}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
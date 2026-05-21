import React, { useState, useCallback } from 'react';
// Next.js 환경에서 API 호출을 시뮬레이션합니다.
const calculateRiskApi = async (inputs: any) => {
    console.log("Calling backend API with inputs:", inputs);
    // 실제로는 fetch('/api/v1/calculate-risk', { method: 'POST', body: JSON.stringify(inputs), headers: {'Content-Type': 'application/json'} })을 사용해야 합니다.
    // 여기서는 테스트를 위해 임시 지연과 더미 데이터를 반환합니다.
    await new Promise(resolve => setTimeout(resolve, 1200)); 
    return {
        success: true,
        riskScore: inputs.complianceGapScore,
        calculatedLossY: Math.round((inputs.dataVolumeGB * 15 + (inputs.jurisdiction === 'GDPR' ? 3000 : 0) + Math.pow(inputs.complianceGapScore / 100, 2) * 5000)).toFixed(2),
        isEligible: inputs.dataVolumeGB > 5 && (inputs.jurisdiction === 'GDPR' || inputs.jurisdiction === 'CCPA'), // 임계치 만족 시 True 반환 시뮬레이션
        message: `진단 결과 분석 완료. 예상 손실액은 ${Math.round(parseFloat(calculatedLossY)).toLocaleString()}원입니다.`
    };
};

interface RiskCalculatorWidgetProps {}

const RedZoneButton = ({ children, disabled, className }: { children: React.ReactNode; disabled: boolean; className?: string }) => (
    <button 
        className={`px-8 py-3 text-lg font-bold rounded transition duration-200 ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#C0392B] hover:bg-[#A03126]'}`}
        disabled={disabled}
        style={{ minWidth: '250px' }}
    >
        {children}
    </button>
);

const RiskCalculatorWidget: React.FC<RiskCalculatorWidgetProps> = () => {
    // 🎨 상태 관리 (State Management)를 통해 모든 사용자 상호작용을 통제합니다.
    const [dataVolume, setDataVolume] = useState<number>(10); // 기본값 설정
    const [jurisdiction, setJurisdiction] = useState<'GDPR' | 'CCPA' | 'NONE'>('GDPR'); 
    const [gapScore, setGapScore] = useState<number>(75);

    // 계산 결과를 저장하는 상태 (핵심)
    const [result, setResult] = useState<{ y: number; eligible: boolean; message: string } | null>({
        y: 0,
        eligible: false,
        message: "위험을 분석하려면 입력값을 변경해주세요."
    });

    // ✨ 핵심 로직: Input 값이 바뀔 때마다 Y 값을 즉각적으로 재계산하는 함수 (Client-side feedback)
    const calculateLocalY = useCallback((volume: number, gap: number): number => {
        // 복잡한 계산을 클라이언트 측에서 미리 보여주어 전문성을 높입니다.
        let baseLoss = volume * 15;
        let compliancePenalty = jurisdiction === 'GDPR' ? 3000 : (jurisdiction === 'CCPA' ? 2000 : 0);
        const systemicRiskFactor = Math.pow(gap / 100, 2) * 5000;
        return baseLoss + compliancePenalty + systemicRiskFactor;
    }, [jurisdiction]);

    // Input 변화 핸들러
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newValue: number | 'GDPR' | 'CCPA' | 'NONE';

        if (name === 'dataVolumeGB' || name === 'complianceGapScore') {
            newValue = parseFloat(value) || 0;
        } else {
            newValue = value as any;
        }

        // 상태 업데이트 후, 로컬 Y 값 즉시 재계산 및 반영
        if (name === 'dataVolumeGB' || name === 'complianceGapScore') {
             const tempY = calculateLocalY(parseFloat(value) || 0, parseFloat(value) || 0); // 간소화된 임시 계산
             setResult(prev => ({ 
                ...prev, 
                y: Math.round(tempY).toLocaleString(), 
                message: `분석 중... (로컬 예측치)` 
            }));
        }

        if (name === 'dataVolumeGB') setDataVolume(newValue as number);
        else if (name === 'complianceGapScore') setGapScore(newValue as number);
        else if (name === 'jurisdiction') setJurisdiction(newValue as any);
    };


    // ✨ 최종 액션: 백엔드 API를 호출하여 확정된 Y 값을 받고, 보고서 발급 가능 여부를 확인합니다.
    const handleDiagnosisSubmission = async () => {
        setResult({ y: '...', eligible: false, message: "분석 중..." }); // 로딩 상태 표시
        
        try {
            // 🚀 백엔드 호출 (API 통신)
            const apiResult = await calculateRiskApi({ 
                dataVolumeGB: dataVolume, 
                jurisdiction: jurisdiction, 
                complianceGapScore: gapScore 
            });

            if (apiResult.success) {
                // API 결과로 최종 상태 업데이트
                setResult({
                    y: apiResult.calculatedLossY || 'N/A',
                    eligible: apiResult.isEligible,
                    message: apiResult.message
                });
            } else {
                 alert("API 호출 실패: 서버 오류가 발생했습니다.");
                 setResult(null);
            }

        } catch (error) {
            console.error("Submission failed:", error);
            alert("네트워크 연결을 확인해주세요.");
            setResult(null);
        }
    };

    // CTA 버튼의 활성화 여부 결정 로직
    const isButtonDisabled = !result?.eligible || result?.message === "위험을 분석하려면 입력값을 변경해주세요.";

    return (
        <div className="p-8 bg-[#1c2330] border-t-4 border-[#C0392B] shadow-xl max-w-3xl mx-auto text-white">
            <h2 className="text-3xl font-extrabold mb-6 text-red-500 tracking-widest uppercase">[SYSTEM DIAGNOSTIC REPORT v1.2]</h2>

            {/* ⚙️ 입력 필드 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-[#2a3440] rounded-lg">
                <div>
                    <label htmlFor="dataVolumeGB" className="block text-sm font-medium text-gray-300 mb-1">데이터 볼륨 (GB)</label>
                    <input 
                        type="range" 
                        id="dataVolumeGB" 
                        name="dataVolumeGB" 
                        min="1" max="50" step="1" value={dataVolume} 
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                    />
                    <p className='text-sm text-red-300 mt-1'>현재: {dataVolume} GB</p>
                </div>
                <div>
                    <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-300 mb-1">관할 지역 (Compliance Scope)</label>
                    <select 
                        id="jurisdiction" 
                        name="jurisdiction" 
                        value={jurisdiction} 
                        onChange={handleInputChange}
                        className="w-full p-2 bg-gray-700 border border-[#C0392B] rounded text-white focus:ring-red-500 focus:border-red-500"
                    >
                        <option value="GDPR">🇪🇺 GDPR (유럽 일반 개인정보 보호)</option>
                        <option value="CCPA">🇺🇸 CCPA (캘리포니아 소비자 프라이버시법)</option>
                        <option value="NONE">None (미적용)</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="complianceGapScore" className="block text-sm font-medium text-gray-300 mb-1">준수 격차 점수 (%)</label>
                    <input 
                        type="range" 
                        id="complianceGapScore" 
                        name="complianceGapScore" 
                        min="0" max="100" step="5" value={gapScore} 
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                    />
                    <p className='text-sm text-red-300 mt-1'>현재: {gapScore}%</p>
                </div>
            </div>

            {/* 🚨 결과 및 CTA 섹션 */}
            <div className="bg-[#2a3440] p-8 rounded-lg border-l-4 border-[#C0392B]">
                <h3 className="text-xl font-semibold mb-4 text-red-400">🚨 재무적 손실 분석 결과</h3>
                
                {/* Y 값 시각화 및 경고 */}
                <div className="flex items-center justify-between bg-[#1c2330] p-4 rounded border border-dashed border-red-700 mb-6">
                    <span className="text-lg text-gray-300 mr-4">예상 최소 재무적 손실 규모 ($Y$):</span>
                    <div className={`text-4xl font-mono tracking-wider ${result?.eligible ? 'text-yellow-400' : 'text-red-600'} transition duration-500`}>
                        {result?.y || '---'}원 
                    </div>
                </div>

                <p className="mb-8 text-gray-300">{result?.message}</p>

                {/* CTA 버튼 */}
                <RedZoneButton disabled={isButtonDisabled} onClick={handleDiagnosisSubmission}>
                    {isButtonDisabled ? "진단 보고서 발급 불가 (위험도 미달)" : "무료 리스크 진단 및 생존권 확보 신청"}
                </RedZoneButton>

            </div>
        </div>
    );
};

export default RiskCalculatorWidget;
// src/components/RiskCalculatorForm.tsx
import React, { useState } from 'react';
import { InputData } from '../hooks/useRiskAnalysis';

interface RiskCalculatorFormProps {
    onSubmit: (data: InputData) => void;
    isLoading: boolean;
}

/**
 * @description 사용자 데이터를 받아 분석을 트리거하는 폼 컴포넌트.
 */
const RiskCalculatorForm: React.FC<RiskCalculatorFormProps> = ({ onSubmit, isLoading }) => {
    // 초기 상태 설정 (합리적인 디폴트 값을 제공하여 '사용법' 안내)
    const [formData, setFormData] = useState<InputData>({
        revenueLoss: 15, // 예시 값
        complianceGapCount: 3,
        marketSentimentScore: -20
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0 // 숫자만 받도록 처리
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoading) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-700/50 space-y-6">
            <h3 className="text-2xl font-mono text-white mb-4 tracking-wider">🔍 구조적 위험 진단 입력</h3>
            <p className="text-gray-400 text-sm">가상의 비즈니스 데이터를 입력하여 시스템의 '취약점'을 시뮬레이션하세요.</p>

            {/* 1. 손실액 */}
            <div>
                <label htmlFor="revenueLoss" className="block text-md font-medium text-gray-300 mb-2">
                    최근 분기 예상 손실액 (억 원) <span className="text-red-500">*</span>
                </label>
                <input 
                    type="number" 
                    id="revenueLoss" 
                    name="revenueLoss" 
                    value={formData.revenueLoss} 
                    onChange={handleChange} 
                    required 
                    min="0"
                    className="w-full p-3 bg-[#2c2c2c] border border-gray-700 text-white focus:border-red-500 focus:ring-red-500 transition duration-150 rounded"
                />
            </div>

            {/* 2. Gap 수 */}
            <div>
                <label htmlFor="complianceGapCount" className="block text-md font-medium text-gray-300 mb-2">
                    법규 미준수 Gap 발생 건수 <span className="text-red-500">*</span>
                </label>
                <input 
                    type="number" 
                    id="complianceGapCount" 
                    name="complianceGapCount" 
                    value={formData.complianceGapCount} 
                    onChange={handleChange} 
                    required 
                    min="0"
                    className="w-full p-3 bg-[#2c2c2c] border border-gray-700 text-white focus:border-red-500 focus:ring-red-500 transition duration-150 rounded"
                />
            </div>

            {/* 3. 시장 심리 점수 */}
            <div>
                <label htmlFor="marketSentimentScore" className="block text-md font-medium text-gray-300 mb-2">
                    시장 심리 지수 (전체 범위: -100 ~ 100) <span className="text-red-500">*</span>
                </label>
                <input 
                    type="range" 
                    id="marketSentimentScore" 
                    name="marketSentimentScore" 
                    min="-100" 
                    max="100" 
                    step="1"
                    value={formData.marketSentimentScore} 
                    onChange={handleChange} 
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:bg-red-600 [&::-moz-range-thumb]:bg-red-600"
                />
                <p className="text-right text-sm text-gray-400 mt-1">현재 값: {formData.marketSentimentScore}</p>
            </div>

            {/* CTA 버튼 */}
            <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-3 text-lg font-bold rounded-xl transition duration-300 ${
                    isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800 shadow-lg shadow-red-900/50'
                } text-white`}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2-8v16h8V4z"></path></svg>
                        시스템 분석 중... (잠시만 기다려 주세요)
                    </div>
                ) : (
                    "🚀 리스크 구조 진단 실행 (데이터 전송)"
                )}
            </button>
        </form>
    );
};

export default RiskCalculatorForm;
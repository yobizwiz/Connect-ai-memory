// Input Form: Handles user input and triggers QLoss spike on failure
import React, { useState } from 'react';
import { useLossCalculator } from '../hooks/useLossCalculator';

interface InputFormProps {
  onValidationFailure?: () => void;
}

const InputForm: React.FC<InputFormProps> = ({ onValidationFailure }) => {
  const [inputs, setInputs] = useState({ name: '', email: '' });
  const { triggerActionFailureSpike } = useLossCalculator(0); // QLoss Spike Trigger 함수 사용

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.name || !inputs.email) {
      // 🚨 유효성 검사 실패 시 QLoss 급증 트리거
      triggerActionFailureSpike(200); // 200 $Loss spike
      onValidationFailure?.();
      alert("⚠️ 경고: 필수 정보를 모두 입력해야 리스크 분석이 가능합니다.");
    } else {
      console.log("Form Submitted Successfully. Proceeding to analysis...");
      // 성공 로직 (예: API 호출)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">회사명 또는 성함 *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={inputs.name}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white focus:ring-red-500 focus:border-red-500"
          placeholder="예: ABC Corp"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">담당자 이메일 *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={inputs.email}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white focus:ring-red-500 focus:border-red-500"
          placeholder="예: user@company.com"
          required
        />
      </div>
      <button 
        type="submit" 
        className="md:col-span-2 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition duration-150 shadow-md hover:shadow-lg"
      >
        분석 요청 및 리스크 평가 시작
      </button>
    </form>
  );
};

export default InputForm;
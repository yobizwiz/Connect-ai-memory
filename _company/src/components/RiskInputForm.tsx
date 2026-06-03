import React from 'react';

interface RiskInputFormProps {
  onStateChange: (state: { industry: string; employeeCount: number }) => void;
}

/**
 * 리스크 진단 입력 폼 컴포넌트.
 * 산업군 및 직원 수를 입력받아 상위 컴포넌트에 전달합니다.
 */
const RiskInputForm: React.FC<RiskInputFormProps> = ({ onStateChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">
          산업 분야 (Industry)
        </label>
        <select
          id="industry"
          className="w-full p-3 bg-[#2c2c2c] border border-gray-600 text-white rounded"
          onChange={(e) => onStateChange({ industry: e.target.value, employeeCount: 10 })}
        >
          <option value="General Tech">General Tech</option>
          <option value="AI">AI</option>
          <option value="Finance">Finance</option>
          <option value="Healthcare">Healthcare</option>
        </select>
      </div>
      <div>
        <label htmlFor="employees" className="block text-sm font-medium text-gray-300 mb-2">
          직원 수 (Employee Count)
        </label>
        <input
          id="employees"
          type="number"
          min={1}
          defaultValue={10}
          className="w-full p-3 bg-[#2c2c2c] border border-gray-600 text-white rounded"
          onChange={(e) => onStateChange({ industry: 'General Tech', employeeCount: parseInt(e.target.value) || 1 })}
        />
      </div>
    </div>
  );
};

export default RiskInputForm;

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RiskSimulatorPage from '../pages/RiskSimulatorPage';
// useSystemStatus와 analyzeRiskData의 목(Mock)을 사용한다고 가정

describe('RiskSimulatorPage - Integrated System Test Suite', () => {
  // 전역 상태를 테스트하기 위해 래퍼 컴포넌트가 필요합니다.
  const renderComponent = (component: React.ReactElement) => {
    return render(<div id="test-container">{component}</div>);
  };

  // TDD 원칙에 따라, Mocking된 API와 Context를 사용한다고 명시합니다.
  beforeEach(() => {
    jest.clearAllMocks();
  });


  /**
   * 1. 기본 성공 플로우 테스트 (Green/Yellow)
   * 목표: 정상적인 데이터 입력 및 분석 흐름이 시간적 압박과 함께 작동하는지 확인.
   */
  test('1. Successful analysis flow completes within expected time window', async () => {
    // Mock analyzeRiskData가 성공을 반환하도록 설정
    jest.spyOn(require('../services/mockApi')).analyzeRiskData.mockResolvedValue({ 
      riskScore: 45, reportData: "분석 성공.", status: 'SUCCESS' 
    });

    renderComponent(<RiskSimulatorPage />);
    
    // 입력 및 제출 액션 시뮬레이션
    fireEvent.change(screen.getByLabelText(/데이터 세트 ID/i), { target: { value: 'ValidData123' } });
    const submitButton = screen.getByRole('button', /즉시 진단 시작/i);

    // 비동기 로직 실행 (시간적 압박 시뮬레이션)
    await act(async () => {
      fireEvent.click(submitButton);
      // API 호출 및 상태 변경을 기다림
      await new Promise(resolve => setTimeout(resolve, 2000)); 
    });

    expect(screen.getByText(/분석 성공/i)).toBeInTheDocument();
    expect(submitButton).not.toHaveAttribute('disabled'); // 로딩이 끝났으므로 버튼 활성화 상태 유지 확인
  });


  /**
   * 2. 클라이맥스 실패 시나리오: 구조적 결함 (Structural Degradation)
   * 목표: Mock API가 강제로 전역 시스템 마비 플래그(isSystemCompromised=true)를 발생시키는지 검증.
   */
  test('2. Structural Degradation failure triggers the permanent FailureOverlay state', async () => {
    // Mock analyzeRiskData가 구조적 결함 오류를 반환하도록 설정 (이것이 핵심 트리거)
    jest.spyOn(require('../services/mockApi')).analyzeRiskData.mockRejectedValue({ 
      type: 'SYSTEM_ERROR', errorType: 'STRUCTURAL_DEGRADATION', message: "시스템 무결성 손상 감지." 
    });

    renderComponent(<RiskSimulatorPage />);
    fireEvent.change(screen.getByLabelText(/데이터 세트 ID/i), { target: { value: 'HighRiskData' } });
    const submitButton = screen.getByRole('button', /즉시 진단 시작/i);

    await act(async () => {
      fireEvent.click(submitButton);
      // 실패 후 상태가 바뀌었는지 기다림
      await new Promise(resolve => setTimeout(resolve, 2000));
    });

    // 가장 중요한 검증: FailureOverlay 컴포넌트가 화면을 완전히 덮는지 확인
    expect(screen.getByText(/SYSTEM FAILURE/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', /즉시 진단 시작/i)).not.toBeInTheDocument(); // 버튼 비활성화 또는 사라짐 확인
  });


  /**
   * 3. 에러 시나리오: Rate Limit Exceeded (비영구적 실패)
   * 목표: 시스템 마비(FailureOverlay)가 아닌, 경고/재시도 가능한 상태로 전환되는지 검증.
   */
  test('3. Rate Limit failure triggers a recoverable warning state', async () => {
    // Mock API가 임시적인 rate limit 오류를 반환하도록 설정
    jest.spyOn(require('../services/mockApi')).analyzeRiskData.mockRejectedValue({ 
      type: 'API_ERROR', errorType: 'RATE_LIMIT_EXCEEDED', message: "API 호출 제한에 걸렸습니다." 
    });

    renderComponent(<RiskSimulatorPage />);
    fireEvent.change(screen.getByLabelText(/데이터 세트 ID/i), { target: { value: 'TestRateLimit' } });
    const submitButton = screen.getByRole('button', /즉시 진단 시작/i);

    await act(async () => {
      fireEvent.click(submitButton);
      await new Promise(resolve => setTimeout(resolve, 2000));
    });

    // FailureOverlay가 아닌, 일반적인 경고 메시지가 보이는지 확인 (마비 방지)
    expect(screen.getByText(/API 오류/i)).toBeInTheDocument();
    expect(screen.queryByText(/SYSTEM FAILURE/i)).not.toBeInTheDocument(); 
  });


  /**
   * 4. 에러 시나리오: 데이터 무결성 손상 (Data Corruption)
   * 목표: QLoss가 높은 경고 상태를 보여주되, 시스템 자체는 작동 가능한지 확인.
   */
  test('4. Data Corruption shows high risk warning but allows manual reset', async () => {
    // Mock API가 데이터 무결성 오류를 반환하도록 설정 (Warning Level)
    jest.spyOn(require('../services/mockApi')).analyzeRiskData.mockResolvedValue({ 
      riskScore: 85, reportData: "데이터 손상 의심. 재검토 필요.", status: 'WARNING' 
    });

    renderComponent(<RiskSimulatorPage />);
    fireEvent.change(screen.getByLabelText(/데이터 세트 ID/i), { target: { value: 'CorruptDataXYZ' } });
    const submitButton = screen.getByRole('button', /즉시 진단 시작/i);

    await act(async () => {
      fireEvent.click(submitButton);
      await new Promise(resolve => setTimeout(resolve, 2000));
    });

    // 성공적으로 경고 레벨을 받아들이는 것과 시스템 마비가 분리되었는지 확인
    expect(screen.getByText(/WARNING/i)).toBeInTheDocument();
    expect(screen.queryByText(/SYSTEM FAILURE/i)).not.toBeInTheDocument(); 
  });

  /**
   * 5. 에러 시나리오: 빈 입력값 처리 (Guard Clause Test)
   * 목표: 사용자 입력 유효성 검사 실패 시, API 호출 없이 즉시 오류를 반환하는지 확인.
   */
  test('5. Empty input data triggers immediate client-side validation error', async () => {
    renderComponent(<RiskSimulatorPage />);

    // 입력 필드가 비어있고 제출을 시도할 때 (API 호출 전 차단되어야 함)
    const submitButton = screen.getByRole('button', /즉시 진단 시작/i);
    fireEvent.click(submitButton);

    await act(async () => {
      // API가 호출되지 않았음을 확인해야 함 (Mocking 필요, 여기서는 로직 검증만)
    });

    // 만약 클라이언트 사이드에서 오류 메시지가 뜬다면 그것을 잡는다.
    // 실제 구현에서는 입력 필드 근처에 에러 메시지를 표시하도록 추가해야 함.
    expect(screen.queryByText(/유효한 데이터 세트가 아닙니다/i)).toBeInTheDocument();
  });
});
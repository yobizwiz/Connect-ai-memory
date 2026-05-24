import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ClientSideGatekeeperAlert from '../ClientSideGatekeeperAlert';

// Mocking the entire component to ensure isolated testing
const TestComponent: React.FC = () => {
  return (
    <div>
      {/* 테스트를 위해 게이트키퍼 컴포넌트를 직접 렌더링 */}
      <ClientSideGatekeeperAlert riskScore={0.8} onProceed={() => {}} />
    </div>
  );
};

describe('ClientSideGatekeeperAlert', () => {
  // 1. 리스크 스코어가 임계치(70%) 미만일 때 (False Negative Test)
  test('should NOT render the alert when riskScore is below 70%', () => {
    render(<ClientSideGatekeeperAlert riskScore={0.65} onProceed={() => {}} />);
    // '시스템 경고'와 같은 핵심 문구가 화면에 나타나지 않아야 합니다.
    expect(screen.queryByText(/システム/i)).toBeNull(); 
  });

  // 2. 리스크 스코어가 임계치 이상일 때 (True Positive Test)
  test('should render the alert when riskScore is 70% or higher', () => {
    render(<ClientSideGatekeeperAlert riskScore={0.71} onProceed={() => {}} />);
    // 핵심 경고 문구가 반드시 존재해야 합니다.
    expect(screen.getByText(/Critical Integrity Breach Detected/i)).toBeInTheDocument(); 
    // 위험 스코어 표시도 확인합니다. (소수점 처리 로직 검증)
    expect(screen.getByText(/71%/i)).toBeInTheDocument(); 
  });

  // 3. 상호작용 테스트: 경고창의 CTA 버튼 클릭 시 동작을 모방
  test('should prevent action upon button click attempt', () => {
    // window.alert가 Jest Mock이 아니어서 에러가 발생하므로 스파이로 모킹합니다.
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ClientSideGatekeeperAlert riskScore={0.8} onProceed={() => {}} />);
    const button = screen.getByRole('button');

    // 버튼 클릭 이벤트를 발생시킵니다.
    fireEvent.click(button); 

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("시스템 위협 감지"));

    // 스파이 해제
    alertSpy.mockRestore();
  });
});
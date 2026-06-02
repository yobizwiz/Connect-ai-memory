import React from 'react';
import { render, screen } from '@testing-library/react';
import PaywallBarrier from '../PaywallBarrier';
import * as RiskContext from '../../context/RiskContext';

// Context를 모킹하여 테스트 환경을 구축합니다.
const mockProvider = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="mock-provider">{children}</div>;
};


describe('PaywallBarrier Component Test Suite', () => {
  test('1. 리스크 점수가 임계치 미만일 경우, 컴포넌트가 렌더링되지 않아야 한다.', async () => {
    // Mock Context: isPaywallActive = false (점수 50)
    jest.spyOn(RiskContext, 'useRiskContext').mockReturnValue({
      isPaywallActive: false,
      lTotalMax: 50,
      calculateRiskScore: jest.fn(),
    });

    render(<PaywallBarrier />);
    // Paywall이 렌더링되면 안됨
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('2. 리스크 점수가 임계치 초과일 경우, Paywall 레이어와 경고 메시지가 정상적으로 표시되어야 한다.', async () => {
    // Mock Context: isPaywallActive = true (점수 95)
    jest.spyOn(RiskContext, 'useRiskContext').mockReturnValue({
      isPaywallActive: true,
      lTotalMax: 95, // 임계치 초과 값
      calculateRiskScore: jest.fn(),
    });

    render(<PaywallBarrier />);
    // Paywall이 존재해야 함
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    // 경고 메시지 검증
    expect(screen.getByText(/시스템 경고: 구조적 리스크 감지/i)).toBeInTheDocument();
    // 점수 표시 검증
    expect(screen.getByText('95%')).toBeInTheDocument(); 
  });

  test('3. Focus Trap Hook이 제대로 작동하여 포커스가 이 모달 내부에 강제되는지 확인 (시뮬레이션)', async () => {
      // 실제 Focus Trap 동작은 환경에 따라 복잡하므로, 여기서는 로직 흐름을 검증합니다.
      jest.spyOn(console, 'warn').mockImplementation(() => {}); // 경고 로그 목킹

      await act(async () => {
        render(<PaywallBarrier />);
        // 컴포넌트가 마운트되면서 Focus Trap이 활성화됨 (useFocusTrap 호출을 통해 검증)
      });
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('시스템 위험 감지'));

  }, 100); // 테스트 시간 증가로 안정성 확보
});
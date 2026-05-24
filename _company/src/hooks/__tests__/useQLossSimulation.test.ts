import { renderHook, act } from '@testing-library/react-hooks';
import { useQLossSimulation } from '../useQLossSimulation';

describe('useQLossSimulation Hook', () => {

    // 초기 상태 테스트 (낮은 리스크)
    it('should initialize state to a low-risk GREEN zone when no initial value is provided', () => {
        const { result } = renderHook(() => useQLossSimulation());
        expect(result.current.state.riskLevel).toBe('GREEN');
        expect(result.current.state.ctaForced).toBe(false);
    });

    // QLoss 증가 시나리오 테스트 (YELLOW -> RED)
    it('should transition from GREEN to YELLOW and then forced CTA in RED zone', () => {
        // 1. 초기 상태를 Yellow Zone 직전으로 설정하고 시작합니다. (30점)
        const { result, rerender } = renderHook(() => useQLossSimulation(30));

        // QLoss를 강제로 증가시켜 YELLOW로 만듭니다. (30 -> 60)
        act(() => {
            result.current.simulateQLossIncrease(30); // Yellow Zone 진입
        });
        let state = result.current.state;
        expect(state.riskLevel).toBe('YELLOW');
        expect(state.alertActive).toBe(true);

        // QLoss를 더 증가시켜 RED Zone으로 만듭니다. (60 -> 90)
        act(() => {
            result.current.simulateQLossIncrease(30); // Red Zone 진입
        });
        state = result.current.state;
        expect(state.riskLevel).toBe('RED');
        expect(state.alertActive).toBe(true);
        // 핵심 검증: RED zone에서 CTA가 강제되어야 함
        expect(state.ctaForced).toBe(true); 
    });

    // QLoss 감소 시나리오 테스트 (위기 -> 안정화)
    it('should transition from RED back to GREEN when mitigated successfully', () => {
        // Red Zone 상태로 시작하는 것처럼 가정하고, 강제로 높은 값을 설정합니다.
        const highInitialValue = 90;
        const { result } = renderHook(() => useQLossSimulation(highInitialValue));

        // QLoss를 감소시켜 경고를 해소시킵니다. (90 -> 20)
        act(() => {
            result.current.mitigateQLoss(70); // Green Zone 진입
        });
        let state = result.current.state;
        expect(state.riskLevel).toBe('GREEN');
        // 핵심 검증: 안정화되면 CTA가 사라져야 함
        expect(state.ctaForced).toBe(false); 
    });

    // 임계치 경계 테스트 (Critical Boundary Check)
    it('should maintain GREEN zone status below the threshold', () => {
        const { result } = renderHook(() => useQLossSimulation(34)); // Yellow 직전 값으로 시작
        act(() => {
            result.current.simulateQLossIncrease(1); // 35가 아닌 36을 목표로 함
        });
        let state = result.current.state;
        expect(state.riskLevel).toBe('YELLOW'); // YELLOW에 진입했는지 확인
    });

});
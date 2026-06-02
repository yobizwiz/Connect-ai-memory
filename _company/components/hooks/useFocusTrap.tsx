import { useEffect, useRef } from 'react';

/**
 * @description Focus를 트랩(Trap)하는 커스텀 React Hook. 
 * 포커스를 지정된 요소 내부에서만 움직이게 강제하여 Paywall과 같은 중요한 영역의 무결성을 보장합니다.
 * @param ref - 포커싱을 적용할 DOM 엘리먼트 참조 (Ref Object)
 */
const useFocusTrap = (ref: React.RefObject<HTMLElement>) => {
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // 1. 포커스 관리 기능 구현
        const handleTabKey = (event: KeyboardEvent) => {
            // Tab 키가 눌렸을 때, 트랩 내부의 첫 번째/마지막 요소로 강제 포커싱합니다.
            if (event.key === 'Tab') {
                const focusableElements = element.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ) as NodeListOf<HTMLElement>;

                if (!focusableElements.length && event.shiftKey) return; // 포커스 가능한 요소가 없으면 무시

                const firstFocusable = focusableElements[0] as HTMLElement;
                const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (event.shiftKey) {
                    // Shift + Tab: 마지막 요소로 포커스 이동
                    lastFocusable.focus();
                    event.preventDefault();
                } else {
                    // Tab: 첫 번째 요소로 포커스 이동
                    firstFocusable.focus();
                    event.preventDefault();
                }
            }
        };

        element.addEventListener('keydown', handleTabKey);

        // 2. Cleanup 함수 정의 (컴포넌트 언마운트 시 이벤트 리스너 제거)
        return () => {
            element.removeEventListener('keydown', handleTabKey);
        };
    }, [ref]);
};

export default useFocusTrap;
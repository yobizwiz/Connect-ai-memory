import { useEffect, useRef } from 'react';

/**
 * @description Focus를 지정된 요소 내부에만 가두어 외부 상호작용을 차단하는 Hook (Accessibility 필수).
 * @param ref - 포커스를 가둘 컨테이너의 React Ref 객체.
 */
export const useFocusTrap = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 1. 키보드 이벤트 리스너 추가
    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab 키를 눌렀을 때 포커스가 트랩 경계를 넘어가지 않도록 처리
      if (event.key === 'Tab') {
        let focusedElement = document.activeElement as HTMLElement;
        const focusableElements = element.querySelectorAll(
          'button, [href], input:not([type="hidden"]), select, textarea', 
          '[tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (focusedElement === element.querySelector('a')?.parentElement || focusedElement === element) {
             // 포커스가 트랩의 시작점 또는 컨테이너 자체에 있다면, 마지막 포커스 가능 요소로 강제 이동
            const lastFocusable = focusableElements[focusableElements.length - 1];
            if (lastFocusable && !focusedElement.contains(lastFocusable)) {
                lastFocusable.focus();
                event.preventDefault();
            }
        } else if (['Shift', 'Tab'].includes(event.key) && focusedElement === focusableElements[0]) {
            // 첫 포커스 요소에서 Shift + Tab을 눌렀을 때, 마지막으로 포커스를 돌림
            const lastFocusable = focusableElements[focusableElements.length - 1];
            lastFocusable.focus();
            event.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    // Cleanup function: 컴포넌트 언마운트 시 이벤트 리스너 제거 (메모리 누수 방지)
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref]);
};
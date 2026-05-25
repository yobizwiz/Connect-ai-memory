import { useState, useEffect } from 'react';

/**
 * 주어진 ref 요소가 뷰포트 내에서 얼마나 진행되었는지 (0~1)를 관찰하는 커스텀 훅.
 * 스크롤 위치 변화에 따라 이 값을 업데이트하여 QLoss와 같은 시스템적 위험도를 측정합니다.
 * @param elementRef - 관측 대상 DOM 요소를 참조할 React Ref 객체.
 * @returns {number} 0 (아직 안 보임)부터 1 (완전히 보임) 사이의 진행률 값.
 */
const useScrollProgressObserver = (elementRef: React.RefObject<HTMLElement>): [React.RefObject<HTMLElement>, number] => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        if (!elementRef.current) {
            return () => {};
        }

        const observerOptions = {
            root: null, // 뷰포트 기준
            rootMargin: '0px',
            threshold: [0.1, 0.5, 0.9] // 10%, 50%, 90% 지점에서 콜백 발생하도록 설정 (세밀한 제어)
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // isIntersecting: 현재 보이는지 여부
                // intersectionRatio: 보여지는 비율 (0~1)
                if (entry.isIntersecting) {
                    // 스크롤 진행률을 인터섹션 비율로 설정합니다.
                    setScrollProgress(entry.intersectionRatio);
                } else if (entry.boundingClientRect.top > window.innerHeight + 50) {
                    // 요소가 뷰포트 아래에 멀리 떨어져 있으면, 리스크를 초기화 상태로 가정하거나 낮은 값 유지
                    setScrollProgress(0);
                }
            });
        }, observerOptions);

        observer.observe(elementRef.current);

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current); // 클린업 함수: Observer 해제
            }
        };
    }, [elementRef, elementRef.current]);

    // React Ref 객체와 현재 스크롤 진행률을 반환합니다.
    return [elementRef, scrollProgress];
};

export default useScrollProgressObserver;
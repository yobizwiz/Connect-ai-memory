import React, { useState, useEffect } from 'react';
import './RedFlash.css'; // 위에서 정의한 CSS 임포트

/**
 * [근거: 🏢 회사 정체성] 결제 강제를 유도하는 필수 게이트키퍼 로직의 시각적 표현입니다.
 * @param {number} initialSeconds - 카운트다운 시작 초 (예: 300초 = 5분)
 */
const CountdownTimer = ({ initialSeconds }) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);

    useEffect(() => {
        if (timeLeft <= 0) return; // 시간이 끝나면 타이머 중지

        // 매 초마다 시간 감소 로직 실행
        const timerInterval = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        // 클린업 함수: 컴포넌트 언마운트 시 인터벌 정리
        return () => clearInterval(timerInterval);
    }, [timeLeft]);

    // 초 단위를 시간, 분, 초로 변환하는 유틸리티 함수
    const formatTime = (unit) => String(unit).padStart(2, '0');

    // ⏰ 글리치/위협 시뮬레이션 로직: 주기적으로 타이머에 임시 오류 클래스 적용
    useEffect(() => {
        if (timeLeft > 0) {
            const glitchTimer = setInterval(() => {
                // 무작위로 시간 단위 중 하나를 선택하여 깜빡임 효과 부여
                const units = ['h', 'm', 's'];
                const randomUnit = units[Math.floor(Math.random() * units.length)];

                const timeUnits = Math.floor(timeLeft / 3600); // h
                const minutes = Math.floor((timeLeft % 3600) / 60); // m
                const seconds = timeLeft % 60; // s

                // 랜덤하게 깜빡임 효과를 주는 시간 단위의 state 업데이트 (UI 깜빡임 유도)
                // 실제 구현에서는 RedFlash.css에 정의된 'critical-fail' 클래스를 JS로 토글해야 함.
            }, 3000); // 3초마다 시각적 오류 발생을 가정

            return () => clearInterval(glitchTimer);
        }
    }, [timeLeft]);


    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="countdown-container">
            {/* 시간 (Hours) */}
            <div className="time-unit">
                <span className="time-digit glitch-text" data-text={formatTime(hours)}>{formatTime(hours)}</span>
                <span>시간</span>
            </div>

            {/* 분 (Minutes) */}
            <div className="time-unit">
                <span 
                    className={`time-digit glitch-text ${timeLeft % 3 === 0 ? 'critical-fail' : ''}`} 
                    data-text={formatTime(minutes)}
                >{formatTime(minutes)}</span>
                <span>분</span>
            </div>

            {/* 초 (Seconds) */}
            <div className="time-unit">
                <span 
                    className={`time-digit glitch-text ${timeLeft % 3 === 0 ? 'critical-fail' : ''}`} 
                    data-text={formatTime(seconds)}
                >{formatTime(seconds)}</span>
                <span>초</span>
            </div>
        </div>
    );
};

export default CountdownTimer;
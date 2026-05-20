import React, { useState } from 'react';
import './RedFlash.css'; // 위에서 정의한 CSS 임포트

/**
 * [근거: Self-RAG - 경고 메시지 구조]
 * Red Flash 상태에 진입했을 때 전역적으로 보여줘야 하는 강력하고 반복적인 경고 배너 컴포넌트입니다.
 * @param {string} title - 배너의 제목 (예: CRITICAL SYSTEM WARNING)
 * @param {string} message - 핵심 위험 메시지
 */
const AlertBanner = ({ title, message }) => {
    // [근거: Self-RAG] 모든 경고는 글리치 효과를 통해 불안정성을 강조해야 합니다.
    return (
        <div className="red-flash-banner">
            <h2 className="glitch-text" data-text={title}>⚠️ {title}</h2>
            <p>{message}</p>
        </div>
    );
};

export default AlertBanner;
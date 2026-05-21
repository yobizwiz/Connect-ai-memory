import React from 'react';
import './RedZoneSystem.css'; // 스타일 임포트

/**
 * GlitchText Component: 글리치 효과가 적용된 텍스트 컴포넌트.
 * @param {string} text - 표시할 원본 문자열
 * @returns {JSX.Element}
 */
const GlitchText = ({ text }) => {
    // CSS의 data-text 속성을 사용하여 ::before, ::after가 내용을 가져오게 함 (Self-RAG 기법)
    return <span className="glitch-text" data-text={text}>{text}</span>;
};

export default GlitchText;
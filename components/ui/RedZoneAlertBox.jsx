import React from 'react';
import './RedZoneSystem.css'; // 스타일 임포트

/**
 * RedZoneAlertBox Component: 치명적 오류를 나타내는 인터랙티브 경고 박스.
 * @param {string} message - 표시할 핵심 메시지 (예: "CRITICAL ERROR")
 * @returns {JSX.Element}
 */
const RedZoneAlertBox = ({ message }) => {
    return (
        <div className="red-zone-alert-box">
            🚨 CRITICAL ALERT SYSTEM FAILURE 🚨 <br />
            <strong>{message}</strong>
        </div>
    );
};

export default RedZoneAlertBox;
import React from 'react';
import { getDesignTokens } from '../utils/designTokensLoader';

interface GlitchOverlayProps {
    isVisible: boolean;
}

/**
 * 전체 화면을 덮는 글리치 노이즈 오버레이 컴포넌트.
 * Paywall 진입 시 강제적으로 사용자에게 불안감을 조성하는 역할을 합니다.
 */
const GlitchOverlay: React.FC<GlitchOverlayProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    // Design Token을 사용하여 글리치 색상을 가져옵니다.
    const tokens = getDesignTokens();
    const glitchColor = tokens?.color['color-threat-red'] || '#FF0000'; 

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity duration-500 animate-in fade-in">
            {/* Glitch Noise Effect */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-[.1] overflow-hidden" 
                style={{ 
                    backgroundImage: `repeating-linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.3) ${Math.random() * 1 + 'px'} 0), repeating-linear-gradient(0deg, transparent, rgba(255, 0, 0, 0.3) ${Math.random() * 1 + 'px'} 0)`,
                    backgroundSize: `${Math.random() * 100}% ${Math.random() * 100}%`,
                }}
            ></div>

            {/* 실제 콘텐츠는 자식 컴포넌트가 처리 */}
        </div>
    );
};

export default GlitchOverlay;
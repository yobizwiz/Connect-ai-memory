import React from 'react';

/**
 * @description 시스템 오류를 시각적으로 표현하는 오버레이 컴포넌트.
 * 실제 애니메이션은 CSS Modules에서 처리됨.
 */
interface GlitchOverlayProps {
  isVisible?: boolean;
}

const GlitchOverlay: React.FC<GlitchOverlayProps> = ({ isVisible }) => {
  if (isVisible === false) return null;
  return (
    <div className="glitch-overlay" aria-hidden="true">
      {/* 이 영역에 복잡한 SVG/CSS 애니메이션 코드가 들어가야 합니다. */}
      <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          pointerEvents: 'none', zIndex: 999 // 다른 요소에 영향을 주지 않도록 함
        }}>
            {/* 실제 애니메이션을 위한 Placeholder */}
            <span style={{opacity: 0.2, color: 'red'}}>[SYSTEM ERROR GLITCH NOISE PLACEHOLDER]</span>
        </div>
    </div>
  );
};

export default GlitchOverlay;
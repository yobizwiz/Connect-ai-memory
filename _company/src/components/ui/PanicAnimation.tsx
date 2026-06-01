import React from 'react';
import './PanicAnimation.css';

interface PanicAnimationProps {
  isActive: boolean;
}

const PanicAnimation: React.FC<PanicAnimationProps> = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <div className="panic-overlay">
      {/* Glitch Noise & Neon Scanline Effect */}
      <style>{`
        @keyframes glitchScanline {
            from { transform: translateY(0%); opacity: 1; }
            to { transform: translateY(-100%); opacity: 0.5; }
        }
        .panic-overlay::after {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 100%; bottom: 0;
            background: repeating-linear-gradient(
                0deg, transparent, transparent 98%, rgba(192, 57, 43, 0.2) 100%
            );
            animation: glitchScanline 0.5s linear infinite alternate;
            pointer-events: none; /* 클릭 방해 금지 */
        }
      `}</style>
    </div>
  );
};

export default PanicAnimation;</code>
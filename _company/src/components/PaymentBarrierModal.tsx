import React from 'react';
import { Modal } from 'antd'; // 가정한 UI 라이브러리 사용
// 공용 스타일과 B2B 톤을 유지합니다.

interface PaymentBarrierModalProps {
  isVisible: boolean;
  onClose: () => void;
  estimatedLoss: number; // $L_{totalMax}$ 값 전달받기
}

/**
 * Paywall Barrier Modal Component
 * 진단 결과가 심각하여 추가 분석(유료)이 필수임을 고지하는 컴포넌트.
 */
const PaymentBarrierModal: React.FC<PaymentBarrierModalProps> = ({ 
  isVisible, 
  onClose, 
  estimatedLoss 
}) => {

  // $L_{totalMax}$를 포맷팅하여 표시합니다.
  const formattedLoss = Math.round(estimatedLoss / 1000) * 10 + "억 원";

  return (
    <Modal
      title={({ statusBarComponent }) => (
        <>
          {/* B2B 콘솔 스타일의 경고 바를 여기에 위치시킬 수 있습니다 */}
          <div style={{ color: '#ff4d4d', fontSize: '16px', fontWeight: 'bold' }}>
            🚨 [CRITICAL ALERT] 진단 결과 분석 완료. 즉각적인 조치가 필수적입니다.
          </div>
        </>
      )}
      open={isVisible}
      onCancel={onClose}
      footer={null} // 기본 닫기 버튼 숨김
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        {/* 공포 유발 요소: 금액을 크게 표시 */}
        <h1 style={{ color: '#cc3333', fontSize: '3rem', marginBottom: '15px' }}>
          잠재적 총 손실액 추정치: {formattedLoss}
        </h1>

        <p style={{ fontSize: '1.2rem', marginBottom: '30px', lineHeight: 1.6 }}>
          현재 진단된 리스크 Gap을 메우고, 비즈니스를 구조적으로 보호하기 위해서는 <br />
          **'Ultimate Compliance Report (전문가 심층 분석)'**이 필수적입니다. 이 보고서는 단순한 체크리스트를 넘어, 귀사의 프로세스 흐름 전체에 대한 근본적인 취약점을 식별합니다.
        </p>

        {/* 핵심 CTA 버튼: Paywall */}
        <button 
          onClick={() => {
            // 실제 결제 로직 호출 (Stripe API 연동)
            console.log('Paywall triggered for amount:', estimatedLoss);
            alert('결제 시스템으로 이동합니다. $L_{totalMax}$에 대한 해결책을 구매하십시오.');
            onClose(); 
          }}
          style={{ 
            padding: '12px 30px', 
            fontSize: '1.1rem', 
            backgroundColor: '#007bff', // 권위적인 파란색 계열
            color: 'white', 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          ✅ Ultimate Compliance Report 구매하기 (지금 즉시 리스크 해소)
        </button>
      </div>
    </Modal>
  );
};

export default PaymentBarrierModal;
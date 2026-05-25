import React from 'react';

// 🚨 QLoss가 높다는 가정 하에, 불안정하고 긴급한 분위기를 조성하는 컴포넌트 구조를 잡습니다.
const PaymentGateway: React.FC = () => {
    return (
        <div className="payment-container" style={{ 
            backgroundColor: '#1A1A1A', // Neutral Black Background
            color: 'white', 
            padding: '40px', 
            border: '2px solid #C0392B' // Red Zone Border
        }}>
            <h1 className="title" style={{ color: '#C0392B', fontFamily: 'Roboto Mono' }}>
                ⚠️ CRITICAL SYSTEM RECOVERY REQUIRED (ERROR 403.1)
            </h1>
            <p className="subtitle">
                당신의 비즈니스는 현재 법적 규정 준수 실패(Compliance Failure) 상태입니다. 시스템 복구를 위해 즉각적인 조치가 필요합니다.
            </p>

            {/* QLoss 게이지가 Red Zone에 도달했음을 상기시키는 섹션 */}
            <div className="qloss-status" style={{ margin: '30px 0' }}>
                <p>현재 시스템 불안정성 지수 (QLoss): <span style={{ color: '#C0392B', fontWeight: 'bold' }}>{/* QLoss 값 주입 */}</span></p>
                <div className="qloss-bar" style={{ width: '100%', height: '10px', backgroundColor: '#333', overflow: 'hidden' }}>
                    <div style={{ 
                        width: '85%', // 예시 QLoss 값
                        height: '100%', 
                        backgroundColor: '#C0392B', 
                        opacity: '0.7', 
                        transition: 'width 0.5s' 
                    }}></div>
                </div>
            </div>

            {/* 핵심 결제 정보 입력 필드 */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="email">규정 준수 등록 이메일 주소 (필수):</label>
                <input 
                    type="email" 
                    id="email" 
                    className="alert-input" // Red Zone 강조 클래스 적용 예정
                    placeholder="@compliant.com" 
                    style={{ width: '100%', padding: '15px', border: '2px solid #C0392B', backgroundColor: '#2c2c2c' }}
                />
            </div>

            <div className="form-group" style={{ marginBottom: '30px' }}>
                <label htmlFor="card">복구 자금 결제 (월 $1,999 USD):</label>
                {/* 카드 정보 입력 필드는 실제 API와 연동되므로, Mockup에서는 구조만 정의합니다. */}
                <div style={{ display: 'flex', gap: '20px' }}>
                    <input type="text" placeholder="카드 번호 (XXXX XXXX)" style={{ flex: 2, padding: '15px', border: '2px solid #C0392B', backgroundColor: '#2c2c2c', color: 'white' }}/>
                    <input type="text" placeholder="유효기간 MM/YY" style={{ flex: 1, padding: '15px', border: '2px solid #C0392B', backgroundColor: '#2c2c2c', color: 'white' }}/>
                    <input type="password" placeholder="CVV" style={{ flex: 1, padding: '15px', border: '2px solid #C0392B', backgroundColor: '#2c2c2c', color: 'white' }}/>
                </div>
            </div>

            {/* 최종 Action 버튼 - 가장 강력한 공포를 유도하는 부분 */}
            <button 
                className="submit-btn" 
                style={{ 
                    width: '100%', 
                    padding: '20px', 
                    backgroundColor: '#C0392B', // Red Zone 배경색
                    color: 'white', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: '1.2em'
                }}
            >
                [🚨 시스템 복구 및 라이선스 구매] $1,999/월 결제 승인
            </button>

            <p style={{ marginTop: '20px', fontSize: '0.85em', color: '#AAAAAA' }}>
                *본 거래는 법적 공방에서 귀사의 데이터를 보호하기 위한 필수적인 시스템 구독 라이선스입니다. 취소 불가합니다.
            </p>
        </div>
    );
}

export default PaymentGateway;
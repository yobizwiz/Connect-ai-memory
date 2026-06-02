import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

// @/types/globalTypes (가정)에서 가져온 타입 사용
interface PaywallProps {
    finalLossAmountLmax: number; // 최종 계산된 최대 재정 손실액 ($L_{max}$)
    onProceed: () => void;      // 결제 성공 시 호출할 콜백 함수
}

/**
 * [GlassmorphismPaywall] - 리스크 진단 서비스의 유료 접근 장벽 모달
 * @param {PaywallProps} props 
 */
const GlassmorphismPaywall: React.FC<PaywallProps> = ({ finalLossAmountLmax, onProceed }) => {

    // $L_{max}$를 네온 레드 강조로 포매팅 (예: $120,000)
    const formattedLmax = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(finalLossAmountLmax);

    return (
        <View style={styles.overlayContainer}>
            {/* 배경 오버레이 */}
            <View style={styles.backdrop} />

            {/* Paywall 카드 - 글래스모피즘 효과 */}
            <View style={[styles.paywallCard, { 
                transform: [{ scale: 1 }] // 초기 스케일로 설정 (애니메이션 전)
            }]}>
                
                {/* 상단 경고 배너: 네온 레드/글리치 강조 */}
                <View style={styles.warningBanner}>
                    <Text style={styles.warningText}>🚨 WARNING: 접근 제한</Text>
                    <Text style={styles.subtitleText}>진단 보고서의 전체 구조를 보기 위해서는 필수 라이선스가 필요합니다.</Text>
                </View>

                {/* 핵심 $L_{max}$ 노출 */}
                <View style={styles.lmaxContainer}>
                    <Text style={styles.lmaxLabel}>당신의 잠재적 최대 재정 손실 ($L_{max}):</Text>
                    <Text style={styles.lmaxAmount}>{formattedLmax}</Text>
                    <Text style={styles.lmaxWarning}>이 금액은 최소한의 안전장치입니다.</Text>
                </View>

                {/* CTA 영역 */}
                <TouchableOpacity 
                    style={[styles.paywallButton, { backgroundColor: '#FF0055' }]} // 네온 레드 색상
                    onPress={() => {
                        console.log("Payment initiated for:", finalLossAmountLmax);
                        // 실제 결제 API 호출 로직이 여기에 들어갑니다 (Stripe/Braintree 등)
                        alert(`결제 프로세스 시작: ${formattedLmax}로 유료 진단 리포트 접근 시도.`);
                        onProceed(); // Mock Success
                    }}
                >
                    <Text style={styles.buttonText}>💎 전문 보고서 해제 및 결제 진행</Text>
                </TouchableOpacity>

                {/* 하단 안내 */}
                <View style={styles.footerNote}>
                    <Text style={styles.footerText}>결제는 100% 안전하며, 귀하의 비즈니스 연속성 확보에만 사용됩니다.</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // 어두운 오버레이
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(25, 30, 45, 0.9)', // 글래스 배경색
        borderWidth: 1,
        borderColor: '#00FFFF', // 사이언 네온 테두리
        borderRadius: 15,
        padding: 30,
        zIndex: -1,
    },
    paywallCard: {
        width: '90%',
        backgroundColor: 'rgba(25, 30, 45, 0.7)', // 글래스 효과를 위한 배경색 (반투명)
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#00FFFF', // 네온 그림자
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 20,
    },
    warningBanner: {
        width: '100%',
        paddingVertical: 15,
        backgroundColor: 'rgba(255, 0, 85, 0.2)', // 네온 레드 배경 (낮은 투명도)
        borderLeftWidth: 5,
        borderLeftColor: '#FF0055', // 강조 색상
        marginBottom: 20,
        alignItems: 'center',
    },
    warningText: {
        color: '#FF6699', // 네온 레드 텍스트
        fontSize: 22,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    subtitleText: {
        marginTop: 5,
        color: '#CCCCCC',
        textAlign: 'center',
    },
    lmaxContainer: {
        alignItems: 'center',
        marginVertical: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    lmaxLabel: {
        color: '#AAAAAA',
        fontSize: 16,
        marginBottom: 5,
    },
    lmaxAmount: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FF0055', // $L_{max}$ 금액을 가장 강한 네온 레드로 표시
        textShadowColor: '#FF0055',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    lmaxWarning: {
        marginTop: 10,
        color: '#FFAA00', // 경고성 노란색/주황색
        fontSize: 14,
    },
    paywallButton: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#FF0055', // 버튼에도 네온 그림자 적용
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    footerNote: {
        marginTop: 25,
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        color: '#666666',
        fontSize: 13,
        textAlign: 'center',
    }
});

export default GlassmorphismPaywall;
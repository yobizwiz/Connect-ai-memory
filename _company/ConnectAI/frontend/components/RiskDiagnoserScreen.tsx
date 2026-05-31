import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Dimensions } from 'react-native';
import axios from 'axios';

// 환경 설정 (Backend API Endpoint)
const API_URL = "http://localhost:8000/api/v1/risk-diagnosis"; 

// --- 1. 타입 정의 및 상수 ---
type DiagnosisStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';
type UIState = 'INITIAL' | 'LOADING' | 'GLITCH_NOTICE' | 'PAYWALL_BARRIER';

interface RegulatoryDataInput {
    regulatory_gap_score: number; // 0-100
    exposure_type: string;       // PII, Financial, Operational
    historical_violation_count: number; // 횟수
}

interface DiagnosisResultMockup {
    risk_score: number;
    l_min_saved: number;
    diagnosis_status: DiagnosisStatus;
    next_ui_state: UIState;
    message: string;
}

// --- 2. Mock API 호출 함수 (실제로는 axios를 사용) ---
const fetchDiagnosis = async (data: RegulatoryDataInput): Promise<DiagnosisResultMockup> => {
    console.log("API Calling with:", data);
    try {
        // 백엔드와 통신하는 로직을 모킹합니다. 
        // 실제 환경에서는 axios.post(API_URL, data).data를 사용해야 합니다.
        await new Promise(resolve => setTimeout(resolve, 1500)); // 네트워크 지연 시뮬레이션

        // --- Mock Backend Response Simulation (실제 API 결과와 동일하게 구조화) ---
        if (data.regulatory_gap_score > 70 && data.exposure_type === "Financial") {
             return {
                risk_score: 85.42,
                l_min_saved: 316.0,
                diagnosis_status: 'CRITICAL',
                next_ui_state: 'PAYWALL_BARRIER',
                message: "🚨 경고: 리스크 점수(85.42)가 임계치를 초과했습니다. 즉각적인 전문 진단이 필요합니다."
            };
        } else if (data.regulatory_gap_score > 30 || data.historical_violation_count >= 2) {
             return {
                risk_score: 45.1,
                l_min_saved: 8.0,
                diagnosis_status: 'WARNING',
                next_ui_state: 'GLITCH_NOTICE',
                message: "⚠️ 주의: 리스크 점수(45.1)가 높아지고 있습니다. 더 깊은 분석이 필요합니다."
            };
        } else {
             return {
                risk_score: 12.3,
                l_min_saved: 0.0,
                diagnosis_status: 'NORMAL',
                next_ui_state: 'NORMAL',
                message: "✅ 진단 완료: 현재 리스크 점수(12.3)는 허용 범위 내입니다."
            };
        }

    } catch (error) {
        console.error("API Call Failed:", error);
        throw new Error("Failed to connect to diagnosis API.");
    }
};


// --- 3. 컴포넌트 로직 ---
const RiskDiagnoserScreen: React.FC = () => {
    const [data, setData] = useState<RegulatoryDataInput>({
        regulatory_gap_score: 50,
        exposure_type: 'Financial',
        historical_violation_count: 1
    });
    const [uiState, setUiState] = useState<UIState>('INITIAL');
    const [result, setResult] = useState<DiagnosisResultMockup | null>(null);
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    // 🚨 핵심 로직: 진단 실행 핸들러
    const handleDiagnose = useCallback(async () => {
        setUiState('LOADING');
        setResult(null);
        try {
            const diagnosisResult = await fetchDiagnosis(data);
            setResult(diagnosisResult);
            // 다음 상태로 강제 전환
            setUiState(diagnosisResult.next_ui_state === 'PAYWALL_BARRIER' ? 'PAYWALL_BARRIER' : diagnosisResult.next_ui_state);

        } catch (error) {
            alert("진단 실패: 서버 연결을 확인해주세요.");
            setUiState('INITIAL');
        }
    }, [data]);


    // --- 4. 상태별 렌더링 로직 ---

    const renderContent = () => {
        if (uiState === 'LOADING') {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={styles.subtext}>시스템 진단 중... 리스크 패턴을 분석합니다.</Text>
                </View>
            );
        }

        if (uiState === 'GLITCH_NOTICE') {
             // Glitch Noise 효과 시뮬레이션
            Animated.timing(animatedValue, { toValue: 1, duration: 500, useNativeAnimation: true }).start();
            return (
                <View style={[styles.container, styles.glitchContainer]}>
                    <Text style={styles.title}>{result?.message}</Text>
                    <Text style={styles.subtext}>(Glitch Noise Active)</Text>
                    {/* ... 추가 경고 UI 요소 */}
                </View>
            );
        }

        if (uiState === 'PAYWALL_BARRIER') {
             // Paywall Barrier 모달 시뮬레이션
            return (
                <View style={styles.paywallOverlay}>
                    <View style={styles.paywallContent}>
                        <Text style={styles.paywallTitle}>🚨 시스템 접근 금지: 재무적 위험 경고</Text>
                        <Text style={styles.paywallSubtext}>{result?.message}</Text>
                        <Text style={styles.savedValue}>회피 가능 잠재 손실액 (L_saved): ${result?.l_min_saved.toFixed(1)}+</Text>
                        <TouchableOpacity 
                            style={styles.ctaButton} 
                            onPress={() => alert("💳 Premium 결제 모달 열림 (강제 전환 성공)")}
                        >
                            <Text style={styles.ctaText}>전문 진단 보고서 구매하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        if (uiState === 'NORMAL' && result) {
             // 정상 결과 화면
            return (
                <View style={styles.container}>
                    <Text style={[styles.title, styles[`${result.diagnosis_status.toLowerCase()}-text`] ]}>{result.message}</Text>
                    <Text style={styles.subtext}>진단 완료. 현재 리스크 수준은 ${result.risk_score.toFixed(2)}로 안전합니다.</Text>
                </View>
            );
        }

        // 초기 상태 또는 오류 시
        return (
            <View style={styles.container}>
                 <Text style={styles.title">리스크 진단 시스템 시작</Text>
                 <Text style={styles.subtext}>규제 데이터를 입력하고 '진단하기' 버튼을 눌러보세요.</Text>
            </View>
        );
    };

    return (
        <View style={styles.screen}>
            {/* 1. Input Form */}
            <View style={styles.inputCard}>
                <Text style={styles.label}>규제 공백 점수 (0-100):</Text>
                <input type="range" min="0" max="100" value={data.regulatory_gap_score} onChange={(e) => setData({...data, regulatory_gap_score: parseFloat(e.target.value)})}/>

                <Text style={[styles.label, {marginTop: 15}]}>노출 유형:</Text>
                {/* 실제로는 Dropdown 사용 */}
                <select value={data.exposure_type} onChange={(e) => setData({...data, exposure_type: e.target.value})}>
                    <option value="Financial">💰 금융 (가장 높음)</option>
                    <option value="PII">👤 개인정보 (높음)</option>
                    <option value="Operational">🛠️ 운영 (중간)</option>
                </select>

                 <Text style={[styles.label, {marginTop: 15}]}>과거 위반 횟수:</Text>
                <input type="number" min="0" max="10" value={data.historical_violation_count} onChange={(e) => setData({...data, historical_violation_count: parseInt(e.target.value)})}/>

            </View>
            
            {/* 2. Action Button */}
            <TouchableOpacity style={styles.diagnoseButton} onPress={handleDiagnose}>
                <Text style={styles.buttonText}>🔍 리스크 진단 시작 ({uiState === 'LOADING' ? '진행 중...' : '진단하기'})</Text>
            </TouchableOpacity>

            {/* 3. Dynamic Result Display */}
            <View style={styles.resultContainer}>
                {renderContent()}
            </View>
        </View>
    );
};

// --- 5. 스타일링 (Simplified for brevity) ---
const styles = StyleSheet.create({
    screen: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
    inputCard: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 10, color: '#333' },
    subtext: { fontSize: 14, color: '#666', marginVertical: 10 },
    title: { fontSize: 28, fontWeight: '900', marginBottom: 10 },
    diagnoseButton: { backgroundColor: '#FFD700', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 30 },
    buttonText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
    resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // --- 상태별 스타일링 ---
    glitchContainer: {
        backgroundColor: '#0d0d0d', // 어둡고 불안한 배경
        padding: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ff0000',
        shadowOpacity: 0.8,
        elevation: 10,
    },
    paywallOverlay: {
        ...StyleSheet.absoluteFillObject, // 전체 화면을 덮음
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100, // 가장 높은 레이어에 위치
    },
    paywallContent: {
        backgroundColor: '#2c3e50', // 다크 블루/블랙 느낌
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#ff0000', // 네온 레드 강조
        shadowOpacity: 1,
        elevation: 50,
    },
    paywallTitle: {
        fontSize: 32,
        color: '#FF4757', // 강렬한 빨간색
        fontWeight: 'bold',
        marginBottom: 15,
    },
    paywallSubtext: {
        fontSize: 18,
        color: '#ccc',
        textAlign: 'center',
        marginVertical: 20,
    },
    savedValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#34e85a', // 녹색 (희망/해결책)
        marginBottom: 30,
    },
    ctaButton: {
        backgroundColor: '#FFD700', // 강제 CTA 버튼 색상
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginTop: 20,
    },
    ctaText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },

    // --- 결과 상태별 스타일링 ---
    'critical-text': { color: '#FF4757', fontSize: 22, fontWeight: '900' },
    'warning-text': { color: '#ffc107', fontSize: 22, fontWeight: 'bold' },
    'safe-text': { color: '#28a745', fontSize: 22, fontWeight: '900' }

});

export default RiskDiagnoserScreen;
from typing import Dict, Any
# [근거: 💻 코다리 개인 메모리] 자가 검증 루프를 위해 서비스 계층을 분리합니다.
import logging

logging.basicConfig(level=logging.INFO)

def calculate_tre(metrics: Dict[str, float]) -> tuple[float, str]:
    """
    Master Risk Schema와 Business의 $TRE$ 공식을 기반으로 총 위험 노출도(TRE)를 계산합니다.
    정확한 공식은 외부 지식 베이스에 있지만, 여기서는 구조적 무결성을 위해 가상의 가중치 모델을 사용합니다.
    TRE = (Weight_GDPR * Metric_PII) + (Weight_HIPAA * Metric_Health) + ... 
    """
    # [근거: Self-RAG] 실제 코드를 Mocking 합니다.
    
    try:
        tre_value = 0.0
        
        # 가상의 KPI와 가중치 정의 (실제 구현 시, 이 가중치는 Business가 결정)
        weights = {
            "PII": 3.5,  # Personally Identifiable Information
            "HealthRecord": 4.2, # HIPAA 관련 기록
            "ComplianceDrift": 2.8, # 규정 준수 드리프트
            "AI_AttributionRisk": 1.9 # AI 출처 무효화 위험
        }

        for key, weight in weights.items():
            # 입력 메트릭이 존재하고 양수인 경우에만 계산에 포함합니다.
            metric = metrics.get(key)
            if metric is not None and isinstance(metric, (int, float)) and metric >= 0:
                tre_value += weight * metric
        
        return round(tre_value, 2), f"{tre_value:.2f}"

    except Exception as e:
        logging.error(f"TRE 계산 중 오류 발생: {e}")
        # 실패 시 안전한 폴백 값 반환
        return 0.0, "0.00"


def diagnose_risk(input_data: Any) -> tuple[float, str, bool, str]:
    """
    TRE 값을 받아 위험 등급 및 구조적 공백 진단 여부를 판단합니다.
    이 함수가 '위기감'을 주입하는 핵심 로직입니다.
    """
    metrics = input_data.raw_risk_metrics
    calculated_tre, _ = calculate_tre(metrics)

    # 1. 임계값 체크 및 경고 메시지 생성 (Glitch Noise Trigger)
    CRITICAL_THRESHOLD = 50.0 # 예시 임계값
    WARNING_THRESHOLD = 20.0  # 예시 임계값
    
    is_critical = calculated_tre >= CRITICAL_THRESHOLD
    alert_message = "시스템 정상 작동."

    if is_critical:
        alert_message = (f"🚨 [SYSTEM ALERT] 총 위험 노출도(TRE)가 {CRITICAL_THRESHOLD}를 초과했습니다. "
                         "치명적인 구조적 공백이 감지되었습니다. 즉시 진단이 필요합니다.")
    elif calculated_tre >= WARNING_THRESHOLD:
        alert_message = (f"⚠️ [WARNING] 총 위험 노출도(TRE)가 {WARNING_THRESHOLD}를 초과하여 주의가 필요합니다. "
                         "일부 컴플라이언스 영역에서 드리프트 현상이 감지되었습니다.")

    # 2. 구조적 공백 진단 (System Integrity Audit 체크리스트 기반)
    structural_gap = False
    if metrics.get("AI_AttributionRisk", 0) > 15.0 or metrics.get("ComplianceDrift", 0) > 10.0:
        # 특정 지표가 높으면 구조적 공백으로 간주하고 플래그를 설정합니다.
        structural_gap = True

    risk_level = "SAFE"
    if is_critical:
        risk_level = "CRITICAL (Red Zone)"
    elif calculated_tre >= WARNING_THRESHOLD:
        risk_level = "WARNING (Orange Zone)"
    else:
        risk_level = "LOW (Green Zone)"

    return calculated_tre, risk_level, structural_gap, alert_message
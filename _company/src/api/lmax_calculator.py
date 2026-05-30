from typing import TypedDict, List, Optional
import math

# --- 1. 데이터 계약 정의 (Pydantic 대신 Python Type Hint 사용) ---

class InputMetrics(TypedDict):
    """L_max 계산에 필요한 모든 입력 변수."""
    regulatory_severity: int  # V_reg (1-5점)
    data_sensitivity: int     # V_data (1-5점)
    failure_frequency: int    # V_fail (횟수)
    avg_hourly_revenue: float # V_op ($/hour)
    trust_degradation_rate: float # V_trust (%)
    provenance_confidence: float # V_prov (%)

class LMaxResult(TypedDict):
    """최종 계산 결과 구조."""
    total_lmax: float
    breakdown: dict[str, float]

# --- 2. 핵심 로직 함수 정의 (Single Responsibility Principle 준수) ---

def calculate_regulatory_fine(metrics: InputMetrics) -> float:
    """규제 위반 중대성 및 데이터 민감도 기반의 벌금 계산."""
    # 근거: L_max 공식 내 'Fines' 부분
    # 로직 가정: (Severity * Sensitivity * 1000) + (Failure Count * 500)
    fine = (metrics['regulatory_severity'] * metrics['data_sensitivity'] * 1000.0) + \
           (metrics['failure_frequency'] * 500.0)
    return round(fine, 2)

def calculate_operational_loss(metrics: InputMetrics) -> float:
    """시스템 마비 및 절차적 실패로 인한 운영 손실 계산."""
    # 근거: L_max 공식 내 'Operational Loss' 부분
    # 로직 가정: (Hourly Revenue * Failure Frequency) + (Revenue * Trust Degradation Rate / 100)
    loss = (metrics['avg_hourly_revenue'] * metrics['failure_frequency']) + \
           (metrics['avg_hourly_revenue'] * metrics['trust_degradation_rate'] / 100.0)
    return round(loss, 2)

def calculate_intangible_loss(metrics: InputMetrics) -> float:
    """신뢰도 하락 및 출처 불명확성 기반의 잠재적 손실 계산."""
    # 근거: L_max 공식 내 'Intangible Loss' 부분
    # 로직 가정: (Trust Degradation Rate * Provenance Confidence * 10)
    intangible = metrics['trust_degradation_rate'] * metrics['provenance_confidence'] * 10.0
    return round(intangible, 2)

def calculate_lmax(metrics: InputMetrics) -> LMaxResult:
    """
    주어진 메트릭을 기반으로 최대 예상 손실액 (L_max) 전체를 계산하는 통합 API 엔드포인트 로직.
    """
    # 1. 개별 리스크 축 분해 및 계산
    regulatory_fine = calculate_regulatory_fine(metrics)
    operational_loss = calculate_operational_loss(metrics)
    intangible_loss = calculate_intangible_loss(metrics)

    # 2. 최종 합산 (L_max 공식 적용)
    total_lmax = regulatory_fine + operational_loss + intangible_loss

    # 3. 결과 구조화
    breakdown: dict[str, float] = {
        "Regulatory Fine": regulatory_fine,
        "Operational Loss": operational_loss,
        "Intangible Loss": intangible_loss,
    }

    return LMaxResult(total_lmax=round(total_lmax, 2), breakdown=breakdown)

# --- API 모듈 테스트를 위한 더미 함수 (FastAPI 엔드포인트에서 호출될 예정) ---
async def get_lmax_endpoint(metrics: InputMetrics) -> LMaxResult:
    """실제 FastAPI Endpoint 역할을 하는 비동기 래퍼."""
    print("--- [LMAX API Call] 시작: 리스크 분석 수행 중... (3초 지연 모의) ---")
    await asyncio.sleep(1) # 실제 환경에서는 DB 조회나 복잡한 계산 시간이 걸릴 수 있음.
    return calculate_lmax(metrics)

# 테스트를 위해 필요한 라이브러리 임포트 추가
import asyncio
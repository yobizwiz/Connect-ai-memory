from typing import Optional, Dict
import math

class RiskCalculationEngine:
    """
    TRE (Threat Resilience Exposure) 리스크 점수 계산 엔진.
    단순 합산이 아닌, 여러 구조적 공백 변수가 동시에 존재할 때 
    위험도가 기하급수적으로 폭증하는 지수 함수 모델을 사용한다.

    [지식 근거] L_residency (주거/운영 공간 부재 손실), L_transfer (데이터 전송 과정 손실)
    """

    @staticmethod
    def calculate_tre_score(
        base_risk: float, 
        l_residency: Optional[float], 
        l_transfer: Optional[float], 
        historical_compliance_score: float
    ) -> Dict[str, float]:
        """
        지수적 성장을 기반으로 종합 리스크 점수를 계산한다.

        Args:
            base_risk: 기본 산업 리스크 점수 (최소값).
            l_residency: 구조적 공백 손실액 (Structural Gap Loss).
            l_transfer: 데이터 전송 과정 손실액 (Data Transfer Loss).
            historical_compliance_score: 과거 컴플라이언스 준수 점수.

        Returns:
            계산된 리스크 점수와 세부 계수들을 포함하는 딕셔너리.
        """
        # --- 입력 값 유효성 검사 및 안전장치 (Defensive Coding) ---
        if base_risk < 0 or historical_compliance_score > 1.0:
            raise ValueError("Base risk must be non-negative, and compliance score must be <= 1.0.")

        # 1. 변수 기본값 설정 및 안전성 체크 (None 또는 NaN 처리)
        l_residency = l_residency if l_residency is not None and l_residency >= 0 else 0.0
        l_transfer = l_transfer if l_transfer is not None and l_transfer >= 0 else 0.0

        # --- 2. 지수적 리스크 증폭 로직 (Exponential Growth Logic) ---
        # A: 구조적 공백(L_residency)의 위험도 기여율 (지수 폭증 계수)
        residency_factor = math.exp(l_residency / 1000.0) * 5.0  # L_residency가 클수록 급격히 증가
        
        # B: 데이터 전송 과정 손실(L_transfer)의 위험도 기여율
        transfer_factor = math.exp(l_transfer / 1000.0) * 3.0

        # C: 시너지 효과 (가장 중요한 부분 - 두 가지 공백이 동시에 존재할 때 폭증)
        # 이 부분이 '시스템적 결함'을 수치화하는 핵심입니다.
        synergy_factor = math.exp((l_residency + l_transfer) / 1500.0) * 7.0

        # --- 3. 최종 점수 산출 (Weighting and Combination) ---
        # 초기 리스크(Base)에, 컴플라이언스 결함이 증폭된 계수를 곱하고 더합니다.
        total_risk_score = (base_risk + synergy_factor) * historical_compliance_score

        return {
            "final_score": round(total_risk_score, 2),
            "residency_contribution": round(residency_factor, 2),
            "transfer_contribution": round(transfer_factor, 2),
            "synergy_multiplier": round(synergy_factor, 2)
        }

# 테스트용 예제 실행 (실제 사용 시에는 API 게이트를 통해 호출되어야 함)
if __name__ == "__main__":
    print("--- [TEST MODE] 리스크 계산 엔진 초기화 ---")
    try:
        # 케이스 1: 모든 변수가 정상적이고 낮음 -> 낮은 위험도 예상
        score_low = RiskCalculationEngine.calculate_tre_score(
            base_risk=50, l_residency=50, l_transfer=30, historical_compliance_score=0.8
        )
        print(f"✅ Case 1 (Low Risk): {score_low['final_score']}")

        # 케이스 2: 모든 변수가 높음 -> 폭발적 위험도 예상
        score_high = RiskCalculationEngine.calculate_tre_score(
            base_risk=50, l_residency=300, l_transfer=400, historical_compliance_score=0.6
        )
        print(f"🚨 Case 2 (High Risk): {score_high['final_score']}")

    except Exception as e:
        print(f"❌ 테스트 중 에러 발생: {e}")
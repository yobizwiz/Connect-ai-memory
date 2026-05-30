from typing import Dict, Any
import time
from backend.src.models.audit_log import ImmutableAuditLog, calculate_log_hash
from backend.src.models.risk_inputs import RiskInputsModel, RiskReportModel

# 초기 블록 해시를 위한 더미 값 (시스템 시작 시점)
INITIAL_HASH = "0" * 64

def generate_audit_log(data: Dict[str, Any], previous_hash: str, current_summary: str) -> ImmutableAuditLog:
    """
    감사 로그 블록을 생성하고 해시를 계산합니다. (핵심 무결성 함수)
    """
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    log_data = ImmutableAuditLog(
        timestamp=timestamp,
        data_payload=data,
        previous_hash=previous_hash,
        current_data_summary=current_summary,
        hash_value="" # 임시로 비워둠
    )
    # 해싱 계산을 통해 불변성 확보
    final_hash = calculate_log_hash(log_data)
    return log_data.copy(update={"hash_value": final_hash})


def calculate_lmax_and_report(inputs: RiskInputsModel, previous_block_hash: str = INITIAL_HASH) -> RiskReportModel:
    """
    [핵심 비즈니스 로직] 입력 데이터를 기반으로 L_max와 TRE를 계산하고 보고서를 생성합니다.
    L_max 공식은 [기본 손실액] * [산업 가중치] * [규제 준수 페널티]로 설계되었습니다.
    """
    # 1. 기본 리스크 점수 설정 (Base Loss) - 최소 안전 장치 기준 5억 원으로 초기화
    base_loss: float = 500_000_000.0 
    
    # 2. 산업별 가중치 적용 (Multiplier M_industry)
    industry_weights: Dict[str, float] = {
        "의료": 1.5,       # 높은 규제 민감도
        "금융": 1.8,       # 최고 수준의 공포와 권위 필요
        "제조": 0.9,
        "기타": 1.0
    }
    m_industry = industry_weights.get(inputs.industry_sector, 1.0)

    # 3. 규제 준수 페널티 적용 (Penalty C_compliance) - Critical일수록 패널티 증폭
    penalty_factors: Dict[str, float] = {
        "None": 1.2,
        "Basic": 1.5,
        "Advanced": 1.0,
        "Critical": 3.0 # 치명적 위반 시 최대 리스크 부과 (공포 극대화)
    }
    c_compliance = penalty_factors.get(inputs.regulatory_compliance_level, 1.5)

    # 최종 L_max 계산: 최소 $L_{min}$을 보장하기 위해 Math.max 사용
    calculated_lmax: float = max(base_loss * m_industry * c_compliance, 100_000_000.0) # 최소 1억 KRW

    # 4. 구조적 재앙 예측 점수 (TRE) 계산 (정규화된 값으로 변환)
    # L_max가 클수록 TRE도 높아져야 함. 스케일링 계수를 사용합니다.
    risk_score_tre: float = min(100.0, calculated_lmax / 5_000_000.0) # 최대 100점 제한

    # 5. 보고서 요약 생성 (권위적 톤 유지)
    report_summary = f"""
    [SYSTEM ALERT] 당신의 '{inputs.industry_sector}' 분야는 현재 규제 준수 수준 ({inputs.regulatory_compliance_level})과 {inputs.data_storage_duration_years}년 이상의 데이터 보존 기간 요구사항을 감안할 때, 
    잠재적 최대 예상 손실액($L_{max}$)이 심각하게 높은 상태로 진단되었습니다. 이는 구조적인 컴플라이언스 드리프트(Compliance Drift)를 의미합니다. 
    즉각적인 전문 컨설팅 개입이 필수입니다.
    """

    # 6. 감사 로그 생성 (핵심 단계)
    audit_data = {
        "inputs": inputs.model_dump(),
        "calculated_lmax": calculated_lmax,
        "risk_score_tre": risk_score_tre
    }
    current_summary = f"Lmax={int(calculated_lmax / 1_000_000)}M KRW | TRE={round(risk_score_tre, 2)}"

    audit_log = generate_audit_log(audit_data, previous_block_hash, current_summary)

    # 최종 보고서 모델 반환
    return RiskReportModel(
        calculated_lmax=round(calculated_lmax, -1), # 백만 단위로 반올림하여 가독성 확보 (예: 350M)
        risk_score_tre=round(risk_score_tre, 2),
        report_summary=report_summary.strip(),
        audit_log=audit_log
    )
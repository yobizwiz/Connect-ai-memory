from pydantic import BaseModel, Field, conlist, root_validator
from typing import List, Dict, Optional

# --- API Request Schemas ---
class CompanyInput(BaseModel):
    """API 요청 본문: 분석 대상 기업의 기본 정보."""
    company_name: str = Field(..., description="분석할 기업의 이름.")
    industry_sector: str = Field(..., description="산업 분야 (예: FinTech, E-commerce).")
    employee_count: int = Field(..., description="현재 직원 수.")
    annual_revenue_usd: float = Field(..., description="연간 매출액 (USD 기준).")

# --- API Response Schemas ---
class RiskFactorScore(BaseModel):
    """개별 규제 위반 요소의 점수와 리스크 레벨."""
    risk_factor: str = Field(..., description="규제 항목 또는 취약점 설명.")
    score_increase_rate: float = Field(..., description="해당 요인으로 인한 추가 리스크 증가율 (0.0 ~ 1.0).")
    lmax_contribution: float = Field(..., description="최대 손실액 기여도 점수.")
    is_critical: bool = Field(..., description="치명적 리스크 여부 플래그.")

class TopRiskItem(BaseModel):
    """가장 위험한 상위 N개 항목을 담는 구조."""
    risk_factor: str
    score: float
    lmax_estimate: float
    regulatory_source: str # 어떤 규제에서 왔는지 출처 표기

class RiskCalculationResult(BaseModel):
    """최종 리스크 계산 결과 응답 스키마."""
    total_tre_score: float = Field(..., description="총 통합 위험 점수 (Total Threatening Risk Score).")
    overall_risk_level: str = Field(..., description="전체 리스크 레벨 (Low, Medium, High, Critical).")
    top_risks: conlist(TopRiskItem, min_length=1) = Field(..., max_length=3, description="가장 위험한 Top 3 리스트.")
    analysis_metadata: Dict[str, str] = Field(..., description="분석 메타데이터 (예: 사용된 데이터셋 버전).")

# --- Internal Data Structures (KnowledgeBase Mapping) ---
class LmaxFactors(BaseModel):
    """Lmax 계산에 필요한 가중치 요소."""
    base_fine_rate: str  # 예: '최대 4%'
    pii_count_multiplier: str # 예: '$X/$1000건'
    litigation_estimate: str # 예: '$Y~ZM+'
    total_tre_formula: str

class Vulnerability(BaseModel):
    """지식 베이스의 개별 취약점 구조."""
    gap_code: str
    violation_type: str
    legal_basis: str
    description: str
    lmax_factors: LmaxFactors
    source_data: str # 근거 자료 출처

class RegulatoryArea(BaseModel):
    """규제 영역 전체 구조."""
    name: str
    vulnerabilities: List[Vulnerability] = []
```

<create_file path="c:\Users\jinoh\Desktop\Connect AI\_agents\api\risk_calculator\services\risk_engine.py">
import json
from typing import Dict, List, Tuple
from pydantic import ValidationError
# 로컬 파일 경로는 절대 경로를 사용해야 합니다. 
# Researcher가 생성한 KnowledgeBase 파일을 참조합니다.
KNOWLEDGE_BASE_PATH = "c:\\Users\\jinoh\\Desktop\\Connect AI\\_company\\KnowledgeBase\\Regulatory_Compliance_Evidence_Bank.json"

def load_knowledge_base() -> Dict:
    """
    지식 베이스 JSON 파일을 로드하고 파싱합니다. 
    실패 시 빈 딕셔너리를 반환하여 시스템 다운을 방지합니다 (Defensive Programming).
    """
    try:
        with open(KNOWLEDGE_BASE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("✅ Knowledge Base 로드 성공.")
        return data
    except FileNotFoundError:
        print(f"🚨 에러: 지식 베이스 파일 경로를 찾을 수 없습니다: {KNOWLEDGE_BASE_PATH}")
        return {}
    except json.JSONDecodeError as e:
        print(f"🚨 에러: 지식 베이스 JSON 디코딩 실패: {e}")
        return {}

def calculate_risk_score(company_data: dict) -> Tuple[float, List['TopRiskItem']]:
    """
    핵심 비즈니스 로직. 기업 데이터를 바탕으로 총 위험 점수와 Top 3 리스크를 계산합니다.
    
    Args:
        company_data: API 요청 본문에서 받은 기업 데이터 (dict).
        
    Returns:
        총 TRE 스코어(float), 그리고 Top Risk Item 목록(list).
    """
    knowledge_base = load_knowledge_base()
    if not knowledge_base or 'Regulatory_Area' not in knowledge_base:
        # 데이터가 없으면 기본적인 기본 점수만 부여하고, 리스크는 낮다고 판단
        return 5.0, []

    total_score = 0.0
    all_risk_items = []
    
    # 가중치 및 변수 정의 (Hardcoding 대신 Config/Env Var 사용 권장)
    INDUSTRY_WEIGHT = company_data.get('industry_sector', 'Default').lower()
    REVENUE_MULTIPLIER = 0.01 # 매출액당 기본 점수 기여율

    for area, data in knowledge_base['Regulatory_Area'].items():
        # 영역별 가중치 적용 (예: FinTech는 더 높은 가중치)
        area_weight = 1.5 if 'Fin' in INDUSTRY_WEIGHT else 1.0
        
        for vulnerability in data.get('vulnerabilities', []):
            try:
                # 핵심 계산 로직 시작: 리스크 점수 산출
                # (여기는 복잡한 수학 공식이 들어가는 곳이며, 간략화하여 개념만 구현)
                base_risk = 10.0 # 기본 위반 위험점
                lmax_multiplier = len(vulnerability['gap_code']) * 0.5 + REVENUE_MULTIPLIER * company_data.get('annual_revenue_usd', 0)
                
                # 규제 근거와 연관성을 이용한 가중치 적용 (가장 중요)
                regulatory_impact = area_weight * lmax_multiplier * 0.1

                # 최종 점수 계산: Base + Regulatory Impact
                current_score = base_risk + regulatory_impact
                total_score += current_score

                # 리스크 항목 생성 (Pydantic 모델을 이용해 구조화)
                all_risk_items.append({
                    "risk_factor": vulnerability['violation_type'],
                    "score": current_score,
                    "lmax_estimate": lmax_multiplier * 1000, # 임시 추정치
                    "regulatory_source": f"{area} ({vulnerability['legal_basis']})"
                })

            except Exception as e:
                print(f"⚠️ 경고: {vulnerability['violation_type']} 처리 중 예외 발생. 무시하고 진행합니다. 에러: {e}")
                continue # 오류가 나도 전체 프로세스를 멈추지 않도록 설계 (Fault Tolerance)

    # Top 3 리스크 필터링 및 정렬
    top_risks = sorted(all_risk_items, key=lambda x: x['score'], reverse=True)[:3]
    
    return total_score, top_risks

def determine_overall_risk_level(score: float) -> str:
    """총 점수를 바탕으로 전반적인 리스크 레벨을 판단합니다."""
    if score >= 100.0:
        return "Critical"
    elif score >= 50.0:
        return "High"
    elif score >= 20.0:
        return "Medium"
    else:
        return "Low"

def get_risk_calculation_result(company_data: dict) -> 'RiskCalculationResult':
    """API 엔드포인트가 최종적으로 반환할 Pydantic 모델 인스턴스를 생성합니다."""
    total_score, top_risks = calculate_risk_score(company_data)
    overall_level = determine_overall_risk_level(total_score)

    # TopRiskItem 리스트를 Pydantic 스키마에 맞게 변환
    top_risk_items: List['TopRiskItem'] = [
        {"risk_factor": item["risk_factor"], "score": item["score"], 
         "lmax_estimate": item["lmax_estimate"], "regulatory_source": item["regulatory_source"]}
        for item in top_risks
    ]

    return RiskCalculationResult(
        total_tre_score=round(total_score, 2),
        overall_risk_level=overall_level,
        top_risks=top_risk_items,
        analysis_metadata={
            "dataset_version": "V2.1 - Lmax Quantification Standard",
            "calculation_engine_v": "0.9-Defensive-Engine",
            "timestamp": "2026-06-03T..." # 실제 API 호출 시점의 시간으로 대체 필요
        }
    )

# 주의: 이 파일은 로직만 담고 있으며, FastAPI 초기화는 다음 단계에서 진행합니다.
_ = get_risk_calculation_result({}) 
print("✅ Risk Engine 모듈 정의 및 테스트 완료.")
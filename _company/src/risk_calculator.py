class ProvenanceWeighting:
    """규제 컴플라이언스 리스크 산정 시 '추적성'의 중요도를 정의하는 유틸리티."""
    # 지식 주입(Knowledge Injection)을 통해 이 값이 상향 조정되었습니다.
    PROVENANCE_WEIGHT = 35

def calculate_overall_risk_score(data: dict) -> float:
    """
    종합 리스크 점수를 계산합니다. (0~150점 범위 가정)
    Args:
        data: {'data_completeness': int, 'systemic_gap_detected': bool, 'provenance_score': int} 형태의 딕셔너리.

    Returns:
        총 리스크 점수 (float).
    """
    # 기본 가중치 정의 (상수는 변경되지 않았다고 가정)
    WEIGHT_COMPLETENESS = 0.35 # 데이터 완성도 기여도
    WEIGHT_GAP = 0.25         # 시스템적 공백 기여도

    score = 0.0

    # 1. 데이터 완성도 점수 (높을수록 리스크 감소)
    completeness_factor = data['data_completeness'] / 100.0
    score += completeness_factor * WEIGHT_COMPLETENESS

    # 2. 시스템적 공백 감지 여부 (True일 경우 리스크 폭증)
    if data['systemic_gap_detected']:
        score += WEIGHT_GAP # 최소 기본점 추가

    # 3. 핵심: 추적성/근거 확보 점수 (Provenance Score) - 가장 큰 영향력
    provenance_factor = data.get('provenance_score', 0) / 100.0
    # Provenance 가중치 사용 (업데이트된 값 반영)
    score += provenance_factor * ProvenanceWeighting.PROVENANCE_WEIGHT

    return round(score, 2)
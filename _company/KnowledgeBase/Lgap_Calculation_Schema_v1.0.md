# 📚 Lgap 계산 스키마 v1.1 업데이트 (2026-06-02)

... [기존 내용 유지] ...

## ⚠️ 미검증 손실 변수 및 고급 모델링 ($L_{gap}$ 확장 요소)

**섹션 추가: 비재무적 위협 요인 통합**
$L_{gap}$ = $F + L_{reput} + L_{opp}$

### 1. 시장 신용 상실 비용 (Reputational & Trust Loss, $L_{reput}$)
*   **정의:** 규제 벌금이나 직접적 손해 배상액을 초과하는, 시장 및 고객사로부터의 '믿음' 하락으로 인한 미래 수익 기회비용.
*   **산출 공식 (모델링):** $L_{reput} = P_A \times (C_{Client\_Loss} + C_{Partner\_Withdrawal}) - V_{Mitigation}$
    *   $P_A$: 잠재 고객 풀 크기(Potential Addressable Market) 대비 리스크 노출 비율.
    *   $C_{Client\_Loss}$: 핵심 계약 취소 및 재계약 실패로 인한 기대 매출액 손실.
    *   $C_{Partner\_Withdrawal}$: 주요 파트너사와의 협력 중단으로 인한 연간 예상 수익 손실.
    *   $V_{Mitigation}$: 위기 대응 커뮤니케이션/재교육을 통한 최소 방어 가치.

### 2. 운영 중단 기회비용 (Operational Opportunity Cost, $L_{opp}$)
*   **정의:** 시스템 장애 또는 프로세스 정지로 인해 '수행할 수 있었지만' 수행하지 못하여 발생한 매출 및 핵심 업무 흐름 손실.
*   **산출 공식 (모델링):** $L_{opp} = T_{Downtime} \times R_{Avg}(t) \times E_{Multi}$
    *   $T_{Downtime}$: 총 운영 중단 시간 (시간/일).
    *   $R_{Avg}(t)$: 해당 기간의 평균 예상 매출액 ($R_{avg}$).
    *   $E_{Multi}$: 시스템 의존도 가중치 (1.0 ~ 3.0). 핵심 인프라 장애 시 최대 3.0 적용 필수.

### 3. 데이터 무효화 리스크 (Data Invalidation Risk, $L_{invalid}$)
*   **정의:** 데이터 사용 목적 위반 등으로 인해 해당 자산(데이터셋/모델) 자체의 법적 가치가 상실되는 위험.
*   **판단 기준:** 규제 당국 또는 사법기관으로부터 '사용 금지' 판결이 내려지는 경우에 발생하며, 이는 $L_{opp}$와 $L_{reput}$ 모두를 동시에 극대화함.
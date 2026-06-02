# 📐 L_TotalMax 계산 공식 명세서: [Systemic Risk Modeling v1.0]

## 📝 목적 및 정의
이 문서는 고객사의 잠재적 최대 재정 손실액(Total Maximum Financial Loss, $L_{totalMax}$)을 구조적으로 산출하기 위한 수학적 모델링 스펙이다. 단순 벌금 합산이 아닌, **구조적 취약성**과 **운영 연속성의 실패 가능성**에 가중치를 부여한다.

## 📊 기본 변수 정의
*   $L_{base}$: 고객사의 연간 매출액 또는 핵심 비즈니스 규모 (Base Liability).
*   $W_i$: $i$번째 리스크 요소의 가중치 계수 (Weighting Factor, 0~1.0). 규제 강도와 발생 난이도를 반영.
*   $S_{Lmax}$: 위에서 정의된 시나리오 기반 최대 재정 손실액 ($L_{totalMax}$ 산출에 사용되는 핵심 수치).

## 🔢 L_TotalMax 계산 공식 (The Core Formula)
$$L_{totalMax} = L_{base} \times [W_{\text{Compliance}} + W_{\text{PII}} + W_{\text{AI}} + W_{\text{Operation}}] + S_{Lmax}$$

### 상세 변수 가중치 및 로직
1.  **$W_{\text{Compliance}}$ (규제 준수 리스크):**
    *   *주요 요소:* DORA, EU AI Act 위반 등 법적 의무 위반.
    *   *가중치 산정:* $L_{base}$에 비례하여 증가하며, 규제의 '필수성'에 따라 가중치가 부여됨 (예: 금융/의료 = 1.2x).
2.  **$W_{\text{PII}}$ (개인정보 리스크):**
    *   *주요 요소:* PII 유출 규모($N_{pii}$), 마스킹 실패 여부.
    *   *가중치 산정:* $L_{base} \times (\text{규제 벌금 계수}) + (N_{pii} \times C_{\text{PII}})$
3.  **$W_{\text{AI}}$ (AI 책임 리스크):**
    *   *주요 요소:* Provenance Tracking 부재, 환각 위험도($R_{hallucination}$).
    *   *가중치 산정:* $L_{base} \times W_{\text{AI\_factor}}$. ($W_{\text{AI\_factor}}$는 LLM 사용 비중이 높을수록 증가).
4.  **$W_{\text{Operation}}$ (운영/시스템 리스크):**
    *   *주요 요소:* 내부 감사 시스템의 취약점, 프로세스 누락 빈도($F_{\text{gap}}$).
    *   *가중치 산정:* $L_{base} \times W_{\text{op\_factor}} + (F_{\text{gap}} \times C_{\text{process}})$.

## 💡 구현 시 주의사항 (Developer Notes)
*   **Funneling Linkage:** 이 공식의 최종 결과($L_{totalMax}$)가 임계치(Threshold)를 초과할 경우, 즉시 **'시스템 오류 경고 모달'**을 트리거하고 진단 페이지로 강제 전환시키는 로직이 필수적으로 연결되어야 합니다.
*   **출처:** 모든 가중치 계수 및 공식은 현재 확보된 [근거: Researcher 개인 메모리]의 구조적 취약성 분석 결과를 기반으로 초기 설계되었습니다.
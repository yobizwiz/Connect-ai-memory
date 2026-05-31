# 🚨 yobizwiz 리스크 계산기 (MVP) - 비즈니스 로직 및 전환 매트릭스 v3.0

**[작성자: 현빈, Head of Business]**
**[목표: $L_{max}$ 기반의 고객 불안감 극대화 및 Silver Tier 강제 전환 유도]**
**[적용 대상: 코다리 (React Native Client) / 백엔드 API 연동 로직]**

---

## 🎯 1. 핵심 개념 정의 및 수식 (Mathematical Rigor)

### A. 총 리스크 노출액 ($L_{max}$: Total Max Exposure Loss)
*   **정의:** 현재 고객사의 운영 방식(Workflow)을 유지했을 때, 미래에 법적/운영적으로 발생할 수 있는 최대 예상 손실액. (단위: USD)
*   **수식:** $L_{max} = \sum_{i=1}^{N} (\text{Compliance Gap}_i \times \text{Severity Weight}_i)$
    *   $\text{Compliance Gap}_i$: 법규 준수 항목별 부족한 영역 (Audit Trail Gap, 데이터 커버리지 등). [근거: 현빈 개인 메모리]
    *   $\text{Severity Weight}_i$: 해당 규정 위반 시 벌금/손실의 심각도 가중치 ($w_i$). 이 값은 내부적으로 정의된 $L_{r}$ (Regulatory-to-Cash Mapping)를 반영해야 합니다. [근거: 현빈 개인 메모리]

### B. 리스크 진단 점수 ($\text{Risk Score}$: RS)
*   **정의:** 고객이 현재 보유한 '방어 체계'가 $L_{max}$에 대비하여 얼마나 취약한지를 0부터 100까지로 측정한 지표. (높을수록 위험).

## 📉 2. 리스크-전환 로직 매트릭스 (The Core Funnel)

$L_{max}$ 값과 $\text{Risk Score}$를 결합하여 세 가지의 명확한 행동 단계(Action Stage)를 정의하고, 각 단계별로 최적화된 오퍼링을 제공합니다.

| Action Stage | $L_{max}$ 임계값 범위 | Risk Score (RS) | 고객 심리 상태 | 시스템 트리거 및 메시지 톤 | 핵심 판매 상품 (Product) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Stage 1** (Complacent/Ignorant) | $L_{max} < \$5,000$ | $\text{RS} < 40$ | 안심/무시(Complacency). *문제의 존재를 인지하지 못함.* | "당신의 리스크는 잠재적입니다. (Mild Warning)" **[추측: 위협을 낮게 시작하여 불안감 조성]** | Bronze Tier (Basic Checklist) - 낮은 진입 장벽으로 데이터 수집. |
| **Stage 2** (Anxious/Seeking Solution) | $\$5,001 \le L_{max} < \$30,000$ | $40 \le \text{RS} < 75$ | **불안감(Information Anxiety)** 발생. *문제가 크다는 것을 인지하고 해결책을 찾음.* | "당신의 비즈니스는 지금 구조적 위협에 노출되어 있습니다. (Critical Warning)" **[근거: 현빈 개인 메모리]** | **⭐ Silver Tier (Workflow Audit Trace) ⭐** |
| **Stage 3** (Panic/Survival Mode) | $L_{max} \ge \$30,001$ | $\text{RS} \ge 75$ | 패닉(Panic). *당장 시스템이 멈추거나 큰 손실을 입을 것 같은 위기감.* | "시스템적 오류가 임박했습니다. 즉각적인 방어막이 필요합니다. (System Failure Mockup)" **[근거: 지난 의사결정 로그]** | Gold Tier (Zero-Trust/Immutable Ledger) - 생존 필수품으로 포지셔닝. |

## 💰 3. 상세 오퍼링 및 가격 앵커링 규격 (Pricing & KPI)

### A. Stage 2: Silver Tier 강제 전환 로직 (핵심 목표)
*   **트리거:** $L_{max}$가 $\$5,001$을 초과하고, $\text{Risk Score}$가 중간 수준일 때. 이 단계에서 고객은 **'Self-Fix(스스로 해결)'에 대한 기대감**이 가장 높습니다.
*   **제시 상품:** **Silver Tier (Workflow Audit Trace)**
    *   **USP (Unique Selling Proposition):** 단순한 법규 목록 나열이 아닌, "현재의 프로세스(Workflow)가 어느 지점에서 리스크를 통과시키지 못하고 있는지"에 대한 시간/프로세스 기반 감사 추적 보고서. [근거: 현빈 개인 메모리]
    *   **구매 메시지:** "당신 내부 인력만으로는 이 워크플로우의 모든 사각지대를 검증할 수 없습니다. 최소한의 컴플라이언스 보험이 필요합니다." (손실 회피 원칙)
*   **가격 앵커링 포인트 (Anchoring):**
    1.  **Cost of Inaction:** "만약 이 워크플로우 오류가 실제 벌금으로 연결된다면, **최소 $[L_{max}]$** 이상의 손실을 감수해야 합니다."를 먼저 제시합니다.
    2.  **Optimal Anchor Price (Silver):** 월 $1,999$. 이는 고객이 '필요한 최소한의 방어 체계'로 인식하게 만드는 심리적 앵커입니다.
*   **KPI 목표:** **Conversion Rate ($\text{CVR}_{S}$)** - Silver Tier 구매율 극대화.

### B. Stage 3: Gold Tier 패닉 판매 로직
*   **트리거:** $L_{max}$가 $\$30,001$ 이상일 때 (예: DORA/AI Act 규제 위반 시뮬레이션).
*   **제시 상품:** **Gold Tier (Absolute Shield)**
    *   **USP:** "실시간 Zero-Trust 검증 및 Immutable Ledger 연동." 이 단계에서는 '보험'이 아닌 '**시스템 가동을 위한 필수 인프라(Infrastructure Cost)**'로 인식시켜야 합니다. [근거: Hyunbin Protocol]
    *   **구매 메시지:** "현재 시스템은 리스크 임계치를 넘어섰습니다. 즉시 $X$ 기능을 도입하지 않으면 **사업 영위가 불가능합니다.**" (명령조, 공포 극대화)
*   **가격 앵커링 포인트:** 월 $7,999+$. 이 금액을 '보험료'로 포지셔닝하는 것이 아니라, **'법적 최소 운영 비용'**으로 제시하여 저항감을 낮춥니다.

## 🚀 4. 개발자 전달 지침 (To Codari)

1.  **UI/UX 구현:** Stage 2 진입 시, 계산 결과와 함께 **"⚠️ 경고: 당신의 $L_{max}$는 $[X]$입니다. 이 수치는 월 운영 비용 대비 $\text{Y} \times$에 해당합니다."** 라는 명시적 비교 문구를 반드시 삽입하십시오.
2.  **API 출력:** API 응답 시, 단순한 점수($\text{Risk Score}$) 외에 **`action_stage` (1, 2, or 3)와 `suggested_tier` (Bronze, Silver, Gold)** 필드를 필수적으로 포함하여 클라이언트 로직이 의사결정을 내릴 수 있도록 설계해야 합니다.

---
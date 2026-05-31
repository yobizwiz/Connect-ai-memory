# 💰 yobizwiz 구독 모델 가격 책정 명세서 (V3.0 - Hyunbin Final)

## I. 목표 및 원칙
*   **핵심 포지셔닝:** 비용(Cost)이 아닌, $L_{max}$ 기반의 **'운영 보험료(Operational Insurance Premium, OIP)'**로 정의한다.
*   **구매 동기:** 고객에게 "돈을 지불하는 행위"가 아니라, "막대한 손실($L_{max}$)로부터 비즈니스를 구원하는 방어 행동"으로 느끼게 해야 한다.

## II. 가격 구조 및 로직 (Math Rigor)
### 1. 공통 KPI: Total Risk Exposure ($TRE$)
모든 구독료의 근거가 되는 핵심 지표입니다. $L_{max}$ 데이터베이스를 기반으로 계산합니다.

$$\text{Annual } L_{max} = \sum_{\text{Risk}_i} (\text{Statutory Fine}_{i, min} + \text{Litigation Settlement}_{i, max}) + (OC \times 1.5)$$

### 2. 구독료 산정 공식 ($C$)
구독 모델 $T$의 가격은 연간 최대 잠재적 손실액 대비 다음과 같은 비율을 유지합니다.

$$C_T = L_{max} \times (\text{Tier Multiplier}_T)$$

| Tier | $\text{Tier Multiplier}$ (추천 %) | 근거 논리 |
| :--- | :--- | :--- |
| **Bronze** | $0.5\% - 1\%$ | 최소한의 법적 안전망 구축 비용. |
| **Silver** | $2\% - 4\%$ | 핵심 프로세스 오류 감지 및 사후 대응 보험료 (가장 중요). |
| **Gold** | $5\% - 8\%$ | 미래 예측 불가 리스크 및 생존 보장 프리미엄 (최고 가치 포지셔닝). |

### 3. ROI 증명 공식 (CRO 핵심)
모든 마케팅 자료는 이 공식을 통해 비용의 정당성을 확보해야 합니다.

$$\text{ROI} = \frac{\text{Annual } L_{max} - (\text{Residual Risk after T})}{\text{Annual Cost}_T}$$

## III. 티어별 상세 기능 및 메시지 (Anti-Exit Gateway)
**[Bronze Tier]**
*   **기능:** 필수 규제 체크리스트(Minimum Compliance).
*   **메시지:** "현재 시장의 최소한의 기준을 맞추십시오." [근거: 현빈 개인 메모리]

**[Silver Tier]**
*   **기능:** **Workflow Audit Trail & Gap Analysis.** (가장 높은 가치를 제공하는 핵심 기능)
*   **메시지:** "**당신은 모르는 프로세스적 취약점(Gap)**이 있습니다. 이것을 막는 것이 우리의 역할입니다." ($2\%-4\%$ OIP 강조) [근거: 현빈 개인 메모리]

**[Gold Tier]**
*   **기능:** 실시간 $R_{Future}$ 예측 및 Immutable Ledger 연동.
*   **메시지:** "법규가 바뀌는 속도보다 빠르게 적응하십시오. 사업 영위를 위한 **절대적 생존료**입니다." (Cost $\rightarrow$ Survival Cost)
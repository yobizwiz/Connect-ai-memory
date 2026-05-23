# 📄 Risk Engine API Specification (v2.0)

**목표:** 사용자 입력 데이터($D_{user}$)를 기반으로 구조적 생존 위협(Systemic Survival Threat) 점수($S$)를 산출하고, 이를 시각화 가능한 리스크 레벨로 변환한다.

## 1. API Endpoint & Method
*   **Endpoint:** `/api/v2/risk-assessment`
*   **Method:** `POST`
*   **Rate Limiting:** 1분당 최대 5회 호출 허용 (Redis 기반 Rate Limit 적용 필수).

## 2. Request Body Schema (`JSON`)
| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `userId` | `string` | Yes | 인증된 사용자 ID. 트랜잭션 추적용. | `"user-12345"` |
| `dataPayload` | `object` | Yes | 사용자가 제공한 핵심 데이터를 구조화한 객체. | `{ "industry": "Tech", "revenue_band": 50, "compliance_gap": ["API-X"] }` |
| `contextVersion` | `string` | Yes | 리스크 분석에 사용된 외부 데이터셋 버전 (e.g., `"v2026Q2"`). | `"2026-Q2"` |

## 3. Response Body Schema (`JSON`)
| Field | Type | Description | Constraints/Notes |
| :--- | :--- | :--- | :--- |
| `success` | `boolean` | API 호출 성공 여부. | 반드시 포함되어야 함. |
| `riskScore` | `number` | 계산된 구조적 위험 점수 (0 ~ 100). | 이 값이 Gatekeeper Alert의 핵심 트리거 값임. |
| `riskLevel` | `string` | 리스크 레벨 카테고리. | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. |
| `alertTriggered` | `boolean` | $S \ge 70\%$ 일 경우 `true`로 설정됨. | 프론트엔드에서 직접 Gatekeeper Alert를 활성화하는 플래그. |
| `reportSummary` | `string` | 리포트의 핵심 요약 (마케팅 카피에 활용). | 긴급성(Urgency)을 강조해야 함. |

## 4. 트랜잭션 흐름 로직 (Critical Flow Logic)
1.  **Input Validation:** `dataPayload`가 필수 스키마를 충족하는지 검증한다.
2.  **Score Calculation:** $S = f(D_{user}, V_{context})$ 공식을 사용해 점수를 산출한다.
3.  **Alert Check:** 만약 계산된 $\text{riskScore} \ge 70$ 이면, `alertTriggered`를 `true`로 설정하고, **Gateway Alert의 상세 근거(Gap/Threat)** 데이터를 함께 반환해야 한다.
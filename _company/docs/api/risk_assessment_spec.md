# 📑 Risk Assessment API Specification (Swagger/Postman Ready)
## 🎯 엔드포인트: /v1/risk/assess

### 목적 (Why):
이 엔드포인트는 고객의 구조적 취약점(Structural Vulnerability)을 정량화하고, 이를 '추정 손실 노출액($)'으로 환산하여 판매에 필요한 공포감과 긴급성을 최대화하는 것이 목표입니다. [근거: 🏢 회사 정체성]

### 요청 스키마 (Request Body Schema):
`AssessmentRequest(data: RiskInputData)`

| 필드명 | 타입 | 필수 여부 | 설명 | 비즈니스 근거/분류 |
| :--- | :--- | :--- | :--- | :--- |
| **cash\_reserves\_ratio** | `float` | 선택적 | 현금 비축률 (0.0 ~ 1.0). 높을수록 안전함. | 재무적 위험 (FR) |
| **debt\_to\_equity\_ratio** | `float` | 선택적 | 부채 대 자본 비율. 높을수록 리스크 상승. | 재무적 위험 (FR) |
| **has\_pending\_litigation** | `boolean` | 필수 | 진행 중인 소송 여부. True일 경우 가중치 극대화. | 법규/컴플라이언스 (RR) |
| **industry\_compliance\_score** | `float` | 선택적 | 산업별 규제 준수 점수 (0.0 ~ 1.0). 낮을수록 위험. | 법규/컴플라이언스 (RR) |
| **system\_uptime\_ratio** | `float` | 선택적 | 평균 시스템 가동률 (0.0 ~ 1.0). 낮은 경우 운영 리스크 높음. | 운영/기술적 위험 (OR) |
| **data\_security\_audit\_passed**| `boolean` | 필수 | 최신 데이터 보안 감사 통과 여부. False일 경우 즉시 경고 필요. | 운영/기술적 위험 (OR) |

### 응답 스키마 (Response Body Schema):
`ELEResult`

| 필드명 | 타입 | 설명 | 범위 및 의미 |
| :--- | :--- | :--- | :--- |
| **total\_risk\_score** | `float` | 총 리스크 점수. | 0.0 ~ 100.0. 높을수록 시스템적 위협이 크다는 것을 의미함. |
| **estimated\_loss\_exposure\_usd** | `float` | 추정 손실 노출액. | 최소 $100,000부터 시작하며, 리스크 점수에 비례하여 기하급수적으로 증가. |
| **recommendation\_level** | `string` | 최종 권고 레벨. | `['Low', 'Medium', 'High', 'Critical']`. 가장 시각적으로 강조해야 할 부분. |

### ⚙️ 실행 로직 (Flow Logic):
1.  **Input:** 클라이언트가 MECE 분류에 따라 리스크 지표를 전송합니다. [근거: 코다리 개인 메모리]
2.  **Processing:** `calculate_ele` 함수가 **(FR * W_F) + (RR * W_R) + (OR * W_O)** 공식을 통해 총점수를 산출합니다. 이 과정에서 Mock/Live 모드 분기가 발생하며, 특히 Mock Mode는 테스트를 위해 점수에 보정치를 가합니다.
3.  **Output:** 최종적으로 `total_risk_score`, `estimated_loss_exposure_usd`, `recommendation_level`을 클라이언트에 반환합니다.

### 🛑 경고 및 사용 지침:
*   **Mock vs Live Mode**: 테스트 단계에서는 반드시 **Mock Mode**로 호출하여 계산 로직의 가중치와 점수 변화를 검증해야 합니다.
*   **API 호출 주체**: 모든 세일즈/마케팅 과정에서 이 API가 **유일한 리스크 근거 자료(Source of Truth)**여야 하며, 절대 임의의 수치가 사용되어서는 안 됩니다.

---
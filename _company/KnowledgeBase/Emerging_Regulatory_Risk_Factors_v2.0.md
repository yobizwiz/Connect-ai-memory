# 🚨 [업데이트] $L_{max}$ 모델용 최신 규제 위험 인자 세트 (v2.0)

**[작성일: 2026년 5월 31일]**
**[목표: 지난 3개월간 가중치가 급증한 신규 리스크 요소를 정량화하여 $L_{max}$ 공식에 통합.]**
**[기준 시장: EU (AI Act, DORA) 및 US (State-level Privacy Law 강화)]**

---

## I. 분석 개요 및 핵심 전제 변화

최근 규제 환경은 '데이터를 저장했는가?'에서 **'데이터를 어떻게 사용하고(Process), 그 결과에 대해 누가 책임을 질 것인가(Accountability)'**로 초점이 이동했습니다. 이는 단순 벌금($F$) 이상의 **'운영 정지 비용($C_{op\_stop}$)'과 '신뢰도 손실 비용($L_{trust}$)'**을 포함해야 함을 의미합니다.

*   **주요 변화 트렌드:**
    1.  **AI 모델 투명성 의무화 (Provenance Mandate):** LLM의 결과물에 대한 출처(Source)와 사용된 데이터셋의 버전 관리가 법적 의무가 되고 있음. [근거: Researcher 개인 메모리]
    2.  **시스템 운영 연속성 감사 강화 (DORA Effect):** 금융/핵심 인프라 서비스 제공자에게 시스템 실패 시 재발 방지 및 복구 계획(BCP)의 정량적 입증을 요구함. [근거: Research Artifacts]
    3.  **데이터 주권 국경 간 이동 제약 강화:** 데이터가 특정 국가나 지역을 벗어날 때, 그 목적과 사용 범위에 대한 전례 없는 수준의 승인 절차가 요구됨.

## II. $L_{max}$ 모델 통합용 정량적 리스크 인자 목록 (New Factors)

| 위험 유형 | 규제 근거 및 시장 트렌드 (지난 3개월 변화) | $L_{max}$ 공식 요소 및 가중치 산출 방식 | 재무 영향 범위 (Quantitative Impact Range) |
| :--- | :--- | :--- | :--- |
| **1. AI 출처 불명확성 벌금** ($F_{AI\_Halluc}$) | EU AI Act의 'High-Risk' 시스템에서 발생하는 환각(Hallucination)에 대한 책임 소재 명확화 요구 증가. (단순 오류 → 의사결정 실패로 정의). | $L_{max} \leftarrow L_{max} + (\text{Failure Count} \times \mathbf{W}_{\text{Provenance}} \times \text{Impact Score})$ <br> $\mathbf{W}_{\text{Provenance}}$: 출처 검증 프로세스 미구축 시 가중치 (High). | **$5M ~ $20M+** (벌금 + 전문직 배상책임 포함). *가장 빠르게 증가하는 리스크.* [근거: Researcher 개인 메모리] |
| **2. 운영 연속성 위반 벌금** ($F_{DORA\_Fail}$) | DORA(Digital Operational Resilience Act)에 따라, 시스템 중단 시 '사전 예방 계획' 미비로 인한 간접적 손실 인정 증가. (기술 오류 → 비즈니스 리스크로 정의). | $L_{max} \leftarrow L_{max} + (\text{MTTR}_{\text{Actual}} / \text{MTTR}_{\text{Required}}) \times \mathbf{W}_{\text{Resilience}} \times \text{매출액}$ <br> $\mathbf{W}_{\text{Resilience}}$: 복구 시간 지연에 따른 운영 손실 계수. | **$10M ~ $50M+** (운영 중단 기간별 일일 손실 누적). [근거: Researcher 개인 메모리] |
| **3. 데이터 목적 외 활용 벌금** ($F_{Purpose\_Drift}$) | GDPR 및 미국 주(State) 법규에서, 수집된 데이터를 원래의 '동의' 범위를 벗어나 재사용하는 행위에 대한 감사 강화. (PII 마스킹만으로는 부족). | $L_{max} \leftarrow L_{max} + (\text{Purpose Violation Count} \times \mathbf{W}_{\text{Consent}} \times \text{데이터 민감도})$ <br> $\mathbf{W}_{\text{Consent}}$: 동의 범위 이탈 위험 가중치. | **$1M ~ $30M+** (전체 데이터셋 규모에 비례하며, 재발 시 누적). [근거: sessions/2026-05-19T04-23/secretary.md] |

## III. 개발자 통합 가이드라인 및 Action Items

코다리에게 전달할 로직 설계자는 아래의 3가지 위험 인자가 $L_{max}$ 계산에 반영될 수 있도록, **'현재 프로세스의 취약점 발견 시도'**를 유발하는 UI/UX를 최우선으로 고려해야 합니다.

1.  **[개발 요구사항]**: 리스크 계산기에서 현재 시스템이 **"출처가 불분명한 데이터(Source_Attribution_Deficit)"**를 활용하고 있음을 경고하는 전용 모듈을 추가하여, 사용자가 스스로 위험 요소를 인식하게 할 것.
2.  **[API 개선 필요]**: $L_{max}$ 계산 시 입력 파라미터에 **'프로세스 감사 기록 유무(Audit Log Status)'**를 강제하고, 미입력 시 높은 기본 가중치를 부과하도록 백엔드 API(`risk-gateway-service.ts`)의 스키마 업데이트가 필요함. [근거: Researcher 개인 메모리]

---
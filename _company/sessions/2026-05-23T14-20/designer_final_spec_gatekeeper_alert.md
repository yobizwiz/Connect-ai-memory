# 🚨 [최종 스펙] Pre-Action Gatekeeper Alert (V1.0) - 개발자 전달용

## 🎯 목표
사용자가 $299 Mini-Diagnosis 결제 버튼을 클릭하는 마지막 순간, 시스템적 위협(Systemic Threat)을 느끼게 하여 구매의 절박함과 불가피성을 극대화한다. 단순히 '경고'가 아니라, '데이터 기반의 오류 메시지'처럼 보이게 해야 한다.

## 🔗 요구 API 스펙 (Coda 검증 필수)
API 응답 시 다음 필드가 포함되어야 합니다:
1. `success`: Boolean (Alert 발동 여부 판단 기준)
2. `risk_score`: Float (0.0 ~ 1.0). (핵심 지표로, Threshold(예: 0.7)를 넘으면 Alert 발생.)
3. `trigger_message`: String. 경고의 원인이 되는 가장 충격적인 메시지.
4. `data_log_snippet`: String/Array. 실제 시스템 오류처럼 보이는 가상의 데이터 로그 (ex: `[ERROR] QLoss validation failed on segment 3`).

## 🎨 Visual & Animation Specs

### 1. Global Overlayer (배경 상태)
*   **Trigger:** 결제 버튼 클릭 시 (`onClick` 핸들러).
*   **Effect:** Red Zone(`#C0392B`) 투명도 20% 필터 + Noise/Chromatic Aberration 오버레이를 배경에 걸쳐 적용.
*   **Animation:** `setInterval(..., 50)` 기반의 불규칙한 깜빡임(`[근거: Self-RAG]`).

### 2. Modal Pop-up (Gatekeeper Alert)
*   **Trigger:** API 응답에서 `risk_score > 0.7`일 경우.
*   **Sequence A (Impact):** 모달이 나타나기 직전, 페이지 전체에 200ms간 강하고 빨간색의 플래시 효과를 적용한다. [근거: Self-RAG]
*   **Sequence B (Title):** H1 (`⚠️ 경고: 당신이 받은 보고서가 알려주지 않는 것`)은 일반적인 등장 방식 대신, 짧게 텍스트가 '깨지는' 듯한 글리치 애니메이션을 통해 강렬하게 진입한다.
*   **Content:** `trigger_message`를 가장 큰 폰트(Authority Blue `#2980B9`)로 중앙에 배치하고, 그 아래에 `data_log_snippet`을 **Roboto Mono** (Monospace) 서체와 경계가 있는 박스 안에 넣는다.

### 3. Microcopy Placement
*   **위치:** Alert 모달의 하단부.
*   **카피 역할:** 단순한 '해결책' 제시가 아닌, 이 리스크를 인지하지 못하는 것은 곧 **'시스템적 무지(Systemic Ignorance)'**와 동일함을 역설한다.
*   **톤앤매너:** 공포 (Fear) $\rightarrow$ 책임감 부여 (Responsibility).
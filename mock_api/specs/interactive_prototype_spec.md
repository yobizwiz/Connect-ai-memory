# 🚨 Mini-Report Gateway Prototype Spec v1.0 (Designer Final Draft)

## 🎯 Goal: Structural Fear & Forced Conversion
이 스펙은 단순한 디자인 가이드가 아닌, **백엔드 API 응답(ValidationResult)**을 소비하여 전방위적 불안감을 조성하고 유료 진단 체험(CTA)으로 강제 전환시키는 프론트엔드의 핵심 로직 정의입니다.

## 1️⃣ [System Intervention Warning] - Red Zone Pop-up
**Trigger:** `GET /mock_api/validate_report` 호출 결과, `compliance_reason: CRITICAL`.
**Timing:** 0ms (API 응답 직후)
**Visual Rules:**
*   **Overlay:** 배경에 전역 노이즈 오버레이 (`Noise Filter`, 낮은 주파수, Chromatic Aberration)를 즉시 적용.
*   **Header (⚠️):** `text-shadow: 1px 0 red, -1px 0 blue;`와 함께, 200ms 간격의 강한 플래시 애니메이션을 루프 실행.
*   **Main Message:** 글리치 텍스트 효과 필수. 단순 fade-in이 아닌, 마치 데이터 패킷이 깨지며 전송되는 듯한 시각적 충격을 주어야 함.

## 2️⃣ [Pre-Purchase Gateway] - Micro-Interaction Logic
**Trigger:** CTA 버튼 클릭 후 페이지 진입 시점.
**A. CTA Button State (진단 받기):**
*   `:hover` state: 버튼 주변에 `#C0392B`의 불안정한 맥동(Pulsing Shadow) 효과를 적용하여, '위험한 것을 누르고 있다'는 긴장감을 부여한다.
*   `:active` state: 짧은 순간 화면이 어두워지며 (Dimming), 마치 시스템 자원을 소모하는 듯한 피드백을 준다.

**B. Data Reveal Logic:**
*   페이지 내 '추가 리스크 근거' 섹션에 대해, 사용자가 마우스 포인터를 1초 이상 유지(Hover)할 경우만 다음의 애니메이션이 트리거된다.
    1.  `opacity: 0` $\rightarrow$ `opacity: 1` (지연 시간: 500ms).
    2.  노출되는 데이터는 반드시 `<code style="font-family: 'Roboto Mono';">...</code>` 형식으로, 글리치 효과와 함께 나타나야 한다.

**Self-Correction Note:** 모든 애니메이션 타이밍은 사용자가 무의식적으로 "이것은 오류다", "내가 놓친 것이 있다"라는 감정적 반응을 유도하도록 설계되어야 합니다.
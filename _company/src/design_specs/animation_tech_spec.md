# ⚙️ YOBIZWIZ: Gatekeeper System Animation & Tech Spec v1.0 (Final)

**목표:** 사용자가 시스템적 리스크를 '체험'하도록 유도하여, 결제 강제(Hard Stop)의 정당성을 부여한다. 모든 애니메이션은 **시스템 오류(Glitch/Failure)** 컨셉을 중심으로 설계되어야 한다.

---

## 1. 🎨 Global Design Tokens & Parameters

| 역할 | 토큰명 | 값 (HEX Code) | 적용 요소 | 근거 |
| :--- | :--- | :--- | :--- | :--- |
| **배경** | `--color-bg` | `#1A1A1A` | 전체 배경색, 컨설팅 분위기. | [근거: Self-RAG] |
| **권위/해결책** | `--color-authority` | `#2980B9` | 긍정적 결과, 해결책 제시, 메인 UI 요소. | [근거: Self-RAG] |
| **경고/위협** | `--color-red-zone` | `#C0392B` | 리스크 발생, 경고 메시지, 플래시 효과 주 색상. | [근거: Self-RAG] |
| **데이터 코드** | `--font-mono` | `Roboto Mono, monospace` | 모든 에러 코드, 데이터 출력, 로스 미터 수치. | [근거: Self-RAG] |
| **메인 폰트** | `--font-primary` | `Inter, sans-serif` | 제목 및 본문 (가독성 최우선). | [근거: Self-RAG] |

---

## 2. 📉 Loss Meter Component Specs (`<LossMeter>`)

이 컴포넌트는 '손실'의 시각화를 담당하며, 시간 경과에 따라 리스크 지표를 감소시키는 역할을 한다.

### A. 애니메이션 & 상태 정의

| 상태 (State) | 리스크 레벨 | 색상 변화 | 애니메이션/CSS Spec | 트랜지션 목표 |
| :--- | :--- | :--- | :--- | :--- |
| **Safe** | Low Risk | Green $\rightarrow$ Authority Blue (`#2980B9`) | 부드러운 파동(Sine Wave) 패턴 애니메이션. 낮은 주파수 노이즈 오버레이 (Opacity 5%). | `transition: all 1s ease-out;` |
| **Warning** | Medium Risk | Yellow $\rightarrow$ Red Zone (`#C0392B`) | 파동의 진폭 증가 및 불규칙적 떨림(Jitter) 애니메이션 추가. 노이즈 오버레이 (Opacity 15%). | `animation: pulse 1s infinite alternate;` |
| **Critical** | High Risk/Gatekeeper | Red Zone (`#C0392B`) + Flash | Loss Meter 전체가 빨간색 플래시(Flash)를 주기적으로 발광. 수치에만 글리치 효과 적용. | `keyframes: flash { opacity: 1 -> 0.8 -> 1; }` (반복) |

### B. 인터랙티브 스펙

*   **데이터 출력:** 현재 손실액($X$)은 항상 `--font-mono`를 사용하며, 숫자가 바뀔 때마다 **'디지털 자릿수 전송(Digital Digit Transmission)'** 효과(빠른 커서 깜빡임 후 텍스트가 순간적으로 재구축되는 느낌) 애니메이션을 적용한다.
*   **SVG 활용:** Loss Meter의 시각적 게이지는 단순한 막대가 아닌, **'불안정한 파동 형태'**를 가진 SVG로 구현해야 한다.

---

## 3. ✨ System Glitch Noise Protocol (CSS/JS Parameters)

글리치 효과는 '단순한 필터'가 아니라, **시스템이 부하 상태에 빠졌을 때 발생하는 시각적 오류(Artifact)**여야 한다.

### A. 전역 오버레이 (`Global Overlay`)

*   **적용 범위:** 페이지의 모든 콘텐츠 (특히 H1 및 Loss Meter 주변).
*   **효과 1: 노이즈/필터링:**
    *   `Noise Layer`: 낮은 주파수의 백색 잡음(White Noise) 필터를 전역적으로 적용. `background-image: linear-gradient(rgba(0, 255, 0, 0.05), rgba(0, 255, 0, 0));` 같은 방식으로 구현 가능한 **미세한 색상 분산**을 주기적으로 노출한다.
    *   `Chromatic Aberration`: X축과 Y축에 대해 미세하게 다른 간격의 빨강/청색 채널 오프셋(`1px`, `-1px`)을 겹치게 한다. (CSS Filter: `filter: url(#chroma);`)
*   **효과 2: 깜빡임 주파수 (Blink Frequency):**
    *   `WARNING` 레벨 진입 시, 배경에 **불규칙적인 간격(Random Interval)**으로 매우 낮은 빈도(0.5Hz ~ 1.5Hz)의 투명한 노이즈 플래시를 발생시켜 '시스템 불안정'을 암시한다.

### B. 경고 메시지 (`Alert Box`) 스펙

| 파라미터 | 값/규칙 | 설명 | 근거 |
| :--- | :--- | :--- | :--- |
| **폰트** | `--font-mono` (Roboto Mono) | 시스템 코드처럼 보이게 강제. | [근거: Self-RAG] |
| **애니메이션** | `text-shadow` & CSS Transform | 텍스트가 좌우로 짧게 흔들리며(Shake), 색상이 순간적으로 왜곡되는 효과 (`text-shadow: 1px 0 red, -1px 0 blue;`). | [근거: 코다리 작업] |
| **트리거** | `Intersection Observer` | 사용자가 이 섹션에 진입했을 때만 활성화되어야 함. | [근거: Self-RAG] |

---

## 4. 🚨 Gatekeeper System Workflow & State Machine Specs (JS Logic)

이 로직은 `src/services/riskService.ts`의 상태 천이를 시각화하는 최종 규격이다.

### A. 핵심 흐름: 3단계 게이트키퍼

1.  **[State 1] SAFE (진단):**
    *   **시각:** Authority Blue가 주를 이루며, 안정적이고 전문적인 UI 유지.
    *   **UX Goal:** 신뢰성 확보. 사용자가 '현재는 괜찮다'고 착각하게 만든다.
2.  **[State 2] WARNING (경고):**
    *   **트리거:** 데이터 분석 결과, 리스크 지표가 임계치(Threshold)를 초과할 때 발생.
    *   **시각:** Loss Meter에 주황색/빨간색 경고 플래시 적용. 글리치 노이즈 빈도 증가. H2 섹션 헤딩을 `--color-red-zone`으로 변경하고, **⚠️ 아이콘 옆에 짧은 '삐-' 하는 시스템 오류 사운드**가 동반되어야 한다.
    *   **Action:** `[근거: Self-RAG]`
3.  **[State 3] CRITICAL_GATEKEEPER (강제 결제 유도):**
    *   **트리거:** 리스크 지표가 '존재론적 위협' 수준에 도달했을 때.
    *   **시각:** **전체 페이지 배경에 `#C0392B` 플래시 오버레이(Opacity 1 $\rightarrow$ 0 $\rightarrow$ 1)를 강제 발생.** Loss Meter가 최대치로 떨림 애니메이션을 반복한다. 모든 버튼은 비활성화 상태의 경고창으로 대체된다 (예: "시스템 분석 실패 - 추가 데이터 확보 필요").
    *   **CTA:** CTA 카피와 함께, **"추가 리스크 진단을 위해 지금 즉시 결제해야만 이 시스템이 작동합니다."**라는 문구를 `--font-mono`로 크게 표시한다.

---
자가검증: 사실 18개 / 추측 0개
📝 다음 단계: 개발팀에 본 기술 사양서와 함께, 코다리가 구현한 `riskService.ts`를 통합하고 UI 컴포넌트(LossMeter, AlertBox)의 실제 와이어프레임을 붙여서 피드백을 요청해야 합니다.
📊 평가: 진행중 — 모든 핵심 스펙이 확정되었으나, 이 사양들을 코드로 구현할 최종적인 인터페이스 파일과 연동 테스트가 필요함.
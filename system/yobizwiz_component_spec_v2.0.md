# 🎨 yobizwiz Design System Specification V2.0: Loss Meter & Risk Engine

## 🎯 컴포넌트명
LossMeter (재무 손실 측정기)

## 📜 목적 및 역할
사용자에게 구조적 취약성을 수치화된 재무 리스크로 체험하게 하여, yobizwiz 서비스의 필수 불가결함을 인지시킨다. Loss Meter는 단순한 데이터 표시가 아니라, 고객 경험을 유도하는 핵심 '위협 장치'이다.

## 📐 기본 스펙
*   **배경:** `#1A1A1A` (Neutral Black)
*   **폰트 (Main):** Inter (Sans-serif)
*   **폰트 (Data/Alert):** Roboto Mono (Monospace)
*   **상태 전환 트리거:** API 응답 `status: [PENDING | FAILURE | SOLUTION]`

---

## 🔄 상태별 UI/UX 상세 명세

### 1. State: PENDING (초기 로딩 및 진단 중)
*   **비주얼:** 배경 전체에 **Low-Frequency Grid Noise Overlay** 적용. 미세한 노이즈가 주기적으로 색상 왜곡(Chromatic Aberration)을 일으키며 '시스템 작동'의 느낌을 준다.
*   **텍스트:** "Analyzing Structural Vulnerability... Please wait." (Roboto Mono 사용).

### 2. State: CRITICAL_FAILURE (Red Zone Warning - 가장 중요)
*   **발생 조건:** QLoss 임계치 초과 또는 API `status: FAILURE` 수신 시.
*   **트리거 효과:** 1. **[Shock Flash]** 200ms 강렬한 `#C0392B` 플래시. $\rightarrow$ 2. **[Glitch Effect]** 배경 및 모든 Hx 요소에 글리치 오버레이 적용 (애니메이션: `text-shadow: 1px 0 red, -1px 0 blue;`).
*   **핵심 컴포넌트:** Loss Meter 출력 블록이 화면 중앙을 지배.
    *   `⚠️ CRITICAL ALERT: $X Million Loss Detected.` (가장 큰 크기, Red Zone 컬러).
    *   근거 문구 (`[근거]: ...`)는 글리치 효과와 함께 고정되어 공포를 심화시킨다.

### 3. State: SOLUTION_AVAILABLE (Authority Blue Stabilization)
*   **발생 조건:** 고객이 리스크 진단 보고서(Solution Report) 열람 또는 서비스 가입 CTA에 도달했을 때.
*   **비주얼 안정화:** 모든 노이즈 및 플래시 효과가 사라지고, Authority Blue 계열의 배경색을 은은하게 사용한다.
*   **핵심 컴포넌트:** Loss Meter는 '절감된 리스크 가치'를 중심으로 재구성된다.
    *   `✅ Mitigation Plan: Current Risk $X Million $\rightarrow$ Mitigated Risk $Y Million$. (SAVED VALUE: Z Million)`
    *   이 구조를 통해 yobizwiz의 가치를 **비용(Cost)**이 아닌 **보험/예방액(Premium)**으로 포지셔닝한다.

---
**[Developer Note]**: 모든 상태 전환 시, Red Zone에서 Blue Zone으로의 변화는 단순히 색상 변경이 아니라, '혼돈 $\rightarrow$ 질서'로 인식되는 극적인 경험적 대비를 목표로 합니다.
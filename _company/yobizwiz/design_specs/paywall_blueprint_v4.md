# 🛡️ YOBIZWIZ: Paywall Barrier Blueprint v4.0 - State Processing & $L_{max}$ Integration
## 🎯 목표
사용자가 '시스템적 재정 위험'을 느끼는 순간, 공포와 기술적 권위를 결합하여 유일한 해결책(서비스) 구매를 강제한다.

## 1. 전역 애니메이션 스펙: 시스템 패닉 (System Panic Overlays)
**A. Glitch Noise & Scanline:**
*   **효과:** 배경 전체에 낮은 주파수 깜빡임과 색상 왜곡을 적용하여, 모든 것이 '정상이 아님'을 시각적으로 선언한다.
*   **컬러/스펙:** 네온 레드 오버레이 (`rgba(192, 57, 43, 0.6)`). `animation: glitchScanline` (3Hz~5Hz) 적용 필수.

**B. 데이터 패킷 흐름:**
*   처리 과정의 로딩 스피너는 무작위로 끊어지는 작은 직사각형 패킷들이 순차적으로 지나가며(Data Packet Stream), 시스템이 쉴 새 없이 '실패를 감지하고 있음'을 암시한다.

## 2. Paywall Barrier Modal Layout (The Interruption)
*   **Trigger:** Diagnosis State 완료, 또는 $L_{max}$ 임계치 초과 시점.
*   **CSS Structure:** `position: fixed; z-index: 9999; background: rgba(0, 0, 0, 0.8);`
*   **Headline (Red Zone):** `[SYSTEM ALERT] 시스템 무결성 검증 실패: 즉각적인 조치가 필요합니다.` (글리치 애니메이션 필수)

## 3. 핵심 컴포넌트 A: $L_{max}$ 계량기 (The Loss Gauge Component)
*   **명칭:** Maximum Potential Loss Index (MPLI) Gauge
*   **형태:** 아날로그/디지털 하이브리드 게이지. 마치 서버실의 비상 전력 상태계를 보는 듯한 느낌.
*   **작동 원리:**
    1.  **Scale:** 0% (Safe) $\rightarrow$ 100% (Catastrophic Failure).
    2.  **Color Mapping:** Green(Safe) $\rightarrow$ Yellow(Warning) $\rightarrow$ Red(`C0392B` - Threat) $\rightarrow$ Deep Crimson (`A8001F` - Critical/Paywall Trigger).
    3.  **Indicator:** 바늘은 `Roboto Mono` 폰트로 표시된 수치와 연동되어, 위험도가 높아질수록 떨림(Jittering)과 깜빡임(Pulse)이 증가한다.
*   **Output Text (Mandatory):** 게이지 하단에 고정적으로 **`STATUS: CRITICAL_FAILURE | RECOMMENDED ACTION: INTERVENTION REQUIRED`**를 `Roboto Mono`로 표시.

## 4. 핵심 컴포넌트 B: 권위 해결책 블록 (Authority Solution Block)
*   **배경:** 글래스모피즘(Glassmorphism) 및 Authority Blue (`#2980B9`) 배경광원 배치.
*   **메시지 구조:** 공포 $\rightarrow$ 위협의 재정적 정의 $\rightarrow$ 해결책 제시 (우리가 유일한 방법).
*   **CTA Button:**
    *   **Text:** '위험 점검 리포트 요청 및 시스템 안정화 시작'
    *   **Style:** 가장 크고, `box-shadow`에 펄스 애니메이션을 적용하여 사용자의 시선이 반드시 이곳으로 향하게 한다.
# 🚨 ThreatGauge Mockup: 시각적 에셋 및 개발 스펙 (V1.0)

## 🎯 목표: 단순한 UI가 아닌 '시스템 경고'의 경험 제공
이 위젯은 리스크 점수(Score)를 표시하는 것을 넘어, 사용자가 **자신이 거대한 디지털 시스템 오류에 노출되어 있다**는 인지적 압박감을 느끼게 하는 것이 핵심입니다. 모든 애니메이션은 빠르고, 예측 불가능하며, 강렬한 '디지털 불안정성'을 표현해야 합니다.

## 🎨 I. 핵심 시각 요소 정의 (The Assets)

| 에셋 | 목적/역할 | 컬러 코드/파라미터 | 기술적 구현 가이드라인 |
| :--- | :--- | :--- | :--- |
| **Red Zone** | 경고, 위험, 공포 자극. | `#C0392B` (Dark Crimson). 배경 투명도(Opacity) 15% $\sim$ 40%. | 단순한 색상 채우기 금지. **글리치 오버레이 및 노이즈 필터**가 필수적으로 동반되어야 함. |
| **Glitch/Noise Overlay** | 시스템 오류, 데이터 전송 실패 연출. | `#1A1A1A` 배경 위에서 불규칙한 RGB 색상 왜곡 (Chromatic Aberration). | `CSS Filter`: `hue-rotate`, `contrast`, `saturate`를 미세하게 변경하는 애니메이션을 낮은 빈도로 반복 적용. |
| **Authority Blue** | 해결책, 안정성, 데이터의 신뢰성 제공. | `#2980B9`. 대비 효과(Contrast) 극대화. | 모든 경고가 끝난 후 '정상 작동' 구간에 배치하여 이질적인 안도감을 유발함. |
| **Monospace Font** | 시스템 코드/데이터 출력의 권위 부여. | `Roboto Mono` 또는 유사 고정폭 서체. | 점수, 리스크 레벨(`CRITICAL`, `HIGH`), 오류 메시지 등 모든 '시스템적' 텍스트에 적용. |

## 📈 II. 위젯 상태 흐름도 (State Machine Flow)

위젯은 다음의 세 가지 핵심 상태를 거치며 전환되어야 합니다. 각 상태 전환 시, *반드시* 지정된 애니메이션 효과가 발생해야 합니다.

### State A: Initial / Loading (`Loading...`)
1.  **시작:** 위젯이 페이지에 마운트됨과 동시에 `LOADING` 메시지가 출력됩니다.
2.  **애니메이션:** 전체 배경에 저주파의 **노이즈 오버레이(Noise Overlay)**가 겹쳐집니다 (Opacity 10% $\rightarrow$ 30%로 서서히 증가).
3.  **게이지 동작:** 게이지 바는 단순히 채워지는 것이 아니라, 마치 데이터 스트림을 받아 처리하는 것처럼 **불안정한 파동 형태(Unstable Waveform)**로 짧고 빠르게 움직입니다 (Pseudo-random oscillation).
4.  **사운드 연출:** 낮은 주파수의 '시스템 부팅음' 또는 '데이터 로딩 톤'이 배경에 깔립니다.

### State B: Processing / Warning (`Calculating...`)
1.  **전환 트리거:** Mock API 호출이 진행되는 동안 (약 2~3초).
2.  **시각 효과:** `⚠️ WARNING` 경고 메시지가 중앙 상단에 나타나며, **글리치 애니메이션(Glitch Animation)**을 반복적으로 수행합니다 (100ms 주기로 깜빡이는 색상 왜곡/텍스트 시프트).
3.  **게이지 동작:** 게이지 바가 '점진적 위험 증가'를 표현하며 빨간색으로 점유율이 늘어납니다. 이 과정에서 **Red Zone의 강렬한 플래시 효과(Flash Effect)**가 1초 간격으로 짧게 반복됩니다 (Opacity 0 $\rightarrow$ 70% Red Flash $\rightarrow$ 0).
4.  **사운드 연출:** '삐-익' 하는 높은 경고음과 함께, 시스템이 데이터를 처리하는 듯한 빠른 타이핑 사운드가 삽입됩니다.

### State C: Result / Critical Error (`CRITICAL ERROR`)
1.  **최종 충격 (Impact):** API 응답(위협 점수)을 받는 순간, 페이지 전체에 짧고 강력한 **빨간색 플래시(Red Flash)**가 200ms 동안 지나갑니다. [근거: Self-RAG]
2.  **결과 표시:** 최종 리스크 점수와 레벨(`CRITICAL` 등)이 Monospace Font로 중앙에, 강하게 고정됩니다.
3.  **애니메이션 로직 (핵심):**
    *   점수가 높은 경우: 경고 메시지 주변으로 **'데이터 손실(Data Leak)'을 암시하는 픽셀화된 노이즈 폭발 애니메이션**이 짧게 발생합니다.
    *   위젯의 최종 결과창은 '진단 보고서'처럼 보이며, 권위를 강조하기 위해 `Authority Blue` 배경에 흰색/빨간색 데이터 포인트가 배치됩니다.

## 💻 III. 개발 구현 스펙 (Technical Blueprint)

### 1. 애니메이션 키프레임 정의 (`@keyframes`)
| 이름 | 설명 | 적용 위치 | 기술적 요구사항 |
| :--- | :--- | :--- | :--- |
| `glitch-text` | 텍스트의 순간적인 색상 왜곡 및 변위 (Chromatic Shift). | 모든 경고 텍스트 (H1, Warning Message) | CSS 애니메이션. 반복 주기(Animation Timing Function)는 **불규칙적**이어야 함 (`cubic-bezier(...)` 사용 지양). |
| `red-flash` | 강렬하고 짧은 시각적 충격. | 전체 Viewport 또는 위젯 컨테이너 | JavaScript로 클래스 토글 필요. Opacity: 0 $\rightarrow$ 1 (Red Zone) $\rightarrow$ 0. Duration: 200ms. |
| `data-wave` | 게이지의 불안정한 파동 움직임. | Threat Gauge Fill Bar | CSS Keyframes + JavaScript의 `Math.sin()` 함수를 결합하여 구현. 주파수(Frequency)는 점수에 비례해야 함. |

### 2. API 연동 및 로직 분리 (Pseudocode Logic Flow)
```javascript
async function fetchRiskScore() {
    // State A: Initial Load
    setWidgetState('LOADING');
    triggerAnimation('loadingNoise', 3000); // 노이즈 오버레이 3초 유지

    try {
        // Simulate API call
        const score = await mockApiCall(); 
        
        // State B: Processing/Warning (Data fetching simulation)
        setWidgetState('PROCESSING');
        triggerAnimation('glitchText', 2500); // 글리치 경고 2.5초 동안 활성화
        await new Promise(resolve => setTimeout(resolve, 100)); // 짧은 지연

        // State C: Final Result/Impact
        setWidgetState('IMPACTING');
        triggerAnimation('redFlash', 200); // 빨간 플래시 발사 (즉각적)
        await new Promise(resolve => setTimeout(resolve, 500)); 

        // 최종 결과 표시 및 애니메이션 종료
        setScore(score);
        triggerAnimation('stabilizeGauge'); // 게이지 안정화 애니메이션 시작
    } catch (error) {
        setWidgetState('CRITICAL_ERROR');
        // 에러 처리 로직: 즉시 붉은 플래시 + 고정된 "FATAL ERROR" 메시지 출력
    }
}
```

---
**[참고] 개발자 주석:** 이 스펙은 모든 애니메이션이 **비선형적(Non-linear)**이고 예측 불가능해야 한다는 점을 강조합니다. 일정한 간격의 반복 효과는 '기계적'이라 느껴져 권위가 떨어집니다. 불안정함 그 자체가 핵심입니다.
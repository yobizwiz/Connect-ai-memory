# 🛠️ Master Production Design System Specification V2.0

## 📋 개요: 목표와 원칙
**목표:** 고객의 '시스템적 무지(Systemic Ignorance)'를 자극하고, 위기감을 통해 $1,999/월$ 프로토콜에 대한 결제를 강제한다.
**톤앤매너:** 고권위, 불안정, 하이테크 디스토피아 (Industrial Thriller).

## 🎨 컬러 팔레트 및 타이포그래피
| 역할 | 색상명 | HEX Code | 적용 범위 |
| :--- | :--- | :--- | :--- |
| **Primary Font** | Inter | N/A | 모든 본문, 제목. 가독성 확보. |
| **Data/Alert Font** | Roboto Mono | N/A | $QLoss$, 에러 코드, 경고 메시지 전용. 시스템 권위 부여. |
| **Red Zone (🚨)** | Dark Crimson | `#C0392B` | 경고, 오류, 위협 시각화. 플래시 및 글리치 주 색상. |
| **Authority Blue (🔵)** | Deep Slate Blue | `#2980B9` | 해결책 제시, CTA 버튼 배경. 신뢰와 전문성 강조. |
| **Background** | Neutral Black | `#1A1A1A` | 전반적인 시스템 배경색.

## 💻 애니메이션 및 인터랙션 지침 (개발팀 필수 참고)

### 1. Red Zone Alert Box (`<CriticalAlert>`)
*   **JS Trigger:** $QLoss$가 임계치에 도달했을 때 (예: $>85\%$).
*   **Visuals:**
    *   **(A) 플래시 효과:** `setTimeout`을 사용하여 200ms 주기로 배경 오버레이(`opacity: 1`)를 강제합니다.
    *   **(B) 글리치 효과 (CSS):** 경고 문구에 다음 스타일 조합을 무작위로 적용하여 시스템 오류처럼 보이게 합니다.
        ```css
        text-shadow: 
          2px 0 red, -2px 0 blue, /* 색상 왜곡 */
          1px 1px rgba(255, 255, 255, 0.8); /* 하이라이트/떨림 */
        transform: translate(-0.5px, 0) skewX(0.5deg);
        ```

### 2. $QLoss$ 게이지 인터랙션 (`<QLossGauge>`)
*   **애니메이션:** 단순 바가 아닌, 불안정한 파동(Sine Wave) 형태의 데이터 흐름으로 구현합니다.
*   **경고 로직:** 값이 상승할 때마다 경계선(Threshold Line)이 Red Zone 컬러로 깜빡이며, 이 움직임은 사운드와 동기화되어야 합니다.

### 3. 데이터 로딩 시퀀스 (`<DataLoader>`)
*   **CSS Filter:** 배경에 `filter: contrast(1.1) hue-rotate(5deg)` 등의 미세한 노이즈/색상 왜곡 필터를 지속적으로 적용합니다.
*   **UI 요소:** 일반적인 로더 대신, 픽셀 단위로 데이터가 '재구성되는' 듯한 애니메이션을 사용하며, 이 과정에서 `Roboto Mono` 폰트의 오류 코드가 무작위로 깜빡이게 합니다.

## ✨ 요약 및 최종 검토
모든 디자인 요소는 **시스템적 결함(System Failure)**이라는 관점에서 접근해야 하며, '미려한 디자인'보다는 '압도적인 위협감'에 초점을 맞춥니다.
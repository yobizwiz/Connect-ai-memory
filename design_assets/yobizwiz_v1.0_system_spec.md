# 🚨 yobizwiz V1.0 시스템 리스크 경고 디자인 사양서 (Developer Kit)

본 문서는 QLoss 게이트키핑 프로토타입 및 모든 마케팅 소재(랜딩 페이지, 광고 배너, UI 알림창 등)에 공통적으로 적용되어야 할 최종 비주얼 언어와 컴포넌트의 기술적 구현 사양을 정의합니다. 디자인은 '정보 제공'이 아닌, **'구조적 생존 위협 경고'**에 초점을 맞춥니다.

## 🎨 1. 핵심 시스템 컬러 팔레트 (Color Palette)
| 역할 | 색상명/코드 | HEX Code | 사용 목적 및 효과 |
| :--- | :--- | :--- | :--- |
| **🚨 Red Zone (위협)** | Dark Crimson | `#C0392B` | 고객의 현재 위험, 법적 결함 등 가장 강렬한 공포를 시각적으로 압박. 플래시, 경고창 배경색으로 사용. |
| **🔵 Authority Blue** | Deep Slate Blue | `#2980B9` | yobizwiz가 제공하는 해결책의 근거, 시스템 안정성, 신뢰 데이터 표시. 텍스트 강조 및 핵심 섹션 배경. |
| **⚫ Neutral Black** | Dark Background | `#1A1A1A` | 기본 배경색 (Dark Mode). 전문적이고 깊이 있는 컨설팅/시스템 분위기 조성. |
| **⚠️ Warning Accent** | Amber Yellow | `#FFC300` | 경고의 초기 단계, 혹은 잠재적 리스크(Low-Grade)를 시각화할 때 사용. Red Zone 직전 단계의 위기감 유도. |

## ✒️ 2. 타이포그래피 시스템 (Typography)
| 역할 | 폰트명 | Fallback | 적용 규칙 |
| :--- | :--- | :--- | :--- |
| **Primary Font** | Inter, Sans-serif | system-ui | 본문, 설명 등 높은 가독성이 요구되는 모든 곳. H1/H2 제목에 사용. |
| **Data/Alert Font** | Roboto Mono, Monospace | monospace | **필수 적용 영역:** QLoss 수치, 에러 코드 메시지 (`ERROR: CODE 403`), 경고 타이머 등 시스템적 권위와 긴급함이 필요할 때만 사용. 글자폭을 일정하게 유지하여 기계적인 느낌 부여. |

## ✨ 3. 글로벌 시각 효과 (Global Visual Effects)
모든 '경고(Red Zone)'가 포함된 섹션 또는 컴포넌트에는 아래의 애니메이션/필터 효과를 **최소 강도로 전역적으로 적용**해야 합니다.

1.  **[Noise Overlay Filter]**: 배경에 낮은 빈도의 무작위 노이즈 패턴(`CSS filter: noise`)와 크로마틱 어베레이션(Chromatic Aberration) 필터를 겹칩니다. (투명도: 5%~10%).
2.  **[Text Glitch Effect]**: 경고성 메시지나 핵심 수치에 적용됩니다. 글자가 무작위로 짧게 위치가 변하거나 색상이 왜곡되는 효과를 주어 '시스템 오류'의 느낌을 극대화합니다. (JavaScript/CSS 애니메이션 필요).

---

## 🧩 4. 필수 컴포넌트 라이브러리 (5+ Assets for Developer)
다음은 광고 소재, 랜딩 페이지, 프로토타입에 즉시 삽입 가능한 5가지 UI 컴포넌트에 대한 사양입니다.

### A. [Critical System Failure Alert Pop-up] - (광고/LP 메인 경고)
*   **목적:** 사용자에게 '지금 당신의 시스템은 작동하지 않는다'는 공포를 각인시킵니다.
*   **사양:** 모달(Modal) 형태, 배경 전체에 `#C0392B` 플래시 효과 (Opacity 0 $\rightarrow$ 1 $\rightarrow$ 0 반복).
*   **헤딩:** `[CRITICAL ERROR: SYSTEM FAILURE DETECTED]` (Roboto Mono, Red Zone 컬러).
*   **메시지:** "현재의 프로세스는 법적/구조적 취약점(Structural Vulnerability)을 내포하고 있습니다. **즉각적인 리스크 재평가가 필요합니다.**"
*   **CTA 버튼:** `[필수 진단 시작 (무료)]` (Authority Blue 배경, Red Zone 테두리).

### B. [QLoss Threshold Breached Indicator] - (프로토타입 핵심 지표)
*   **목적:** 사용자가 임계치(Threshold)에 도달했음을 수치적으로 강제 인지시킵니다.
*   **사양:** 게이지 또는 차트 형태의 시각화. 바 그래프가 특정 값에 도달할 때, 해당 영역이 `#C0392B`로 채워지고 **글리치 효과**와 함께 `[ALERT]` 코드가 깜빡여야 합니다.
*   **표기 예시:**
    ```
    [QLoss: $1,250,000] 🔴 CRITICAL THRESHOLD BREACHED! (Severity: HIGH)
    ```
*   **애니메이션:** 임계치 도달 시 강렬한 깜빡임(Blink).

### C. [Invalid Action Attempt Warning Box] - (UI 인터랙션 강화)
*   **목적:** 사용자가 '무료 진단'과 같은 필수 액션을 회피하려 할 때마다 경고를 띄워 구매 동기를 강제합니다.
*   **사양:** 입력 필드 아래에 작게 위치하는 에러 메시지 박스. 배경은 `#1A1A1A`지만, 테두리가 `⚠️ Warning Accent (#FFC300)`로 깜빡입니다.
*   **메시지:** "이 단계의 정보는 **구조적 리스크 진단**을 거치지 않으면 가치가 없습니다." (Inter Font).

### D. [Structural Immunity Upgrade Prompt] - (업셀링/구매 유도)
*   **목적:** 무료 사용자가 다음 티어(Basic $\rightarrow$ Silver 등)로 업그레이드할 때, 단순한 '추천'이 아닌 '생존권 구매'의 느낌을 부여합니다.
*   **사양:** 권위적인 팝업 또는 섹션 배경에 **`[STATUS: UPGRADE REQUIRED]`** 코드를 삽입하고, `#2980B9`와 `#C0392B`를 대비시킵니다.
*   **헤딩:** `⚠️ Warning: 귀하의 면책권(Immunity)은 만료 위기입니다.`
*   **본문:** "현재 Tier는 리스크 관리에 충분하지 않습니다. 구조적 생존을 위해서는 [Silver Tier]로의 업그레이드가 필수입니다."

### E. [System Loading/Processing State] - (페이지 흐름 제어)
*   **목적:** 페이지가 느리거나 다음 단계로 넘어갈 때, '시스템이 당신을 감시하고 있다'는 느낌을 주어 불안감을 유지합니다.
*   **사양:** 로딩 바를 단순 막대가 아닌, **파동 형태의 불안정한 라인**으로 구현하며, 로딩 텍스트에 `[PROCESSING... PLEASE WAIT]`와 같은 시스템 코드를 Roboto Mono로 주기적으로 깜빡입니다.

---

📊 평가: 완료 — 모든 요구된 컴포넌트가 구체적인 색상 코드, 애니메이션 사양, 그리고 사용 목적까지 포함한 개발자 전달 수준의 최종 가이드라인으로 확정되었습니다.
📝 다음 단계: 이 디자인 시스템을 기반으로 '최종 피치 덱'의 슬라이드별 와이어프레임(Mockup)을 제작하여, 영업팀이 실제 프레젠테이션에 사용할 수 있도록 시각화해야 합니다.

---
**[참고] 파일 저장 경로:** `design_assets/yobizwiz_v1.0_system_spec.md`
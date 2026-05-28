# 📊 yobizwiz 리스크 경고 대시보드 UI/UX 스펙 (v4.0) - 최종본

## I. 목표 및 디자인 철학
*   **목표:** 고객에게 시스템적 취약성(Structural Vulnerability)을 단계적으로 인지시키고, yobizwiz의 솔루션이 유일하고 필수적인 방어벽임을 강제한다.
*   **핵심 원칙:** 공포 (Fear) $\rightarrow$ 권위 (Authority) 전환 극대화.
*   **경고 스펙트럼:** Green (안전) $\to$ Yellow (주의/Gap) $\to$ Red (임계점/Failure).

## II. 컬러 팔레트 및 폰트
| 역할 | HEX Code | 사용 목적 | 비고 |
| :---: | :---: | :---: | :---: |
| **🔴 Critical** | `#C0392B` | 임계점, 치명적 오류 (Failure) | 글리치 효과 필수. Monospace 조합. |
| **🟡 Caution** | `#FFC300` | 데이터 불완전성, 잠재 위험 (Gap) | 낮은 빈도의 펄스/노이즈 오버레이. Monospace 사용. |
| **🔵 Authority Blue** | `#2980B9` | 솔루션 제시 영역의 기본 톤. | 배경 및 주요 CTA 버튼 색상. |
| **⚫ Neutral Black** | `#1A1A1A` | 전체 배경색 (Dark Mode). | 높은 전문성과 깊이감을 유지. |
*   **Primary Font:** Inter, Sans-serif (가독성 최우선)
*   **Data/Alert Font:** Roboto Mono, Monospace (모든 경고 및 코드 블록에 적용)

## III. 컴포넌트 스펙: 리스크 위젯 (Risk Widget Component)
각 KPI 카드는 다음 구조를 가지며, 상태 변화 시 해당 섹션의 배경과 애니메이션이 변경된다.

### 1. [✅ Green Zone - Compliant]
*   **디자인:** `Background: #232A35` (어두운 회색), 경고 아이콘: ✅ (Teal).
*   **메시지 예시:** "GDPR Compliance Score: 98% (Status: Operational)"
*   **애니메이션:** 정적이고 차분함.

### 2. [⚠️ Yellow Zone - Data Gap / Caution]
*   **디자인:** `Background Overlay:` Amber Gradient (Opacity 15%). 경고 아이콘: ⚠️ (Pulsating).
*   **구조:** **[SYSTEM WARNING]:** 헤더를 강하게 처리하고, 아래에 코드 블록을 배치하여 기술적 결함의 느낌을 부여.
*   **애니메이션/UX:** 위젯 주변으로 `pulsing-glow` CSS 클래스를 적용 (Amber). 진입 시 짧은 디지털 '삐-' 소리 사운드 트리거.
*   **데이터 표시 예시:**
        <div class="yellow-gap">
      <span class="icon">⚠️</span> 
      <p class="alert-header">[DATA GAP DETECTED]</p>
      <pre class="code-snippet">ERROR CODE: RGS-401</pre>
      <p class="detail-text">Required input parameter 'SupplyChain_PartnerID' is null. Risk calculation for Scenario 1 incomplete.</p>
    </div>
    ```

### 3. [🚨 Red Zone - Critical Failure]
*   **디자인:** `Background Overlay:` Dark Crimson (Opacity 5%). 경고 아이콘: 🚨 (Flickering).
*   **구조:** **[CRITICAL ALERT]:** 헤더를 가장 강렬하게 처리하고, $TRE$ 금액을 메인으로 배치.
*   **애니메이션/UX:** `flashing-flash` 효과와 함께 노이즈 필터(Noise/Glitch Overlay)가 전역적으로 적용된다. 진입 시 강력한 경고 사운드 트리거.

## IV. 개발 연동 스펙 (Integration Checklist)
1.  **백엔드 API:** 코다리가 확장한 `risk_calculator_service.py`의 JSON 출력 구조(`metadata`, `alerts`)를 프론트엔드가 받아야 함.
2.  **프론트엔드 로직:** JSON 내 `alert_level` 필드를 체크하여, 위에서 정의된 3가지 상태(Green/Yellow/Red) 중 하나로 판단하고 해당 스펙을 적용해야 함.
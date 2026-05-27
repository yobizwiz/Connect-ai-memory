# LP 이탈 패턴 진단 계획 (Mini-Report & Pre-Audit)

본 문서는 yobizwiz 랜딩 페이지(LP)의 구조적 이탈 패턴을 수집 및 진단하여, QLoss 경고 시퀀스와 Mini-Report 결제 전환율(Conversion Rate)을 극대화하기 위한 데이터 수집 및 분석 프레임워크입니다.

---

## 1. 진단 배경 및 목적 (Background & Purpose)
현재 구축 중인 **Compliance Gatekeeper** 및 **Red Zone 경고 시스템**이 사용자에게 극도의 긴장감과 구조적 리스크를 체감시키고 있는지 정량적으로 검증합니다.
*   **이탈 분석(Bounce Pattern):** 사용자가 어느 구간에서 심리적 저항을 느끼고 이탈(Bounce/Exit)하는지 패턴을 진단합니다.
*   **전환율 최적화:** 경고 메시지 출력 시점(T=0 ~ T=2000ms)과 최종 구매 CTA 버튼 활성화 간의 시간적 조율(Time Pressure)이 이탈율에 미치는 영향을 측정합니다.

---

## 2. 핵심 측정 지표 (Key Metrics to Track)

| 지표명 | 측정 목적 및 수집 데이터 | 목표 기준치 |
| :--- | :--- | :--- |
| **스크롤 깊이 (Scroll Depth)** | 사용자가 Red Zone Alert 영역 또는 계산기 영역까지 도달했는지 여부 | 70% 이상 도달 |
| **경고 시점 체류 시간 (Dwell Time)** | 시스템 무결성 경고(`QLoss`) 노출 후 사용자가 이탈하기까지 버틴 시간 | 최소 3.0초 이상 유지 |
| **CTA 클릭 전환율 (CTA CTR)** | "구조적 무결성 확보 (Mini-Report 구매)" 버튼 클릭률 | 15% 이상 달성 |
| **이탈 의도 감지 (Exit Intent)** | 마우스 커서가 브라우저 뷰포트 밖(탭 닫기/뒤로 가기 방향)으로 향하는 시점 측정 | 감지 시 즉시 Pre-Audit 라이선스 안내 |

---

## 3. 데이터 수집 아키텍처 (Data Collection Setup)

### A. 클라이언트 행동 추적 (Client-side Tracking)
*   **이벤트 트리거 (Event Trigger):**
    - `QLOSS_ACTIVE` 상태 전환 시점 기록
    - `isProcessing` (진단 중) 상태에서 사용자의 중복 클릭 빈도 측정
    - 최종 CTA 버튼 호버(Hover) 유지 및 클릭 시도 시점 로그 전송
*   **사용 도구:** Google Analytics 4 (GA4) Custom Event, Hotjar 마우스 히트맵 연동

### B. 이탈 패턴 진단 시나리오 (Failure & Exit Modes)
1.  **초기 로딩 단계 이탈 (T < 1500ms):** 시스템 연결 화면에서 딜레이를 견디지 못하고 이탈하는 사용자 분석.
2.  **경고 메시지 거부 반응 (Red Zone Bounce):** `CRITICAL` 위협 경고를 접한 뒤, 강한 저항감이나 불신으로 창을 닫아버리는 패턴 진단.
3.  **가격 저항 이탈 (CTA Failure):** 최종 혜택 및 해결책(Mini-Report) 가격을 인지한 시점에서의 이탈 여정 분석.

---

## 4. 최적화 및 A/B 테스트 전략

*   **테스트 A안 (Technical Authority):** Monospace 폰트 및 규제 코드(`ERROR_SI-403`)를 대폭 전면 배치하여 시스템 권위를 앞세우는 방향.
*   **테스트 B안 (Financial Fear):** 구체적인 손실액 수치(예: `$50M ~ 최소`) 및 $QLoss$ 시뮬레이션을 눈에 띄게 배치하여 심리적 압박을 강화하는 방향.
*   **Pre-Audit 연계:** 이탈 감지 팝업 발동 시, "1회성 Pre-Audit 간이 진단 라이선스"를 초저가에 즉시 제안하여 이탈 사용자의 2차 결제를 유도함.
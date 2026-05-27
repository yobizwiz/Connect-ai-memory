# 🧪 QLoss Gateway E2E 통합 테스트 명세 (v3.0)

## 🎯 목표
사용자 입력 $\rightarrow$ API 분석 $\rightarrow$ 리스크 경고(UI/UX) $\rightarrow$ 결제 게이트 진입 $\rightarrow$ 최종 트랜잭션 처리까지의 **구조적 무결성**을 검증한다. 단순히 성공하는 플로우가 아니라, **실패하고 복구되는 과정**이 우리의 영업 핵심입니다.

## 📜 테스트 환경
*   **Frontend:** React/TypeScript (Next.js assumed)
*   **Backend Mock API:** `reportGeneratorAndSimulatePayment` 함수 (Latency: 3s)
*   **Payment Gateway:** `PaymentGate` 컴포넌트 (Latency: 2s)

## ✅ 테스트 시나리오 및 검증 항목

### Case 1: 정상적인 '구조적 결함' 감지 플로우 (Critical Path - 성공 유도)
1.  **입력 데이터:** "Legacy API를 활용한 구조 개선이 필요합니다." (High Risk Mock Input)
2.  **API 결과 예상:** `structural_flaw_detected: true`, `severity: CRITICAL`, `paymentRequired: true`
3.  **Frontend 검증 1 (GatewayForm):** 로딩 상태(`isLoading`)가 정확히 3초간 유지되며, 결제 유도 메시지("구조적 취약점 발견")를 표시한다.
4.  **Frontend 검증 2 (Navigation):** `PaymentGate` 컴포넌트로 자동 라우팅이 성공적으로 트리거된다.
5.  **Payment Gate 검증:** 화면에 **GlitchWarningBox**가 활성화되고, 결제 버튼의 금액(`$M 단위`)과 리스크 경고 문구가 명시되어야 한다.
6.  **결제 시뮬레이션 (Success Path):** 사용자가 '구매' 버튼 클릭 $\rightarrow$ 2초 대기 $\rightarrow$ `paymentStatus: SUCCESS`로 변경 및 최종 CTA가 활성화된다.

### Case 2: 낮은 리스크의 정상 종료 플로우 (Baseline Check)
1.  **입력 데이터:** "최신 규격에 맞춰 안정적으로 운영 중입니다." (Low Risk Mock Input)
2.  **API 결과 예상:** `structural_flaw_detected: false`, `severity: LOW`, `paymentRequired: false`
3.  **Frontend 검증 1:** 결제 유도 없이, '진단 완료' 보고서만 표시하고 사용자를 안심시킨다. (최종 CTA가 약화되는 것이 목적).

### Case 3: 치명적인 API 호출 실패 플로우 (Error Handling)
1.  **트리거:** `reportGeneratorAndSimulatePayment` 함수 내에서 강제 에러 발생을 가정한다.
2.  **Frontend 검증:** `isLoading` 상태가 해제된 직후, 사용자에게 "데이터 전송 중 오류..." 메시지(`setErrorMessage`)를 보여준다. (시스템의 신뢰성을 잃는 순간이므로 UI/UX적으로 불안정함을 강조할 필요 있음.)

### Case 4: 결제 시스템 자체 실패 플로우 (The Loss Experience)
1.  **진입 조건:** Case 1을 통해 Payment Gate에 진입한다.
2.  **Mock API 시뮬레이션:** `paymentStatus`가 임의로 `FAILED` 상태를 가질 경우 (예: 높은 리스크 점수 + 랜덤 실패), 결제 버튼이 비활성화되고, **특정 에러 메시지(e.g., "재무적 불일치" 등)**와 함께 '다시 진단하기' CTA가 활성화되어야 한다.

## 🛠️ 테스트 실행 계획
1.  `src/services/__tests__/reportGeneratorService.test.ts`: `generateReportAndSimulatePayment`의 리스크 및 결제 필요 여부 로직 검증 (Unit Test).
2.  `src/pages/__tests__/PaymentGate.test.tsx`: 컴포넌트 상태 변화(Success/Fail)와 UI/UX 연동 테스트 (Integration Test).
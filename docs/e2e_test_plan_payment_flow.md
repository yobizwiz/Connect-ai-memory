# 🛡️ Mini-Report 구매 플로우 E2E 통합 테스트 계획 (V1.0)

## 🎯 목표
결제 게이트웨이(Stripe 등)를 통한 유료 결제 시뮬레이션부터, 보고서가 사용자 계정으로 정상 발송되기까지의 **모든 상태 전이(State Transition)**와 **예외 처리 로직**을 검증하여 시스템 무결성을 확보한다.

## 🌐 핵심 플로우 개요
`[사용자 입력] $\rightarrow$ [프론트엔드 리스크 진단 요청] $\rightarrow$ [백엔드 API 호출 (PaymentIntent 생성)] $\rightarrow$ [Stripe 결제 수행] $\rightarrow$ [Webhook 수신 및 상태 업데이트] $\rightarrow$ [보고서 발송 트리거]`

## 🐛 검증해야 할 필수 예외 시나리오 목록 (Failure Modes)

| ID | Failure Scenario | 발생 지점 | 예상 시스템 동작/검증 목표 | Recovery Logic (최우선) |
| :--- | :--- | :--- | :--- | :--- |
| **F-01** | **카드 거절 (Card Declined)** | PG 결제 단계 | API 응답 코드(402 등)를 받아야 함. 사용자에게 '재무적 손실 경고'와 함께 명확한 실패 사유 제시. | 1. 에러 메시지를 상세히 보여줌. 2. 재시도 시 만료된 크레딧 카드 정보를 입력할 수 있도록 유도. |
| **F-02** | **네트워크 중단 (Mid-transfer)** | 백엔드 $\rightarrow$ PG 통신 | 클라이언트가 결제 성공을 받았으나, 서버로의 최종 승인(Webhook) 요청이 실패하는 경우. | 1. `Retry Mechanism` 구현 필수. 2. 주기적으로 DB 상태를 재확인하는 Job Scheduler (Cron/Worker Queue)가 작동해야 함. |
| **F-03** | **Webhook 지연/누락 (Stale Webhook)** | PG $\rightarrow$ 백엔드 | 결제 성공 후 웹훅이 지연되거나 누락되는 경우. | 1. `Idempotency Key`를 이용해 중복 처리 방지. 2. 모든 트랜잭션에 대해 최종 상태가 'PENDING'으로 오래 머물지 않도록 타임아웃 정책을 적용하고 알림 발송. |
| **F-04** | **보고서 생성 실패 (Internal Error)** | 백엔드 로직 / 외부 API 연동 | 결제는 성공했으나, 보고서 내용 생성에 필요한 외부 데이터(예: 규제 DB) 호출이 실패하는 경우. | 1. 결제 취소/환불 프로세스 자동 트리거 (Rollback). 2. 사용자에게 '시스템 오류 발생' 메시지와 함께 재시도 시간을 안내하고, 고객 지원 채널을 강제 제시. |
| **F-05** | **사용자 권한 문제 (Auth Failure)** | DB 접근 / API 호출 | 유효한 결제 정보가 있어도, 사용자의 계정이 비활성화되거나 만료된 경우. | 1. 즉시 로그인/계정 활성화 요청 화면으로 리다이렉트. 2. 오류 원인을 명확히 설명하고 재접속을 안내. |

## 🛠️ 기술 검증 포인트 (Technical Focus)
1.  **Idempotency:** 모든 결제 API 호출에는 고유한 `Idempotency Key`를 사용하여 중복 트랜잭션을 원천 차단해야 한다.
2.  **State Machine:** 사용자 계정의 구매 상태는 반드시 [Initial] $\rightarrow$ [Pending Payment] $\rightarrow$ [Paid/Processing] $\rightarrow$ [Completed] 또는 [Failed]의 명확한 상태 기계를 따라야 하며, 이 모든 전이는 DB 트랜잭션으로 원자성을 보장해야 한다.
3.  **Rollback:** 결제 성공 후 리포트 생성 실패 시(F-04), PG 시스템에 `Refund` 요청을 하는 백엔드 로직이 필수적이다.
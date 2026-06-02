# 🚨 [Update] 시스템적 위협 기반 $L_{max}$ 계산 계수 (Version 2.0)

**작성일:** 2026년 6월
**목표:** 기존의 규제 벌금 중심 분석에서 벗어나, 미래 구조적 취약성을 정량적으로 포착하는 프레임워크를 확립한다. 모든 $L_{max}$ 계산은 아래 세 가지 모델을 중심으로 진행되어야 한다.

## 1. 양자 컴퓨팅 위협 계수 (R-001)
*   **위험 지표:** 암호화된 데이터의 기밀성 상실 확률 ($P_{\text{Quantum Risk}}$).
*   **계산식:** $L_{\text{max}} = K_{\text{Data Value}} \times P_{\text{Quantum Risk}} \times C_{\text{Mitigation Gap}}$
*   **필수 데이터 입력 항목:** 총 데이터 자산 시장 가치 (K_Data Value), 현재 암호화 수준의 양자 취약성 지표, PQC 도입 시 예상 비용 증감 계수.

## 2. AI 책임 공백 위협 계수 (R-002)
*   **위험 지표:** 의사결정 과정의 투명성(Provenance) 부족으로 인한 법적 추적 불가능성 ($W_{\text{Opacity}}$).
*   **계산식:** $L_{\text{max}} = L_{\text{Operational}}(T) \times W_{\text{Opacity}} + N_{\text{Stakeholder}} \times C_{\text{Legal Vacuum}}$
*   **필수 데이터 입력 항목:** 시간당 운영 중단 손실액, 책임 추적 불가능성 가중치, 이해관계자 복잡도 및 규모.

## 3. 기후/공급망 단절 위협 계수 (R-003)
*   **위험 지표:** 외부 물리적 요인에 대한 비즈니스 연속성 취약성 ($I_{\text{Criticality}}$).
*   **계산식:** $L_{\text{max}} = C_{\text{BCP}} \times I_{\text{Criticality}} \times D_{\text{Dependency}}$
*   **필수 데이터 입력 항목:** 최소 운영 유지 비용, 핵심 자원의 중요도 등급 (1~5), 공급망 내 의존성 깊이 측정치.

---
[근거: CEO 지시 및 Researcher 개인 메모리 - 'AI 출처 명시 및 검증 의무 강화', '시스템적 위험']
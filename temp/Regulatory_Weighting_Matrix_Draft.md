# ⚖️ Regulatory Threat Weight Matrix for Risk Engine (US Market)
## 🎯 목표: 리스크 점수 산출을 위한 정량적 가중치 확보
### 1. GDPR (General Data Protection Regulation) - EU 기준
*   **핵심 위협:** 개인 식별 정보(PII) 처리 및 국경 간 데이터 전송의 투명성 결여.
*   **위협 가중치 항목:** 1. 동의 기록 누락, 2. 삭제 요청 대응 시간 지연 (Right to Erasure), 3. 데이터 주체 권리 위반.
*   **가중치 예시:** '삭제권(Erasure Right) 미준수' $\rightarrow$ **Critical Weight (x5)**

### 2. CCPA (California Consumer Privacy Act) - CA 기준
*   **핵심 위협:** 소비자 데이터의 판매 및 접근 권한 부족.
*   **위협 가중치 항목:** 1. 'Do Not Sell My Data' 옵션 미제공, 2. 데이터 수집 목적 명시 누락, 3. 사용자 정보 삭제 요청 처리 실패.
*   **가중치 예시:** '데이터 판매 여부 고지 의무 위반' $\rightarrow$ **High Weight (x4)**

### 3. NY SHIELD Act (New York Stop-Loss Data Security) - 뉴욕 현지 기준 ⭐
*   **핵심 위협:** 암호화, 접근 통제 등 기술적/관리적 보안 대책의 미비. (특히 금융 관련 데이터 취급 시 중요도 급증).
*   **위협 가중치 항목:** 1. 최소한의 '암호화(Encryption at Rest)' 적용 여부, 2. 주기적인 취약점 점검 기록 누락, 3. 접근 권한 통제 시스템 부재.
*   **가중치 예시:** '기본 암호화 미적용' $\rightarrow$ **Critical Weight (x5)**

---
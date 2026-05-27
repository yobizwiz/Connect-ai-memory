# 💰 리스크 엔진 KPI 대시보드 요구사항 명세서 (V1.2)
## 🎯 목적: 기술적 아웃풋을 '판매 가능한 고단가 재무 보고서'로 전환한다.

yobizwiz가 제공하는 것은 단순한 리스크 진단이나 점수가 아닙니다. 고객사가 **현재 직면한 구조적, 시스템적 잠재 최대 손실액(Total Risk Exposure)**을 산출하고, 이를 방어하기 위한 '리스크 방어 필수 보험 솔루션'의 가치를 숫자로 설득하는 비즈니스 무기입니다. 

이 문서는 컴플라이언스 엔진의 최종 대시보드 및 결과 보고서(Output Report)가 반드시 충족해야 할 6대 핵심 KPI 정의와 기술적 요구사항을 명시합니다.

---

## 📊 I. 6대 핵심 리스크 메트릭 정의 (Core Metrics & Mathematical Models)

대시보드는 다음 6개 지표를 정량적으로 계산하여 시각화해야 합니다.

### 1. Total Risk Exposure (TRE) - 총 리스크 노출도
*   **측정 목적:** 연간 사업 규모 대비 법적/운영적 취약점으로 발생 가능한 최대 재무 손실 예측액 (**최고 가중치, 핵심 세일즈 지표**).
*   **계산 모델 수식:**
    $$\text{TRE} = \sum_{r \in \text{Regs}} \left( P_r \times L_r \times w_r \right) \times \text{Non-Compliance Ratio}$$
    *   $P_r$: 규제 $r$에 따른 사고 발생 확률 (Probability of Breach)
    *   $L_r$: 규제 $r$ 위반 시의 최고 법적 벌금/배상 규모 (Maximum Legal Penalty, 예: GDPR의 글로벌 매출 4%)
    *   $w_r$: 규제 위험도 가중치 (DORA, EU AI Act 등 신규 규제 강도에 따른 가중 계수)
    *   $\text{Non-Compliance Ratio}$: 내부 비즈니스 프로세스 중 미준수 단계의 비중 (PIG 지표와 연계)

### 2. Process Integrity Gap (PIG) - 프로세스 무결성 갭
*   **측정 목적:** 규제 법규의 의무 조건과 실제 내부 워크플로우 추적성 간의 격차 측정.
*   **계산 모델 수식:**
    $$\text{PIG} = \frac{\sum_{p \in \text{Proc}} \left( \text{Required Steps}_p - \text{Tracked Steps}_p \right)}{\sum_{p \in \text{Proc}} \text{Required Steps}_p} \times 100$$
    *   $\text{Required Steps}_p$: 프로세스 $p$에 규제 준수를 위해 반드시 수립되어야 하는 최소 통제 단계 수
    *   $\text{Tracked Steps}_p$: 현재 내부 시스템에서 감사 가능한 디지털 로그로 실시간 기록/추적되고 있는 실제 단계 수
*   **비즈니스 해석:** "규정은 5단계 추적을 요구하나 현재 수동 관리로 인해 PIG가 높습니다." $\rightarrow$ **Silver Tier(워크플로우 강제) 솔루션 영업 명분**

### 3. Audit Readiness Score (ARS) - 감사 준비도 지수
*   **측정 목적:** 외부 규제 기관 감사 시 적격 증적 자료를 즉시 도출할 수 있는 내부 통제 시스템의 종합 준비도 (0~100점).
*   **계산 모델 수식:**
    $$\text{ARS} = \left( \text{Standardization Rate} \times \text{Log Integrity} \right) \times 100$$
    *   $\text{Standardization Rate}$: 감사 요구 포맷에 맞게 구조화되어 RAG 시스템에 즉시 검색 가능한 데이터 비율
    *   $\text{Log Integrity}$: 위변조 불가능한 방식으로 영구 보존된 감사 로그 무결성 비율 (Zero-Trust Ledger 검증률)
*   **비즈니스 해석:** "귀사는 75%만 감사 대응이 가능합니다. 나머지 25%를 자동 증적화해야 합니다." $\rightarrow$ **Gold Tier(자동 감사 & API 통합) 영업 명분**

### 4. Compliance Drift Rate (CDR) - 규정 드리프트율 [NEW]
*   **측정 목적:** 비즈니스 운영이 지속됨에 따라 최초 수립한 통제 프로세스에서 이탈하여 변형/예외화되는 속도 측정.
*   **계산 모델 수식:**
    $$\text{CDR} = \frac{\Delta \text{PIG}}{\Delta t} \times (1 + \text{Manual Intervention Ratio})$$
    *   $\Delta \text{PIG}$: 관찰 기간 동안 증가한 Process Integrity Gap
    *   $\Delta t$: 관찰 시간 간격 (Time Period)
    *   $\text{Manual Intervention Ratio}$: 수동 개입이나 예외 처리를 거쳐 우회된 승인 단계의 비율
*   **비즈니스 해석:** "도입 초기에는 안전했지만, 수동 예외 처리 증가로 CDR이 우상향하고 있습니다." $\rightarrow$ **지속형 구독제(SaaS) 연장 명분**

### 5. AI Hallucination & Expert Liability (AIL) - AI 환각 및 전문가 책임 노출도 [NEW]
*   **측정 목적:** 생성형 AI 산출물(보고서, 법률 초안, 자문 등)의 무검증 활용에 따라 기업이 안게 되는 법적/전문가적 책임 리스크.
*   **계산 모델 수식:**
    $$\text{AIL} = \text{AI Usage Volume} \times \text{Hallucination Rate} \times \text{Expert Liability Weight} \times (1 - \text{Human Validation Rate})$$
    *   $\text{AI Usage Volume}$: 생성형 AI에 의해 자동/반자동으로 처리되는 코어 업무량
    *   $\text{Hallucination Rate}$: AI 모델 자체의 환각/오류 발생 기저 확률
    *   $\text{Expert Liability Weight}$: 오류 발생 시 법적 배상 및 전문가 신뢰도 책임 손실 가중치
    *   $\text{Human Validation Rate}$: Human-in-the-Loop 필터를 거쳐 유효성 검증이 최종 통과된 비율
*   **비즈니스 해석:** "AI 자동화 도입률 대비 검증률이 극히 낮아 치명적 책임 리스크에 직면해 있습니다." $\rightarrow$ **AI 결과물 전용 유효성 검증 게이트웨이 도입 유도**

### 6. Knowledge Silo Depth (KSD) - 지식 사일로 깊이 [NEW]
*   **측정 목적:** 부서 간 데이터 격리 및 상충되는 내부 규정 매뉴얼이 초래하는 의사결정의 오작동 리스크 정도 측정.
*   **계산 모델 수식:**
    $$\text{KSD} = \frac{\text{Conflicting Rules} \times \text{Isolated Data Channels}}{\text{Total Operational Nodes}}$$
    *   $\text{Conflicting Rules}$: 서로 다른 부서 매뉴얼 간 충돌하는 규칙 규칙 수 (예: 재무 승인과 법무 검토 조건 상충)
    *   $\text{Isolated Data Channels}$: 타 시스템과 단절된 폐쇄적 데이터 저장소 수
    *   $\text{Total Operational Nodes}$: 내부 전체 비즈니스 프로세스 노드 수
*   **비즈니스 해석:** "부서 간 지식 단절로 인해 승인 누락 및 모순된 결과가 지속 발생 중입니다." $\rightarrow$ **지식 RAG 통합 및 부서 협업 관리 툴 영업 명분**

---

## 🛡️ II. 글로벌 규제 프레임워크 리스크 가중치 설계 (Regulatory Weights)

리스크 계산 시 다음의 글로벌 규제를 $r \in \text{Regs}$로 포함하고 최고 수준의 가중치($w_r$)를 강제 부여합니다.

1.  **DORA (유럽 금융 디지털 운영탄력성법 - Digital Operational Resilience Act) [$w_{\text{DORA}} = 1.8$]**
    *   **통제 요구사항:** 서드파티 IT/SaaS 업체 위험성 평가, ICT 장애 실시간 모니터링 및 복구성 평가 의무화.
    *   **미준수 시 페널티:** 규제 당국에 의한 일일 벌금 부과 및 영업 정지 위험 연동.
2.  **EU AI Act (EU 인공지능 법안) [$w_{\text{AI}} = 2.0$]**
    *   **통제 요구사항:** 고위험(High-Risk) AI 활용 시 필수 데이터 거버넌스 준수, 시스템 로깅 투명성 확보, 위험 평가 수행 의무.
    *   **미준수 시 페널티:** 전 세계 연간 매출의 최대 7% 또는 €35M 중 높은 금액 벌금 연동.
3.  **SOC 2 Type II [$w_{\text{SOC2}} = 1.5$]**
    *   **통제 요구사항:** 보안(Security) 및 처리 무결성(Processing Integrity)에 대한 일정 기간(보통 6개월 이상) 동안의 지속적 작동 무결성 증명.
    *   **미준수 시 페널티:** 대형 엔터프라이즈 B2B 입찰 제한 및 고객 이탈 비용 연동.

---

## 🔒 III. 기술적 무결성 검증 사양 (Technical Integrity & Evidence Specs)

리스크 진단의 신뢰성을 확보하기 위해 백엔드 파이프라인은 반드시 다음 두 가지 기술적 증적 수단을 강제 구현해야 합니다.

### 1. Zero-Trust Data Residency Verification (제로 트러스트 데이터 리전 검증)
*   **사양:** 클라이언트의 동의 하에 분석된 모든 데이터가 지정된 물리적 리전(e.g., AWS Seoul Region)을 절대 벗어나지 않음을 검증.
*   **구현:** 아웃바운드 패킷 감시 및 데이터 흐름 감지 데코레이터를 통해 비인가 해외 RAG API(OpenAI 등)로의 PII 유출을 완벽히 차단하고, 매핑된 IP의 지리적 위치 정보를 해시화하여 증적으로 보존.

### 2. Immutable Audit Trail Ledger (위변조 불가능 감사 로그 원장)
*   **사양:** 대시보드에 보고되는 모든 리스크 진단 수치, PIG 감사 이력, 승인 기록 로그가 사후에 조작/수정될 수 없음을 보장.
*   **구현:** 매 감사 이벤트 발생 시 로그 데이터의 SHA-256 해시값과 이전 해시값을 체인 형태로 묶어 이뮤터블 원장(AWS QLDB 또는 온프레미스 이뮤터블 해시 체인 데이터베이스)에 영구 기록. 감사자가 실사 시 원본 데이터와 해시 체인을 대조하여 변조 여부를 1초 만에 검증 가능하도록 설계.

---

## ⚡ IV. 결제 전환 CTA 구조의 고도화 (Paywall & Pricing Strategy)

진단 보고서의 최하단에는 고객의 리스크 노출 수준에 맞춤화된 **Gold Tier** 결제 전환 장치를 배치하여 매출 극대화를 노립니다.

1.  **[Silver Tier: 워크플로우 강제 및 감사 추적 모듈]**
    *   **타겟:** PIG가 높고 수동 개입으로 CDR이 급증하는 고객사.
    *   **제시 가치:** "워크플로우 강제 제어 시스템을 구축하여 CDR과 PIG를 90% 이상 차단하고, TRE 예상액의 60%를 즉시 예방합니다."
2.  **[Gold Tier: 실시간 Zero-Trust 감사 및 RAG 통합 컴플라이언스 엔진]**
    *   **타겟:** AI 환각(AIL) 노출도가 높고 지식 사일로(KSD)로 인해 복합 리스크에 직면한 중대형 엔터프라이즈 고객사.
    *   **제시 가치:** "실시간 Zero-Trust 리전 검증과 위변조 불가 감사 원장 기능을 도입하여 SOC 2 Type II 및 DORA/EU AI Act 감사를 100% 자동 통과시키고, 최대 X억 원에 달하는 잠재 벌금 노출(AIL + TRE)을 제로로 방어합니다."
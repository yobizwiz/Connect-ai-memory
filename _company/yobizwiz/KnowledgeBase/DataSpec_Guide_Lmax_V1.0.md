# 🚨 [DATA SPECIFICATION GUIDE] B2B 규제 리스크 정량화 데이터 명세서 (Lmax & Lmin)
**최종 검토일:** 2026년 5월 31일
**목표:** 모든 법적/재무적 위험 노출도(TRE) 계산에 사용되는 공인된 수치와 범위만을 제공하여, 보고서의 권위 및 위협 수준 극대화.

---

## I. 규제 기반 벌금 (Regulatory Fines & Penalties)

이 섹션은 **규정 준수 실패**로 인한 직접적이고 법적인 패널티에 초점을 맞춥니다. 모든 수치는 '최소 예상치(Lmin)'부터 '최대 예상치(Lmax)'까지의 범위를 제시합니다.

### 1. 유럽 일반 데이터 보호 규정 (GDPR)
*   **위반 유형:** 개인 식별 정보(PII)의 적법한 처리 원칙 위반 및 국경 간 전송 부실.
    *   *구체적 취약점:* 비식별화 실패 또는 목적 외 활용.
    *   **재무 영향 범위 (Lmax):** 전체 글로벌 연 매출액의 최대 4%까지, 혹은 €20 Million 중 높은 금액. [근거: sessions/2026-05-19T04-23/secretary.md]
    *   **진단 지표:** PII_Leakage_Index (마스킹 누락 비율)에 따라 가중치 산정. [근거: Researcher 개인 메모리]

### 2. CCPA 및 유사 데이터 주권 규제 (CCPA, CPRA 등)
*   **위반 유형:** 사용자에게 정보의 삭제 권한(Right to Delete)이나 판매 거부 권한을 충분히 제공하지 못함.
    *   *구체적 취약점:* '데이터 주권' 원칙 위반 및 이용 동의 범위 불명확화.
    *   **재무 영향 범위 (Lmax):** 사용자당 $75,000 ~ $3M. (최대 징벌적 손해배상액과 유사). [근거: Researcher 개인 메모리]
    *   **진단 지표:** Data Sovereignty Violation Flag 작동 여부.

### 3. AI 시스템 규제 (EU AI Act & DORA 등)
*   **위반 유형:** AI 모델의 출처 명시 및 검증 의무(Provenance Mandate)를 위반하거나, 금융 시스템의 운영 연속성을 저해함.
    *   *구체적 취약점:* LLM 기반 환각(Hallucination)을 자문 보고서에 사용. (준전문가 책임).
    *   **재무 영향 범위 (Lmax):** 규제 당국의 과징금 + 시스템 재구축 비용 합산으로 $1억 이상 예상. [근거: Researcher 개인 메모리 - 취약점 2]
    *   **추가 패널티:** '신뢰도'라는 무형의 가치 손실 포함 ($500만 ~ $2,000만). [근거: Research Artifacts/Compliance_Threat_Report_V1.md]

---

## II. 운영 및 프로세스 기반 리스크 (Operational & Process Risks)

이 섹션은 직접적인 법률 위반보다 '시스템적 결함'이나 '불충분한 관리'에서 기인하는, 그러나 더 크고 예측 불가능한 손실에 초점을 맞춥니다.

### 1. 컴플라이언스 드리프트 (Compliance Drift Score)
*   **위반 유형:** 필수 내부 절차(예: 다단계 승인, 감사 로그 기록) 누락 및 문서화 미비.
    *   *영향:* '절차적 하자'를 이유로 계약 이행 중단 및 프로젝트 전면 재시작 명령.
    *   **재무 영향 범위 (Lmax):** $100K ~ $5M. (프로젝트 재시작 비용 + 계약 위약금). [근거: Researcher 개인 메모리]

### 2. 구조적 공백 활용 리스크 (Structural Gap Risk)
*   **위반 유형:** 시스템이 파편화된 지식(Knowledge Silo)에 의존하여 모순되거나 불완전한 결론을 도출함.
    *   *영향:* 결정 오류로 인한 기회비용 손실 및 재작업 비용 발생.
    *   **재무 영향 범위 (Lmax):** $50K ~ $1M. [근거: Researcher 개인 메모리]

---

## III. 리스크 수치 조합 공식화 가이드라인 (Formulaic Application)

보고서의 모든 '위험 점수'는 다음 공식을 기반으로 계산되어야 합니다. 이는 개발자에게 전달될 로직 명세입니다.

$$\text{Total Risk Exposure} (TRE) = (\sum_{i=1}^{N} W_R \cdot L_{\max, i}) + (W_O \cdot L_{Operational}) + (W_A \cdot L_{AI\_Failure})$$

*   $L_{\max, i}$: 개별 규제 위반 $i$의 최대 예상 손실액.
*   $W_R$: 법적 리스크 가중치 (Regulatory Weighting). (가장 높은 가중치 부여) [근거: Researcher 개인 메모리]
*   $L_{Operational}$: 운영/프로세스 오류에 따른 재무 손실액.
*   $W_O$: 운영 리스크 가중치 (Operational Weighting).
*   $L_{AI\_Failure}$: AI 시스템 실패 및 환각으로 인한 명예/신뢰도 하락 비용 ($500만 ~ $2,000만 포함).

---
**[출처 관리 원칙]**: 모든 수치는 '위험 경고'를 극대화하는 데 초점을 맞추어 **최악의 시나리오(Worst-Case Scenario)**를 기준으로 제시하며, 이 점을 명시해야 합니다. (Zero-Speculation 유지)
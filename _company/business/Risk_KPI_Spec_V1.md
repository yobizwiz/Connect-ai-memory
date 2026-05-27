# 💰 [현빈] 리스크 엔진 KPI 대시보드 요구사항 명세서 (V1.0)
## 🎯 목적: 기술적 아웃풋을 '판매 가능한 재무 보고서'로 전환한다.

우리가 제공하는 것은 단순한 점수(Score)가 아니라, 고객사가 **현재 놓치고 있는 잠재적인 최대 손실액(Total Risk Exposure)**에 대한 보험입니다. 이 문서는 리스크 엔진의 최종 결과물(Output Report)이 반드시 포함해야 할 핵심 KPI와 그 정의를 명시합니다.

### 1. 필수 보고서 섹션 (Dashboard Layout)
*   **제목:** [고객사 이름] Total Compliance Risk Assessment Report - Q[분기] YYYY
*   **핵심 메시지:** 이 솔루션을 통해 방어할 수 있는 최소 예상 가치(Minimum Expected Loss Avoidance).

### 2. 핵심 KPI 구조 (Core Metrics)
| KPI 명칭 | 측정 목적 및 정의 | 계산 근거 데이터 (Input Data) | 비즈니스 해석/활용 예시 | [가중치 논의] |
| :--- | :--- | :--- | :--- | :--- |
| **① Total Risk Exposure (TRE)** | 연간 사업 규모 대비 법적/운영 리스크 총합. (**핵심 판매 지표**) | (법규 변경 빈도) $\times$ (사고 발생 시 평균 피해액) $\times$ (미준수 프로세스 비중). | "귀사는 현재 최대 X억 원의 잠재적 손실에 노출되어 있습니다." $\rightarrow$ **보험료(Annual Subscription)** 산정 근거. | 최고 가중치 부여. |
| **② Process Integrity Gap (PIG)** | 규제 준수 여부와 내부 워크플로우 간의 불일치 정도. | (필요 프로세스 단계) - (현재 시스템 기록된 승인/추적 단계). | "규정은 5단계 추적이 필요하나, 현재는 수동으로만 관리되어 PIG가 높습니다." $\rightarrow$ **Silver Tier 기능(워크플로우 강제)**의 효용성 증명. | 높은 가중치 부여 (솔루션 핵심 차별점). |
| **③ Audit Readiness Score (ARS)** | 내부 통제 시스템의 감사 대비 준비도 점수 (0~100점). | (데이터 표준화율) $\times$ (접근 권한 로그 기록률) / 규정 준수 요구 수준. | "귀사의 시스템은 현재 75%만 감사 대응이 가능합니다. 나머지 25%를 자동화해야 합니다." $\rightarrow$ **API 통합/전문 컨설팅(Gold Tier)** 유도. | 중간 가중치 부여 (확장성 지표). |

### 3. 액션 CTA (Call To Action)
*   **명시:** "위의 Total Risk Exposure 감소를 위해, [Silver Tier] 워크플로우 감사 추적 모듈 도입이 필수적입니다." (가장 강력한 리드 확보 장치)

---
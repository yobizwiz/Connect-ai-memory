# 📚 컴플라이언스 위험 계수 업데이트 (v2.0) - Provenance Level: High

## 🎯 목표
$L_{max}$ 계산 엔진의 신뢰도를 높이기 위해, 운영 프로세스적 공백($C_{OP}$)을 정량적으로 측정하는 새로운 변수 및 가중치 구조를 정의합니다.

## 🛠️ 1. 핵심 리스크 지표 업데이트 (The Gap)
- **지표명:** Compliance Drift Score (CDS)
    - **정의:** 필수적인 운영 절차(예: 다단계 승인, 데이터 검증 단계)가 법적/산업 표준으로부터 얼마나 벗어났는지를 점수화.
    - **산출 원천:** 내부 프로세스 감사 기록, 규제 변화 추이 분석.
    - **재무 영향:** $C_{OP}$ 계산의 핵심 요소로 사용되며, '절차적 하자'에 대한 재정적 가중치를 부여함.

## 📐 2. Lmax 공식 적용 (Actionable Formula)
기존: $\text{Risk Exposure}(S) = \left[ (\alpha \cdot C_F) + (\beta \cdot C_{OP}) \right] \times (1 + W_{\text{System}})$
변경: $\text{Risk Exposure}(S) = \left[ (\alpha \cdot C_F) + (\mathbf{\beta} \cdot \mathbf{CDS}) \right] \times (1 + W_{\text{System}} \cdot \mathbf{InteroperabilityFactor})$

## 📚 3. 계수 가이드라인
- **$\beta$ 재정의:** $\beta = f(\text{Regulatory Urgency})$. 규제 변화가 빠르고 엄격할수록 $\beta$를 상향 조정해야 함.
- **Provenance 의무화:** 모든 $L_{max}$ 계산에 사용되는 변수는 반드시 위에서 제시된 3가지 핵심 리스크 지표(CDS, Interoperability Factor, Jurisdiction Overlap) 중 하나 이상을 근거로 해야 하며, 그 출처를 명시한다.

[근거: Researcher 개인 메모리 - DORA 및 EU AI Act의 구조적 위험성 증폭 경향 반영.]
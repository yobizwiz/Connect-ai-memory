# 📈 [V3.0] 리스크 점수 계산 로직 명세서: $L_{totalMax}$ 정의 (For Developer & Designer)

## 📋 I. 비즈니스 목표 및 논리적 근거
*   **목표:** 고객에게 '위험 요소'를 공포(Fear)와 절박함(Urgency)으로 전환하여, 최소 Yellow/Red 리스크 단계에 도달하도록 강제한다.
*   **핵심 로직:** $L_{totalMax}$ 계산 공식 사용 (섹션 II 참고).

## 💻 II. API 스펙 정의 (Backend Logic Requirement)
1.  **Input Schema:** $\sum L_r$ 데이터셋을 기반으로 다음 세 가지 항목의 점수 및 수치를 받아야 합니다.
    *   `regulatory_loss_score`: ($\sum L_r$) - 규제 직접 손실액 합계 (JSON 스키마 참조).
    *   `operational_gap_score`: ($L_{op}$) - 내부 프로세스 취약성 점수 (0-100점 또는 $M$ 단위로 변환되어야 함).
    *   `future_risk_score`: ($L_{future}$) - 예측 기반 미래 리스크 점수.
2.  **Calculation Formula:** `L_totalMax = regulatory_loss_score + (operational_gap_score * 1.5) + (future_risk_score * 2.0)`

## 🖼️ III. UI/UX 디자인 브리프 (Designer Instruction)
*   **명세서 이름:** "Total Risk Exposure Dashboard"
*   **핵심 요소:** 계산된 $L_{totalMax}$ 값을 가장 크게, 중앙에 배치해야 합니다.
*   **시각적 요구사항:**
    1.  **위험 단계 표시기 (The Gauge):** 🟢/🟡/🔴의 세 가지 색상 변화를 즉각적으로 보여주는 게이지 또는 대형 Indicator가 필수입니다. 이 표시는 $L_{totalMax}$에 비례하여 실시간으로 변해야 합니다.
    2.  **변수별 기여도 그래프:** 최종 점수가 어느 요소(규제, 운영, 미래) 때문에 높게 나왔는지 파이 차트나 누적 바 차트로 분해하여 보여주어야 사용자가 '무엇을 고쳐야 할지'를 명확히 인지하게 합니다.
    3.  **액션 유도:** 점수와 위험 단계가 표시된 직후, 해당 리스크 레벨에 맞는 **CTA(Call-to-Action)** 버튼이 크고 눈에 띄게 배치되어야 합니다. (예: Yellow → "Silver Tier 워크플로우 감사 시작하기").
# 🚨 Gatekeeping Section Final UX/UI Specification v3.0 (Designer Lead)

## 🎯 Goal & Principle
This section must not just inform; it must **induce systemic anxiety** and force the user into a state of perceived necessity. The core principle is: *Time + Inaction = Critical Failure*.

## ⚙️ Component Specs

### 1. QLoss Gauge (Risk Meter)
*   **Visual:** A radial gauge or linear bar that fills/changes color dynamically.
*   **Function:** Represents the quantifiable potential loss ($\text{QLoss}$).
*   **Color Logic:** Green (Low Risk) $\rightarrow$ Yellow (Warning) $\rightarrow$ Orange (Critical Warning) $\rightarrow$ **Dark Crimson Red Zone (#C0392B)** (Imminent Failure).

### 2. Time Clock & Trigger Points
*   **Mechanism:** Countdown Timer (Initial time set: e.g., 30 minutes).
*   **Trigger A (Time Passage):** Linear decay of the timer causes a proportional $\text{QLoss}$ increase rate ($\text{Rate}_{\text{time}}$). This rate accelerates exponentially as $T \to 0$.
    $$ \text{QLoss}(t) = 10\% + (\text{Initial} - \frac{\text{Time Elapsed}}{30}) \times k $$
*   **Trigger B (Action Failure):** User inactivity in the 'Input Field' or leaving a key section triggers an immediate, disproportionate $\text{QLoss}$ spike ($\Delta\text{QLoss}$). This forces the user to engage.

### 3. CTA Block: The Final Ultimatum
*   **Primary Action:** Setup Consulting (High Friction, High Value).
*   **Animation Rule:** On hover or imminent click, initiate a forced **System Failure Sequence**:
    1.  Global Flash: Brief, intense red flash ($\text{Opacity } 0 \to 1 \to 0$).
    2.  Glitch Overlay: Text and background elements momentarily break apart with chromatic aberration effect.
    3.  Message Pop-up: "SYSTEM INTEGRITY COMPROMISED. IMMEDIATE INTERVENTION REQUIRED." (Monospace Font, Red Zone).

**[Source Reference]:** Designer Memory & Self-RAG (Red Zone, QLoss visualization)
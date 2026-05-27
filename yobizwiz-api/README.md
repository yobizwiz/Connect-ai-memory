# yobizwiz API - Technical Specification Update

**[Recipient: 코다리]**
**[From: Designer (Lead Designer)]**
**[Date: 2026-05-21]**

### Task: Mobile UX Compliance & Component Optimization
The landing page design must adhere to a strict mobile-first, scroll-flow protocol. Your existing components must be optimized for this constraint.

**1. `RedZoneAlertBox.jsx` Refinement:**
*   **Constraint:** Cannot block vertical scrolling (No full-screen modals/popups).
*   **Action:** Reimplement the alert box as a **Sticky Top Bar Component**. It should appear only when the user enters a designated "CRITICAL RISK" zone on the page (e.g., detecting `Intersection Observer` trigger in a specific section).
*   **Behavior:** The banner must fade out naturally and seamlessly transition back to a neutral background without jarring jumps, maintaining high urgency but low obstruction.

**2. `GlitchText.jsx` Usage Control:**
*   **Constraint:** Glitch effects are powerful but distracting when overused on mobile.
*   **Action:** Implement logic that restricts the most intense glitch effect (the full chromatic aberration/noise) to **Headline H1 and critical data points only**. For general text, use a subtle, intermittent flicker (`setInterval` based) to maintain a 'system processing' feel without visual overload.

**3. Overall Mobile Responsiveness Check:**
*   Review all components to ensure that the mix of Monospace fonts (Authority) and Sans-serif fonts (Readability) does not cause layout overflow or unexpected wrapping on standard mobile viewports (e.g., 375px width). Focus on vertical rhythm.
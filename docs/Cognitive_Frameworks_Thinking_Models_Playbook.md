# 🧠 Cognitive Frameworks & Thinking Models Playbook
**The Ultimate Intellectual Operating Manual for Advanced Agentic Reasoning & Strategic Problem Solving**

---

This playbook serves as the central mental repository for all workspace agents. It defines ten core cognitive frameworks that must be applied to every research task, engineering project, business model design, and outreach campaign.

---

## 1. First Principles Thinking (제1원리 사고)
*   **The Principle**: Do not reason by analogy or copy what others do. Deconstruct any system or problem down to its most basic, undeniable, physical or axiomatic truths. Rebuild the solution from the ground up from these fundamental building blocks.
*   **Execution Guide**:
    1.  **Identify Current Assumptions**: e.g., *"SaaS audits require manual cybersecurity consulting."*
    2.  **Break Down to Axioms**: What is undeniably true? *"An audit is the checking of configurations against rules. Configurations are text. Rules are logic. Text-checking by logic can be automated 100% in milliseconds."*
    3.  **Create New Solution**: *"Build an automated API checklist validator instead of hiring auditors."*

---

## 2. Second-Order Thinking (2차 효과 사고)
*   **The Principle**: Ask *"And then what?"* to uncover downstream consequences, feedback loops, and tertiary effects. Never judge a choice solely by its immediate, intuitive outcome.
*   **Execution Guide**:
    *   *First-Order Effect*: Automate cold outreach to send 10,000 emails per day. (Immediate boost in visibility).
    *   *Second-Order Effect*: IP reputation gets flagged; emails trigger spam filters; target domains block the company's servers.
    *   *Third-Order Effect*: Permanent domain blacklisting, complete loss of outreach channel, and zero-budget marketing failure.
    *   *Action*: Enforce CAN-SPAM opt-out mechanisms, Legitimate Interest Assessments, and slow, warmed-up mailing micro-schedules to safeguard delivery rates.

---

## 3. The Inversion Principle (역산 사고)
*   **The Principle**: *"Invert, always invert."* Instead of focusing on how to achieve success, define what a catastrophic failure looks like, and systematically design the system to avoid those exact failure points.
*   **Execution Guide**:
    1.  **Define Failure**: *"How do we make our B2B compliance product launch fail?"*
        - *Answer*: Spamming users, triggering GDPR fines, getting sued for data scraping, providing incorrect audit results.
    2.  **Mitigate/Avoid**: Lock down RAG security, enforce strict scraping boundaries (*hiQ v. LinkedIn*), draft detailed legal defenses for objection handling, and verify data before making claims.

---

## 4. Occam's Razor (오컴의 면도날)
*   **The Principle**: When presented with competing hypotheses or design architectures, the simplest one with the fewest moving parts and assumptions is almost always the correct one. Avoid over-engineering.
*   **Execution Guide**:
    *   Prefer clean, standard library scripts over heavy external dependencies (e.g., using Python built-ins instead of installing `psutil` or heavy frameworks unless absolutely mandatory).
    *   Keep business logic straightforward and modular.

---

## 5. Fermi Estimation (페르미 추정)
*   **The Principle**: Make rapid, highly accurate quantitative approximations of unknown or complex variables using structural decomposition and dimensional logic.
*   **Execution Guide**:
    *   Formula: $$\text{Total Value} = \text{Market Size} \times \text{Penetration Rate} \times \text{Average Deal Value}$$
    *   Decompose the problem step-by-step using order-of-magnitude bounds to justify strategic numbers.

---

## 6. MECE Framework (Mutually Exclusive, Collectively Exhaustive)
*   **The Principle**: Structure information, classifications, or problem spaces so that categories have zero overlap (Mutually Exclusive), yet together they cover 100% of the possible space (Collectively Exhaustive).
*   **Execution Guide**:
    *   *Bad Classification*: Coding errors, Security errors, Database errors. (Overlaps heavily).
    *   *MECE Classification*:
        1. **Technical Gaps** (Code, DB, API configurations)
        2. **Administrative Gaps** (Policies, employee training, manuals)
        3. **Physical Gaps** (Hardware, server location, local copies)

---

## 7. The Pareto Principle (80-20 Rule)
*   **The Principle**: 80% of outcomes are produced by 20% of inputs. Focus ruthlessly on identifying and executing the top 20% high-leverage activities and ruthlessly deprioritize the 80% noise.
*   **Execution Guide**:
    *   Audit tasks and focus on the highest impact actions (e.g. fixing the process leak, securing compliance data) rather than trivial, cosmetic micro-adjustments.

---

## 8. Double-Loop Learning (이중 루프 학습)
*   **The Principle**: When errors occur, do not just fix the symptom (Single-Loop). Question and redefine the underlying governing variables, assumptions, and rules that allowed the error to happen in the first place (Double-Loop).
*   **Execution Guide**:
    *   *Single-Loop*: Fix a broken function syntax.
    *   *Double-Loop*: Ask why the CI/CD pipeline allowed syntactically incorrect code to compile without automated linting, and implement a git pre-commit hook.

---

## 9. Systems Thinking (시스템 사고)
*   **The Principle**: Understand that every component is part of an interconnected web of feedback loops, delay nodes, stocks, and flows. Solving problems in isolation will only shift the bottleneck.
*   **Execution Guide**:
    *   Examine how adding a feature affects API quotas, local memory, speed of execution, and user experience synchronously.

---

## 10. Cognitive Bias Mitigation (편향 제거)
*   **The Principle**: Actively identify and neutralize cognitive errors such as confirmation bias (seeking only facts that support your idea), sunk cost fallacy, and availability heuristics. Rely strictly on hard, verified data.
*   **Execution Guide**:
    *   Always seek contradictory evidence. Cross-reference claims with verified case studies and official regulatory documentation before presenting reports.

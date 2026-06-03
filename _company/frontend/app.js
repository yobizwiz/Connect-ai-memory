/**
 * Yobizwiz — Compliance Assessment App Logic
 * 
 * 모든 계산은 브라우저에서 수행됩니다 (백엔드 불필요).
 * core/checklist.py, core/engine.py, core/data/ 의 로직을 JS로 포팅.
 */

// ============================================================
// DATA: 체크리스트 문항 (core/checklist.py에서 포팅)
// ============================================================

const QUESTIONS = [
    { id:"DP-01", cat:"Data Protection & Privacy", severity:"Critical", weight:5, q:"Do you maintain a documented inventory of all personal data you collect, process, and store?", regs:["GDPR Art.30","CCPA §1798.100","HIPAA §164.310"], summary:"Create a data mapping document listing all personal data flows.", fixDays:21, fixCost:5000, detail:`<h3>Data Inventory & Mapping Guide</h3><p><strong>Step 1: Identify Data Sources (Week 1)</strong></p><ul><li>List every system that collects personal data (CRM, email, analytics, payment, HR)</li><li>Document: what data, why collected, where stored, who has access, retention period</li></ul><p><strong>Step 2: Create Data Flow Diagram (Week 2)</strong></p><ul><li>Map data from collection → processing → storage → deletion</li><li>Identify all third parties who receive data</li><li>Tools: OneTrust DataDiscovery, BigID, or a simple spreadsheet template</li></ul><p><strong>Step 3: Classify Data by Sensitivity (Week 3)</strong></p><ul><li>PII (name, email, phone) → Standard protection</li><li>Sensitive PII (SSN, financial, health) → Enhanced protection</li></ul><p><strong>Estimated Cost:</strong> $2,000-$15,000 &bull; <strong>Time:</strong> 3-4 weeks</p>` },
    { id:"DP-02", cat:"Data Protection & Privacy", severity:"High", weight:4, q:"Do you have a written privacy policy that is publicly accessible and updated within the last 12 months?", regs:["GDPR Art.13-14","CCPA §1798.100(b)","FTC Act §5"], summary:"Draft or update your privacy policy to include all required disclosures.", fixDays:10, fixCost:1500, detail:`<h3>Privacy Policy Update Guide</h3><p><strong>Required Elements (US Market):</strong></p><ol><li>What data you collect — be specific</li><li>How you use it — each purpose listed</li><li>Who you share it with — categories of third parties</li><li>Consumer rights — opt-out, deletion, access</li><li>Contact information — dedicated privacy contact</li></ol><p><strong>CCPA-Specific:</strong> "Do Not Sell My Personal Information" link on homepage</p><p><strong>Tools:</strong> Termly, Iubenda, or OneTrust for automated policy generation</p><p><strong>Estimated Cost:</strong> $500-$3,000 &bull; <strong>Time:</strong> 1-2 weeks</p>` },
    { id:"DP-03", cat:"Data Protection & Privacy", severity:"High", weight:4, q:"Can you fulfill a consumer data deletion request within 30 days?", regs:["GDPR Art.17","CCPA §1798.105","CPRA"], summary:"Implement a data subject request (DSR) process with a 30-day SLA.", fixDays:15, fixCost:3000, detail:`<h3>DSR Process Guide</h3><p><strong>Build a workflow:</strong></p><ol><li><strong>Intake:</strong> Web form or privacy@ email</li><li><strong>Verify:</strong> Confirm requester identity</li><li><strong>Search:</strong> Find all data across systems</li><li><strong>Execute:</strong> Delete from primary + backups</li><li><strong>Confirm:</strong> Notify within 30 days</li></ol><p><strong>Pitfalls:</strong> Forgetting backups, logs, and third-party systems</p><p><strong>Estimated Cost:</strong> $1,000-$5,000 &bull; <strong>Time:</strong> 2-3 weeks</p>` },
    { id:"AC-01", cat:"Access Controls", severity:"Critical", weight:5, q:"Do you enforce multi-factor authentication (MFA) for all employees accessing sensitive data?", regs:["HIPAA §164.312(d)","PCI-DSS 8.3","NIST 800-63B"], summary:"Enable MFA on all systems handling sensitive data, starting with admin accounts.", fixDays:14, fixCost:2000, detail:`<h3>MFA Implementation Guide</h3><p><strong>Priority Order:</strong></p><ol><li><strong>Day 1:</strong> Admin/root accounts, cloud consoles</li><li><strong>Week 1:</strong> Email, VPN, remote access</li><li><strong>Week 2:</strong> Internal apps with customer data</li><li><strong>Week 3:</strong> All remaining accounts</li></ol><p><strong>Solutions:</strong></p><ul><li>Google/Microsoft 365 → Built-in MFA (free)</li><li>Okta, Duo Security → $3-6/user/month</li><li>Hardware keys (YubiKey) → $50/key for high-risk roles</li></ul><p><strong>Note:</strong> SMS-based 2FA is NOT considered secure. Use app-based TOTP.</p><p><strong>Estimated Cost:</strong> $0-$5,000/year &bull; <strong>Time:</strong> 1-3 weeks</p>` },
    { id:"AC-02", cat:"Access Controls", severity:"High", weight:4, q:"Do you follow the principle of least privilege — employees only access data necessary for their role?", regs:["HIPAA §164.312(a)(1)","NIST 800-53 AC-6","SOC 2 CC6.1"], summary:"Review and restrict access permissions using role-based access control (RBAC).", fixDays:21, fixCost:4000, detail:`<h3>Least Privilege & RBAC Guide</h3><p><strong>Step 1:</strong> Export all user permissions, identify over-provisioned accounts</p><p><strong>Step 2:</strong> Define role templates per department with minimum permissions</p><p><strong>Step 3:</strong> Remove excess permissions, set up automated provisioning/deprovisioning</p><p><strong>Estimated Cost:</strong> $2,000-$8,000 &bull; <strong>Time:</strong> 3-4 weeks</p>` },
    { id:"IR-01", cat:"Incident Response", severity:"Critical", weight:5, q:"Do you have a documented incident response plan that has been tested in the last 12 months?", regs:["HIPAA §164.308(a)(6)","GDPR Art.33-34","SEC Cyber Rules"], summary:"Create and test an incident response plan covering detection, containment, notification, and recovery.", fixDays:21, fixCost:5000, detail:`<h3>Incident Response Plan</h3><p><strong>Required Components:</strong></p><ol><li>Roles & contacts (IR lead, legal, PR, CEO)</li><li>Detection methods</li><li>Severity classification (P1-P4)</li><li>Containment steps</li><li>Notification timelines: GDPR 72hrs, HIPAA 60 days, SEC 4 business days</li><li>Recovery & post-incident review</li></ol><p><strong>Test annually</strong> with tabletop exercises</p><p><strong>Estimated Cost:</strong> $3,000-$10,000 &bull; <strong>Time:</strong> 2-4 weeks</p>` },
    { id:"IR-02", cat:"Incident Response", severity:"High", weight:4, q:"Can you detect a data breach within 72 hours of occurrence?", regs:["GDPR Art.33","HIPAA §164.308(a)(1)(ii)(D)"], summary:"Implement security monitoring and alerting (SIEM or equivalent) for critical systems.", fixDays:30, fixCost:15000, detail:`<h3>Breach Detection Guide</h3><p><strong>Small companies (&lt;50):</strong> Cloud alerts (GuardDuty, Azure Defender) — $100-500/mo</p><p><strong>Mid-size (50-500):</strong> SIEM + EDR (Splunk, CrowdStrike) — $2K-10K/mo</p><p><strong>Key Metric:</strong> Industry avg detection time is 194 days (IBM 2024). Target: &lt;72 hours.</p><p><strong>Estimated Cost:</strong> $1,200-$120,000/year &bull; <strong>Time:</strong> 2-6 weeks</p>` },
    { id:"ET-01", cat:"Employee Training", severity:"High", weight:4, q:"Do all employees complete security awareness training at least once per year?", regs:["HIPAA §164.308(a)(5)","PCI-DSS 12.6","FTC Safeguards Rule"], summary:"Implement annual security training with phishing simulations.", fixDays:7, fixCost:2000, detail:`<h3>Security Training Program</h3><p><strong>Topics:</strong> Phishing, password hygiene, data handling, incident reporting</p><p><strong>Platforms:</strong> KnowBe4 ($10-25/user/yr), Proofpoint ($8-20/user/yr)</p><p><strong>Best Practice:</strong> Annual training + quarterly micro-training + monthly phishing simulations</p><p><strong>Estimated Cost:</strong> $500-$5,000/year &bull; <strong>Time:</strong> 1 week setup</p>` },
    { id:"ET-02", cat:"Employee Training", severity:"Medium", weight:3, q:"Do you have a clear, written acceptable use policy that employees sign upon hiring?", regs:["FTC Safeguards Rule","SOC 2 CC1.4"], summary:"Create an acceptable use policy covering devices, data handling, and approved software.", fixDays:5, fixCost:800, detail:`<h3>Acceptable Use Policy</h3><p><strong>Key Sections:</strong> Scope, device usage, BYOD rules, approved software, data handling, social media, consequences</p><p>Include in onboarding, require annual re-acknowledgment.</p><p><strong>Estimated Cost:</strong> $500-$1,500 &bull; <strong>Time:</strong> 1 week</p>` },
    { id:"DM-01", cat:"Data Minimization", severity:"High", weight:4, q:"Do you have a data retention policy that automatically deletes data after its purpose is fulfilled?", regs:["GDPR Art.5(1)(e)","CCPA §1798.100","HIPAA §164.530(j)"], summary:"Define retention periods for each data type and implement automated deletion.", fixDays:15, fixCost:3000, detail:`<h3>Data Retention Policy</h3><table><tr><th>Data Type</th><th>Retention</th><th>Regulation</th></tr><tr><td>Customer transactions</td><td>7 years</td><td>IRS/Tax</td></tr><tr><td>Employee records</td><td>3 yrs post-employment</td><td>EEOC</td></tr><tr><td>Health records</td><td>6 years</td><td>HIPAA</td></tr><tr><td>App logs</td><td>90 days</td><td>Best practice</td></tr></table><p><strong>Automation:</strong> Database TTL, cloud lifecycle policies, regular purge jobs</p><p><strong>Estimated Cost:</strong> $1,000-$5,000 &bull; <strong>Time:</strong> 2-3 weeks</p>` },
    { id:"DM-02", cat:"Data Minimization", severity:"Medium", weight:3, q:"Do you collect only the minimum personal data necessary for each business purpose?", regs:["GDPR Art.5(1)(c)","CCPA","FTC Act §5"], summary:"Audit data collection forms and remove unnecessary fields.", fixDays:10, fixCost:1000, detail:`<h3>Data Minimization Audit</h3><p>Review every form and collection point. For each field, ask: "Do we NEED this?"</p><p><strong>Common over-collection:</strong> DOB when not needed, physical address for digital services, SSN for non-financial</p><p><strong>Estimated Cost:</strong> $500-$2,000 &bull; <strong>Time:</strong> 1-2 weeks</p>` },
    { id:"TP-01", cat:"Third-Party Risk", severity:"Critical", weight:5, q:"Do you have Data Processing Agreements (DPAs) with all vendors who handle your customers' personal data?", regs:["GDPR Art.28","CCPA §1798.140(w)","HIPAA BAA"], summary:"Identify all vendors processing personal data and execute DPAs/BAAs.", fixDays:30, fixCost:5000, detail:`<h3>Vendor DPA/BAA Guide</h3><p><strong>Step 1:</strong> List every vendor: cloud, analytics, marketing, payment, HR, support</p><p><strong>Step 2:</strong> Each DPA must include: purpose, security obligations, breach notification, deletion, audit rights</p><p><strong>Step 3:</strong> Most major vendors have standard DPAs — request theirs. Healthcare: must be BAA.</p><p><strong>Estimated Cost:</strong> $2,000-$10,000 &bull; <strong>Time:</strong> 3-6 weeks</p>` },
    { id:"TP-02", cat:"Third-Party Risk", severity:"Medium", weight:3, q:"Do you conduct security assessments of critical vendors before onboarding and annually thereafter?", regs:["SOC 2 CC9.2","NIST 800-53 SA-9"], summary:"Create a vendor risk assessment questionnaire and review process.", fixDays:14, fixCost:2000, detail:`<h3>Vendor Risk Assessment</h3><p><strong>Key Questions:</strong> SOC 2 cert? Data location? Breach notification? Encryption? Cyber insurance?</p><p><strong>Risk Tiers:</strong> Critical (full assessment), High (SOC 2 review), Low (questionnaire)</p><p><strong>Estimated Cost:</strong> $1,000-$3,000 &bull; <strong>Time:</strong> 2-3 weeks</p>` },
    { id:"EN-01", cat:"Encryption & Security", severity:"Critical", weight:5, q:"Is all sensitive personal data encrypted both at rest (stored) and in transit (transmitted)?", regs:["HIPAA §164.312(a)(2)(iv)","PCI-DSS 3.4/4.1","GDPR Art.32"], summary:"Enable encryption for all databases, file storage, and data transmissions (TLS 1.2+).", fixDays:14, fixCost:2000, detail:`<h3>Encryption Guide</h3><p><strong>At Rest:</strong> Database TDE, S3/GCS encryption, BitLocker/FileVault on laptops</p><p><strong>In Transit:</strong> TLS 1.2+ on all endpoints, HTTPS only, VPN for internal</p><p><strong>Key Management:</strong> Use cloud KMS — never hardcode keys in source code</p><p><strong>Estimated Cost:</strong> $0-$5,000 &bull; <strong>Time:</strong> 1-3 weeks</p>` },
    { id:"EN-02", cat:"Encryption & Security", severity:"High", weight:3, q:"Do you use strong, unique passwords and prohibit password sharing across the organization?", regs:["NIST 800-63B","PCI-DSS 8.2"], summary:"Deploy a password manager and enforce minimum password requirements.", fixDays:5, fixCost:1500, detail:`<h3>Password Policy (NIST 800-63B)</h3><p>Min 12 characters (length > complexity). No mandatory rotation unless breach. Screen against breached lists. Require MFA.</p><p><strong>Tools:</strong> 1Password, Bitwarden, LastPass for Teams</p><p><strong>Estimated Cost:</strong> $500-$3,000/year &bull; <strong>Time:</strong> 1 week</p>` },
    { id:"AU-01", cat:"Audit & Monitoring", severity:"High", weight:4, q:"Do you maintain audit logs of who accessed sensitive data, and are they retained for at least 1 year?", regs:["HIPAA §164.312(b)","SOC 2 CC7.2","PCI-DSS 10.1"], summary:"Enable access logging on all systems with sensitive data and set 1-year retention.", fixDays:10, fixCost:2000, detail:`<h3>Audit Logging Guide</h3><p><strong>What to log:</strong> Auth events, data access, config changes, privilege escalations, deletions</p><p><strong>Where:</strong> CloudTrail, GCP Audit Logs, Azure Activity Log, database query logs</p><p><strong>Retention:</strong> Min 1 year (HIPAA, SOC 2), PCI-DSS: 1 year / 3 months accessible</p><p><strong>Estimated Cost:</strong> $500-$5,000/year &bull; <strong>Time:</strong> 1-2 weeks</p>` },
    { id:"AU-02", cat:"Audit & Monitoring", severity:"Critical", weight:5, q:"Have you conducted a formal risk assessment within the last 12 months?", regs:["HIPAA §164.308(a)(1)","NIST 800-53 RA-3","FTC Safeguards Rule"], summary:"Conduct a formal risk assessment identifying threats, vulnerabilities, and mitigation plans.", fixDays:42, fixCost:15000, detail:`<h3>Risk Assessment Guide (NIST CSF)</h3><ol><li><strong>Identify:</strong> Assets, data flows, systems</li><li><strong>Protect:</strong> Evaluate safeguards</li><li><strong>Detect:</strong> Monitoring capabilities</li><li><strong>Respond:</strong> IR readiness</li><li><strong>Recover:</strong> Backup & recovery</li></ol><p><strong>Options:</strong> DIY with NIST template (free), Vanta/Drata ($5K-50K/yr), Consultant ($10K-50K)</p><p><strong>Estimated Cost:</strong> $5,000-$50,000 &bull; <strong>Time:</strong> 4-8 weeks</p>` },
    { id:"CM-01", cat:"Consent Management", severity:"High", weight:4, q:"Do you obtain explicit, documented consent before collecting personal data for each specific purpose?", regs:["GDPR Art.6-7","CCPA §1798.120","TCPA"], summary:"Implement granular consent collection with purpose-specific opt-ins.", fixDays:15, fixCost:3000, detail:`<h3>Consent Management Guide</h3><p>Separate consent per purpose. Pre-checked boxes are NOT valid. Must be easy to withdraw.</p><p><strong>Tools:</strong> OneTrust, Cookiebot, Osano. <strong>CCPA:</strong> "Do Not Sell" link required. Honor GPC browser signals.</p><p><strong>Estimated Cost:</strong> $1,000-$10,000/year &bull; <strong>Time:</strong> 2-3 weeks</p>` },
    { id:"CM-02", cat:"Consent Management", severity:"Critical", weight:5, q:"If you process children's data (under 13), do you have COPPA-compliant parental consent mechanisms?", regs:["COPPA 16 CFR §312","FTC Act §5"], summary:"If applicable: implement age-gating and verifiable parental consent. If not: document that your service is not directed at children.", fixDays:21, fixCost:5000, detail:`<h3>COPPA Compliance</h3><p><strong>If reaching children:</strong> Age gate, parental consent (signed form/credit card/video call), allow parent review/delete</p><p><strong>If NOT directed at children:</strong> Document in privacy policy, add age verification to signup</p><p><strong>Warning:</strong> Epic Games paid $275M for COPPA violations (FTC 2022)</p><p><strong>Estimated Cost:</strong> $2,000-$15,000 &bull; <strong>Time:</strong> 3-4 weeks</p>` },
    { id:"BC-01", cat:"Business Continuity", severity:"High", weight:4, q:"Do you have automated backups with a tested disaster recovery plan?", regs:["HIPAA §164.308(a)(7)","SOC 2 A1.2","NIST 800-53 CP-9"], summary:"Implement automated daily backups with offsite storage and test recovery quarterly.", fixDays:21, fixCost:5000, detail:`<h3>Backup & DR Guide</h3><p><strong>3-2-1 Rule:</strong> 3 copies, 2 media types, 1 offsite</p><p>Database snapshots, cross-region replication, IaC for config. Test quarterly.</p><p><strong>Targets:</strong> RPO &lt;24hrs, RTO &lt;4hrs for critical systems</p><p><strong>Estimated Cost:</strong> $500-$5,000/month &bull; <strong>Time:</strong> 2-4 weeks</p>` },
];

// ============================================================
// DATA: Similar cases (core/data/regulatory_fines.py top cases)
// ============================================================

const ENFORCEMENT_CASES = [
    { company:"Equifax", year:2019, industry:"Financial", reg:"FTC", fine:575000000, empRange:"500+", desc:"147M consumers' SSN exposed. Failed to patch known vulnerability." },
    { company:"T-Mobile", year:2022, industry:"Technology", reg:"FTC", fine:350000000, empRange:"500+", desc:"76.6M customers' data breached. Inadequate cybersecurity." },
    { company:"Epic Games", year:2022, industry:"Technology", reg:"FTC", fine:520000000, empRange:"500+", desc:"$275M COPPA + $245M dark patterns. Children's data without consent." },
    { company:"Capital One", year:2021, industry:"Financial", reg:"FTC/OCC", fine:190000000, empRange:"500+", desc:"100M records via misconfigured AWS WAF." },
    { company:"Uber", year:2018, industry:"Technology", reg:"FTC", fine:148000000, empRange:"500+", desc:"57M records concealed for over a year. Paid hackers to hide it." },
    { company:"Home Depot", year:2020, industry:"Retail", reg:"FTC", fine:200000000, empRange:"500+", desc:"56M credit cards stolen via POS malware." },
    { company:"Meta (Cambridge)", year:2022, industry:"Technology", reg:"State AG", fine:725000000, empRange:"500+", desc:"87M users' data shared for political profiling." },
    { company:"Google (Location)", year:2022, industry:"Technology", reg:"State AG", fine:391500000, empRange:"500+", desc:"Misled users about location tracking across 40 states." },
    { company:"Marriott", year:2020, industry:"Hospitality", reg:"FTC", fine:52000000, empRange:"500+", desc:"339M guests' data breached for 4 years undetected." },
    { company:"Anthem Inc.", year:2020, industry:"Healthcare", reg:"HIPAA", fine:16000000, empRange:"500+", desc:"78.8M patient records. Largest healthcare breach ever." },
    { company:"BetterHelp", year:2023, industry:"Healthcare", reg:"FTC", fine:7800000, empRange:"51-500", desc:"Shared mental health data with Facebook and Snapchat." },
    { company:"Sephora", year:2022, industry:"Retail", reg:"CCPA", fine:1200000, empRange:"500+", desc:"First major CCPA enforcement. Failed to honor opt-out." },
    { company:"GoodRx", year:2023, industry:"Healthcare", reg:"FTC", fine:1500000, empRange:"51-500", desc:"First Health Breach Notification Rule enforcement." },
    { company:"CafePress", year:2022, industry:"Retail", reg:"FTC", fine:500000, empRange:"51-500", desc:"Covered up breach. SSNs in plain text, SHA-1 encryption." },
    { company:"Clearview AI", year:2022, industry:"Technology", reg:"GDPR", fine:21600000, empRange:"1-50", desc:"Small startup fined for scraping billions of facial images." },
    { company:"Premom App", year:2023, industry:"Healthcare", reg:"FTC", fine:100000, empRange:"1-50", desc:"Fertility app shared health data with Chinese analytics." },
    { company:"Morgan Stanley", year:2022, industry:"Financial", reg:"OCC/SEC", fine:155000000, empRange:"500+", desc:"Customer data on decommissioned servers sold at auction." },
];

// IBM Breach Costs
const BREACH_COSTS = {
    Healthcare: { total: 9770000, perRecord: 408, detectDays: 231 },
    Financial: { total: 6080000, perRecord: 181, detectDays: 177 },
    Technology: { total: 5450000, perRecord: 175, detectDays: 185 },
    Manufacturing: { total: 5560000, perRecord: 172, detectDays: 199 },
    Retail: { total: 3480000, perRecord: 152, detectDays: 189 },
    Education: { total: 3650000, perRecord: 154, detectDays: 207 },
    Hospitality: { total: 3360000, perRecord: 148, detectDays: 200 },
    Other: { total: 4880000, perRecord: 165, detectDays: 194 },
};


// ============================================================
// STATE
// ============================================================

const state = {
    answers: {},
    companyInfo: {},
};


// ============================================================
// DOM READY
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    buildQuestions();
    setupCompanyForm();
    setupSubmit();
});


// ============================================================
// STEP 1: Company Info
// ============================================================

function setupCompanyForm() {
    const fields = ['industry', 'employees', 'data-size'];
    const btn = document.getElementById('btn-to-checklist');

    function checkReady() {
        const ready = fields.every(id => {
            const el = document.getElementById(id);
            return el && el.value && el.value.trim() !== '';
        });
        btn.disabled = !ready;
    }

    fields.forEach(id => {
        document.getElementById(id).addEventListener('input', checkReady);
        document.getElementById(id).addEventListener('change', checkReady);
    });

    btn.addEventListener('click', () => {
        state.companyInfo = {
            industry: document.getElementById('industry').value,
            employees: parseInt(document.getElementById('employees').value) || 1,
            dataSize: parseFloat(document.getElementById('data-size').value) || 1,
            revenue: parseFloat(document.getElementById('revenue').value) || 0,
            piiCount: parseInt(document.getElementById('pii-count').value) || 0,
        };

        document.getElementById('step-company').classList.remove('active');
        document.getElementById('step-checklist').classList.add('active');
        document.getElementById('step-checklist').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}


// ============================================================
// STEP 2: Build Questions
// ============================================================

function buildQuestions() {
    const container = document.getElementById('questions-container');
    let currentCat = '';

    QUESTIONS.forEach(q => {
        if (q.cat !== currentCat) {
            currentCat = q.cat;
            const catDiv = document.createElement('div');
            catDiv.className = 'question-category';
            catDiv.innerHTML = `<div class="category-title">${currentCat}</div>`;
            container.appendChild(catDiv);
        }

        const catContainer = container.lastElementChild;
        const item = document.createElement('div');
        item.className = 'question-item';
        item.id = `q-${q.id}`;
        item.innerHTML = `
            <div>
                <div class="question-text">${q.q}</div>
                <div class="question-meta">
                    <span class="severity-tag severity-${q.severity}">${q.severity}</span>
                    ${q.regs.map(r => `<span class="severity-tag" style="background:rgba(99,102,241,0.08);color:#818cf8">${r}</span>`).join('')}
                </div>
            </div>
            <div class="toggle-group">
                <button class="toggle-btn" data-id="${q.id}" data-val="true">Yes</button>
                <button class="toggle-btn" data-id="${q.id}" data-val="false">No</button>
            </div>
        `;
        catContainer.appendChild(item);
    });

    // Toggle event
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.toggle-btn');
        if (!btn) return;

        const id = btn.dataset.id;
        const val = btn.dataset.val === 'true';
        state.answers[id] = val;

        // Update UI
        const group = btn.parentElement;
        group.querySelectorAll('.toggle-btn').forEach(b => {
            b.classList.remove('active-yes', 'active-no');
        });
        btn.classList.add(val ? 'active-yes' : 'active-no');

        updateProgress();
    });
}

function updateProgress() {
    const answered = Object.keys(state.answers).length;
    const total = QUESTIONS.length;
    const pct = (answered / total * 100);

    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-text').textContent = `${answered} / ${total} answered`;
    document.getElementById('btn-submit').disabled = answered < total;
}


// ============================================================
// SCORING (mirrors core/checklist.py score_checklist)
// ============================================================

function scoreChecklist(answers) {
    const totalWeight = QUESTIONS.reduce((s, q) => s + q.weight, 0);
    let earnedWeight = 0;
    const gaps = [];
    const catStats = {};

    QUESTIONS.forEach(q => {
        if (!catStats[q.cat]) catStats[q.cat] = { total: 0, passed: 0, wTotal: 0, wEarned: 0 };
        catStats[q.cat].total++;
        catStats[q.cat].wTotal += q.weight;

        if (answers[q.id]) {
            earnedWeight += q.weight;
            catStats[q.cat].passed++;
            catStats[q.cat].wEarned += q.weight;
        } else {
            gaps.push({ ...q, isFree: false });
        }
    });

    const score = totalWeight > 0 ? (earnedWeight / totalWeight * 100) : 0;
    let grade = 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 75) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 40) grade = 'D';

    // Sort by severity
    const sevOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    gaps.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);

    // Free guide = easiest fix
    if (gaps.length > 0) {
        const easiest = gaps.reduce((min, g) => g.fixDays < min.fixDays ? g : min, gaps[0]);
        easiest.isFree = true;
    }

    // Category scores
    Object.keys(catStats).forEach(k => {
        catStats[k].score = catStats[k].wTotal > 0 ? Math.round(catStats[k].wEarned / catStats[k].wTotal * 100) : 100;
    });

    return {
        score: Math.round(score * 10) / 10,
        grade,
        passed: QUESTIONS.length - gaps.length,
        failed: gaps.length,
        gaps,
        catStats,
        fixCost: gaps.reduce((s, g) => s + g.fixCost, 0),
        fixDays: gaps.length > 0 ? Math.max(...gaps.map(g => g.fixDays)) : 0,
    };
}


// ============================================================
// SIMILAR CASES MATCHING
// ============================================================

function findSimilarCases(industry, empCount) {
    const empRange = empCount <= 50 ? '1-50' : empCount <= 500 ? '51-500' : '500+';
    const industryGroups = {
        Financial: ['Financial','Fintech'], Healthcare: ['Healthcare','Medical'],
        Technology: ['Technology','SaaS'], Retail: ['Retail','E-commerce'],
        Education: ['Education'], Manufacturing: ['Manufacturing'], Hospitality: ['Hospitality'],
    };

    const myGroup = Object.entries(industryGroups).find(([k, v]) => v.includes(industry));
    const myGroupKeys = myGroup ? myGroup[1] : [industry];

    return ENFORCEMENT_CASES
        .map(c => {
            let score = 0;
            if (myGroupKeys.includes(c.industry)) score += 0.4;
            if (c.empRange === empRange) score += 0.3;
            else score += 0.1;
            score += 0.15; // US bonus
            if (c.fine > 0) score += 0.05;
            return { ...c, similarity: Math.round(score * 100) / 100 };
        })
        .sort((a, b) => b.similarity - a.similarity || b.fine - a.fine)
        .slice(0, 3);
}


// ============================================================
// RENDER RESULTS
// ============================================================

function setupSubmit() {
    document.getElementById('btn-submit').addEventListener('click', () => {
        const result = scoreChecklist(state.answers);
        const cases = findSimilarCases(state.companyInfo.industry, state.companyInfo.employees);
        const breach = BREACH_COSTS[state.companyInfo.industry] || BREACH_COSTS.Other;

        renderResults(result, cases, breach);

        document.getElementById('checklist-section').style.display = 'none';
        document.getElementById('results-section').classList.remove('hidden');
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    });
}

function renderResults(result, cases, breach) {
    // Score ring
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (result.score / 100) * circumference;
    const ringFill = document.getElementById('score-ring-fill');

    // Color based on grade
    const gradeColors = { A: '#22c55e', B: '#60a5fa', C: '#eab308', D: '#f97316', F: '#ef4444' };
    ringFill.style.stroke = gradeColors[result.grade];
    setTimeout(() => { ringFill.style.strokeDashoffset = offset; }, 100);

    document.getElementById('score-number').textContent = result.score;
    const badge = document.getElementById('grade-badge');
    badge.textContent = `Grade: ${result.grade}`;
    badge.className = `grade-badge grade-${result.grade}`;

    document.getElementById('score-summary').textContent =
        `${result.passed} of ${result.passed + result.failed} requirements met. ` +
        `${result.failed} gaps found with estimated fix cost of $${result.fixCost.toLocaleString()}.`;

    // Category bars
    const catBars = document.getElementById('category-bars');
    catBars.innerHTML = Object.entries(result.catStats).map(([cat, stats]) => {
        const color = stats.score >= 80 ? '#22c55e' : stats.score >= 50 ? '#eab308' : '#ef4444';
        return `<div class="cat-bar-item">
            <div class="cat-bar-header">
                <span class="cat-bar-name">${cat}</span>
                <span class="cat-bar-score" style="color:${color}">${stats.score}%</span>
            </div>
            <div class="cat-bar-track">
                <div class="cat-bar-fill" style="width:${stats.score}%;background:${color}"></div>
            </div>
        </div>`;
    }).join('');

    // Similar cases
    document.getElementById('similar-cases').innerHTML = cases.map(c => `
        <div class="case-card">
            <div class="case-header">
                <span class="case-company">${c.company}</span>
                <span class="case-fine">$${c.fine.toLocaleString()}</span>
            </div>
            <div class="case-meta">${c.reg} · ${c.year} · ${c.industry} · ${c.empRange} employees</div>
            <div class="case-desc">${c.desc}</div>
        </div>
    `).join('');

    // Breach cost
    const piiCost = state.companyInfo.piiCount > 0 ? state.companyInfo.piiCount * breach.perRecord : 0;
    document.getElementById('breach-cost').innerHTML = `
        <div class="breach-grid">
            <div class="breach-stat">
                <div class="breach-stat-value">$${(breach.total / 1000000).toFixed(1)}M</div>
                <div class="breach-stat-label">Industry avg breach cost</div>
            </div>
            <div class="breach-stat">
                <div class="breach-stat-value">$${breach.perRecord}</div>
                <div class="breach-stat-label">Cost per record</div>
            </div>
            <div class="breach-stat">
                <div class="breach-stat-value">${breach.detectDays} days</div>
                <div class="breach-stat-label">Avg detection time</div>
            </div>
        </div>
        ${piiCost > 0 ? `<p class="breach-source" style="font-size:0.88rem;color:#ef4444;font-style:normal;margin-top:16px">
            ⚠️ With ${state.companyInfo.piiCount.toLocaleString()} PII records, your estimated exposure is <strong>$${piiCost.toLocaleString()}</strong>
        </p>` : ''}
        <p class="breach-source">Source: IBM Cost of Data Breach Report 2024</p>
    `;

    // Gaps
    document.getElementById('gaps-list').innerHTML = result.gaps.map(g => `
        <div class="gap-item">
            <div class="gap-header">
                <span class="gap-id">${g.id}</span>
                <span class="severity-tag severity-${g.severity}">${g.severity}</span>
            </div>
            <div class="gap-question">${g.q}</div>
            <div class="gap-summary">💡 ${g.summary}</div>
            <div class="gap-cost">
                <span>⏱️ ~${g.fixDays} days</span>
                <span>💵 ~$${g.fixCost.toLocaleString()}</span>
                <span>📋 ${g.regs.join(', ')}</span>
            </div>
        </div>
    `).join('');

    // Free guide
    const freeGap = result.gaps.find(g => g.isFree);
    if (freeGap) {
        document.getElementById('free-guide-title').textContent = freeGap.q;
        document.getElementById('free-guide-content').innerHTML = freeGap.detail;
    } else {
        document.getElementById('free-guide-card').style.display = 'none';
    }

    // Paywall text
    const paidCount = result.gaps.filter(g => !g.isFree).length;
    document.getElementById('paywall-text').textContent =
        `You have ${paidCount} more gaps that need detailed remediation guides. ` +
        `Estimated total fix cost: $${result.fixCost.toLocaleString()}.`;
}


// ============================================================
// UTILITY: Format number
// ============================================================
function fmt(n) {
    if (n >= 1000000000) return '$' + (n / 1000000000).toFixed(1) + 'B';
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
    return '$' + n;
}

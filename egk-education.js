// ══════════════════════════════════════════
//  EduGolfKids Education Hub v2.0
// ══════════════════════════════════════════

const CERT_LEVELS = {
  M0:      { id:'M0',      label:'Model 0 — Compliance',       fullLabel:'Model 0: Foundational Compliance & Safeguarding', passPct:85, prereq:null, color:'#DC2626', forRoles:['coach','licensee'] },
  L1:      { id:'L1',      label:'Level 1 — Foundations',      fullLabel:'Level 1 Coach Certification — Foundations',         passPct:85, prereq:'M0', color:'#1B5C2A', forRoles:['coach','licensee'] },
  L2:      { id:'L2',      label:'Level 2 — Golf Skills',       fullLabel:'Level 2 Coach Certification — Golf Skills',          passPct:85, prereq:'L1', color:'#2980B9', forRoles:['coach','licensee'] },
  L3:      { id:'L3',      label:'Level 3 — Business Ops',      fullLabel:'Level 3 Licensee Certification — Business Operations',passPct:85, prereq:'L2', color:'#C9A84C', forRoles:['licensee'] },
  REFRESH: { id:'REFRESH', label:'Annual Refresher',            fullLabel:'Annual Certification Refresher',                     passPct:85, prereq:'L1', color:'#8B5CF6', forRoles:['coach','licensee'] },
};

// ── State ────────────────────────────────────────────────────────────────────
let certState = { records:{}, sha:null, usersData:{ users:[] } };
let quizState = { level:null, questions:[], currentQ:0, answers:[], answered:false };
let eduState  = { level:null, moduleId:null, sectionIdx:0 };

async function loadCertData() {
  try {
    const result = await githubGet('data/users/users.json');
    const userRec = (result.data?.users||[]).find(u=>u.id===state.user?.id) || {};
    certState.records     = userRec.certifications || {};
    certState.sha         = result.sha;
    certState.usersData   = result.data;
  } catch {
    certState.records     = {};
    certState.usersData   = { users:[] };
  }
}

async function saveCertRecord(level, pct, passed) {
  const today   = new Date().toISOString().split('T')[0];
  const expiry  = new Date(); expiry.setFullYear(expiry.getFullYear()+1);
  certState.records[level] = { passed, score:pct, date:today, expiry:expiry.toISOString().split('T')[0], name:state.user?.name||'Coach' };
  let usersData = certState.usersData || { users:[] };
  let users     = usersData.users || [];
  let idx       = users.findIndex(u=>u.id===state.user?.id);
  if (idx===-1) { users.push({ id:state.user?.id, name:state.user?.name, certifications:{} }); idx=users.length-1; }
  users[idx].certifications = certState.records;
  usersData.users = users;
  try { await githubPut('data/users/users.json', usersData, certState.sha, `Cert ${level} — ${state.user?.name}`); } catch(e) { console.warn('cert save failed',e); }
}

function hasPassed(level)  { const r=certState.records[level]; return r&&r.passed; }
function isExpired(level)  { const r=certState.records[level]; return r?.expiry && new Date(r.expiry)<new Date(); }
function m0Acknowledged()  { return !!certState.records['M0_ACK']; }

async function saveM0Ack() {
  certState.records['M0_ACK'] = { ack:true, date:new Date().toISOString().split('T')[0] };
  let usersData = certState.usersData || { users:[] };
  let users = usersData.users || [];
  let idx   = users.findIndex(u=>u.id===state.user?.id);
  if (idx===-1) { users.push({ id:state.user?.id, name:state.user?.name, certifications:{} }); idx=users.length-1; }
  users[idx].certifications = certState.records;
  usersData.users = users;
  try { await githubPut('data/users/users.json', usersData, certState.sha, `M0 Ack — ${state.user?.name}`); } catch(e) { console.warn('ack save failed',e); }
}

// ══════════════════════════════════════════
//  MODULE CONTENT DATA
// ══════════════════════════════════════════

const EDU_MODULES = {
M0:[{
  id:"M0",
  title:"Compliance &amp; Safeguarding",
  icon:"\ud83d\udee1\ufe0f",
  sections:[
    {h:`Compliance &amp; Safeguarding`,b:`<p class="doc-bold-label">Foundational Compliance &amp; Safeguarding Certification</p>
<p class="doc-bold-label">(Pre-Course Mandatory Requirement – Revised Operational Version)</p>
<h4 class="doc-subheading">1. Duty of Care Framework</h4>
<p class="doc-p"><strong>EduGolfKids operates under an elevated duty-of-care standard within school environments.</strong></p>
<p class="doc-p"><strong>All coaches act:</strong></p>
<ul class="doc-list"><li>In loco parentis during sessions(“In the place of a parent.”)</li><li>As mandatory reporters where required by state law</li><li>In compliance with district safeguarding policies</li></ul>
<p class="doc-p"><strong>Safety, supervision, and safeguarding take priority over instruction.</strong></p>
<h4 class="doc-subheading">2. Background Screening Requirements</h4>
<p class="doc-p"><strong>Prior to school placement, each coach must complete:</strong></p>
<ul class="doc-list"><li>State-level criminal background check</li><li>National sex offender registry screening</li><li>Additional district-required screenings</li><li>Identity and employment eligibility verification</li></ul>
<p class="doc-p"><strong>Documentation must be available for district review.</strong></p>
<p class="doc-p"><strong>No coach may enter a school environment without clearance.</strong></p>
<h4 class="doc-subheading">3. Mandatory Reporter Compliance</h4>
<p class="doc-p"><strong>Coaches must complete:</strong></p>
<ul class="doc-list"><li>State-required mandatory reporter training</li><li>Child abuse recognition training</li><li>District reporting protocol review</li></ul>
<p class="doc-p"><strong>If there is reasonable suspicion of abuse, coaches must:</strong></p>
<ul class="doc-list"><li>Ensure child safety</li></ul>
<ul class="doc-list"><li>Report to designated school authority</li></ul>
<ul class="doc-list"><li>Follow state reporting law</li></ul>
<ul class="doc-list"><li>Notify EduGolfKids Compliance Officer</li></ul>
<p class="doc-p"><strong>Failure to report results in removal from certification.</strong></p>
<h4 class="doc-subheading">4. Supervision &amp; Visibility Standards</h4>
<p class="doc-p"><strong>EduGolfKids requires visible and accountable instruction environments.</strong></p>
<p class="doc-p"><strong>Standard Practice:</strong></p>
<ul class="doc-list"><li>Sessions must occur in school-approved spaces</li><li>School staff must have access to session areas</li><li>Doors must remain unlocked when indoors</li><li>Windows or visibility panels used when available</li></ul>
<p class="doc-p"><strong>When Direct Line-of-Sight Is Not Possible (e.g., gym partition):</strong></p>
<ul class="doc-list"><li>School staff must know session location</li><li>Coach must remain in open, common-use area</li><li>No isolated closed-room instruction permitted</li></ul>
<p class="doc-bold-label">One-on-One Lessons Policy</p>
<p class="doc-p"><strong>One-on-one sessions are permitted when:</strong></p>
<ul class="doc-list"><li>Low enrollment results in a single participant</li><li>A second adult is present in the facility (teacher, staff, or parent)</li><li>The session takes place in an open, observable space</li></ul>
<p class="doc-p"><strong>One-on-one instruction is prohibited:</strong></p>
<ul class="doc-list"><li>Behind closed doors</li><li>In secluded or non-monitored areas</li><li>Without staff awareness</li></ul>
<p class="doc-p"><strong>This maintains compliance without blocking operational flexibility.</strong></p>
<h4 class="doc-subheading">5. Physical Contact Policy</h4>
<p class="doc-p"><strong>EduGolfKids does NOT enforce a zero-contact rule.</strong></p>
<p class="doc-p"><strong>Instead, we enforce Controlled &amp; Transparent Instructional Contact.</strong></p>
<p class="doc-p"><strong>Hands-on positioning is permitted only when:</strong></p>
<ul class="doc-list"><li>Instructional necessity exists</li><li>Verbal cueing has been attempted first</li><li>Contact is brief, non-invasive, and instructional</li><li>Coach explains contact before making adjustment</li></ul>
<p class="doc-p"><strong>Example:</strong></p>
<p class="doc-p"><strong>“I’m going to gently adjust your shoulders so you can feel the correct position.”</strong></p>
<p class="doc-p"><strong>Contact must never:</strong></p>
<ul class="doc-list"><li>Involve sensitive areas</li><li>Be prolonged</li><li>Occur without explanation</li><li>Occur in isolated settings</li></ul>
<p class="doc-p"><strong>This aligns with SafeSport’s “appropriate instructional contact” guidelines.</strong></p>
<h4 class="doc-subheading">6. Equipment &amp; Hitting Zone Safety Protocol</h4>
<p class="doc-p"><strong>Strict Safety Rules:</strong></p>
<ul class="doc-list"><li>Children may only hold clubs inside designated hitting zones</li><li>Clubs must remain grounded when not actively hitting</li><li>No child may walk with a club in hand</li><li>No club may be carried during water breaks</li><li>All equipment must be placed on the ground inside hitting zones before movement</li></ul>
<p class="doc-p"><strong>Movement Rules:</strong></p>
<ul class="doc-list"><li>Children may not enter another child’s hitting zone</li><li>Ball retrieval only upon coach command (“RESET”)</li><li>Running in hitting areas prohibited</li></ul>
<p class="doc-p"><strong>This reduces accidental swing contact risk significantly.</strong></p>
<h4 class="doc-subheading">7. Environmental &amp; Gym-Based Safety Adjustments</h4>
<p class="doc-p"><strong>When operating indoors (gym, multipurpose room):</strong></p>
<ul class="doc-list"><li>Foam or low-compression balls mandatory</li><li>Hitting lanes clearly marked with cones</li><li>Wall distance minimum safe buffer enforced</li><li>No overhead obstruction risk</li></ul>
<p class="doc-p"><strong>If environmental safety cannot be guaranteed, session must be modified.</strong></p>
<h4 class="doc-subheading">8. Emergency Action Plan (EAP)</h4>
<p class="doc-p"><strong>Each site must have:</strong></p>
<ul class="doc-list"><li>Emergency contact procedure</li><li>AED location identified</li><li>Nurse or medical access identified</li><li>Severe weather protocol reviewed</li></ul>
<p class="doc-p"><strong>Coaches must:</strong></p>
<ul class="doc-list"><li>Know EAP before first session</li><li>Report injuries same day</li><li>Complete incident documentation within 24 hours</li></ul>
<ul class="doc-list"><li>Have a EAP plan/card in coaches bag at all times.</li></ul>
<h4 class="doc-subheading">9. Dress Code Policy</h4>
<p class="doc-p"><strong>All EduGolfKids coaches must wear:</strong></p>
<ul class="doc-list"><li>Golf shirt (collared or approved branded attire)</li><li>Golf shorts or golf pants</li><li>Golf-appropriate athletic shoes</li></ul>
<p class="doc-p"><strong>Prohibited attire:</strong></p>
<ul class="doc-list"><li>Jeans</li><li>Sweatpants</li><li>Hoodies (unless branded and approved)</li><li>Sandals or open-toe shoes</li><li>Non-athletic footwear</li></ul>
<p class="doc-p"><strong>Coaches represent a professional youth sport brand and must maintain a golf-appropriate appearance.</strong></p>
<h4 class="doc-subheading">10. Mobile Phone Usage Policy</h4>
<p class="doc-p"><strong>During active sessions, coaches may NOT:</strong></p>
<ul class="doc-list"><li>Take personal calls</li><li>Respond to text messages</li><li>Use phones for personal browsing</li><li>Be distracted by non-session activity</li></ul>
<p class="doc-p"><strong>Permitted phone use:</strong></p>
<ul class="doc-list"><li>Recording swing video for instructional purposes</li><li>Taking approved photos (with consent)</li><li>Reviewing session plans</li><li>Checking attendance</li><li>Emergency communication</li></ul>
<p class="doc-p"><strong>Phones must remain off or on silent during instruction.</strong></p>
<p class="doc-p"><strong>Violation may result in disciplinary review.</strong></p>
<h4 class="doc-subheading">11. Insurance &amp; Liability Standards</h4>
<p class="doc-p"><strong>EduGolfKids maintains:</strong></p>
<ul class="doc-list"><li>General liability insurance ($1,000,000 minimum per occurrence)</li><li>Professional liability coverage</li><li>Additional insured status for districts upon request</li></ul>
<p class="doc-p"><strong>Certificates of Insurance provided prior to launch.</strong></p>
<h4 class="doc-subheading">12. Inclusion &amp; Non-Discrimination</h4>
<p class="doc-p"><strong>EduGolfKids complies with:</strong></p>
<ul class="doc-list"><li>Title IX</li><li>ADA</li><li>Section 504</li></ul>
<p class="doc-p"><strong>Reasonable accommodations will be provided when appropriate.</strong></p>
<p class="doc-p"><strong>No child may be excluded based on protected status.</strong></p>
<h4 class="doc-subheading">13. Incident Reporting Standards</h4>
<p class="doc-p"><strong>All incidents involving:</strong></p>
<ul class="doc-list"><li>Injury</li><li>Safety breach</li><li>Behavioral escalation</li><li>Parent concern</li></ul>
<p class="doc-p"><strong>Must be documented within 24 hours.</strong></p>
<p class="doc-p"><strong>Reports must include:</strong></p>
<ul class="doc-list"><li>Date</li><li>Time</li><li>Location</li><li>Description</li><li>Action taken</li><li>Witnesses</li></ul>
<h4 class="doc-subheading">14. Compliance Enforcement</h4>
<p class="doc-p"><strong>Failure to comply may result in:</strong></p>
<ul class="doc-list"><li>Immediate removal from school site</li><li>Suspension of certification</li><li>Termination</li><li>Reporting to authorities when required</li></ul>
<p class="doc-p"><strong>Safeguarding violations override instructional considerations.</strong></p>
<h4 class="doc-subheading">15. Time Management &amp; Supervision Protocol</h4>
<p class="doc-bold-label">(Custodial Responsibility Standards)</p>
<p class="doc-p"><strong>EduGolfKids recognizes that during lesson time, coaches assume active supervisory responsibility for participating children.</strong></p>
<p class="doc-p"><strong>Proper time management and supervision procedures are mandatory and non-negotiable.</strong></p>
<h4 class="doc-subheading">15.1 Coach Arrival &amp; Pre-Session Setup Requirements</h4>
<p class="doc-p"><strong>To ensure safety and professional standards:</strong></p>
<ul class="doc-list"><li>Coaches must arrive at the school a minimum of 15 minutes prior to scheduled lesson start time.</li><li>Upon arrival, coaches must notify designated school personnel of their presence.</li><li>All equipment and stations must be fully set up before children arrive.</li></ul>
<p class="doc-p"><strong>Under no circumstances may:</strong></p>`},
    {h:`Compliance &amp; Safeguarding (continued)`,b:`<ul class="doc-list"><li>Equipment setup occur while children are present.</li><li>Breakdown or packing up occur while children are present.</li></ul>
<p class="doc-p"><strong>Children must never be present in an environment where equipment is being assembled, adjusted, or removed.</strong></p>
<p class="doc-p"><strong>This prevents:</strong></p>
<ul class="doc-list"><li>Equipment-related injury</li><li>Distraction-based accidents</li><li>Loss of supervision focus</li></ul>
<h4 class="doc-subheading">15.2 Supervision During Lesson Time</h4>
<p class="doc-p"><strong>Coaches assume full supervisory responsibility during lesson time.</strong></p>
<p class="doc-p"><strong>At no point may:</strong></p>
<ul class="doc-list"><li>A child be left unsupervised</li><li>A coach leave the coaching area unattended</li><li>Equipment supervision lapse</li><li>Children move freely without monitoring</li></ul>
<p class="doc-p"><strong>Supervision must be:</strong></p>
<ul class="doc-list"><li>Active</li><li>Visible</li><li>Continuous</li></ul>
<p class="doc-p"><strong>Supervision includes both:</strong></p>
<ul class="doc-list"><li>Physical safety</li><li>Behavioral oversight</li></ul>
<h4 class="doc-subheading">15.3 Student Collection &amp; Return Procedures</h4>
<p class="doc-p"><strong>Coaches must follow each school’s specific protocol for:</strong></p>
<ul class="doc-list"><li>Collecting children from classrooms</li><li>Meeting at designated areas</li><li>Escorting students to lesson location</li></ul>
<p class="doc-p"><strong>Before leaving the classroom or pickup location, coaches must:</strong></p>
<ul class="doc-list"><li>Verify attendance list</li><li>Confirm number of children matches registration</li></ul>
<p class="doc-p"><strong>After lesson completion, coaches must:</strong></p>
<ul class="doc-list"><li>Escort children back to the correct classroom or designated drop-off area</li><li>Confirm handoff to responsible adult (teacher or authorized staff)</li></ul>
<p class="doc-p"><strong>Coaches must ensure 100% accountability for every child.</strong></p>
<p class="doc-p"><strong>No child may be dismissed independently unless explicitly authorized by school policy.</strong></p>
<h4 class="doc-subheading">15.4 End-of-Session Custodial Responsibility</h4>
<p class="doc-p"><strong>At lesson conclusion:</strong></p>
<ul class="doc-list"><li>Children must be transferred only to:</li></ul>
<ul class="doc-list"><li>Assigned school teacher</li></ul>
<ul class="doc-list"><li>Authorized school staff</li></ul>
<ul class="doc-list"><li>Verified parent or guardian</li></ul>
<p class="doc-p"><strong>Coaches must ensure:</strong></p>
<ul class="doc-list"><li>No child remains unattended</li><li>No child exits gated school property unsupervised</li><li>No child is left in parking areas or unsafe environments</li></ul>
<p class="doc-p"><strong>If a parent is late for pickup:</strong></p>
<ul class="doc-list"><li>The coach must remain with the child</li><li>The parent must be contacted immediately</li><li>Pickup arrangements must be confirmed</li><li>The child must remain under adult supervision at all times</li></ul>
<p class="doc-p"><strong>Under no circumstances may a coach leave a child unattended due to late pickup.</strong></p>
<h4 class="doc-subheading">15.5 Drop-Off &amp; Pick-Up Communication Protocol</h4>
<p class="doc-p"><strong>Parents must be clearly informed of:</strong></p>
<ul class="doc-list"><li>Exact lesson location</li><li>Start time</li><li>End time</li><li>Approved drop-off area</li><li>Approved pickup area</li></ul>
<p class="doc-p"><strong>This information must be communicated:</strong></p>
<ul class="doc-list"><li>Prior to program launch</li><li>In registration confirmation</li><li>In reminder communication</li></ul>
<p class="doc-p"><strong>Clear communication reduces liability and prevents unsafe dismissal scenarios.</strong></p>
<h4 class="doc-subheading">15.6 Equipment Breakdown Protocol</h4>
<p class="doc-p"><strong>Equipment breakdown may only begin when:</strong></p>
<ul class="doc-list"><li>All children have been safely handed over</li><li>The session area is fully cleared of participants</li><li>No child remains within equipment zone</li></ul>
<p class="doc-p"><strong>Packing up while children are present is prohibited.</strong></p>
<h4 class="doc-subheading">15.7 Zero-Unsupervised Policy</h4>
<p class="doc-p"><strong>EduGolfKids enforces a strict:</strong></p>
<p class="doc-p"><strong>Zero-Unsupervised-Child Standard.</strong></p>
<p class="doc-p"><strong>This applies:</strong></p>
<ul class="doc-list"><li>Before session</li><li>During session</li><li>After session</li><li>During transitions</li><li>During bathroom breaks</li><li>During late pickups</li></ul>
<p class="doc-p"><strong>At no point may a child be left without adult supervision.</strong></p>
<p class="doc-bold-label">Coach Acknowledgment</p>
<p class="doc-p"><strong>“I acknowledge and agree to comply with all EduGolfKids safeguarding, safety, operational, and legal standards as a condition of certification and school assignment.”</strong></p>
<h4 class="doc-subheading">16. Model 0 Certification Requirement</h4>
<p class="doc-p"><strong>Before entering Module 1 Certification, coaches must:</strong></p>
<ul class="doc-list"><li>Complete background clearance</li><li>Complete mandatory reporter training</li><li>Pass compliance knowledge check (90% minimum)</li><li>Sign acknowledgment</li></ul>
<div class="doc-ack-box">
  <h4 style="margin:0 0 12px;color:var(--green-dark);">📋 Coach Acknowledgment</h4>
  <p style="margin-bottom:16px;font-style:italic;">"I acknowledge and agree to comply with all EduGolfKids safeguarding, safety, operational, and legal standards as a condition of certification and school assignment."</p>
  <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;">
    <input type="checkbox" id="m0-acknowledge" style="margin-top:3px;width:18px;height:18px;flex-shrink:0;" onchange="checkM0Ack()"/>
    <span><strong>I have read and understood all Model 0 compliance requirements</strong> and agree to comply with all standards as a condition of certification.</span>
  </label>
  <div id="m0-ack-status" style="margin-top:10px;font-size:13px;color:var(--gray-400);"></div>
</div>`},
  ]
}],

L1:[
{
  id:"L1_M1",
  title:"Module 1 \u2014 EduGolfKids System Standards",
  icon:"\ud83d\udccb",
  sections:[
    {h:`Non-Negotiable 60-Minute Session Architecture`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Non-Negotiable 60-Minute Session Architecture</p>
<p class="doc-bold-label">Policy: Mandatory Structure</p>
<p class="doc-p"><strong>All sessions MUST follow:</strong></p>
<ul class="doc-list"><li>10 min – Warm-Up Game</li></ul>
<ul class="doc-list"><li>20 min – Skill Block</li></ul>
<ul class="doc-list"><li>20 min – Game Reinforcement</li></ul>
<ul class="doc-list"><li>10 min – Wrap-Up &amp; Reset</li></ul>
<p class="doc-p"><strong>Deviation requires HQ approval.</strong></p>
<p class="doc-bold-label">Why 60 Minutes?</p>
<p class="doc-p"><strong>Children 4–10 demonstrate:</strong></p>
<ul class="doc-list"><li>Limited sustained attention (10–20 min)</li></ul>
<ul class="doc-list"><li>High movement need</li></ul>
<ul class="doc-list"><li>Rapid cognitive fatigue</li></ul>
<p class="doc-p"><strong>Longer sessions reduce:</strong></p>
<ul class="doc-list"><li>Quality</li></ul>
<ul class="doc-list"><li>Focus</li></ul>
<ul class="doc-list"><li>Retention</li></ul>
<p class="doc-p"><strong>Shorter sessions reduce:</strong></p>
<ul class="doc-list"><li>Skill consolidation opportunity</li></ul>
<p class="doc-p"><strong>60 minutes is neurologically optimized for this age group.</strong></p>
<p class="doc-bold-label">Segment Breakdown (Deep Detail)</p>
<p class="doc-bold-label">1️⃣ Warm-Up Game (10 Minutes)</p>
<p class="doc-p"><strong>Purpose:</strong></p>
<ul class="doc-list"><li>Elevate heart rate</li></ul>
<ul class="doc-list"><li>Activate coordination</li></ul>
<ul class="doc-list"><li>Increase focus</li></ul>
<ul class="doc-list"><li>Create emotional engagement</li></ul>
<p class="doc-p"><strong>Must Include:</strong></p>
<ul class="doc-list"><li>Whole-body movement</li></ul>
<ul class="doc-list"><li>Competitive or cooperative scoring</li></ul>
<ul class="doc-list"><li>Immediate participation (no lines)</li></ul>
<ul class="doc-list"><li>Foam balls only</li></ul>
<p class="doc-p"><strong>Why It Matters:</strong></p>
<p class="doc-p"><strong>Movement primes the brain for learning (Ratey, 2008).</strong></p>
<p class="doc-bold-label">2️⃣ Skill Block (20 Minutes)</p>
<p class="doc-p"><strong>Purpose:</strong></p>
<ul class="doc-list"><li>Introduce new movement concept</li></ul>
<ul class="doc-list"><li>Refine existing skill</li></ul>
<ul class="doc-list"><li>Provide guided discovery</li></ul>
<p class="doc-p"><strong>Structure:</strong></p>
<ul class="doc-list"><li>3–4 mini constraints challenges</li></ul>
<ul class="doc-list"><li><5 min per variation</li></ul>
<ul class="doc-list"><li>Immediate rotation</li></ul>
<ul class="doc-list"><li>Constant movement</li></ul>
<p class="doc-p"><strong>No:</strong></p>
<ul class="doc-list"><li>Standing lines</li></ul>
<ul class="doc-list"><li>10-minute lecture</li></ul>
<ul class="doc-list"><li>Isolated repetitive swings</li></ul>
<p class="doc-bold-label">3️⃣ Game Reinforcement (20 Minutes)</p>
<p class="doc-p"><strong>Purpose:</strong></p>
<ul class="doc-list"><li>Transfer skill to contextual play</li></ul>
<ul class="doc-list"><li>Encourage decision-making</li></ul>
<ul class="doc-list"><li>Add pressure variability</li></ul>
<p class="doc-p"><strong>Examples:</strong></p>
<ul class="doc-list"><li>Target scoring challenges</li></ul>
<ul class="doc-list"><li>Team competitions</li></ul>
<ul class="doc-list"><li>Accuracy games</li></ul>
<ul class="doc-list"><li>Time-based scoring</li></ul>
<p class="doc-p"><strong>This is where retention is strengthened.</strong></p>
<p class="doc-bold-label">4️⃣ Wrap-Up &amp; Reset (10 Minutes)</p>
<p class="doc-p"><strong>Purpose:</strong></p>
<ul class="doc-list"><li>Reinforce learning verbally</li></ul>
<ul class="doc-list"><li>Build confidence</li></ul>
<ul class="doc-list"><li>Review safety</li></ul>
<ul class="doc-list"><li>Prepare for next session</li></ul>
<p class="doc-p"><strong>Must Include:</strong></p>
<ul class="doc-list"><li>Reflection question</li></ul>
<ul class="doc-list"><li>Positive feedback</li></ul>
<ul class="doc-list"><li>Equipment reset protocol</li></ul>
<p class="doc-bold-label">What Happens Without Structure?</p>
<p class="doc-p"><strong>You get:</strong></p>
<ul class="doc-list"><li>Chaos</li></ul>
<ul class="doc-list"><li>Inconsistent learning</li></ul>
<ul class="doc-list"><li>Increased injury risk</li></ul>
<ul class="doc-list"><li>Parent confusion</li></ul>
<ul class="doc-list"><li>Uneven progress</li></ul>
<ul class="doc-list"><li>Brand dilution</li></ul>
<p class="doc-p"><strong>Structure protects both the child and EduGolfKids.</strong></p>`},
    {h:`Approved vs Prohibited Drills (Expanded)`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Approved vs Prohibited Drills (Expanded)</p>
<p class="doc-p"><strong>APPROVED DRILLS MUST:</strong></p>
<ul class="doc-list"><li>Be Target-Based</li></ul>
<p class="doc-p"><strong>Children need external focus — not internal mechanics.</strong></p>
<ul class="doc-list"><li>Require Decision-Making</li></ul>
<p class="doc-p"><strong>No autopilot repetition.</strong></p>
<ul class="doc-list"><li>Use Low-Compression Balls</li></ul>
<p class="doc-p"><strong>Safety + confidence.</strong></p>
<ul class="doc-list"><li>Limit Repetition to <5 Minutes</li></ul>
<p class="doc-p"><strong>After 5 minutes engagement drops significantly.</strong></p>
<ul class="doc-list"><li>Include Movement Variation</li></ul>
<p class="doc-p"><strong>Change distance, target size, scoring rules.</strong></p>
<ul class="doc-list"><li>Encourage Guided Discovery</li></ul>
<p class="doc-p"><strong>Ask:</strong></p>
<ul class="doc-list"><li>“What worked?”</li></ul>
<ul class="doc-list"><li>“What changed?”</li></ul>
<ul class="doc-list"><li>“How did you adjust?”</li></ul>
<p class="doc-bold-label">PROHIBITED DRILLS (Detailed)</p>
<p class="doc-bold-label">❌ Long Static Lines</p>
<p class="doc-p"><strong>Why harmful:</strong></p>
<ul class="doc-list"><li>30–45 sec waiting = disengagement</li></ul>
<ul class="doc-list"><li>Behavioral disruption increases</li></ul>
<ul class="doc-list"><li>Repetition drops</li></ul>
<ul class="doc-list"><li>Learning efficiency decreases</li></ul>
<p class="doc-bold-label">❌ Blocked Repetition >5 Minutes</p>
<p class="doc-bold-label">Blocked practice = short-term improvement</p>
<p class="doc-bold-label">Variable practice = long-term retention</p>
<p class="doc-bold-label">❌ Technical Lectures >60 Seconds</p>
<p class="doc-p"><strong>Children cannot process abstract biomechanical instruction.</strong></p>
<p class="doc-p"><strong>Instead use:</strong></p>
<ul class="doc-list"><li>Analogies</li></ul>
<ul class="doc-list"><li>External cues</li></ul>
<ul class="doc-list"><li>Demonstration</li></ul>
<p class="doc-bold-label">❌ Full-Speed Uncontrolled Swings</p>
<p class="doc-p"><strong>Major injury liability.</strong></p>
<p class="doc-p"><strong>Non-negotiable violation.</strong></p>
<p class="doc-bold-label">❌ Adult Terminology</p>
<p class="doc-p"><strong>Avoid:</strong></p>
<ul class="doc-list"><li>“Lag angle”</li></ul>
<ul class="doc-list"><li>“Kinematic sequence”</li></ul>
<ul class="doc-list"><li>“Ground reaction force”</li></ul>
<p class="doc-p"><strong>Use:</strong></p>
<ul class="doc-list"><li>“Brush the grass”</li></ul>
<ul class="doc-list"><li>“Hit the rocket”</li></ul>
<ul class="doc-list"><li>“Make the ball fly to the red cone”</li></ul>`},
    {h:`Equipment &Spacing Governance (Expanded)`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Equipment &amp; Spacing Governance (Expanded)</p>
<p class="doc-bold-label">Lateral Spacing: Minimum 6 Feet</p>
<p class="doc-p"><strong>This accounts for:</strong></p>
<ul class="doc-list"><li>Swing arc</li></ul>
<ul class="doc-list"><li>Loss of balance</li></ul>
<ul class="doc-list"><li>Impulsive movement</li></ul>
<ul class="doc-list"><li>Delayed reaction time</li></ul>
<p class="doc-bold-label">Retrieval Protocol</p>
<p class="doc-p"><strong>When coach says “Retrieve”:</strong></p>
<ul class="doc-list"><li>All clubs on ground</li></ul>
<ul class="doc-list"><li>All children step behind safety line</li></ul>
<ul class="doc-list"><li>Walk — no running</li></ul>
<ul class="doc-list"><li>No club in hand</li></ul>
<p class="doc-p"><strong>Violation = immediate correction.</strong></p>
<p class="doc-bold-label">Swing Zones</p>
<p class="doc-p"><strong>Each child must have:</strong></p>
<ul class="doc-list"><li>Defined cone box</li></ul>
<ul class="doc-list"><li>Target lane</li></ul>
<ul class="doc-list"><li>No overlapping directions</li></ul>
<p class="doc-p"><strong>This is environmental constraint design.</strong></p>
<p class="doc-bold-label">Equipment Standards</p>
<ul class="doc-list"><li>Foam or low compression balls only</li></ul>
<ul class="doc-list"><li>Age-appropriate clubs</li></ul>
<ul class="doc-list"><li>No adult equipment</li></ul>
<ul class="doc-list"><li>Cones to define zones</li></ul>
<p class="doc-p"><strong>Safety is engineered — not reactive.</strong></p>`},
    {h:`No Improvisation Policy (Deep Governance)`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">No Improvisation Policy (Deep Governance)</p>
<p class="doc-p"><strong>This protects:</strong></p>
<ul class="doc-list"><li>Brand integrity</li></ul>
<ul class="doc-list"><li>Skills Passport system</li></ul>
<ul class="doc-list"><li>Assessment fairness</li></ul>
<ul class="doc-list"><li>Legal risk exposure</li></ul>
<p class="doc-p"><strong>Improvisation creates:</strong></p>
<ul class="doc-list"><li>Inconsistent evaluation</li></ul>
<ul class="doc-list"><li>Uneven progression</li></ul>
<ul class="doc-list"><li>Increased injury probability</li></ul>
<ul class="doc-list"><li>Parental dissatisfaction</li></ul>
<p class="doc-bold-label">What Is Allowed?</p>
<p class="doc-p"><strong>Personality:</strong></p>
<ul class="doc-list"><li>Energy</li></ul>
<ul class="doc-list"><li>Encouragement</li></ul>
<ul class="doc-list"><li>Humor</li></ul>
<ul class="doc-list"><li>Leadership style</li></ul>
<p class="doc-p"><strong>Not allowed:</strong></p>
<ul class="doc-list"><li>Changing structure</li></ul>
<ul class="doc-list"><li>Changing progression order</li></ul>
<ul class="doc-list"><li>Adding unsafe drills</li></ul>
<ul class="doc-list"><li>Modifying spacing rules</li></ul>
<p class="doc-p"><strong>Creativity exists within the framework.</strong></p>
<h3 class="doc-section-title">🎯 Coach Practical Application</h3>
<p class="doc-bold-label">Exercise 1 – Design &amp; Defend</p>
<p class="doc-p"><strong>Coach must submit:</strong></p>
<ul class="doc-list"><li>Written 60-minute plan</li></ul>
<ul class="doc-list"><li>Diagram of spacing</li></ul>
<ul class="doc-list"><li>Justification for:</li></ul>
<ul class="doc-list"><li>Warm-up design</li></ul>
<ul class="doc-list"><li>Skill progression</li></ul>
<ul class="doc-list"><li>Reinforcement game</li></ul>
<ul class="doc-list"><li>Identify motor learning principle used</li></ul>
<ul class="doc-list"><li>Identify risk mitigation considerations</li></ul>
<p class="doc-bold-label">Exercise 2 – Fault Analysis Scenario</p>
<p class="doc-p"><strong>Scenario:</strong></p>
<p class="doc-p"><strong>10 children in one line hitting at one net.</strong></p>
<p class="doc-p"><strong>Coach must identify:</strong></p>
<p class="doc-p"><strong>Engagement flaw:</strong></p>
<ul class="doc-list"><li><span class="doc-arrow">→</span> Long wait time reduces repetition.</li></ul>
<p class="doc-p"><strong>Motor learning flaw:</strong></p>
<ul class="doc-list"><li><span class="doc-arrow">→</span> Blocked practice with no contextual variation.</li></ul>
<p class="doc-p"><strong>Safety flaw:</strong></p>
<ul class="doc-list"><li><span class="doc-arrow">→</span> Overlapping swing path risk.</li></ul>
<p class="doc-p"><strong>Structural violation:</strong></p>
<ul class="doc-list"><li><span class="doc-arrow">→</span> Breaks session architecture + spacing policy.</li></ul>
<p class="doc-p"><strong>Redesign:</strong></p>
<ul class="doc-list"><li><span class="doc-arrow">→</span> 3 pods</li><li><span class="doc-arrow">→</span> 3 targets</li><li><span class="doc-arrow">→</span> Rotation every 4 minutes</li><li><span class="doc-arrow">→</span> Foam balls</li><li><span class="doc-arrow">→</span> Cones defining lanes</li></ul>
<h3 class="doc-section-title">📋 Certification Assessment</h3>
<p class="doc-bold-label">Written Test (30%)</p>
<ul class="doc-list"><li>Structure questions</li></ul>
<ul class="doc-list"><li>Motor learning theory</li></ul>
<ul class="doc-list"><li>Safety protocols</li></ul>
<ul class="doc-list"><li>Drill evaluation scenarios</li></ul>
<p class="doc-bold-label">Scenario Analysis (30%)</p>
<p class="doc-p"><strong>Given 3 unsafe scenarios:</strong></p>
<ul class="doc-list"><li>Identify violation</li></ul>
<ul class="doc-list"><li>Redesign properly</li></ul>
<ul class="doc-list"><li>Justify scientifically</li></ul>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p"><strong>Coach must:</strong></p>
<ul class="doc-list"><li>Set up correct spacing</li></ul>
<ul class="doc-list"><li>Deliver 10-minute micro session</li></ul>
<ul class="doc-list"><li>Demonstrate reset protocol</li></ul>
<ul class="doc-list"><li>Show engagement management</li></ul>
<p class="doc-p"><strong>Automatic fail triggers:</strong></p>
<ul class="doc-list"><li>Safety violation</li></ul>
<ul class="doc-list"><li>Full-speed uncontrolled swings</li></ul>
<ul class="doc-list"><li>Ignoring spacing rules</li></ul>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>
<p class="doc-p"><strong>EduGolfKids does not certify average.</strong></p>
<p class="doc-p"><strong>Certification means system mastery.</strong></p>
<p class="doc-bold-label">Final Reinforcement for Coaches</p>
<p class="doc-p"><strong>Consistency is not control for control’s sake.</strong></p>
<p class="doc-p"><strong>Consistency is:</strong></p>
<ul class="doc-list"><li>Neurological optimization</li></ul>
<ul class="doc-list"><li>Emotional regulation support</li></ul>
<ul class="doc-list"><li>Risk mitigation</li></ul>
<ul class="doc-list"><li>Brand protection</li></ul>
<ul class="doc-list"><li>Development integrity</li></ul>
<p class="doc-bold-label">You are not “teaching golf.”</p>
<p class="doc-p"><strong>You are engineering developmental environments.</strong></p>`},
  ]
},
{
  id:"L1_M2",
  title:"Module 2 \u2014 Child Development (Ages 4\u201310)",
  icon:"\ud83e\udde0",
  sections:[
    {h:`Developmental Foundations`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Developmental Foundations</p>
<p class="doc-p">Child development occurs across four domains:</p>
<p class="doc-bold-label">Cognitive (thinking capacity)</p>
<p class="doc-bold-label">Motor (movement control)</p>
<p class="doc-bold-label">Emotional (self-regulation)</p>
<p class="doc-bold-label">Social (peer interaction)</p>
<p class="doc-p">Coaching must align with all four — not just skill instruction.</p>`},
    {h:`Age Group Breakdown`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Age Group Breakdown</p>
<h3 class="doc-section-title">AGE 4–6: Early Fundamentals Stage</h3>
<p class="doc-bold-label">Neurological Characteristics</p>
<p class="doc-bold-label">Limited working memory capacity</p>
<p class="doc-bold-label">Short sustained attention (5–8 minutes)</p>
<p class="doc-bold-label">High sensory curiosity</p>
<p class="doc-bold-label">Imitation-driven learning</p>
<p class="doc-bold-label">Limited abstract reasoning</p>
<p class="doc-p">They learn best through:</p>
<p class="doc-bold-label">Demonstration</p>
<p class="doc-bold-label">Play</p>
<p class="doc-bold-label">Movement exploration</p>
<p class="doc-bold-label">Immediate feedback</p>
<p class="doc-bold-label">External cues</p>
<p class="doc-p">They struggle with:</p>
<p class="doc-bold-label">Technical explanation</p>
<p class="doc-bold-label">Sequential instruction beyond 1 step</p>
<p class="doc-bold-label">Waiting in lines</p>
<p class="doc-bold-label">Delayed reward systems</p>
<p class="doc-bold-label">Motor Development (4–6)</p>
<p class="doc-bold-label">Developing balance</p>
<p class="doc-bold-label">Inconsistent coordination</p>
<p class="doc-bold-label">Limited bilateral control</p>
<p class="doc-bold-label">Poor spatial awareness</p>
<p class="doc-bold-label">Impulsive movement</p>
<p class="doc-p">Coaching Implication:</p>
<p class="doc-p">Safety management must be heightened.</p>
<p class="doc-bold-label">Emotional Characteristics (4–6)</p>
<p class="doc-bold-label">Rapid mood shifts</p>
<p class="doc-bold-label">Frustration tolerance is low</p>
<p class="doc-bold-label">Immediate success needed</p>
<p class="doc-bold-label">Highly approval-driven</p>
<p class="doc-bold-label">Fear of public correction</p>
<p class="doc-p">Frustration signals may include:</p>
<p class="doc-bold-label">Dropping equipment</p>
<p class="doc-bold-label">Avoiding task</p>
<p class="doc-bold-label">Silence withdrawal</p>
<p class="doc-bold-label">Overactive behavior</p>
<p class="doc-bold-label">Saying “I can’t”</p>
<p class="doc-p">This is developmental — not defiance.</p>
<p class="doc-bold-label">Instruction Guidelines for 4–6</p>
<p class="doc-p">Use:</p>
<p class="doc-bold-label">One-step instructions</p>
<p class="doc-bold-label">Demonstration first</p>
<p class="doc-bold-label">Simple language</p>
<p class="doc-bold-label">External focus cues</p>
<p class="doc-bold-label">Short game cycles (<5 minutes)</p>
<p class="doc-p">Avoid:</p>
<p class="doc-bold-label">Technical breakdown</p>
<p class="doc-bold-label">Multi-part corrections</p>
<p class="doc-bold-label">Long explanations</p>
<p class="doc-bold-label">Public criticism</p>
<p class="doc-p">Example Cue:</p>
<p class="doc-p">Instead of:</p>
<p class="doc-p">“Shift your weight to your lead side.”</p>
<p class="doc-p">Say:</p>
<p class="doc-p">“Make the ball fly to the red rocket cone.”</p>
<h3 class="doc-section-title">AGE 6–9: Late Fundamentals / Early Learning Stage</h3>
<p class="doc-bold-label">Neurological Characteristics</p>
<p class="doc-bold-label">Improved working memory</p>
<p class="doc-bold-label">Sustained attention 10–20 minutes</p>
<p class="doc-bold-label">Can process 2-step instructions</p>
<p class="doc-bold-label">Beginning analytical thinking</p>
<p class="doc-bold-label">More competitive awareness</p>
<p class="doc-p">They learn well through:</p>
<p class="doc-bold-label">Structured challenge</p>
<p class="doc-bold-label">Scoring systems</p>
<p class="doc-bold-label">Peer comparison</p>
<p class="doc-bold-label">Clear goals</p>
<p class="doc-bold-label">Feedback with reasoning</p>
<p class="doc-bold-label">Motor Development (6–9)</p>
<p class="doc-bold-label">Improving coordination</p>
<p class="doc-bold-label">Better bilateral integration</p>
<p class="doc-bold-label">More stable balance</p>
<p class="doc-bold-label">Increased reaction control</p>
<p class="doc-p">However:</p>
<p class="doc-p">Consistency is still emerging.</p>
<p class="doc-p">Repetition must still be variable.</p>
<p class="doc-bold-label">Emotional Characteristics (6–9)</p>
<p class="doc-bold-label">Increased social comparison</p>
<p class="doc-bold-label">Sensitive to failure</p>
<p class="doc-bold-label">Competitive pride developing</p>
<p class="doc-bold-label">Can verbalize frustration</p>
<p class="doc-p">Frustration signals may include:</p>
<p class="doc-bold-label">Blaming equipment</p>
<p class="doc-bold-label">Comparing to peers</p>
<p class="doc-bold-label">Overtrying</p>
<p class="doc-bold-label">Withdrawal from competition</p>
<p class="doc-p">This stage requires calibrated challenge — not overpressure.</p>
<p class="doc-bold-label">Instruction Guidelines for 6–9</p>
<p class="doc-p">Use:</p>
<p class="doc-bold-label">Two-step instruction</p>
<p class="doc-bold-label">Tactical challenges</p>
<p class="doc-bold-label">Scoring goals</p>
<p class="doc-bold-label">Guided discovery questions</p>
<p class="doc-bold-label">Peer competition</p>
<p class="doc-p">Example Cue:</p>
<p class="doc-p">“Hit three balls past the blue cone. Then try to land one inside the yellow zone.”</p>
<p class="doc-p">This age can begin to understand:</p>
<p class="doc-bold-label">Cause and effect</p>
<p class="doc-bold-label">Adjustment reasoning</p>
<p class="doc-bold-label">Simple self-reflection</p>`},
    {h:`Frustration Recognition & Task Adjustment`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Frustration Recognition & Task Adjustment</p>
<p class="doc-p">Core Rule:</p>
<p class="doc-p">When frustration rises, task difficulty must adjust immediately.</p>
<p class="doc-p">Do NOT:</p>
<p class="doc-bold-label">Add more correction</p>
<p class="doc-bold-label">Increase technical detail</p>
<p class="doc-bold-label">Publicly criticize</p>
<p class="doc-bold-label">Demand repetition without modification</p>
<p class="doc-p">Instead adjust through constraints:</p>
<p class="doc-bold-label">Increase target size</p>
<p class="doc-bold-label">Reduce distance</p>
<p class="doc-bold-label">Change scoring rules</p>
<p class="doc-bold-label">Modify equipment</p>
<p class="doc-bold-label">Simplify task goal</p>
<p class="doc-p">Developmentally aligned coaching is adaptive.</p>`},
    {h:`Language Framework by Age`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Language Framework by Age</p>
<div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>Category</th><th>Age 4–6</th><th>Age 6–9</th></tr></thead><tbody><tr><td>Instruction Length</td><td>1 step</td><td>1–2 steps</td></tr><tr><td>Cue Type</td><td>External imagery</td><td>External + simple reasoning</td></tr><tr><td>Correction Style</td><td>Demonstrate</td><td>Ask-guided correction</td></tr><tr><td>Competition</td><td>Cooperative games</td><td>Structured competition</td></tr><tr><td>Feedback</td><td>Immediate praise</td><td>Specific performance feedback</td></tr><tr><td>Reflection</td><td>“Did it go far?”</td><td>“What changed that shot?”</td></tr></tbody></table></div>`},
    {h:`Practical Coaching Translation`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Practical Coaching Translation</p>
<p class="doc-p">Same Drill Example:</p>
<p class="doc-p">Target Hitting Game</p>
<p class="doc-bold-label">Coaching a 5-Year-Old</p>
<p class="doc-p">Language:</p>
<p class="doc-p">“Let’s hit the magic rocket to the red cone! Watch me first.”</p>
<p class="doc-p">Demonstrate.</p>
<p class="doc-p">Short attempts.</p>
<p class="doc-p">Celebrate small wins.</p>
<p class="doc-p">Keep rotation fast.</p>
<p class="doc-p">No scoring pressure.</p>
<p class="doc-bold-label">Coaching a 9-Year-Old</p>
<p class="doc-p">Language:</p>
<p class="doc-p">“You get 5 shots. Score 1 point for red, 2 for blue. Can you beat your score?”</p>
<p class="doc-p">Encourage self-evaluation:</p>
<p class="doc-p">“What adjustment helped?”</p>
<p class="doc-p">Allow peer challenge.</p>
<p class="doc-p">Introduce light competitive pressure.</p>`},
    {h:`Why Developmental Matching Matters`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Why Developmental Matching Matters</p>
<p class="doc-p">When instruction exceeds development:</p>
<p class="doc-bold-label">Anxiety increases</p>
<p class="doc-bold-label">Motor performance drops</p>
<p class="doc-bold-label">Engagement falls</p>
<p class="doc-bold-label">Injury risk rises</p>
<p class="doc-bold-label">Parent complaints increase</p>
<p class="doc-p">When instruction aligns:</p>
<p class="doc-bold-label">Confidence builds</p>
<p class="doc-bold-label">Skill retention improves</p>
<p class="doc-bold-label">Emotional regulation stabilizes</p>
<p class="doc-bold-label">Learning accelerates</p>
<p class="doc-p">Development drives instruction — not coach ego.</p>
<h3 class="doc-section-title">🎯 Coach Practical Application</h3>
<p class="doc-bold-label">Exercise 1 – Role Play</p>
<p class="doc-p">Coach must:</p>
<p class="doc-bold-label">Deliver 3-minute instruction to a simulated 5-year-old</p>
<p class="doc-bold-label">Deliver same drill to a simulated 9-year-old</p>
<p class="doc-p">Adjust:</p>
<p class="doc-bold-label">Language</p>
<p class="doc-bold-label">Challenge</p>
<p class="doc-bold-label">Feedback</p>
<p class="doc-bold-label">Instruction complexity</p>
<p class="doc-p">Evaluator looks for:</p>
<p class="doc-bold-label">Developmentally appropriate language</p>
<p class="doc-bold-label">Frustration awareness</p>
<p class="doc-bold-label">Task scaling</p>
<p class="doc-bold-label">Safety management</p>
<p class="doc-bold-label">Exercise 2 – Frustration Adjustment Drill</p>
<p class="doc-p">Scenario:</p>
<p class="doc-p">A 6-year-old misses 4 shots and says “This is stupid.”</p>
<p class="doc-p">Coach must:</p>
<p class="doc-bold-label">Identify developmental cause</p>
<p class="doc-bold-label">Modify task immediately</p>
<p class="doc-bold-label">Use corrective language</p>
<p class="doc-bold-label">Re-engage child within 60 seconds</p>
<h3 class="doc-section-title">📋 Certification Assessment</h3>
<p class="doc-bold-label">Written (30%)</p>
<p class="doc-p">Questions may include:</p>
<p class="doc-p">Identify cognitive differences between 4–6 and 6–9.</p>
<p class="doc-p">Explain why long lectures fail under age 7.</p>
<p class="doc-p">List three frustration signals in early childhood.</p>
<p class="doc-bold-label">Scenario Analysis (30%)</p>
<p class="doc-p">Given video or written scenario:</p>
<p class="doc-bold-label">Identify developmental mismatch</p>
<p class="doc-bold-label">Redesign instruction</p>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p">Coach must:</p>
<p class="doc-bold-label">Demonstrate age-adjusted instruction</p>
<p class="doc-bold-label">Modify drill difficulty in real time</p>
<p class="doc-bold-label">Use correct language structure</p>
<p class="doc-bold-label">Show emotional regulation management</p>
<p class="doc-p">Automatic reassessment if:</p>
<p class="doc-bold-label">Adult terminology used repeatedly</p>
<p class="doc-bold-label">Public shaming behavior</p>
<p class="doc-bold-label">Overloading multi-step instruction to 4–6 group</p>
<h3 class="doc-section-title">✅ Pass Requirement</h3>
<p class="doc-bold-label">Minimum 85%</p>
<p class="doc-p">A coach who does not understand development cannot safely or effectively coach children.</p>
<h3 class="doc-section-title">💡 Key Reinforcement</h3>
<p class="doc-p">You are not teaching golf swings.</p>
<p class="doc-p">You are shaping:</p>
<p class="doc-bold-label">Neural pathways</p>
<p class="doc-bold-label">Confidence patterns</p>
<p class="doc-bold-label">Emotional regulation habits</p>
<p class="doc-bold-label">Movement literacy foundations</p>
<p class="doc-p">Development dictates instruction.</p>
<p class="doc-p">Not the other way around.</p>`},
  ]
},
{
  id:"L1_M3",
  title:"Module 3 \u2014 Motor Learning &amp; Constraints",
  icon:"\u2699\ufe0f",
  sections:[
    {h:`What Is Motor Learning?`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">What Is Motor Learning?</p>
<p class="doc-p"><strong>Motor learning is:</strong></p>
<p class="doc-p"><strong>A relatively permanent change in movement capability produced by practice.</strong></p>
<p class="doc-bold-label">Key word: Permanent</p>
<p class="doc-p"><strong>Performance in a session is not learning.</strong></p>
<p class="doc-p"><strong>Temporary improvement ≠ retention.</strong></p>
<p class="doc-bold-label">Performance vs Learning</p>
<div class="doc-table-wrap"><table class="doc-table"><thead><tr><th><strong>Performance</strong></th><th><strong>Learning</strong></th></tr></thead><tbody><tr><td><strong>Looks good today</strong></td><td><strong>Retained next week</strong></td></tr><tr><td><strong>Block repetition</strong></td><td><strong>Variable problem-solving</strong></td></tr><tr><td><strong>Heavy correction</strong></td><td><strong>Exploration-based</strong></td></tr><tr><td><strong>Immediate improvement</strong></td><td><strong>Delayed improvement but stronger</strong></td></tr></tbody></table></div>
<p class="doc-p"><strong>EduGolfKids coaches train for learning, not appearance.</strong></p>`},
    {h:`How Children Acquire Movement Skills`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">How Children Acquire Movement Skills</p>
<p class="doc-p"><strong>Motor learning occurs through:</strong></p>
<ul class="doc-list"><li>Repetition WITH variation</li></ul>
<ul class="doc-list"><li>Environmental feedback</li></ul>
<ul class="doc-list"><li>Error detection</li></ul>
<ul class="doc-list"><li>Problem solving</li></ul>
<ul class="doc-list"><li>Emotional engagement</li></ul>
<p class="doc-p"><strong>Children build:</strong></p>
<ul class="doc-list"><li>Neural pathways</li></ul>
<ul class="doc-list"><li>Movement adaptability</li></ul>
<ul class="doc-list"><li>Sensory-motor calibration</li></ul>
<p class="doc-p"><strong>They do NOT build skill through:</strong></p>
<ul class="doc-list"><li>Listening to lectures</li></ul>
<ul class="doc-list"><li>Being corrected every swing</li></ul>
<ul class="doc-list"><li>Copying adult biomechanics</li></ul>
<ul class="doc-list"><li>Standing in lines</li></ul>`},
    {h:`Blocked vs Variable Practice`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Blocked vs Variable Practice</p>
<p class="doc-bold-label">Blocked Practice</p>
<p class="doc-p"><strong>Example:</strong></p>
<p class="doc-p"><strong>Child hits 20 balls from same spot to same target.</strong></p>
<p class="doc-p"><strong>Short-term result:</strong></p>
<p class="doc-p"><strong>Looks consistent.</strong></p>
<p class="doc-p"><strong>Long-term result:</strong></p>
<p class="doc-p"><strong>Poor transfer to real performance.</strong></p>
<p class="doc-p"><strong>Research (Shea &amp; Morgan, 1979) shows blocked practice limits retention.</strong></p>
<p class="doc-bold-label">Variable Practice</p>
<p class="doc-p"><strong>Example:</strong></p>
<ul class="doc-list"><li>Change distance</li></ul>
<ul class="doc-list"><li>Change target size</li></ul>
<ul class="doc-list"><li>Change scoring rules</li></ul>
<ul class="doc-list"><li>Change stance width</li></ul>
<p class="doc-p"><strong>Short-term result:</strong></p>
<p class="doc-p"><strong>Messier.</strong></p>
<p class="doc-p"><strong>Long-term result:</strong></p>
<p class="doc-p"><strong>Stronger retention.</strong></p>
<p class="doc-p"><strong>EduGolfKids prioritizes variable practice.</strong></p>`},
    {h:`The Constraints-Led Approach (CLA)`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The Constraints-Led Approach (CLA)</p>
<p class="doc-bold-label">(Newell, 1986; Renshaw et al., 2010)</p>
<p class="doc-p"><strong>Instead of telling children how to move, coaches manipulate:</strong></p>
<p class="doc-bold-label">1️⃣ Task Constraints</p>
<ul class="doc-list"><li>Target size</li></ul>
<ul class="doc-list"><li>Scoring rules</li></ul>
<ul class="doc-list"><li>Distance</li></ul>
<ul class="doc-list"><li>Time limits</li></ul>
<p class="doc-bold-label">2️⃣ Environmental Constraints</p>
<ul class="doc-list"><li>Cones</li></ul>
<ul class="doc-list"><li>Boundaries</li></ul>
<ul class="doc-list"><li>Landing zones</li></ul>
<ul class="doc-list"><li>Obstacles</li></ul>
<p class="doc-bold-label">3️⃣ Individual Constraints</p>
<ul class="doc-list"><li>Height</li></ul>
<ul class="doc-list"><li>Strength</li></ul>
<ul class="doc-list"><li>Coordination level</li></ul>
<ul class="doc-list"><li>Emotional state</li></ul>
<p class="doc-p"><strong>Movement emerges naturally when constraints are designed properly.</strong></p>`},
    {h:`Why Traditional Technical Instruction Fails in Children`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Why Traditional Technical Instruction Fails in Children</p>
<p class="doc-p"><strong>When coaches say:</strong></p>
<p class="doc-bold-label">“Keep your left arm straight.”</p>
<p class="doc-p"><strong>The child must:</strong></p>
<ul class="doc-list"><li>Understand abstract concept</li></ul>
<ul class="doc-list"><li>Convert to internal movement</li></ul>
<ul class="doc-list"><li>Execute under coordination limits</li></ul>
<ul class="doc-list"><li>Retain it under variability</li></ul>
<p class="doc-p"><strong>Most children cannot process this efficiently.</strong></p>
<p class="doc-p"><strong>Instead use:</strong></p>
<p class="doc-p"><strong>External focus cues.</strong></p>
<p class="doc-p"><strong>Example:</strong></p>
<p class="doc-p"><strong>Instead of “Rotate your hips,” say:</strong></p>
<p class="doc-bold-label">“Make your belly button face the target.”</p>
<p class="doc-p"><strong>External focus improves motor efficiency (Wulf, 2013).</strong></p>`},
    {h:`Guided Discovery vs Direct Correction`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Guided Discovery vs Direct Correction</p>
<p class="doc-p"><strong>Direct Correction:</strong></p>
<p class="doc-bold-label">“You lifted your head.”</p>
<p class="doc-p"><strong>Guided Discovery:</strong></p>
<p class="doc-bold-label">“What happened when that one went low?”</p>
<p class="doc-p"><strong>Guided discovery:</strong></p>
<ul class="doc-list"><li>Builds autonomy</li></ul>
<ul class="doc-list"><li>Improves retention</li></ul>
<ul class="doc-list"><li>Develops error detection</li></ul>
<ul class="doc-list"><li>Enhances confidence</li></ul>
<p class="doc-p"><strong>Correction hierarchy:</strong></p>
<ul class="doc-list"><li>Adjust environment</li></ul>
<ul class="doc-list"><li>Adjust task</li></ul>
<ul class="doc-list"><li>Ask reflective question</li></ul>
<ul class="doc-list"><li>Demonstrate</li></ul>
<ul class="doc-list"><li>Direct correction (last resort)</li></ul>`},
    {h:`Error Is Necessary`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Error Is Necessary</p>
<p class="doc-p"><strong>Children must make errors.</strong></p>
<p class="doc-p"><strong>Error allows:</strong></p>
<ul class="doc-list"><li>Neural recalibration</li></ul>
<ul class="doc-list"><li>Self-correction</li></ul>
<ul class="doc-list"><li>Adaptability</li></ul>
<p class="doc-p"><strong>Over-correction creates:</strong></p>
<ul class="doc-list"><li>Fear</li></ul>
<ul class="doc-list"><li>Overthinking</li></ul>
<ul class="doc-list"><li>Motor rigidity</li></ul>
<ul class="doc-list"><li>Coach dependency</li></ul>
<p class="doc-p"><strong>EduGolfKids embraces intelligent error.</strong></p>`},
    {h:`Designing a Motor-Learning-Optimized Session`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Designing a Motor-Learning-Optimized Session</p>
<p class="doc-p"><strong>Within 20-Minute Skill Block:</strong></p>
<p class="doc-p"><strong>Instead of:</strong></p>
<p class="doc-p"><strong>20 minutes same drill.</strong></p>
<p class="doc-p"><strong>Use:</strong></p>
<p class="doc-p"><strong>4 x 4-minute constraints challenges.</strong></p>
<p class="doc-p"><strong>Example:</strong></p>
<p class="doc-p"><strong>Challenge 1:</strong></p>
<p class="doc-p"><strong>Hit past blue cone.</strong></p>
<p class="doc-p"><strong>Challenge 2:</strong></p>
<p class="doc-p"><strong>Land inside yellow circle.</strong></p>
<p class="doc-p"><strong>Challenge 3:</strong></p>
<p class="doc-p"><strong>Score 3 in a row.</strong></p>
<p class="doc-p"><strong>Challenge 4:</strong></p>
<p class="doc-p"><strong>Time pressure round.</strong></p>
<p class="doc-p"><strong>Movement variability increases learning strength.</strong></p>`},
    {h:`Cognitive Load in Children`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Cognitive Load in Children</p>
<p class="doc-p"><strong>Children 4–10 have:</strong></p>
<ul class="doc-list"><li>Limited working memory</li></ul>
<ul class="doc-list"><li>Limited processing capacity</li></ul>
<ul class="doc-list"><li>High movement need</li></ul>
<p class="doc-p"><strong>Therefore:</strong></p>
<ul class="doc-list"><li>Keep instructions under 30 seconds.</li></ul>
<ul class="doc-list"><li>One focus cue at a time.</li></ul>
<ul class="doc-list"><li>Avoid multi-step breakdowns.</li></ul>
<ul class="doc-list"><li>Demonstrate visually.</li></ul>
<p class="doc-p"><strong>Cognitive overload reduces motor execution.</strong></p>`},
    {h:`Application to Golf-Specific Skills`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Application to Golf-Specific Skills</p>
<p class="doc-bold-label">Putting</p>
<p class="doc-p"><strong>Wrong Approach:</strong></p>
<p class="doc-p"><strong>20 identical 5-foot putts.</strong></p>
<p class="doc-p"><strong>Correct Approach:</strong></p>
<ul class="doc-list"><li>Change distance each round</li></ul>
<ul class="doc-list"><li>Shrink target gradually</li></ul>
<ul class="doc-list"><li>Add scoring rule</li></ul>
<ul class="doc-list"><li>Introduce obstacle</li></ul>
<p class="doc-bold-label">Chipping</p>
<p class="doc-p"><strong>Wrong:</strong></p>
<p class="doc-p"><strong>10 identical chips.</strong></p>
<p class="doc-p"><strong>Correct:</strong></p>
<ul class="doc-list"><li>Vary landing zones</li></ul>
<ul class="doc-list"><li>Vary target shape</li></ul>
<ul class="doc-list"><li>Change club length</li></ul>
<ul class="doc-list"><li>Add time challenge</li></ul>
<p class="doc-bold-label">Full Swing</p>
<p class="doc-p"><strong>Wrong:</strong></p>
<p class="doc-bold-label">“Fix your backswing.”</p>
<p class="doc-p"><strong>Correct:</strong></p>
<ul class="doc-list"><li>Adjust stance width</li></ul>
<ul class="doc-list"><li>Change target distance</li></ul>
<ul class="doc-list"><li>Modify scoring constraint</li></ul>
<ul class="doc-list"><li>Encourage rhythm cue</li></ul>
<p class="doc-p"><strong>Movement self-organizes under constraints.</strong></p>`},
    {h:`Coach Decision-Making Model`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Coach Decision-Making Model</p>
<p class="doc-p"><strong>When child struggles:</strong></p>
<p class="doc-p"><strong>Ask:</strong></p>
<ul class="doc-list"><li>Is task too hard?</li></ul>
<ul class="doc-list"><li>Is environment poorly designed?</li></ul>
<ul class="doc-list"><li>Is instruction overloaded?</li></ul>
<ul class="doc-list"><li>Is emotional state disrupted?</li></ul>
<p class="doc-p"><strong>Adjust constraints before correcting technique.</strong></p>
<h3 class="doc-section-title">🎯 Coach Practical Application</h3>
<p class="doc-bold-label">Exercise 1 – Drill Redesign</p>
<p class="doc-p"><strong>Coach is given:</strong></p>
<p class="doc-bold-label">“10 children hitting continuously toward one net.”</p>
<p class="doc-p"><strong>Coach must:</strong></p>
<ul class="doc-list"><li>Identify motor learning flaw</li></ul>
<ul class="doc-list"><li>Redesign into 3 variable stations</li></ul>
<ul class="doc-list"><li>Explain constraint used at each station</li></ul>
<ul class="doc-list"><li>Justify scientifically</li></ul>
<p class="doc-bold-label">Exercise 2 – Guided Discovery Role Play</p>
<p class="doc-p"><strong>Coach must:</strong></p>
<ul class="doc-list"><li>Avoid giving direct correction</li></ul>
<ul class="doc-list"><li>Ask guided question</li></ul>
<ul class="doc-list"><li>Modify task constraint</li></ul>
<ul class="doc-list"><li>Observe improvement</li></ul>
<p class="doc-p"><strong>Evaluator measures:</strong></p>
<ul class="doc-list"><li>Reduction of verbal overload</li></ul>
<ul class="doc-list"><li>Proper constraint manipulation</li></ul>
<ul class="doc-list"><li>Child engagement response</li></ul>`},
    {h:`Certification Assessment`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Certification Assessment</p>
<p class="doc-bold-label">Written (30%)</p>
<p class="doc-p"><strong>Questions may include:</strong></p>
<ul class="doc-list"><li>Define motor learning.</li></ul>
<ul class="doc-list"><li>Explain contextual interference.</li></ul>
<ul class="doc-list"><li>List 3 differences between blocked and variable practice.</li></ul>
<ul class="doc-list"><li>Define constraints-led coaching.</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>Case:</strong></p>
<p class="doc-p"><strong>Child inconsistent in hitting distance.</strong></p>
<p class="doc-p"><strong>Coach must:</strong></p>
<ul class="doc-list"><li>Adjust constraint</li></ul>
<ul class="doc-list"><li>Avoid technical lecture</li></ul>
<ul class="doc-list"><li>Explain reasoning</li></ul>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p"><strong>Coach must:</strong></p>
<ul class="doc-list"><li>Run 10-minute skill block</li></ul>
<ul class="doc-list"><li>Show 3 constraint variations</li></ul>
<ul class="doc-list"><li>Use external focus cue</li></ul>
<ul class="doc-list"><li>Avoid over-correction</li></ul>
<p class="doc-p"><strong>Automatic reassessment if:</strong></p>
<ul class="doc-list"><li>Coach uses continuous technical correction</li></ul>
<ul class="doc-list"><li>Runs blocked repetition >5 minutes</li></ul>
<ul class="doc-list"><li>Uses adult biomechanical language</li></ul>
<h3 class="doc-section-title">✅ Pass Requirement</h3>
<p class="doc-bold-label">Minimum 85%</p>
<p class="doc-p"><strong>Motor learning is not optional knowledge.</strong></p>
<p class="doc-p"><strong>It is the engine of EduGolfKids.</strong></p>
<h3 class="doc-section-title">💡 Final Reinforcement</h3>
<p class="doc-p"><strong>You are not a swing fixer.</strong></p>
<p class="doc-p"><strong>You are a learning designer.</strong></p>
<p class="doc-p"><strong>You create environments that:</strong></p>
<ul class="doc-list"><li>Promote exploration</li></ul>
<ul class="doc-list"><li>Encourage autonomy</li></ul>
<ul class="doc-list"><li>Build adaptability</li></ul>
<ul class="doc-list"><li>Strengthen retention</li></ul>
<ul class="doc-list"><li>Protect confidence</li></ul>
<p class="doc-p"><strong>Constraints guide behavior.</strong></p>
<p class="doc-p"><strong>Structure protects development.</strong></p>
<p class="doc-p"><strong>Error builds intelligence.</strong></p>`},
  ]
},
{
  id:"L1_M4",
  title:"Module 4 \u2014 Long-Term Athlete Development",
  icon:"\ud83d\udcc8",
  sections:[
    {h:`What is LTAD?`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">What is LTAD?</p>
<p class="doc-p">Long-Term Athlete Development (LTAD) is a science-based framework that organizes skill progression according to:</p>
<p class="doc-bold-label">Biological development</p>
<p class="doc-bold-label">Neuromuscular readiness</p>
<p class="doc-bold-label">Cognitive maturity</p>
<p class="doc-bold-label">Emotional regulation</p>
<p class="doc-bold-label">Physical growth windows</p>
<p class="doc-p">It prevents:</p>
<p class="doc-bold-label">Burnout</p>
<p class="doc-bold-label">Overuse injuries</p>
<p class="doc-bold-label">Skill plateaus</p>
<p class="doc-bold-label">Technical rigidity</p>
<p class="doc-bold-label">Early dropout</p>
<p class="doc-p">LTAD asks:</p>
<p class="doc-bold-label">“What is developmentally appropriate at this stage?”</p>
<p class="doc-p">Not:</p>
<p class="doc-bold-label">“How fast can we make them good?”</p>`},
    {h:`Active Start Stage (Ages 4–6)`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Active Start Stage (Ages 4–6)</p>
<p class="doc-p">Primary Goal:</p>
<p class="doc-p">Build movement literacy.</p>
<p class="doc-p">Not golf mechanics.</p>
<p class="doc-bold-label">Physical Priorities</p>
<p class="doc-bold-label">Balance</p>
<p class="doc-bold-label">Coordination</p>
<p class="doc-bold-label">Running</p>
<p class="doc-bold-label">Jumping</p>
<p class="doc-bold-label">Throwing</p>
<p class="doc-bold-label">Catching</p>
<p class="doc-bold-label">Spatial awareness</p>
<p class="doc-p">Golf exposure should be:</p>
<p class="doc-bold-label">Play-based</p>
<p class="doc-bold-label">Low pressure</p>
<p class="doc-bold-label">Short duration</p>
<p class="doc-bold-label">Target-focused</p>
<p class="doc-bold-label">Movement integrated</p>
<p class="doc-bold-label">What NOT To Emphasize</p>
<p class="doc-bold-label">Grip precision</p>
<p class="doc-bold-label">Swing plane</p>
<p class="doc-bold-label">Hip rotation sequencing</p>
<p class="doc-bold-label">Launch angle</p>
<p class="doc-bold-label">Technical positions</p>
<p class="doc-p">At this stage:</p>
<p class="doc-p">Movement quality > Swing aesthetics.</p>
<p class="doc-bold-label">Why?</p>
<p class="doc-p">Neurological development at 4–6 is:</p>
<p class="doc-bold-label">Highly plastic</p>
<p class="doc-bold-label">Pattern forming</p>
<p class="doc-bold-label">Exploration-driven</p>
<p class="doc-p">Early rigid technical instruction reduces:</p>
<p class="doc-bold-label">Creativity</p>
<p class="doc-bold-label">Natural movement exploration</p>
<p class="doc-bold-label">Adaptive learning</p>`},
    {h:`FUNdamentals Stage (Ages 6–9)`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">FUNdamentals Stage (Ages 6–9)</p>
<p class="doc-p">Primary Goal:</p>
<p class="doc-p">Build athletic foundation + basic golf control.</p>
<p class="doc-p">Still NOT specialization.</p>
<p class="doc-bold-label">Physical Priorities</p>
<p class="doc-bold-label">Refined balance</p>
<p class="doc-bold-label">Controlled rotation</p>
<p class="doc-bold-label">Rhythm</p>
<p class="doc-bold-label">Basic club-face awareness</p>
<p class="doc-bold-label">Target accuracy</p>
<p class="doc-bold-label">Athletic play</p>
<p class="doc-p">Introduce:</p>
<p class="doc-bold-label">Structured scoring</p>
<p class="doc-bold-label">Basic skill progression</p>
<p class="doc-bold-label">Controlled competition</p>
<p class="doc-p">Still Avoid:</p>
<p class="doc-bold-label">Swing reconstruction</p>
<p class="doc-bold-label">Biomechanical perfectionism</p>
<p class="doc-bold-label">High repetition blocked practice</p>
<p class="doc-bold-label">Adult tournament pressure</p>`},
    {h:`The Dangers of Early Technical Overload`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The Dangers of Early Technical Overload</p>
<p class="doc-p">Early technical overload occurs when:</p>
<p class="doc-bold-label">Coaches focus excessively on mechanics</p>
<p class="doc-bold-label">Children are corrected every swing</p>
<p class="doc-bold-label">Complex terminology is introduced</p>
<p class="doc-bold-label">Adult swing models are imposed</p>
<p class="doc-bold-label">Performance expectations exceed development</p>
<p class="doc-bold-label">Risks of Early Technical Overload</p>
<p class="doc-bold-label">1️⃣ Motor Rigidity</p>
<p class="doc-p">Children develop:</p>
<p class="doc-bold-label">Overthinking patterns</p>
<p class="doc-bold-label">Stiff movement</p>
<p class="doc-bold-label">Reduced fluidity</p>
<p class="doc-bold-label">Loss of adaptability</p>
<p class="doc-p">Motor learning science shows variability builds long-term skill (Schmidt & Lee, 2011).</p>
<p class="doc-bold-label">2️⃣ Reduced Creativity</p>
<p class="doc-p">Children stop:</p>
<p class="doc-bold-label">Exploring movement solutions</p>
<p class="doc-bold-label">Self-correcting</p>
<p class="doc-bold-label">Experimenting</p>
<p class="doc-p">They become dependent on coach instruction.</p>
<p class="doc-bold-label">3️⃣ Increased Injury Risk</p>
<p class="doc-p">Overuse + forced mechanics + repetition = preventable injury risk.</p>
<p class="doc-p">Youth sport data consistently shows early specialization increases injury rates.</p>
<p class="doc-bold-label">4️⃣ Psychological Burnout</p>
<p class="doc-p">Performance pressure before emotional readiness leads to:</p>
<p class="doc-bold-label">Anxiety</p>
<p class="doc-bold-label">Dropout</p>
<p class="doc-bold-label">Reduced enjoyment</p>
<p class="doc-bold-label">Identity stress</p>
<p class="doc-bold-label">5️⃣ Plateau Effect</p>
<p class="doc-p">Early technical perfection often results in:</p>
<p class="doc-bold-label">Early performance spike</p>
<p class="doc-bold-label">Mid-adolescence stagnation</p>
<p class="doc-bold-label">Difficulty adapting later</p>
<p class="doc-p">LTAD prevents early plateau.</p>`},
    {h:`Development vs Correction Priority`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Development vs Correction Priority</p>
<p class="doc-p">This is critical for certification.</p>
<p class="doc-p">When observing a child swing, ask:</p>
<p class="doc-bold-label">Is this movement age-appropriate?</p>
<p class="doc-bold-label">Is it safe?</p>
<p class="doc-bold-label">Is it functional?</p>
<p class="doc-bold-label">Does it allow target success?</p>
<p class="doc-bold-label">Is the child frustrated?</p>
<p class="doc-p">If yes to 2–4:</p>
<p class="doc-p">Correction may not be priority.</p>
<p class="doc-p">Development takes precedence over aesthetic correction.</p>
<p class="doc-bold-label">Example Analysis</p>
<p class="doc-p">Scenario:</p>
<p class="doc-p">7-year-old slices the ball but consistently reaches the target zone.</p>
<p class="doc-p">Decision:</p>
<p class="doc-p">If:</p>
<p class="doc-bold-label">No safety issue</p>
<p class="doc-bold-label">Ball reaches intended distance</p>
<p class="doc-bold-label">Child confident</p>
<p class="doc-p">Then:</p>
<p class="doc-p">Do NOT reconstruct swing.</p>
<p class="doc-p">Instead:</p>
<p class="doc-p">Adjust target constraints.</p>
<p class="doc-p">Encourage exploration.</p>
<p class="doc-p">Let natural refinement occur over time.</p>`},
    {h:`Stage-Appropriate Coaching Behavior`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Stage-Appropriate Coaching Behavior</p>
<div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>Stage</th><th>Coach Role</th><th>Technical Emphasis</th><th>Emotional Emphasis</th></tr></thead><tbody><tr><td>4–6</td><td>Movement guide</td><td>Minimal</td><td>Fun + safety</td></tr><tr><td>6–9</td><td>Skill architect</td><td>Moderate external cues</td><td>Challenge + confidence</td></tr></tbody></table></div>`},
    {h:`Practical Coaching Translation`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Practical Coaching Translation</p>
<p class="doc-bold-label">Same Drill: Target Accuracy Game</p>
<p class="doc-bold-label">Coaching 5-Year-Old (Active Start)</p>
<p class="doc-p">Focus:</p>
<p class="doc-bold-label">Hit toward target</p>
<p class="doc-bold-label">Celebrate effort</p>
<p class="doc-bold-label">Encourage movement exploration</p>
<p class="doc-p">Language:</p>
<p class="doc-p">“Make it fly past the red cone!”</p>
<p class="doc-p">No mechanical correction unless safety issue.</p>
<p class="doc-bold-label">Coaching 8-Year-Old (FUNdamentals)</p>
<p class="doc-p">Focus:</p>
<p class="doc-bold-label">Target control</p>
<p class="doc-bold-label">Club awareness</p>
<p class="doc-bold-label">Scoring</p>
<p class="doc-p">Language:</p>
<p class="doc-p">“What changed when that one went straighter?”</p>
<p class="doc-p">Encourage reflection, not mechanical lecture.</p>`},
    {h:`The LTAD Protection Rule`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The LTAD Protection Rule</p>
<p class="doc-p">EduGolfKids Coaches must never:</p>
<p class="doc-bold-label">Promise performance outcomes</p>
<p class="doc-bold-label">Push private technical training at early stage</p>
<p class="doc-bold-label">Over-correct natural movement</p>
<p class="doc-bold-label">Emphasize tournament identity</p>
<p class="doc-bold-label">Introduce adult swing models</p>
<p class="doc-p">EduGolfKids builds foundations — not prodigies.</p>
<h3 class="doc-section-title">🎯 Coach Practical Application</h3>
<p class="doc-bold-label">Exercise 1 – Swing Evaluation</p>
<p class="doc-p">Coach is shown video of:</p>
<p class="doc-p">A 6-year-old swinging with:</p>
<p class="doc-bold-label">Wide stance</p>
<p class="doc-bold-label">Open club face</p>
<p class="doc-bold-label">Off-balance finish</p>
<p class="doc-p">Coach must determine:</p>
<p class="doc-bold-label">What is developmentally normal?</p>
<p class="doc-bold-label">What requires safety correction?</p>
<p class="doc-bold-label">What can be left to maturation?</p>
<p class="doc-bold-label">What environmental constraint could guide improvement?</p>
<p class="doc-p">Expected Analysis:</p>
<p class="doc-p">Developmentally normal:</p>
<p class="doc-bold-label">Inconsistent balance</p>
<p class="doc-bold-label">Face control variability</p>
<p class="doc-p">Requires correction:</p>
<p class="doc-bold-label">Unsafe spacing</p>
<p class="doc-bold-label">Excessive overswing if balance risk</p>
<p class="doc-p">Constraint adjustment:</p>
<p class="doc-bold-label">Narrower stance challenge</p>
<p class="doc-bold-label">Closer target</p>
<p class="doc-bold-label">Larger landing zone</p>`},
    {h:`Certification Assessment`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Certification Assessment</p>
<p class="doc-bold-label">Written (30%)</p>
<p class="doc-p">Questions may include:</p>
<p class="doc-p">Define Active Start stage priorities.</p>
<p class="doc-p">List 3 risks of early technical overload.</p>
<p class="doc-p">Explain why blocked practice is limited in early development.</p>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p">Coach analyzes written case:</p>
<p class="doc-p">Parent demands swing reconstruction for 6-year-old.</p>
<p class="doc-p">Coach must:</p>
<p class="doc-bold-label">Respond professionally</p>
<p class="doc-bold-label">Explain LTAD reasoning</p>
<p class="doc-bold-label">Protect program philosophy</p>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p">Coach must:</p>
<p class="doc-bold-label">Evaluate a swing in real time</p>
<p class="doc-bold-label">Prioritize development over correction</p>
<p class="doc-bold-label">Avoid adult terminology</p>
<p class="doc-bold-label">Use constraint-led adjustment</p>
<p class="doc-p">Automatic reassessment if:</p>
<p class="doc-bold-label">Coach immediately reconstructs mechanics</p>
<p class="doc-bold-label">Uses technical jargon</p>
<p class="doc-bold-label">Prioritizes aesthetics over development</p>
<h3 class="doc-section-title">✅ Pass Requirement</h3>
<p class="doc-bold-label">Minimum 85%</p>
<p class="doc-p">EduGolfKids certification means:</p>
<p class="doc-p">You understand stages.</p>
<p class="doc-p">You protect development.</p>
<p class="doc-p">You think long term.</p>
<h3 class="doc-section-title">💡 Final Reinforcement</h3>
<p class="doc-p">Great golfers are not built early.</p>
<p class="doc-p">They are built correctly.</p>
<p class="doc-p">Movement literacy.</p>
<p class="doc-p">Adaptability.</p>
<p class="doc-p">Confidence.</p>
<p class="doc-p">Progressive skill layering.</p>
<p class="doc-p">Short-term technical obsession destroys long-term potential.</p>
<p class="doc-p">EduGolfKids coaches are long-term architects.</p>`},
  ]
},
{
  id:"L1_M5",
  title:"Module 5 \u2014 21st Century Learning",
  icon:"\ud83d\udd2c",
  sections:[
    {h:`What Are 21st Century Learning Skills?`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">What Are 21st Century Learning Skills?</p>
<p class="doc-p"><strong>Modern education emphasizes four core competencies:</strong></p>
<p class="doc-bold-label">1️⃣ Critical Thinking</p>
<p class="doc-bold-label">2️⃣ Communication</p>
<p class="doc-bold-label">3️⃣ Collaboration</p>
<p class="doc-bold-label">4️⃣ Creativity</p>
<p class="doc-bold-label">Often called the “4 C’s.”</p>
<p class="doc-p"><strong>EduGolfKids embeds these inside golf activities.</strong></p>`},
    {h:`Critical Thinking in Golf Sessions`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Critical Thinking in Golf Sessions</p>
<p class="doc-p"><strong>Critical thinking is:</strong></p>
<p class="doc-p"><strong>The ability to analyze, adjust, and solve problems.</strong></p>
<p class="doc-p"><strong>Instead of telling children what to do, coaches ask:</strong></p>
<ul class="doc-list"><li>“What changed on that shot?”</li></ul>
<ul class="doc-list"><li>“Why do you think it went farther?”</li></ul>
<ul class="doc-list"><li>“How can you adjust for that target?”</li></ul>
<p class="doc-p"><strong>This builds:</strong></p>
<ul class="doc-list"><li>Decision-making</li></ul>
<ul class="doc-list"><li>Self-correction</li></ul>
<ul class="doc-list"><li>Tactical awareness</li></ul>
<ul class="doc-list"><li>Cognitive flexibility</li></ul>
<p class="doc-p"><strong>Children who think about movement retain it better.</strong></p>`},
    {h:`Communication Development`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Communication Development</p>
<p class="doc-p"><strong>Communication is developed when children:</strong></p>
<ul class="doc-list"><li>Explain their strategy</li></ul>
<ul class="doc-list"><li>Give peer feedback</li></ul>
<ul class="doc-list"><li>Ask questions</li></ul>
<ul class="doc-list"><li>Reflect on performance</li></ul>
<p class="doc-p"><strong>Coaches must:</strong></p>
<ul class="doc-list"><li>Encourage verbal reflection</li></ul>
<ul class="doc-list"><li>Avoid dominating conversation</li></ul>
<ul class="doc-list"><li>Model concise language</li></ul>
<ul class="doc-list"><li>Reinforce respectful interaction</li></ul>
<p class="doc-p"><strong>Avoid:</strong></p>
<ul class="doc-list"><li>Over-talking</li></ul>
<ul class="doc-list"><li>Lecture style delivery</li></ul>
<ul class="doc-list"><li>One-direction communication</li></ul>`},
    {h:`Collaboration Through Structured Games`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Collaboration Through Structured Games</p>
<p class="doc-p"><strong>Collaboration teaches:</strong></p>
<ul class="doc-list"><li>Turn-taking</li></ul>
<ul class="doc-list"><li>Emotional regulation</li></ul>
<ul class="doc-list"><li>Shared success</li></ul>
<ul class="doc-list"><li>Conflict resolution</li></ul>
<p class="doc-p"><strong>Examples:</strong></p>
<ul class="doc-list"><li>Team target competitions</li></ul>
<ul class="doc-list"><li>Partner scoring challenges</li></ul>
<ul class="doc-list"><li>Cooperative distance games</li></ul>
<p class="doc-p"><strong>Coach role:</strong></p>
<ul class="doc-list"><li>Facilitate structure</li></ul>
<ul class="doc-list"><li>Prevent dominance behavior</li></ul>
<ul class="doc-list"><li>Encourage inclusion</li></ul>
<p class="doc-p"><strong>Collaboration increases social learning and enjoyment.</strong></p>`},
    {h:`Creativity Through Constraint Variation`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Creativity Through Constraint Variation</p>
<p class="doc-p"><strong>Creativity emerges when:</strong></p>
<ul class="doc-list"><li>Tasks are open-ended</li></ul>
<ul class="doc-list"><li>Solutions are not dictated</li></ul>
<ul class="doc-list"><li>Children experiment safely</li></ul>
<p class="doc-p"><strong>Instead of:</strong></p>
<p class="doc-bold-label">“Use this exact swing.”</p>
<p class="doc-p"><strong>Say:</strong></p>
<p class="doc-bold-label">“Find a way to land it inside the yellow circle.”</p>
<p class="doc-p"><strong>Different children will:</strong></p>
<ul class="doc-list"><li>Adjust stance</li></ul>
<ul class="doc-list"><li>Change speed</li></ul>
<ul class="doc-list"><li>Alter club angle</li></ul>
<p class="doc-p"><strong>Creative exploration builds adaptive skill.</strong></p>`},
    {h:`Growth Mindset Integration`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Growth Mindset Integration</p>
<p class="doc-bold-label">(Growth mindset principles inspired by Dweck)</p>
<p class="doc-p"><strong>Children must learn:</strong></p>
<ul class="doc-list"><li>Skill improves with effort</li></ul>
<ul class="doc-list"><li>Mistakes are learning data</li></ul>
<ul class="doc-list"><li>Struggle is normal</li></ul>
<ul class="doc-list"><li>Comparison is secondary to improvement</li></ul>
<p class="doc-p"><strong>Coach language matters:</strong></p>
<p class="doc-p"><strong>Instead of:</strong></p>
<p class="doc-bold-label">“You’re a natural.”</p>
<p class="doc-p"><strong>Say:</strong></p>
<p class="doc-bold-label">“That adjustment worked because you kept trying.”</p>
<p class="doc-p"><strong>Reinforce effort, not talent.</strong></p>`},
    {h:`Self-Regulation &Emotional Intelligence`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Self-Regulation &amp; Emotional Intelligence</p>
<p class="doc-p"><strong>21st-century learning includes:</strong></p>
<ul class="doc-list"><li>Managing frustration</li></ul>
<ul class="doc-list"><li>Waiting for turn</li></ul>
<ul class="doc-list"><li>Following structure</li></ul>
<ul class="doc-list"><li>Responding to challenge</li></ul>
<p class="doc-p"><strong>Golf is ideal for this because:</strong></p>
<ul class="doc-list"><li>It requires patience</li></ul>
<ul class="doc-list"><li>It requires control</li></ul>
<ul class="doc-list"><li>It requires focus</li></ul>
<p class="doc-p"><strong>Coaches must model calm tone, structured routine, and positive correction.</strong></p>`},
    {h:`Attention &Engagement in Modern Children`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Attention &amp; Engagement in Modern Children</p>
<p class="doc-p"><strong>Today’s children are exposed to:</strong></p>
<ul class="doc-list"><li>High screen stimulation</li></ul>
<ul class="doc-list"><li>Rapid content switching</li></ul>
<ul class="doc-list"><li>Short attention cycles</li></ul>
<p class="doc-p"><strong>Therefore sessions must include:</strong></p>
<ul class="doc-list"><li>Movement rotation every 4–5 minutes</li></ul>
<ul class="doc-list"><li>Clear scoring goals</li></ul>
<ul class="doc-list"><li>Immediate participation</li></ul>
<ul class="doc-list"><li>Minimal idle time</li></ul>
<p class="doc-p"><strong>Engagement is engineered.</strong></p>`},
    {h:`Reflection &Metacognition`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Reflection &amp; Metacognition</p>
<p class="doc-p"><strong>Metacognition = Thinking about thinking.</strong></p>
<p class="doc-p"><strong>In wrap-up phase, ask:</strong></p>
<ul class="doc-list"><li>“What helped you hit farther today?”</li></ul>
<ul class="doc-list"><li>“What did you change that worked?”</li></ul>
<ul class="doc-list"><li>“What will you try next time?”</li></ul>
<p class="doc-p"><strong>This strengthens:</strong></p>
<ul class="doc-list"><li>Self-awareness</li></ul>
<ul class="doc-list"><li>Long-term retention</li></ul>
<ul class="doc-list"><li>Confidence</li></ul>
<ul class="doc-list"><li>Autonomy</li></ul>`},
    {h:`The Modern Coach Role`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The Modern Coach Role</p>
<p class="doc-p"><strong>Old Model Coach:</strong></p>
<ul class="doc-list"><li>Authority figure</li></ul>
<ul class="doc-list"><li>Gives instructions</li></ul>
<ul class="doc-list"><li>Controls performance</li></ul>
<ul class="doc-list"><li>Corrects constantly</li></ul>
<p class="doc-p"><strong>21st Century EduGolfKids Coach:</strong></p>
<ul class="doc-list"><li>Learning facilitator</li></ul>
<ul class="doc-list"><li>Environment designer</li></ul>
<ul class="doc-list"><li>Question asker</li></ul>
<ul class="doc-list"><li>Confidence builder</li></ul>
<ul class="doc-list"><li>Structure enforcer</li></ul>
<p class="doc-p"><strong>You are not a lecturer.</strong></p>
<p class="doc-p"><strong>You are a guided learning architect.</strong></p>`},
    {h:`Practical Session Integration`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Practical Session Integration</p>
<p class="doc-bold-label">Example – Target Game</p>
<p class="doc-p"><strong>Instead of:</strong></p>
<p class="doc-bold-label">“Hit 10 balls to the cone.”</p>
<p class="doc-p"><strong>Use:</strong></p>
<p class="doc-bold-label">“You get 5 attempts. After each one, tell your partner what you adjusted.”</p>
<p class="doc-p"><strong>Adds:</strong></p>
<ul class="doc-list"><li>Reflection</li></ul>
<ul class="doc-list"><li>Communication</li></ul>
<ul class="doc-list"><li>Critical thinking</li></ul>
<ul class="doc-list"><li>Peer interaction</li></ul>
<p class="doc-p"><strong>Same drill. Higher learning value.</strong></p>`},
    {h:`Parent Communication Alignment`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Parent Communication Alignment</p>
<p class="doc-p"><strong>Parents today expect:</strong></p>
<ul class="doc-list"><li>Structured development</li></ul>
<ul class="doc-list"><li>Emotional safety</li></ul>
<ul class="doc-list"><li>Confidence growth</li></ul>
<ul class="doc-list"><li>Character building</li></ul>
<ul class="doc-list"><li>Measurable progression</li></ul>
<p class="doc-p"><strong>Coaches must be able to explain:</strong></p>
<p class="doc-p"><strong>“We are building decision-making, confidence, and motor adaptability — not just swings.”</strong></p>
<p class="doc-p"><strong>This strengthens retention and brand credibility.</strong></p>
<h3 class="doc-section-title">🎯 Coach Practical Application</h3>
<p class="doc-bold-label">Exercise 1 – Drill Upgrade</p>
<p class="doc-p"><strong>Coach is given:</strong></p>
<p class="doc-p"><strong>Standard hitting drill.</strong></p>
<p class="doc-p"><strong>Coach must redesign to include:</strong></p>
<ul class="doc-list"><li>Critical thinking question</li></ul>
<ul class="doc-list"><li>Collaboration element</li></ul>
<ul class="doc-list"><li>Reflection moment</li></ul>
<ul class="doc-list"><li>Growth mindset language</li></ul>
<p class="doc-bold-label">Exercise 2 – Language Audit</p>
<p class="doc-p"><strong>Coach must:</strong></p>
<p class="doc-p"><strong>Deliver 3-minute instruction.</strong></p>
<p class="doc-p"><strong>Evaluator counts:</strong></p>
<ul class="doc-list"><li>Number of commands</li></ul>
<ul class="doc-list"><li>Number of questions</li></ul>
<ul class="doc-list"><li>Effort-based praise</li></ul>
<ul class="doc-list"><li>Reflection prompts</li></ul>
<p class="doc-p"><strong>Target ratio:</strong></p>
<p class="doc-p"><strong>More questions than commands.</strong></p>
<h3 class="doc-section-title">📋 Certification Assessment</h3>
<p class="doc-bold-label">Written (30%)</p>
<p class="doc-p"><strong>Possible questions:</strong></p>
<ul class="doc-list"><li>Define the 4 C’s.</li></ul>
<ul class="doc-list"><li>Explain how critical thinking improves retention.</li></ul>
<ul class="doc-list"><li>Provide example of growth mindset language.</li></ul>
<ul class="doc-list"><li>Explain how collaboration improves engagement.</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>Scenario:</strong></p>
<p class="doc-p"><strong>Child frustrated after losing competition.</strong></p>
<p class="doc-p"><strong>Coach must:</strong></p>
<ul class="doc-list"><li>Apply growth mindset language</li></ul>
<ul class="doc-list"><li>Reframe challenge</li></ul>
<ul class="doc-list"><li>Maintain emotional safety</li></ul>
<ul class="doc-list"><li>Reinforce effort</li></ul>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p"><strong>Coach must:</strong></p>
<ul class="doc-list"><li>Run short game incorporating 2 of the 4 C’s</li></ul>
<ul class="doc-list"><li>Use reflection question</li></ul>
<ul class="doc-list"><li>Demonstrate growth mindset language</li></ul>
<ul class="doc-list"><li>Maintain structure</li></ul>
<p class="doc-p"><strong>Automatic reassessment if:</strong></p>
<ul class="doc-list"><li>Coach dominates talk time</li></ul>
<ul class="doc-list"><li>Uses performance shaming</li></ul>
<ul class="doc-list"><li>Removes collaborative structure</li></ul>
<h3 class="doc-section-title">✅ Pass Requirement</h3>
<p class="doc-bold-label">Minimum 85%</p>
<p class="doc-p"><strong>EduGolfKids certification means:</strong></p>
<p class="doc-p"><strong>You teach children how to think.</strong></p>
<p class="doc-p"><strong>How to adapt.</strong></p>
<p class="doc-p"><strong>How to regulate.</strong></p>
<p class="doc-p"><strong>How to grow.</strong></p>
<p class="doc-p"><strong>Not just how to swing.</strong></p>
<h3 class="doc-section-title">💡 Final Reinforcement</h3>
<p class="doc-p"><strong>EduGolfKids is not just sport.</strong></p>
<p class="doc-p"><strong>It is:</strong></p>
<p class="doc-bold-label">Movement education</p>
<p class="doc-bold-label">Cognitive development</p>
<p class="doc-bold-label">Emotional regulation training</p>
<p class="doc-bold-label">Social skill building</p>
<p class="doc-bold-label">Confidence architecture</p>
<p class="doc-p"><strong>In a structured, scalable system.</strong></p>`},
  ]
},
{
  id:"L1_M6",
  title:"Module 6 \u2014 Growth Mindset &amp; Language",
  icon:"\ud83d\udcac",
  sections:[
    {h:`What Is Growth Mindset?`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">What Is Growth Mindset?</p>
<p class="doc-p">Growth mindset is the belief that:</p>
<p class="doc-bold-label">Ability improves with effort</p>
<p class="doc-bold-label">Mistakes are part of learning</p>
<p class="doc-bold-label">Skill develops through practice</p>
<p class="doc-bold-label">Struggle is normal</p>
<p class="doc-p">Fixed mindset believes:</p>
<p class="doc-bold-label">Talent is permanent</p>
<p class="doc-bold-label">Failure defines identity</p>
<p class="doc-bold-label">Mistakes equal inability</p>
<p class="doc-p">EduGolfKids coaches must reinforce growth identity at all times.</p>`},
    {h:`Why Language Matters in Ages 4–10`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Why Language Matters in Ages 4–10</p>
<p class="doc-p">Children 4–10:</p>
<p class="doc-bold-label">Form early self-concept</p>
<p class="doc-bold-label">Are highly approval-sensitive</p>
<p class="doc-bold-label">Internalize adult feedback deeply</p>
<p class="doc-bold-label">Attach identity to performance</p>
<p class="doc-p">Negative phrasing becomes internal narrative.</p>
<p class="doc-p">Example:</p>
<p class="doc-p">Coach says:</p>
<p class="doc-p">“You’re not focusing.”</p>
<p class="doc-p">Child hears:</p>
<p class="doc-p">“I’m bad at this.”</p>
<p class="doc-p">Repeated language shapes long-term confidence.</p>`},
    {h:`The EduGolfKids Language Code`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The EduGolfKids Language Code</p>
<p class="doc-p">All certified coaches must follow the Language Code.</p>
<p class="doc-bold-label">APPROVED LANGUAGE</p>
<p class="doc-bold-label">• “I see improvement.”</p>
<ul class="doc-list"><li>“Let’s try again.”</li><li>“What did you notice?”</li><li>“That adjustment helped.”</li><li>“You kept going.”</li><li>“Good effort.”</li><li>“What could you change?”</li><li>“That was closer.”</li><li>“Keep exploring.”</li><li>“Nice adjustment.”</li></ul>
<p class="doc-p">Approved language:</p>
<p class="doc-bold-label">Encourages effort</p>
<p class="doc-bold-label">Reinforces autonomy</p>
<p class="doc-bold-label">Promotes reflection</p>
<p class="doc-bold-label">Supports emotional safety</p>
<p class="doc-bold-label">Builds resilience</p>
<p class="doc-bold-label">PROHIBITED LANGUAGE</p>
<p class="doc-bold-label">• “That’s wrong.”</p>
<ul class="doc-list"><li>“Why can’t you?”</li><li>“You’re not good at this.”</li><li>“No, not like that.”</li><li>“You always do that.”</li><li>“You’re the worst at this.”</li><li>“That’s easy.”</li><li>“You should know this.”</li></ul>
<p class="doc-p">Prohibited language:</p>
<p class="doc-bold-label">Attacks identity</p>
<p class="doc-bold-label">Creates shame</p>
<p class="doc-bold-label">Triggers anxiety</p>
<p class="doc-bold-label">Reduces effort</p>
<p class="doc-bold-label">Encourages withdrawal</p>
<p class="doc-p">Violation of Language Code results in reassessment.</p>`},
    {h:`Correction Without Damage`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Correction Without Damage</p>
<p class="doc-p">When a child misses:</p>
<p class="doc-p">Instead of:</p>
<p class="doc-p">“That’s wrong.”</p>
<p class="doc-p">Use:</p>
<p class="doc-p">“That one went left. What did you notice?”</p>
<p class="doc-p">Instead of:</p>
<p class="doc-p">“You’re doing it wrong.”</p>
<p class="doc-p">Use:</p>
<p class="doc-p">“Let’s try a different way.”</p>
<p class="doc-p">Correction should:</p>
<p class="doc-bold-label">Describe outcome (neutral)</p>
<p class="doc-bold-label">Encourage reflection</p>
<p class="doc-bold-label">Guide adjustment</p>
<p class="doc-bold-label">Reinforce effort</p>
<p class="doc-p">Language must be neutral, not emotional.</p>`},
    {h:`Handling Frustration in Real Time`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Handling Frustration in Real Time</p>
<p class="doc-p">Frustration signs:</p>
<p class="doc-bold-label">Equipment drop</p>
<p class="doc-bold-label">Crossing arms</p>
<p class="doc-bold-label">Silence</p>
<p class="doc-bold-label">“This is stupid.”</p>
<p class="doc-bold-label">Withdrawal</p>
<p class="doc-bold-label">Aggressive swing</p>
<p class="doc-p">Coach response must:</p>
<p class="doc-bold-label">1️⃣ Lower tone</p>
<div class="doc-step">2️⃣ Reduce task difficulty</div>
<div class="doc-step">3️⃣ Use effort-based praise</div>
<div class="doc-step">4️⃣ Normalize struggle</div>
<p class="doc-p">Example:</p>
<p class="doc-p">Child says:</p>
<p class="doc-p">“I’m bad at this.”</p>
<p class="doc-p">Coach:</p>
<p class="doc-p">“You’re learning this. That’s different. Let’s make it easier and try again.”</p>`},
    {h:`Effort vs Outcome Praise`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Effort vs Outcome Praise</p>
<p class="doc-p">Outcome Praise:</p>
<p class="doc-p">“Great shot!”</p>
<p class="doc-p">Effort Praise:</p>
<p class="doc-p">“You adjusted your stance — that helped.”</p>
<p class="doc-p">Effort praise builds:</p>
<p class="doc-bold-label">Process focus</p>
<p class="doc-bold-label">Resilience</p>
<p class="doc-bold-label">Self-awareness</p>
<p class="doc-p">Outcome praise builds:</p>
<p class="doc-bold-label">Performance dependency</p>
<p class="doc-bold-label">Fear of failure</p>
<p class="doc-p">Balance is critical.</p>`},
    {h:`Public vs Private Correction`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Public vs Private Correction</p>
<p class="doc-p">Never publicly shame.</p>
<p class="doc-p">If correction needed:</p>
<p class="doc-bold-label">Lower voice</p>
<p class="doc-bold-label">Step aside</p>
<p class="doc-bold-label">Keep tone calm</p>
<p class="doc-bold-label">Avoid dramatic gestures</p>
<p class="doc-p">Children are highly peer-sensitive in 6–9 stage.</p>
<p class="doc-p">Public embarrassment can reduce long-term participation.</p>`},
    {h:`The 3-Step Language Reset Rule`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The 3-Step Language Reset Rule</p>
<p class="doc-p">If a coach accidentally uses harsh language:</p>
<p class="doc-bold-label">1️⃣ Rephrase immediately</p>
<div class="doc-step">2️⃣ Model growth correction</div>
<div class="doc-step">3️⃣ Reinforce confidence</div>
<p class="doc-p">Example:</p>
<p class="doc-p">Coach says:</p>
<p class="doc-p">“No, that’s wrong.”</p>
<p class="doc-p">Immediately follows with:</p>
<p class="doc-p">“Let me rephrase — that one went left. Let’s adjust together.”</p>
<p class="doc-p">Accountability protects culture.</p>`},
    {h:`Parent Interaction Language`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Parent Interaction Language</p>
<p class="doc-p">Coaches must model growth mindset to parents.</p>
<p class="doc-p">Instead of:</p>
<p class="doc-p">“He struggles with distance.”</p>
<p class="doc-p">Say:</p>
<p class="doc-p">“He’s building distance control and improving weekly.”</p>
<p class="doc-p">Never label a child in front of parent.</p>`},
    {h:`Building Inner Voice Strength`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Building Inner Voice Strength</p>
<p class="doc-p">Children should leave sessions thinking:</p>
<p class="doc-bold-label">“I can improve.”</p>
<p class="doc-bold-label">“Mistakes are normal.”</p>
<p class="doc-bold-label">“I’m getting better.”</p>
<p class="doc-bold-label">“I can try again.”</p>
<p class="doc-p">That internal narrative lasts longer than any swing lesson.</p>
<h3 class="doc-section-title">🎯 Coach Practical Application</h3>
<p class="doc-bold-label">Exercise 1 – Frustration Role Play</p>
<p class="doc-p">Coach must respond to:</p>
<p class="doc-p">Scenario A:</p>
<p class="doc-p">Child misses 5 shots and says:</p>
<p class="doc-p">“I’m terrible.”</p>
<p class="doc-p">Scenario B:</p>
<p class="doc-p">Child loses competition and refuses to continue.</p>
<p class="doc-p">Scenario C:</p>
<p class="doc-p">Child compares self negatively to peer.</p>
<p class="doc-p">Evaluator measures:</p>
<p class="doc-bold-label">Tone control</p>
<p class="doc-bold-label">Growth language</p>
<p class="doc-bold-label">Task adjustment</p>
<p class="doc-bold-label">Emotional regulation</p>
<p class="doc-bold-label">Exercise 2 – Language Swap Drill</p>
<p class="doc-p">Coach is given 10 negative phrases.</p>
<p class="doc-p">Must convert into growth language equivalents.</p>
<p class="doc-p">Example:</p>
<p class="doc-bold-label">“Why can’t you focus?”</p>
<ul class="doc-list"><li><span class="doc-arrow">→</span> “Let’s reset and try again.”</li></ul>
<h3 class="doc-section-title">📋 Certification Assessment</h3>
<p class="doc-bold-label">Written (30%)</p>
<p class="doc-p">Possible questions:</p>
<p class="doc-p">Define growth mindset.</p>
<p class="doc-p">List 3 prohibited phrases.</p>
<p class="doc-p">Explain why outcome-only praise is risky.</p>
<p class="doc-p">Describe the 3-step language reset rule.</p>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p">Case:</p>
<p class="doc-p">Child says, “I quit.”</p>
<p class="doc-p">Coach must:</p>
<p class="doc-bold-label">Apply growth mindset language</p>
<p class="doc-bold-label">Adjust task</p>
<p class="doc-bold-label">Re-engage within 60 seconds</p>
<p class="doc-bold-label">Live Evaluation (40%)</p>
<p class="doc-p">Coach must:</p>
<p class="doc-bold-label">Run 10-minute segment</p>
<p class="doc-bold-label">Maintain approved language</p>
<p class="doc-bold-label">Avoid prohibited phrases</p>
<p class="doc-bold-label">Demonstrate effort-based praise</p>
<p class="doc-bold-label">Respond to frustration properly</p>
<p class="doc-p">Automatic reassessment if:</p>
<p class="doc-bold-label">Shaming language used</p>
<p class="doc-bold-label">Identity-based criticism</p>
<p class="doc-bold-label">Repeated harsh tone</p>
<p class="doc-bold-label">Public embarrassment behavior</p>
<h3 class="doc-section-title">✅ Pass Requirement</h3>
<p class="doc-bold-label">Minimum 85%</p>
<p class="doc-p">Language violations below safety threshold result in mandatory retraining.</p>
<h3 class="doc-section-title">💡 Final Reinforcement</h3>
<p class="doc-p">Children will forget drills.</p>
<p class="doc-p">They will forget scores.</p>
<p class="doc-p">They will not forget how you made them feel.</p>
<p class="doc-p">Your language becomes their internal coach.</p>
<p class="doc-p">EduGolfKids coaches build confidence before performance.</p>
<p class="doc-p">Growth mindset is not optional — it is cultural law.</p>`},
  ]
},
{
  id:"L1_M7",
  title:"Module 7 \u2014 60-Minute Session Architecture",
  icon:"\ud83c\udfd7\ufe0f",
  sections:[
    {h:`Module Overview &amp; Philosophy`,b:`<p class="doc-bold-label">60-Minute Session Architecture (Integrated Model)</p>
<h3 class="doc-section-title">📌 Module Purpose</h3>
<p class="doc-p">This module ensures that every EduGolfKids coach can:</p>
<p class="doc-bold-label">Deliver a structurally consistent 60-minute session</p>
<p class="doc-bold-label">Integrate ALL prior modules into every lesson</p>
<p class="doc-p">Apply development, motor learning, LTAD, growth mindset, and safety principles simultaneously</p>
<p class="doc-bold-label">Maintain rhythm, flow, and energy</p>
<p class="doc-bold-label">Protect brand integrity through structure</p>
<p class="doc-p">Core Principle:</p>
<p class="doc-p">Structure creates rhythm.</p>
<p class="doc-p">Rhythm creates learning.</p>
<p class="doc-p">Learning requires integration.</p>
<p class="doc-p">Every session must apply:</p>
<p class="doc-bold-label">Module 2 – Child Development</p>
<p class="doc-bold-label">Module 3 – Motor Learning & Constraints</p>
<p class="doc-bold-label">Module 4 – LTAD</p>
<p class="doc-bold-label">Module 5 – 21st Century Learning</p>
<p class="doc-bold-label">Module 7 – Growth Mindset Language Code</p>
<p class="doc-bold-label">Safety & spacing standards</p>
<p class="doc-p">Architecture is where theory becomes practice.</p>
<p class="doc-bold-label">THE NON-NEGOTIABLE TIME FRAME</p>
<p class="doc-p">Every session must follow:</p>
<p class="doc-bold-label">0–10: Warm-Up Game</p>
<p class="doc-p">10–30: Skill Block</p>
<p class="doc-p">30–50: Game Reinforcement</p>
<p class="doc-p">50–60: Wrap-Up & Reset</p>
<p class="doc-p">Deviation requires HQ approval.</p>`},
    {h:`Warm-Up Game (0–10 Minutes)`,b:`<p class="doc-p">INTEGRATED SESSION BREAKDOWN</p>
<p class="doc-p">Below shows exactly where each training module is practiced inside the session.</p>
<p class="doc-bold-label">0–10 Minutes</p>
<p class="doc-bold-label">WARM-UP GAME</p>
<p class="doc-p">Primary Goal:</p>
<p class="doc-bold-label">Movement activation + emotional engagement</p>
<p class="doc-p">Modules Applied Here:</p>
<p class="doc-bold-label">Module 2 – Child Development</p>
<p class="doc-bold-label">Short instructions (1-step for 4–6)</p>
<p class="doc-bold-label">Immediate participation</p>
<p class="doc-bold-label">No long explanations</p>
<p class="doc-bold-label">Movement-based learning</p>
<p class="doc-bold-label">Module 3 – Motor Learning</p>
<p class="doc-bold-label">No blocked repetition</p>
<p class="doc-bold-label">Target-based activity</p>
<p class="doc-bold-label">Environmental constraints guide behavior</p>
<p class="doc-bold-label">Module 4 – LTAD</p>
<p class="doc-bold-label">Focus on coordination and balance</p>
<p class="doc-bold-label">Not technical swing correction</p>
<p class="doc-bold-label">Module 5 – 21st Century Learning</p>
<p class="doc-bold-label">Collaboration games</p>
<p class="doc-bold-label">Communication prompts</p>
<p class="doc-bold-label">Quick reflection moments</p>
<p class="doc-bold-label">Module 7 – Growth Mindset</p>
<p class="doc-bold-label">Effort-based praise from first minute</p>
<p class="doc-bold-label">Normalize mistakes immediately</p>
<p class="doc-bold-label">Safety Standards</p>
<p class="doc-bold-label">Spacing established</p>
<p class="doc-bold-label">Retrieval protocol reinforced</p>
<p class="doc-bold-label">Foam balls only</p>
<p class="doc-p">Warm-up sets:</p>
<p class="doc-bold-label">Energy tone</p>
<p class="doc-p">Language tone</p>
<p class="doc-p">Behavior expectation</p>
<p class="doc-p">Safety expectation</p>
<p class="doc-p">If Warm-Up is weak, entire session declines.</p>`},
    {h:`Skill Block (10–30 Minutes)`,b:`<p class="doc-p">10–30 Minutes</p>
<p class="doc-bold-label">SKILL BLOCK</p>
<p class="doc-p">Primary Goal:</p>
<p class="doc-p">Introduce or refine skill through constraint variation.</p>
<p class="doc-p">Modules Applied Here:</p>
<p class="doc-bold-label">Module 3 – Motor Learning (Primary Focus)</p>
<p class="doc-bold-label">3–4 mini constraint challenges (4–6 min each)</p>
<p class="doc-bold-label">External focus cues</p>
<p class="doc-bold-label">Environmental manipulation</p>
<p class="doc-bold-label">No technical lecture</p>
<p class="doc-bold-label">Module 2 – Child Development</p>
<p class="doc-bold-label">Age-appropriate instruction length</p>
<p class="doc-bold-label">Frustration monitoring</p>
<p class="doc-bold-label">Task difficulty adjusted immediately</p>
<p class="doc-bold-label">Module 4 – LTAD</p>
<p class="doc-bold-label">Development over aesthetics</p>
<p class="doc-bold-label">No adult swing reconstruction</p>
<p class="doc-bold-label">Movement quality prioritized</p>
<p class="doc-bold-label">Module 5 – 21st Century Learning</p>
<p class="doc-bold-label">Guided discovery questions</p>
<p class="doc-bold-label">Critical thinking prompts</p>
<p class="doc-bold-label">Peer feedback allowed</p>
<p class="doc-bold-label">Module 7 – Growth Mindset</p>
<p class="doc-bold-label">Effort reinforcement</p>
<p class="doc-bold-label">Language code compliance</p>
<p class="doc-bold-label">No identity-based correction</p>
<p class="doc-bold-label">Safety</p>
<p class="doc-bold-label">6-foot spacing maintained</p>
<p class="doc-bold-label">Controlled swing zones</p>
<p class="doc-bold-label">Immediate reset commands</p>
<p class="doc-p">This is where coaches prove:</p>
<p class="doc-p">They understand learning — not just drills.</p>`},
    {h:`Game Reinforcement (30–50 Minutes)`,b:`<p class="doc-p">30–50 Minutes</p>
<p class="doc-bold-label">GAME REINFORCEMENT</p>
<p class="doc-p">Primary Goal:</p>
<p class="doc-p">Transfer skill into contextual play.</p>
<p class="doc-p">Modules Applied Here:</p>
<p class="doc-bold-label">Module 3 – Motor Learning</p>
<p class="doc-bold-label">Variable scoring</p>
<p class="doc-bold-label">Decision-making pressure</p>
<p class="doc-bold-label">Time-based challenges</p>
<p class="doc-bold-label">No blocked repetition</p>
<p class="doc-bold-label">Module 5 – 21st Century Learning</p>
<p class="doc-bold-label">Collaboration</p>
<p class="doc-bold-label">Competition with respect</p>
<p class="doc-bold-label">Reflection in action</p>
<p class="doc-bold-label">Tactical decision-making</p>
<p class="doc-bold-label">Module 2 – Child Development</p>
<p class="doc-bold-label">Challenge calibrated to age</p>
<p class="doc-bold-label">Emotional regulation monitored</p>
<p class="doc-bold-label">Frustration redirected constructively</p>
<p class="doc-bold-label">Module 4 – LTAD</p>
<p class="doc-bold-label">No overcorrection mid-game</p>
<p class="doc-bold-label">Allow natural movement adaptation</p>
<p class="doc-bold-label">Avoid performance obsession</p>
<p class="doc-bold-label">Module 7 – Growth Mindset</p>
<p class="doc-bold-label">Reframe mistakes</p>
<p class="doc-bold-label">Normalize competitive loss</p>
<p class="doc-bold-label">Praise effort, not just winners</p>
<p class="doc-bold-label">Safety</p>
<p class="doc-bold-label">Clear rotation structure</p>
<p class="doc-bold-label">Retrieval protocol enforced</p>
<p class="doc-bold-label">Energy controlled</p>
<p class="doc-p">Game Reinforcement is where:</p>
<p class="doc-bold-label">Retention strengthens</p>
<p class="doc-p">Confidence grows</p>
<p class="doc-p">Autonomy develops</p>`},
    {h:`Wrap-Up &amp; Reset (50–60 Minutes)`,b:`<p class="doc-p">50–60 Minutes</p>
<p class="doc-bold-label">WRAP-UP & RESET</p>
<p class="doc-p">Primary Goal:</p>
<p class="doc-p">Consolidate learning + emotional closure.</p>
<p class="doc-p">Modules Applied Here:</p>
<p class="doc-bold-label">Module 5 – Reflection & Metacognition</p>
<p class="doc-bold-label">“What did you notice?”</p>
<p class="doc-bold-label">“What helped you improve?”</p>
<p class="doc-bold-label">Encourage child explanation</p>
<p class="doc-bold-label">Module 7 – Growth Mindset</p>
<p class="doc-bold-label">Effort-based praise</p>
<p class="doc-bold-label">Reinforce improvement</p>
<p class="doc-bold-label">Avoid outcome-only praise</p>
<p class="doc-bold-label">Module 2 – Emotional Regulation</p>
<p class="doc-bold-label">Calm tone</p>
<p class="doc-bold-label">Structured closure</p>
<p class="doc-bold-label">Positive ending</p>
<p class="doc-bold-label">Safety Standards</p>
<p class="doc-bold-label">Clubs down before retrieval</p>
<p class="doc-bold-label">Equipment stacked</p>
<p class="doc-bold-label">Clear dismissal protocol</p>
<p class="doc-p">Children must leave:</p>
<p class="doc-bold-label">Confident</p>
<p class="doc-p">Regulated</p>
<p class="doc-p">Successful</p>
<p class="doc-p">Motivated</p>`},
    {h:`Full Integration Map &amp; Assessment`,b:`<p class="doc-p">FULL INTEGRATION MAP</p>
<div class="doc-table-wrap"><table class="doc-table"><thead><tr><th>Segment</th><th>M2 Dev</th><th>M3 Motor</th><th>M4 LTAD</th><th>M5 Learning</th><th>M7 Language</th><th>Safety</th></tr></thead><tbody><tr><td>Warm-Up</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>Skill Block</td><td>✓</td><td>✓✓✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr><tr><td>Game Reinforcement</td><td>✓</td><td>✓✓</td><td>✓</td><td>✓✓</td><td>✓</td><td>✓</td></tr><tr><td>Wrap-Up</td><td>✓</td><td>—</td><td>✓</td><td>✓✓</td><td>✓✓</td><td>✓</td></tr></tbody></table></div>
<p class="doc-p">Every session must include all modules.</p>
<p class="doc-p">If a coach delivers a technically correct drill but violates language code → failure.</p>
<p class="doc-p">If coach manages growth mindset but ignores spacing → failure.</p>
<p class="doc-p">If coach teaches skill but ignores development stage → failure.</p>
<p class="doc-p">Integration is mandatory.</p>
<h3 class="doc-section-title">🎯 Coach Practical Application</h3>
<p class="doc-bold-label">Exercise – Integrated Session Design</p>
<p class="doc-p">Coach must submit a 60-minute plan that clearly shows:</p>
<p class="doc-bold-label">Where motor learning principles are applied</p>
<p class="doc-bold-label">Where developmental adjustments occur</p>
<p class="doc-bold-label">Where growth mindset language is used</p>
<p class="doc-bold-label">Where LTAD protection is maintained</p>
<p class="doc-bold-label">Where 21st-century skills are included</p>
<p class="doc-bold-label">Where safety standards are reinforced</p>
<p class="doc-p">Session plan must annotate:</p>
<p class="doc-bold-label">“M2 Applied Here”</p>
<p class="doc-p">“M3 Applied Here”</p>
<p class="doc-p">“M7 Language Here”</p>
<p class="doc-p">No generic plans accepted.</p>
<p class="doc-bold-label">LIVE DEMONSTRATION STANDARD</p>
<p class="doc-p">Coach must:</p>
<p class="doc-bold-label">Maintain 60-minute timing discipline</p>
<p class="doc-p">Demonstrate at least:</p>
<p class="doc-bold-label">2 guided discovery questions</p>
<p class="doc-bold-label">1 constraint modification</p>
<p class="doc-bold-label">3 effort-based language statements</p>
<p class="doc-bold-label">1 reflection question</p>
<p class="doc-bold-label">Maintain spacing entire session</p>
<p class="doc-p">Failure in any integration category = reassessment.</p>
<h3 class="doc-section-title">📋 Certification Assessment</h3>
<p class="doc-bold-label">Written (30%)</p>
<p class="doc-p">Coach must:</p>
<p class="doc-p">List time structure without notes:</p>
<p class="doc-bold-label">0–10 Warm-Up</p>
<p class="doc-p">10–30 Skill Block</p>
<p class="doc-p">30–50 Game Reinforcement</p>
<p class="doc-p">50–60 Wrap-Up & Reset</p>
<p class="doc-p">AND identify which modules are applied in each segment.</p>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p">Scenario:</p>
<p class="doc-p">Coach delivers strong drills but gives harsh language.</p>
<p class="doc-p">Candidate must:</p>
<p class="doc-bold-label">Identify module violation</p>
<p class="doc-bold-label">Redesign language</p>
<p class="doc-bold-label">Maintain structure</p>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p">Coach must show:</p>
<p class="doc-bold-label">Integrated execution across all modules</p>
<p class="doc-p">Not isolated competence.</p>
<h3 class="doc-section-title">✅ Pass Requirement</h3>
<p class="doc-bold-label">Minimum 85%</p>
<p class="doc-p">Architecture mastery + integration mastery required.</p>
<h3 class="doc-section-title">💡 Final Reinforcement</h3>
<p class="doc-p">A great drill is not enough.</p>
<p class="doc-p">A positive tone is not enough.</p>
<p class="doc-p">A safe setup is not enough.</p>
<p class="doc-p">Only integration creates:</p>
<p class="doc-bold-label">Safety</p>
<p class="doc-p">Retention</p>
<p class="doc-p">Confidence</p>
<p class="doc-p">Progression</p>
<p class="doc-p">Brand consistency</p>
<p class="doc-p">EduGolfKids is not a collection of modules.</p>
<p class="doc-p">It is a unified system delivered every session.</p>`},
  ]
},
{
  id:"L1_M8",
  title:"Module 8 \u2014 Parent &amp; School Communication",
  icon:"\ud83e\udd1d",
  sections:[
    {h:`The Two Audiences: Schools and Parents`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The Two Audiences: Schools and Parents</p>
<p class="doc-p"><strong>EduGolfKids coaches operate within two distinct adult relationships simultaneously:</strong></p>
<h4 class="doc-subheading">1. The School Relationship</h4>
<p class="doc-p"><strong>Schools are institutional partners. They grant access to their students, facilities, and scheduling.</strong></p>
<p class="doc-p"><strong>Every coach represents EduGolfKids as a professional vendor within a school environment.</strong></p>
<p class="doc-p"><strong>Schools expect:</strong></p>
<ul class="doc-list"><li>Punctuality and professionalism</li></ul>
<ul class="doc-list"><li>Minimal disruption to school operations</li></ul>
<ul class="doc-list"><li>Clear communication and advance notice of any changes</li></ul>
<ul class="doc-list"><li>Compliance with all school policies and protocols</li></ul>
<ul class="doc-list"><li>Visible safeguarding standards</li></ul>
<h4 class="doc-subheading">2. The Parent Relationship</h4>
<p class="doc-p"><strong>Parents are the customers and the advocates. Their satisfaction drives enrollment, retention, and referrals.</strong></p>
<p class="doc-p"><strong>Parents expect:</strong></p>
<ul class="doc-list"><li>To understand what their child is learning</li></ul>
<ul class="doc-list"><li>To feel their child is safe and valued</li></ul>
<ul class="doc-list"><li>To receive honest, positive progress communication</li></ul>
<ul class="doc-list"><li>To be heard when they have concerns</li></ul>
<ul class="doc-list"><li>To trust the program with their child</li></ul>`},
    {h:`School Communication Standards`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">School Communication Standards</p>
<p class="doc-bold-label">Pre-Program Requirements</p>
<p class="doc-p"><strong>Before the first session at any school, coaches must:</strong></p>
<ul class="doc-list"><li>Introduce themselves formally to the school coordinator or principal</li></ul>
<ul class="doc-list"><li>Review site-specific protocols (check-in procedures, emergency contacts, parking)</li></ul>
<ul class="doc-list"><li>Confirm lesson location, access routes, and equipment storage</li></ul>
<ul class="doc-list"><li>Confirm student pickup and drop-off procedures</li></ul>
<ul class="doc-list"><li>Obtain emergency contact information for the site</li></ul>
<p class="doc-bold-label">During the Program</p>
<p class="doc-p"><strong>Coaches must:</strong></p>
<ul class="doc-list"><li>Sign in at the front office upon every arrival — no exceptions</li></ul>
<ul class="doc-list"><li>Notify school staff immediately of any incident, injury, or behavioral concern</li></ul>
<ul class="doc-list"><li>Avoid scheduling conversations during active lesson time</li></ul>
<ul class="doc-list"><li>Respond to school communication within 24 hours</li></ul>
<ul class="doc-list"><li>Never speak negatively about the school, its staff, or its policies to parents</li></ul>
<p class="doc-bold-label">Communication Tone with School Staff</p>
<p class="doc-p"><strong>Always:</strong></p>
<ul class="doc-list"><li>Be respectful, brief, and solution-focused</li></ul>
<ul class="doc-list"><li>Thank staff for their support and cooperation</li></ul>
<ul class="doc-list"><li>Confirm any changes to schedule or location in writing</li></ul>
<p class="doc-p"><strong>Never:</strong></p>
<ul class="doc-list"><li>Go around the school coordinator to speak directly with a teacher about a concern</li></ul>
<ul class="doc-list"><li>Make verbal agreements that bypass the official program structure</li></ul>
<ul class="doc-list"><li>Discuss student behavioral issues in hallways or public spaces</li></ul>`},
    {h:`Parent Communication: Program Launch`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Parent Communication: Program Launch</p>
<p class="doc-p"><strong>Before the first session, parents must receive:</strong></p>
<ul class="doc-list"><li>Program overview (what EduGolfKids is, what children will learn)</li></ul>
<ul class="doc-list"><li>Session schedule (day, time, location, duration)</li></ul>
<ul class="doc-list"><li>Drop-off and pick-up instructions</li></ul>
<ul class="doc-list"><li>What to bring (appropriate footwear, water bottle)</li></ul>
<ul class="doc-list"><li>Coach name and contact method (via approved EduGolfKids channel only)</li></ul>
<ul class="doc-list"><li>Safeguarding and photo/video consent confirmation</li></ul>
<p class="doc-p"><strong>Welcome Communication Language Example:</strong></p>
<p class="doc-p"><strong>"Welcome to EduGolfKids! Your child is about to begin a structured developmental program that builds movement skills, confidence, and critical thinking through golf. Our certified coaches follow an evidence-based curriculum designed specifically for ages 4-10. Sessions are 60 minutes and follow a consistent structure every week. If you have any questions, please reach out through [approved channel]."</strong></p>`},
    {h:`Progress Communication Standards`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Progress Communication Standards</p>
<p class="doc-p"><strong>Parents want to know their child is progressing.</strong></p>
<p class="doc-p"><strong>Coaches must provide regular, positive, developmentally framed updates.</strong></p>
<p class="doc-p"><strong>What to Communicate:</strong></p>
<ul class="doc-list"><li>What skill or concept the group is working on this week</li></ul>
<ul class="doc-list"><li>Specific positive observations about the child's engagement or effort</li></ul>
<ul class="doc-list"><li>How the child can practice or explore at home (optional reinforcement)</li></ul>
<p class="doc-p"><strong>What NOT to Communicate:</strong></p>
<ul class="doc-list"><li>Comparisons to other children</li></ul>
<ul class="doc-list"><li>Negative ability assessments ("He struggles with...")</li></ul>
<ul class="doc-list"><li>Predictions about future performance</li></ul>
<ul class="doc-list"><li>Technical critiques framed as problems</li></ul>
<p class="doc-p"><strong>Growth Language for Parent Feedback:</strong></p>
<p class="doc-bold-label">Instead of: "She is behind the group in putting control."</p>
<p class="doc-p"><strong>Say: "She is developing her putting feel and is showing good focus. We are working on a great constraint challenge that will accelerate this."</strong></p>
<p class="doc-bold-label">Instead of: "He has trouble listening."</p>
<p class="doc-p"><strong>Say: "He brings lots of energy — we channel that well. He is responding really well to the game-based activities."</strong></p>
<p class="doc-p"><strong>Language must be honest, positive, and development-framed at all times.</strong></p>`},
    {h:`Handling Difficult Parent Conversations`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Handling Difficult Parent Conversations</p>
<p class="doc-p"><strong>EduGolfKids coaches will inevitably encounter parents with concerns, complaints, or disagreements.</strong></p>
<p class="doc-p"><strong>How you handle these moments defines your professionalism and protects the program.</strong></p>
<p class="doc-p"><strong>The 4-Step Response Protocol:</strong></p>
<h4 class="doc-subheading">1. Listen First</h4>
<p class="doc-p"><strong>Allow the parent to fully express their concern without interruption.</strong></p>
<p class="doc-p"><strong>Do not become defensive. Do not justify immediately.</strong></p>
<h4 class="doc-subheading">2. Acknowledge</h4>
<p class="doc-bold-label">"I understand your concern and I appreciate you bringing this to me."</p>
<p class="doc-p"><strong>Acknowledgment is not agreement. It is professional respect.</strong></p>
<h4 class="doc-subheading">3. Clarify and Explain</h4>
<p class="doc-p"><strong>Once the parent has been heard, explain the EduGolfKids approach clearly.</strong></p>
<p class="doc-p"><strong>Use developmental reasoning, not personal opinion.</strong></p>
<p class="doc-p"><strong>Example: Parent says: "You're not teaching proper golf technique — my son needs to fix his swing."</strong></p>
<p class="doc-p"><strong>Coach response: "That's a great point to raise. Our Level 1 program is specifically designed around Long-Term Athlete Development science. At this age, technical swing reconstruction actually reduces long-term potential. We focus on movement literacy and confidence now, which gives children the best foundation for technique development in later stages. We follow the same framework used by leading youth sport organizations."</strong></p>
<h4 class="doc-subheading">4. Escalate When Appropriate</h4>
<p class="doc-p"><strong>If the parent remains unsatisfied or the issue is beyond your authority:</strong></p>
<ul class="doc-list"><li>Do not argue or escalate emotionally</li></ul>
<ul class="doc-list"><li>Acknowledge their concern again</li></ul>
<ul class="doc-list"><li>Advise that you will connect them with the EduGolfKids program manager</li></ul>
<ul class="doc-list"><li>Never make promises you cannot keep</li></ul>
<p class="doc-p"><strong>Situations Requiring Immediate Escalation to HQ:</strong></p>
<ul class="doc-list"><li>Allegations of misconduct</li></ul>
<ul class="doc-list"><li>Demands for refunds or program exits</li></ul>
<ul class="doc-list"><li>Threats or aggressive behavior</li></ul>
<ul class="doc-list"><li>Safeguarding concerns about another adult</li></ul>`},
    {h:`Social Media and Digital Communication Policy`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Social Media and Digital Communication Policy</p>
<p class="doc-p"><strong>Coaches must:</strong></p>
<ul class="doc-list"><li>Use only approved EduGolfKids communication channels for parent contact</li></ul>
<ul class="doc-list"><li>Never connect with parents or students on personal social media accounts</li></ul>
<ul class="doc-list"><li>Never share photos or videos of children without verified parental consent</li></ul>
<ul class="doc-list"><li>Never discuss student progress or behavior in group chat formats</li></ul>
<ul class="doc-list"><li>Direct all digital communication through the official EduGolfKids system</li></ul>
<p class="doc-p"><strong>Violations of digital communication policy are grounds for immediate certification suspension.</strong></p>
<h3 class="doc-section-title">🎯 Coach Practical Application</h3>
<p class="doc-bold-label">Exercise 1 — Difficult Parent Scenario Role Play</p>
<p class="doc-p"><strong>Scenario A: A parent approaches after a session and says: "My daughter cried on the way home. She said you ignored her today."</strong></p>
<p class="doc-p"><strong>Coach must: Listen, acknowledge, investigate, explain, and respond professionally without being defensive.</strong></p>
<p class="doc-p"><strong>Scenario B: A parent asks why their child has not been given individual feedback on their swing.</strong></p>
<p class="doc-p"><strong>Coach must: Explain the group developmental model and LTAD reasoning in accessible, non-jargon language.</strong></p>
<p class="doc-bold-label">Exercise 2 — Parent Welcome Communication Draft</p>
<p class="doc-p"><strong>Coach must write a pre-program welcome message to parents that:</strong></p>
<ul class="doc-list"><li>Explains the EduGolfKids philosophy in simple language</li></ul>
<ul class="doc-list"><li>Sets expectations for the session format</li></ul>
<ul class="doc-list"><li>Uses growth mindset framing throughout</li></ul>
<ul class="doc-list"><li>Is warm, professional, and brand-consistent</li></ul>
<h3 class="doc-section-title">📋 Certification Assessment</h3>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>List 3 things parents must be informed of before the first session.</li></ul>
<ul class="doc-list"><li>Describe the 4-step difficult parent response protocol.</li></ul>
<ul class="doc-list"><li>Rewrite a negative parent feedback statement using growth language.</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>Coach is given a challenging parent interaction scenario and must demonstrate appropriate response.</strong></p>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p"><strong>Coach participates in a live role play parent interaction covering:</strong></p>
<ul class="doc-list"><li>Welcome communication delivery</li></ul>
<ul class="doc-list"><li>Handling a concern professionally</li></ul>
<ul class="doc-list"><li>Escalation decision-making</li></ul>
<p class="doc-p"><strong>Automatic reassessment if:</strong></p>
<ul class="doc-list"><li>Coach becomes defensive or argumentative</li></ul>
<ul class="doc-list"><li>Negative child labeling used</li></ul>
<ul class="doc-list"><li>Unapproved digital communication methods referenced</li></ul>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>
<h3 class="doc-section-title">💡 Final Reinforcement</h3>
<p class="doc-p"><strong>Parents do not just enroll their child in a program.</strong></p>
<p class="doc-p"><strong>They place their trust in a coach.</strong></p>
<p class="doc-p"><strong>Every communication you have — before, during, and after sessions — either builds or erodes that trust.</strong></p>
<p class="doc-p"><strong>Professional communication is non-negotiable.</strong></p>
<p class="doc-p"><strong>It is part of your certification.</strong></p>`},
  ]
},
{
  id:"L1_M9",
  title:"Module 9 \u2014 Group Management",
  icon:"\ud83d\udc65",
  sections:[
    {h:`Why Group Management Matters`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Why Group Management Matters</p>
<p class="doc-p"><strong>In a school-based program, coaches are not just instructors — they are temporary classroom managers.</strong></p>
<p class="doc-p"><strong>Children arrive from classrooms with existing energy levels, social dynamics, and behavioral patterns.</strong></p>
<p class="doc-p"><strong>Without strong group management:</strong></p>
<ul class="doc-list"><li>Safety protocols break down</li></ul>
<ul class="doc-list"><li>Engagement collapses</li></ul>
<ul class="doc-list"><li>Individual children dominate or disengage</li></ul>
<ul class="doc-list"><li>Learning stops</li></ul>
<ul class="doc-list"><li>Incidents increase</li></ul>
<p class="doc-p"><strong>Strong group management creates:</strong></p>
<ul class="doc-list"><li>Predictable, safe learning environments</li></ul>
<ul class="doc-list"><li>High participation rates</li></ul>
<ul class="doc-list"><li>Reduced behavioral disruption</li></ul>
<ul class="doc-list"><li>Consistent skill development</li></ul>
<ul class="doc-list"><li>Positive session culture</li></ul>`},
    {h:`Establishing Authority Through Structure`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Establishing Authority Through Structure</p>
<p class="doc-p"><strong>Authority is not established through volume or dominance.</strong></p>
<p class="doc-p"><strong>It is established through consistency, clarity, and calm confidence.</strong></p>
<p class="doc-p"><strong>The Three Foundations of Coach Authority:</strong></p>
<h4 class="doc-subheading">1. Predictable Routine</h4>
<p class="doc-p"><strong>Children respond to predictability. When they know what to expect, anxiety drops and compliance increases.</strong></p>
<p class="doc-p"><strong>Every session must start, transition, and end in exactly the same way.</strong></p>
<p class="doc-p"><strong>Opening Routine (First 90 Seconds):</strong></p>
<ul class="doc-list"><li>Children arrive and stand behind designated line or cones</li></ul>
<ul class="doc-list"><li>Coach greets group by name — builds connection and takes visual attendance</li></ul>
<ul class="doc-list"><li>Coach states session theme in one sentence using child language</li></ul>
<ul class="doc-list"><li>Coach reviews one safety rule (rotate the rule weekly)</li></ul>
<ul class="doc-list"><li>Warm-up game is introduced immediately — no waiting</li></ul>
<h4 class="doc-subheading">2. Clear Signals and Commands</h4>
<p class="doc-p"><strong>EduGolfKids coaches must establish and consistently use standard verbal commands.</strong></p>
<p class="doc-p"><strong>Required Standard Commands:</strong></p>
<ul class="doc-list"><li>"FREEZE" — All movement stops immediately. Clubs on ground.</li></ul>
<ul class="doc-list"><li>"RESET" — Return to starting position. No club in hand.</li></ul>
<ul class="doc-list"><li>"RETRIEVE" — Walk (do not run) to collect balls. Clubs down first.</li></ul>
<ul class="doc-list"><li>"ROTATE" — Move to next station. Follow direction indicated.</li></ul>
<ul class="doc-list"><li>"EYES ON ME" — Stop, look at coach, listening position.</li></ul>
<p class="doc-p"><strong>Commands must be practiced in the first session of every new group.</strong></p>
<p class="doc-p"><strong>Never assume children from different schools have been trained on the same commands.</strong></p>
<h4 class="doc-subheading">3. Consistent Consequences</h4>
<p class="doc-p"><strong>Children must understand that rules apply equally to everyone, every time.</strong></p>
<p class="doc-p"><strong>Inconsistent enforcement is the fastest way to lose group control.</strong></p>`},
    {h:`The Behavior Management Ladder`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The Behavior Management Ladder</p>
<p class="doc-p"><strong>EduGolfKids uses a 5-step escalation model. Always begin at Step 1.</strong></p>
<p class="doc-bold-label">Step 1: Environmental Adjustment</p>
<p class="doc-p"><strong>Before addressing behavior directly, adjust the environment.</strong></p>
<p class="doc-p"><strong>Many disruptive behaviors are caused by:</strong></p>
<ul class="doc-list"><li>Too much wait time</li></ul>
<ul class="doc-list"><li>Task that is too hard or too easy</li></ul>
<ul class="doc-list"><li>Poor spacing creating crowding</li></ul>
<ul class="doc-list"><li>Overstimulation from too many instructions</li></ul>
<p class="doc-p"><strong>Fix the environment first. Most disruption disappears.</strong></p>
<p class="doc-bold-label">Step 2: Proximity and Non-Verbal Cue</p>
<p class="doc-p"><strong>Move physically closer to the disruptive child.</strong></p>
<p class="doc-p"><strong>Use eye contact and a calm nod or gesture.</strong></p>
<p class="doc-p"><strong>Do not call out the child publicly.</strong></p>
<p class="doc-p"><strong>Many children self-correct with proximity alone.</strong></p>
<p class="doc-bold-label">Step 3: Private Verbal Redirect</p>
<p class="doc-p"><strong>Crouch to the child's level. Speak quietly — not in front of the group.</strong></p>
<p class="doc-bold-label">"Hey, I need you to [specific behavior]. You can do that — let's keep going."</p>
<p class="doc-p"><strong>Describe the desired behavior, not the problem behavior.</strong></p>
<p class="doc-bold-label">Step 4: Choice and Consequence</p>
<p class="doc-p"><strong>If the behavior continues after Steps 1-3:</strong></p>
<p class="doc-p"><strong>"I need you to [behavior]. If you continue, you will take a 2-minute break from the activity. It's your choice."</strong></p>
<p class="doc-p"><strong>This maintains dignity and gives the child agency.</strong></p>
<p class="doc-bold-label">Step 5: Removal and Documentation</p>
<p class="doc-p"><strong>If behavior continues or poses a safety risk:</strong></p>
<ul class="doc-list"><li>Remove child to a supervised seated area — never unsupervised</li></ul>
<ul class="doc-list"><li>Notify school staff immediately</li></ul>
<ul class="doc-list"><li>Document the incident within 24 hours per incident reporting protocol</li></ul>
<ul class="doc-list"><li>Contact parent via approved channel after the session</li></ul>
<p class="doc-p"><strong>Physical restraint is NEVER permitted under any circumstance.</strong></p>
<p class="doc-p"><strong>If a child poses immediate physical danger, activate the school Emergency Action Plan immediately.</strong></p>`},
    {h:`Managing Common Group Scenarios`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Managing Common Group Scenarios</p>
<p class="doc-bold-label">Scenario 1: Children arrive chaotic and over-energized</p>
<p class="doc-p"><strong>Solution: Do NOT try to calm with instructions. Channel the energy.</strong></p>
<ul class="doc-list"><li>Begin the warm-up game immediately</li></ul>
<ul class="doc-list"><li>Use a high-energy, structured activity with clear roles</li></ul>
<ul class="doc-list"><li>Establish commands within the first 3 minutes of the game</li></ul>
<ul class="doc-list"><li>Energy will regulate naturally within 5-7 minutes of structured movement</li></ul>
<p class="doc-bold-label">Scenario 2: One child dominates, others disengage</p>
<p class="doc-p"><strong>Solution: Structural fix — not behavioral correction.</strong></p>
<ul class="doc-list"><li>Redesign activity to remove single-winner format</li></ul>
<ul class="doc-list"><li>Assign specific roles to quieter children (scorekeeper, cone placer)</li></ul>
<ul class="doc-list"><li>Use team formats that spread involvement</li></ul>
<ul class="doc-list"><li>Privately acknowledge the dominant child's energy positively and redirect: "I need your leadership skills to help the team."</li></ul>
<p class="doc-bold-label">Scenario 3: Child refuses to participate</p>
<p class="doc-p"><strong>Do not force participation. Forcing increases resistance.</strong></p>
<ul class="doc-list"><li>Acknowledge without pressure: "That's okay — you can watch for now."</li></ul>
<ul class="doc-list"><li>Reduce task difficulty and re-invite in 2-3 minutes</li></ul>
<ul class="doc-list"><li>Use a peer invitation: "Can you show [child] how it works?"</li></ul>
<ul class="doc-list"><li>If persistent refusal, check for frustration, fatigue, or emotional distress</li></ul>
<p class="doc-bold-label">Scenario 4: Physical altercation or aggressive behavior between children</p>
<ul class="doc-list"><li>Immediately use FREEZE command for entire group</li></ul>
<ul class="doc-list"><li>Position yourself between the children — do not touch unless safety requires</li></ul>
<ul class="doc-list"><li>Redirect the group to a safe task</li></ul>
<ul class="doc-list"><li>Separate involved children to supervised areas</li></ul>
<ul class="doc-list"><li>Notify school staff immediately</li></ul>
<ul class="doc-list"><li>Document within 24 hours</li></ul>
<p class="doc-bold-label">Scenario 5: A child becomes emotionally distressed or cries</p>
<ul class="doc-list"><li>Lower your voice and physically crouch to child's level</li></ul>
<ul class="doc-list"><li>Do not rush the child or create time pressure</li></ul>
<ul class="doc-list"><li>"It's okay to feel frustrated. Take a moment."</li></ul>
<ul class="doc-list"><li>Do not call attention from the group</li></ul>
<ul class="doc-list"><li>Allow child to re-enter when ready — never pressure re-entry</li></ul>
<ul class="doc-list"><li>If distress is prolonged or concerning, notify school staff</li></ul>`},
    {h:`Transitions: The Highest Risk Moments`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Transitions: The Highest Risk Moments</p>
<p class="doc-p"><strong>Behavioral problems most commonly occur during transitions:</strong></p>
<ul class="doc-list"><li>Moving between warm-up and skill block</li></ul>
<ul class="doc-list"><li>Rotating between stations</li></ul>
<ul class="doc-list"><li>Ball retrieval</li></ul>
<ul class="doc-list"><li>Moving from session area to return to classroom</li></ul>
<p class="doc-p"><strong>Transition Protocol:</strong></p>
<ul class="doc-list"><li>Use FREEZE command before every transition</li></ul>
<ul class="doc-list"><li>Give one clear instruction for the transition: "In 10 seconds, we are rotating to the red cones."</li></ul>
<ul class="doc-list"><li>Count down out loud: "10... 5... 3... 2... 1... ROTATE."</li></ul>
<ul class="doc-list"><li>Walk — never allow running during transitions</li></ul>
<ul class="doc-list"><li>Verify all children have arrived at new station before resuming</li></ul>
<p class="doc-p"><strong>Sloppy transitions cost 5-10 minutes of session time and elevate injury risk significantly.</strong></p>`},
    {h:`Attention Management Techniques`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Attention Management Techniques</p>
<p class="doc-p"><strong>EduGolfKids coaches must maintain group attention without relying on shouting.</strong></p>
<p class="doc-p"><strong>Proven Techniques:</strong></p>
<p class="doc-bold-label">Call and Response</p>
<p class="doc-p"><strong>Train the group in a call-and-response signal in the first session.</strong></p>
<p class="doc-bold-label">Example: Coach calls "Golf time!" — children respond "Focus time!"</p>
<p class="doc-p"><strong>Use consistently. Children learn rapidly and enjoy the ritual.</strong></p>
<p class="doc-bold-label">Countdown Method</p>
<p class="doc-bold-label">"I need everyone ready in 5... 4... 3... 2... 1."</p>
<p class="doc-p"><strong>Spoken calmly — never as a threat. Works consistently across all age groups.</strong></p>
<p class="doc-bold-label">Whisper Technique</p>
<p class="doc-p"><strong>When the group is loud, lower your voice rather than raise it.</strong></p>
<p class="doc-p"><strong>Children instinctively quiet to hear. Effective and models emotional regulation.</strong></p>
<p class="doc-bold-label">The Pause</p>
<p class="doc-p"><strong>Stop all instruction. Stand still. Make eye contact. Wait.</strong></p>
<p class="doc-p"><strong>Silence draws attention faster than volume.</strong></p>`},
    {h:`Bathroom and Water Break Protocol`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Bathroom and Water Break Protocol</p>
<p class="doc-p"><strong>These are high-vulnerability moments for supervision lapses.</strong></p>
<p class="doc-p"><strong>Water Breaks:</strong></p>
<ul class="doc-list"><li>Scheduled — not on demand during skill activities</li></ul>
<ul class="doc-list"><li>Entire group breaks together</li></ul>
<ul class="doc-list"><li>Coach remains in active supervision position</li></ul>
<ul class="doc-list"><li>No club handling during water break</li></ul>
<p class="doc-p"><strong>Bathroom Requests:</strong></p>
<ul class="doc-list"><li>Child must request directly to coach</li></ul>
<ul class="doc-list"><li>Coach must notify school staff — a child never walks to the bathroom alone</li></ul>
<ul class="doc-list"><li>A school staff member or teacher escorts the child</li></ul>
<ul class="doc-list"><li>Coach never escorts a child to the bathroom alone</li></ul>
<ul class="doc-list"><li>If school staff unavailable, session is paused and EAP protocol consulted</li></ul>
<p class="doc-p"><strong>Zero-Unsupervised-Child Standard applies to bathroom and water break situations.</strong></p>
<h3 class="doc-section-title">🎯 Coach Practical Application</h3>
<p class="doc-bold-label">Exercise 1 — Command Establishment Drill</p>
<p class="doc-p"><strong>Coach must successfully train a simulated group on all 5 standard commands within 5 minutes.</strong></p>
<p class="doc-p"><strong>Evaluator measures: Clarity of command, group compliance rate, calm authority tone.</strong></p>
<p class="doc-bold-label">Exercise 2 — Behavior Scenario Response</p>
<p class="doc-p"><strong>Coach is given 3 behavioral scenarios and must demonstrate the correct ladder step response for each.</strong></p>
<p class="doc-bold-label">Exercise 3 — Transition Management</p>
<p class="doc-p"><strong>Coach must execute a full station rotation with a simulated group of 8 children.</strong></p>
<p class="doc-p"><strong>Evaluator measures: Use of FREEZE, count-down, walking only, full group accountability before resuming.</strong></p>
<h3 class="doc-section-title">📋 Certification Assessment</h3>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>List the 5 standard EduGolfKids commands and when each is used.</li></ul>
<ul class="doc-list"><li>Describe the 5-step Behavior Management Ladder.</li></ul>
<ul class="doc-list"><li>Explain why transitions are high-risk moments.</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>Coach is given a written group management scenario and must identify the correct ladder step and response.</strong></p>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p"><strong>Coach must manage a simulated group of 8 through a 15-minute session segment, demonstrating:</strong></p>
<ul class="doc-list"><li>Command establishment</li></ul>
<ul class="doc-list"><li>At least one behavior redirect using the ladder</li></ul>
<ul class="doc-list"><li>Full transition protocol</li></ul>
<ul class="doc-list"><li>Consistent calm authority tone</li></ul>
<p class="doc-p"><strong>Automatic reassessment if:</strong></p>
<ul class="doc-list"><li>Shouting or aggressive tone used</li></ul>
<ul class="doc-list"><li>Child left unsupervised during transition or bathroom request</li></ul>
<ul class="doc-list"><li>Physical contact used as behavioral control</li></ul>
<ul class="doc-list"><li>Public shaming or humiliation</li></ul>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>
<h3 class="doc-section-title">💡 Final Reinforcement</h3>
<p class="doc-p"><strong>The best coaches are not the loudest coaches.</strong></p>
<p class="doc-p"><strong>They are the most consistent, the most calm, and the most structured.</strong></p>
<p class="doc-p"><strong>When children know what to expect, they behave accordingly.</strong></p>
<p class="doc-p"><strong>Build the environment. Train the commands. Hold the structure.</strong></p>
<p class="doc-p"><strong>Group management is not control — it is engineering conditions for learning.</strong></p>`},
  ]
},
{
  id:"L1_M10",
  title:"Module 10 \u2014 Medical, Special Needs &amp; Inclusion",
  icon:"\u2764\ufe0f",
  sections:[
    {h:`Legal Framework (United States)`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Legal Framework (United States)</p>
<p class="doc-p"><strong>EduGolfKids programs operating within school environments are subject to federal law.</strong></p>
<p class="doc-p"><strong>Coaches must understand the following frameworks:</strong></p>
<p class="doc-bold-label">Americans with Disabilities Act (ADA)</p>
<p class="doc-p"><strong>Requires reasonable accommodations for children with disabilities.</strong></p>
<p class="doc-p"><strong>Coaches may not exclude a child solely on the basis of a disability.</strong></p>
<p class="doc-p"><strong>Reasonable modifications to tasks, equipment, and session structure are required.</strong></p>
<p class="doc-bold-label">Section 504 (Rehabilitation Act)</p>
<p class="doc-p"><strong>Children in schools with a 504 Plan have documented accommodations.</strong></p>
<p class="doc-p"><strong>Coaches must request and review any 504 Plan relevant to a participating child.</strong></p>
<p class="doc-p"><strong>Coaches do not write 504 Plans — but they must honor them.</strong></p>
<p class="doc-bold-label">Title IX (Education Amendments Act)</p>
<p class="doc-p"><strong>Prohibits discrimination based on sex in any education program receiving federal funding.</strong></p>
<p class="doc-p"><strong>All EduGolfKids sessions must be equally accessible regardless of gender.</strong></p>
<p class="doc-bold-label">IDEA (Individuals with Disabilities Education Act)</p>
<p class="doc-p"><strong>Some children in your sessions may have an IEP (Individualized Education Program).</strong></p>
<p class="doc-p"><strong>Coaches are not IEP implementers but must be aware of documented behavioral and learning supports.</strong></p>
<p class="doc-p"><strong>Consult with school staff before the program begins if IEP-enrolled children are participating.</strong></p>
<p class="doc-p"><strong>When in doubt about legal obligations, contact EduGolfKids HQ before the program launches.</strong></p>`},
    {h:`Pre-Program Medical & Needs Screening`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Pre-Program Medical & Needs Screening</p>
<p class="doc-p"><strong>Before the first session, coaches must review registration information for:</strong></p>
<ul class="doc-list"><li>Documented medical conditions (asthma, epilepsy, diabetes, heart conditions, severe allergies)</li></ul>
<ul class="doc-list"><li>Physical limitations or mobility considerations</li></ul>
<ul class="doc-list"><li>Behavioral diagnoses (ADHD, autism spectrum, anxiety disorders)</li></ul>
<ul class="doc-list"><li>Sensory processing sensitivities</li></ul>
<ul class="doc-list"><li>IEP or 504 Plan status</li></ul>
<p class="doc-p"><strong>If a child has a documented medical condition:</strong></p>
<ul class="doc-list"><li>Verify emergency medication location and administration protocol with school nurse</li></ul>
<ul class="doc-list"><li>Know the child's specific triggers and warning signs</li></ul>
<ul class="doc-list"><li>Know the response procedure if a medical event occurs</li></ul>
<ul class="doc-list"><li>Ensure this information is in the coach's EAP card</li></ul>
<p class="doc-p"><strong>Coaches do not diagnose or assess medical conditions.</strong></p>
<p class="doc-p"><strong>Coaches prepare and respond — they do not diagnose.</strong></p>`},
    {h:`Common Medical Situations and Response Protocol`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Common Medical Situations and Response Protocol</p>
<p class="doc-bold-label">Asthma Attack</p>
<p class="doc-p"><strong>Signs: Wheezing, shortness of breath, chest tightness, coughing, inability to speak full sentences.</strong></p>
<p class="doc-p"><strong>Response:</strong></p>
<ul class="doc-list"><li>Stop activity immediately. Sit child in upright position.</li></ul>
<ul class="doc-list"><li>Retrieve child's inhaler if prescribed — coach does NOT administer unless trained</li></ul>
<ul class="doc-list"><li>Call school nurse immediately</li></ul>
<ul class="doc-list"><li>If symptoms worsen or child cannot breathe — call 911</li></ul>
<ul class="doc-list"><li>Stay with child. Document incident.</li></ul>
<p class="doc-bold-label">Diabetic Emergency (Hypoglycemia — Low Blood Sugar)</p>
<p class="doc-p"><strong>Signs: Dizziness, shaking, confusion, pale skin, sudden fatigue, sweating.</strong></p>
<p class="doc-p"><strong>Response:</strong></p>
<ul class="doc-list"><li>Stop activity immediately</li></ul>
<ul class="doc-list"><li>If child is conscious — provide glucose source per school nurse guidance</li></ul>
<ul class="doc-list"><li>Call school nurse immediately</li></ul>
<ul class="doc-list"><li>Do not leave child unattended</li></ul>
<ul class="doc-list"><li>If unconscious or unresponsive — call 911 immediately</li></ul>
<p class="doc-bold-label">Seizure</p>
<p class="doc-p"><strong>Signs: Uncontrolled shaking, loss of consciousness, staring episode, confusion.</strong></p>
<p class="doc-p"><strong>Response:</strong></p>
<ul class="doc-list"><li>Protect child from injury — clear area, do not restrain</li></ul>
<ul class="doc-list"><li>Do NOT put anything in the child's mouth</li></ul>
<ul class="doc-list"><li>Call 911 and school nurse simultaneously</li></ul>
<ul class="doc-list"><li>Time the seizure — report duration to medical personnel</li></ul>
<ul class="doc-list"><li>Place in recovery position after shaking stops if trained to do so</li></ul>
<ul class="doc-list"><li>Stay with child. Never leave.</li></ul>
<p class="doc-bold-label">Allergic Reaction / Anaphylaxis</p>
<p class="doc-p"><strong>Signs: Hives, swelling (lips, throat, face), difficulty breathing, vomiting.</strong></p>
<p class="doc-p"><strong>Response:</strong></p>
<ul class="doc-list"><li>Call 911 immediately for any respiratory symptoms</li></ul>
<ul class="doc-list"><li>Locate EpiPen if prescribed — school nurse administers</li></ul>
<ul class="doc-list"><li>Do not give food or liquid</li></ul>
<ul class="doc-list"><li>Keep child calm and seated upright</li></ul>
<p class="doc-bold-label">Head Injury</p>
<p class="doc-p"><strong>Signs: Any direct impact to head during session — regardless of apparent severity.</strong></p>
<p class="doc-p"><strong>Response:</strong></p>
<ul class="doc-list"><li>Stop activity immediately for the affected child</li></ul>
<ul class="doc-list"><li>Do NOT allow child to return to activity that day — zero-tolerance concussion protocol</li></ul>
<ul class="doc-list"><li>Notify school nurse</li></ul>
<ul class="doc-list"><li>Contact parent same day</li></ul>
<ul class="doc-list"><li>Document incident within 24 hours</li></ul>
<ul class="doc-list"><li>Medical clearance required before return to EduGolfKids sessions</li></ul>
<p class="doc-bold-label">Heat-Related Illness (Outdoor Sessions)</p>
<p class="doc-p"><strong>Signs: Heavy sweating, dizziness, nausea, cool pale skin, weakness.</strong></p>
<p class="doc-p"><strong>Response:</strong></p>
<ul class="doc-list"><li>Move child to shade or cool area immediately</li></ul>
<ul class="doc-list"><li>Provide water — small, frequent sips</li></ul>
<ul class="doc-list"><li>Call nurse if symptoms persist beyond 5 minutes</li></ul>
<ul class="doc-list"><li>Modify or end outdoor session if heat index exceeds safe threshold</li></ul>`},
    {h:`Coaching Children with ADHD`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Coaching Children with ADHD</p>
<p class="doc-p"><strong>ADHD (Attention Deficit Hyperactivity Disorder) is the most commonly encountered neurodevelopmental condition in youth sport settings.</strong></p>
<p class="doc-p"><strong>What to expect:</strong></p>
<ul class="doc-list"><li>Difficulty sustaining attention beyond 5-8 minutes on one task</li></ul>
<ul class="doc-list"><li>Impulsive movement and verbal outbursts</li></ul>
<ul class="doc-list"><li>Difficulty waiting for turns</li></ul>
<ul class="doc-list"><li>High physical energy and restlessness</li></ul>
<ul class="doc-list"><li>Emotional dysregulation — frustration escalates faster</li></ul>
<p class="doc-p"><strong>What EduGolfKids structure already does well for ADHD:</strong></p>
<ul class="doc-list"><li>Short task rotations every 4-5 minutes — ideal for attention management</li></ul>
<ul class="doc-list"><li>High movement content — channels hyperactive energy</li></ul>
<ul class="doc-list"><li>Clear commands and predictable structure — reduces anxiety</li></ul>
<ul class="doc-list"><li>Game-based learning — sustains engagement longer than instruction</li></ul>
<p class="doc-p"><strong>Additional coaching adjustments for ADHD:</strong></p>
<ul class="doc-list"><li>Position the child close to the coach at the start of each segment</li></ul>
<ul class="doc-list"><li>Give instructions one step at a time — not multi-part</li></ul>
<ul class="doc-list"><li>Use the child's name before giving them a specific instruction</li></ul>
<ul class="doc-list"><li>Privately warn the child before transitions: "In 2 minutes we are moving. You're going to do great."</li></ul>
<ul class="doc-list"><li>Acknowledge even small compliance immediately: "Great — clubs down. Thank you."</li></ul>
<ul class="doc-list"><li>Do not single out or reprimand publicly</li></ul>
<p class="doc-p"><strong>ADHD behavior is neurological — not defiance. Coach response must reflect this understanding.</strong></p>`},
    {h:`Coaching Children on the Autism Spectrum`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Coaching Children on the Autism Spectrum</p>
<p class="doc-p"><strong>Autism Spectrum Disorder (ASD) presents differently in every child.</strong></p>
<p class="doc-p"><strong>Coaches should not make assumptions based on label alone.</strong></p>
<p class="doc-p"><strong>Consult with parents and school staff before the program begins.</strong></p>
<p class="doc-p"><strong>Common considerations:</strong></p>
<ul class="doc-list"><li>Sensitivity to loud sounds, unexpected touch, or sudden changes</li></ul>
<ul class="doc-list"><li>Strong preference for routine and predictability</li></ul>
<ul class="doc-list"><li>Difficulty with abstract language or idioms</li></ul>
<ul class="doc-list"><li>May need additional processing time before responding</li></ul>
<ul class="doc-list"><li>May have specific sensory sensitivities to equipment, surfaces, or noise</li></ul>
<p class="doc-p"><strong>Coaching adjustments:</strong></p>
<ul class="doc-list"><li>Pre-inform the child of the session structure at the start: "Here is what we will do today."</li></ul>
<ul class="doc-list"><li>Avoid sudden changes to routine — announce early if a change is coming</li></ul>
<ul class="doc-list"><li>Use literal, concrete language — avoid analogies that may confuse</li></ul>
<ul class="doc-list"><li>Allow additional processing time after instructions — do not rush response</li></ul>
<ul class="doc-list"><li>Reduce sensory triggers where possible (quieter tone, visual cues, consistent equipment)</li></ul>
<ul class="doc-list"><li>Never force physical contact — follow the child's lead completely</li></ul>
<p class="doc-p"><strong>Many children on the spectrum thrive in structured, movement-based environments.</strong></p>
<p class="doc-p"><strong>EduGolfKids sessions — with their predictable architecture — are naturally well-suited.</strong></p>`},
    {h:`Coaching Children with Physical Limitations`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Coaching Children with Physical Limitations</p>
<p class="doc-p"><strong>EduGolfKids is committed to meaningful participation for all children.</strong></p>
<p class="doc-p"><strong>The Constraints-Led Approach makes EduGolfKids naturally adaptable.</strong></p>
<p class="doc-p"><strong>Modification Principles:</strong></p>
<h4 class="doc-subheading">1. Modify the task, not the child.</h4>
<p class="doc-p"><strong>Never draw attention to a child's limitation. Adjust the activity structure silently and naturally.</strong></p>
<h4 class="doc-subheading">2. Use equipment modification.</h4>
<ul class="doc-list"><li>Shorter club for limited mobility</li></ul>
<ul class="doc-list"><li>Larger target for reduced coordination</li></ul>
<ul class="doc-list"><li>Tee height adjustment for balance challenges</li></ul>
<ul class="doc-list"><li>Seated hitting station if standing is difficult</li></ul>
<h4 class="doc-subheading">3. Modify the scoring system.</h4>
<p class="doc-p"><strong>Create scoring systems where all participation produces positive outcomes regardless of physical output.</strong></p>
<h4 class="doc-subheading">4. Never exclude.</h4>
<p class="doc-p"><strong>If an activity cannot be safely modified for a child's limitation, find a meaningful adjacent role — scorekeeper, target placer, team captain.</strong></p>
<p class="doc-p"><strong>Full exclusion from any activity is a last resort and must be documented.</strong></p>`},
    {h:`Anxiety and Emotional Sensitivity`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Anxiety and Emotional Sensitivity</p>
<p class="doc-p"><strong>Many children experience performance anxiety, social anxiety, or generalized worry.</strong></p>
<p class="doc-p"><strong>Youth sport environments can trigger anxiety in children who fear failure, judgment, or public mistakes.</strong></p>
<p class="doc-p"><strong>Signs of anxiety in session:</strong></p>
<ul class="doc-list"><li>Reluctance or refusal to participate</li></ul>
<ul class="doc-list"><li>Physical complaints (stomach aches, headaches) at the start of session</li></ul>
<ul class="doc-list"><li>Clingy behavior or need for reassurance</li></ul>
<ul class="doc-list"><li>Crying before or during activities</li></ul>
<ul class="doc-list"><li>Extreme fear of making mistakes</li></ul>
<p class="doc-p"><strong>EduGolfKids coaching approach already addresses anxiety through:</strong></p>
<ul class="doc-list"><li>Psychological safety as a core principle (Module 1)</li></ul>
<ul class="doc-list"><li>Growth mindset language (Module 6)</li></ul>
<ul class="doc-list"><li>Non-punitive, non-comparative structure</li></ul>
<p class="doc-p"><strong>Additional adjustments for anxious children:</strong></p>
<ul class="doc-list"><li>Allow observation before participation — never force entry into activity</li></ul>
<ul class="doc-list"><li>Reduce stakes of first attempts: "This is just a practice round — no score."</li></ul>
<ul class="doc-list"><li>Celebrate first participation privately before publicly</li></ul>
<ul class="doc-list"><li>Check in one-on-one during transition moments: "How's it going? You're doing well."</li></ul>
<p class="doc-p"><strong>If anxiety appears severe, persistent, or escalating, notify the parent and school counselor.</strong></p>
<p class="doc-p"><strong>Do not attempt to diagnose or treat anxiety. Coach, observe, communicate.</strong></p>`},
    {h:`Communicating with Parents about Special Needs`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Communicating with Parents about Special Needs</p>
<p class="doc-p"><strong>Parents of children with special needs often have heightened concerns about how their child will be treated.</strong></p>
<p class="doc-p"><strong>First contact with these parents is critical.</strong></p>
<p class="doc-p"><strong>Before the program:</strong></p>
<ul class="doc-list"><li>Request a brief conversation with the parent to understand the child's specific needs, triggers, and successful strategies</li></ul>
<ul class="doc-list"><li>Ask: "What helps your child feel comfortable and successful in a new activity?"</li></ul>
<ul class="doc-list"><li>Ask: "Is there anything I should know to make this experience great for them?"</li></ul>
<p class="doc-p"><strong>During the program:</strong></p>
<ul class="doc-list"><li>Provide more frequent brief updates: "Just wanted to let you know — today was a great session for [child]."</li></ul>
<ul class="doc-list"><li>Frame all communication in developmental language</li></ul>
<ul class="doc-list"><li>If a challenging situation occurs, inform the parent the same day</li></ul>
<p class="doc-p"><strong>Never:</strong></p>
<ul class="doc-list"><li>Communicate diagnosis or behavioral observations in written group communication</li></ul>
<ul class="doc-list"><li>Share a child's special needs status with other parents or children</li></ul>
<ul class="doc-list"><li>Use a child's diagnosis as an explanation in front of peers</li></ul>
<p class="doc-p"><strong>Confidentiality of special needs information is an absolute standard.</strong></p>
<h3 class="doc-section-title">🎯 Coach Practical Application</h3>
<p class="doc-bold-label">Exercise 1 — Medical Response Drill</p>
<p class="doc-p"><strong>Coach is given a medical scenario (asthma attack during outdoor session).</strong></p>
<p class="doc-p"><strong>Must demonstrate: correct immediate response, group management during incident, documentation awareness.</strong></p>
<p class="doc-bold-label">Exercise 2 — Inclusion Design Challenge</p>
<p class="doc-p"><strong>Coach is given a standard EduGolfKids drill and must redesign it to be fully inclusive for:</strong></p>
<ul class="doc-list"><li>A child with ADHD</li></ul>
<ul class="doc-list"><li>A child with a mobility limitation</li></ul>
<ul class="doc-list"><li>A child with high anxiety</li></ul>
<p class="doc-p"><strong>Evaluator measures: Inclusion without exclusion, task integrity maintained, no child singled out negatively.</strong></p>
<p class="doc-bold-label">Exercise 3 — Parent Communication Scenario</p>
<p class="doc-p"><strong>Coach must draft a communication to the parent of a child with ASD following the first session, using growth language and appropriate confidentiality standards.</strong></p>
<h3 class="doc-section-title">📋 Certification Assessment</h3>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Describe the correct response to a seizure in a session setting.</li></ul>
<ul class="doc-list"><li>List 3 coaching adjustments for a child with ADHD.</li></ul>
<ul class="doc-list"><li>Explain the modification principle "modify the task, not the child."</li></ul>
<ul class="doc-list"><li>What is the difference between ADA accommodation and IEP implementation?</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>Coach is given an inclusion design scenario and must demonstrate appropriate adjustments across physical, cognitive, and emotional needs.</strong></p>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p"><strong>Coach must run a 10-minute inclusive session segment designed for a mixed-needs group, demonstrating:</strong></p>
<ul class="doc-list"><li>Proactive inclusion design</li></ul>
<ul class="doc-list"><li>Growth mindset language</li></ul>
<ul class="doc-list"><li>At least one visible accommodation without singling out the child</li></ul>
<ul class="doc-list"><li>Correct response to a prompted simulated medical moment</li></ul>
<p class="doc-p"><strong>Automatic reassessment if:</strong></p>
<ul class="doc-list"><li>Child with special needs excluded from any activity without documented justification</li></ul>
<ul class="doc-list"><li>Medical response protocol violated</li></ul>
<ul class="doc-list"><li>Confidential needs information referenced publicly</li></ul>
<ul class="doc-list"><li>Discriminatory language or behavior observed</li></ul>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>
<h3 class="doc-section-title">💡 Final Reinforcement</h3>
<p class="doc-p"><strong>Inclusion is not charity. It is standard.</strong></p>
<p class="doc-p"><strong>Every child in your session deserves full access to the EduGolfKids experience.</strong></p>
<p class="doc-p"><strong>The Constraints-Led Approach gives you the tools.</strong></p>
<p class="doc-p"><strong>The Language Code gives you the voice.</strong></p>
<p class="doc-p"><strong>Your preparation gives you the confidence.</strong></p>
<p class="doc-p"><strong>There is no child who cannot participate in a well-designed EduGolfKids session.</strong></p>
<p class="doc-p"><strong>Design the environment. Know your children. Coach every one of them.</strong></p>`},
  ]
},
{
  id:"L1_M11",
  title:"Module 11 \u2014 Field Safety",
  icon:"\u26c8\ufe0f",
  sections:[
    {h:`Section 1 — THE WEATHER DECISION FRAMEWORK`,b:`<h3 class="doc-section-title">SECTION 1 — THE WEATHER DECISION FRAMEWORK</h3>
<p class="doc-p"><strong>Every EduGolfKids coach must check the weather before every outdoor session. This is not optional — it is a non-negotiable pre-session duty.</strong></p>
<p class="doc-p"><strong>Pre-Session Weather Check — Required Steps:</strong></p>
<ul class="doc-list"><li>Check the weather forecast minimum 2 hours before session start</li></ul>
<ul class="doc-list"><li>Use a reliable app — Weather.com, Weather Underground, or your local national weather service</li></ul>
<ul class="doc-list"><li>Check specifically for: lightning risk, wind speed, temperature, and precipitation</li></ul>
<ul class="doc-list"><li>If thunderstorms are forecast within a 4-hour window of your session — begin contingency planning immediately</li></ul>
<div class="doc-rule">RULE: When in doubt, move indoors or postpone. Never wait for lightning to appear before acting.</div>
<p class="doc-p"><strong>The Three-Option Decision Matrix:</strong></p>
<p class="doc-p">When weather conditions are uncertain or deteriorating, apply the following in order:</p>
<p class="doc-bold-label">OPTION 1 — PROCEED OUTDOORS</p>
<ul class="doc-list"><li>Sky is clear or partly cloudy</li></ul>
<ul class="doc-list"><li>No thunderstorm forecast within 4 hours</li></ul>
<ul class="doc-list"><li>Wind is manageable — equipment and children are not at risk</li></ul>
<ul class="doc-list"><li>Temperature is within safe operating range (see Section 2)</li></ul>
<p class="doc-bold-label">OPTION 2 — MOVE INDOORS</p>
<ul class="doc-list"><li>Thunderstorms forecast within 4 hours</li></ul>
<ul class="doc-list"><li>Wind speed makes equipment unsafe or children uncomfortable</li></ul>
<ul class="doc-list"><li>Light rain that makes outdoor delivery impractical</li></ul>
<ul class="doc-list"><li>Extreme heat — indoor air-conditioned environment preferred</li></ul>
<ul class="doc-list"><li><span class="doc-arrow">→</span> Proceed with a modified indoor session using foam balls and shortened distances</li></ul>
<p class="doc-bold-label">OPTION 3 — POSTPONE / CANCEL</p>
<ul class="doc-list"><li>Active thunderstorm in the area</li></ul>
<ul class="doc-list"><li>School has closed or restricted outdoor access due to weather</li></ul>
<ul class="doc-list"><li>Extreme weather event — tornado warning, flash flood, severe storm watch</li></ul>
<ul class="doc-list"><li>Indoor space is unavailable and conditions make any delivery unsafe</li></ul>
<ul class="doc-list"><li><span class="doc-arrow">→</span> Immediately notify school contact and parents via agreed communication channel</li></ul>
<ul class="doc-list"><li><span class="doc-arrow">→</span> Reschedule within the same billing month where possible</li></ul>
<p class="doc-p"><strong>⚠  A cancelled session without rescheduling represents lost revenue and a broken commitment to schools. Always reschedule — do not simply cancel.</strong></p>`},
    {h:`Section 2 — LIGHTNING SAFETY: THE 30/30 RULE`,b:`<h3 class="doc-section-title">SECTION 2 — LIGHTNING SAFETY: THE 30/30 RULE</h3>
<p class="doc-p"><strong>Lightning is the single most serious weather hazard for outdoor golf sessions. Children holding metal clubs are at elevated risk.</strong></p>
<p class="doc-p"><strong>The 30/30 Rule — Memorise This:</strong></p>
<p class="doc-p"><strong>30 SECONDS: If the time between a lightning flash and thunder is 30 seconds or less — evacuate immediately. The storm is within 6 miles.</strong></p>
<p class="doc-p"><strong>30 MINUTES: Do not resume outdoor activity until 30 minutes after the last lightning flash or thunder. Not 10 minutes. Not 20. 30 full minutes.</strong></p>
<p class="doc-p"><strong>Lightning Evacuation Protocol — Step by Step:</strong></p>
<p class="doc-p">As soon as you observe lightning or hear thunder within 30 seconds:</p>
<div class="doc-rule">STEP 1 — CALL IT</div>
<ul class="doc-list"><li>Blow your whistle three times — the EduGolfKids universal stop signal</li></ul>
<ul class="doc-list"><li>Use a calm, firm voice: "Everyone stop. Clubs on the ground. Come to me now."</li></ul>
<ul class="doc-list"><li>Do not run. Walk briskly and calmly. Your tone controls the group's reaction.</li></ul>
<div class="doc-rule">STEP 2 — GROUND ALL EQUIPMENT</div>
<ul class="doc-list"><li>All clubs must be placed flat on the ground immediately</li></ul>
<ul class="doc-list"><li>No child carries a club during evacuation — ever</li></ul>
<ul class="doc-list"><li>Do not carry clubs yourself — leave them on the field</li></ul>
<div class="doc-rule">STEP 3 — MOVE TO SHELTER</div>
<ul class="doc-list"><li>Direct children to the nearest substantial building — school building preferred</li></ul>
<ul class="doc-list"><li>A hard-topped vehicle is an acceptable secondary shelter</li></ul>
<ul class="doc-list"><li>Do NOT shelter under trees, near fences, near flagpoles, or in open structures</li></ul>
<ul class="doc-list"><li>Do NOT shelter in dugouts, covered bleachers, or bus stops — these are not safe</li></ul>
<div class="doc-rule">STEP 4 — ACCOUNT FOR ALL CHILDREN</div>
<ul class="doc-list"><li>Once inside — count every child against your session register</li></ul>
<ul class="doc-list"><li>No child is unaccounted for. If someone is missing — notify school staff immediately.</li></ul>
<div class="doc-rule">STEP 5 — NOTIFY</div>
<ul class="doc-list"><li>Notify the school contact that the session has been suspended due to lightning</li></ul>
<ul class="doc-list"><li>Contact parents if children need to wait for extended pickup</li></ul>
<div class="doc-rule">STEP 6 — WAIT THE FULL 30 MINUTES</div>
<ul class="doc-list"><li>Start timing from the last flash or thunder observed</li></ul>
<ul class="doc-list"><li>If lightning or thunder occurs again during the wait — reset the 30-minute clock</li></ul>
<ul class="doc-list"><li>If 30 minutes expires and the session cannot be resumed — reschedule</li></ul>
<p class="doc-p"><strong>⚠  NEVER resume a session early because "it looks clear." The 30-minute rule exists because lightning can strike from a storm that appears to have passed. Follow it exactly.</strong></p>`},
    {h:`Section 3 — EXTREME HEAT AND SUN SAFETY`,b:`<h3 class="doc-section-title">SECTION 3 — EXTREME HEAT AND SUN SAFETY</h3>
<p class="doc-p">Children are significantly more vulnerable to heat illness than adults. Their bodies generate more heat proportionally and cool down less efficiently.</p>
<p class="doc-p"><strong>Heat Safety Thresholds:</strong></p>
<ul class="doc-list"><li>Below 80°F / 27°C with low humidity — normal session, standard hydration reminders</li></ul>
<ul class="doc-list"><li>80–90°F / 27–32°C — mandatory water break every 15 minutes, shade access required</li></ul>
<ul class="doc-list"><li>Above 90°F / 32°C OR heat index above 95°F / 35°C — consider moving indoors or postponing</li></ul>
<ul class="doc-list"><li>Above 100°F / 38°C — session must be postponed or moved fully indoors</li></ul>
<p class="doc-p"><strong>Heat Safety Non-Negotiables:</strong></p>
<ul class="doc-list"><li>Always carry a minimum of one litre of water per child for outdoor sessions</li></ul>
<ul class="doc-list"><li>Water breaks are scheduled — not optional, not "when children ask"</li></ul>
<ul class="doc-list"><li>Identify shaded areas at every venue during your first site visit</li></ul>
<ul class="doc-list"><li>Watch for signs of heat exhaustion: pale skin, heavy sweating, weakness, nausea, dizziness</li></ul>
<p class="doc-p"><strong>⚠  Heat stroke is a medical emergency. If a child stops sweating but is hot, confused, or unresponsive — call emergency services immediately and move the child to shade or cool environment.</strong></p>`},
    {h:`Section 4 — WIND AND RAIN SAFETY`,b:`<h3 class="doc-section-title">SECTION 4 — WIND AND RAIN SAFETY</h3>
<p class="doc-p"><strong>Wind:</strong></p>
<ul class="doc-list"><li>Wind above 25mph / 40km/h: assess whether equipment can be safely controlled</li></ul>
<ul class="doc-list"><li>Foam balls and light equipment become projectiles in high wind — adjust to putting or indoor alternatives</li></ul>
<ul class="doc-list"><li>Children must not swing clubs in high wind conditions — risk of loss of control</li></ul>
<ul class="doc-list"><li>If pop-up shelters or cones are being displaced — conditions are too windy for safe outdoor delivery</li></ul>
<p class="doc-p"><strong>Rain:</strong></p>
<ul class="doc-list"><li>Light drizzle: session may proceed if children are appropriately dressed and surface is safe</li></ul>
<ul class="doc-list"><li>Moderate to heavy rain: move indoors — wet equipment, wet surfaces, and low visibility are all hazards</li></ul>
<ul class="doc-list"><li>Wet grass or hard surfaces: slipping risk is significantly elevated — do not proceed outdoors</li></ul>
<ul class="doc-list"><li>Standing water on surface: session must move indoors or be postponed</li></ul>`},
    {h:`Section 5 — FIRST AID RESPONSE DURING SESSIONS`,b:`<h3 class="doc-section-title">SECTION 5 — FIRST AID RESPONSE DURING SESSIONS</h3>
<p class="doc-p">Every EduGolfKids coach must hold a current First Aid certification before leading sessions independently. This section covers the most likely scenarios in a school golf environment.</p>
<p class="doc-p"><strong>Scenario 1 — Struck by Golf Club:</strong></p>
<ul class="doc-list"><li>Stop the session immediately — one whistle blast</li></ul>
<ul class="doc-list"><li>Move all other children away from the area calmly</li></ul>
<ul class="doc-list"><li>Assess the injury — do not move the child if head, neck, or back injury is suspected</li></ul>
<ul class="doc-list"><li>Call for school nurse or medical staff immediately</li></ul>
<ul class="doc-list"><li>Do not apply pressure to head wounds without training — cover gently</li></ul>
<ul class="doc-list"><li>Contact parent within 15 minutes of incident</li></ul>
<ul class="doc-list"><li>Complete incident report within 24 hours</li></ul>
<p class="doc-p"><strong>Scenario 2 — Suspected Concussion:</strong></p>
<ul class="doc-list"><li>Any blow to the head — the child does NOT return to the session</li></ul>
<ul class="doc-list"><li>Seat the child in a shaded, calm area with adult supervision</li></ul>
<ul class="doc-list"><li>Watch for: headache, confusion, dizziness, nausea, sensitivity to light</li></ul>
<ul class="doc-list"><li>Notify school nurse immediately</li></ul>
<ul class="doc-list"><li>Notify parent — child must be collected and assessed by a medical professional before returning</li></ul>
<div class="doc-rule">RULE: If in doubt, sit them out. A child with a suspected concussion never returns to the session that day under any circumstance.</div>
<p class="doc-p"><strong>Scenario 3 — Anaphylaxis / Allergic Reaction:</strong></p>
<ul class="doc-list"><li>Check your pre-session register for any child with a known allergy and EpiPen</li></ul>
<ul class="doc-list"><li>Signs: hives, swelling of face or throat, difficulty breathing, pale skin, loss of consciousness</li></ul>
<ul class="doc-list"><li>Call emergency services immediately — do not wait</li></ul>
<ul class="doc-list"><li>Administer EpiPen if the child has one and you are trained — or locate school nurse immediately</li></ul>
<ul class="doc-list"><li>Stay with child until medical assistance arrives</li></ul>
<p class="doc-p"><strong>Scenario 4 — Seizure:</strong></p>
<ul class="doc-list"><li>Do not restrain the child — clear the space around them</li></ul>
<ul class="doc-list"><li>Time the seizure</li></ul>
<ul class="doc-list"><li>Place something soft under their head — nothing in the mouth</li></ul>
<ul class="doc-list"><li>After the seizure — place child in recovery position</li></ul>
<ul class="doc-list"><li>Call emergency services if seizure lasts more than 5 minutes or child does not regain consciousness quickly</li></ul>
<ul class="doc-list"><li>Notify school nurse and parent immediately</li></ul>
<p class="doc-p"><strong>⚠  You are not a medical professional. Your job is to keep the child safe, call for help immediately, and stay calm. Do not attempt treatment beyond your training level.</strong></p>`},
    {h:`Section 6 — INCIDENT DOCUMENTATION`,b:`<h3 class="doc-section-title">SECTION 6 — INCIDENT DOCUMENTATION</h3>
<p class="doc-p">Every incident — however minor — must be documented. This protects the child, the school, and you.</p>
<p class="doc-p"><strong>EduGolfKids Incident Report — Required Fields:</strong></p>
<ul class="doc-list"><li>Date, time, and location of incident</li></ul>
<ul class="doc-list"><li>Child's full name and age</li></ul>
<ul class="doc-list"><li>Nature of incident — describe exactly what happened</li></ul>
<ul class="doc-list"><li>Witnesses present — names and roles</li></ul>
<ul class="doc-list"><li>Action taken — exactly what you did, in sequence</li></ul>
<ul class="doc-list"><li>Medical attention sought — yes/no, by whom</li></ul>
<ul class="doc-list"><li>Parent notified — time and method of contact</li></ul>
<ul class="doc-list"><li>Coach signature and date</li></ul>
<p class="doc-p"><strong>DEADLINE: All incident reports must be submitted to EduGolfKids HQ and the school contact within 24 hours of the incident. No exceptions.</strong></p>
<p class="doc-p">Incident reports are submitted via the EduGolfKids operating system (Airtable). If the system is unavailable, email the report to HQ immediately and log it in the system as soon as possible.</p>`},
    {h:`Section 7 — PRE-SESSION SAFETY CHECKLIST`,b:`<h3 class="doc-section-title">SECTION 7 — PRE-SESSION SAFETY CHECKLIST</h3>
<p class="doc-p">Before every outdoor session, complete the following:</p>
<ul class="doc-list"><li>☐  Weather checked — forecast reviewed for next 4 hours</li></ul>
<ul class="doc-list"><li>☐  Lightning risk assessed — 30/30 rule understood and ready to apply</li></ul>
<ul class="doc-list"><li>☐  Indoor backup space confirmed with school if weather is uncertain</li></ul>
<ul class="doc-list"><li>☐  Emergency Action Plan (EAP) reviewed for this venue</li></ul>
<ul class="doc-list"><li>☐  AED location identified</li></ul>
<ul class="doc-list"><li>☐  School nurse or medical contact identified</li></ul>
<ul class="doc-list"><li>☐  Session register complete — all children accounted for</li></ul>
<ul class="doc-list"><li>☐  Medical alerts reviewed — allergies, conditions, EpiPens confirmed</li></ul>
<ul class="doc-list"><li>☐  Equipment hitting zones set up — spacing verified</li></ul>
<ul class="doc-list"><li>☐  Children briefed on FREEZE and RETRIEVE commands before session starts</li></ul>
<p class="doc-p"><strong>⚠  Do not begin a session without completing this checklist. Preparation is protection.</strong></p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 11</p>
<p class="doc-p">Written Assessment (minimum pass: 85%):</p>
<p class="doc-p"><strong>1.  </strong>A thunderstorm is forecast for 3 hours after your session starts. What do you do before the session begins?</p>
<p class="doc-p"><strong>2.  </strong>You are mid-session when you see lightning. You count to 20 before hearing thunder. What do you do, in exact sequence?</p>
<p class="doc-p"><strong>3.  </strong>A child has been struck on the head by another child's club during a session. Describe your exact response.</p>
<p class="doc-p"><strong>4.  </strong>The temperature at session time is 93°F. No indoor space is available. What is your decision and why?</p>
<h4 class="doc-subheading">5.  What is the 30/30 Rule and why does the second "30" matter?</h4>
<p class="doc-p"><strong>6.  </strong>A child appears confused, is sweating heavily, and says they feel sick during an outdoor session in summer. What do you do?</p>
<p class="doc-p">Practical Assessment:</p>
<ul class="doc-list"><li>Coach must demonstrate a full lightning evacuation drill with a simulated group, from first whistle to full shelter, including equipment grounding and headcount.</li></ul>
<ul class="doc-list"><li>Coach must complete a blank incident report for a provided scenario to a satisfactory standard.</li></ul>
<p class="doc-p"><strong>⚠  AUTOMATIC FAIL: Any coach who demonstrates uncertainty about the lightning evacuation protocol or who cannot complete the pre-session safety checklist correctly will not pass this module and must resit.</strong></p>
<p class="doc-p"><strong>Safety is not a module. It is a mindset.</strong></p>
<p class="doc-p">Every child in your session is someone's entire world. Protect them like it.</p>`},
  ]
}
],

L2:[
{
  id:"L2_M1",
  title:"Module 1 \u2014 Putting: Foundations to Progression",
  icon:"\u26f3",
  sections:[
    {h:`Why Putting Comes First — The Science`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Why Putting Comes First — The Science</p>
<p class="doc-p"><strong>Research from motor learning science (Schmidt and Lee, 2011) shows that foundational movement patterns established early create neural templates that all future skill layers are built upon.</strong></p>
<p class="doc-p"><strong>Putting is developmentally optimal as a starting skill because:</strong></p>
<ul class="doc-list"><li>Club speed is minimal — injury and fear risk are near zero</li></ul>
<ul class="doc-list"><li>Feedback loop is immediate and binary — ball goes in or it does not</li></ul>
<ul class="doc-list"><li>Short distances mean success is achievable at every ability level</li></ul>
<ul class="doc-list"><li>The pendulum motion trains the fundamental rhythm that transfers to chipping and full swing</li></ul>
<ul class="doc-list"><li>Club face awareness developed here directly accelerates all other skill areas</li></ul>
<p class="doc-p"><strong>US Kids Golf research shows children who begin with putting show faster full-game skill acquisition than children who begin with full swing instruction.</strong></p>
<p class="doc-p"><strong>PGA Junior League data supports structured putting-first sequencing for all ages under 10.</strong></p>
<p class="doc-p"><strong>EduGolfKids adopts and extends this with a full constraints-based progression not available in standard programs.</strong></p>`},
    {h:`The 4 Functional Putting Principles`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The 4 Functional Putting Principles</p>
<p class="doc-p"><strong>EduGolfKids does not teach a rigid putting technique. We teach 4 functional principles that allow natural variation while producing consistent results.</strong></p>
<p class="doc-p"><strong>These principles are taught through environment design — not verbal instruction.</strong></p>
<p class="doc-bold-label">Principle 1: Face Awareness</p>
<p class="doc-p"><strong>The club face direction at contact determines ball direction. This is the single most important outcome variable in putting.</strong></p>
<p class="doc-p"><strong>Not grip. Not stance. Not posture. Face.</strong></p>
<p class="doc-p"><strong>How to teach it without saying it:</strong></p>
<ul class="doc-list"><li>Design gate challenges — two tees wide enough for the ball. Gate forces face awareness naturally.</li></ul>
<ul class="doc-list"><li>Use target circles drawn on the ground — child must land ball inside. Natural feedback.</li></ul>
<ul class="doc-list"><li>Paint or mark the face of the putter with a bright line — child aligns line to target instinctively.</li></ul>
<p class="doc-bold-label">Age 4-6 cue: "Make the flat part face the hole."</p>
<p class="doc-bold-label">Age 6-9 cue: "Where the face looks, the ball goes. Aim your face."</p>
<p class="doc-bold-label">Principle 2: Pendulum Motion</p>
<p class="doc-p"><strong>Shoulders rock. Arms hang. Wrists stay quiet. The putter swings like a clock pendulum.</strong></p>
<p class="doc-p"><strong>LTAD note: Do NOT correct wrist action in 4-6 group. Wrist-driven putting is developmentally normal at this stage and self-regulates as coordination matures. Forced correction at this age creates motor rigidity (Schmidt and Lee, 2011).</strong></p>
<p class="doc-p"><strong>For ages 6-9: introduce quiet hands only if wrist flip causes persistent off-line ball flight that the child cannot self-correct with constraint manipulation.</strong></p>
<p class="doc-p"><strong>How to teach it without saying it:</strong></p>
<ul class="doc-list"><li>Place a small ball under each armpit. If balls drop, arms have disconnected from body. No verbal correction needed — the task provides the feedback.</li></ul>
<ul class="doc-list"><li>Metronome challenge: hit putts in time with a beat. Rhythm naturally produces pendulum motion.</li></ul>
<p class="doc-bold-label">Age 4-6 cue: "Tick-tock like a clock."</p>
<p class="doc-bold-label">Age 6-9 cue: "Back and through the same distance. Like a pendulum."</p>
<p class="doc-bold-label">Principle 3: Consistent Setup</p>
<p class="doc-p"><strong>Ball position consistent relative to stance. Eyes approximately over ball. Comfortable, repeatable address.</strong></p>
<p class="doc-p"><strong>Do not enforce a specific stance. Enforce a repeatable one.</strong></p>
<p class="doc-p"><strong>Children naturally find their own setup if given enough exploration time. Constrain rather than prescribe.</strong></p>
<p class="doc-p"><strong>How to teach it:</strong></p>
<ul class="doc-list"><li>Place foot markers (small strips of tape) for the child to return to each time. Consistency is the goal, not perfect position.</li></ul>
<ul class="doc-list"><li>Use a chalk circle on the ground — child stands inside the circle. Simple, effective, self-policing.</li></ul>
<p class="doc-bold-label">Principle 4: Distance Control</p>
<p class="doc-p"><strong>Backstroke length controls distance. Not effort. Not acceleration. Stroke length.</strong></p>
<p class="doc-p"><strong>This is a 6-9 concept only. The 4-6 brain cannot consistently process cause-and-effect at this level of abstraction.</strong></p>
<p class="doc-p"><strong>Introduce it through constraint design, never explanation.</strong></p>
<p class="doc-p"><strong>How to teach it:</strong></p>
<ul class="doc-list"><li>Place a pool noodle or cone behind the child as a backstroke limiter. Short putt = noodle close. Long putt = noodle farther back. Child experiences the relationship physically.</li></ul>
<ul class="doc-list"><li>Distance ladder challenge: targets at 3, 5, 8, 10 feet. Child must stop ball within 12 inches of each.</li></ul>
<p class="doc-p"><strong>Age 6-9 cue: "Small putt, small swing. Long putt, longer swing. The ball listens to your swing size."</strong></p>`},
    {h:`Age-Specific Putting Progressions`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Age-Specific Putting Progressions</p>
<p class="doc-bold-label">AGES 4-6: Active Start Putting</p>
<p class="doc-p"><strong>Primary Goal: Ball strikes target using any functional motion. Confidence and enjoyment are the primary metrics.</strong></p>
<p class="doc-p"><strong>LTAD stage: Active Start. Movement literacy comes before technique. Exploration before instruction.</strong></p>
<p class="doc-p"><strong>Equipment Setup:</strong></p>
<ul class="doc-list"><li>Putter length: below chin when standing upright — never adult length</li></ul>
<ul class="doc-list"><li>Target: large cup or circle minimum 6 inches in diameter</li></ul>
<ul class="doc-list"><li>Ball: foam or low-compression only</li></ul>
<ul class="doc-list"><li>Distance: 2 to 4 feet maximum</li></ul>
<ul class="doc-list"><li>Surface: flat carpet or smooth gym floor</li></ul>
<p class="doc-bold-label">Stage 1 — Free Exploration (Sessions 1-2)</p>
<p class="doc-p"><strong>Place ball near hole. Let child attempt without instruction. Observe natural motion.</strong></p>
<p class="doc-p"><strong>Coach role: Celebrate any contact, any ball movement toward target.</strong></p>
<p class="doc-p"><strong>Do NOT correct grip, stance, or technique at this stage.</strong></p>
<p class="doc-bold-label">Growth Mindset language: "You hit it! Did you see that? Let's go again."</p>
<p class="doc-bold-label">Stage 2 — Target Awareness (Sessions 3-4)</p>
<p class="doc-p"><strong>Introduce the target as a game: "Can you make the ball go inside the yellow circle?"</strong></p>
<p class="doc-p"><strong>Add a second target option. Let child choose which to aim at.</strong></p>
<p class="doc-p"><strong>Begin using FREEZE and RETRIEVE commands within the putting game — building command fluency.</strong></p>
<p class="doc-bold-label">Growth Mindset: "You chose the far one! Great challenge."</p>
<p class="doc-bold-label">Stage 3 — Distance Exploration (Sessions 5-6)</p>
<p class="doc-p"><strong>Move the target slightly farther. Frame as an unlock: "You've been so good — you get the long hole now!"</strong></p>
<p class="doc-p"><strong>Introduce cooperative scoring: pairs earn points together.</strong></p>
<p class="doc-p"><strong>Coach begins using face awareness cue naturally within encouragement — not as a correction.</strong></p>
<p class="doc-bold-label">Stage 4 — Mini Competition (Sessions 7+)</p>
<p class="doc-p"><strong>Simple points game: 1 point per ball inside the circle.</strong></p>
<p class="doc-p"><strong>Team vs team. No individual winner — group score only at this age.</strong></p>
<p class="doc-p"><strong>Introduce the concept of trying again: "That one was close. What will you try differently?"</strong></p>
<p class="doc-p"><strong>Skills Passport Assessment Criteria — Ages 4-6 Putting:</strong></p>
<ul class="doc-list"><li>Can strike a stationary ball with the putter toward a target from 3 feet — 3 out of 5 attempts</li></ul>
<ul class="doc-list"><li>Demonstrates awareness of target direction before striking</li></ul>
<ul class="doc-list"><li>Returns club to ground on FREEZE command consistently</li></ul>
<ul class="doc-list"><li>Participates with effort and positive engagement for full putting segment</li></ul>
<p class="doc-bold-label">AGES 6-9: FUNdamentals Putting</p>
<p class="doc-p"><strong>Primary Goal: Consistent face control, basic distance management, emerging self-correction ability.</strong></p>
<p class="doc-p"><strong>LTAD stage: FUNdamentals. Building basic golf control within athletic foundation. Not specialization.</strong></p>
<p class="doc-p"><strong>Equipment Setup:</strong></p>
<ul class="doc-list"><li>Fitted putter: below chin, above navel</li></ul>
<ul class="doc-list"><li>Target: standard hole or tee gate (two tees 5-6 inches apart)</li></ul>
<ul class="doc-list"><li>Ball: low-compression</li></ul>
<ul class="doc-list"><li>Distance range: 3 to 12 feet</li></ul>
<p class="doc-bold-label">Stage 1 — Gate Challenge</p>
<p class="doc-p"><strong>Set two tees as a gate 6 inches apart. Child putts through from 4 feet.</strong></p>
<p class="doc-p"><strong>Narrow the gate gradually over sessions. No mechanical instruction — the gate gives the feedback.</strong></p>
<p class="doc-p"><strong>This is pure CLA: the environment corrects, not the coach.</strong></p>
<p class="doc-bold-label">Growth Mindset: "You made it through! What did you do differently on that one?"</p>
<p class="doc-bold-label">Stage 2 — Distance Ladder</p>
<p class="doc-p"><strong>Targets at 3, 5, 8, 10 feet. Child must stop ball within 12 inches of target before advancing.</strong></p>
<p class="doc-p"><strong>Introduce backstroke length concept using pool noodle limiter.</strong></p>
<p class="doc-p"><strong>Self-scoring: child tracks their own personal best distance.</strong></p>
<p class="doc-bold-label">Stage 3 — Pressure Rounds</p>
<p class="doc-p"><strong>5-ball scoring rounds. Points for distance zones hit.</strong></p>
<p class="doc-p"><strong>Introduce light peer competition — paired challenges, not class rankings.</strong></p>
<p class="doc-bold-label">Coach introduces guided discovery: "What changed when you made that long one?"</p>
<p class="doc-bold-label">Stage 4 — Course Simulation</p>
<p class="doc-p"><strong>Design a 3-hole putting course using cones and targets around the gym.</strong></p>
<p class="doc-p"><strong>Children play in pairs. Score is kept cooperatively first, then individually.</strong></p>
<p class="doc-p"><strong>Rules introduction: ball played from where it stops. No picking up and repositioning.</strong></p>
<p class="doc-p"><strong>Skills Passport Assessment Criteria — Ages 6-9 Putting:</strong></p>
<ul class="doc-list"><li>Holes 3 out of 5 putts from 4 feet through a 6-inch gate</li></ul>
<ul class="doc-list"><li>Demonstrates distance control — stops ball within 18 inches of target from 8 feet (3 out of 5)</li></ul>
<ul class="doc-list"><li>Can identify and self-correct a missed putt direction using guided discovery question</li></ul>
<ul class="doc-list"><li>Completes 3-hole putting course with consistent setup and safety protocol compliance</li></ul>
<ul class="doc-list"><li>Uses effort-based self-reflection at end of segment without coach prompt</li></ul>`},
    {h:`Common Putting Errors and Constraint-Based Responses`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Common Putting Errors and Constraint-Based Responses</p>
<p class="doc-bold-label">Error 1: Ball consistently goes left of target</p>
<p class="doc-p"><strong>Root cause: Club face open at contact (for right-handed player).</strong></p>
<p class="doc-bold-label">Traditional response: "You're leaving the face open — rotate your hands."</p>
<p class="doc-p"><strong>EduGolfKids response: Narrow the gate from the left side only. Child must solve face angle to get through.</strong></p>
<p class="doc-p"><strong>Growth Mindset cue: "That one went left. The gate will help you feel what needs to change."</strong></p>
<p class="doc-bold-label">Error 2: Ball always stops short</p>
<p class="doc-p"><strong>Root cause: Deceleration through impact — fear of hitting too hard.</strong></p>
<p class="doc-bold-label">Traditional response: "Accelerate through the ball."</p>
<p class="doc-p"><strong>EduGolfKids response: Move target closer by half. Build confidence of reaching. Slowly increase distance.</strong></p>
<p class="doc-bold-label">Growth Mindset cue: "What size swing did that need? Let's find out together."</p>
<p class="doc-bold-label">Error 3: Inconsistent direction — ball sprays randomly</p>
<p class="doc-p"><strong>Root cause: Setup inconsistency — face angle and stance vary every attempt.</strong></p>
<p class="doc-p"><strong>Traditional response: Technical setup instruction.</strong></p>
<p class="doc-p"><strong>EduGolfKids response: Place foot markers and a face line sticker. Address position is now repeatable without instruction.</strong></p>
<p class="doc-bold-label">Error 4: Child rushes — no setup routine</p>
<p class="doc-p"><strong>Root cause: High excitement, low patience — normal at ages 4-8.</strong></p>
<p class="doc-bold-label">Traditional response: "Slow down and set up properly."</p>
<p class="doc-p"><strong>EduGolfKids response: Introduce a 3-count ritual. "Look at target. Look at ball. Go." Child loves the ritual. Pace regulates naturally.</strong></p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 1</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Explain why putting is taught before chipping or full swing using LTAD reasoning.</li></ul>
<ul class="doc-list"><li>Describe the 4 Functional Putting Principles and how each is taught through constraints rather than instruction.</li></ul>
<ul class="doc-list"><li>List the Skills Passport assessment criteria for both age groups.</li></ul>
<ul class="doc-list"><li>Provide a constraint-based solution for a child whose putts consistently go right.</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>Coach is given a 6-year-old scenario: child can make putts from 2 feet but misses everything beyond 4 feet.</strong></p>
<p class="doc-p"><strong>Must design a constraint progression to develop distance feel without technical instruction.</strong></p>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p"><strong>Coach must deliver a 15-minute putting segment to a simulated mixed-age group showing:</strong></p>
<ul class="doc-list"><li>Age-differentiated instruction simultaneously</li></ul>
<ul class="doc-list"><li>At least 3 different constraint challenges</li></ul>
<ul class="doc-list"><li>Growth Mindset language throughout</li></ul>
<ul class="doc-list"><li>Correct use of guided discovery questions</li></ul>
<ul class="doc-list"><li>Skills Passport assessment conducted at close of segment</li></ul>
<p class="doc-p"><strong>Automatic reassessment if:</strong></p>
<ul class="doc-list"><li>Technical swing instruction used instead of constraint manipulation</li></ul>
<ul class="doc-list"><li>Child corrected publicly with negative language</li></ul>
<ul class="doc-list"><li>Assessment conducted without reference to Skills Passport criteria</li></ul>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L2_M2",
  title:"Module 2 \u2014 Chipping: Control and Creativity",
  icon:"\ud83c\udfcc\ufe0f",
  sections:[
    {h:`The Chipping-Putting Connection`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The Chipping-Putting Connection</p>
<p class="doc-p"><strong>Most traditional junior programs introduce chipping as a completely separate skill with new grip, stance, weight distribution, and shaft lean instruction.</strong></p>
<p class="doc-p"><strong>EduGolfKids takes a different evidence-based approach.</strong></p>
<p class="doc-p"><strong>Motor learning research (Wulf, 2013) shows that skill transfer is maximised when new movements are anchored to existing neural patterns.</strong></p>
<p class="doc-p"><strong>Chipping shares the foundational movement of putting:</strong></p>
<ul class="doc-list"><li>Pendulum motion — shoulders rock, wrists relatively quiet</li></ul>
<ul class="doc-list"><li>Downward strike — ball first, then ground</li></ul>
<ul class="doc-list"><li>Target-focused external attention</li></ul>
<ul class="doc-list"><li>Consistent setup and face awareness</li></ul>
<p class="doc-p"><strong>The key addition in chipping is:</strong></p>
<ul class="doc-list"><li>Ball position moves back in stance (generates downward strike)</li></ul>
<ul class="doc-list"><li>Weight favours lead side slightly</li></ul>
<ul class="doc-list"><li>Loft of club creates airtime and bounce</li></ul>
<ul class="doc-list"><li>Landing zone thinking replaces hole thinking</li></ul>
<p class="doc-p"><strong>By connecting chipping to putting, coaches reduce cognitive load and accelerate skill acquisition.</strong></p>
<p class="doc-p"><strong>Children who have mastered the putting pendulum learn chipping 40% faster than those taught from scratch (US Kids Golf internal coaching data).</strong></p>`},
    {h:`Chipping Fundamentals: What Coaches Must Know`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Chipping Fundamentals: What Coaches Must Know</p>
<p class="doc-p"><strong>The 4 Functional Chipping Principles:</strong></p>
<p class="doc-bold-label">Principle 1: Downward Strike</p>
<p class="doc-p"><strong>The club must strike the ball with a descending blow — ball before ground.</strong></p>
<p class="doc-p"><strong>This is the most important mechanical element of chipping.</strong></p>
<p class="doc-p"><strong>Without it: thin shots, fat shots, inconsistent contact.</strong></p>
<p class="doc-p"><strong>How to teach it without saying it:</strong></p>
<ul class="doc-list"><li>Place a tee 2 inches behind the ball. Child must not hit the tee. The tee gives feedback — no verbal correction needed.</li></ul>
<ul class="doc-list"><li>Use a small rubber disc under the ball. Contact must be clean to move the disc forward. If fat, disc stays put.</li></ul>
<p class="doc-p"><strong>Age 4-6 cue: "Hit the ball, then brush the grass." (sequence matters — do not say "ground first")</strong></p>
<p class="doc-p"><strong>Age 6-9 cue: "Ball first. Like a hammer hitting a nail — not the wood around it."</strong></p>
<p class="doc-bold-label">Principle 2: Landing Zone Awareness</p>
<p class="doc-p"><strong>In chipping, children must learn to think about WHERE the ball lands — not where it finishes.</strong></p>
<p class="doc-p"><strong>This is the key cognitive shift from putting.</strong></p>
<p class="doc-p"><strong>Why it matters:</strong></p>
<ul class="doc-list"><li>Ball rolls after landing — trajectory and landing zone together determine finish</li></ul>
<ul class="doc-list"><li>Different clubs land the ball at different distances — this is the beginning of club selection thinking</li></ul>
<ul class="doc-list"><li>Landing zone thinking develops spatial intelligence that transfers to all golf shots</li></ul>
<p class="doc-p"><strong>How to teach it:</strong></p>
<ul class="doc-list"><li>Place a hula hoop or carpet tile as the landing zone target — NOT a hole at the end</li></ul>
<ul class="doc-list"><li>Children score points for landing IN the zone, regardless of where ball finishes</li></ul>
<ul class="doc-list"><li>Gradually shrink the landing zone over sessions as accuracy improves</li></ul>
<p class="doc-bold-label">Age 4-6 cue: "Land it on the mat!" (simple target, no trajectory discussion)</p>
<p class="doc-bold-label">Age 6-9 cue: "Where do you need to land it to make it roll to the cone?"</p>
<p class="doc-bold-label">Principle 3: Shaft Lean and Ball Position</p>
<p class="doc-p"><strong>Hands slightly ahead of ball at address and impact. Ball position centre to back of stance.</strong></p>
<p class="doc-p"><strong>LTAD note: Do NOT explain shaft lean to 4-6 group. The tee-behind-ball constraint achieves this automatically.</strong></p>
<p class="doc-p"><strong>For ages 6-9: introduce ball position back as a setup point only — not a mechanical explanation.</strong></p>
<p class="doc-p"><strong>How to teach it:</strong></p>
<ul class="doc-list"><li>Mark ball position on the ground with a small piece of tape for the child to return to each attempt</li></ul>
<ul class="doc-list"><li>Use the handle-points-to-belt-buckle feel cue for ages 6-9: "Make sure your hands are in front of the ball."</li></ul>
<p class="doc-bold-label">Principle 4: Consistent Loft Selection (Ages 6-9 Only)</p>
<p class="doc-p"><strong>Different clubs produce different trajectories and roll ratios.</strong></p>
<p class="doc-p"><strong>Children 6-9 can begin to understand and experiment with this concept through discovery.</strong></p>
<p class="doc-bold-label">Do NOT teach: "This is a 7-iron and it has X degrees of loft and rolls Y."</p>
<p class="doc-p"><strong>DO teach: Give the child a 7-iron and a sand wedge. Ask them to try both and discover which lands closer to the target.</strong></p>
<p class="doc-p"><strong>Club selection thinking emerges through exploration — not lecture.</strong></p>`},
    {h:`Age-Specific Chipping Progressions`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Age-Specific Chipping Progressions</p>
<p class="doc-bold-label">AGES 4-6: Active Start Chipping</p>
<p class="doc-p"><strong>Primary Goal: Clean contact with the ball using a downward motion. Landing zone awareness is secondary.</strong></p>
<p class="doc-p"><strong>LTAD: Movement quality first. Accuracy is a bonus — never a requirement.</strong></p>
<p class="doc-p"><strong>Equipment Setup:</strong></p>
<ul class="doc-list"><li>Short iron or hybrid — never a full-length adult club</li></ul>
<ul class="doc-list"><li>Foam ball or large low-compression ball</li></ul>
<ul class="doc-list"><li>Large landing target: hula hoop or 3-foot carpet square</li></ul>
<ul class="doc-list"><li>Distance: 5 to 10 feet from landing zone</li></ul>
<ul class="doc-list"><li>Tee behind ball: placed 2 inches back as downward strike guide</li></ul>
<p class="doc-bold-label">Stage 1 — Contact First (Sessions 1-2)</p>
<p class="doc-bold-label">No target. Just strike. "Can you make the ball fly?"</p>
<p class="doc-p"><strong>Celebrate any clean contact, any airtime at all.</strong></p>
<p class="doc-p"><strong>Coach observes natural motion — do not correct.</strong></p>
<p class="doc-p"><strong>Safety: spacing protocol enforced strictly — chipping requires MORE space than putting.</strong></p>
<p class="doc-bold-label">Stage 2 — Landing Target (Sessions 3-4)</p>
<p class="doc-p"><strong>Introduce the hula hoop as landing zone. "Can you make it land on the big circle?"</strong></p>
<p class="doc-p"><strong>Distance close — 5 feet to land zone.</strong></p>
<p class="doc-p"><strong>No scoring pressure. Exploration and discovery.</strong></p>
<p class="doc-bold-label">Stage 3 — Varying Targets (Sessions 5-6)</p>
<p class="doc-p"><strong>Two landing zones at different distances. Child chooses which to aim for.</strong></p>
<p class="doc-p"><strong>Begin cooperative scoring. Pairs collect points for team.</strong></p>
<p class="doc-bold-label">Growth Mindset: "You picked the far one! That was brave."</p>
<p class="doc-bold-label">Stage 4 — Mini Chipping Game (Sessions 7+)</p>
<p class="doc-p"><strong>Set up simple 2-3 chipping stations around the gym with different landing zones.</strong></p>
<p class="doc-p"><strong>Children rotate every 4 minutes. Different target per station.</strong></p>
<p class="doc-p"><strong>LTAD protection: No correction of swing mechanics unless safety concern exists.</strong></p>
<p class="doc-p"><strong>Skills Passport Assessment Criteria — Ages 4-6 Chipping:</strong></p>
<ul class="doc-list"><li>Achieves clean ball contact (ball travels through the air) from 3 out of 5 attempts</li></ul>
<ul class="doc-list"><li>Ball lands within 3 feet of landing zone target from 2 out of 5 attempts</li></ul>
<ul class="doc-list"><li>Complies with spacing and FREEZE protocol throughout segment</li></ul>
<ul class="doc-list"><li>Engages with effort and positive attitude for full chipping segment</li></ul>
<p class="doc-bold-label">AGES 6-9: FUNdamentals Chipping</p>
<p class="doc-p"><strong>Primary Goal: Consistent downward contact, landing zone targeting, emerging club awareness.</strong></p>
<p class="doc-p"><strong>LTAD stage: Building basic golf control. Club selection is exploratory — not prescriptive.</strong></p>
<p class="doc-p"><strong>Equipment Setup:</strong></p>
<ul class="doc-list"><li>Two clubs available: a 7-iron and a pitching wedge (or equivalent loft difference)</li></ul>
<ul class="doc-list"><li>Low-compression ball</li></ul>
<ul class="doc-list"><li>Multiple landing zones at 5, 8, 12, 15 feet</li></ul>
<ul class="doc-list"><li>Tee behind ball available as optional guide — child chooses to use or not</li></ul>
<p class="doc-bold-label">Stage 1 — Precision Landing Challenge</p>
<p class="doc-p"><strong>One landing zone (hula hoop). Child must land ball inside from 8 feet.</strong></p>
<p class="doc-p"><strong>Gate challenge added: ball must fly through two cones set as an air gate before landing.</strong></p>
<p class="doc-p"><strong>This forces trajectory awareness — the gate is the constraint, not the coach.</strong></p>
<p class="doc-bold-label">Stage 2 — Club Discovery</p>
<p class="doc-bold-label">Child given both clubs. No instruction. "Try both and tell me what you notice."</p>
<p class="doc-p"><strong>After exploration: guided discovery — "Which one landed closer? Which rolled further?"</strong></p>
<p class="doc-p"><strong>This is the birth of club selection intelligence — built through experience, not theory.</strong></p>
<p class="doc-bold-label">Stage 3 — Variable Distance Chipping</p>
<p class="doc-p"><strong>Four landing zones at different distances. Child must chip to all four in sequence.</strong></p>
<p class="doc-p"><strong>Self-scoring: child tracks how many zones they hit in 10 shots.</strong></p>
<p class="doc-p"><strong>Personal best tracking — compare to own score, not peers.</strong></p>
<p class="doc-bold-label">Stage 4 — Chipping Course</p>
<p class="doc-p"><strong>Design a 3-station chipping course: rough lie, flat lie, uphill lie (use mats at angles).</strong></p>
<p class="doc-p"><strong>Children play through in pairs. Score cooperatively first, then individual round.</strong></p>
<p class="doc-p"><strong>Rules: ball played from where it lands. No improving lie. First introduction to etiquette concepts.</strong></p>
<p class="doc-p"><strong>Skills Passport Assessment Criteria — Ages 6-9 Chipping:</strong></p>
<ul class="doc-list"><li>Achieves clean ball contact landing within 2 feet of target zone from 4 out of 5 attempts at 8 feet</li></ul>
<ul class="doc-list"><li>Demonstrates basic landing zone vs finish zone understanding when asked</li></ul>
<ul class="doc-list"><li>Can describe difference between two club options after exploration — in own words</li></ul>
<ul class="doc-list"><li>Self-corrects at least one shot during assessment using guided discovery without coach prompt</li></ul>
<ul class="doc-list"><li>Maintains safe spacing and equipment protocol throughout</li></ul>`},
    {h:`Common Chipping Errors and Constraint-Based Responses`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Common Chipping Errors and Constraint-Based Responses</p>
<p class="doc-bold-label">Error 1: Topping the ball — club hits top of ball, ball rolls along ground</p>
<p class="doc-bold-label">Traditional response: "Keep your head down. You're looking up."</p>
<p class="doc-p"><strong>EduGolfKids response: Lower the tee height so ball sits closer to ground. Shrink ball size. Both force more precise contact naturally.</strong></p>
<p class="doc-p"><strong>Growth Mindset: "That one stayed low — the ball is going to teach you. Try again."</strong></p>
<p class="doc-bold-label">Error 2: Fat shot — club hits ground first, ball moves only inches</p>
<p class="doc-bold-label">Traditional response: "Hit ball first. Weight forward."</p>
<p class="doc-p"><strong>EduGolfKids response: Use tee behind ball constraint. Move ball slightly back in stance using tape marker.</strong></p>
<p class="doc-p"><strong>Growth Mindset: "That one dug in — interesting. The tee will help you feel what changes."</strong></p>
<p class="doc-bold-label">Error 3: Child scoops — tries to lift ball by flipping wrists at impact</p>
<p class="doc-bold-label">Traditional response: "Don't scoop. Shaft lean. Hands forward."</p>
<p class="doc-p"><strong>EduGolfKids response: Raise the target. Child aims for a higher landing zone (shelf, box). Upward target naturally discourages scooping instinct.</strong></p>
<p class="doc-bold-label">Error 4: No trajectory — ball runs along ground like a putt</p>
<p class="doc-bold-label">Traditional response: "Open the club face. Take more loft."</p>
<p class="doc-p"><strong>EduGolfKids response: Introduce the air gate — two cones set 12 inches high. Ball must fly through the air to score. Gate creates loft requirement without explanation.</strong></p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 2</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Explain the chipping-putting connection and why this reduces cognitive load in skill acquisition.</li></ul>
<ul class="doc-list"><li>Describe how you would teach landing zone awareness to a 5-year-old vs a 9-year-old.</li></ul>
<ul class="doc-list"><li>Design a constraint response for a child who consistently tops the ball.</li></ul>
<ul class="doc-list"><li>List the Skills Passport criteria for both age groups.</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>Coach is given a group of 8 children aged 6-9. Half are topping, half are hitting fat.</strong></p>
<p class="doc-p"><strong>Must design a single session structure that addresses both errors simultaneously using constraint design — without splitting the group or giving individual technical instruction.</strong></p>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p"><strong>Coach must deliver a 15-minute chipping segment showing:</strong></p>
<ul class="doc-list"><li>Clear connection of chipping motion to putting foundation</li></ul>
<ul class="doc-list"><li>Age-appropriate constraint challenges with visible learning outcomes</li></ul>
<ul class="doc-list"><li>Growth Mindset language used at every correction moment</li></ul>
<ul class="doc-list"><li>Skills Passport assessment conducted at close of segment</li></ul>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L2_M3",
  title:"Module 3 \u2014 Pitching: Distance and Landing",
  icon:"\ud83c\udfaf",
  sections:[
    {h:`Why Pitching Is a 6-9 Skill — The Developmental Reasoning`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Why Pitching Is a 6-9 Skill — The Developmental Reasoning</p>
<p class="doc-p"><strong>Pitching requires simultaneous integration of:</strong></p>
<ul class="doc-list"><li>Hip and shoulder rotation (more complex than chip or putt)</li></ul>
<ul class="doc-list"><li>Weight transfer to lead side through impact</li></ul>
<ul class="doc-list"><li>Arm swing that generates carry distance</li></ul>
<ul class="doc-list"><li>Trajectory management — understanding how to produce height</li></ul>
<ul class="doc-list"><li>Deceleration control — the follow-through must be managed</li></ul>
<p class="doc-p"><strong>Children under 6 have insufficient bilateral coordination, limited rotation control, and underdeveloped balance for this movement pattern.</strong></p>
<p class="doc-p"><strong>Forcing pitching before readiness creates:</strong></p>
<ul class="doc-list"><li>Compensations that ingrain poor movement patterns</li></ul>
<ul class="doc-list"><li>Increased injury risk from uncontrolled swing speed</li></ul>
<ul class="doc-list"><li>Frustration that damages confidence built in putting and chipping</li></ul>
<p class="doc-p"><strong>US Kids Golf data and PGA Junior coaching research both identify 6-7 as the minimum appropriate introduction age for pitching.</strong></p>
<p class="doc-p"><strong>EduGolfKids adds a prerequisite: chipping competency demonstrated at Skills Passport level first.</strong></p>`},
    {h:`Pitching Fundamentals: What Coaches Must Know`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Pitching Fundamentals: What Coaches Must Know</p>
<p class="doc-p"><strong>The 4 Functional Pitching Principles:</strong></p>
<p class="doc-bold-label">Principle 1: Rotation Through the Ball</p>
<p class="doc-p"><strong>The body turns through impact — hips and chest face the target in the finish.</strong></p>
<p class="doc-p"><strong>This is the primary motor pattern that differentiates pitching from chipping.</strong></p>
<p class="doc-p"><strong>How to teach it without saying it:</strong></p>
<ul class="doc-list"><li>Finish line challenge: place a strip of tape as a "finish line" to the left of the child (right-handed). Child must step over the finish line with their belt buckle after every swing. No explanation needed — the finish line constraint drives rotation.</li></ul>
<ul class="doc-list"><li>Watch the target challenge: "After you swing, your eyes must be looking at the target." This forces head and body through rotation.</li></ul>
<p class="doc-bold-label">Age 6-9 cue: "Turn your belly button to face the target when you finish."</p>
<p class="doc-bold-label">Principle 2: Width and Arm Swing</p>
<p class="doc-p"><strong>Pitching requires a longer, wider arm swing than chipping — this generates carry distance.</strong></p>
<p class="doc-p"><strong>The swing arc is wider because the arms swing away from the body further on the backswing.</strong></p>
<p class="doc-p"><strong>How to teach it:</strong></p>
<ul class="doc-list"><li>Big arm swing vs small arm swing game: can you make the ball carry to the green target? Can you drop it on the short target? Child discovers that arm swing width controls carry.</li></ul>
<ul class="doc-list"><li>Club length constraint: use a longer club for pitch shots. The natural weight and length encourages wider swing.</li></ul>
<p class="doc-bold-label">Age 6-9 cue: "Big swing for far. Small swing for close. You control it."</p>
<p class="doc-bold-label">Principle 3: Weight Transfer to Lead Side</p>
<p class="doc-p"><strong>At impact, 70-80% of weight on lead foot. This creates the descending strike necessary for clean contact.</strong></p>
<p class="doc-p"><strong>How to teach it without saying it:</strong></p>
<ul class="doc-list"><li>Lead foot balance challenge: after every pitch shot, lift the trail foot off the ground and hold for 3 seconds. If the child falls over, weight did not transfer. The challenge provides the feedback.</li></ul>
<ul class="doc-list"><li>Step-through drill: child steps toward target with lead foot as they swing. Exaggerated movement builds transfer instinct.</li></ul>
<p class="doc-bold-label">Age 6-9 cue: "Finish standing tall on your front foot."</p>
<p class="doc-bold-label">Principle 4: Trajectory Awareness</p>
<p class="doc-p"><strong>Understanding that the loft of the club, combined with swing speed and contact point, produces different ball flights.</strong></p>
<p class="doc-p"><strong>This is purely a discovery concept for ages 6-9 — not a technical explanation.</strong></p>
<p class="doc-p"><strong>How to teach it:</strong></p>
<ul class="doc-list"><li>High shot vs low shot challenge: can you make the ball fly over the orange cone? Can you keep it under the blue rope? Child experiments with feel. Club face and swing speed adjust naturally.</li></ul>
<ul class="doc-list"><li>Balloon challenge: hang a balloon between two cones at 4 feet high. Ball must clear the balloon to score. Child discovers trajectory through play.</li></ul>`},
    {h:`Pitching Progressions — Ages 6-9 Only`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Pitching Progressions — Ages 6-9 Only</p>
<p class="doc-p"><strong>Primary Goal: Consistent carry distance with basic trajectory control. Rotation through impact. Soft landing awareness.</strong></p>
<p class="doc-p"><strong>Equipment Setup:</strong></p>
<ul class="doc-list"><li>Pitching wedge or sand wedge — age-appropriate length</li></ul>
<ul class="doc-list"><li>Low-compression ball</li></ul>
<ul class="doc-list"><li>Multiple distance targets: 15, 25, 35, 45 feet</li></ul>
<ul class="doc-list"><li>Balloon or rope barrier for trajectory challenges</li></ul>
<ul class="doc-list"><li>Landing zone circles (hula hoops) at each target</li></ul>
<p class="doc-bold-label">Stage 1 — Carry Distance Discovery (Sessions 1-2)</p>
<p class="doc-bold-label">Single target 20 feet away. "Can you carry the ball all the way to the hoop?"</p>
<p class="doc-p"><strong>No technique instruction. Observe swing pattern emerging from chipping foundation.</strong></p>
<p class="doc-p"><strong>Celebrate carry — even if short. Any airtime toward the target is progress.</strong></p>
<p class="doc-bold-label">Growth Mindset: "You got it in the air! What did that swing feel like?"</p>
<p class="doc-bold-label">Stage 2 — Distance Zone Challenge (Sessions 3-4)</p>
<p class="doc-p"><strong>Three target zones at 15, 25, 35 feet. Child calls their target before swinging.</strong></p>
<p class="doc-p"><strong>This is critical: calling the target before swinging builds pre-shot commitment and intentional practice.</strong></p>
<p class="doc-p"><strong>Score points for hitting chosen zone. Self-tracking.</strong></p>
<p class="doc-bold-label">Stage 3 — Obstacle Pitching (Sessions 5-6)</p>
<p class="doc-p"><strong>Place a barrier (rope, pool noodle at knee height) between the child and the target.</strong></p>
<p class="doc-p"><strong>Ball must carry over the barrier to score. Ball landing short of barrier scores 0.</strong></p>
<p class="doc-p"><strong>This constraint naturally develops trajectory height without discussion of loft or angle.</strong></p>
<p class="doc-bold-label">Stage 4 — Soft Landing Challenge (Sessions 7+)</p>
<p class="doc-p"><strong>Land the ball in a hula hoop and keep it there. Ball that rolls out scores half points.</strong></p>
<p class="doc-p"><strong>Child must discover that a higher, softer pitch stops sooner. No instruction — the scoring system teaches it.</strong></p>
<p class="doc-bold-label">Introduction of "check" concept: "Can you land it softly so it checks?"</p>
<p class="doc-bold-label">Stage 5 — Course Integration</p>
<p class="doc-p"><strong>Design a 3-hole mixed course: one hole requiring a chip, one requiring a pitch over obstacle, one requiring a putt.</strong></p>
<p class="doc-p"><strong>Children experience all three short game shots in sequence.</strong></p>
<p class="doc-p"><strong>Introduce basic etiquette: take turns, no walking in front of another player's shot.</strong></p>
<p class="doc-p"><strong>Skills Passport Assessment Criteria — Ages 6-9 Pitching:</strong></p>
<ul class="doc-list"><li>Carries ball a minimum of 20 feet in the air from 3 out of 5 attempts</li></ul>
<ul class="doc-list"><li>Lands ball within hula hoop target from 25 feet on 2 out of 5 attempts</li></ul>
<ul class="doc-list"><li>Demonstrates weight transfer — holds lead foot balance for 2 seconds after impact on 3 out of 5 swings</li></ul>
<ul class="doc-list"><li>Successfully carries ball over knee-height barrier from 3 out of 5 attempts</li></ul>
<ul class="doc-list"><li>Can select target zone before swing and attempt execution with intention</li></ul>`},
    {h:`Common Pitching Errors and Constraint-Based Responses`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Common Pitching Errors and Constraint-Based Responses</p>
<p class="doc-bold-label">Error 1: Ball stays low — skims ground or rolls</p>
<p class="doc-bold-label">Traditional response: "Open your club face. Hit up on the ball."</p>
<p class="doc-p"><strong>EduGolfKids response: Introduce the barrier constraint — rope at 18 inches. Child must clear it. The barrier forces them to find loft naturally.</strong></p>
<p class="doc-bold-label">Error 2: Thin contact — ball flies fast and low with no control</p>
<p class="doc-bold-label">Traditional response: "Your swing bottom is too far forward."</p>
<p class="doc-p"><strong>EduGolfKids response: Place a small piece of foam 2 inches behind the ball. Clean contact removes the foam. Thin contact slides over it. Foam provides feedback.</strong></p>
<p class="doc-bold-label">Error 3: No rotation — child arms-only the shot with no body turn</p>
<p class="doc-bold-label">Traditional response: "Turn your hips. Rotate through."</p>
<p class="doc-p"><strong>EduGolfKids response: Use the finish line constraint. Add the belt buckle target point. Two concurrent constraints build rotation without a word of mechanics.</strong></p>
<p class="doc-p"><strong>Error 4: Deceleration — child slows down before impact, loses distance and contact</strong></p>
<p class="doc-bold-label">Traditional response: "Accelerate through the ball."</p>
<p class="doc-p"><strong>EduGolfKids response: Move target closer by 30%. Rebuild confidence of reaching. Reintroduce distance gradually as child commits to impact.</strong></p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 3</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Explain using LTAD reasoning why pitching is not introduced to the 4-6 age group.</li></ul>
<ul class="doc-list"><li>Describe the prerequisite chipping competency required before pitching is introduced.</li></ul>
<ul class="doc-list"><li>Design a constraint-based drill that teaches weight transfer without instruction.</li></ul>
<ul class="doc-list"><li>List Skills Passport criteria for pitching.</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>A 7-year-old can chip well but pitches with zero rotation — arms only. Design a 3-stage constraint progression to develop rotation over 3 sessions without technical instruction.</strong></p>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p"><strong>Coach must deliver a 15-minute pitching segment showing:</strong></p>
<ul class="doc-list"><li>At least 3 constraint challenges building on each other</li></ul>
<ul class="doc-list"><li>LTAD stage awareness — no 4-6 children receiving pitching instruction</li></ul>
<ul class="doc-list"><li>Growth Mindset cues at every correction moment</li></ul>
<ul class="doc-list"><li>Skills Passport assessment at close of segment</li></ul>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L2_M4",
  title:"Module 4 \u2014 Full Swing Development",
  icon:"\ud83d\udca5",
  sections:[
    {h:`Why Full Swing Instruction Is Last — The Science`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Why Full Swing Instruction Is Last — The Science</p>
<p class="doc-p"><strong>Almost every traditional youth golf program starts with full swing instruction. This is developmentally incorrect.</strong></p>
<p class="doc-p"><strong>The EduGolfKids sequence — putting, chipping, pitching, then full swing — is supported by:</strong></p>
<ul class="doc-list"><li>LTAD: FUNdamentals stage priorities are coordination, balance, and basic control — not power or distance</li></ul>
<ul class="doc-list"><li>Motor learning: Short-game skills transfer to the full swing more effectively than the reverse (Smith et al., 2012)</li></ul>
<ul class="doc-list"><li>Injury prevention: Full swing mechanics practiced before coordination is mature increase repetitive stress injury risk</li></ul>
<ul class="doc-list"><li>Confidence: Children experience success earlier in putting and chipping, building the emotional confidence to attempt the more challenging full swing</li></ul>
<p class="doc-p"><strong>PGA research on junior engagement shows: children who are introduced to full swing before short game mastery show 35% higher dropout rates in the first 12 months.</strong></p>
<p class="doc-p"><strong>US Kids Golf foundation data confirms: short-game-first programs produce longer-term participation and better overall skill development.</strong></p>
<p class="doc-p"><strong>EduGolfKids adopts this evidence as the foundation of our skill sequence and guards it through the Skills Passport prerequisite gate system.</strong></p>`},
    {h:`Full Swing Fundamentals: What Coaches Must Know`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Full Swing Fundamentals: What Coaches Must Know</p>
<p class="doc-p"><strong>EduGolfKids teaches 5 Functional Full Swing Principles. Not positions. Not angles. Principles.</strong></p>
<p class="doc-bold-label">Principle 1: Athletic Posture</p>
<p class="doc-p"><strong>Knees slightly bent. Hip hinge forward. Arms hang naturally. Weight balanced and centred.</strong></p>
<p class="doc-p"><strong>This is not a technical position — it is an athletic ready stance that all children already understand.</strong></p>
<p class="doc-p"><strong>How to teach it:</strong></p>
<ul class="doc-list"><li>Football ready position: "Get in your ready position like a defender." Then: "That's your golf stance." Children know athletic ready. You are simply naming it.</li></ul>
<ul class="doc-list"><li>Knock the ball off the tee challenge: from a balanced stance, child attempts to strike the ball. Imbalanced posture causes misses — the ball gives the feedback.</li></ul>
<p class="doc-bold-label">Age 4-6 cue: "Bend your knees a little. Like you're sneaking up on something."</p>
<p class="doc-bold-label">Age 6-9 cue: "Athletic ready. Like a shortstop. Now we play golf."</p>
<p class="doc-bold-label">Principle 2: Grip and Connection</p>
<p class="doc-p"><strong>Both hands work together as a unit. The club is held in the fingers — not the palm.</strong></p>
<p class="doc-p"><strong>EduGolfKids does not prescribe overlap, interlock, or 10-finger grip.</strong></p>
<p class="doc-p"><strong>We teach: both hands on the club, comfortable, repeatable, and connected.</strong></p>
<p class="doc-p"><strong>How to teach it:</strong></p>
<ul class="doc-list"><li>Velcro glove challenge: both hands must stay connected to the club through the swing. If one hand releases, they hear the velcro separate. Tactile feedback.</li></ul>
<ul class="doc-list"><li>Shake hands with the club: "Your bottom hand shakes hands with the handle. Now put the other hand on top as a team."</li></ul>
<p class="doc-bold-label">Age 4-6 cue: "Hold it like a baby bird — not too tight, not too loose."</p>
<p class="doc-p"><strong>Age 6-9 cue: "Both hands as a team. Fingers, not palms. Comfortable and connected."</strong></p>
<p class="doc-bold-label">Principle 3: Rotation and Rhythm</p>
<p class="doc-p"><strong>The body turns back and through in a rhythmic, athletic motion.</strong></p>
<p class="doc-p"><strong>Rhythm is the most powerful teaching tool in junior full swing development.</strong></p>
<p class="doc-p"><strong>A swing with great rhythm and poor mechanics will produce more consistent results than a technically correct swing with poor rhythm (Hogan principle; validated in motor learning research by Schmidt and Lee, 2011).</strong></p>
<p class="doc-p"><strong>How to teach it:</strong></p>
<ul class="doc-list"><li>Metronome or clapping beat: "Back on ONE, through on TWO." Child swings in time. Rhythm naturally produces rotation and tempo.</li></ul>
<ul class="doc-list"><li>Whoosh drill: child holds club upside down, swings to produce the loudest whoosh at the bottom. Whoosh location reveals where club speed peaks.</li></ul>
<ul class="doc-list"><li>Tee whoosh: whoosh should happen AT the tee. If before or after, child self-corrects through sound feedback.</li></ul>
<p class="doc-p"><strong>Age 4-6 cue: "Swoooosh! Make the biggest sound right here." (point to impact zone)</strong></p>
<p class="doc-p"><strong>Age 6-9 cue: "Back... and THROUGH. Swing in time. Rhythm beats mechanics every time."</strong></p>
<p class="doc-bold-label">Principle 4: External Focus Target</p>
<p class="doc-p"><strong>The child's mental attention must be on the target — not the swing.</strong></p>
<p class="doc-p"><strong>Wulf (2013) research: external focus consistently produces better motor outcomes than internal focus, across all ages.</strong></p>
<p class="doc-p"><strong>Traditional instruction forces internal focus: "keep your elbow in," "rotate your hips," "keep your head still."</strong></p>
<p class="doc-p"><strong>EduGolfKids forces external focus: "make the ball land on the yellow cone," "fly it past the blue line."</strong></p>
<p class="doc-p"><strong>This is one of the most important and most violated principles in youth golf coaching.</strong></p>
<p class="doc-p"><strong>Every time a coach says "fix your swing" during a full swing activity, they move the child's focus internal and immediately reduce motor performance.</strong></p>
<p class="doc-bold-label">Principle 5: Balanced Finish</p>
<p class="doc-p"><strong>Weight fully on lead foot. Balanced. Held for 3 seconds.</strong></p>
<p class="doc-p"><strong>The finish position is the single most powerful visual and physical feedback tool available to the coach.</strong></p>
<p class="doc-p"><strong>A balanced finish indicates: rotation occurred, weight transferred, swing speed was controlled.</strong></p>
<p class="doc-p"><strong>An unbalanced finish indicates: one or more of the above was absent.</strong></p>
<p class="doc-p"><strong>How to teach it:</strong></p>
<ul class="doc-list"><li>Freeze finish challenge: every swing must end in a posed, held finish like a statue. If the child falls, the swing was off balance.</li></ul>
<ul class="doc-list"><li>Golf statue game: after swinging, hold finish while coach walks around and checks. Gamified and children love it.</li></ul>
<p class="doc-bold-label">Age 4-6 cue: "Make your statue after every swing!"</p>
<p class="doc-p"><strong>Age 6-9 cue: "Finish tall. Balance. Hold it. That tells you everything about the swing."</strong></p>`},
    {h:`Age-Specific Full Swing Progressions`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Age-Specific Full Swing Progressions</p>
<p class="doc-bold-label">AGES 4-6: Active Start Full Swing</p>
<p class="doc-p"><strong>Primary Goal: Rhythmic strike of a teed ball with any functional motion. Safety compliance. Joy of striking.</strong></p>
<p class="doc-p"><strong>LTAD protection: No technical instruction. No position correction. Movement exploration only.</strong></p>
<p class="doc-p"><strong>Equipment Setup:</strong></p>
<ul class="doc-list"><li>High tee — ball at waist height for initial sessions. Lower as confidence builds.</li></ul>
<ul class="doc-list"><li>Foam or large low-compression ball</li></ul>
<ul class="doc-list"><li>Short iron or hybrid — age-appropriate length only</li></ul>
<ul class="doc-list"><li>Minimum 8-foot lateral spacing — full swing requires more space than short game</li></ul>
<ul class="doc-list"><li>All children behind safety line during any swing</li></ul>
<p class="doc-bold-label">Stage 1 — Strike the Teed Ball (Sessions 1-3)</p>
<p class="doc-p"><strong>High tee. Foam ball. "Can you hit it off the tee?" That is the entire instruction.</strong></p>
<p class="doc-p"><strong>Celebrate every contact, every ball movement, every attempt.</strong></p>
<p class="doc-p"><strong>Safety: FREEZE and RETRIEVE commands practiced every session.</strong></p>
<p class="doc-p"><strong>Do NOT correct grip, stance, backswing, or follow-through.</strong></p>
<p class="doc-bold-label">Stage 2 — Direction Awareness (Sessions 4-5)</p>
<p class="doc-p"><strong>Place a large target zone (cones or rope) 15-20 feet in front.</strong></p>
<p class="doc-p"><strong> "Can you hit it toward the yellow zone?" Simple target. No distance pressure.</strong></p>
<p class="doc-p"><strong>Growth Mindset: "You hit it! Did it go toward the zone? What will you try this time?"</strong></p>
<p class="doc-bold-label">Stage 3 — Rhythm Games (Sessions 6-7)</p>
<p class="doc-p"><strong>Introduce whoosh drill and statue finish. Frame both as games.</strong></p>
<p class="doc-p"><strong>Whoosh competition: "Who can make the loudest whoosh?" Rhythm and effort reward.</strong></p>
<p class="doc-p"><strong>Statue competition: pairs watch each other's finish and award points for balance.</strong></p>
<p class="doc-bold-label">Stage 4 — Mini Target Course (Sessions 8+)</p>
<p class="doc-p"><strong>Simple 2-station full swing course with large targets.</strong></p>
<p class="doc-p"><strong>Team scoring. No individual results compared.</strong></p>
<p class="doc-p"><strong>Introduce waiting turn and safety protocol as part of the game rules.</strong></p>
<p class="doc-p"><strong>Skills Passport Assessment Criteria — Ages 4-6 Full Swing:</strong></p>
<ul class="doc-list"><li>Strikes ball off high tee with any functional motion from 3 out of 5 attempts</li></ul>
<ul class="doc-list"><li>Ball travels minimum 10 feet in the air from 2 out of 5 attempts</li></ul>
<ul class="doc-list"><li>Holds a recognizable finish position for 2 seconds after impact on 3 out of 5 swings</li></ul>
<ul class="doc-list"><li>Complies with FREEZE, RETRIEVE, and spacing protocol throughout entire segment</li></ul>
<ul class="doc-list"><li>Engages with positive effort and safe behavior throughout</li></ul>
<p class="doc-bold-label">AGES 6-9: FUNdamentals Full Swing</p>
<p class="doc-p"><strong>Primary Goal: Consistent contact, target direction, balanced finish, basic rhythm and tempo.</strong></p>
<p class="doc-p"><strong>LTAD stage: Building athletic foundation. Distance is irrelevant. Quality of movement matters.</strong></p>
<p class="doc-p"><strong>Equipment Setup:</strong></p>
<ul class="doc-list"><li>Low tee — ball at normal address height</li></ul>
<ul class="doc-list"><li>Low-compression ball</li></ul>
<ul class="doc-list"><li>Full set of age-appropriate clubs available for exploration</li></ul>
<ul class="doc-list"><li>Target zones at 20, 35, 50, 70 feet</li></ul>
<ul class="doc-list"><li>Minimum 8-foot lateral spacing strictly enforced</li></ul>
<p class="doc-bold-label">Stage 1 — Rhythm and Contact</p>
<p class="doc-bold-label">Metronome or beat counting. "Back on ONE, through on TWO."</p>
<p class="doc-p"><strong>Target: large zone at 30 feet. Focus is rhythm, not distance.</strong></p>
<p class="doc-p"><strong>Whoosh drill every 3rd session to reinforce impact timing.</strong></p>
<p class="doc-bold-label">Stage 2 — Distance Zone Targeting</p>
<p class="doc-p"><strong>Four target zones at different distances. Child calls zone before swinging.</strong></p>
<p class="doc-p"><strong>Pre-shot commitment builds focus and intentional practice habits.</strong></p>
<p class="doc-p"><strong>Self-scoring. Personal best only — no comparison to peers.</strong></p>
<p class="doc-bold-label">Stage 3 — Club Selection Discovery</p>
<p class="doc-p"><strong>Child given three clubs: short iron, mid iron, driver or hybrid.</strong></p>
<p class="doc-p"><strong>No instruction: "Try all three. Which one goes furthest? Which is easiest to control?"</strong></p>
<p class="doc-bold-label">Guided discovery: "Which club did you like most? Why?"</p>
<p class="doc-p"><strong>This is the beginning of equipment awareness — built through experience.</strong></p>
<p class="doc-bold-label">Stage 4 — Shot Shape Challenge (Advanced 6-9)</p>
<p class="doc-p"><strong>For higher-readiness children only.</strong></p>
<p class="doc-p"><strong>"Can you make it go left of the cone? Right of the cone?" No instruction — pure exploration.</strong></p>
<p class="doc-p"><strong>Children discover face-path relationship through play. This is advanced motor problem solving.</strong></p>
<p class="doc-p"><strong>Growth Mindset: "You changed direction! What did you do differently? Can you do it again?"</strong></p>
<p class="doc-p"><strong>Skills Passport Assessment Criteria — Ages 6-9 Full Swing:</strong></p>
<ul class="doc-list"><li>Strikes ball off low tee producing minimum 20-foot carry from 4 out of 5 attempts</li></ul>
<ul class="doc-list"><li>Lands ball within 15-foot wide target zone from 40 feet on 3 out of 5 attempts</li></ul>
<ul class="doc-list"><li>Demonstrates balanced finish held for 3 seconds on 4 out of 5 swings</li></ul>
<ul class="doc-list"><li>Uses correct spacing and safety protocol without reminders for full segment</li></ul>
<ul class="doc-list"><li>Can describe one self-identified adjustment after a mis-hit using guided discovery</li></ul>
<ul class="doc-list"><li>Completes a rhythm-based swing (counts back and through) on 3 out of 5 attempts</li></ul>`},
    {h:`Full Swing Safety — Non-Negotiable Standards`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Full Swing Safety — Non-Negotiable Standards</p>
<p class="doc-p"><strong>The full swing is the highest-risk activity in EduGolfKids.</strong></p>
<p class="doc-p"><strong>All safety standards from Level 1 are elevated in full swing sessions.</strong></p>
<p class="doc-p"><strong>Spacing Requirements:</strong></p>
<ul class="doc-list"><li>Minimum 8 feet lateral between each child — measured and marked with cones before children arrive</li></ul>
<ul class="doc-list"><li>Minimum 15 feet behind each child — no child behind another swinger</li></ul>
<ul class="doc-list"><li>All ball retrieval only on RETRIEVE command — never independently</li></ul>
<p class="doc-p"><strong>Equipment Requirements:</strong></p>
<ul class="doc-list"><li>Age-appropriate clubs only — adult clubs create leverage and control problems that elevate injury risk</li></ul>
<ul class="doc-list"><li>Tee must be used in all early full swing sessions — off-turf shots without a tee are a Stage 3+ activity</li></ul>
<ul class="doc-list"><li>Foam or low-compression balls for all indoor sessions and first 3 outdoor sessions</li></ul>
<p class="doc-p"><strong>Coach Position:</strong></p>
<ul class="doc-list"><li>Coach stands at 45-degree angle ahead and to the side — never directly in front or directly behind</li></ul>
<ul class="doc-list"><li>Coach must have line of sight to all children simultaneously at all times</li></ul>
<ul class="doc-list"><li>If line of sight is broken — stop the session and reorganize before continuing</li></ul>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 4</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Using LTAD evidence, explain why full swing is taught last in the EduGolfKids sequence.</li></ul>
<ul class="doc-list"><li>Describe the 5 Functional Full Swing Principles and how each is taught through constraints.</li></ul>
<ul class="doc-list"><li>Explain Wulf's external focus principle and provide 3 examples of external focus cues for full swing.</li></ul>
<ul class="doc-list"><li>List the full swing safety spacing requirements and explain the rationale for each.</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>A group of 8-year-olds all have beautiful rhythm but no rotation — they arm-swing without body turn.</strong></p>
<p class="doc-p"><strong>Design a 3-constraint progression that develops body rotation across one session without any mechanical instruction.</strong></p>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p"><strong>Coach must deliver a 20-minute full swing segment showing:</strong></p>
<ul class="doc-list"><li>Complete safety setup before children arrive</li></ul>
<ul class="doc-list"><li>Age-differentiated instruction for at least two ability levels</li></ul>
<ul class="doc-list"><li>External focus cues only — zero internal mechanics language</li></ul>
<ul class="doc-list"><li>Rhythm-based teaching integrated throughout</li></ul>
<ul class="doc-list"><li>Skills Passport assessment conducted at close</li></ul>
<p class="doc-p"><strong>Automatic reassessment if:</strong></p>
<ul class="doc-list"><li>Internal focus mechanical instruction given ("fix your elbow, rotate your hips")</li></ul>
<ul class="doc-list"><li>Spacing violation occurs and is not immediately corrected</li></ul>
<ul class="doc-list"><li>Children retrieve balls without RETRIEVE command</li></ul>
<ul class="doc-list"><li>Adult-length clubs used with children under 10</li></ul>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L2_M5",
  title:"Module 5 \u2014 Rules &amp; Etiquette",
  icon:"\ud83d\udcd6",
  sections:[
    {h:`Why Golf Rules and Etiquette Matter for Young Children`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Why Golf Rules and Etiquette Matter for Young Children</p>
<p class="doc-p"><strong>Golf is one of the only sports in the world where players call penalties on themselves.</strong></p>
<p class="doc-p"><strong>This unique culture of self-governance and honesty is one of the most powerful life skill lessons golf can teach.</strong></p>
<p class="doc-p"><strong>Research from character development in youth sport (Shields and Bredemeier, 1995) shows:</strong></p>
<ul class="doc-list"><li>Children who learn sport-based ethical frameworks before age 10 demonstrate significantly higher honesty and self-regulation scores in early adolescence</li></ul>
<ul class="doc-list"><li>Rule-following behavior in sport transfers to classroom and social settings when taught through internalization rather than enforcement</li></ul>
<ul class="doc-list"><li>Cultural identity ("I am a golfer — golfers do this") produces more consistent ethical behavior than rule enforcement</li></ul>
<p class="doc-p"><strong>EduGolfKids frames rules and etiquette as golf culture identity — not a compliance list.</strong></p>`},
    {h:`What to Teach by Age Group`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">What to Teach by Age Group</p>
<p class="doc-bold-label">AGES 4-6: Etiquette Habits (Not Rules)</p>
<p class="doc-p"><strong>Children aged 4-6 cannot process abstract rules or consequences.</strong></p>
<p class="doc-p"><strong>They CAN learn rituals, habits, and cultural behaviors through modeling and repetition.</strong></p>
<p class="doc-p"><strong>The 5 Golf Habits for Ages 4-6:</strong></p>
<p class="doc-bold-label">Habit 1: Be Still When Others Hit</p>
<p class="doc-bold-label">Cultural frame: "Golfers are quiet and still when a friend is swinging."</p>
<p class="doc-p"><strong>How to teach it: Practice freeze ritual before any swing begins. Entire group freezes and goes quiet. Child swings. Group unfreezes. Make it ceremonial and special.</strong></p>
<p class="doc-p"><strong>Growth Mindset connection: "You showed so much respect for your friend. That's what golfers do."</strong></p>
<p class="doc-bold-label">Habit 2: Never Walk in Front of a Swinger</p>
<p class="doc-bold-label">Cultural frame: "Golfers always walk behind — never in front."</p>
<p class="doc-p"><strong>How to teach it: Place a rope or cone line as the "safe zone." Walking in front of the line is out of bounds. Visual boundary creates the habit without correction.</strong></p>
<p class="doc-bold-label">Habit 3: Take Turns and Wait Your Turn</p>
<p class="doc-p"><strong>Cultural frame: "Every golfer gets their turn. Great golfers wait and cheer for their team."</strong></p>
<p class="doc-p"><strong>How to teach it: Rotating games where waiting role has an active job — scorekeeper, cheerleader, cone monitor. No one just waits.</strong></p>
<p class="doc-bold-label">Habit 4: Pick Up Your Rubbish</p>
<p class="doc-bold-label">Cultural frame: "Golfers leave the course better than they found it."</p>
<p class="doc-p"><strong>How to teach it: End-of-session tidy-up as a team challenge. Points for fastest and most complete cleanup. Builds pride of place and responsibility.</strong></p>
<p class="doc-bold-label">Habit 5: Shake Hands After the Game</p>
<p class="doc-bold-label">Cultural frame: "Golfers always say well done at the end."</p>
<p class="doc-p"><strong>How to teach it: End every session with a team handshake or fist bump circle. Becomes ritual. Children ask for it if you forget.</strong></p>
<p class="doc-bold-label">AGES 6-9: Simplified Golf Rules</p>
<p class="doc-p"><strong>Children aged 6-9 have the cognitive capacity to understand cause-and-effect rules and begin applying them in game situations.</strong></p>
<p class="doc-p"><strong>EduGolfKids Simplified Rules Set — The 8 Golfer's Rules:</strong></p>
<p class="doc-bold-label">Rule 1: Play the Ball Where It Lies</p>
<p class="doc-p"><strong>Definition: After a shot, play the ball from exactly where it stopped. Do not move it.</strong></p>
<p class="doc-p"><strong>Exception (taught as a game rule): If the ball is in a dangerous place or unplayable, drop it at shoulder height nearby and play from there.</strong></p>
<p class="doc-p"><strong>How to teach it: Award double points for playing ball where it lies. This reinforces the rule as a badge of honor.</strong></p>
<p class="doc-bold-label">Rule 2: Count Every Stroke</p>
<p class="doc-p"><strong>Definition: Every time you try to hit the ball — hit or miss — counts as one stroke.</strong></p>
<p class="doc-p"><strong>Why it matters: "Golfers are honest about their score — even when no one is watching."</strong></p>
<p class="doc-p"><strong>How to teach it: Use simple tally cards. Child marks their own score. Reinforce honesty over result.</strong></p>
<p class="doc-bold-label">Growth Mindset: "Your score doesn't define you. Your honesty does."</p>
<p class="doc-bold-label">Rule 3: The Tee Box Rule</p>
<p class="doc-p"><strong>Definition: Every hole starts from the tee box. Ball must be placed on or behind the tee markers.</strong></p>
<p class="doc-p"><strong>How to teach it: Mark the tee area with cones. Ball placed inside cones. Simple and visual.</strong></p>
<p class="doc-bold-label">Rule 4: Out of Bounds</p>
<p class="doc-p"><strong>Definition: If the ball goes outside the playing area (marked with cones or rope), add one stroke and drop near where it went out.</strong></p>
<p class="doc-p"><strong>How to teach it: Mark boundaries clearly. When a ball goes OB, announce it positively: "Boundary ball! Add one, drop and go."</strong></p>
<p class="doc-bold-label">Rule 5: The Putting Green Rule</p>
<p class="doc-p"><strong>Definition: On the putting green, the ball must be putted — not chipped or pitched.</strong></p>
<p class="doc-p"><strong>How to teach it: Frame the putting green as a special zone. "This is the green zone — only putters here."</strong></p>
<p class="doc-bold-label">Rule 6: Do Not Touch Another Player's Ball</p>
<p class="doc-p"><strong>Definition: Only the player whose ball it is may touch, move, or play that ball.</strong></p>
<p class="doc-p"><strong>How to teach it: "That's [name's] ball. Only [name] can touch it. We respect each other's game."</strong></p>
<p class="doc-bold-label">Rule 7: Repair Your Pitch Marks</p>
<p class="doc-p"><strong>Definition: When a ball lands on the green and makes a dent, the player repairs it using a tee or repair tool.</strong></p>
<p class="doc-p"><strong>How to teach it: Introduce repair tool. Make it a responsibility — "You hit it, you fix it."</strong></p>
<p class="doc-bold-label">Cultural frame: "Great golfers always leave the course better."</p>
<p class="doc-bold-label">Rule 8: The Honour System</p>
<p class="doc-p"><strong>Definition: The player with the lowest score on the previous hole tees off first on the next hole.</strong></p>
<p class="doc-p"><strong>Why it matters: "Golf rewards good play with the honor of going first. It's a privilege."</strong></p>
<p class="doc-p"><strong>How to teach it: Name it the "honor moment." Children look forward to earning it.</strong></p>`},
    {h:`Golf Etiquette Beyond Rules — The EduGolfKids Character Code`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Golf Etiquette Beyond Rules — The EduGolfKids Character Code</p>
<p class="doc-p"><strong>EduGolfKids teaches 6 character values through golf etiquette:</strong></p>
<h4 class="doc-subheading">1. Respect</h4>
<p class="doc-p"><strong>For fellow players, for the course, for the game.</strong></p>
<p class="doc-p"><strong>Coaching language: "Every golfer deserves a fair chance. How you treat others on the course is who you are."</strong></p>
<h4 class="doc-subheading">2. Integrity</h4>
<p class="doc-p"><strong>Count every stroke. Call your own penalties. Be honest when no one is watching.</strong></p>
<p class="doc-p"><strong>Coaching language: "The best golfers are honest. Your score means nothing if you didn't count right."</strong></p>
<h4 class="doc-subheading">3. Patience</h4>
<p class="doc-p"><strong>Wait your turn. Let others play. Control emotions after a bad shot.</strong></p>
<p class="doc-p"><strong>Coaching language: "Golf teaches us to breathe, reset, and go again. That skill works everywhere."</strong></p>
<h4 class="doc-subheading">4. Care for the Course</h4>
<p class="doc-p"><strong>Fix divots, repair pitch marks, rake bunkers, replace flags.</strong></p>
<p class="doc-bold-label">Coaching language: "Golfers look after their course like it's their home."</p>
<h4 class="doc-subheading">5. Resilience</h4>
<p class="doc-p"><strong>Bad shots happen to everyone — in every round, at every level.</strong></p>
<p class="doc-p"><strong>Coaching language: "Tiger Woods has hit bad shots. It's what you do next that matters."</strong></p>
<h4 class="doc-subheading">6. Graciousness</h4>
<p class="doc-p"><strong>Congratulate others genuinely. Accept results with dignity. Win and lose with the same character.</strong></p>
<p class="doc-p"><strong>Coaching language: "Tell your friend that was a great shot — even if you're losing. That's what golfers do."</strong></p>`},
    {h:`Teaching Rules Through Game Design`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Teaching Rules Through Game Design</p>
<p class="doc-p"><strong>The most effective way to teach rules is to build them into games so children experience the consequence and benefit of the rule naturally.</strong></p>
<p class="doc-p"><strong>Game Design Examples:</strong></p>
<p class="doc-p"><strong>Integrity Scoring Game:</strong></p>
<p class="doc-p"><strong>Children mark their own score on tally cards. At the end, pairs compare. If scores match exactly — bonus team point awarded.</strong></p>
<p class="doc-p"><strong>This rewards honesty, builds self-scoring confidence, and makes integrity a team value.</strong></p>
<p class="doc-p"><strong>Boundary Challenge:</strong></p>
<p class="doc-p"><strong>Course has clearly marked out of bounds zones. OB ball costs one extra stroke and a drop. Children calculate their own penalty.</strong></p>
<p class="doc-p"><strong>Over sessions, children learn to manage risk — do not go for the big shot near the boundary.</strong></p>
<p class="doc-p"><strong>This is tactical golf thinking emerging naturally through game design.</strong></p>
<p class="doc-p"><strong>Etiquette Points System:</strong></p>
<p class="doc-p"><strong>Separate to stroke score: children earn etiquette points for freeze during others' swings, repairing pitch marks, picking up rubbish.</strong></p>
<p class="doc-p"><strong>Two scoreboards: golf score and character score.</strong></p>
<p class="doc-p"><strong>Some sessions: character score worth more than golf score. Reinforces that how you play matters as much as what you score.</strong></p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 5</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Explain the developmental rationale for teaching etiquette habits to 4-6 and rules to 6-9.</li></ul>
<ul class="doc-list"><li>List and explain the 5 Golf Habits for Ages 4-6.</li></ul>
<ul class="doc-list"><li>List and explain the 8 Golfer's Rules for Ages 6-9.</li></ul>
<ul class="doc-list"><li>Describe how you would use game design to teach the integrity scoring concept.</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>A 7-year-old is clearly not counting all their strokes and is deflated when peers score better.</strong></p>
<p class="doc-p"><strong>Design a response strategy that reinforces honest scoring without shaming or direct confrontation.</strong></p>
<p class="doc-bold-label">Live Demonstration (40%)</p>
<p class="doc-p"><strong>Coach must integrate rules and etiquette into a 15-minute game-based session showing:</strong></p>
<ul class="doc-list"><li>At least 2 rules embedded naturally into game design</li></ul>
<ul class="doc-list"><li>Growth Mindset language used to frame all rules and character values</li></ul>
<ul class="doc-list"><li>Etiquette habits practiced as ritual — not enforced as compliance</li></ul>
<ul class="doc-list"><li>Cultural identity language used throughout</li></ul>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L2_M6",
  title:"Module 6 \u2014 Skills Passport",
  icon:"\ud83d\udcd4",
  sections:[
    {h:`What Is the EduGolfKids Skills Passport?`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">What Is the EduGolfKids Skills Passport?</p>
<p class="doc-p"><strong>The Skills Passport is a personal, child-held record of golf skill development across the EduGolfKids program.</strong></p>
<p class="doc-p"><strong>It serves 4 functions:</strong></p>
<h4 class="doc-subheading">1. Developmental Milestone Tracking</h4>
<p class="doc-p"><strong>Each skill area has defined criteria for each LTAD stage (Active Start and FUNdamentals).</strong></p>
<p class="doc-p"><strong>Children progress through milestone levels within each skill area across multiple terms.</strong></p>
<p class="doc-p"><strong>Progress is non-linear and non-competitive — every child moves at their own developmental pace.</strong></p>
<h4 class="doc-subheading">2. Coach Accountability Tool</h4>
<p class="doc-p"><strong>The Skills Passport requires coaches to formally assess skill levels at the end of each term or program block.</strong></p>
<p class="doc-p"><strong>This ensures every child receives individualized attention and documented progress.</strong></p>
<p class="doc-p"><strong>It prevents coaching that favours more advanced children and ignores developing ones.</strong></p>
<h4 class="doc-subheading">3. Parent Communication Bridge</h4>
<p class="doc-p"><strong>Parents receive a tangible, meaningful summary of what their child achieved.</strong></p>
<p class="doc-p"><strong>Framed in developmental language — not golf scores or rankings.</strong></p>
<p class="doc-p"><strong>The Passport makes the value of the program visible to parents who may not understand golf.</strong></p>
<h4 class="doc-subheading">4. Program Integrity Standard</h4>
<p class="doc-p"><strong>Passport records create an audit trail that demonstrates EduGolfKids program quality.</strong></p>
<p class="doc-p"><strong>Licensees are accountable for Passport completion rates and outcome consistency.</strong></p>
<p class="doc-p"><strong>HQ can identify coaches or locations where development is inconsistent.</strong></p>`},
    {h:`Skills Passport Structure — The 5 Skill Areas`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Skills Passport Structure — The 5 Skill Areas</p>
<p class="doc-p"><strong>Every child's Passport covers 5 skill areas, each with two LTAD-stage levels:</strong></p>
<p class="doc-bold-label">Skill Area 1: Putting</p>
<p class="doc-p"><strong>Active Start Level (Ages 4-6):</strong></p>
<ul class="doc-list"><li>Strikes ball toward target from 3 feet — 3 of 5 attempts</li></ul>
<ul class="doc-list"><li>Demonstrates target direction awareness before striking</li></ul>
<ul class="doc-list"><li>Returns club to ground on FREEZE command</li></ul>
<p class="doc-p"><strong>FUNdamentals Level (Ages 6-9):</strong></p>
<ul class="doc-list"><li>Holes 3 of 5 putts from 4 feet through 6-inch gate</li></ul>
<ul class="doc-list"><li>Stops ball within 18 inches of target from 8 feet — 3 of 5</li></ul>
<ul class="doc-list"><li>Self-corrects direction using guided discovery without coach prompt</li></ul>
<p class="doc-bold-label">Skill Area 2: Chipping</p>
<p class="doc-p"><strong>Active Start Level (Ages 4-6):</strong></p>
<ul class="doc-list"><li>Achieves clean airborne contact — 3 of 5 attempts</li></ul>
<ul class="doc-list"><li>Ball lands within 3 feet of landing zone — 2 of 5 attempts</li></ul>
<ul class="doc-list"><li>Safe spacing and protocol compliance throughout</li></ul>
<p class="doc-p"><strong>FUNdamentals Level (Ages 6-9):</strong></p>
<ul class="doc-list"><li>Lands ball within 2 feet of target zone from 8 feet — 4 of 5</li></ul>
<ul class="doc-list"><li>Demonstrates landing zone vs finish zone understanding</li></ul>
<ul class="doc-list"><li>Describes difference between two club options in own words after exploration</li></ul>
<p class="doc-bold-label">Skill Area 3: Pitching (FUNdamentals only — Ages 6-9)</p>
<ul class="doc-list"><li>Carries ball minimum 20 feet in air — 3 of 5 attempts</li></ul>
<ul class="doc-list"><li>Lands ball within hula hoop target from 25 feet — 2 of 5</li></ul>
<ul class="doc-list"><li>Demonstrates weight transfer — holds lead foot balance for 2 seconds after impact — 3 of 5</li></ul>
<ul class="doc-list"><li>Carries ball over knee-height barrier — 3 of 5 attempts</li></ul>
<p class="doc-bold-label">Skill Area 4: Full Swing</p>
<p class="doc-p"><strong>Active Start Level (Ages 4-6):</strong></p>
<ul class="doc-list"><li>Strikes teed ball with functional motion — 3 of 5 attempts</li></ul>
<ul class="doc-list"><li>Ball carries minimum 10 feet — 2 of 5 attempts</li></ul>
<ul class="doc-list"><li>Holds recognisable finish position for 2 seconds — 3 of 5</li></ul>
<p class="doc-p"><strong>FUNdamentals Level (Ages 6-9):</strong></p>
<ul class="doc-list"><li>Strikes teed ball — minimum 20 feet carry — 4 of 5</li></ul>
<ul class="doc-list"><li>Lands ball within 15-foot zone from 40 feet — 3 of 5</li></ul>
<ul class="doc-list"><li>Demonstrates balanced finish held 3 seconds — 4 of 5</li></ul>
<ul class="doc-list"><li>Completes rhythm-based swing — counts back and through — 3 of 5</li></ul>
<p class="doc-bold-label">Skill Area 5: Golf Culture and Etiquette</p>
<p class="doc-p"><strong>Active Start Level (Ages 4-6):</strong></p>
<ul class="doc-list"><li>Freezes and remains quiet during other players' swings — consistently</li></ul>
<ul class="doc-list"><li>Participates in end-of-session equipment tidy-up without prompting</li></ul>
<ul class="doc-list"><li>Participates in handshake or fist bump closing ritual</li></ul>
<p class="doc-p"><strong>FUNdamentals Level (Ages 6-9):</strong></p>
<ul class="doc-list"><li>Counts and records own score honestly during game play</li></ul>
<ul class="doc-list"><li>Applies out of bounds rule correctly and self-penalises when ball goes OB</li></ul>
<ul class="doc-list"><li>Demonstrates at least 2 of the 6 character values (respect, integrity, patience, care, resilience, graciousness) in observed game play</li></ul>`},
    {h:`Assessment Process — How to Conduct a Skills Passport Assessment`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Assessment Process — How to Conduct a Skills Passport Assessment</p>
<p class="doc-p"><strong>Assessment occurs at the end of each program term or block — not during sessions.</strong></p>
<p class="doc-p"><strong>A term is typically 6-8 sessions. Assessment is a dedicated final session or the final 20 minutes of the last session.</strong></p>
<p class="doc-p"><strong>The 5-Step Assessment Protocol:</strong></p>
<p class="doc-bold-label">Step 1: Preparation</p>
<ul class="doc-list"><li>Review each child's previous Passport entries before assessment day</li></ul>
<ul class="doc-list"><li>Set up assessment stations — one per skill area</li></ul>
<ul class="doc-list"><li>Prepare score sheets for every child</li></ul>
<ul class="doc-list"><li>Brief assistant coach or parent helper on observation role if available</li></ul>
<p class="doc-bold-label">Step 2: Set the Tone</p>
<p class="doc-p"><strong>Before assessment begins, address the group:</strong></p>
<p class="doc-p"><strong>"Today is Passport day. This is not a test. It is a chance to show what you have been building. Every single one of you has improved this term. We are going to prove it."</strong></p>
<p class="doc-p"><strong>Growth Mindset framing is mandatory. Assessment anxiety in children is real and must be proactively managed.</strong></p>
<p class="doc-bold-label">Step 3: Rotate Through Stations</p>
<ul class="doc-list"><li>Children rotate through skill stations in groups of 2-3</li></ul>
<ul class="doc-list"><li>Each station: 5 attempts per relevant criterion</li></ul>
<ul class="doc-list"><li>Coach observes and records — does not instruct during assessment</li></ul>
<ul class="doc-list"><li>Maintain natural, game-like atmosphere — avoid clinical examination feel</li></ul>
<p class="doc-bold-label">Step 4: Record Results</p>
<ul class="doc-list"><li>Mark each criterion as: Achieved, Developing, or Not Yet</li></ul>
<ul class="doc-list"><li>Achieved: meets or exceeds the stated criterion</li></ul>
<ul class="doc-list"><li>Developing: shows progress toward criterion but not yet consistent</li></ul>
<ul class="doc-list"><li>Not Yet: criterion not demonstrated — further development needed</li></ul>
<p class="doc-p"><strong>Never record a result as a failure. "Not Yet" communicates that the journey continues.</strong></p>
<p class="doc-bold-label">Step 5: Complete and Communicate the Passport</p>
<ul class="doc-list"><li>Complete each child's Passport entry within 48 hours of assessment day</li></ul>
<ul class="doc-list"><li>Write one personalised sentence per child — a specific observation, not a generic comment</li></ul>
<ul class="doc-list"><li>Example: "James showed great distance control this term — his 8-foot putts were the most consistent we have seen."</li></ul>
<ul class="doc-list"><li>Communicate Passport results to parents via approved EduGolfKids channel</li></ul>`},
    {h:`Passport Integrity Standards`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Passport Integrity Standards</p>
<p class="doc-p"><strong>The Skills Passport only has value if every coach applies it consistently.</strong></p>
<p class="doc-p"><strong>Prohibited Practices:</strong></p>
<ul class="doc-list"><li>Marking a child as "Achieved" out of sympathy or to avoid a difficult parent conversation</li></ul>
<ul class="doc-list"><li>Conducting assessment as a rushed afterthought in the final 5 minutes of a session</li></ul>
<ul class="doc-list"><li>Recording results from memory days after assessment without contemporaneous notes</li></ul>
<ul class="doc-list"><li>Comparing one child's Passport to another's in any communication</li></ul>
<ul class="doc-list"><li>Using Passport results to rank children or create tiered groups within a session</li></ul>
<p class="doc-p"><strong>Required Practices:</strong></p>
<ul class="doc-list"><li>Every child receives a Passport entry at the end of every term — no exceptions</li></ul>
<ul class="doc-list"><li>Assessment is conducted using the stated criteria — no deviation or improvisation</li></ul>
<ul class="doc-list"><li>Results are communicated to parents with growth language and specific observations</li></ul>
<ul class="doc-list"><li>Coach signs and dates each Passport entry</li></ul>
<ul class="doc-list"><li>Passport records are retained by EduGolfKids HQ via the operating system</li></ul>
<p class="doc-p"><strong>Disputes and Escalations:</strong></p>
<p class="doc-p"><strong>If a parent disagrees with a Passport assessment outcome:</strong></p>
<ul class="doc-list"><li>Do not argue or defend defensively</li></ul>
<ul class="doc-list"><li>Acknowledge their concern: "I understand you feel [child] is further along. Let me walk you through what we assessed."</li></ul>
<ul class="doc-list"><li>Show the specific criteria and what was observed</li></ul>
<ul class="doc-list"><li>Offer a reassessment opportunity in the following session if warranted</li></ul>
<ul class="doc-list"><li>Escalate to HQ if dispute remains unresolved</li></ul>`},
    {h:`Using the Passport as a Motivation Tool`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Using the Passport as a Motivation Tool</p>
<p class="doc-p"><strong>The Skills Passport is most powerful when children feel ownership of it.</strong></p>
<p class="doc-p"><strong>Strategies to build child engagement with the Passport:</strong></p>
<ul class="doc-list"><li>Give children their own Passport card or digital record they can see between terms</li></ul>
<ul class="doc-list"><li>Frame each term's work as "working toward your next Passport entry"</li></ul>
<ul class="doc-list"><li>Celebrate Passport achievements publicly within the group — not rankings, but progress</li></ul>
<ul class="doc-list"><li>Create a "Passport wall" — children's names and skills achieved visible in the session space</li></ul>
<ul class="doc-list"><li>Introduce the concept of the Passport journey: "You are building something great. Session by session."</li></ul>
<p class="doc-p"><strong>Children who understand their own progress trajectory are more motivated, more resilient, and more engaged than those who receive only adult-reported outcomes.</strong></p>
<p class="doc-bold-label">(Dweck, 2006; Deci and Ryan Self-Determination Theory, 2000)</p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 6</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Describe the 4 functions of the Skills Passport.</li></ul>
<ul class="doc-list"><li>Explain the difference between Achieved, Developing, and Not Yet — and why "failure" language is prohibited.</li></ul>
<ul class="doc-list"><li>List all 5 Skill Areas and their criteria for both LTAD stages.</li></ul>
<ul class="doc-list"><li>Describe what a coach must do if a parent disputes a Passport outcome.</li></ul>
<p class="doc-bold-label">Practical Exercise (40%)</p>
<p class="doc-p"><strong>Coach must conduct a full Skills Passport assessment of a simulated group of 6 children across all 5 skill areas, demonstrating:</strong></p>
<ul class="doc-list"><li>Correct station setup and rotation management</li></ul>
<ul class="doc-list"><li>Growth Mindset tone throughout assessment</li></ul>
<ul class="doc-list"><li>Accurate use of Achieved / Developing / Not Yet criteria</li></ul>
<ul class="doc-list"><li>Completion of all Passport entries with personalised observations</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>A parent of a 7-year-old is unhappy that their child received "Developing" in full swing while a peer received "Achieved." Design the conversation response using the 4-step parent communication protocol from Level 1 Module 8.</strong></p>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L2_M7",
  title:"Module 7 \u2014 Video Analysis (CoachNow)",
  icon:"\ud83d\udcf1",
  sections:[
    {h:`Why Video Analysis Matters in Youth Golf Coaching`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Why Video Analysis Matters in Youth Golf Coaching</p>
<p class="doc-p"><strong>Traditional golf coaching relied on the coach's eye and verbal feedback.</strong></p>
<p class="doc-p"><strong>Research in motor learning shows that movement happens too fast for the human eye to capture accurately — even for experienced coaches.</strong></p>
<p class="doc-p"><strong>Video provides:</strong></p>
<ul class="doc-list"><li>Objective, frame-by-frame movement data unavailable to the naked eye</li></ul>
<ul class="doc-list"><li>A shared reference between coach and child — "look what WE see"</li></ul>
<ul class="doc-list"><li>Tangible progress evidence that parents can see across terms</li></ul>
<ul class="doc-list"><li>An accountability tool for the coach — patterns of error become visible over time</li></ul>
<p class="doc-p"><strong>CoachNow is the industry-leading mobile coaching platform used by PGA professionals, IMG Academy coaches, and junior development programs globally.</strong></p>
<p class="doc-p"><strong>EduGolfKids has adopted CoachNow as its standard video analysis tool because:</strong></p>
<ul class="doc-list"><li>Annotation tools are powerful and intuitive — drawing lines, angles, and slow-motion are all built in</li></ul>
<ul class="doc-list"><li>Secure client portal allows parents to see only their own child's videos</li></ul>
<ul class="doc-list"><li>Progress timelines allow coach and parent to compare swings across multiple terms</li></ul>
<ul class="doc-list"><li>Professional parent reports can be generated directly from the app</li></ul>
<ul class="doc-list"><li>HIPAA-compatible privacy settings protect child data</li></ul>`},
    {h:`CoachNow Setup and Consent Requirements`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">CoachNow Setup and Consent Requirements</p>
<p class="doc-p"><strong>Before using video analysis with any child:</strong></p>
<p class="doc-bold-label">Step 1: Obtain Written Consent</p>
<ul class="doc-list"><li>Parent or guardian must sign the EduGolfKids Video Consent Form before any video is captured</li></ul>
<ul class="doc-list"><li>Consent must specify: video will be used for coaching analysis and shared securely with parents only</li></ul>
<ul class="doc-list"><li>No video of a child may be shared publicly, on social media, or used for marketing without separate explicit written consent</li></ul>
<ul class="doc-list"><li>Consent forms are stored in the EduGolfKids operating system (Airtable)</li></ul>
<p class="doc-bold-label">Step 2: Set Up Parent Portal on CoachNow</p>
<ul class="doc-list"><li>Create a CoachNow profile for each child upon program enrollment</li></ul>
<ul class="doc-list"><li>Connect parent email to child's profile — parent receives secure access to their child's portal only</li></ul>
<ul class="doc-list"><li>Brief parents: "You will receive a link to your child's CoachNow portal. You will see their swing videos and my coaching notes there."</li></ul>
<p class="doc-bold-label">Step 3: Filming Protocol</p>
<ul class="doc-list"><li>Always film from the same angles: face-on and down-the-line</li></ul>
<ul class="doc-list"><li>Face-on: camera positioned level with child's hands, directly in front at 90 degrees</li></ul>
<ul class="doc-list"><li>Down-the-line: camera positioned level with child's hands, directly behind the ball-target line</li></ul>
<ul class="doc-list"><li>Use slow-motion capture (minimum 120fps) whenever available on device</li></ul>
<ul class="doc-list"><li>Film 3-5 consecutive swings per session — not just one</li></ul>
<ul class="doc-list"><li>Label every clip: child name, date, skill area, session number</li></ul>`},
    {h:`Common Swing Faults in Children Ages 4-10 and Constraint Responses`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Common Swing Faults in Children Ages 4-10 and Constraint Responses</p>
<p class="doc-bold-label">FAULT IDENTIFICATION SYSTEM</p>
<p class="doc-p"><strong>EduGolfKids coaches use a 3-step analysis process for every video review:</strong></p>
<p class="doc-bold-label">Step 1 — Identify: What is the movement pattern?</p>
<p class="doc-p"><strong>Step 2 — Classify: Is this a developmental stage pattern or a correctable movement inefficiency?</strong></p>
<p class="doc-p"><strong>Step 3 — Respond: What constraint drill addresses this without mechanical instruction?</strong></p>
<p class="doc-p"><strong>FAULT 1: Reverse Pivot — Weight moves to lead side on backswing, trail side on downswing</strong></p>
<p class="doc-p"><strong>What it looks like on video:</strong></p>
<ul class="doc-list"><li>Body leans toward target on backswing</li></ul>
<ul class="doc-list"><li>Body leans away from target on downswing</li></ul>
<ul class="doc-list"><li>Unbalanced finish leaning back</li></ul>
<p class="doc-p"><strong>Developmental note: Extremely common in 4-7 age group. Often self-corrects with physical maturity. Do not over-correct.</strong></p>
<p class="doc-p"><strong>Constraint Response:</strong></p>
<ul class="doc-list"><li>Trail foot back drill: place trail foot slightly further back than normal stance. This naturally promotes backswing weight shift.</li></ul>
<ul class="doc-list"><li>Step-through drill: child steps toward target with lead foot as they swing. Exaggerated but effective.</li></ul>
<ul class="doc-list"><li>Balloon behind trail hip: child must push hip into balloon on backswing. Tactile feedback.</li></ul>
<p class="doc-p"><strong>Video annotation: Draw a vertical line through child's spine at address. Show spine angle maintaining vs tilting on replay.</strong></p>
<p class="doc-p"><strong>Parent report language: "We noticed [child's] weight is exploring different patterns. We are using a fun step-through challenge to help them find a more powerful sequence. Great progress this term."</strong></p>
<p class="doc-p"><strong>FAULT 2: Early Extension — Hips thrust toward ball through impact, posture rises</strong></p>
<p class="doc-p"><strong>What it looks like on video:</strong></p>
<ul class="doc-list"><li>Hips move toward the ball as club approaches impact</li></ul>
<ul class="doc-list"><li>Upper body rises — standing up through impact</li></ul>
<ul class="doc-list"><li>Arms pushed away from body — chicken wing follow-through common result</li></ul>
<p class="doc-p"><strong>Developmental note: Common in 7-10 age group. Often caused by club being too long or too heavy.</strong></p>
<p class="doc-p"><strong>Constraint Response:</strong></p>
<ul class="doc-list"><li>Chair behind hips drill: place a chair or foam block directly behind the child's hips. Child must not touch chair through impact. Hip extension eliminated by constraint.</li></ul>
<ul class="doc-list"><li>Club length check: first response to early extension in children is always to check club fit. A club 2 inches too long creates this pattern reliably.</li></ul>
<ul class="doc-list"><li>Squat finish challenge: child must finish with slight knee flex maintained. Scoring: 1 point for any swing that maintains knee flex at finish.</li></ul>
<p class="doc-p"><strong>Video annotation: Draw a hip angle line at address. Show hip position at impact vs address.</strong></p>
<p class="doc-p"><strong>Parent report language: "[Child] is developing a powerful impact position. We are using some fun challenges to help them maintain their athletic posture through the swing. Strong progress."</strong></p>
<p class="doc-bold-label">FAULT 3: Over-the-Top — Club path moves outside-in, causing pulls and slices</p>
<p class="doc-p"><strong>What it looks like on video:</strong></p>
<ul class="doc-list"><li>Club moves steeply downward from outside the target line</li></ul>
<ul class="doc-list"><li>Ball starts left then curves further left (pull) or starts left then curves right (slice) for right-handed player</li></ul>
<ul class="doc-list"><li>Body opens to target very early in downswing</li></ul>
<p class="doc-p"><strong>Developmental note: One of the most common faults in children 7-10. Often caused by trying too hard to hit the ball far.</strong></p>
<p class="doc-p"><strong>Constraint Response:</strong></p>
<ul class="doc-list"><li>Head cover outside drill: place a head cover or small cone just outside the ball, 6 inches away. Child must swing without hitting the head cover. Constraint forces inside-out path.</li></ul>
<ul class="doc-list"><li>Reduce distance pressure: over-the-top often increases when child tries to hit far. Move target closer. Remove distance as the goal. Path corrects when effort reduces.</li></ul>
<ul class="doc-list"><li>Right-field target: ask child to aim at a target 20 degrees to the right (right-handed). Path naturally adjusts to match new target.</li></ul>
<p class="doc-p"><strong>Video annotation: Draw the target line. Draw the club path at impact. Show the angle difference.</strong></p>
<p class="doc-p"><strong>Parent report language: "[Child] is developing their swing path and we are seeing great improvement in ball flight direction. We are using some creative target challenges that are really helping."</strong></p>
<p class="doc-bold-label">FAULT 4: Casting — Club releases too early, losing lag and power</p>
<p class="doc-p"><strong>What it looks like on video:</strong></p>
<ul class="doc-list"><li>Club head passes hands well before impact</li></ul>
<ul class="doc-list"><li>Wrists fully release at the start of downswing — not at impact</li></ul>
<ul class="doc-list"><li>"Throwing" motion visible — like throwing a ball underhand</li></ul>
<p class="doc-p"><strong>Developmental note: Extremely common in 6-9 group. Often a natural product of trying to hit the ball up into the air. Do not over-treat in younger children — partially self-corrects with instruction.</strong></p>
<p class="doc-p"><strong>Constraint Response:</strong></p>
<ul class="doc-list"><li>Towel drill: tuck a small towel under trail arm at address. If towel drops before impact, casting occurred. Towel gives tactile feedback.</li></ul>
<ul class="doc-list"><li>Whoosh drill with reversed club: child swings club upside down. Loudest whoosh should be at ball position — not before. Child self-identifies where release is happening.</li></ul>
<ul class="doc-list"><li>Lag leader challenge: coach demonstrates exaggerated lag. Child copies. Exaggeration builds awareness.</li></ul>
<p class="doc-p"><strong>Video annotation: Draw the angle between lead arm and club shaft at the start of downswing. Show where this angle releases.</strong></p>
<p class="doc-p"><strong>Parent report language: "[Child] is building excellent swing timing. We are working on some fun challenges that will develop their power generation over the coming sessions."</strong></p>
<p class="doc-bold-label">FAULT 5: Sway — Lateral movement of the body instead of rotation</p>
<p class="doc-p"><strong>What it looks like on video:</strong></p>
<ul class="doc-list"><li>Head and body move laterally away from target on backswing</li></ul>
<ul class="doc-list"><li>No visible rotation — just a side-to-side shift</li></ul>
<ul class="doc-list"><li>Inconsistent contact and direction result</li></ul>
<p class="doc-p"><strong>Developmental note: Very common in 4-8 group. Related to developing rotational coordination. Partial self-correction expected with maturity.</strong></p>
<p class="doc-p"><strong>Constraint Response:</strong></p>
<ul class="doc-list"><li>Wall or chair constraint: place a foam block or chair to the outside of trail foot. Child must not touch it on backswing. Sway eliminated by physical boundary.</li></ul>
<ul class="doc-list"><li>Rotation ribbon: tie a light ribbon or band around child's waist. Show them how it twists when they rotate. They can see rotation happening in real time.</li></ul>
<ul class="doc-list"><li>Football turn drill: "Pretend you're turning to throw a football behind you." Children understand rotation from other sports. Transfer the pattern.</li></ul>`},
    {h:`Building a CoachNow Parent Report`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Building a CoachNow Parent Report</p>
<p class="doc-p"><strong>A CoachNow parent report is the most powerful parent communication tool available to an EduGolfKids coach.</strong></p>
<p class="doc-p"><strong>A video-backed report showing a child's swing at the start of the term vs the end of the term is worth more than any verbal update.</strong></p>
<p class="doc-p"><strong>Standard Report Structure:</strong></p>
<h4 class="doc-subheading">1. Progress Highlight Video</h4>
<p class="doc-p"><strong>Side-by-side comparison: session 1 swing vs final session swing.</strong></p>
<p class="doc-p"><strong>Annotated to show one positive development. No fault identification in parent-facing reports.</strong></p>
<p class="doc-p"><strong>Example annotation: "Look at how much more balanced the finish is here compared to week 1."</strong></p>
<h4 class="doc-subheading">2. Skill Highlight Summary</h4>
<p class="doc-p"><strong>3-4 sentences describing what the child worked on this term and what progress was observed.</strong></p>
<p class="doc-p"><strong>Growth language throughout. Specific, not generic.</strong></p>
<h4 class="doc-subheading">3. Skills Passport Summary</h4>
<p class="doc-p"><strong>State which Passport criteria were achieved, developing, or not yet.</strong></p>
<p class="doc-bold-label">Frame "Developing" and "Not Yet" positively: "We are continuing to build on..."</p>
<h4 class="doc-subheading">4. Next Term Preview</h4>
<p class="doc-p"><strong>One sentence on what the focus will be next term.</strong></p>
<p class="doc-p"><strong>"Next term we are going to work on [skill] — and based on this term's progress, [child] is going to love it."</strong></p>
<p class="doc-p"><strong>Report Delivery:</strong></p>
<ul class="doc-list"><li>Send via CoachNow portal — not email, not social media, not text</li></ul>
<ul class="doc-list"><li>Within 5 days of last session of term</li></ul>
<ul class="doc-list"><li>Every child receives a report — no exceptions</li></ul>`},
    {h:`Video Analysis in Session — With Children Present`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Video Analysis in Session — With Children Present</p>
<p class="doc-p"><strong>Using video during a session — not just for analysis afterward — is one of the most powerful engagement tools available.</strong></p>
<p class="doc-p"><strong>Guidelines for in-session video use:</strong></p>
<ul class="doc-list"><li>Always get verbal agreement from the child before filming: "Can I take a video so we can look at it together?"</li></ul>
<ul class="doc-list"><li>Show video to child within 60 seconds of capture — the connection to the feeling is strongest immediately</li></ul>
<ul class="doc-list"><li>Use guided discovery when showing video: "What do you notice? What looks good? What might you change?"</li></ul>
<ul class="doc-list"><li>Never show a video and immediately give correction — show first, ask, then guide</li></ul>
<ul class="doc-list"><li>Celebrate visible progress: "Look at that finish — that is so much better than last week."</li></ul>
<p class="doc-p"><strong>Growth Mindset framing for video review:</strong></p>
<p class="doc-p"><strong>"Video doesn't lie — and look what it's showing us. That's YOUR swing getting better."</strong></p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 7</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>List the 5 common swing faults and their constraint-based drill responses.</li></ul>
<ul class="doc-list"><li>Explain the consent requirements before any video is captured.</li></ul>
<ul class="doc-list"><li>Describe the structure of a CoachNow parent report.</li></ul>
<ul class="doc-list"><li>Explain why parent-facing reports must never include fault identification language.</li></ul>
<p class="doc-bold-label">Practical Assessment (40%)</p>
<p class="doc-p"><strong>Coach must film, annotate, and present a video analysis of a simulated swing, demonstrating:</strong></p>
<ul class="doc-list"><li>Correct filming angles and slow-motion capture</li></ul>
<ul class="doc-list"><li>Accurate fault identification using the 3-step analysis process</li></ul>
<ul class="doc-list"><li>Constraint drill prescription — not mechanical correction</li></ul>
<ul class="doc-list"><li>Growth-framed video annotation</li></ul>
<ul class="doc-list"><li>Completed parent report submitted via CoachNow within the assessment window</li></ul>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>Coach is given video footage of a child with an over-the-top swing path.</strong></p>
<p class="doc-p"><strong>Must: identify the fault, explain the developmental context, prescribe 2 constraint drills, and write the parent report summary.</strong></p>
<p class="doc-p"><strong>Automatic reassessment if:</strong></p>
<ul class="doc-list"><li>Video shared without consent verification</li></ul>
<ul class="doc-list"><li>Parent report contains fault identification or negative language</li></ul>
<ul class="doc-list"><li>Mechanical correction prescribed instead of constraint response</li></ul>
<ul class="doc-list"><li>Child shown video and immediately given correction without guided discovery question</li></ul>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>
<p class="doc-bold-label">Final Reinforcement — Level 2 Complete</p>
<p class="doc-p"><strong>You now hold the full EduGolfKids coaching system.</strong></p>
<p class="doc-p"><strong>Level 1 gave you the foundations:</strong></p>
<ul class="doc-list"><li>How children develop. How they learn. How they feel. How to protect them.</li></ul>
<p class="doc-p"><strong>Level 2 gives you the craft:</strong></p>
<ul class="doc-list"><li>How to teach putting, chipping, pitching, and full swing with evidence and precision</li></ul>
<ul class="doc-list"><li>How to assess with integrity and communicate with parents powerfully</li></ul>
<ul class="doc-list"><li>How to use technology to make progress visible and coaching accountable</li></ul>
<p class="doc-p"><strong>Together they make you something rare:</strong></p>
<p class="doc-p"><strong>A coach who understands both the science of development and the art of teaching golf.</strong></p>
<p class="doc-p"><strong>EduGolfKids does not produce average coaches.</strong></p>
<p class="doc-p"><strong>It produces the best coaches in youth golf.</strong></p>
<p class="doc-p"><strong>You are now one of them.</strong></p>`},
  ]
},
{
  id:"L2_M8",
  title:"Module 8 \u2014 Skills Session Safety",
  icon:"\u26a0\ufe0f",
  sections:[
    {h:`Module Overview`,b:`<p class="doc-p"><strong>FIELD SAFETY IN SKILLS SESSIONS — WEATHER, EQUIPMENT ZONES &amp; OUTDOOR PROTOCOLS</strong></p>
<h3 class="doc-section-title">📌 Module Purpose</h3>
<p class="doc-p">This module builds on the safety foundations established in Level 1 Module 11, with specific application to skills-based sessions involving putting, chipping, pitching, and full swing.</p>
<p class="doc-p">As sessions progress to full swing, the safety stakes increase. This module trains coaches to:</p>
<ul class="doc-list"><li>Apply the Weather Decision Framework specifically to skills sessions with clubs and balls</li></ul>
<ul class="doc-list"><li>Enforce elevated spacing and zone standards for chipping, pitching, and full swing</li></ul>
<ul class="doc-list"><li>Manage lightning evacuation when children are actively holding clubs</li></ul>
<ul class="doc-list"><li>Adapt safety protocols for indoor skills sessions</li></ul>
<ul class="doc-list"><li>Identify and correct unsafe behaviour in real time without disrupting session flow</li></ul>
<p class="doc-p"><strong>⚠  Full swing sessions involve children swinging metal and graphite clubs at speed. The margin for error is zero. Safety compliance in this module is non-negotiable.</strong></p>`},
    {h:`SKILLS SESSION WEATHER DECISION FRAMEWORK`,b:`<h3 class="doc-section-title">SECTION 1 — SKILLS SESSION WEATHER DECISION FRAMEWORK</h3>
<p class="doc-p">Apply the Level 1 Weather Decision Framework, with the following additional considerations for skills sessions:</p>
<p class="doc-p"><strong>Additional Weather Considerations for Skills Sessions:</strong></p>
<ul class="doc-list"><li>Wind above 20mph / 32km/h: foam balls acceptable for chipping and pitching — do NOT use range balls outdoors in high wind</li></ul>
<ul class="doc-list"><li>Wet grass: chipping and pitching from wet lies increases slip risk — consider moving to synthetic mat alternatives or indoor session</li></ul>
<ul class="doc-list"><li>Bright sun glare: if children cannot see the target clearly — adjust orientation of hitting zones or move session</li></ul>
<ul class="doc-list"><li>Lightning protocol is identical to Level 1 — 30/30 Rule applies in all skills sessions</li></ul>
<div class="doc-rule">RULE: In any skills session with full swing, the first sign of lightning ends the outdoor session immediately. No exceptions. No "let's finish this round."</div>`},
    {h:`EQUIPMENT ZONE SAFETY BY SKILL`,b:`<h3 class="doc-section-title">SECTION 2 — EQUIPMENT ZONE SAFETY BY SKILL</h3>
<p class="doc-p">Each skill has specific spacing requirements. These are non-negotiable minimums — they may be increased but never reduced.</p>
<p class="doc-p"><strong>Putting:</strong></p>
<ul class="doc-list"><li>Minimum 3 feet / 1 metre between each child</li></ul>
<ul class="doc-list"><li>No child walks across another child's putting line during activity</li></ul>
<ul class="doc-list"><li>RETRIEVE command — all children stop and wait before collecting balls</li></ul>
<p class="doc-p"><strong>Chipping:</strong></p>
<ul class="doc-list"><li>Minimum 5 feet / 1.5 metres between each child in the hitting zone</li></ul>
<ul class="doc-list"><li>All children must be behind the designated hitting line before any child chips</li></ul>
<ul class="doc-list"><li>No ball retrieval until all children in the zone have completed their chip</li></ul>
<ul class="doc-list"><li>Coach stands at the side of the hitting zone — never in front</li></ul>
<p class="doc-p"><strong>Pitching:</strong></p>
<ul class="doc-list"><li>Minimum 8 feet / 2.5 metres between each child in the hitting zone</li></ul>
<ul class="doc-list"><li>All children behind the hitting line before any pitch is made</li></ul>
<ul class="doc-list"><li>Pitching range: clear a minimum 30 metres in front — ensure no children, adults, or objects are in range</li></ul>
<ul class="doc-list"><li>Coach must visually confirm the landing zone is clear before signaling to pitch</li></ul>
<p class="doc-p"><strong>Full Swing:</strong></p>
<ul class="doc-list"><li>Minimum 10 feet / 3 metres between each child</li></ul>
<ul class="doc-list"><li>No child moves forward until RETRIEVE command is given by coach</li></ul>
<ul class="doc-list"><li>Coach stands behind and to the side of the hitting line — never forward of the hitting zone</li></ul>
<ul class="doc-list"><li>All children sit or kneel on the safety line during another child's swing if space is limited</li></ul>
<p class="doc-p"><strong>⚠  Children underestimate how far a golf club extends during a swing. Physical demonstration of the swing arc safety zone is required at the start of every full swing session.</strong></p>`},
    {h:`LIGHTNING EVACUATION WITH CLUBS IN HAND`,b:`<h3 class="doc-section-title">SECTION 3 — LIGHTNING EVACUATION WITH CLUBS IN HAND</h3>
<p class="doc-p">In a skills session, children may be mid-swing or holding clubs when lightning is observed. This creates an additional evacuation step.</p>
<p class="doc-p">Modified Lightning Evacuation — Skills Session:</p>
<div class="doc-rule">STEP 1 — FREEZE SIGNAL</div>
<ul class="doc-list"><li>Three whistle blasts — all children freeze immediately</li></ul>
<div class="doc-rule">STEP 2 — GROUND ALL CLUBS</div>
<ul class="doc-list"><li>"Clubs on the ground NOW." — use a calm, firm command</li></ul>
<ul class="doc-list"><li>Do not move until every club is on the ground</li></ul>
<ul class="doc-list"><li>Coach confirms visually — no child is holding a club</li></ul>
<div class="doc-rule">STEP 3 — MOVE TO SHELTER</div>
<ul class="doc-list"><li>Direct children to shelter as per Level 1 protocol</li></ul>
<ul class="doc-list"><li>Leave all clubs and equipment on the field — do not collect</li></ul>
<div class="doc-rule">STEP 4 — ACCOUNT AND NOTIFY</div>
<ul class="doc-list"><li>Full headcount inside shelter</li></ul>
<ul class="doc-list"><li>Notify school contact and parents as required</li></ul>
<div class="doc-rule">RULE: Never allow a child to carry a golf club during a lightning evacuation. Metal and graphite clubs are lightning conductors. Ground first, move second.</div>`},
    {h:`INDOOR SKILLS SESSION SAFETY ADAPTATIONS`,b:`<h3 class="doc-section-title">SECTION 4 — INDOOR SKILLS SESSION SAFETY ADAPTATIONS</h3>
<p class="doc-p">When weather requires moving indoors, the following adaptations apply:</p>
<ul class="doc-list"><li>Foam balls only — no hard balls indoors under any circumstance</li></ul>
<ul class="doc-list"><li>Hitting zones reduced to 3 metres depth — adjust cone placement accordingly</li></ul>
<ul class="doc-list"><li>Ceiling height must be assessed — full swing may not be appropriate in low-ceiling environments</li></ul>
<ul class="doc-list"><li>Wall buffer minimum 2 metres behind the target — reduce if necessary with foam targets</li></ul>
<ul class="doc-list"><li>Ensure no glass, fragile items, or other children are within the hitting arc</li></ul>
<ul class="doc-list"><li>Reduced swing length appropriate for space — half swing or chip-length swing indoors</li></ul>
<p class="doc-p"><strong>⚠  Never attempt a full driver or fairway wood swing indoors. Shortened iron or chip swings only in gym or multipurpose room environments.</strong></p>`},
    {h:`CORRECTING UNSAFE BEHAVIOUR IN REAL TIME`,b:`<h3 class="doc-section-title">SECTION 5 — CORRECTING UNSAFE BEHAVIOUR IN REAL TIME</h3>
<p class="doc-p">In skills sessions, unsafe behaviour must be corrected immediately and calmly. The following framework applies:</p>
<p class="doc-p"><strong>The Three-Step Correction:</strong></p>
<div class="doc-rule">STEP 1 — FREEZE THE SESSION</div>
<ul class="doc-list"><li>One whistle blast — all activity stops</li></ul>
<ul class="doc-list"><li>Never try to correct an individual while the rest of the group is still active</li></ul>
<div class="doc-rule">STEP 2 — CORRECT CALMLY AND CLEARLY</div>
<ul class="doc-list"><li>Address the group — not the individual by name in front of peers</li></ul>
<ul class="doc-list"><li>"We have a safety rule in EduGolfKids — clubs stay on the ground until I say hit. Let's all reset."</li></ul>
<ul class="doc-list"><li>Never shame or raise your voice — it creates anxiety, not compliance</li></ul>
<div class="doc-rule">STEP 3 — REINFORCE AND RESUME</div>
<ul class="doc-list"><li>Confirm everyone understands before resuming</li></ul>
<ul class="doc-list"><li>Acknowledge the group when they comply: "That is exactly right. Well done."</li></ul>
<div class="doc-rule">RULE: A child who repeatedly endangers others must be removed from the hitting zone for that activity. Seat them with you at the side. Do not return them until they can demonstrate the safety behaviour.</div>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 8</p>
<p class="doc-p">Written Assessment (minimum pass: 85%):</p>
<h4 class="doc-subheading">1.  What is the minimum spacing requirement for a full swing session and why?</h4>
<h4 class="doc-subheading">2.  A child is in the middle of a pitch shot when you see lightning. What do you do?</h4>
<p class="doc-p"><strong>3.  </strong>Wind is 30mph during your scheduled outdoor chipping session. No indoor space is confirmed. What are your options?</p>
<p class="doc-p"><strong>4.  </strong>A child repeatedly walks forward to retrieve their ball before the RETRIEVE command. How do you handle it?</p>
<p class="doc-p">Practical Assessment:</p>
<ul class="doc-list"><li>Coach must set up a compliant full swing hitting zone — correct spacing, cone placement, safety line — within 5 minutes.</li></ul>
<ul class="doc-list"><li>Coach must demonstrate a compliant mid-session lightning evacuation from a skills session including equipment grounding.</li></ul>`},
  ]
}
],

L3:[
{
  id:"L3_M1",
  title:"Module 1 \u2014 Finding &amp; Securing Schools",
  icon:"\ud83c\udfeb",
  sections:[
    {h:`Which Schools to Target First`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Which Schools to Target First</p>
<p class="doc-p"><strong>Not all schools are equal as EduGolfKids partners. Target in this order:</strong></p>
<p class="doc-bold-label">Tier 1: Private and Independent Schools</p>
<p class="doc-p"><strong>Start here. Always.</strong></p>
<p class="doc-p"><strong>Why private schools first:</strong></p>
<ul class="doc-list"><li>Decision-making is faster — the principal often has authority to approve a program without a district committee process</li></ul>
<ul class="doc-list"><li>Parents are actively seeking enrichment and extracurricular programs — demand is built in</li></ul>
<ul class="doc-list"><li>Families typically have the disposable income for a $20/lesson program without financial friction</li></ul>
<ul class="doc-list"><li>Private schools have more scheduling flexibility — they can create time for your program</li></ul>
<ul class="doc-list"><li>A successful private school partnership is the most powerful reference you can take to public schools</li></ul>
<ul class="doc-list"><li>Private school administrators talk to each other — one great partnership can generate warm referrals</li></ul>
<p class="doc-bold-label">Tier 2: Charter Schools and Magnet Schools</p>
<p class="doc-p"><strong>These schools operate with more autonomy than standard public schools.</strong></p>
<p class="doc-p"><strong>Decision-making is faster. Mission alignment is often strong — many focus on holistic child development.</strong></p>
<p class="doc-p"><strong>Approach after your first 1-2 private school partnerships are running successfully.</strong></p>
<p class="doc-bold-label">Tier 3: Public Elementary Schools</p>
<p class="doc-p"><strong>The largest market — but the longest sales cycle.</strong></p>
<p class="doc-p"><strong>Public schools require district approval, budget cycles, and committee sign-off in many cases.</strong></p>
<p class="doc-p"><strong>Approach these once you have established credibility — your private school track record does most of the selling for you.</strong></p>
<p class="doc-p"><strong>Some public schools will move fast if the program is positioned as no-cost to the school and parent-funded.</strong></p>
<p class="doc-bold-label">Tier 4: After-School Program Operators and YMCAs</p>
<p class="doc-p"><strong>These are not schools — but they are high-enrollment, program-hungry, and fast-moving.</strong></p>
<p class="doc-p"><strong>They provide volume quickly while your school pipeline builds.</strong></p>
<p class="doc-p"><strong>Consider these parallel to school outreach — not instead of it.</strong></p>`},
    {h:`Finding the Right Contact`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Finding the Right Contact</p>
<p class="doc-p"><strong>Your primary contact at any school is the Principal or Head of School.</strong></p>
<p class="doc-p"><strong>Not the PE teacher. Not the front desk. Not the district office.</strong></p>
<p class="doc-p"><strong>The decision-maker is the principal. Go there first and directly.</strong></p>
<p class="doc-p"><strong>How to find principal email addresses:</strong></p>
<ul class="doc-list"><li>School website — almost always listed on the About or Staff page</li></ul>
<ul class="doc-list"><li>Google: "[School Name] principal email" — often surfaces directly</li></ul>
<ul class="doc-list"><li>LinkedIn: search the school name and filter by "Principal" or "Head of School"</li></ul>
<ul class="doc-list"><li>District website: all school contacts often listed in a staff directory</li></ul>
<ul class="doc-list"><li>Simply call the front desk and ask: "Could you give me the principal's direct email? I'd like to send them information about an enrichment program."</li></ul>
<p class="doc-p"><strong>Build a school target list before you start outreach.</strong></p>
<p class="doc-p"><strong>Minimum 20 schools in your territory. Research and log:</strong></p>
<ul class="doc-list"><li>School name</li></ul>
<ul class="doc-list"><li>School type (private / charter / public)</li></ul>
<ul class="doc-list"><li>Approximate enrollment</li></ul>
<ul class="doc-list"><li>Principal name and email</li></ul>
<ul class="doc-list"><li>Phone number</li></ul>
<ul class="doc-list"><li>Notes: any existing enrichment programs, golf course proximity, parent demographic</li></ul>
<p class="doc-p"><strong>This list lives in your Airtable operating system. It is the foundation of your school pipeline.</strong></p>`},
    {h:`The First Contact Email`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The First Contact Email</p>
<p class="doc-p"><strong>Email before calling. Always.</strong></p>
<p class="doc-p"><strong>A cold call to a principal who has never heard of you is rarely effective.</strong></p>
<p class="doc-p"><strong>An email creates context, establishes professionalism, and gives them something to refer to when you call.</strong></p>
<p class="doc-p"><strong>The First Contact Email — Structure:</strong></p>
<p class="doc-bold-label">Subject line: Golf program for [School Name] students — enrichment opportunity</p>
<p class="doc-p"><strong>Body:</strong></p>
<p class="doc-bold-label">"Dear [Principal Name],</p>
<p class="doc-p"><strong>My name is [Your Name] and I operate EduGolfKids in [City/Area] — a structured golf development program designed specifically for children ages 4-10.</strong></p>
<p class="doc-p"><strong>We partner with schools to deliver certified, curriculum-aligned sessions during the school day or as an after-school enrichment activity. Our program:</strong></p>
<ul class="doc-list"><li>Is delivered by Level 1 and Level 2 certified coaches — fully background-checked and safeguarding trained</li></ul>
<ul class="doc-list"><li>Follows an evidence-based developmental curriculum aligned with Long-Term Athlete Development principles</li></ul>
<ul class="doc-list"><li>Requires no facility investment from the school — we bring everything</li></ul>
<ul class="doc-list"><li>Has zero cost to the school — families fund participation directly</li></ul>
<p class="doc-p"><strong>I would love 20 minutes of your time to share what we do and explore whether [School Name] would be a good fit.</strong></p>
<p class="doc-bold-label">Would you be available for a brief call or meeting in the next two weeks?</p>
<p class="doc-bold-label">Warm regards,</p>
<p class="doc-bold-label">[Your Name]</p>
<p class="doc-bold-label">EduGolfKids [Territory Name]</p>
<p class="doc-bold-label">[Phone] | [Email]"</p>
<p class="doc-p"><strong>Key elements of this email:</strong></p>
<ul class="doc-list"><li>Named the principal specifically — not "Dear Principal"</li></ul>
<ul class="doc-list"><li>Zero cost to school stated clearly — removes the biggest objection before the meeting</li></ul>
<ul class="doc-list"><li>No long pitch — just enough to get a meeting</li></ul>
<ul class="doc-list"><li>Specific time ask — "next two weeks" creates gentle urgency without pressure</li></ul>`},
    {h:`The Follow-Up Call`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The Follow-Up Call</p>
<p class="doc-p"><strong>Send the email. Wait 3 business days. Then call.</strong></p>
<p class="doc-p"><strong>Call script:</strong></p>
<p class="doc-p"><strong>"Hi, this is [Name] from EduGolfKids. I sent [Principal Name] an email a few days ago about an enrichment program for your students. I just wanted to make sure it arrived and see if there's a time I could come in for a brief meeting."</strong></p>
<p class="doc-p"><strong>If the principal is unavailable:</strong></p>
<p class="doc-p"><strong>"No problem at all — could you let them know I called? I'll try again tomorrow. Thank you so much."</strong></p>
<p class="doc-p"><strong>Follow up every 3-4 business days until you get a yes or a definitive no.</strong></p>
<p class="doc-p"><strong>Most licensees report that 60-70% of meetings are secured within 2-3 contact attempts.</strong></p>
<p class="doc-p"><strong>Do not give up after one email and one call. Persistence with professionalism is the differentiator.</strong></p>`},
    {h:`The School Meeting`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The School Meeting</p>
<p class="doc-p"><strong>This is the most important 20 minutes in your business.</strong></p>
<p class="doc-p"><strong>Come prepared. Come professional. Come with everything the principal needs to say yes in that meeting.</strong></p>
<p class="doc-p"><strong>What to bring:</strong></p>
<ul class="doc-list"><li>EduGolfKids program one-pager (branded, professional)</li></ul>
<ul class="doc-list"><li>Your coach certifications</li></ul>
<ul class="doc-list"><li>Background check documentation</li></ul>
<ul class="doc-list"><li>Insurance certificate</li></ul>
<ul class="doc-list"><li>Reference from another school if available</li></ul>
<ul class="doc-list"><li>Sample session plan</li></ul>
<ul class="doc-list"><li>Skills Passport sample</li></ul>
<ul class="doc-list"><li>Parent information letter template</li></ul>
<p class="doc-p"><strong>Meeting structure — 20 minutes:</strong></p>
<p class="doc-bold-label">Minutes 1-3: Build rapport</p>
<p class="doc-p"><strong>Ask about the school. Show genuine interest in their students and their program.</strong></p>
<p class="doc-p"><strong>"Tell me a bit about your school and your students — what age groups do you have most of?"</strong></p>
<p class="doc-p"><strong>Principals respond to people who care about their school — not people who are selling to it.</strong></p>
<p class="doc-bold-label">Minutes 3-10: Present EduGolfKids</p>
<p class="doc-p"><strong>Walk through the one-pager. Keep it simple and outcome-focused.</strong></p>
<p class="doc-p"><strong>Lead with what matters to them:</strong></p>
<ul class="doc-list"><li>Safe, certified, background-checked coaches</li></ul>
<ul class="doc-list"><li>No cost or administrative burden to the school</li></ul>
<ul class="doc-list"><li>Curriculum-aligned developmental program — not just a sport activity</li></ul>
<ul class="doc-list"><li>Parent-funded — school not responsible for fees</li></ul>
<ul class="doc-list"><li>Full insurance and liability coverage provided</li></ul>
<p class="doc-bold-label">Minutes 10-15: Address their questions</p>
<p class="doc-p"><strong>Most common principal questions and your responses:</strong></p>
<p class="doc-bold-label">Q: "Where would sessions take place?"</p>
<p class="doc-p"><strong>A: "We can use your gym, a multi-purpose room, or an outdoor space. We only need approximately 30x30 feet and a flat surface. We bring all equipment."</strong></p>
<p class="doc-bold-label">Q: "How does scheduling work?"</p>
<p class="doc-p"><strong>A: "We work entirely around your timetable. We can run before school, during lunch enrichment, after school, or integrated into a PE slot. Completely flexible."</strong></p>
<p class="doc-bold-label">Q: "What if parents complain or a child gets hurt?"</p>
<p class="doc-p"><strong>A: "Our coaches are safeguarding-trained and carry full liability insurance. We have a documented emergency action plan for every site. We have never had a serious incident."</strong></p>
<p class="doc-bold-label">Q: "Do we need to do anything?"</p>
<p class="doc-p"><strong>A: "Very little. We handle enrollment, parent communication, and billing. We just need your permission to be here and a contact person on staff we can coordinate with."</strong></p>
<p class="doc-bold-label">Minutes 15-20: Close</p>
<p class="doc-p"><strong>Do not leave without a next step. Ever.</strong></p>
<p class="doc-p"><strong>"Based on what we've discussed, is there anything that would prevent you from moving forward? I can have a simple agreement and all documentation to you by end of this week."</strong></p>
<p class="doc-p"><strong>If they are not ready to commit:</strong></p>
<p class="doc-p"><strong>"Completely understand. What would you need to see before feeling comfortable moving forward?"</strong></p>
<p class="doc-p"><strong>Address the specific obstacle. Then follow up within 48 hours.</strong></p>`},
    {h:`The School Agreement`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The School Agreement</p>
<p class="doc-p"><strong>Every school partnership must be documented in a signed agreement.</strong></p>
<p class="doc-p"><strong>Verbal agreements are not sufficient. They create disputes, scope confusion, and liability exposure.</strong></p>
<p class="doc-p"><strong>The EduGolfKids School Partnership Agreement covers:</strong></p>
<ul class="doc-list"><li>Program description and scope</li></ul>
<ul class="doc-list"><li>Session schedule and frequency</li></ul>
<ul class="doc-list"><li>Space requirements and access</li></ul>
<ul class="doc-list"><li>Fee structure — including any school facility fee or revenue share</li></ul>
<ul class="doc-list"><li>Insurance and liability responsibilities</li></ul>
<ul class="doc-list"><li>Safeguarding and background check confirmation</li></ul>
<ul class="doc-list"><li>Photo and video consent process</li></ul>
<ul class="doc-list"><li>Notice period for program termination by either party</li></ul>
<p class="doc-p"><strong>Agreement template is provided by EduGolfKids HQ. Do not create your own.</strong></p>
<p class="doc-p"><strong>Any modifications to the standard agreement require HQ approval.</strong></p>`},
    {h:`Building Long-Term School Relationships`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Building Long-Term School Relationships</p>
<p class="doc-p"><strong>Securing a school is the beginning — not the achievement.</strong></p>
<p class="doc-p"><strong>The value of a school partnership compounds over time. A school you have been in for 3 years is worth far more than a new school — because:</strong></p>
<ul class="doc-list"><li>Enrollment grows as word spreads among parents</li></ul>
<ul class="doc-list"><li>Trust with the principal creates scheduling and expansion opportunities</li></ul>
<ul class="doc-list"><li>Your coaches know the space, the staff, and the students</li></ul>
<ul class="doc-list"><li>Churn is low — satisfied families re-enroll each term</li></ul>
<p class="doc-p"><strong>Relationship-building behaviors that licensees report as most impactful:</strong></p>
<ul class="doc-list"><li>Send the principal a brief end-of-term summary — 5 children assessed, Skills Passports completed, zero incidents</li></ul>
<ul class="doc-list"><li>Invite the principal to observe a session once per year — they become advocates when they see it firsthand</li></ul>
<ul class="doc-list"><li>Acknowledge school events — send a note of congratulations when the school achieves something notable</li></ul>
<ul class="doc-list"><li>Never cause administrative problems — be the easiest program the school works with</li></ul>
<ul class="doc-list"><li>When something goes wrong (and occasionally it will), address it immediately and professionally — principals remember how you handle problems</li></ul>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 1</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Explain the school tiering system and why private schools are approached first.</li></ul>
<ul class="doc-list"><li>Write a first-contact email for a fictional private school using the correct structure.</li></ul>
<ul class="doc-list"><li>List the 5 most common principal objections and their responses.</li></ul>
<p class="doc-bold-label">Practical Exercise (40%)</p>
<p class="doc-p"><strong>Licensee must conduct a simulated school meeting with an evaluator playing the role of a principal. Must demonstrate: rapport building, clear program presentation, objection handling, and a closed next step.</strong></p>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>A principal is interested but says their PE teacher needs to approve it first. Design your response and follow-up strategy.</strong></p>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L3_M2",
  title:"Module 2 \u2014 Recruiting &amp; Hiring Coaches",
  icon:"\ud83d\udc64",
  sections:[
    {h:`The EduGolfKids Ideal Coach Profile`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The EduGolfKids Ideal Coach Profile</p>
<p class="doc-p"><strong>Before recruiting, you must know exactly who you are looking for.</strong></p>
<p class="doc-p"><strong>Non-negotiable qualities:</strong></p>
<ul class="doc-list"><li>Genuine enjoyment of working with children — not tolerance, genuine enjoyment</li></ul>
<ul class="doc-list"><li>Energy and enthusiasm — sessions require sustained positive energy for 60 minutes</li></ul>
<ul class="doc-list"><li>Reliability and punctuality — schools have zero tolerance for coaches who are late or absent</li></ul>
<ul class="doc-list"><li>Communication skills — clear, warm, professional with both children and adults</li></ul>
<ul class="doc-list"><li>Coachability — willingness to follow the EduGolfKids system exactly as designed</li></ul>
<p class="doc-p"><strong>Strongly preferred qualities:</strong></p>
<ul class="doc-list"><li>Background in education, childcare, youth sport coaching, or teaching</li></ul>
<ul class="doc-list"><li>Some golf knowledge or interest — does not need to be a scratch golfer</li></ul>
<ul class="doc-list"><li>Experience in structured environments — classrooms, camps, sports programs</li></ul>
<ul class="doc-list"><li>Physical fitness — sessions are active and coaches are on their feet for hours</li></ul>
<p class="doc-p"><strong>Red flags — do not hire regardless of golf ability:</strong></p>
<ul class="doc-list"><li>No prior experience with children in any capacity</li></ul>
<ul class="doc-list"><li>Impatience or short temper visible in any stage of the hiring process</li></ul>
<ul class="doc-list"><li>Resistance to following a structured program — "I like to do things my own way"</li></ul>
<ul class="doc-list"><li>Unreliable communication during the hiring process — if they ghost you now, they will ghost a school</li></ul>
<ul class="doc-list"><li>Condescending tone toward children even in casual conversation</li></ul>
<p class="doc-p"><strong>Golf ability is the last thing you assess. Character and child-focus come first.</strong></p>
<p class="doc-p"><strong>A patient, energetic former teacher with a 20 handicap will outperform an impatient scratch golfer every time in this role.</strong></p>`},
    {h:`Where to Find Coaches`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Where to Find Coaches</p>
<p class="doc-bold-label">Channel 1: Indeed (Primary Channel)</p>
<p class="doc-p"><strong>Indeed is the most effective paid recruitment channel for EduGolfKids coach roles.</strong></p>
<p class="doc-p"><strong>Cost per hire is low. Candidate volume is high. Speed to interview is fast.</strong></p>
<p class="doc-p"><strong>The EduGolfKids Indeed Ad — Structure:</strong></p>
<p class="doc-bold-label">Job Title: Youth Golf Coach — EduGolfKids (Part-Time / Flexible Hours)</p>
<p class="doc-p"><strong>Opening paragraph:</strong></p>
<p class="doc-p"><strong>"Are you passionate about working with children and helping them build confidence through sport? EduGolfKids is looking for energetic, child-focused coaches to deliver our award-winning junior golf program in schools across [territory]. No prior golf coaching experience required — full training and certification provided."</strong></p>
<p class="doc-p"><strong>Key responsibilities section:</strong></p>
<ul class="doc-list"><li>Deliver structured 60-minute EduGolfKids sessions to children ages 4-10 in school settings</li></ul>
<ul class="doc-list"><li>Build positive, safe, and engaging learning environments</li></ul>
<ul class="doc-list"><li>Assess children's progress using the EduGolfKids Skills Passport system</li></ul>
<ul class="doc-list"><li>Communicate professionally with school staff and parents</li></ul>
<ul class="doc-list"><li>Maintain all EduGolfKids safety and safeguarding standards</li></ul>
<p class="doc-p"><strong>Requirements section:</strong></p>
<ul class="doc-list"><li>Genuine passion for working with children — this is the most important requirement</li></ul>
<ul class="doc-list"><li>Reliable, punctual, and professional</li></ul>
<ul class="doc-list"><li>Comfortable being active and energetic for extended periods</li></ul>
<ul class="doc-list"><li>Background in teaching, childcare, youth sport, or education preferred</li></ul>
<ul class="doc-list"><li>Some golf knowledge is a plus — but full coaching training is provided</li></ul>
<ul class="doc-list"><li>Must be willing to complete background screening and EduGolfKids certification</li></ul>
<p class="doc-p"><strong>What we offer section:</strong></p>
<ul class="doc-list"><li>Flexible part-time hours — morning, afternoon, and after-school slots available</li></ul>
<ul class="doc-list"><li>Full EduGolfKids Level 1 and Level 2 coaching certification provided</li></ul>
<ul class="doc-list"><li>Competitive hourly rate</li></ul>
<ul class="doc-list"><li>Supportive team environment</li></ul>
<ul class="doc-list"><li>Opportunity to grow with the program</li></ul>
<p class="doc-p"><strong>Indeed targeting tips:</strong></p>
<ul class="doc-list"><li>Target age range: 20-35</li></ul>
<ul class="doc-list"><li>Job categories: Education, Sports and Recreation, Childcare</li></ul>
<ul class="doc-list"><li>Location: set to your territory radius</li></ul>
<ul class="doc-list"><li>Schedule: Part-time, contract</li></ul>
<ul class="doc-list"><li>Boost the post — a $50-100 boost significantly increases visibility and application volume</li></ul>
<p class="doc-bold-label">Channel 2: School Teachers and Education Networks</p>
<p class="doc-p"><strong>School teachers are one of the best coach profiles for EduGolfKids.</strong></p>
<p class="doc-p"><strong>They already know how to manage groups of children, communicate with parents, and operate in school environments.</strong></p>
<p class="doc-p"><strong>How to reach teachers:</strong></p>
<ul class="doc-list"><li>Post in Facebook groups for teachers in your area — "Teachers looking for extra income," "Educators side jobs"</li></ul>
<ul class="doc-list"><li>Ask your existing school partners to share the opportunity with their staff</li></ul>
<ul class="doc-list"><li>Connect with university education departments — student teachers looking for part-time work</li></ul>
<ul class="doc-list"><li>Post on university job boards targeting education, sport science, and kinesiology students</li></ul>
<p class="doc-bold-label">Channel 3: University Sport Science and Physical Education Programs</p>
<p class="doc-p"><strong>Final-year sport science and PE students are an excellent pipeline.</strong></p>
<p class="doc-p"><strong>They have theoretical knowledge of child development, they are enthusiastic, and they work for competitive rates.</strong></p>
<p class="doc-p"><strong>Many will continue after graduation if the role fits their career path.</strong></p>
<p class="doc-bold-label">Channel 4: Personal Network and Referrals</p>
<p class="doc-p"><strong>Ask your existing coaches to refer people they know.</strong></p>
<p class="doc-p"><strong>A referral from a trusted coach is the highest-quality candidate source available.</strong></p>
<p class="doc-p"><strong>Consider a small referral bonus: "If your referral completes certification and works 3 months, you receive [bonus]."</strong></p>
<p class="doc-bold-label">Channel 5: Local Golf Clubs and Driving Ranges</p>
<p class="doc-p"><strong>Junior golf assistants, range staff, and club members who play recreationally are worth approaching.</strong></p>
<p class="doc-p"><strong>They have golf knowledge but may need development on child communication skills.</strong></p>
<p class="doc-p"><strong>Only approach if the candidate shows strong people skills alongside golf interest.</strong></p>`},
    {h:`The Screening and Interview Process`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The Screening and Interview Process</p>
<p class="doc-bold-label">Step 1: Application Review</p>
<p class="doc-p"><strong>You will receive applications that range from perfectly matched to completely unsuitable.</strong></p>
<p class="doc-p"><strong>Screen quickly using three filters:</strong></p>
<ul class="doc-list"><li>Any experience with children? If zero in any form — low priority</li></ul>
<ul class="doc-list"><li>Tone of the application — do they sound warm and enthusiastic or transactional?</li></ul>
<ul class="doc-list"><li>Reliability signals — did they follow the application instructions? Did they spell your company name correctly?</li></ul>
<p class="doc-bold-label">Step 2: Phone Screen (10-15 minutes)</p>
<p class="doc-p"><strong>Before investing time in a face-to-face interview, do a brief phone screen.</strong></p>
<p class="doc-p"><strong>This filters out candidates who do not present well verbally — a critical requirement for this role.</strong></p>
<p class="doc-p"><strong>Phone screen questions:</strong></p>
<ul class="doc-list"><li>"Tell me about your experience working with children."</li></ul>
<ul class="doc-list"><li>"What would you do if a child became very frustrated and refused to participate?"</li></ul>
<ul class="doc-list"><li>"How would you describe your energy level in a group setting with 8 excited 6-year-olds?"</li></ul>
<ul class="doc-list"><li>"This role requires you to follow a structured curriculum. How do you feel about that?"</li></ul>
<p class="doc-p"><strong>Look for: warmth, specific examples, enthusiasm that comes through even on the phone.</strong></p>
<p class="doc-p"><strong>Red flag: generic answers, hesitation about working with difficult children, resistance to structure.</strong></p>
<p class="doc-bold-label">Step 3: In-Person or Video Interview</p>
<p class="doc-p"><strong>Invite your top phone screen candidates for a 30-minute structured interview.</strong></p>
<p class="doc-p"><strong>Core interview questions:</strong></p>
<ul class="doc-list"><li>"Tell me about a time you had to manage a group of energetic children. What worked?"</li></ul>
<ul class="doc-list"><li>"A parent approaches you after a session and says their child was ignored. How do you respond?"</li></ul>
<ul class="doc-list"><li>"Why do you want to work with young children specifically? What do you find rewarding about it?"</li></ul>
<ul class="doc-list"><li>"EduGolfKids has a very specific way of doing things — a full curriculum and system. Some coaches find that limiting. How do you feel about it?"</li></ul>
<ul class="doc-list"><li>"What does a great session with a 5-year-old look like to you?"</li></ul>
<p class="doc-bold-label">Step 4: Practical Assessment</p>
<p class="doc-p"><strong>The single most predictive screening tool: watch them interact with children for 10 minutes.</strong></p>
<p class="doc-p"><strong>If possible, invite the candidate to observe a live session and assist with one activity.</strong></p>
<p class="doc-p"><strong>You will know within 5 minutes whether they have the instinct for this role.</strong></p>
<p class="doc-p"><strong>Natural warmth with children cannot be trained. Everything else can.</strong></p>`},
    {h:`Hiring, Onboarding, and Certification`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Hiring, Onboarding, and Certification</p>
<p class="doc-p"><strong>Once you have identified the right candidate:</strong></p>
<p class="doc-bold-label">Step 1: Background Check</p>
<p class="doc-p"><strong>Non-negotiable before any offer is made or accepted.</strong></p>
<ul class="doc-list"><li>State-level criminal background check</li></ul>
<ul class="doc-list"><li>National sex offender registry screening</li></ul>
<ul class="doc-list"><li>Employment eligibility verification</li></ul>
<p class="doc-p"><strong>No coach enters a school environment without cleared background check documentation on file.</strong></p>
<p class="doc-bold-label">Step 2: Offer and Employment Structure</p>
<p class="doc-p"><strong>Most EduGolfKids coaches work as part-time employees or independent contractors depending on your territory structure.</strong></p>
<p class="doc-p"><strong>Consult with a local employment attorney or HR advisor to determine the correct classification for your market.</strong></p>
<p class="doc-p"><strong>Key compensation principles:</strong></p>
<ul class="doc-list"><li>Pay per session is the most common structure — simpler to manage with variable school schedules</li></ul>
<ul class="doc-list"><li>Rate should reflect the skill and certification level required</li></ul>
<ul class="doc-list"><li>As coaches gain experience and take on more schools, their rate should increase — retention depends on it</li></ul>
<p class="doc-bold-label">Step 3: EduGolfKids Certification Enrollment</p>
<ul class="doc-list"><li>Enroll new coach in TalentLMS immediately upon hiring</li></ul>
<ul class="doc-list"><li>Set a clear certification completion deadline — Level 1 within 4 weeks of start date</li></ul>
<ul class="doc-list"><li>Coach may observe sessions before certification but may not lead sessions independently</li></ul>
<ul class="doc-list"><li>Level 2 must be completed before coach leads skills-specific curriculum</li></ul>
<p class="doc-bold-label">Step 4: Shadowing and Supervised Sessions</p>
<ul class="doc-list"><li>New coach shadows an experienced coach for minimum 2 sessions</li></ul>
<ul class="doc-list"><li>New coach co-delivers 2 sessions with experienced coach present</li></ul>
<ul class="doc-list"><li>New coach leads first independent session with licensee present</li></ul>
<ul class="doc-list"><li>Licensee debrief after first independent session — structured feedback using Growth Mindset language</li></ul>
<p class="doc-bold-label">Step 5: Ongoing Development</p>
<ul class="doc-list"><li>Monthly team check-ins — share what is working, address challenges</li></ul>
<ul class="doc-list"><li>Quarterly observation — licensee or senior coach observes each coach once per quarter</li></ul>
<ul class="doc-list"><li>Annual re-certification — coaches complete a refresher module each year</li></ul>`},
    {h:`Retaining Great Coaches`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Retaining Great Coaches</p>
<p class="doc-p"><strong>Retention is cheaper than recruitment. Every time you lose a great coach you lose:</strong></p>
<ul class="doc-list"><li>3-4 weeks of recruitment time</li></ul>
<ul class="doc-list"><li>4-6 weeks of training time</li></ul>
<ul class="doc-list"><li>The relationship they had built with their schools and students</li></ul>
<ul class="doc-list"><li>Continuity of the program at their schools — which risks losing the school</li></ul>
<p class="doc-p"><strong>What retains great coaches:</strong></p>
<ul class="doc-list"><li>Feeling valued — acknowledge great work specifically and regularly</li></ul>
<ul class="doc-list"><li>Progression — clear pathway from coach to lead coach to possible territory management</li></ul>
<ul class="doc-list"><li>Flexibility — this role attracts people who need schedule flexibility. Protect it.</li></ul>
<ul class="doc-list"><li>Pay increases tied to performance and school growth</li></ul>
<ul class="doc-list"><li>A team culture — coaches who feel part of something bigger than a part-time job stay longer</li></ul>
<p class="doc-p"><strong>Simple retention practice from EduGolfKids operators:</strong></p>
<p class="doc-p"><strong>A brief monthly message to each coach: "You did a great job at [school] this month. [Specific observation]. Really appreciate you." Costs nothing. Builds loyalty.</strong></p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 2</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Describe the EduGolfKids ideal coach profile including non-negotiables and red flags.</li></ul>
<ul class="doc-list"><li>Write a complete Indeed job advertisement for an EduGolfKids coach role.</li></ul>
<ul class="doc-list"><li>List the 5 recruitment channels and explain when each is most effective.</li></ul>
<p class="doc-bold-label">Practical Exercise (40%)</p>
<p class="doc-p"><strong>Licensee must conduct a simulated 15-minute coach interview, demonstrating: structured questioning, practical assessment design, red flag identification, and professional offer process.</strong></p>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>Your best coach has been offered a full-time teaching job and is considering leaving. Design your retention conversation.</strong></p>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L3_M3",
  title:"Module 3 \u2014 Marketing &amp; Enrollment",
  icon:"\ud83d\udce2",
  sections:[
    {h:`The EduGolfKids Marketing Hierarchy`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The EduGolfKids Marketing Hierarchy</p>
<p class="doc-p"><strong>Not all marketing activities deliver equal return. Prioritize in this order:</strong></p>
<p class="doc-bold-label">Tier 1: Demo Days and Parent Information Sessions</p>
<p class="doc-p"><strong>Highest conversion rate. Best use of your time. Nothing else comes close.</strong></p>
<p class="doc-p"><strong>A parent who sees their child hit a golf ball and smile in a 10-minute demo will enroll that child on the spot more than 60% of the time.</strong></p>
<p class="doc-bold-label">Tier 2: School Newsletters and Direct-to-Parent Communication</p>
<p class="doc-p"><strong>The school already has the audience. Getting your message into school communications is the most efficient distribution available.</strong></p>
<p class="doc-p"><strong>Cost: zero. Reach: every parent in the school.</strong></p>
<p class="doc-bold-label">Tier 3: Free Trial Vouchers and Referral Programs</p>
<p class="doc-p"><strong>A free lesson voucher lowers the enrollment barrier to zero.</strong></p>
<p class="doc-p"><strong>A referral program turns your enrolled families into a sales force.</strong></p>
<p class="doc-bold-label">Tier 4: Social Media</p>
<p class="doc-p"><strong>Effective for visibility and credibility — not for direct enrollment conversion.</strong></p>
<p class="doc-p"><strong>Use it to document what you do, not to advertise what you sell.</strong></p>
<p class="doc-bold-label">Tier 5: Physical Mailers and Flyers</p>
<p class="doc-p"><strong>Effective when distributed through school bags — low cost, direct reach.</strong></p>
<p class="doc-p"><strong>Less effective as general area distribution.</strong></p>
<p class="doc-bold-label">Tier 6: Paid Digital Advertising</p>
<p class="doc-p"><strong>Lowest priority. Not necessary to fill a program in most markets.</strong></p>
<p class="doc-p"><strong>Only consider if all Tier 1-5 channels are maximized and you still have open spots.</strong></p>`},
    {h:`Demo Days — The Single Most Powerful Enrollment Tool`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Demo Days — The Single Most Powerful Enrollment Tool</p>
<p class="doc-p"><strong>A demo day is a 30-45 minute free taster session held at the school, open to any child who wants to participate.</strong></p>
<p class="doc-p"><strong>Parents are invited to watch.</strong></p>
<p class="doc-p"><strong>At the end of the demo, enrollment forms are available and spots are offered immediately.</strong></p>
<p class="doc-p"><strong>Why demo days work so powerfully:</strong></p>
<ul class="doc-list"><li>Children experience the program firsthand — they go home asking to sign up</li></ul>
<ul class="doc-list"><li>Parents see their child engaged, safe, smiling, and learning — this removes every hesitation</li></ul>
<ul class="doc-list"><li>The coach is visible and relatable — parents enroll their children in a person, not a program</li></ul>
<ul class="doc-list"><li>Social proof is immediate — when parents see 15 children having a great time, they want their child included</li></ul>
<p class="doc-p"><strong>How to organize a demo day:</strong></p>
<p class="doc-bold-label">Step 1: Get school approval and scheduling</p>
<p class="doc-p"><strong>Present the demo day to the principal as a free gift to the school — a fun experience for students with no cost or obligation.</strong></p>
<p class="doc-p"><strong>Ask for a time when parents can be present: after-school slot or during a school event day works best.</strong></p>
<p class="doc-bold-label">Step 2: Prepare the session</p>
<p class="doc-p"><strong>Design a 30-minute version of the EduGolfKids session architecture:</strong></p>
<ul class="doc-list"><li>5 minutes: energetic welcome game — every child immediately active</li></ul>
<ul class="doc-list"><li>15 minutes: putting and chipping challenges — high success rate, immediate fun</li></ul>
<ul class="doc-list"><li>5 minutes: team scoring game with prizes</li></ul>
<ul class="doc-list"><li>5 minutes: parent Q and A and enrollment opportunity</li></ul>
<p class="doc-bold-label">Step 3: Prepare enrollment materials</p>
<ul class="doc-list"><li>Enrollment forms — simple, one page</li></ul>
<ul class="doc-list"><li>Program information sheet for parents</li></ul>
<ul class="doc-list"><li>Skills Passport sample to show parents what their child will receive</li></ul>
<ul class="doc-list"><li>Pricing clearly stated</li></ul>
<ul class="doc-list"><li>Early bird offer: first term discount for enrollment on the day</li></ul>
<p class="doc-bold-label">Step 4: Run the demo</p>
<p class="doc-p"><strong>Your energy in this session is your marketing.</strong></p>
<p class="doc-p"><strong>Be the most enthusiastic, warm, and professional version of yourself.</strong></p>
<p class="doc-p"><strong>Every child who leaves that demo day smiling is a potential enrollment.</strong></p>
<p class="doc-bold-label">Step 5: Follow up within 48 hours</p>
<p class="doc-p"><strong>Send a follow-up email to every family that attended but did not enroll on the day.</strong></p>
<p class="doc-p"><strong>"It was wonderful to meet [child's name] yesterday. They were fantastic. We still have [X] spots available for the upcoming term — I'd love to have them join us."</strong></p>
<p class="doc-p"><strong>EduGolfKids operator benchmark: a well-run demo day at a new school converts 40-70% of attendees to enrollment.</strong></p>`},
    {h:`Parent Information Sessions`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Parent Information Sessions</p>
<p class="doc-p"><strong>A parent information session is a 20-30 minute evening presentation for parents — without children present.</strong></p>
<p class="doc-p"><strong>It is more persuasive for skeptical parents than a demo day because it gives them space to ask questions and understand the program deeply.</strong></p>
<p class="doc-p"><strong>Information session structure:</strong></p>
<p class="doc-p"><strong>Opening (3 minutes):</strong></p>
<p class="doc-p"><strong>Welcome. Brief background on you and EduGolfKids.</strong></p>
<p class="doc-p"><strong>"Tonight I want to show you exactly what your child will experience, what they will learn, and why this program is different from anything else available for children their age."</strong></p>
<p class="doc-p"><strong>The Why (5 minutes):</strong></p>
<p class="doc-p"><strong>Share the developmental philosophy in accessible language.</strong></p>
<p class="doc-p"><strong>"Golf is the vehicle. What we are really building is confidence, focus, resilience, and movement skills that benefit your child in everything they do."</strong></p>
<p class="doc-p"><strong>Reference the science briefly — parents respond well to knowing there is research behind the program.</strong></p>
<p class="doc-p"><strong>What a session looks like (5 minutes):</strong></p>
<p class="doc-p"><strong>Show a short video clip of a session if available. Walk through the 60-minute structure.</strong></p>
<p class="doc-p"><strong>Parents need to visualize their child in the program.</strong></p>
<p class="doc-p"><strong>The Skills Passport (3 minutes):</strong></p>
<p class="doc-p"><strong>Show the Passport. Explain that every child receives a documented assessment at the end of each term.</strong></p>
<p class="doc-p"><strong>Parents love this. It makes progress tangible and visible.</strong></p>
<p class="doc-p"><strong>Safety and qualifications (3 minutes):</strong></p>
<p class="doc-p"><strong>Background checks, certifications, insurance, safeguarding. Cover it confidently. Parents need to know their child is safe.</strong></p>
<p class="doc-p"><strong>Pricing and enrollment (3 minutes):</strong></p>
<p class="doc-p"><strong>Clear, simple, no surprises.</strong></p>
<p class="doc-p"><strong>Offer an enrollment incentive for signing up tonight.</strong></p>
<p class="doc-p"><strong>Q and A (5 minutes):</strong></p>
<p class="doc-p"><strong>Welcome every question. Answer with warmth and specificity.</strong></p>
<p class="doc-p"><strong>Unanswered questions become enrollment objections.</strong></p>`},
    {h:`School-Based Marketing Channels`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">School-Based Marketing Channels</p>
<p class="doc-bold-label">School Newsletter</p>
<p class="doc-p"><strong>Every school sends a regular newsletter to parents — digital, printed, or both.</strong></p>
<p class="doc-p"><strong>Request a standing feature or advertisement in the newsletter.</strong></p>
<p class="doc-p"><strong>Most principals will agree if you provide clean, professional copy that requires no editing from them.</strong></p>
<p class="doc-p"><strong>Newsletter copy template:</strong></p>
<p class="doc-bold-label">"EduGolfKids — Building Confident Young Athletes</p>
<p class="doc-p"><strong>Our certified golf program for ages 4-10 is now enrolling at [School Name]. Children develop movement skills, confidence, and focus through structured, play-based golf sessions delivered by certified coaches. Skills Passport tracking included. [Term dates and pricing]. Contact [email/phone] to enroll."</strong></p>
<p class="doc-bold-label">School Bag Flyer</p>
<p class="doc-p"><strong>A single A5 flyer placed in every child's school bag is one of the highest-reach distribution methods available.</strong></p>
<p class="doc-p"><strong>Most schools will permit this if the flyer is professional and the program is approved.</strong></p>
<p class="doc-p"><strong>Include a QR code linking to enrollment.</strong></p>
<p class="doc-p"><strong>Include a free trial voucher on the flyer — this dramatically increases response rate.</strong></p>
<p class="doc-bold-label">Notice Board and Reception Posters</p>
<p class="doc-p"><strong>Poster displayed in school reception and notice boards.</strong></p>
<p class="doc-p"><strong>Simple design: one image of children enjoying golf, three bullet points of benefits, contact information, and QR code.</strong></p>
<p class="doc-bold-label">School Social Media Pages</p>
<p class="doc-p"><strong>Most schools have active Facebook and Instagram pages followed by their parent community.</strong></p>
<p class="doc-p"><strong>Ask the principal or communications coordinator to share a post about your program.</strong></p>
<p class="doc-p"><strong>Provide them with a ready-to-post caption and image — make it zero effort for them.</strong></p>`},
    {h:`Free Trial Vouchers and the Referral System`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Free Trial Vouchers and the Referral System</p>
<p class="doc-bold-label">Free Trial Voucher</p>
<p class="doc-p"><strong>A voucher offering a free first lesson removes the enrollment barrier completely.</strong></p>
<p class="doc-p"><strong>Distribute vouchers via:</strong></p>
<ul class="doc-list"><li>School bag flyers</li></ul>
<ul class="doc-list"><li>Demo day handouts</li></ul>
<ul class="doc-list"><li>School newsletter feature</li></ul>
<ul class="doc-list"><li>Social media posts</li></ul>
<p class="doc-p"><strong>Voucher design principles:</strong></p>
<ul class="doc-list"><li>Valid for a specific term start — creates urgency</li></ul>
<ul class="doc-list"><li>Redeemable for one child for one free session</li></ul>
<ul class="doc-list"><li>Family bring-a-friend: "Bring a friend and both receive a free first session"</li></ul>
<ul class="doc-list"><li>Expires after term start — do not allow indefinite open vouchers</li></ul>
<p class="doc-bold-label">The Bring-a-Friend Referral System</p>
<p class="doc-p"><strong>Your most powerful enrollment tool after demo days.</strong></p>
<p class="doc-p"><strong>Enrolled families who refer a friend are your most trusted marketing channel.</strong></p>
<p class="doc-p"><strong>Every parent who is satisfied with EduGolfKids knows 3-5 other parents with children the same age.</strong></p>
<p class="doc-p"><strong>How to activate referrals:</strong></p>
<ul class="doc-list"><li>At the start of each term: "We have [X] spots remaining. If you know a family who would love this program, here is a voucher for their child's first free lesson."</li></ul>
<ul class="doc-list"><li>Referral incentive: if a referred family enrolls for a full term, the referring family receives a discount on next term</li></ul>
<ul class="doc-list"><li>End of term email: "Thank you for an amazing term. If you enjoyed the program, please share our details with a friend."</li></ul>`},
    {h:`Retention Marketing — Keeping Children Enrolled`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Retention Marketing — Keeping Children Enrolled</p>
<p class="doc-p"><strong>Acquiring a new student costs more than retaining an existing one.</strong></p>
<p class="doc-p"><strong>Your marketing does not stop at enrollment — it continues throughout the program.</strong></p>
<p class="doc-p"><strong>Field Intelligence — EduGolfKids Operator Experience:</strong></p>
<p class="doc-p"><strong>"Little things like Player of the Week and phoning a student on their birthday work really well."</strong></p>
<p class="doc-p"><strong>This is one of the most underestimated insights in this manual. The emotional connection parents and children feel toward a program that recognizes their child personally is extraordinarily powerful. These moments cost almost nothing and build fierce loyalty.</strong></p>
<p class="doc-bold-label">Player of the Week</p>
<p class="doc-p"><strong>Every week, one child is recognized as Player of the Week.</strong></p>
<p class="doc-p"><strong>Not for best golf — for effort, improvement, attitude, or a specific achievement.</strong></p>
<p class="doc-p"><strong>How to implement:</strong></p>
<ul class="doc-list"><li>Announce at the end of the session in front of the group</li></ul>
<ul class="doc-list"><li>Give the child a small card or certificate to take home</li></ul>
<ul class="doc-list"><li>Post on your social media (with consent) — tag the school</li></ul>
<ul class="doc-list"><li>Parent receives a personal message from the coach: "[Child's name] was our Player of the Week this week. Here is what we noticed..."</li></ul>
<p class="doc-p"><strong>Impact: the parent shares it. Other parents see it. It becomes something every child wants to earn.</strong></p>
<p class="doc-bold-label">Birthday Phone Call</p>
<p class="doc-p"><strong>On a student's birthday, the coach calls or sends a personal voice message.</strong></p>
<p class="doc-p"><strong>"Happy birthday [name]! We are so proud of everything you have achieved in EduGolfKids. We cannot wait to see you at your next session."</strong></p>
<p class="doc-p"><strong>This takes 2 minutes. The family remembers it for years.</strong></p>
<p class="doc-p"><strong>Log all student birthdays in your Airtable operating system. Set automated reminders.</strong></p>
<p class="doc-bold-label">End-of-Term Recognition</p>
<p class="doc-p"><strong>At the final session of each term:</strong></p>
<ul class="doc-list"><li>Skills Passport completion ceremony — each child receives their updated Passport</li></ul>
<ul class="doc-list"><li>Group recognition of achievements — effort, improvement, attitude celebrated publicly</li></ul>
<ul class="doc-list"><li>Next term preview — build excitement for what is coming</li></ul>
<ul class="doc-list"><li>Re-enrollment offered on the day with early bird incentive</li></ul>
<p class="doc-bold-label">Parent Communication Cadence</p>
<p class="doc-p"><strong>Regular, positive communication keeps parents connected and reduces churn.</strong></p>
<ul class="doc-list"><li>Week 1: Welcome message — "We are thrilled [child] has joined us. Here is what to expect."</li></ul>
<ul class="doc-list"><li>Mid-term: Progress update — one specific positive observation per child</li></ul>
<ul class="doc-list"><li>End of term: Skills Passport report via CoachNow — full video and written summary</li></ul>
<ul class="doc-list"><li>Between terms: Re-enrollment reminder with next term details</li></ul>`},
    {h:`Social Media for EduGolfKids`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Social Media for EduGolfKids</p>
<p class="doc-p"><strong>Social media is not your primary enrollment tool. It is your credibility tool.</strong></p>
<p class="doc-p"><strong>Parents who hear about EduGolfKids from a friend will check your social media before enrolling.</strong></p>
<p class="doc-p"><strong>What they find there must build confidence — not raise questions.</strong></p>
<p class="doc-p"><strong>Platforms to use:</strong></p>
<ul class="doc-list"><li>Facebook: Primary platform for parent demographics. School community groups are high-value.</li></ul>
<ul class="doc-list"><li>Instagram: Strong for visual content — session photos (with consent), Player of the Week, program moments.</li></ul>
<p class="doc-p"><strong>Content that works:</strong></p>
<ul class="doc-list"><li>Short video clips of sessions — children actively engaged, coaches enthusiastic (consent required)</li></ul>
<ul class="doc-list"><li>Player of the Week posts — recognition content gets high engagement from family networks</li></ul>
<ul class="doc-list"><li>Behind the scenes — setting up a session, Skills Passport moment, demo day preparation</li></ul>
<ul class="doc-list"><li>Education content — "Did you know? Children who play golf develop..." shares your expertise</li></ul>
<ul class="doc-list"><li>Testimonials — parent or child quotes about the program</li></ul>
<p class="doc-p"><strong>Content that does not work:</strong></p>
<ul class="doc-list"><li>Pure promotional posts — "Enroll now! $20 per session!" — people scroll past this</li></ul>
<ul class="doc-list"><li>Golf technique content aimed at adults — wrong audience</li></ul>
<ul class="doc-list"><li>Inconsistent posting — a dead social feed raises more doubt than no feed at all</li></ul>
<p class="doc-p"><strong>Posting frequency: 3-4 times per week during active terms. 1-2 times per week during breaks.</strong></p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 3</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>List the EduGolfKids marketing hierarchy and explain why demo days rank highest.</li></ul>
<ul class="doc-list"><li>Design a complete demo day plan including session structure and parent enrollment close.</li></ul>
<ul class="doc-list"><li>Describe the Player of the Week and Birthday Call programs and explain their retention value.</li></ul>
<p class="doc-bold-label">Practical Exercise (40%)</p>
<p class="doc-p"><strong>Licensee must present a simulated 10-minute parent information session to evaluators playing the role of prospective parents. Must demonstrate: clear program value proposition, objection handling, and a confident enrollment close.</strong></p>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>A school has given you permission to run a demo day but only 4 children show up instead of the 15 you expected. How do you run the session and what do you do immediately after?</strong></p>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L3_M4",
  title:"Module 4 \u2014 Pricing, Revenue &amp; Financial Management",
  icon:"\ud83d\udcb0",
  sections:[
    {h:`The EduGolfKids Pricing Model`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The EduGolfKids Pricing Model</p>
<p class="doc-bold-label">Base Price: $20 per child per lesson</p>
<p class="doc-bold-label">Class size: Maximum 7 children per coach per session</p>
<p class="doc-bold-label">Sessions per month: 4 (minimum)</p>
<p class="doc-bold-label">Revenue per class per month: $20 x 7 x 4 = $560</p>
<p class="doc-p"><strong>This is the foundation. Everything else is built on it.</strong></p>
<p class="doc-bold-label">Why $20 per child?</p>
<ul class="doc-list"><li>Accessible to middle-income families — not a luxury price point</li></ul>
<ul class="doc-list"><li>Low enough to reduce enrollment hesitation</li></ul>
<ul class="doc-list"><li>High enough to generate meaningful revenue at scale</li></ul>
<ul class="doc-list"><li>Competitive against comparable youth enrichment programs (swimming, gymnastics, martial arts average $15-25 per session)</li></ul>
<p class="doc-bold-label">Why maximum 7 children per class?</p>
<ul class="doc-list"><li>Safety: the EduGolfKids spacing and supervision standards require a maximum coach-to-child ratio of 1:7</li></ul>
<ul class="doc-list"><li>Quality: individual attention, Skills Passport tracking, and engagement management are all compromised above 7</li></ul>
<ul class="doc-list"><li>Revenue: 7 x $20 = $140 per session — this is the target session revenue</li></ul>
<ul class="doc-list"><li>Never be pressured by a school or parent to exceed 7 children per coach</li></ul>
<p class="doc-bold-label">Why 4 sessions per month?</p>
<ul class="doc-list"><li>Predictable monthly invoice amount — parents know exactly what they pay</li></ul>
<ul class="doc-list"><li>4 sessions builds the learning momentum required by the EduGolfKids curriculum</li></ul>
<ul class="doc-list"><li>Monthly consistency builds habit — children and parents plan around it</li></ul>
<ul class="doc-list"><li>Revenue is protected — 4 sessions is the minimum; never allow 3-session months</li></ul>`},
    {h:`School Facility Fees and Revenue Share`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">School Facility Fees and Revenue Share</p>
<p class="doc-p"><strong>Some schools will ask for a facility fee, a room rental charge, or a revenue share as a condition of partnership.</strong></p>
<p class="doc-p"><strong>This is normal and acceptable — as long as it is handled correctly.</strong></p>
<p class="doc-p"><strong>Field Intelligence: "If schools charge a fee or rent, add the percentage or fee on top of your $20 a child per lesson."</strong></p>
<p class="doc-p"><strong>This is the correct approach. The school fee is a cost of doing business at that location — it is passed directly to the parent through a price adjustment.</strong></p>
<p class="doc-p"><strong>How to calculate the adjusted price:</strong></p>
<p class="doc-bold-label">Example 1: School charges a flat facility fee of $50 per month</p>
<p class="doc-bold-label">$50 / (7 children x 4 sessions) = $1.79 per child per session</p>
<p class="doc-bold-label">Adjusted price: $20 + $1.79 = $21.79 — round up to $22 per child per session</p>
<p class="doc-bold-label">Example 2: School requests 10% revenue share</p>
<p class="doc-p"><strong>$20 base price. 10% = $2. Adjusted price: $22 per child per session.</strong></p>
<p class="doc-p"><strong>School receives $2 per child per session from your collections.</strong></p>
<p class="doc-p"><strong>Always document the fee structure in the school agreement.</strong></p>
<p class="doc-p"><strong>Never absorb school fees into your margin — this erodes profitability rapidly at scale.</strong></p>
<p class="doc-p"><strong>Be transparent with parents: if the price at one school is $22 and another is $20, it is because of the school's facility structure. You do not need to apologize for this.</strong></p>`},
    {h:`Revenue Model: From One Class to Full School Capacity`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Revenue Model: From One Class to Full School Capacity</p>
<p class="doc-p"><strong>The EduGolfKids scale model builds revenue in layers within each school before expanding to new schools.</strong></p>
<p class="doc-bold-label">Layer 1: One Class, One Coach</p>
<p class="doc-p"><strong>7 children. 4 sessions per month. $140 per session. $560 per month gross revenue from one class.</strong></p>
<p class="doc-p"><strong>This is your starting point at a new school.</strong></p>
<p class="doc-bold-label">Layer 2: Two Classes, One Coach</p>
<p class="doc-p"><strong>Most schools can accommodate two consecutive sessions on the same day.</strong></p>
<p class="doc-p"><strong>Morning class: 7 children. Afternoon class: 7 children.</strong></p>
<p class="doc-p"><strong>Revenue: $560 x 2 = $1,120 per month gross from one school with one coach.</strong></p>
<p class="doc-p"><strong>Coach is paid for two sessions. Your margin is the difference.</strong></p>
<p class="doc-bold-label">Layer 3: Three Coaches, Multiple Classes</p>
<p class="doc-p"><strong>Field Intelligence: "Once you have a school, try to get up to 3 coaches teaching at the same time."</strong></p>
<p class="doc-p"><strong>This is the target school capacity model:</strong></p>
<ul class="doc-list"><li>3 coaches running simultaneously</li></ul>
<ul class="doc-list"><li>3 classes of 7 children each</li></ul>
<ul class="doc-list"><li>21 children served per session</li></ul>
<ul class="doc-list"><li>Revenue per session: 21 x $20 = $420</li></ul>
<ul class="doc-list"><li>Revenue per month: $420 x 4 = $1,680 gross from one school</li></ul>
<p class="doc-p"><strong>At this capacity, one school generates $1,680 gross per month.</strong></p>
<p class="doc-p"><strong>Coach costs at a reasonable session rate: 3 coaches x 4 sessions x $35 per session = $420 per month.</strong></p>
<p class="doc-p"><strong>Net from one fully occupied school: approximately $1,260 per month before other costs.</strong></p>
<p class="doc-bold-label">Layer 4: Multiple Schools at Full Capacity</p>
<p class="doc-p"><strong>5 schools at full capacity:</strong></p>
<p class="doc-bold-label">5 x $1,680 gross = $8,400 gross per month</p>
<p class="doc-bold-label">5 x $420 coach costs = $2,100 per month</p>
<p class="doc-bold-label">Net before overhead: approximately $6,300 per month</p>
<p class="doc-p"><strong>10 schools at full capacity:</strong></p>
<p class="doc-bold-label">$16,800 gross per month</p>
<p class="doc-bold-label">Net before overhead: approximately $12,600 per month</p>
<p class="doc-p"><strong>The math is simple. The discipline is to fill each school before adding the next.</strong></p>
<p class="doc-p"><strong>Field Intelligence: "The ideal business is to get as many schools fully occupied with coaches and students before trying to grow further."</strong></p>
<p class="doc-p"><strong>This is one of the most important principles in this manual. Premature expansion before existing schools are optimized dilutes quality, stretches the licensee too thin, and produces schools that are mediocre rather than excellent.</strong></p>`},
    {h:`Protecting Revenue — The 4-Lessons-Per-Month Rule`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Protecting Revenue — The 4-Lessons-Per-Month Rule</p>
<p class="doc-p"><strong>Field Intelligence: "Always make sure you do 4 lessons a month — even if the weather is bad or you miss a lesson, arrange make-up lessons not to lose revenue."</strong></p>
<p class="doc-p"><strong>This is a critical financial protection principle. Here is why it matters:</strong></p>
<p class="doc-p"><strong>Revenue loss from missed sessions:</strong></p>
<ul class="doc-list"><li>One missed session at full capacity = $140 lost per class</li></ul>
<ul class="doc-list"><li>3 classes missed = $420 lost in a single week</li></ul>
<ul class="doc-list"><li>If this happens twice per term, that is $840 of revenue that simply disappears</li></ul>
<p class="doc-p"><strong>The Make-Up Session Protocol:</strong></p>
<ul class="doc-list"><li>Any session missed due to weather, school event, or unavoidable cancellation must be rescheduled within the same billing month where possible</li></ul>
<ul class="doc-list"><li>If same-month make-up is not possible, it is scheduled in the first week of the following month — and that month's invoice is adjusted to reflect 5 sessions</li></ul>
<ul class="doc-list"><li>Communicate cancellations and make-up scheduling to parents within 24 hours</li></ul>
<ul class="doc-list"><li>Never cancel without a confirmed make-up date — this is what separates a professional program from a hobby</li></ul>
<p class="doc-p"><strong>Weather Policy:</strong></p>
<ul class="doc-list"><li>Outdoor sessions: have an indoor contingency plan prepared for every outdoor session</li></ul>
<ul class="doc-list"><li>Identify an indoor space at each school that can serve as a backup location</li></ul>
<ul class="doc-list"><li>Gym-adapted sessions require only foam balls — always have this kit available</li></ul>
<ul class="doc-list"><li>Rain is not a cancellation reason. "We moved inside and had a great session" is your standard.</li></ul>
<p class="doc-p"><strong>School Holiday and Event Conflicts:</strong></p>
<ul class="doc-list"><li>Review the school calendar at the start of each term</li></ul>
<ul class="doc-list"><li>Identify all potential conflict dates in advance</li></ul>
<ul class="doc-list"><li>Schedule make-up sessions proactively — before parents ask</li></ul>
<ul class="doc-list"><li>Build the 4-session minimum into your term calendar before sending parent invoices</li></ul>`},
    {h:`Invoicing and Payment Collection`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Invoicing and Payment Collection</p>
<p class="doc-bold-label">Field Intelligence: "Send out monthly invoices."</p>
<p class="doc-p"><strong>Monthly invoicing is the correct model. It creates:</strong></p>
<ul class="doc-list"><li>Predictable cash flow — you know what is coming in each month</li></ul>
<ul class="doc-list"><li>Simple parent experience — one payment per month per child</li></ul>
<ul class="doc-list"><li>Clean administration — 12 invoices per year per family, not 48</li></ul>
<p class="doc-p"><strong>Invoice Structure:</strong></p>
<p class="doc-p"><strong>Invoice line items:</strong></p>
<ul class="doc-list"><li>EduGolfKids sessions: 4 x $20 = $80 per child per month (standard)</li></ul>
<ul class="doc-list"><li>Facility fee (if applicable): amount per month</li></ul>
<ul class="doc-list"><li>Total due</li></ul>
<ul class="doc-list"><li>Payment due date: 5 days before the start of the session month</li></ul>
<p class="doc-p"><strong>Invoice delivery:</strong></p>
<ul class="doc-list"><li>Send via email using your EduGolfKids billing tool or accounting software</li></ul>
<ul class="doc-list"><li>Include a payment link — make it one click</li></ul>
<ul class="doc-list"><li>Follow up on unpaid invoices on due date with a polite reminder</li></ul>
<p class="doc-p"><strong>Recommended accounting tools: QuickBooks, Wave (free), or FreshBooks for invoice management and payment collection.</strong></p>
<p class="doc-p"><strong>Payment Methods to Accept:</strong></p>
<ul class="doc-list"><li>Credit and debit card via online payment link (Stripe or Square)</li></ul>
<ul class="doc-list"><li>Bank transfer / ACH</li></ul>
<ul class="doc-list"><li>Check — accepted but not preferred due to processing time</li></ul>
<p class="doc-p"><strong>Do not accept cash for regular monthly fees — it creates tracking and accounting problems.</strong></p>
<p class="doc-p"><strong>Non-Payment Policy:</strong></p>
<ul class="doc-list"><li>Invoice unpaid after 7 days: send a polite reminder</li></ul>
<ul class="doc-list"><li>Invoice unpaid after 14 days: personal phone call</li></ul>
<ul class="doc-list"><li>Invoice unpaid after 21 days: child's spot is at risk — communicate this clearly but professionally</li></ul>
<ul class="doc-list"><li>Never allow families to accumulate more than one month of unpaid invoices</li></ul>
<p class="doc-p"><strong>A written payment policy given to every family at enrollment prevents most payment issues before they occur.</strong></p>`},
    {h:`Understanding Your Numbers`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Understanding Your Numbers</p>
<p class="doc-p"><strong>A licensee who does not know their numbers cannot manage their business.</strong></p>
<p class="doc-p"><strong>Know these figures at all times:</strong></p>
<p class="doc-bold-label">Gross Revenue: Total amount billed to all families before any costs</p>
<p class="doc-bold-label">Coach Costs: Total paid to coaches for sessions delivered</p>
<p class="doc-bold-label">Gross Margin: Gross Revenue minus Coach Costs</p>
<p class="doc-p"><strong>Overhead Costs: Equipment, insurance, certification platform, marketing materials, licensing fees</strong></p>
<p class="doc-bold-label">Net Profit: Gross Margin minus Overhead Costs</p>
<p class="doc-p"><strong>Benchmarks for a healthy EduGolfKids operation:</strong></p>
<ul class="doc-list"><li>Coach costs should not exceed 30-35% of gross revenue</li></ul>
<ul class="doc-list"><li>Overhead costs should not exceed 15-20% of gross revenue</li></ul>
<ul class="doc-list"><li>Net profit margin target: 45-55% of gross revenue</li></ul>
<p class="doc-p"><strong>If your margins are below these benchmarks, investigate:</strong></p>
<ul class="doc-list"><li>Are classes full? Partially filled classes destroy margin. 5 children in a class designed for 7 costs you $40 per session in lost revenue.</li></ul>
<ul class="doc-list"><li>Are coach costs too high? Review session rates against market rates.</li></ul>
<ul class="doc-list"><li>Are you paying school fees you are not passing on to parents?</li></ul>
<ul class="doc-list"><li>Is equipment being replaced too frequently? Establish an equipment maintenance and replacement schedule.</li></ul>
<p class="doc-p"><strong>Monthly financial review:</strong></p>
<p class="doc-p"><strong>Spend 30 minutes at the start of each month reviewing:</strong></p>
<ul class="doc-list"><li>Revenue collected vs revenue billed</li></ul>
<ul class="doc-list"><li>Outstanding invoices</li></ul>
<ul class="doc-list"><li>Coach costs vs budget</li></ul>
<ul class="doc-list"><li>Enrollment numbers — up, down, or flat at each school</li></ul>
<ul class="doc-list"><li>Any schools at risk of losing enrollment</li></ul>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 4</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Calculate the gross monthly revenue for a 3-coach, 3-class school at full capacity with a $50 flat facility fee.</li></ul>
<ul class="doc-list"><li>Describe the make-up session protocol and explain why the 4-lessons-per-month rule is a revenue protection measure.</li></ul>
<ul class="doc-list"><li>List the monthly financial review items a licensee must track.</li></ul>
<p class="doc-bold-label">Practical Exercise (40%)</p>
<p class="doc-p"><strong>Licensee must build a 12-month revenue projection for a 3-school operation, starting with 1 class per school and growing to full capacity, using the EduGolfKids pricing model. Must include coach costs, school fees (one school charges 10% revenue share), and projected net margin.</strong></p>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>A school cancels 2 sessions in one month due to a school event. How do you protect the revenue, communicate to parents, and schedule make-up sessions?</strong></p>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L3_M5",
  title:"Module 5 \u2014 Operations: Managing Multiple Schools",
  icon:"\u2699\ufe0f",
  sections:[
    {h:`The EduGolfKids Operating System`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The EduGolfKids Operating System</p>
<p class="doc-p"><strong>EduGolfKids uses Airtable as its central operating platform, with Softr as the front-end interface for coaches and administrators.</strong></p>
<p class="doc-p"><strong>Every licensee has access to the EduGolfKids operating system from day one.</strong></p>
<p class="doc-p"><strong>What the operating system manages:</strong></p>
<ul class="doc-list"><li>Schools: contact details, agreement status, session schedule, capacity, facility fee structure</li></ul>
<ul class="doc-list"><li>Coaches: certification status, assigned schools, session history, contact details</li></ul>
<ul class="doc-list"><li>Students: enrollment, age group, Skills Passport records, parent contact, birthday reminders</li></ul>
<ul class="doc-list"><li>Sessions: scheduled, completed, cancelled, and make-up sessions by school and coach</li></ul>
<ul class="doc-list"><li>Invoices: monthly billing status, outstanding payments, payment history per family</li></ul>
<ul class="doc-list"><li>Incidents: documented incidents, follow-up actions, resolution status</li></ul>
<p class="doc-p"><strong>The operating system is not optional. It is the backbone of a multi-school operation.</strong></p>
<p class="doc-p"><strong>A licensee running 3+ schools from a notebook and a mental map is one unexpected absence away from an operational collapse.</strong></p>`},
    {h:`Coach Management at Scale`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Coach Management at Scale</p>
<p class="doc-p"><strong>Managing 1 coach: simple. Managing 5-10 coaches across multiple schools: a different challenge entirely.</strong></p>
<p class="doc-p"><strong>The Coach Management Framework:</strong></p>
<h4 class="doc-subheading">1. Clear Role Expectations</h4>
<p class="doc-p"><strong>Every coach must have a written summary of:</strong></p>
<ul class="doc-list"><li>Their assigned schools and session schedule</li></ul>
<ul class="doc-list"><li>Their responsibilities before, during, and after each session</li></ul>
<ul class="doc-list"><li>Their reporting requirements — what they log in the operating system after every session</li></ul>
<ul class="doc-list"><li>Their communication expectations — how quickly they respond to the licensee</li></ul>
<p class="doc-p"><strong>Ambiguity about expectations is the most common cause of coach performance problems.</strong></p>
<h4 class="doc-subheading">2. Session Confirmation Protocol</h4>
<p class="doc-p"><strong>Before every session:</strong></p>
<ul class="doc-list"><li>Coach confirms attendance 24 hours in advance via operating system or agreed channel</li></ul>
<ul class="doc-list"><li>If a coach cannot attend: they notify licensee immediately — minimum 3 hours before session</li></ul>
<ul class="doc-list"><li>Licensee has a cover coach on call for every school — never leave a school without a coach</li></ul>
<p class="doc-p"><strong>Never rely on a single point of coach failure at a school. Always have a backup.</strong></p>
<h4 class="doc-subheading">3. Post-Session Logging</h4>
<p class="doc-p"><strong>After every session, coaches log in the operating system:</strong></p>
<ul class="doc-list"><li>Session completed — yes or no</li></ul>
<ul class="doc-list"><li>Number of children attended</li></ul>
<ul class="doc-list"><li>Any incidents or behavioral escalations</li></ul>
<ul class="doc-list"><li>Any parent concerns raised</li></ul>
<ul class="doc-list"><li>Equipment status — anything damaged or missing</li></ul>
<p class="doc-p"><strong>This takes 3 minutes. It protects you legally, operationally, and financially.</strong></p>
<h4 class="doc-subheading">4. Quarterly Coach Observation</h4>
<p class="doc-p"><strong>Every coach must be observed at minimum once per quarter.</strong></p>
<p class="doc-p"><strong>Observation checklist covers:</strong></p>
<ul class="doc-list"><li>Session architecture compliance — correct 60-minute structure</li></ul>
<ul class="doc-list"><li>Safety and spacing standards</li></ul>
<ul class="doc-list"><li>Language Code compliance — growth mindset language used</li></ul>
<ul class="doc-list"><li>Engagement management — all children active, no long lines</li></ul>
<ul class="doc-list"><li>Skills Passport awareness — coach is tracking progress</li></ul>
<p class="doc-p"><strong>Observation is not surveillance — it is development and quality assurance.</strong></p>
<p class="doc-p"><strong>Frame it positively: "I am coming to see what's working well and to support your development."</strong></p>
<h4 class="doc-subheading">5. Monthly Team Meeting</h4>
<p class="doc-p"><strong>One meeting per month — 30-45 minutes. In person or video call.</strong></p>
<p class="doc-p"><strong>Agenda:</strong></p>
<ul class="doc-list"><li>Wins from the past month — specific, genuine, celebrated</li></ul>
<ul class="doc-list"><li>Challenges — what is not working and how to solve it</li></ul>
<ul class="doc-list"><li>Upcoming dates — school events, cancellations, make-up sessions</li></ul>
<ul class="doc-list"><li>Skills Passport updates — any children ready for term assessment</li></ul>
<ul class="doc-list"><li>Training moment — 10 minutes on one coaching concept or scenario</li></ul>
<p class="doc-p"><strong>The monthly meeting builds team culture and keeps quality high. Skip it and quality gradually drifts.</strong></p>`},
    {h:`School Relationship Management at Scale`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">School Relationship Management at Scale</p>
<p class="doc-p"><strong>When you run multiple schools, your relationship management must be systematic — not dependent on memory.</strong></p>
<p class="doc-p"><strong>For each school, track in your operating system:</strong></p>
<ul class="doc-list"><li>Last contact with principal — date and topic</li></ul>
<ul class="doc-list"><li>Any open issues or pending items</li></ul>
<ul class="doc-list"><li>Upcoming school events that affect your schedule</li></ul>
<ul class="doc-list"><li>Enrollment trend — growing, stable, or declining</li></ul>
<ul class="doc-list"><li>Renewal date for school agreement</li></ul>
<p class="doc-p"><strong>Proactive school communication calendar:</strong></p>
<ul class="doc-list"><li>Start of term: brief message to principal — program dates confirmed, coach assigned, excited to be back</li></ul>
<ul class="doc-list"><li>Mid-term: short note — enrollment numbers, any highlights worth sharing</li></ul>
<ul class="doc-list"><li>End of term: summary message — children assessed, Skills Passports completed, zero incidents, thank you for the partnership</li></ul>
<ul class="doc-list"><li>Off-term: one touch per month — a relevant article, a program update, an enrollment figure for next term</li></ul>
<p class="doc-p"><strong>A principal who hears from you consistently and positively will fight to keep your program.</strong></p>
<p class="doc-p"><strong>A principal who only hears from you when there is a problem will not.</strong></p>`},
    {h:`Quality Control Across Multiple Locations`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Quality Control Across Multiple Locations</p>
<p class="doc-p"><strong>Quality is easy to maintain when you are the only coach. It becomes a management challenge when you have a team.</strong></p>
<p class="doc-p"><strong>Quality control tools:</strong></p>
<h4 class="doc-subheading">1. The Session Audit</h4>
<p class="doc-p"><strong>Random unannounced observation of one session per month across your school portfolio.</strong></p>
<p class="doc-p"><strong>Rotate schools so every school is observed at minimum once per quarter.</strong></p>
<p class="doc-p"><strong>Use the observation checklist from Section 2.</strong></p>
<h4 class="doc-subheading">2. Parent Feedback</h4>
<p class="doc-p"><strong>Brief end-of-term parent survey — 3 questions maximum:</strong></p>
<ul class="doc-list"><li>"How would you rate your child's experience this term?"</li></ul>
<ul class="doc-list"><li>"What did your child enjoy most?"</li></ul>
<ul class="doc-list"><li>"Is there anything we could improve?"</li></ul>
<p class="doc-p"><strong>Read every response. Act on patterns. Acknowledge individuals where appropriate.</strong></p>
<h4 class="doc-subheading">3. Skills Passport Completion Rate</h4>
<p class="doc-p"><strong>Every child must receive a Passport entry at the end of every term.</strong></p>
<p class="doc-p"><strong>Track completion rate in the operating system.</strong></p>
<p class="doc-p"><strong>A coach with less than 100% completion rate has a gap that must be addressed immediately.</strong></p>
<h4 class="doc-subheading">4. Incident Rate Monitoring</h4>
<p class="doc-p"><strong>Zero serious incidents is the target.</strong></p>
<p class="doc-p"><strong>Any incident beyond a minor trip or scrape must be reviewed in the monthly team meeting.</strong></p>
<p class="doc-p"><strong>Patterns of minor incidents at one school suggest a spacing or management issue that needs attention.</strong></p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 5</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Describe the 5 elements of the Coach Management Framework.</li></ul>
<ul class="doc-list"><li>List the data points tracked in the EduGolfKids operating system for each school.</li></ul>
<ul class="doc-list"><li>Explain how quality control is maintained across multiple schools.</li></ul>
<p class="doc-bold-label">Practical Exercise (40%)</p>
<p class="doc-p"><strong>Licensee must demonstrate use of the Airtable operating system — adding a school, assigning a coach, logging a completed session, and generating a monthly invoice summary.</strong></p>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>A coach calls in sick 2 hours before a session at your busiest school. Walk through your exact response from the moment you receive the call.</strong></p>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L3_M6",
  title:"Module 6 \u2014 Growing Your Territory",
  icon:"\ud83d\udcca",
  sections:[
    {h:`The Fill-First Growth Model`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The Fill-First Growth Model</p>
<p class="doc-p"><strong>Field Intelligence: "The ideal business is to get as many schools fully occupied with coaches and students before trying to grow further."</strong></p>
<p class="doc-p"><strong>This principle protects quality, revenue, and reputation simultaneously.</strong></p>
<p class="doc-p"><strong>What "fully occupied" means:</strong></p>
<ul class="doc-list"><li>Every class at the school has 7 enrolled children</li></ul>
<ul class="doc-list"><li>Sessions are running consistently — 4 per month — with no chronic cancellations</li></ul>
<ul class="doc-list"><li>The school relationship is strong — principal is happy, no open issues</li></ul>
<ul class="doc-list"><li>The coach at that school is stable, certified, and performing well</li></ul>
<ul class="doc-list"><li>Parent retention from term to term is above 70%</li></ul>
<p class="doc-p"><strong>Only when ALL five conditions are met is a school considered fully occupied.</strong></p>
<p class="doc-p"><strong>Only when your existing schools are fully occupied should you prioritize adding a new school.</strong></p>
<p class="doc-p"><strong>Why this matters:</strong></p>
<ul class="doc-list"><li>A half-filled school earns less than a full school. Adding a new school does not fix this — filling the existing one does.</li></ul>
<ul class="doc-list"><li>Spreading attention across too many partially-filled schools means none of them get the focus needed to become excellent.</li></ul>
<ul class="doc-list"><li>Quality problems at 3 mediocre schools damage your reputation. Quality at 1 excellent school builds it.</li></ul>`},
    {h:`Growth Stage Gates`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Growth Stage Gates</p>
<p class="doc-p"><strong>EduGolfKids growth follows defined stage gates. Progress only when the current stage is stable.</strong></p>
<p class="doc-bold-label">Stage 1: Launch (1 School, 1 Coach, 1 Class)</p>
<p class="doc-p"><strong>Focus: Learn the system. Build the first great school. Prove the model works in your territory.</strong></p>
<p class="doc-p"><strong>Success criteria before moving to Stage 2:</strong></p>
<ul class="doc-list"><li>Class consistently full at 7 children for minimum 2 consecutive terms</li></ul>
<ul class="doc-list"><li>Zero school relationship issues</li></ul>
<ul class="doc-list"><li>Coach certified at Level 1 and Level 2</li></ul>
<ul class="doc-list"><li>Skills Passport completion rate 100%</li></ul>
<ul class="doc-list"><li>Parent retention above 70%</li></ul>
<p class="doc-bold-label">Stage 2: First Expansion (1-2 Schools, 2-3 Classes)</p>
<p class="doc-p"><strong>Focus: Add a second class at School 1 and begin approaching School 2.</strong></p>
<p class="doc-p"><strong>Success criteria before moving to Stage 3:</strong></p>
<ul class="doc-list"><li>Both classes at School 1 consistently full</li></ul>
<ul class="doc-list"><li>Second coach hired, certified, and performing independently</li></ul>
<ul class="doc-list"><li>School 2 agreement signed and first term completed successfully</li></ul>
<p class="doc-bold-label">Stage 3: Multi-School (3-5 Schools, Multiple Coaches)</p>
<p class="doc-p"><strong>Focus: Systematize operations. Build the team. Install the operating system fully.</strong></p>
<p class="doc-p"><strong>Success criteria before moving to Stage 4:</strong></p>
<ul class="doc-list"><li>Operating system fully active — all schools, coaches, and students tracked</li></ul>
<ul class="doc-list"><li>Monthly team meeting structure in place</li></ul>
<ul class="doc-list"><li>All schools at minimum 2 classes — at least one approaching full 3-coach capacity</li></ul>
<ul class="doc-list"><li>Revenue covers all operating costs and produces meaningful net income</li></ul>
<p class="doc-bold-label">Stage 4: Territory Optimization (5-10 Schools)</p>
<p class="doc-p"><strong>Focus: Bring all schools to full capacity. Transition from operator to manager.</strong></p>
<p class="doc-p"><strong>At this stage:</strong></p>
<ul class="doc-list"><li>Licensee is primarily managing coaches and school relationships — not delivering sessions</li></ul>
<ul class="doc-list"><li>A lead coach is identified and developed for operational coverage</li></ul>
<ul class="doc-list"><li>Marketing is largely word-of-mouth and referral — enrollment is self-sustaining</li></ul>
<ul class="doc-list"><li>Revenue is predictable, strong, and growing month over month</li></ul>`},
    {h:`Transitioning from Coach to Manager`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Transitioning from Coach to Manager</p>
<p class="doc-p"><strong>The most common growth bottleneck for EduGolfKids licensees is the transition from delivering sessions to managing a team that delivers sessions.</strong></p>
<p class="doc-p"><strong>Many licensees are great coaches. Not all are natural managers. This transition requires intention.</strong></p>
<p class="doc-p"><strong>Signs you are ready to transition:</strong></p>
<ul class="doc-list"><li>You have 4+ schools running</li></ul>
<ul class="doc-list"><li>You have at least 3 certified coaches</li></ul>
<ul class="doc-list"><li>The operating system is tracking everything</li></ul>
<ul class="doc-list"><li>You are spending more time solving operational problems than coaching children</li></ul>
<p class="doc-p"><strong>How to transition:</strong></p>
<ul class="doc-list"><li>Identify your strongest coach as a Lead Coach — give them additional responsibility and pay</li></ul>
<ul class="doc-list"><li>Begin delegating session delivery to your team — step back from regular delivery progressively</li></ul>
<ul class="doc-list"><li>Redirect your time to school development, coach recruitment, marketing, and financial management</li></ul>
<ul class="doc-list"><li>Remain visible in sessions monthly — quality assurance and team culture</li></ul>
<p class="doc-p"><strong>The Lead Coach role:</strong></p>
<ul class="doc-list"><li>Covers licensee in school communication when needed</li></ul>
<ul class="doc-list"><li>Mentors and supports junior coaches</li></ul>
<ul class="doc-list"><li>Conducts quarterly peer observations</li></ul>
<ul class="doc-list"><li>Assists with demo days and parent information sessions</li></ul>
<ul class="doc-list"><li>Is compensated above standard coach rate for this responsibility</li></ul>`},
    {h:`Revenue Milestones and Territory Value`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Revenue Milestones and Territory Value</p>
<p class="doc-p"><strong>Building a strong EduGolfKids territory creates a business asset with genuine value.</strong></p>
<p class="doc-p"><strong>Revenue milestones:</strong></p>
<ul class="doc-list"><li>3 schools, partial capacity: $3,000-$4,000 gross per month</li></ul>
<ul class="doc-list"><li>5 schools, full capacity: $8,000-$9,000 gross per month</li></ul>
<ul class="doc-list"><li>10 schools, full capacity: $16,000-$18,000 gross per month</li></ul>
<p class="doc-p"><strong>Net margins of 45-55% produce real income at scale: $7,000-$10,000 net per month at 10 full schools.</strong></p>
<p class="doc-p"><strong>Territory value as a business asset:</strong></p>
<p class="doc-p"><strong>A well-run EduGolfKids territory with stable school contracts, an established team, and consistent revenue is a saleable business.</strong></p>
<p class="doc-p"><strong>Service businesses with recurring revenue typically sell for 2-3x annual net profit.</strong></p>
<p class="doc-p"><strong>A territory generating $100,000 net per year has an asset value of $200,000-$300,000.</strong></p>
<p class="doc-p"><strong>This is what disciplined, quality-first growth builds.</strong></p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 6</p>
<p class="doc-bold-label">Written (30%)</p>
<ul class="doc-list"><li>Define "fully occupied" using all 5 criteria.</li></ul>
<ul class="doc-list"><li>Describe the 4 growth stage gates and their success criteria.</li></ul>
<ul class="doc-list"><li>Explain the Lead Coach role and why it is critical to scaling beyond Stage 3.</li></ul>
<p class="doc-bold-label">Practical Exercise (40%)</p>
<p class="doc-p"><strong>Licensee must present a 12-month growth plan for their territory starting from Stage 1, using the stage gate model, with realistic enrollment projections and revenue targets at each stage.</strong></p>
<p class="doc-bold-label">Scenario-Based (30%)</p>
<p class="doc-p"><strong>A licensee at Stage 2 is being pressured by a school to add a third location immediately. They currently have one class half-filled at School 1 and a new coach still completing certification. How should they respond?</strong></p>
<p class="doc-bold-label">MINIMUM PASS: 85%</p>`},
  ]
},
{
  id:"L3_M7",
  title:"Module 7 \u2014 Brand Compliance &amp; Licensee Standards",
  icon:"\ud83c\udff7\ufe0f",
  sections:[
    {h:`The EduGolfKids Brand Standards`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">The EduGolfKids Brand Standards</p>
<p class="doc-p"><strong>Visual Brand Standards:</strong></p>
<ul class="doc-list"><li>All coaches wear approved EduGolfKids branded attire — no substitutions</li></ul>
<ul class="doc-list"><li>All marketing materials use approved EduGolfKids templates — no homemade alternatives</li></ul>
<ul class="doc-list"><li>Social media uses EduGolfKids branding guidelines — colors, fonts, logo usage</li></ul>
<ul class="doc-list"><li>Equipment bags, session kits, and Skills Passport materials are EduGolfKids branded</li></ul>
<p class="doc-p"><strong>Program Standards:</strong></p>
<ul class="doc-list"><li>Every session follows the non-negotiable 60-minute architecture</li></ul>
<ul class="doc-list"><li>Every coach is Level 1 and Level 2 certified before leading sessions independently</li></ul>
<ul class="doc-list"><li>Every child receives a Skills Passport entry at the end of every term</li></ul>
<ul class="doc-list"><li>CoachNow parent reports are sent at the end of every term</li></ul>
<ul class="doc-list"><li>Session pricing is within the EduGolfKids approved range</li></ul>
<p class="doc-p"><strong>Communication Standards:</strong></p>
<ul class="doc-list"><li>All parent communication uses EduGolfKids Growth Mindset language standards</li></ul>
<ul class="doc-list"><li>School agreements use HQ-approved templates</li></ul>
<ul class="doc-list"><li>Social media content follows the EduGolfKids content guidelines</li></ul>
<ul class="doc-list"><li>No unauthorized modifications to the EduGolfKids curriculum</li></ul>`},
    {h:`What Licensees Can and Cannot Modify`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">What Licensees Can and Cannot Modify</p>
<p class="doc-p"><strong>The EduGolfKids system is a franchise model. Its value comes from consistency.</strong></p>
<p class="doc-p"><strong>Licensees have latitude in some areas — and zero latitude in others.</strong></p>
<p class="doc-p"><strong>You CAN customize:</strong></p>
<ul class="doc-list"><li>Your personal style within sessions — energy, humor, personality</li></ul>
<ul class="doc-list"><li>Local marketing language and references</li></ul>
<ul class="doc-list"><li>School relationship approaches — every school culture is different</li></ul>
<ul class="doc-list"><li>Coach compensation structures within HQ guidelines</li></ul>
<ul class="doc-list"><li>Scheduling and term dates within HQ minimum standards</li></ul>
<p class="doc-p"><strong>You CANNOT modify:</strong></p>
<ul class="doc-list"><li>Session architecture — the 60-minute structure is fixed</li></ul>
<ul class="doc-list"><li>Coaching curriculum — modules, progressions, and assessment criteria are fixed</li></ul>
<ul class="doc-list"><li>Safety standards — spacing, equipment, safeguarding protocols are non-negotiable</li></ul>
<ul class="doc-list"><li>Pricing below the EduGolfKids minimum</li></ul>
<ul class="doc-list"><li>Certifying coaches without completing the full TalentLMS curriculum</li></ul>
<ul class="doc-list"><li>Using the EduGolfKids brand for programs not covered by the licensee agreement</li></ul>`},
    {h:`Reporting and HQ Relationship`,b:`<div class="doc-section-rule"></div>
<p class="doc-bold-label">Reporting and HQ Relationship</p>
<p class="doc-p"><strong>Licensees report to EduGolfKids HQ quarterly with:</strong></p>
<ul class="doc-list"><li>Active school count and enrollment numbers</li></ul>
<ul class="doc-list"><li>Coach certification status for all team members</li></ul>
<ul class="doc-list"><li>Skills Passport completion rates</li></ul>
<ul class="doc-list"><li>Any incidents or legal matters arising during the quarter</li></ul>
<ul class="doc-list"><li>Revenue report — gross and net</li></ul>
<p class="doc-p"><strong>HQ supports licensees with:</strong></p>
<ul class="doc-list"><li>Curriculum updates and new module releases</li></ul>
<ul class="doc-list"><li>Marketing material updates and new campaign templates</li></ul>
<ul class="doc-list"><li>Peer licensee network — shared learnings and best practices</li></ul>
<ul class="doc-list"><li>Operating system updates and new features</li></ul>
<ul class="doc-list"><li>Legal and compliance guidance when needed</li></ul>
<p class="doc-p"><strong>The relationship between licensee and HQ is a partnership.</strong></p>
<p class="doc-p"><strong>HQ's success depends on every licensee's success. Every licensee's success depends on the strength of the HQ system and brand.</strong></p>
<p class="doc-p"><strong>When either party holds up their side of this, the whole system wins.</strong></p>
<p class="doc-bold-label">FINAL CERTIFICATION ASSESSMENT — LEVEL 3</p>
<p class="doc-bold-label">Written Examination (30%)</p>
<p class="doc-p"><strong>Covering all 7 modules. Must demonstrate:</strong></p>
<ul class="doc-list"><li>School acquisition strategy and tiering</li></ul>
<ul class="doc-list"><li>Recruitment model and ideal coach profile</li></ul>
<ul class="doc-list"><li>Marketing hierarchy and enrollment conversion tools</li></ul>
<ul class="doc-list"><li>Pricing model, revenue math, and financial management</li></ul>
<ul class="doc-list"><li>Operations framework for multi-school management</li></ul>
<ul class="doc-list"><li>Growth stage gates and scale model</li></ul>
<ul class="doc-list"><li>Brand compliance obligations</li></ul>
<p class="doc-bold-label">Business Plan Submission (40%)</p>
<p class="doc-p"><strong>Licensee must submit a complete 12-month territory business plan including:</strong></p>
<ul class="doc-list"><li>School target list — minimum 20 schools tiered by priority</li></ul>
<ul class="doc-list"><li>Recruitment plan — how and when coaches are hired</li></ul>
<ul class="doc-list"><li>Marketing calendar — demo days, newsletter placements, social media plan</li></ul>
<ul class="doc-list"><li>Revenue model — monthly projections from launch to Stage 3</li></ul>
<ul class="doc-list"><li>Operations setup — how the Airtable system will be implemented</li></ul>
<ul class="doc-list"><li>Growth plan — stage gate milestones and timelines</li></ul>
<p class="doc-bold-label">Practical Simulation (30%)</p>
<p class="doc-p"><strong>Licensee participates in a full-day practical assessment covering:</strong></p>
<ul class="doc-list"><li>School meeting simulation — cold to contract</li></ul>
<ul class="doc-list"><li>Coach interview simulation</li></ul>
<ul class="doc-list"><li>Parent information session delivery</li></ul>
<ul class="doc-list"><li>Operational scenario responses — sick coach, school cancellation, parent dispute</li></ul>
<p class="doc-bold-label">MINIMUM PASS: 85% across all assessment components</p>
<p class="doc-bold-label">Level 3 Completion — What You Have Built</p>
<p class="doc-p"><strong>You now hold the complete EduGolfKids licensee toolkit.</strong></p>
<p class="doc-p"><strong>Level 1 made you a great coach.</strong></p>
<p class="doc-p"><strong>Level 2 made you a great golf educator.</strong></p>
<p class="doc-p"><strong>Level 3 makes you a business operator.</strong></p>
<p class="doc-p"><strong>Together they give you something rare in youth sport:</strong></p>
<p class="doc-p"><strong>A complete system — from the science of how children learn, to the craft of how to teach golf, to the business of how to build a territory that serves thousands of children and generates real income.</strong></p>
<p class="doc-p"><strong>EduGolfKids was built to be the golden standard of teaching young children golf.</strong></p>
<p class="doc-p"><strong>Every licensee who holds all three levels is proof of that standard.</strong></p>
<p class="doc-p"><strong>Now go build something great.</strong></p>`},
  ]
},
{
  id:"L3_M8",
  title:"Module 8 \u2014 Licensee Safety Responsibilities",
  icon:"\ud83e\uddba",
  sections:[
    {h:`Section 1 — BUILDING A SAFETY-COMPLIANT COACHING TEAM`,b:`<h3 class="doc-section-title">SECTION 1 — BUILDING A SAFETY-COMPLIANT COACHING TEAM</h3>
<p class="doc-p">Every coach you deploy must be safety-compliant before entering a school. This is a non-negotiable gate — not a preference.</p>
<p class="doc-p"><strong>Pre-Deployment Safety Checklist — Every Coach:</strong></p>
<ul class="doc-list"><li>☐  Background check cleared and on file</li></ul>
<ul class="doc-list"><li>☐  Level 1 Module 11 (Weather & Emergency Safety) certified</li></ul>
<ul class="doc-list"><li>☐  Level 2 Module 8 (Skills Session Safety) certified — before leading skills sessions</li></ul>
<ul class="doc-list"><li>☐  Current First Aid certification on file</li></ul>
<ul class="doc-list"><li>☐  Safeguarding and mandatory reporter training completed</li></ul>
<ul class="doc-list"><li>☐  Site-specific Emergency Action Plan (EAP) reviewed for assigned school</li></ul>
<ul class="doc-list"><li>☐  EAP signed and returned to licensee</li></ul>
<ul class="doc-list"><li>☐  Added to EduGolfKids operating system with certification records</li></ul>
<div class="doc-rule">RULE: A coach without a cleared background check and Level 1 safety certification does not enter a school. No exceptions. No "they're just observing."</div>`},
    {h:`Section 2 — WEATHER MANAGEMENT ACROSS MULTIPLE SITES`,b:`<h3 class="doc-section-title">SECTION 2 — WEATHER MANAGEMENT ACROSS MULTIPLE SITES</h3>
<p class="doc-p">As a licensee operating multiple schools, you may have coaches at 3, 5, or 10 sites simultaneously. A weather event can affect multiple schools at once.</p>
<p class="doc-p"><strong>Multi-Site Weather Protocol:</strong></p>
<p class="doc-p"><strong>BEFORE SESSIONS — DAILY MORNING CHECK:</strong></p>
<ul class="doc-list"><li>Every session day — check the weather for every active site by 8am</li></ul>
<ul class="doc-list"><li>If any site has a thunderstorm forecast within 4 hours of its session time — contact the coach for that site immediately</li></ul>
<ul class="doc-list"><li>Confirm indoor backup availability for any at-risk site</li></ul>
<ul class="doc-list"><li>If indoor backup is not available — make the postponement decision early. Do not leave it to the coach in the field.</li></ul>
<p class="doc-p"><strong>REAL-TIME COMMUNICATION:</strong></p>
<ul class="doc-list"><li>All coaches must have a direct communication line to you during sessions</li></ul>
<ul class="doc-list"><li>Coaches must be able to reach you within 5 minutes during any active session</li></ul>
<ul class="doc-list"><li>Establish a group communication channel for all coaches — weather alerts can be shared instantly</li></ul>
<p class="doc-p"><strong>MAKE-UP SESSION MANAGEMENT:</strong></p>
<ul class="doc-list"><li>Weather cancellations must be rescheduled within the same billing month where possible</li></ul>
<ul class="doc-list"><li>Maintain a make-up session tracker in your operating system</li></ul>
<ul class="doc-list"><li>Communicate rescheduled dates to schools and parents within 24 hours of cancellation</li></ul>
<div class="doc-rule">RULE: A weather cancellation is a business event, not just a safety event. Handle it professionally — communicate quickly, reschedule promptly, and protect your revenue.</div>`},
    {h:`Section 3 — INCIDENT MANAGEMENT AND ESCALATION`,b:`<h3 class="doc-section-title">SECTION 3 — INCIDENT MANAGEMENT AND ESCALATION</h3>
<p class="doc-p">When an incident occurs at one of your schools, you are the first escalation point above the coach. Your role is to receive, assess, support, and report.</p>
<p class="doc-p"><strong>Incident Response Framework — Licensee Level:</strong></p>
<div class="doc-rule">STEP 1 — RECEIVE</div>
<ul class="doc-list"><li>Coach contacts you immediately following any incident</li></ul>
<ul class="doc-list"><li>Gather the facts: what happened, who was involved, what action was taken, current status of the child</li></ul>
<div class="doc-rule">STEP 2 — ASSESS SEVERITY</div>
<ul class="doc-list"><li>Minor (no injury, no medical involvement, no parent concern): Coach completes incident report — you review and countersign</li></ul>
<ul class="doc-list"><li>Moderate (injury treated, parent notified, child collected): You contact the parent directly within 2 hours. You notify HQ within 24 hours.</li></ul>
<ul class="doc-list"><li>Severe (emergency services called, hospitalization, safeguarding concern): You notify HQ immediately — call, do not email. You support the coach and school. You do not make public statements.</li></ul>
<div class="doc-rule">STEP 3 — DOCUMENT</div>
<ul class="doc-list"><li>All incidents are logged in the EduGolfKids operating system</li></ul>
<ul class="doc-list"><li>Incident report submitted by coach within 24 hours</li></ul>
<ul class="doc-list"><li>Licensee review and countersignature within 48 hours</li></ul>
<ul class="doc-list"><li>HQ notified of any moderate or severe incident</li></ul>
<div class="doc-rule">STEP 4 — REVIEW AND PREVENT</div>
<ul class="doc-list"><li>After any incident — conduct a brief review with the coach: what happened, what could be done differently</li></ul>
<ul class="doc-list"><li>If a pattern of safety issues emerges at a coach or site — address it immediately</li></ul>
<ul class="doc-list"><li>Share learnings with your full coaching team where appropriate — anonymously if sensitive</li></ul>
<p class="doc-p"><strong>⚠  Do not cover up incidents. Do not downgrade severity to avoid HQ notification. A covered-up incident that escalates is a far greater liability than a reported one.</strong></p>`},
    {h:`Section 4 — INSURANCE AND COMPLIANCE RECORDS`,b:`<h3 class="doc-section-title">SECTION 4 — INSURANCE AND COMPLIANCE RECORDS</h3>
<p class="doc-p">As a licensee, you are required to maintain the following insurance and compliance records at all times:</p>
<ul class="doc-list"><li>Current general liability insurance — minimum coverage as specified by EduGolfKids HQ and updated annually</li></ul>
<ul class="doc-list"><li>Certificates of insurance available for every school upon request</li></ul>
<ul class="doc-list"><li>All coach First Aid certifications on file with expiry dates tracked</li></ul>
<ul class="doc-list"><li>All coach background checks on file — refreshed at the frequency required by your jurisdiction</li></ul>
<ul class="doc-list"><li>All coach EduGolfKids certifications recorded in TalentLMS and the operating system</li></ul>
<ul class="doc-list"><li>Emergency Action Plans signed for every active school site</li></ul>
<div class="doc-rule">RULE: HQ may request your compliance records at any time with 48 hours notice. Your records must be complete, current, and accessible. Missing records are a breach of your license agreement.</div>`},
    {h:`Section 5 — BUILDING A SAFETY CULTURE IN YOUR TEAM`,b:`<h3 class="doc-section-title">SECTION 5 — BUILDING A SAFETY CULTURE IN YOUR TEAM</h3>
<p class="doc-p">A safety culture is not a checklist. It is a standard that every coach understands, believes in, and applies without being told.</p>
<p class="doc-p"><strong>How to Build It:</strong></p>
<ul class="doc-list"><li>Brief safety reminders in every team communication during high-risk weather seasons</li></ul>
<ul class="doc-list"><li>Acknowledge coaches who demonstrate excellent safety practice — publicly within the team</li></ul>
<ul class="doc-list"><li>Address safety shortcuts immediately and privately — never ignore them</li></ul>
<ul class="doc-list"><li>Run a simulated lightning evacuation drill with new coaches before their first independent session</li></ul>
<ul class="doc-list"><li>Make the pre-session safety checklist a non-negotiable routine — check that coaches are using it</li></ul>
<p class="doc-p"><strong>Red Flags — Act Immediately If You Observe:</strong></p>
<ul class="doc-list"><li>A coach who dismisses weather warnings as "overreacting"</li></ul>
<ul class="doc-list"><li>A coach who has never completed the pre-session safety checklist</li></ul>
<ul class="doc-list"><li>A coach who allows children to carry clubs during transitions</li></ul>
<ul class="doc-list"><li>A coach who has not reviewed the site EAP</li></ul>
<ul class="doc-list"><li>A coach who delays reporting an incident</li></ul>
<p class="doc-p"><strong>⚠  A coach who takes shortcuts with safety will eventually have an incident. Your job as licensee is to identify and correct this behaviour before that happens.</strong></p>
<p class="doc-bold-label">CERTIFICATION ASSESSMENT — MODULE 8</p>
<p class="doc-p">Written Assessment (minimum pass: 85%):</p>
<p class="doc-p"><strong>1.  </strong>You have 4 sessions running simultaneously across 3 schools on a Tuesday afternoon. A storm front moves in unexpectedly at 2pm. Two schools have indoor backup, one does not. Walk through your exact response.</p>
<p class="doc-p"><strong>2.  </strong>A coach calls you after a session to tell you a child was struck lightly on the arm by another child's club. No injury is visible. The parent has not been told. What do you do?</p>
<p class="doc-p"><strong>3.  </strong>Describe the pre-deployment safety checklist for a new coach. What is the consequence of skipping any step?</p>
<p class="doc-p"><strong>4.  </strong>HQ requests your compliance records with 48 hours notice. What documents must you be able to produce?</p>
<p class="doc-p">Practical Assessment:</p>
<ul class="doc-list"><li>Licensee must demonstrate their operating system with complete coach certification records and at least one incident report on file.</li></ul>
<ul class="doc-list"><li>Licensee must walk through their multi-site weather management protocol for a scenario where 3 sites are affected simultaneously.</li></ul>
<p class="doc-p"><strong>Your coaches trust you to have the system.</strong></p>
<p class="doc-p">Schools trust you with their children. Build the system. Enforce it. Every time.</p>`},
  ]
}
],

};

// ══════════════════════════════════════════
//  KNOWLEDGE CHECK QUESTIONS (per module)
// ══════════════════════════════════════════

const KNOWLEDGE_CHECKS = {
M0:[
{q:'A coach is working with a 6-year-old who is the only child enrolled due to low enrollment. Which condition MUST be met for this one-on-one session to proceed?',o:['Written consent from the parent','A second adult must be present and the space must be open and observable','The session must move outdoors where visibility is greater','No additional conditions are required'],c:1,e:'One-on-one sessions require a second adult present in the facility AND the session must take place in an open, observable space.'},
{q:'A coach suspects a child may be experiencing abuse at home based on behavioral changes and a visible injury. What must the coach do?',o:['Contact the parent directly to discuss the concern','Wait for further evidence before taking any action','Ensure child safety, report to the designated school authority, follow state reporting law, and notify the EduGolfKids Compliance Officer','Discuss the observation with other coaches to get their perspective'],c:2,e:'Coaches are mandatory reporters. The prescribed sequence is: ensure child safety → report to designated school authority → follow state reporting law → notify EduGolfKids Compliance Officer.'},
{q:'Under the EduGolfKids physical contact policy, a coach may adjust a child\'s grip ONLY when:',o:['The parent has provided written consent','Verbal cueing has been attempted first AND the coach explains the contact before making it','The coach deems it instructionally necessary','Any of the above conditions are met'],c:1,e:'EduGolfKids enforces Controlled & Transparent Instructional Contact. Both conditions must be met: verbal cueing attempted first, and the coach must explain the contact before making it.'},
{q:'How early must an EduGolfKids coach arrive before a scheduled session?',o:['5 minutes','10 minutes','15 minutes minimum','At any point before the session starts'],c:2,e:'Coaches must arrive at the school a minimum of 15 minutes prior to scheduled lesson start time. All equipment must be fully set up before children arrive.'},
{q:'A parent is 45 minutes late to collect their child after a session. What is the correct procedure?',o:['Allow the child to wait in the school building unsupervised','Remain with the child, contact the parent immediately, and maintain supervision until collected','Contact school administration and then leave the child in their care','Call emergency services after 30 minutes'],c:1,e:'The Zero-Unsupervised-Child Standard applies during late pickups. The coach must remain with the child, contact the parent immediately, and confirm pickup arrangements.'},
{q:'Equipment breakdown after a session may only begin when:',o:['The 60-minute session time has elapsed','The coach has submitted the session log','All children have been safely handed over and the area is clear of participants','The principal has confirmed the area can be vacated'],c:2,e:'Equipment breakdown may only begin when all children have been safely handed over and the session area is fully cleared of participants. Packing up while children are present is prohibited.'},
],
M0_S1:[
{q:'A coach is working with a 6-year-old who is the only child enrolled due to low enrollment. Which condition MUST be met for this one-on-one session to proceed?',o:['Written consent from the parent','A second adult must be present and the space must be open and observable','The session must move outdoors where visibility is greater','No additional conditions are required'],c:1,e:'One-on-one sessions require a second adult present in the facility AND the session must take place in an open, observable space.'},
{q:'A coach suspects a child may be experiencing abuse at home based on behavioral changes and a visible injury. What must the coach do?',o:['Contact the parent directly to discuss the concern','Wait for further evidence before taking any action','Ensure child safety, report to the designated school authority, follow state reporting law, and notify the EduGolfKids Compliance Officer','Discuss the observation with other coaches to get their perspective'],c:2,e:'Coaches are mandatory reporters. The prescribed sequence is: ensure child safety → report to designated school authority → follow state reporting law → notify EduGolfKids Compliance Officer.'},
{q:'Under the EduGolfKids physical contact policy, a coach may adjust a child\'s grip ONLY when:',o:['The parent has provided written consent','Verbal cueing has been attempted first AND the coach explains the contact before making it','The coach deems it instructionally necessary','Any of the above conditions are met'],c:1,e:'EduGolfKids enforces Controlled & Transparent Instructional Contact. Both conditions must be met: verbal cueing attempted first, and the coach must explain the contact before making it.'},
{q:'How early must an EduGolfKids coach arrive before a scheduled session?',o:['5 minutes','10 minutes','15 minutes minimum','At any point before the session starts'],c:2,e:'Coaches must arrive at the school a minimum of 15 minutes prior to scheduled lesson start time. All equipment must be fully set up before children arrive.'},
{q:'A parent is 45 minutes late to collect their child after a session. What is the correct procedure?',o:['Allow the child to wait in the school building unsupervised','Remain with the child, contact the parent immediately, and maintain supervision until collected','Contact school administration and then leave the child in their care','Call emergency services after 30 minutes'],c:1,e:'The Zero-Unsupervised-Child Standard applies during late pickups. The coach must remain with the child, contact the parent immediately, and confirm pickup arrangements.'},
{q:'Equipment breakdown after a session may only begin when:',o:['The 60-minute session time has elapsed','The coach has submitted the session log','All children have been safely handed over and the area is clear of participants','The principal has confirmed the area can be vacated'],c:2,e:'Equipment breakdown may only begin when all children have been safely handed over and the session area is fully cleared of participants. Packing up while children are present is prohibited.'},
],
L1_M1:[
{q:'A coach notices engagement dropping after 6 minutes of the same drill with 8-year-olds. According to EduGolfKids system standards, what should the coach do?',o:['Remind children to focus and continue the drill','Transition to a new constraint challenge — no activity should exceed 5 minutes','Move to the wrap-up phase early','Increase the difficulty of the drill to re-engage the group'],c:1,e:'The EduGolfKids system limits each drill variation to under 5 minutes. When engagement drops, transition to a new constraint challenge.'},
{q:'A parent requests the coach add 10 extra minutes of practice at the end of a session. The coach should:',o:['Agree if the parent signs a consent form','Politely decline — the 60-minute structure is non-negotiable without HQ approval','Agree informally as long as other parents are not aware','Adjust the next session\'s structure to accommodate more practice time'],c:1,e:'Deviation from the 60-minute non-negotiable session structure requires HQ approval. Informally extending sessions compromises Skills Passport integrity and brand consistency.'},
{q:'Which statement BEST describes the EduGolfKids coaching philosophy?',o:['Coaches are swing instructors who use structured time management','Coaches are learning architects who engineer developmental environments using scientific principles','Coaches are activity supervisors who keep children safe and engaged','Coaches are junior golf professionals who simplify adult technique for young learners'],c:1,e:'EduGolfKids coaches are "not teaching golf — they are engineering developmental environments." The philosophy is grounded in five scientific pillars.'},
{q:'During the Game Reinforcement segment, a 7-year-old\'s shot consistently goes right. The coach should:',o:['Stop the game and correct the child\'s technique directly','Allow the game to continue and adjust the target constraint — move the target to the left to guide natural correction','Ask the child to watch another child who is hitting correctly','Remove this child\'s turn until they can demonstrate the correct motion'],c:1,e:'During Game Reinforcement, the primary goal is skill transfer in contextual play. Constraint adjustment (moving the target) guides natural movement correction without interrupting the game or using direct technical instruction.'},
],
L1_M2:[
{q:'A 5-year-old drops her club and says "I quit" after missing three shots. The developmentally appropriate response is:',o:['Tell the child that everyone finds it hard and they need to keep trying','Immediately reduce task difficulty and re-engage with effort-based praise: "Let\'s make it easier and try again"','Ask the child to sit out for a few minutes to reflect','Give the child a different club and ask them to try one more time at the same distance'],c:1,e:'Age 4–6: frustration tolerance is low and requires immediate task adjustment. Reducing distance reduces anxiety, immediate success rebuilds confidence.'},
{q:'An 8-year-old repeatedly blames the equipment when shots miss the target. This behavior is best understood as:',o:['Deliberate defiance that requires behavioral correction','A sign of poor sportsmanship that must be addressed directly','A normal frustration signal for the 6–9 stage — requires calibrated challenge adjustment, not behavioral correction','An indication that the child is not suited to the program'],c:2,e:'Equipment blaming is a normal frustration signal for the 6–9 stage, indicating the task difficulty exceeds the child\'s current capability. The correct response is task adjustment, not behavioral correction.'},
{q:'A coach is instructing a 4-year-old group. Which instruction is MOST developmentally appropriate?',o:['"Remember to keep your eye on the ball, shift your weight, and follow through"','"Make the ball fly to the red rocket cone!"','"Watch your grip — your left hand needs to be more on top"','"Two steps: stance first, then swing"'],c:1,e:'Age 4–6 requires one-step instructions, external imagery cues, no technical breakdown, immediate action focus. "Make the ball fly to the red rocket cone" uses an external imagery cue directed at the outcome.'},
{q:'A 9-year-old appears bored at their current challenge level. The developmentally correct response is:',o:['Allow the child to attempt adult-level technique variations','Increase scoring pressure and competitive challenge within the same constraint-based framework','Praise the child publicly as the best in the group to maintain motivation','Move the child to an advanced group'],c:1,e:'For the 6–9 stage, boredom signals insufficient challenge. The correct response is advancing constraint complexity — not introducing adult technique or public comparison.'},
],
L1_M3:[
{q:'A coach runs a 20-minute putting session where all children putt from the same 5-foot spot to the same hole repeatedly. A parent says the children look consistent. What is most accurate about what has occurred?',o:['Strong learning has taken place — consistency indicates skill development','Performance has improved today but long-term retention will be significantly lower than with variable practice','The session was effective because children enjoyed the consistency','The session demonstrates correct use of the constraints-led approach'],c:1,e:'This describes blocked practice. Shea & Morgan (1979) show blocked practice produces short-term performance improvement but significantly limits long-term retention. Variable practice produces far stronger retention.'},
{q:'A 7-year-old consistently hits fat shots (club hits ground first). The constraints-led approach response is:',o:['Directly instruct the child: "Hit the ball first, then the ground. Weight forward."','Place a tee 2 inches behind the ball — if the child hits the tee it provides immediate natural feedback about the strike sequence','Reduce the child\'s turns to allow time to observe others','Switch the child to putting until their contact improves'],c:1,e:'CLA responds to error by manipulating the environment. Placing a tee behind the ball is a task constraint that provides immediate environmental feedback — the child\'s nervous system self-corrects through the constraint.'},
{q:'A coach wants to improve a 9-year-old\'s putting accuracy. Which design reflects variable practice principles?',o:['10 consecutive putts from 6 feet to the same hole','Distance ladder: 4 putts from 3ft, 4ft, 6ft, 8ft — rotating each time, with a scoring challenge at each distance','Instructor demonstration followed by 15 imitation putts','Free putting time where the child chooses targets with no structure'],c:1,e:'Variable practice changes conditions each attempt — different distances, different scoring challenges. This forces neural adaptation and produces stronger long-term retention.'},
{q:'After a guided discovery question ("What changed when that one went farther?"), a 9-year-old responds "I swung bigger." The best coaching response is:',o:['Confirm the answer and explain the technical reason why a bigger swing produces more distance','Validate the observation and design a follow-up challenge: "Interesting — let\'s test that. Try 3 small swings then 3 bigger ones and compare"','Correct the child — it is actually club face angle that determines distance','Move on to the next drill without acknowledging the response'],c:1,e:'Guided discovery has produced self-generated insight. The correct response validates the observation and converts it into a variable practice challenge that deepens understanding through exploration.'},
],
L1_M4:[
{q:'A parent confronts the coach: "Other programs are teaching proper swing technique. Why are you just playing games?" The correct response is:',o:['Agree that more technical instruction will be incorporated going forward','Explain that at this LTAD stage, movement literacy and confidence are the developmental priority — technical swing reconstruction at this age reduces long-term potential','Offer the parent private technical sessions as an upgrade','Refer the parent to the licensee without providing any explanation'],c:1,e:'The LTAD Protection Rule: coaches must explain the philosophy professionally. The Active Start stage prioritizes movement literacy over technical correction. Early technical overload creates motor rigidity and reduces long-term potential.'},
{q:'A 7-year-old has an unusual grip but consistently gets the ball to the target zone, maintains good energy, and shows no safety concerns. What should the coach do?',o:['Correct the grip immediately to establish correct habits before they become ingrained','Leave the grip alone — if the movement is safe, functional, achieves target success, and the child is confident, LTAD principles say correction is not the priority','Ask the child to try the grip correction and see if it feels better','Advise the parent that technical coaching outside of EduGolfKids would benefit their child'],c:1,e:'LTAD development vs correction priority: if the movement is age-appropriate, safe, functional, achieves target success, and the child is confident — correction may not be the priority.'},
{q:'Early technical overload in children 4–10 most directly risks:',o:['Children advancing too quickly through Skills Passport levels','Motor rigidity, reduced creativity, increased injury risk, psychological burnout, and plateau effect','Parents expecting too much from the program','Coaches delivering inconsistent session structures'],c:1,e:'The five documented risks of early technical overload are: motor rigidity, reduced creativity, increased injury risk, psychological burnout, and the plateau effect.'},
],
L1_M5:[
{q:'A coach finishes a putting game and wants to embed critical thinking before moving on. Which prompt BEST achieves this?',o:['"Good job everyone — let\'s line up for the chipping station"','"What adjustment did you make that helped you get closer to the target?"','"Remember to keep your head still on the next drill"','"Who scored the most points? Great work"'],c:1,e:'Critical thinking in golf sessions is developed through reflective questions asking children to analyze their own performance. "What adjustment did you make that helped?" is a metacognitive prompt aligned with 21st-century learning.'},
{q:'A coach observes that children are not adjusting their approach between attempts. Which prompt BEST develops metacognition?',o:['"Remember — same setup, same result. You need to change something."','"What are you going to try differently on this next attempt, and why?"','"Watch how [name] is doing it — try to copy that approach"','"You have 10 attempts left. See if you can score higher"'],c:1,e:'"What are you going to try differently on this next attempt, and why?" is a metacognitive prompt requiring children to think about their own thinking process before acting — developing self-regulation and reflective practice.'},

{q:'A coach finishes a putting game and wants to embed critical thinking. Which prompt BEST achieves this?',o:['Good job everyone let\'s line up for chipping','What adjustment did you make that helped you get closer to the target?','Remember to keep your head still on the next drill','Who scored the most points?'],c:1,e:'Critical thinking is developed through reflective questions that ask children to analyze their own performance and identify what changed.'},
{q:'Which statement BEST describes the EduGolfKids coach role according to Module 5?',o:['Authority figure who gives instructions and corrects constantly','Learning facilitator, environment designer, question asker, confidence builder — more questions than commands','Junior golf professional who simplifies adult technique for young learners','Activity supervisor who keeps children safe and engaged'],c:1,e:'EduGolfKids coaches are guided learning architects. Target communication ratio: more questions than commands.'}
],
L1_M6:[
{q:'A coach says to a 7-year-old in front of the group: "You always rush — you never take your time." Under the EduGolfKids Language Code, this statement:',o:['Is acceptable because it is factually accurate','Violates the Language Code — it uses identity-based criticism ("always," "never") that creates shame and triggers anxiety','Is acceptable if said in a gentle tone','Is acceptable in the 6–9 age group who can handle more direct feedback'],c:1,e:'"You always..." and "you never..." are prohibited language patterns — they attack identity rather than describe behavior. The Language Code requires neutral outcome description and effort-based guidance.'},
{q:'A 9-year-old misses five consecutive putts and says "I\'m terrible at this." The correct coaching response is:',o:['"You\'re not terrible — you just need more practice."','"You\'re learning this — that\'s different from being bad at it. Let\'s adjust and try again."','"You\'ve been really good in previous sessions — I\'m sure you\'ll get it."','"Let\'s see if the next one goes in — just focus."'],c:1,e:'"You\'re learning this — that\'s different from being bad at it" distinguishes learning from identity labeling. This is the growth mindset response that normalizes struggle without dismissing the child\'s feeling or attaching outcome to identity.'},
{q:'A coach accidentally says "No, not like that" to a child. According to the 3-Step Language Reset Rule, the coach should:',o:['Continue the session and address the language at the end','Immediately rephrase: "Let me try that again — that one went left. Let\'s adjust together."','Privately apologize to the child after the session','Make no acknowledgment — drawing attention to the error compounds the issue'],c:1,e:'The 3-Step Language Reset requires immediate rephrasing, modeling the growth correction, and reinforcing confidence. Accountability protects culture.'},
],
L1_M7:[
{q:'A coach delivers an excellent and safe Skill Block but uses multiple prohibited phrases including "No, not like that" during the session. How should this session be evaluated?',o:['As a pass — the technical and safety execution was correct','As a fail — integration is mandatory, and Language Code violation is a failure criterion regardless of technical correctness','As requiring a partial reassessment on language only','As a conditional pass pending a follow-up observation'],c:1,e:'Module 7 states: "If a coach delivers a technically correct drill but violates language code → failure." Integration is mandatory — all modules must be applied simultaneously.'},
{q:'According to the Full Integration Map, which session segment applies the MOST motor learning principles (M3)?',o:['Warm-Up','Skill Block','Game Reinforcement','Wrap-Up'],c:1,e:'The Full Integration Map shows the Skill Block as the highest concentration of motor learning application — multiple constraint challenges, external focus cues, variable practice, and guided discovery are primarily deployed here.'},

{q:'A coach delivers a safe Skill Block but uses prohibited language throughout. How should this session be evaluated?',o:['Pass — the technical and safety execution was correct','Fail — integration is mandatory. Language Code violation is a failure criterion regardless of technical correctness.','Conditional pass pending follow-up observation','Partial reassessment on language only'],c:1,e:'Module 7: if a coach delivers a technically correct drill but violates the Language Code → failure. Integration is mandatory — all modules must be applied simultaneously.'},
{q:'Which session segment has the HIGHEST concentration of Motor Learning (M3) application?',o:['Warm-Up','Skill Block','Game Reinforcement','Wrap-Up'],c:1,e:'The Full Integration Map shows the Skill Block as the highest concentration of motor learning — constraint challenges, external focus cues, variable practice, and guided discovery are primarily deployed here.'}
],
L1_M8:[
{q:'A parent messages the coach on their personal Instagram asking for a progress update. The correct response is:',o:['Respond with a brief positive update since the intent is harmless','Do not respond via personal social media — direct the parent to contact through the approved EduGolfKids communication channel','Block the parent to avoid further personal contact','Respond but advise the parent to use official channels in future'],c:1,e:'Coaches must use only approved EduGolfKids communication channels for parent contact. Personal social media connections with parents are explicitly prohibited.'},
{q:'A coach wants to send parents a mid-term progress update about a 7-year-old struggling with distance control in putting. Which message is MOST aligned with EduGolfKids communication standards?',o:['"James is having difficulty reaching target distances in putting and needs significant improvement."','"James is building his distance control in putting — he\'s showing great focus and we\'re working through a great challenge that will accelerate this in the final sessions."','"James is below average compared to his peer group in putting distance."','"James enjoys putting but unfortunately cannot reach the target distances we need him to."'],c:1,e:'Parent communication must use growth language: describe progress positively, reference specific program activity, avoid negative ability assessments, never compare to peers.'},

{q:'A parent messages the coach on personal Instagram asking for a progress update. The correct response is:',o:['Respond with a brief positive update since the intent is harmless','Do not respond via personal social media — direct the parent to contact through the approved EduGolfKids communication channel','Block the parent to avoid further contact','Respond but advise the parent to use official channels in future'],c:1,e:'Coaches must use only approved EduGolfKids communication channels for parent contact. Personal social media connections with parents are explicitly prohibited.'},
{q:'A coach wants to share a mid-term update about a 7-year-old struggling with putting distance. Which message BEST aligns with EduGolfKids communication standards?',o:['James is having difficulty reaching target distances and needs significant improvement','James is building his distance control in putting and showing great focus — we are working through a challenge that will accelerate this','James is below average compared to his peer group in putting distance','James enjoys putting but cannot reach the target distances we need'],c:1,e:'Parent communication must use growth language: describe progress positively, reference specific program activity, avoid negative ability assessments, never compare to peers.'}
],
L1_M9:[
{q:'A coach has just started with a new school group of 8 children aged 6–9. Before beginning any activity, what is the FIRST thing the coach must do?',o:['Run an energetic warm-up game to establish the session tone','Teach the group the 5 standard commands: FREEZE, RESET, RETRIEVE, ROTATE, EYES ON ME','Conduct a skills assessment to determine the children\'s starting level','Introduce themselves and explain the full EduGolfKids program structure'],c:1,e:'The 5 standard commands are the safety foundation for every session. They must be taught to every new group before activity begins. Never assume children from different schools know the same commands.'},
{q:'During a chipping session, two children begin arguing over a scoring dispute and it escalates to pushing. The coach\'s immediate first action is:',o:['Physically step between the children to separate them','Identify the instigator and remove them immediately','Use FREEZE command for the entire group, position yourself between the children without touching, redirect the group to a safe task, and separate the involved children','Ask the group to continue while the coach addresses the two children privately'],c:2,e:'Physical altercation: FREEZE for entire group, position between children WITHOUT physical contact (restraint is never permitted), redirect group to safe task, separate involved children to supervised areas.'},
{q:'A 5-year-old asks to use the bathroom mid-session. The coach is running a full group of 8 children with no assistant. The correct response is:',o:['Allow the child to go independently since they know where it is','Pause the session, ask school staff to escort the child, and resume once the child is in safe hands','Ask another child to accompany the child to the bathroom for safety','Wait until the segment break in 3 minutes then escort the child yourself'],c:1,e:'Bathroom protocol: notify school staff — a school staff member escorts the child. Coaches NEVER escort a child to the bathroom alone.'},
],
L1_M10:[
{q:'A child with a documented seizure history begins to convulse during the Game Reinforcement segment. The correct response is:',o:['Call the parent immediately, then call school nurse','Do NOT restrain — clear the space, time the seizure, call 911 and the school nurse simultaneously, place child in recovery position after the seizure stops','Immediately place something between the child\'s teeth to protect their tongue','Ask a parent present to assist while calling the licensee'],c:1,e:'Seizure protocol: do not restrain, clear space, time the seizure, call 911 and school nurse simultaneously. Never put anything in the mouth. Recovery position after seizure stops.'},
{q:'A 6-year-old with ADHD struggles to transition between stations and becomes physically agitated. The MOST appropriate adjustment is:',o:['Allow the child to stay at their current station while the group rotates','Privately warn the child 2 minutes before the next transition: "In 2 minutes we are moving. You\'re going to do great." Then acknowledge compliance immediately','Give the child a separate quieter activity while the rest of the group rotates','Ask the parent to attend the session to support the child during transitions'],c:1,e:'ADHD coaching adjustment: privately warn the child BEFORE transitions. ADHD children struggle with abrupt changes. Advance warning reduces anxiety. Immediate acknowledgment of compliance reinforces the desired behavior.'},
{q:'A physically capable 8-year-old cannot participate in the full swing station due to a recently broken arm in a cast. The MOST appropriate inclusive response is:',o:['Ask the child to observe the full swing station and participate only in putting','Design an alternative role within the same station: scorekeeper, target placer, or team captain — with a task modification to allow meaningful participation','Move the child to a younger age group where activities are simpler','Contact the parent to confirm whether the child should attend at all'],c:1,e:'Inclusion principle: modify the task, not the child. Find a meaningful adjacent role. Never draw attention to the limitation. Full exclusion is a last resort and must be documented.'},
],
L1_M11:[
{q:'A coach checks the weather 2 hours before an outdoor session and sees a thunderstorm forecast to arrive in 3.5 hours. Session duration is 60 minutes. What is the correct action?',o:['Proceed with the outdoor session since the storm is forecast to arrive after the session ends','Begin contingency planning immediately — the storm is within the 4-hour window. Confirm indoor space availability before the session starts','Postpone the session automatically — any weather risk within 4 hours requires postponement','Check the weather again 30 minutes before the session to reassess'],c:1,e:'The 4-hour rule: if thunderstorms are forecast within 4 hours, begin contingency planning immediately. At 3.5 hours the storm is within the window — identify the indoor backup space and be prepared to move indoors.'},
{q:'During an outdoor session, a coach sees a lightning flash. They count 18 seconds before hearing thunder. What is the IMMEDIATE next step?',o:['Wait to see if lightning occurs again before evacuating','Begin evacuation immediately — 18 seconds means the storm is within 6 miles. Three whistle blasts, clubs on the ground, move to shelter','Move the group to the covered dugout adjacent to the field','Complete the current activity then evacuate at the next natural transition'],c:1,e:'18 seconds is LESS than 30 seconds — evacuate immediately. Three whistle blasts, clubs on ground (never carried during evacuation), move to a substantial building. NOT dugouts, covered bleachers, or bus stops.'},
{q:'After evacuation, the coach and group are safely inside. The last lightning flash was 22 minutes ago. A parent says the sky looks clear — can they resume outdoor play?',o:['Yes — the sky is clear and it has been more than 20 minutes','No — the 30-minute wait from the LAST flash or thunder has not been completed. Resume only after 30 full minutes from the last observed event','Yes — 20 minutes is sufficient if visibility is clear','Allow individual children whose parents consent to return outdoors while others wait inside'],c:1,e:'"NEVER resume a session early because it looks clear." The 30/30 Rule\'s second 30 matters because lightning can strike from a storm that appears to have passed. 30 full minutes from the last observation — not from when it looks clear.'},
],
L2_M1:[
{q:'A 5-year-old consistently pushes the ball right of the target when putting. The constraints-led correction is:',o:['Tell the child their putter face is open and demonstrate the correct face angle','Set up a gate drill: two tees 6 inches apart — the gate provides face-angle feedback without any verbal correction','Reduce the putting distance to 1 foot until accuracy improves','Ask the child to watch a peer who is putting accurately and copy them'],c:1,e:'CLA for putting: a gate of two tees provides immediate environmental feedback on face alignment. The child\'s nervous system self-corrects to navigate the gate. No verbal instruction about face angle is needed.'},
{q:'A coach is assessing a 7-year-old\'s Skills Passport putting criteria. The child makes 3 out of 5 putts from 4 feet through a 6-inch gate. What is the correct assessment outcome?',o:['Not yet met — the standard requires 4 out of 5','Met — 3 out of 5 meets the stated criteria for this age group','Partially met — record as in-progress','Not assessable — the gate is too small for this age group'],c:1,e:'Skills Passport criteria for ages 6–9 putting: "3 out of 5 putts from 4 feet through a 6-inch gate." 3 out of 5 meets the standard. Assessment is observable and specific — no subjective interpretation required.'},

{q:'A 5-year-old is in Stage 1 of the putting progression. What is the coach\'s primary role?',o:['Correct grip and stance to establish good habits early','Place ball near hole, let child attempt without instruction, celebrate any contact — do NOT correct technique','Set up a gate drill and teach face angle awareness','Introduce the 3-count ritual to develop a consistent setup routine'],c:1,e:'Stage 1 is Free Exploration. The child attempts without instruction and the coach celebrates any contact. No grip, stance, or technique correction at this stage.'},
{q:'A 7-year-old\'s putts consistently stop short. The correct constraint response is:',o:['Instruct the child to swing harder through impact','Move the target closer until the child builds confidence, then gradually increase distance','Tell the child they are decelerating and need to accelerate through the ball','Switch to a longer putter to generate more distance'],c:1,e:'Ball stopping short = deceleration = fear of hitting too hard. Solution: move target closer, build confidence of reaching, slowly increase distance. Never give technical instruction about acceleration.'},
{q:'For ages 4–6, what is the maximum putting distance used in the progression?',o:['8–10 feet','5–6 feet','2–4 feet maximum','10–15 feet'],c:2,e:'Ages 4–6 putting: maximum distance 2–4 feet. Target minimum 6 inches diameter. Putter below chin. Foam ball. These constraints ensure achievable success at the Active Start stage.'}
],
L2_M2:[
{q:'What is the PRIMARY reason EduGolfKids connects the chipping motion to the putting motion?',o:['It reduces the number of grip adjustments children need to make','Motor learning research shows skill transfer is maximized when new movements are anchored to existing neural patterns — children learn chipping 40% faster this way','It allows children to use the same club for both skills','It is consistent with LTAD stage requirements'],c:1,e:'Motor learning research (Wulf 2013): skill transfer is maximized when new movements anchor to existing neural patterns. The chipping-putting connection leverages the pendulum motion already established.'},
{q:'A 7-year-old consistently tops the ball (ball rolls along ground). The constraints-led response is:',o:['Instruct the child to keep their head down and watch the ball throughout the swing','Lower the tee height so the ball sits closer to the ground, and/or shrink the ball size — both force more precise contact naturally','Use a different club — a shorter iron will reduce the error','Have the child practice the chip motion without a ball first'],c:1,e:'Topping error CLA response: lowering the tee height or shrinking the ball size both require more precise contact. The constraint creates the correct movement pattern through natural problem-solving.'},

{q:'During Stage 2 Club Discovery for ages 6–9, what does the coach do?',o:['Explain loft differences before the child tries the clubs','Give both clubs with no instruction: "Try both and tell me what you notice"','Assign the wedge for short chips and the 7-iron for longer chips','Wait until the child asks about club selection'],c:1,e:'Club selection thinking emerges through exploration, not lecture. Give both clubs, no instruction. After exploration use guided discovery.'},
{q:'A child\'s chip shots have no trajectory — the ball runs along the ground. The correct constraint response is:',o:['Instruct the child to open the club face and take more loft','Introduce an air gate — two cones 12 inches high. Ball must fly through to score.','Tell the child to position the ball further forward in their stance','Switch to a higher-lofted club and instruct the child to use it'],c:1,e:'No trajectory CLA: introduce the air gate. The gate creates a loft requirement without any technical explanation.'},
{q:'What is the primary reason EduGolfKids teaches chipping as an extension of putting?',o:['It reduces the number of grip changes needed','Motor learning research shows skill transfer is maximized when new movements anchor to existing neural patterns — children learn chipping 40% faster','It allows children to use the same club for both skills','It is consistent with LTAD stage requirements'],c:1,e:'Motor learning (Wulf 2013): skill transfer maximized when new movements build on existing neural patterns. The chipping-putting connection leverages the already-established pendulum motion.'}
],
L2_M3:[
{q:'Which constraint is MOST effective for helping a 9-year-old develop pitching distance awareness WITHOUT direct instruction about swing length?',o:['Instruct the child: "Bigger swing = more distance"','Distance zones: landing targets at 15, 20, 25, 30 feet — child selects zone, executes, self-scores. Distance awareness emerges through exploration','Use different clubs at each distance to vary the trajectory','Time-pressure rounds: child must pitch to all zones within 60 seconds'],c:1,e:'Variable distance constraint: landing zones at progressive distances require the child\'s nervous system to self-regulate swing length for each target. The relationship between swing size and distance is discovered through exploration.'},

{q:'Why is pitching classified as a 6–9 age skill only?',o:['Younger children do not have the attention span for pitching','Pitching requires simultaneous hip rotation, weight transfer, and trajectory management — these demand FUNdamentals stage neurological readiness','Pitching equipment is too heavy for children under 6','The injury risk from pitching is too high for Active Start stage'],c:1,e:'Pitching requires simultaneous integration of hip/shoulder rotation, weight transfer, and trajectory management. These demand FUNdamentals stage neurological readiness.'},
{q:'Stage 4 of the pitching progression integrates two skills for the first time. What does this look like?',o:['Child uses both a 7-iron and a wedge in the same scoring game','Pitching + Putting Course: child pitches to within putting distance, then putts out — first integration of two skills','Child pitches to a landing zone and then chips to the hole','Two children compete — one pitches and one putts, earning team points'],c:1,e:'Stage 4 is a Pitching + Putting Course: pitch to within putting distance, then putt out. First time two skills are integrated in a real course-simulation context.'}
],
L2_M4:[
{q:'A 9-year-old has good contact and distance but loses balance consistently at the finish. The constraints-led response is:',o:['Instruct the child to "hold your finish position for 3 seconds after every shot"','Use the feet-together drill — this forces balanced rotation naturally through the movement challenge, no verbal instruction about balance required','Widen the child\'s stance to create a more stable base','Reduce swing speed and build up gradually'],c:1,e:'Feet-together drill: when children cannot maintain balance, their nervous system must find a balanced rotation pattern to execute the swing. Balance improves through the constraint — not through instruction about how to balance.'},

{q:'Why does EduGolfKids introduce the full swing LAST in the skill progression?',o:['The full swing requires the most space so it is left until equipment can be set up properly','By this stage, children have pendulum rhythm (putting), downward strike (chipping), and weight transfer/rotation (pitching) — the full swing is an extension, not a new skill','The full swing is the most technically complex and requires the most preparation time','Full swing equipment is the most expensive so schools delay its use'],c:1,e:'The full swing is introduced last because it builds on everything already learned. It is an extension of existing foundations, not a new skill.'},
{q:'A parent asks if their 6-year-old can start using a driver. What conditions must be met?',o:['The child must be in the 6–9 age group with good coordination','Foam balls only, adequate space, and consistent 7-iron competency must be established first. At 4–6, full swing is through free play only — never structured instruction.','Driver use requires written parent consent and must be in an outdoor setting only','The child must have completed the putting and chipping Skills Passport criteria first'],c:1,e:'Driver use requires: foam balls only, adequate space, consistent 7-iron competency first. Ages 4–6: full swing through free play only — never structured instruction.'}
],
L2_M5:[
{q:'An 8-year-old asks why they cannot pick up their ball and place it closer to the hole. The MOST appropriate rules introduction is:',o:['Explain the full rules of golf including stroke play and penalties','Address it in the moment: "In golf, we play the ball from where it stops — that\'s what makes it a great challenge. Let\'s try from there." One rule, in context','Tell the child that EduGolfKids sessions do not follow golf rules','Redirect the child without explanation to avoid a lengthy rules discussion'],c:1,e:'Rules introduction: rules are only introduced when a situation arises — never front-loaded. One rule, explained in context, connected to the game situation.'},

{q:'How should a coach introduce the rule \'play the ball from where it stops\' to a group of 8-year-olds?',o:['Spend 5 minutes at the start of the session explaining all basic golf rules','Only introduce the rule when a situation naturally arises in a game — one rule in context, then continue playing immediately','Print a rules sheet and distribute it to all children at the start of term','Ask children to study the rules at home and bring questions to the next session'],c:1,e:'Rules introduction: only when a situation arises — never front-loaded. One rule, in context, connected to the game situation.'},
{q:'What is the purpose of the end-of-session etiquette ritual?',o:['To assess whether children have met Skills Passport etiquette criteria','To build club culture — children stack equipment correctly, applaud the best effort, and say something positive to the person next to them','To provide a structured cool-down that reduces injury risk','To give coaches time to pack up while children are occupied'],c:1,e:'The 2-minute end-of-session etiquette ritual: stack equipment correctly, group applause for best effort (coach nominates), say a positive word to the person next to them.'}
],
L2_M6:[
{q:'At end of term a coach has assessed Skills Passport criteria for 6 out of 7 children. One child was absent for the final assessment session. What must the coach do?',o:['Record "Not Assessed" status for the absent child and move on','Contact the parent to schedule an assessment in the first session of next term — 100% completion is mandatory','Assess the child based on performance observations from earlier in the term','Advise the licensee and allow them to decide'],c:1,e:'100% completion rate is mandatory — every enrolled child must receive a Passport entry at end of every term. An absent child requires a scheduled assessment in the first session of next term.'},

{q:'When must a coach complete Skills Passport assessment for all enrolled children?',o:['At the end of every third session','At the end of every term — 100% of enrolled children must receive a Passport entry. No exceptions.','Only for children who have shown measurable improvement','At the start of each new term as a baseline'],c:1,e:'Completion is mandatory: 100% of enrolled children must receive a Passport entry at the end of every term. No exceptions.'},
{q:'A child makes 3 out of 5 putts from 4 feet through a 6-inch gate. What is the outcome for ages 6–9?',o:['Not yet met — standard requires 4 out of 5','Met — 3 out of 5 meets the stated criteria for this age group','Partially met — record as in-progress','Met — any attempt counts because effort is primary'],c:1,e:'Skills Passport criteria for ages 6–9 putting: 3 out of 5 putts from 4 feet through a 6-inch gate meets the standard.'}
],
L2_M7:[
{q:'After watching a video clip of their putting stroke, a 9-year-old says "My arm is bending." Before responding, the coach should:',o:['Confirm the observation and correct the arm position directly','Validate the self-observation first: "Interesting — what do you think happens to the ball when your arm bends at impact?"','Tell the child not to focus on their arm — external focus is more effective','Use the observation as a teaching moment for the full group'],c:1,e:'Video analysis guided discovery: the child has made a self-observation — a high-quality motor learning moment. The coach validates and converts it to a guided discovery question. This builds autonomy and self-correction ability.'},

{q:'For which age group is CoachNow video analysis appropriate?',o:['Ages 4–6 from the first session as a motivational tool','Ages 6–9 only, after consistent contact and basic skill pattern are established — for self-discovery questions only','All ages, used as a primary teaching tool throughout','Any age when the parent requests video feedback'],c:1,e:'Video analysis is a Level 2 tool. Ages 6–9 only, after consistent contact and basic skill pattern are established, for self-discovery questions only.'},
{q:'After showing a 9-year-old a video of their stroke, the child says \'My elbow is bending.\' What does the coach do FIRST?',o:['Confirm the observation and immediately correct the elbow position','Validate the self-observation: "Interesting — what do you think happens to the ball when your elbow bends at impact?"','Tell the child not to focus on their elbow','Use the observation as a teaching moment for the full group'],c:1,e:'Video guided discovery: validate the self-observation and convert it to a guided discovery question. Builds autonomy and self-correction ability through the child\'s own insight.'},
{q:'What is the correct video clip length and timing in EduGolfKids sessions?',o:['30–60 seconds capturing multiple attempts','Maximum 10 seconds — shown immediately after the attempt. Ask "What did you notice?" before any observation.','2–3 minutes providing comprehensive feedback','As long as needed to capture the full swing sequence'],c:1,e:'Protocol: Record one clip (maximum 10 seconds). Show immediately after the attempt. Ask "What did you notice?" before making any observation yourself.'}
],
L2_M8:[
{q:'A coach is running a chipping session in a gym with a 9-foot ceiling. Full chipping swings are hitting the ceiling and bouncing unpredictably. What is the CORRECT response?',o:['Continue the session but ask children to reduce their swing size','Assess the ceiling height as unsafe for full chipping — transition to a putting session or modify to chip-length motion only','Move the children to one half of the gym where the ceiling appears higher','Inform parents about the ceiling issue and seek permission to continue'],c:1,e:'Indoor sessions require ceiling height assessment. If full swing is not appropriate, the coach must modify — shorter iron or chip-length swings only indoors. A ceiling being struck creates unpredictable projectile risk.'},
{q:'During a full swing session, a child repeatedly swings before the RETRIEVE command while others are still collecting balls. Steps 1–3 of the Behavior Management Ladder have been applied with no improvement. What is the correct Step 4 action?',o:['Physically guide the child back to their starting position','"I need you to wait for the RETRIEVE command. If you swing before it is given, you will take a 2-minute break from the activity. It\'s your choice."','Remove the child from the session entirely','Reduce the child\'s equipment to a putter only for the remainder of the session'],c:1,e:'Behavior Management Step 4: choice and consequence. "I need you to [behavior]. If you continue, [consequence]. It\'s your choice." This maintains dignity and gives agency while making the consequence clear.'},

{q:'What is the minimum lateral spacing for a full swing session?',o:['6 feet — same as putting','8 feet','10 feet — greater than putting standard due to increased swing arc and force','12 feet — to account for maximum swing extension'],c:2,e:'Full swing sessions require 10 feet minimum lateral spacing. Forward swing arc must be completely clear.'},
{q:'A chipping session in a gym has full swings hitting the 9-foot ceiling. What is correct?',o:['Continue but instruct children to reduce their swing size','Stop full chipping swings — transition to putting only or modify to chip-length motion only','Move children to where the ceiling appears higher','Inform parents about the ceiling issue and seek permission to continue'],c:1,e:'Indoor sessions require ceiling height assessment. If full swing is not appropriate, the coach must modify — shorter iron or chip-length swings only indoors.'},
{q:'A child repeatedly swings before the RETRIEVE command. Steps 1–3 applied. What is Step 4?',o:['Physically guide the child back to starting position','"I need you to wait for the RETRIEVE command. If you swing before it is given, you will take a 2-minute break. It\'s your choice."','Remove the child from the session entirely','Switch the child to putting only for the rest of the session'],c:1,e:'Behavior Management Step 4: choice and consequence. "I need you to [behavior]. If you continue, [consequence]. It\'s your choice." Maintains dignity and gives agency.'}
],
L3_M1:[
{q:'A licensee is beginning outreach in their new territory with 8 public schools, 4 private schools, and 3 charter schools. In what order should they approach these schools?',o:['Public schools first — largest enrollment, biggest market opportunity','Private schools first, then charter schools, then public schools — this is the EduGolfKids tiering system','All schools simultaneously to maximize outreach efficiency','Charter schools first — they have more autonomy and move faster'],c:1,e:'EduGolfKids school tiering: Tier 1 (Private/Independent) → Tier 2 (Charter/Magnet) → Tier 3 (Public Elementary). Private schools are approached first because decision-making is faster and parents actively seek enrichment.'},
{q:'At a school meeting, a principal asks: "What if a child gets hurt during your program?" The most effective response is:',o:['"We have never had a serious incident in our program\'s history, so this is very unlikely."','"Our coaches are safeguarding-trained, carry full liability insurance, and have a documented Emergency Action Plan for every site. We maintain $1M general liability coverage and a SAM endorsement."','"Parents sign a liability waiver at enrollment that covers injury claims against the school."','"Injuries are covered by the school\'s own liability insurance under their enrichment program framework."'],c:1,e:'Injury objection response: lead with safeguarding training, full liability insurance, and documented EAP. These are the three elements that remove school liability concern.'},

{q:'Which school tier should a licensee approach FIRST?',o:['Public elementary schools — largest enrollment','Private and independent schools — faster decisions, parents seek enrichment, no committee process needed','Charter schools — more autonomy than public','After-school operators — fastest to start'],c:1,e:'Tier 1 is always private and independent schools. Decision-making is faster (principal has authority), parents actively seek enrichment, and one great partnership generates warm referrals.'},
{q:'What is the correct first contact sequence with a school principal?',o:['Call first, then follow up with an email','Email first, wait 3 business days, then call — follow up every 3–4 business days','Send a physical letter first, then follow up with email and phone','Arrange an in-person visit without prior contact to demonstrate commitment'],c:1,e:'Email before calling — always. Email creates context and professionalism. Then call 3 business days later. Follow up every 3–4 business days.'},
{q:'What must a licensee bring to every school meeting?',o:['A full business plan and financial projections','EduGolfKids one-pager, coach certifications, background check documentation, insurance certificate, sample session plan, Skills Passport sample, and parent information letter template','Just the program one-pager — too many documents overwhelm principals','A tablet with video footage of EduGolfKids sessions'],c:1,e:'Come prepared with everything the principal needs to say yes in that meeting: one-pager, certifications, background checks, insurance certificate, reference from another school, sample session plan, Skills Passport sample, and parent information letter template.'}
],
L3_M2:[
{q:'A coaching candidate has a professional golf background but says "I find it hard to follow a strict curriculum — I prefer to adapt sessions using my experience." How should the licensee evaluate this candidate?',o:['Highly positively — adaptability is a key coaching quality','As a significant red flag — resistance to following the EduGolfKids system is a non-negotiable disqualifier regardless of golf ability','Conditionally — offer the role pending a probationary period','Positively — their golf expertise will benefit the program even if their style differs'],c:1,e:'"Resistance to following a structured program" is explicitly listed as a red flag — do not hire regardless of golf ability. The EduGolfKids system depends on curriculum compliance.'},

{q:'A candidate says \'I prefer to adapt sessions rather than follow a fixed curriculum.\' How should the licensee evaluate this?',o:['Highly positively — adaptability is critical','As a red flag — resistance to following the EduGolfKids system is a non-negotiable disqualifier regardless of golf ability','As a conditional pass — offer a 3-month probationary period','As manageable — the candidate will adapt once they see how effective the system is'],c:1,e:'Resistance to following a structured program is explicitly listed as a red flag — do not hire regardless of golf ability.'},
{q:'What is the MOST predictive screening tool when hiring coaches?',o:['A structured 30-minute competency-based interview','Watching the candidate interact with children for 10 minutes — you will know within 5 minutes whether they have the instinct for this role','A written test on child development principles','A reference check from previous employers'],c:1,e:'The single most predictive tool: watch them interact with children for 10 minutes. Natural warmth with children cannot be trained. Everything else can.'},
{q:'What is the correct onboarding sequence for a newly hired coach?',o:['Background check → certification → shadowing → independent sessions','Background check → offer → L1 certification (within 4 weeks) → shadow 2 sessions → co-deliver 2 sessions → first independent session with licensee present','Certification → background check → shadowing → supervised sessions','Offer → background check → independent sessions while completing certification'],c:1,e:'Correct sequence: background check (non-negotiable before any offer) → offer → L1 certification within 4 weeks → shadow 2 sessions → co-deliver 2 sessions → first independent session with licensee present.'}
],
L3_M3:[
{q:'A licensee plans their first demo day at a new school. Only 4 children show up instead of the expected 15. Which response BEST protects the enrollment opportunity?',o:['Postpone the demo day and reschedule for a larger turnout','Deliver an outstanding session for the 4 children present — their experience IS your marketing. Follow up with every family within 48 hours','Run a shortened 15-minute demo since the group is small','Offer the 4 children a free first term to compensate'],c:1,e:'Operator benchmark: a well-run demo day converts 40–70% of attendees regardless of size. 4 children with an outstanding experience will each tell 2–3 friends. Always deliver your best session.'},

{q:'Which marketing activity has the highest enrollment conversion rate?',o:['Facebook and Instagram advertising','Demo days — a parent who sees their child hit a golf ball and smile in a 10-minute demo will enroll 60%+ of the time','School newsletter features','Free trial voucher distribution through school bags'],c:1,e:'Demo days rank Tier 1. Operator benchmark: a well-run demo day converts 40–70% of attendees. Nothing else comes close.'},
{q:'What makes the Player of the Week program an effective retention tool?',o:['It rewards the best golfer which motivates all children to improve','Recognition creates loyalty — parents share it, other parents see it, every child wants to earn it. Costs nothing. Builds fierce loyalty.','It gives coaches a weekly session planning structure','It provides licensees data on which children are progressing fastest'],c:1,e:'Player of the Week is awarded for effort, improvement, or attitude — not best golf. The recognition creates a ripple effect: parent shares it, other parents see it, every child wants to earn it.'},
{q:'What is the recommended social media posting frequency during active school terms?',o:['Daily posts for maximum visibility','3–4 times per week during active terms, 1–2 times per week during breaks','Once per week — quality over quantity','Only post when there is enrollment news or program updates'],c:0,e:'3–4 times per week during active terms, 1–2 times during breaks. Avoid pure promotional posts.'}
],
L3_M4:[
{q:'A school charges a 10% revenue share as a condition of partnership. The licensee has 7 enrolled children paying $20/session. What is the correct adjusted price per child?',o:['$20 — absorb the school fee as a cost of doing business','$22 — add the 10% directly to the base price ($20 + $2 = $22)','$20.50 — split the cost equally between the licensee and parents','$21 — a conservative adjustment to maintain competitiveness'],c:1,e:'Revenue share: $20 × 10% = $2 per child per session. Adjusted price = $22. Never absorb school fees into margin — this erodes profitability rapidly at scale.'},
{q:'In Month 3, a licensee has 1 class of 5 children (not full at 7) at their only school. A new school approaches them about starting a program. What should the licensee do?',o:['Start the new school immediately — more schools means more revenue','Fill the existing class to 7 before prioritizing the new school — a partially filled class of 5 vs 7 costs $40 per session in lost revenue','Accept the new school but keep the existing class size as is','Negotiate a trial with the new school while working on filling the existing class simultaneously'],c:1,e:'Fill-first growth model: the existing class of 5 vs full 7 costs $40 per session in lost revenue. Filling existing schools before expanding is the fundamental discipline.'},

{q:'A school charges a 15% revenue share. What is the correct adjusted price per child?',o:['$20 — absorb the school fee to stay competitive','$23 — add the 15% on top of the base price ($20 + $3 = $23)','$21.50 — split the cost equally','$22 — a conservative adjustment'],c:1,e:'Revenue share: $20 × 15% = $3 per child per session. Adjusted price = $23. Never absorb school fees into margin.'},
{q:'A class has 5 children instead of the maximum 7. How does this affect monthly revenue?',o:['No impact — coach costs are the same regardless','$40 per session in lost revenue (2 children × $20) = $160/month lost per class','$20 per session in lost revenue','No revenue impact as long as the coach is paid per session'],c:1,e:'5 vs 7 = 2 missing × $20 = $40/session lost. At 4 sessions/month = $160/month per class. Partially filled classes destroy margin.'},
{q:'What are the three healthy benchmark percentages for a well-run operation?',o:['Coach costs max 20%, overhead max 10%, net profit min 70%','Coach costs max 30–35%, overhead max 15–20%, net profit target 45–55%','Coach costs max 40%, overhead max 25%, net profit target 35%','Coach costs max 50%, overhead max 20%, net profit target 30%'],c:1,e:'Healthy benchmarks: coach costs max 30–35%, overhead max 15–20%, net profit target 45–55%.'}
],
L3_M5:[
{q:'A coach calls in sick 90 minutes before a session at the licensee\'s busiest school (21 enrolled children across 3 classes). What is the licensee\'s immediate priority?',o:['Cancel the session and notify parents as quickly as possible','Contact the cover coach immediately — a cover coach must always be on call. If no cover, the licensee delivers the session personally','Contact the school to inform them of the cancellation and reschedule','Ask another active coach to split the 3 classes between 2 coaches'],c:1,e:'"Never rely on a single point of coach failure at a school. Always have a backup." A cover coach must always be on call. If unavailable, the licensee delivers the session — the school relationship and 4-lessons-per-month revenue protection both depend on it.'},

{q:'What are the 5 elements of the Coach Management Framework?',o:['Recruitment, onboarding, training, assessment, termination','Clear role expectations, session confirmation protocol, post-session logging, quarterly observation, monthly team meeting','Background checks, certification, shadowing, supervision, performance review','School assignment, delivery, parent communication, incident reporting, annual review'],c:1,e:'The 5 elements: (1) Clear Role Expectations, (2) Session Confirmation Protocol, (3) Post-Session Logging, (4) Quarterly Observation, (5) Monthly Team Meeting.'},
{q:'A coach calls in sick 2 hours before a session. What is the immediate action?',o:['Cancel the session and notify parents','Activate the cover coach immediately — always on call for every school. If unavailable, the licensee delivers the session personally.','Split the class between remaining coaches even if it exceeds 1:7 ratio','Contact the school to inform them and reschedule for next week'],c:1,e:'"Never rely on a single point of coach failure at a school. Always have a backup." If no cover, the licensee delivers the session.'},
{q:'What is the correct Skills Passport completion rate target?',o:['80% — some children are absent at assessment time','90% — accounting for illness and scheduling conflicts','100% — every enrolled child receives a Passport entry at the end of every term. No exceptions.','70% — the minimum acceptable standard'],c:2,e:'100% completion is mandatory. A coach below 100% has a gap that must be addressed immediately.'}
],
L3_M6:[
{q:'A licensee at Stage 2 is pressured by a new school to start immediately. They have one class half-filled at School 1 and a new coach still completing certification. Which response is MOST aligned with the EduGolfKids growth model?',o:['Accept the third school — more schools is always better','Decline to proceed until Stage 2 success criteria are met: second coach certified AND second school first term complete','Accept but delay the start date by 4 weeks','Accept and deliver the third school\'s sessions personally while the coach certifies'],c:1,e:'Stage gate 2 success criteria: second coach certified and performing independently AND School 2 first term completed successfully. Neither criterion is met. Accepting a third school now risks quality at all locations.'},

{q:'Which of the following is NOT one of the 5 conditions for a school to be "fully occupied"?',o:['Every class has 7 enrolled children','The school has been operating for at least 2 full terms','Parent retention from term to term is above 70%','The coach at that school is stable, certified, and performing well'],c:1,e:'The 5 conditions: every class at 7 children, 4 sessions/month consistently, school relationship strong, coach stable and certified, parent retention above 70%. Duration of operation is not a condition.'},
{q:'What gross monthly revenue would 10 fully-occupied schools generate (3 classes, 7 children, $20/lesson, 4 sessions/month)?',o:['$8,400 gross per month','$12,600 gross per month','$16,800 gross per month','$21,000 gross per month'],c:2,e:'Calculation: 3 coaches × 7 children × $20 × 4 sessions = $1,680/month per school × 10 schools = $16,800 gross per month.'}
],
L3_M7:[
{q:'A licensee wants to create their own marketing flyers with a slightly modified EduGolfKids logo to better match their local market. What is the correct approach?',o:['Proceed — minor logo modifications are acceptable if the brand is recognizable','Request the design change through HQ — all marketing materials must use approved EduGolfKids templates and any logo modifications require HQ approval','Use the modified logo for local social media only','Have the materials reviewed by another licensee before use'],c:1,e:'Brand compliance: all marketing materials must use approved EduGolfKids templates. Logo modifications are not permitted without HQ approval. Every territory carries the brand of every other territory.'},

{q:'A licensee wants to use a slightly modified EduGolfKids logo for their local market. What is correct?',o:['Proceed — minor modifications acceptable if the brand remains recognizable','Request the change through HQ — all marketing materials must use approved templates and any logo modifications require HQ approval','Use the modified logo on local social media only','Have other licensees review the materials before using'],c:1,e:'Brand compliance: all marketing materials must use approved EduGolfKids templates. Logo modifications require HQ approval.'},
{q:'Within how many hours must a licensee report a serious incident to HQ?',o:['12 hours','24 hours via the official incident report channel','48 hours to allow time to gather complete information','72 hours once the situation is fully resolved'],c:1,e:'Serious incident: coach notifies licensee within 1 hour. Licensee notifies HQ within 24 hours via the official incident report channel.'}
],
L3_M8:[
{q:'A serious incident occurs at one of the licensee\'s schools (a child taken to hospital). The coach calls the licensee. What is the licensee\'s mandatory reporting timeline to HQ?',o:['Within 24 hours via the official incident report channel','Within 48 hours — to allow time to gather full information first','Within 1 week — once the child\'s condition is confirmed','There is no mandatory timeline — report when all information is available'],c:0,e:'Incident management: coach notifies licensee within 1 hour. Licensee notifies HQ within 24 hours via the official incident report channel. This is non-negotiable.'},
{q:'A licensee\'s Sexual Abuse and Molestation (SAM) insurance endorsement expires next week. General Liability insurance is current for another 8 months. What sessions may the licensee run?',o:['All sessions — General Liability coverage is current and is the primary requirement','No sessions may be delivered once the SAM endorsement expires — it has zero grace period on expiry','Sessions at schools without children under 10 may continue','Sessions may continue for 30 days with a grace period during renewal'],c:1,e:'SAM endorsement has zero grace period on expiry. An expired SAM endorsement means no sessions — period. Both GL and SAM must be current.'},

{q:'A licensee\'s SAM insurance expires in 3 days. GL is current for 10 months. What must happen?',o:['Sessions may continue under GL alone until SAM renewal is processed','No sessions may be delivered — SAM has zero grace period on expiry. Renew before any further sessions.','Sessions may continue for 30 days during renewal','Notify all schools and obtain written agreement to continue'],c:1,e:'SAM endorsement has zero grace period on expiry. An expired SAM means no sessions — period. Both GL and SAM must be current.'},
{q:'What does the quarterly coach observation checklist cover?',o:['Financial performance — class fill rates and invoice compliance','Session architecture compliance, safety and spacing standards, Language Code compliance, engagement management, and Skills Passport tracking','Marketing effectiveness — parent satisfaction and referral rates','Administrative compliance — session logging, incident reporting, and attendance records'],c:1,e:'Quarterly observation: session architecture compliance, safety/spacing standards, Language Code compliance, engagement management (all children active, no long lines), Skills Passport tracking.'},
{q:'What are the 4 steps in the licensee incident management sequence?',o:['Gather information → notify HQ → notify school → notify parents','Coach notifies licensee within 1 hour → licensee notifies HQ within 24 hours → official incident report submitted → follow up with school principal within 24 hours','Notify parents first → notify HQ within 48 hours → submit incident report → debrief coach','Notify school principal first → notify HQ within 24 hours → notify parents → submit incident report'],c:1,e:'Incident management: (1) Coach notifies licensee within 1 hour. (2) Licensee notifies HQ within 24 hours. (3) Official incident report submitted. (4) Follow up with school principal within 24 hours.'}
],
};

// ══════════════════════════════════════════
//  LEVEL ASSESSMENT QUESTIONS
// ══════════════════════════════════════════

const QUIZ_QUESTIONS = {
M0:[
{q:'What does "in loco parentis" mean for EduGolfKids coaches during sessions?',o:['The coach is legally responsible for all injuries during sessions','The coach acts in the place of a parent — assuming active supervisory responsibility','The school assumes parental rights during school hours','The licensee indemnifies parents against liability'],c:1},
{q:'A coach is running a one-on-one session due to low enrollment. Under what condition is this permitted?',o:['Only if the parent has provided written permission','A second adult must be present and the space must be open and observable','It is never permitted under any circumstances','Only if the session is recorded on video'],c:1},
{q:'Which of the following IS permitted under the physical contact policy?',o:['Adjusting a child\'s grip without any verbal explanation','A brief instructional shoulder adjustment preceded by verbal explanation','Extended physical guidance throughout a full swing demonstration','Physical contact of any kind is prohibited under all circumstances'],c:1},
{q:'A coach suspects a child may be experiencing abuse. What is the correct sequence?',o:['Contact the parent privately to discuss the concern before any other action','Document observations for 3 sessions before reporting to avoid false accusations','Ensure child safety, report to designated school authority, follow state reporting law, notify EduGolfKids Compliance Officer','Notify the licensee only — let the licensee decide whether to escalate'],c:2},
{q:'How early must a coach arrive before a scheduled session?',o:['5 minutes','10 minutes','15 minutes minimum','Any time before the session starts'],c:2},
{q:'Equipment breakdown after a session may only begin when:',o:['The session\'s 60 minutes have elapsed','The coach has submitted the session log','All children have been safely handed over and the area is clear of participants','The principal has confirmed the area can be vacated'],c:2},
{q:'Which background screening component is non-negotiable BEFORE a coach enters any school?',o:['CPR certification only','State-level criminal background check and national sex offender registry screening','First Aid certification only','EduGolfKids Model 0 certification only'],c:1},
{q:'A coach must complete an incident report within how many hours?',o:['12 hours','24 hours','48 hours','72 hours'],c:1},
{q:'Under the EduGolfKids dress code, which is PROHIBITED?',o:['Collared golf shirt','Golf shorts','Clean jeans and a branded polo','Golf pants and athletic shoes'],c:2},
{q:'What is the minimum lateral spacing between children during a hitting session?',o:['3 feet','4 feet','5 feet','6 feet'],c:3},
{q:'When is a coach permitted to use their personal phone during an active session?',o:['To check personal messages briefly between drills','For instructional video recording, approved photos with consent, session plans, attendance, and emergency communication only','At any time as long as children are actively engaged','Never — phones must be switched off during sessions'],c:1},
{q:'When is one-on-one coaching with a child PROHIBITED?',o:['When the child is under age 7','When it takes place in an open observable space','When it takes place behind closed doors or in non-monitored areas without staff awareness','When it is requested by the parent'],c:2},
{q:'EduGolfKids General Liability insurance minimum per occurrence is:',o:['$500,000','$750,000','$1,000,000','$2,000,000'],c:2},
{q:'A parent is 45 minutes late to collect their child. What is the correct action?',o:['Allow the child to wait in the school building unsupervised','Remain with the child, contact the parent immediately, and maintain supervision until collected','Contact administration and then leave the child in their care','Call emergency services after 30 minutes'],c:1},
{q:'A coach arrives at a school and equipment setup is not complete. The children are waiting outside the session area. What must the coach do?',o:['Begin setup quickly with children present so the session can start on time','Ask children to stand back while setup is completed','Keep children outside the area until setup is fully complete — children may never be present during equipment assembly','Ask the school to supervise children while the coach finishes setup'],c:2},
],
L1:[
{q:'What is the correct EduGolfKids session time structure?',o:['15-min warm-up, 25-min skill, 15-min game, 5-min wrap-up','10-min warm-up, 20-min skill block, 20-min game reinforcement, 10-min wrap-up','5-min warm-up, 30-min skill block, 20-min game, 5-min wrap-up','Flexible — coaches adapt based on group needs'],c:1},
{q:'A 5-year-old drops their club and says "I quit." The FIRST response should be:',o:['Encourage the child to try again at the same difficulty level','Immediately reduce task difficulty and re-engage with effort-based praise','Ask other children to encourage them','Sit the child out and return them when ready'],c:1},
{q:'Which practice type produces greater long-term skill retention in children?',o:['Blocked practice — same drill repeated','Variable practice — changing distance, target, and scoring rules','Observation-based practice — watching peers','Coach-led repetition with continuous correction'],c:1},
{q:'What is the LTAD stage for children aged 4–6?',o:['FUNdamentals','Active Start','Learning to Train','Training to Train'],c:1},
{q:'Which is PROHIBITED language under the EduGolfKids Language Code?',o:['"That was closer!"','"What could you change?"','"You\'re not good at this."','"Keep exploring."'],c:2},
{q:'A 7-year-old consistently chips fat. The constraints-led correction is:',o:['Direct instruction: "Weight forward, hit ball first"','Place a tee 2 inches behind the ball — if the child hits the tee it provides immediate feedback','Move the child to a larger softer ball','Demonstrate the correct motion 3 times before the child tries'],c:1},
{q:'According to the Full Integration Map, which segment has the HIGHEST concentration of M3 application?',o:['Warm-Up','Skill Block','Game Reinforcement','Wrap-Up'],c:1},
{q:'A coach accidentally says "No, not like that." The 3-Step Language Reset requires:',o:['Ignoring the slip and continuing normally','Apologizing to the child after the session','Immediately rephrasing, modeling the growth correction, and reinforcing confidence','Noting the violation and addressing it in the next team meeting'],c:2},
{q:'A 7-year-old has an unusual grip but consistently reaches the target. The correct response is:',o:['Correct the grip immediately to prevent ingrained bad habits','If the movement is safe, functional, achieves target success, and the child is confident — development takes precedence over correction','Advise the parent to seek private technical coaching','Record the issue in the Skills Passport for next term\'s focus'],c:1},
{q:'Maximum class size per coach in EduGolfKids is:',o:['5','6','7','8'],c:2},
{q:'What should a coach do FIRST when a child becomes behaviorally disruptive?',o:['Give a verbal warning','Apply a consequence','Adjust the environment — check if task difficulty, spacing, or wait time is contributing','Move physically closer and make eye contact'],c:2},
{q:'A child with a documented seizure disorder has a seizure during a session. The coach must:',o:['Restrain the child gently to prevent self-injury','Do NOT restrain, clear the space, time the seizure, call 911 and school nurse simultaneously','Place something soft in the child\'s mouth to protect their tongue','Call the parent before calling emergency services'],c:1},
{q:'A child who needs the bathroom must be:',o:['Escorted by another child if the coach cannot leave the group','Allowed to go independently if the bathroom is visible from the session area','Escorted by a school staff member — coaches never escort children to the bathroom alone','Supervised by the coach personally if school staff are unavailable'],c:2},
{q:'Outdoor session contingency planning is required when thunderstorms are forecast within:',o:['2 hours','3 hours','4 hours','6 hours'],c:2},
{q:'After a child is struck on the head by a club, the coach must:',o:['Monitor the child for 5 minutes — if no symptoms, they may return to activity','Stop activity for the affected child — zero-tolerance concussion protocol. Notify nurse, contact parent same day, require medical clearance before return','Allow the child to continue if they report feeling fine','Ask the parent (if present) to make the decision about returning to play'],c:1},
{q:'Which teaching approach is PROHIBITED in EduGolfKids?',o:['Using a gate drill to teach face awareness','Running a 4 x 4-minute constraint skill block','Delivering 20 minutes of consecutive identical repetitions from the same spot','Using a distance ladder to develop putting consistency'],c:2},
{q:'A coach notices that a parent on the sideline is visibly upset. According to the parent communication protocol, what should the coach do?',o:['Immediately approach and address the concern to avoid escalation','Complete the session, then step aside privately with the parent — listen first, acknowledge, clarify with developmental reasoning, then escalate if needed','Ask the school coordinator to speak with the parent','Ignore the situation — parent emotions during sessions are not the coach\'s responsibility'],c:1},
{q:'What is the purpose of the Wrap-Up segment?',o:['Provide free play time before dismissal','Consolidate learning, build emotional closure through reflection and effort-based praise, and ensure safe equipment reset','Conduct the Skills Passport assessment for that session','Give coaches time to complete administrative tasks'],c:1},
{q:'A coach wants to ensure children retain the skill they practiced in the Skill Block. Where in the session structure does this retention PRIMARILY occur?',o:['During the Warm-Up Game','During the Skill Block itself','During the Game Reinforcement segment — where skill is transferred to contextual play','During the Wrap-Up reflection'],c:2},
{q:'The 30/30 Lightning Rule second "30" refers to:',o:['The maximum time a session can run after weather concerns appear','Wait 30 minutes after the last lightning flash or thunder before resuming outdoor activity','The distance in metres at which lightning becomes a safety concern','The number of seconds between whistle blast and full shelter during evacuation'],c:1},
],
L2:[
{q:'Why does EduGolfKids teach putting before chipping?',o:['Golf rules specify this as the correct teaching order','Putting is developmentally optimal — minimal injury risk, immediate binary feedback, pendulum rhythm transfers to all other skills','Putting equipment is simpler to manage with young children','School gym spaces are better suited to putting than chipping'],c:1},
{q:'A 5-year-old consistently pushes putts right of target. The constraints-led correction is:',o:['Tell the child their putter face is open and demonstrate the correct face angle','Set up a gate drill: two tees 6 inches apart — the gate provides face-angle feedback without verbal correction','Reduce the putting distance to 1 foot until accuracy improves','Ask the child to watch a peer who is putting accurately'],c:1},
{q:'What is the PRIMARY reason EduGolfKids connects chipping to putting rather than teaching it as a separate skill?',o:['It reduces the number of grip adjustments children need to make','Motor learning research shows skill transfer is maximized when new movements anchor to existing neural patterns — children learn chipping 40% faster','It allows children to use the same club for both skills','It is consistent with LTAD stage requirements that new skills build on previous ones'],c:1},
{q:'A 7-year-old consistently tops the ball (ball rolls along ground). The constraints-led response is:',o:['Instruct the child to keep their head down and watch the ball throughout the swing','Lower the tee height so the ball sits closer to the ground — forces more precise contact naturally','Use a different club — a shorter iron will reduce the error','Have the child practice the chip motion without a ball first'],c:1},
{q:'Pitching is introduced only when:',o:['A child reaches age 7 regardless of skill level','A child demonstrates consistent chipping competency','A child requests to try pitching','A child has completed the full Skills Passport Level 1 criteria'],c:1},
{q:'A 9-year-old over-swings and loses balance on the finish. The constraints-led response is:',o:['Instruct the child to hold their finish position for 3 seconds after every shot','Use the feet-together drill — forces balanced rotation naturally without verbal instruction about balance','Widen the child\'s stance to create a more stable base','Reduce swing speed and build up gradually'],c:1},
{q:'Skills Passport completion at end of term must be:',o:['Completed for children who attended at least 3 sessions','100% — every enrolled child receives a Passport entry at the end of every term','Completed only for children who met the assessment criteria','Completed at the coach\'s discretion based on available assessment time'],c:1},
{q:'Video analysis via CoachNow is appropriate for:',o:['Ages 4–6, from the first session as a motivational tool','Ages 6–9 only, after consistent contact and basic skill pattern are established, for self-discovery questions','All ages as a primary teaching tool throughout the program','Any child whose parent requests video feedback'],c:1},
{q:'An 8-year-old asks why they cannot pick up their ball and place it closer to the hole. The MOST appropriate rules introduction is:',o:['Explain the full rules of golf including stroke play and penalties','Address it in the moment: "In golf, we play the ball from where it stops — that\'s what makes it a great challenge." One rule, in context','Tell the child that EduGolfKids sessions don\'t follow golf rules','Redirect the child without explanation'],c:1},
{q:'What does the air gate constraint teach in chipping and pitching sessions?',o:['Correct putter face alignment','Trajectory awareness — the ball must get airborne to score, which the child\'s nervous system solves naturally without verbal instruction about loft','Correct ball position at address','The difference between chip and pitch club selection'],c:1},
{q:'A coach is running a full swing session in a gym with a 9-foot ceiling. What is the correct approach?',o:['Continue but ask children to reduce their swing size','Assess the ceiling as unsafe for full chipping — transition to putting or modify to chip-length motion only','Move children to the half of the gym where the ceiling appears higher','Inform parents about the ceiling issue and seek permission to continue'],c:1},
{q:'A chipping session has a child who consistently scoops the ball (flips wrists at impact). The constraints-led correction is:',o:['Instruct the child: "Don\'t scoop. Shaft lean. Hands forward."','Raise the landing target (shelf, box) — upward target naturally discourages the scooping instinct','Switch the child to a shorter club which is easier to control','Have the child watch other children who are chipping correctly'],c:1},
{q:'When is club selection discovery introduced for chipping?',o:['Ages 4–6 from Stage 1 — club selection is fundamental to chipping','Ages 6–9 only — Stage 2, after precision landing and air gate challenges are established. Give both clubs, no instruction: "Try both and tell me what you notice."','All ages, from the very first chipping session','Only when a child has reached Skills Passport Level 2'],c:1},
{q:'What is the minimum lateral spacing for full swing sessions?',o:['6 feet (same as putting)','8 feet','10 feet (more than the 6-foot putting standard due to greater swing arc and force)','12 feet'],c:2},
{q:'A coach is assessing putting for the Skills Passport. A child is close to but does not quite meet the criteria. The correct assessment is:',o:['Partially met — record as in-progress','Not yet met — criteria are specific and observable. A child either meets the standard or has not yet met it. No half-marks.','Met — the child was close enough and showed clear effort','Defer assessment for 2 more sessions to give the child a better opportunity'],c:1},
],
L3:[
{q:'Which school type should EduGolfKids licensees approach FIRST when building their territory?',o:['Public elementary schools — largest enrollment and biggest market opportunity','Private and independent schools — faster decision-making, parents seek enrichment, parents have disposable income for the program','Charter schools — more autonomy and faster decisions than public schools','After-school operators — fastest to start programs'],c:1},
{q:'The EduGolfKids base price per child per lesson is:',o:['$15','$18','$20','$25'],c:2},
{q:'Maximum class size per coach in EduGolfKids is:',o:['5','6','7','8'],c:2},
{q:'A school charges a 10% revenue share. The correct adjusted price per child per lesson is:',o:['$20 — absorb the fee into your margin','$22 — add the 10% on top of the $20 base price','$20.50 — split the cost equally','$21 — a conservative adjustment to maintain competitiveness'],c:1},
{q:'The fill-first growth model states that a school is "fully occupied" when:',o:['Every class has at least 5 enrolled children','All 5 conditions are met: every class at 7 children, 4 sessions/month, strong school relationship, stable certified coach, parent retention above 70%','The school has been running for 2 consecutive terms','The school revenue covers all coach costs for that location'],c:1},
{q:'What is the healthy net profit margin target for an EduGolfKids licensee operation?',o:['25–35%','35–45%','45–55%','55–65%'],c:2},
{q:'The EduGolfKids marketing hierarchy places which activity at Tier 1 (highest conversion)?',o:['Social media marketing','School newsletter advertising','Demo days and parent information sessions','Paid digital advertising (Google/Facebook ads)'],c:2},
{q:'Which of the following is a RED FLAG when interviewing a coaching candidate?',o:['Background in education or childcare','Some golf knowledge or interest','"I prefer to adapt sessions using my experience — I don\'t like strict curricula"','Energy and enthusiasm for working with children'],c:2},
{q:'A licensee\'s coach cannot attend their session with 3 hours notice. What must the licensee do?',o:['Cancel the session and notify parents','Activate the cover coach — always on call for every school. If unavailable, the licensee delivers the session personally','Split the class between remaining coaches regardless of ratio','Contact the school and reschedule the session'],c:1},
{q:'Coach costs as a percentage of gross revenue should not exceed:',o:['20–25%','30–35%','40–45%','50–55%'],c:1},
{q:'A licensee is at Stage 2 with one class half-filled and a new coach still completing certification. A third school wants to start immediately. The correct response is:',o:['Accept the third school — more schools is always better for the business','Decline until Stage 2 success criteria are met: second coach certified AND second school first term complete','Accept but delay the start date by 4 weeks','Accept and deliver the third school\'s sessions personally while the coach certifies'],c:1},
{q:'The Player of the Week program is PRIMARILY valuable as a:',o:['Competitive motivation tool to improve performance','Retention marketing tool — recognition creates loyalty, parents share it, every child wants to earn it','Compliance tracking mechanism for coach accountability','Skills Passport assessment indicator'],c:1},
{q:'Monthly invoicing must be paid by parents:',o:['On the last day of the session month','5 days before the start of the session month','Within 30 days of the invoice date','At the licensee\'s discretion'],c:1},
{q:'The Sexual Abuse and Molestation (SAM) endorsement:',o:['Is included in the standard General Liability insurance policy','Is a separate coverage addition to GL with zero grace period on expiry — an expired SAM means no sessions','Requires annual renewal every 2 years','Is required only for sessions involving children under 6'],c:1},
{q:'What is the correct sequence for a licensee when a serious incident occurs at one of their schools?',o:['Gather all information first, then submit a complete report to HQ within 48 hours','Coach notifies licensee within 1 hour → licensee notifies HQ within 24 hours via official channel → official incident report submitted → follow up with school principal within 24 hours','Wait for the school to submit their own incident report, then align your report with theirs','Submit a preliminary report to HQ within 7 days once the child\'s condition is known'],c:1},
{q:'The 4-Lessons-Per-Month rule means that when a session is cancelled due to weather, the licensee should:',o:['Reduce that month\'s invoice by one session amount per child','Reschedule the session within the same billing month — rain is not a cancellation reason, "We moved inside and had a great session" is the standard','Cancel the session and compensate parents with a discount on next term','Log the cancellation and continue with 3 sessions that month'],c:1},
{q:'Gross monthly revenue for a 3-coach, 3-class school at full capacity with $20/lesson pricing is:',o:['$840 per month','$1,260 per month','$1,680 per month','$2,100 per month'],c:2},
{q:'A licensee wants to create marketing flyers with a slightly modified EduGolfKids logo. The correct approach is:',o:['Proceed — minor modifications are acceptable','Request the design change through HQ — all marketing materials must use approved templates and any logo modifications require HQ approval','Use the modified logo for local social media only, official logo elsewhere','Have materials reviewed by another licensee before use'],c:1},
{q:'A new coach has been hired and background-checked. When may they begin leading sessions independently?',o:['Immediately — background clearance is sufficient','After completing Level 1 certification within 4 weeks, following the shadowing and co-delivery sequence first','After their first supervised session is approved by the licensee','After 3 months of co-delivery with an experienced coach'],c:1},
{q:'Revenue at 10 fully occupied schools (3 classes each, $20/lesson, 7 children per class, 4 sessions/month) gross monthly is:',o:['$8,400','$12,600','$16,800','$21,000'],c:2},
],
REFRESH:[
{q:'How often must EduGolfKids coaches complete the annual refresher?',o:['Every 6 months','Once per year','Every 2 years','Only when Level changes'],c:1},
{q:'The LTAD stage for children aged 4–6 is:',o:['FUNdamentals','Active Start','Learning to Train','Training to Train'],c:1},
{q:'Which LTAD stage applies to children aged 6–9?',o:['Active Start','FUNdamentals','Learning to Train','Training to Train'],c:1},
{q:'Maximum class size per coach in EduGolfKids:',o:['5','6','7','8'],c:2},
{q:'According to EduGolfKids coaching language code, praise should focus on:',o:['Natural talent','Effort and process','Results and scores','Comparison with peers'],c:1},
{q:'A coach who suspects child abuse must:',o:['Speak to the child\'s parent immediately','Ignore it unless certain','Report to the designated school authority, follow state reporting law, and notify the EduGolfKids Compliance Officer','Discuss it with other coaches first'],c:2},
{q:'The 60-minute session structure ends with:',o:['Free play time','A wrap-up: reflection question, effort-based praise, and equipment reset','Skills badge assessment','Parent debrief'],c:1},
{q:'Photo and media consent for students must be:',o:['Assumed from enrollment','Obtained in writing from parents before any filming or photography','Obtained verbally before each session','Not required for group photos'],c:1},
{q:'The 30/30 Lightning Rule requires coaches to:',o:['Wait 30 seconds between drills and evacuate after 30 minutes of rain','Evacuate when lightning-to-thunder gap is 30 seconds or less; resume only 30 minutes after the last flash or thunder','Call HQ when a storm is 30 miles away; resume after 30 minutes inside','Blow 3 whistle blasts within 30 seconds of seeing lightning and wait 30 minutes before resuming'],c:1},
{q:'Minimum lateral spacing between children during a hitting session is:',o:['3 feet','4 feet','5 feet','6 feet'],c:3},
{q:'When a child has any blow to the head during a session, the coach must:',o:['Monitor the child for 5 minutes — if no symptoms, they may return','Apply the zero-tolerance concussion protocol: child does NOT return that day, notify nurse, contact parent, require medical clearance before return','Ask the child if they want to continue','Contact the parent and leave the decision to them'],c:1},
{q:'Children may only retrieve balls when:',o:['They have finished their 5 attempts','The coach gives the RETRIEVE or RESET command','The warm-up game has ended','The Game Reinforcement segment begins'],c:1},
],
};

// ══════════════════════════════════════════
//  EDUCATION HUB RENDERING
// ══════════════════════════════════════════

function getModulesForRole() {
  const role = state.role;
  const levels = role === 'licensee' ? ['M0','L1','L2','L3'] : ['M0','L1','L2'];
  return levels;
}

function renderCertPage() {
  if (state.role === 'tdp') { renderTDPCertPage(); return; }
  loadCertData().then(() => renderEducationHub());
}

function renderEducationHub() {
  const page = document.getElementById('page-coach-education');
  if (!page) return;

  const role = state.role;
  const levels = getModulesForRole();

  // Build progress overview
  let overallModules = 0, overallDone = 0;
  levels.forEach(lvl => {
    const mods = EDU_MODULES[lvl] || [];
    mods.forEach(m => {
      overallModules++;
      if (certState.records[`read_${m.id}`]) overallDone++;
    });
  });
  const pct = overallModules ? Math.round((overallDone/overallModules)*100) : 0;

  const levelCards = levels.map(lvl => {
    const def = CERT_LEVELS[lvl];
    const passed = hasPassed(lvl);
    const expired = isExpired(lvl);
    const prereqMet = !def.prereq || hasPassed(def.prereq);
    const mods = EDU_MODULES[lvl] || [];
    const modsRead = mods.filter(m => certState.records[`read_${m.id}`]).length;
    const modPct = mods.length ? Math.round((modsRead/mods.length)*100) : 0;

    let statusBadge;
    if (passed && !expired)  statusBadge = `<span class="badge badge-green">🏆 Certified</span>`;
    else if (expired)         statusBadge = `<span class="badge badge-red">⚠️ Expired</span>`;
    else if (!prereqMet)      statusBadge = `<span style="font-size:12px;color:var(--gray-400);">🔒 Locked</span>`;
    else                      statusBadge = `<span style="font-size:12px;color:var(--gold-dark);font-weight:600;">In Progress</span>`;

    return `<div class="edu-level-card${prereqMet?'':' locked'}"
      style="border-left:4px solid ${def.color};"
      onclick="${prereqMet?`openEduLevel('${lvl}')`:''}" >
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:48px;height:48px;background:${def.color}18;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">${passed&&!expired?'🏆':'📚'}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:15px;color:var(--green-dark);">${def.fullLabel}</div>
          <div style="font-size:12px;color:var(--gray-400);margin-top:2px;">${mods.length} modules · ${modsRead}/${mods.length} read</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
          ${statusBadge}
          ${prereqMet&&!passed?`<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();openEduLevel('${lvl}')">Continue →</button>`:''}
          ${passed&&!expired?`<button class="btn btn-sm btn-outline" onclick="event.stopPropagation();viewCertificate('${lvl}')">View Cert</button>`:''}
        </div>
      </div>
      ${prereqMet && !passed && mods.length ? `
      <div class="edu-level-progress-bar">
        <div class="edu-level-progress-fill" style="width:${modPct}%;"></div>
      </div>` : ''}
    </div>`;
  }).join('');

  page.innerHTML = `
    <div class="page-header"><h1>Education Hub</h1><p>Your professional certification pathway</p></div>
    <div class="tabs">
      <div class="tab active" onclick="switchTab(this,'edu-tab-progress')">My Progress</div>
      <div class="tab" id="edu-tab-module-btn" onclick="switchTab(this,'edu-tab-module')" style="display:none;">Current Module</div>
      <div class="tab" onclick="switchTab(this,'edu-tab-certs')">My Certificates</div>
      <div class="tab" onclick="switchTab(this,'edu-tab-lessons')">Lesson Plans</div>
    </div>

    <div id="edu-tab-progress">
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <div style="font-size:13px;color:var(--gray-400);margin-bottom:4px;">Overall Progress</div>
            <div style="height:10px;background:var(--gray-200);border-radius:5px;"><div style="height:100%;width:${pct}%;background:var(--green);border-radius:5px;transition:width 0.5s;"></div></div>
            <div style="font-size:13px;margin-top:4px;">${overallDone} of ${overallModules} modules read</div>
          </div>
          <div style="text-align:center;padding:12px 24px;background:var(--gray-100);border-radius:8px;">
            <div style="font-size:32px;font-weight:700;color:var(--green-dark);">${pct}%</div>
            <div style="font-size:12px;color:var(--gray-400);">Complete</div>
          </div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">${levelCards}</div>
    </div>

    <div id="edu-tab-module" style="display:none;">
      <div id="edu-module-reader"></div>
    </div>

    <div id="edu-tab-certs" style="display:none;">
      ${renderCertHistory()}
    </div>

    <div id="edu-tab-lessons" style="display:none;">
      ${renderLessonPlansTab()}
    </div>`;
}

function renderCertHistory() {
  const passed = Object.entries(certState.records).filter(([k,r])=>r.passed && CERT_LEVELS[k]);
  if (!passed.length) return `<div class="alert alert-blue">🎓 Complete your first certification to see your certificates here.</div>`;
  return `<table class="data-table"><thead><tr><th>Certification</th><th>Score</th><th>Date Earned</th><th>Expiry</th><th></th></tr></thead><tbody>
    ${passed.map(([lvl,rec])=>`<tr>
      <td><strong>${CERT_LEVELS[lvl]?.fullLabel||lvl}</strong></td>
      <td>${rec.score}%</td><td>${rec.date}</td>
      <td>${isExpired(lvl)?'<span class="badge badge-red">Expired</span>':rec.expiry}</td>
      <td><button class="btn btn-sm btn-outline" onclick="viewCertificate('${lvl}')">View</button></td>
    </tr>`).join('')}
  </tbody></table>`;
}

function renderLessonPlansTab() {
  const ages = [4,5,6,7,8,9,10];
  const locked = !hasPassed('L1');
  if (locked) return `<div class="alert alert-blue">🔒 Complete Level 1 certification to access Lesson Plans.</div>`;
  return `<div class="card"><div class="card-header"><h3>Lesson Plans Library</h3><p style="color:var(--gray-400);font-size:13px;margin-top:4px;">10 lessons per age group per quarter — content coming soon</p></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:8px;">
      ${ages.map(a=>`<button class="btn btn-outline" onclick="openLessonPlanModal(${a})">Age ${a}<br><small style="color:var(--gray-400);">Lessons coming soon</small></button>`).join('')}
      <button class="btn btn-gold" onclick="openLessonPlanModal('games')">🎮 Fun Games Library<br><small>Coming soon</small></button>
    </div></div>`;
}

function openLessonPlanModal(age) {
  const title = age==='games' ? 'Fun Games Library' : `Age ${age} Lesson Plans`;
  showInfoModal(title, `<div style="text-align:center;padding:24px 0;"><div style="font-size:48px;margin-bottom:16px;">📚</div><h3>Coming Soon</h3><p style="color:var(--gray-400);margin-top:8px;">10 lessons per age group per quarter will be added here by EduGolfKids HQ. Check back for updates.</p></div>`);
}

function openLessonPlans(age) { openLessonPlanModal(age); }

// ── Level browser ───────────────────────────────────────────────────────────
function openEduLevel(lvl) {
  eduState.level = lvl;
  const mods = EDU_MODULES[lvl] || [];
  const nextUnread = mods.find(m => !certState.records[`read_${m.id}`]);
  eduState.moduleId = (nextUnread || mods[0])?.id || null;
  eduState.sectionIdx = 0;

  const btn = document.getElementById('edu-tab-module-btn');
  if (btn) btn.style.display = '';

  // Switch to module tab and render
  const tabs = document.querySelectorAll('#page-coach-education .tab');
  const contents = ['edu-tab-progress','edu-tab-module','edu-tab-certs','edu-tab-lessons'];
  tabs.forEach((t,i)=>{ t.classList.toggle('active', i===1); });
  contents.forEach((id,i)=>{ const el=document.getElementById(id); if(el) el.style.display = i===1?'':'none'; });

  renderModuleList(lvl);
}

function renderModuleList(lvl) {
  const def      = CERT_LEVELS[lvl];
  const mods     = EDU_MODULES[lvl] || [];
  const prereqMet = !def.prereq || hasPassed(def.prereq);
  const allRead  = mods.every(m => certState.records[`read_${m.id}`]);
  const kcDone   = mods.every(m => certState.records[`kc_${m.id}`]);
  const passed   = hasPassed(lvl);
  const modsRead = mods.filter(m => certState.records[`read_${m.id}`]).length;
  const pct      = mods.length ? Math.round((modsRead/mods.length)*100) : 0;

  const reader = document.getElementById('edu-module-reader');
  if (!reader) return;

  const moduleCards = mods.map((m) => {
    const read       = !!certState.records[`read_${m.id}`];
    const kcComplete = !!certState.records[`kc_${m.id}`];
    const clickable  = prereqMet;
    const badges = read
      ? `<span class="edu-badge-read">Read ✓</span>${kcComplete ? '<span class="edu-badge-read" style="margin-left:4px;">Practice ✓</span>' : '<span class="edu-badge-practice" style="margin-left:4px;">Practice →</span>'}`
      : `<span class="edu-badge-pending">Not started</span>`;
    return `<div class="edu-module-card${clickable?'':' locked'}"
      onclick="${clickable ? `openModuleReader('${lvl}','${m.id}')` : ''}">
      <div class="edu-module-icon">${m.icon}</div>
      <div class="edu-module-info">
        <div class="edu-module-title">${m.title}</div>
        <div class="edu-module-meta">${m.sections.length} sections</div>
      </div>
      <div class="edu-status-badges">${badges}</div>
    </div>`;
  }).join('');

  reader.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
      <button class="btn btn-outline btn-sm" onclick="renderEducationHub();switchTab(document.querySelector('#page-coach-education .tab'),'edu-tab-progress')">← All Levels</button>
      <div style="flex:1;">
        <h2 style="margin:0;font-family:var(--font-display);color:var(--green-dark);">${def.fullLabel}</h2>
        <div style="font-size:13px;color:var(--gray-400);margin-top:2px;">${modsRead} of ${mods.length} modules read</div>
      </div>
      ${passed ? `<span class="badge badge-green" style="font-size:13px;padding:6px 14px;">🏆 Certified</span>` : ''}
      ${allRead&&kcDone&&!passed ? `<button class="btn btn-primary" onclick="startLevelAssessment('${lvl}')">🎓 Take Assessment</button>` : ''}
    </div>
    <div style="margin-bottom:24px;">
      <div style="height:8px;background:var(--gray-200);border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--green) 0%,var(--green-light) 100%);border-radius:4px;transition:width 0.5s;"></div>
      </div>
      <div style="font-size:12px;color:var(--gray-400);margin-top:4px;">${pct}% complete</div>
    </div>
    ${!prereqMet ? `<div class="alert alert-amber" style="margin-bottom:16px;">🔒 Complete <strong>${CERT_LEVELS[def.prereq]?.label}</strong> first to unlock this level.</div>` : ''}
    <div>${moduleCards}</div>
    ${allRead && !kcDone ? `<div class="alert alert-blue" style="margin-top:16px;">💡 Complete the <strong>Knowledge Check</strong> for each module to unlock the Level Assessment.</div>` : ''}
    ${allRead && kcDone && !passed ? `
    <div style="text-align:center;margin-top:24px;padding:24px;background:linear-gradient(135deg,#f0f7f2 0%,#e8f5ec 100%);border-radius:12px;border:2px solid var(--green);">
      <div style="font-size:32px;margin-bottom:8px;">🎓</div>
      <h3 style="font-family:var(--font-display);color:var(--green-dark);margin:0 0 8px;">Ready for Assessment</h3>
      <p style="color:var(--gray-400);font-size:13px;margin-bottom:16px;">All modules read and practice complete · 85% to pass · Certificate generated on pass</p>
      <button class="btn btn-primary btn-lg" onclick="startLevelAssessment('${lvl}')">Start Level Assessment →</button>
    </div>` : ''}`;
}

// ── Module reader ────────────────────────────────────────────────────────────
function openModuleReader(lvl, moduleId) {
  eduState.level = lvl;
  eduState.moduleId = moduleId;
  eduState.sectionIdx = 0;
  renderModuleReader();
}

function renderModuleReader() {
  const { level, moduleId, sectionIdx } = eduState;
  const mods = EDU_MODULES[level] || [];
  const mod  = mods.find(m=>m.id===moduleId);
  if (!mod) return;

  const sections    = mod.sections;
  const total       = sections.length;
  const sec         = sections[sectionIdx];
  const isLast      = sectionIdx === total - 1;
  const alreadyRead = !!certState.records[`read_${moduleId}`];
  const kcDone      = !!certState.records[`kc_${moduleId}`];
  const hasKC       = !!(KNOWLEDGE_CHECKS[moduleId]?.length);
  const pct         = Math.round(((sectionIdx + 1) / total) * 100);

  const reader = document.getElementById('edu-module-reader');
  if (!reader) return;

  // Build progress dots
  const dots = sections.map((_,i) => {
    const cls = i < sectionIdx ? 'edu-dot done' : i === sectionIdx ? 'edu-dot active' : 'edu-dot';
    return `<div class="${cls}" onclick="jumpModuleSection(${i})" title="Section ${i+1}: ${sections[i].h}"></div>`;
  }).join('');

  reader.innerHTML = `
    <!-- Top nav bar -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
      <button class="btn btn-outline btn-sm" onclick="renderModuleList('${level}')">← All Modules</button>
      <div style="flex:1;">
        <div style="font-size:12px;color:var(--gray-400);margin-bottom:2px;">${mod.icon} ${mod.title}</div>
        <div style="font-weight:700;font-size:16px;color:var(--green-dark);">${sec.h}</div>
      </div>
      <div style="font-size:12px;color:var(--gray-400);font-weight:600;">
        ${sectionIdx+1} / ${total}
      </div>
    </div>

    <!-- Progress bar -->
    <div style="height:5px;background:var(--gray-200);border-radius:3px;margin-bottom:6px;overflow:hidden;">
      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--green) 0%,var(--green-light) 100%);border-radius:3px;transition:width 0.4s ease;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div class="edu-progress-dots">${dots}</div>
      <div style="font-size:12px;color:var(--gray-400);">${pct}% of module</div>
    </div>

    <!-- Content card -->
    <div class="edu-reader-card">
      <div class="edu-reader-section-header">
        <div style="width:36px;height:36px;background:var(--green);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;flex-shrink:0;">${sectionIdx+1}</div>
        <h3>${sec.h}</h3>
      </div>
      <div class="doc-content">${sec.b}</div>
    </div>

    <!-- Navigation -->
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:8px;">
      <button class="btn btn-outline" onclick="navModuleSection(-1)" ${sectionIdx===0?'disabled':''} style="min-width:120px;">
        ← Previous
      </button>
      ${isLast ? `
        <button class="btn btn-primary" id="mark-read-btn"
          onclick="markModuleRead('${moduleId}')"
          ${alreadyRead?'style="background:var(--green-dark);"':''}
          style="min-width:220px;">
          ${alreadyRead?'✅ Read — Practice Again':'✅ Mark as Read & Start Practice'}
        </button>` : `
        <button class="btn btn-primary" onclick="navModuleSection(1)" style="min-width:160px;">
          Next Section →
        </button>`}
    </div>

    <!-- Knowledge check (unlocks after read) -->
    ${alreadyRead && hasKC ? `
    <div style="margin-top:28px;padding:24px;background:linear-gradient(135deg,#f8fdf9 0%,#f0f7f2 100%);border-radius:12px;border:1px solid var(--gray-200);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="font-size:24px;">✏️</div>
        <div>
          <div style="font-weight:700;font-size:15px;color:var(--green-dark);">Knowledge Check</div>
          <div style="font-size:13px;color:var(--gray-400);">Ungraded practice · Questions &amp; answers shuffle every attempt</div>
        </div>
      </div>
      ${kcDone
        ? `<div class="alert alert-green" style="margin-top:12px;">✅ Knowledge Check complete for this module!</div>
           <button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="startKnowledgeCheck('${moduleId}')">Retry (reshuffled)</button>`
        : `<button class="btn btn-primary" style="margin-top:12px;width:100%;" onclick="startKnowledgeCheck('${moduleId}')">Start Knowledge Check →</button>`
      }
    </div>` : ''}`;

  // M0 acknowledgment checkbox state
  if (moduleId === 'M0' && isLast) {
    const ackBox = document.getElementById('m0-acknowledge');
    if (ackBox) ackBox.checked = !!certState.records['M0_ACK'];
    checkM0Ack();
  }
}

function navModuleSection(dir) {
  const { level, moduleId } = eduState;
  const mod = (EDU_MODULES[level]||[]).find(m=>m.id===moduleId);
  if (!mod) return;
  const next = eduState.sectionIdx + dir;
  if (next >= 0 && next < mod.sections.length) {
    eduState.sectionIdx = next;
    renderModuleReader();
  }
}

function jumpModuleSection(idx) {
  eduState.sectionIdx = idx;
  renderModuleReader();
}

function checkM0Ack() {
  const ackBox  = document.getElementById('m0-acknowledge');
  const status  = document.getElementById('m0-ack-status');
  const markBtn = document.getElementById('mark-read-btn');
  if (!ackBox) return;
  if (ackBox.checked) {
    if (status) status.innerHTML = '<span style="color:var(--green);">✅ Acknowledged — you may now mark this module as read.</span>';
    if (markBtn) markBtn.disabled = false;
  } else {
    if (status) status.innerHTML = '<span style="color:var(--gray-400);">Please tick the acknowledgment box above to proceed.</span>';
    if (markBtn) markBtn.disabled = true;
  }
}

async function markModuleRead(moduleId) {
  // M0 requires ack
  if (moduleId === 'M0') {
    const ackBox = document.getElementById('m0-acknowledge');
    if (!ackBox?.checked) { alert('Please tick the acknowledgment checkbox first.'); return; }
    await saveM0Ack();
  }
  certState.records[`read_${moduleId}`] = { date: new Date().toISOString().split('T')[0] };
  await saveCertStateRecords();
  renderModuleReader();
}

async function saveCertStateRecords() {
  let usersData = certState.usersData || { users:[] };
  let users = usersData.users || [];
  let idx = users.findIndex(u=>u.id===state.user?.id);
  if (idx===-1) { users.push({ id:state.user?.id, name:state.user?.name, certifications:{} }); idx=users.length-1; }
  users[idx].certifications = certState.records;
  usersData.users = users;
  try { await githubPut('data/users/users.json', usersData, certState.sha, `Progress update — ${state.user?.name}`); } catch(e) { console.warn('save failed',e); }
}

// ── Knowledge Check engine ───────────────────────────────────────────────────
let kcState = { moduleId:null, questions:[], currentQ:0, answers:[], answered:false };

function startKnowledgeCheck(moduleId) {
  const raw = KNOWLEDGE_CHECKS[moduleId];
  if (!raw?.length) { alert('No practice questions available for this module yet.'); return; }
  // Shuffle questions AND shuffle each question's options
  const shuffled = shuffleArray([...raw]).map(q => {
    const combined = q.o.map((opt,i)=>({ opt, correct: i===q.c }));
    const shuffledOpts = shuffleArray(combined);
    return { q:q.q, options:shuffledOpts.map(x=>x.opt), correct:shuffledOpts.findIndex(x=>x.correct), explain:q.e };
  });
  kcState = { moduleId, questions:shuffled, currentQ:0, answers:[], answered:false };
  renderKCQuestion();
}

function renderKCQuestion() {
  const { questions, currentQ } = kcState;
  const q = questions[currentQ];
  const total = questions.length;
  const pct = Math.round(((currentQ + 1) / total) * 100);
  const reader = document.getElementById('edu-module-reader');
  if (!reader) return;

  const letters = ['A','B','C','D'];

  reader.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
      <button class="btn btn-outline btn-sm" onclick="renderModuleReader()">← Back to Module</button>
      <div style="flex:1;">
        <div style="font-weight:700;font-size:15px;color:var(--green-dark);">✏️ Knowledge Check</div>
        <div style="font-size:12px;color:var(--gray-400);">Question ${currentQ+1} of ${total} · Ungraded practice</div>
      </div>
    </div>

    <!-- Progress -->
    <div style="height:6px;background:var(--gray-200);border-radius:3px;margin-bottom:6px;overflow:hidden;">
      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--gold) 0%,var(--gold-light) 100%);border-radius:3px;transition:width 0.3s;"></div>
    </div>
    <div style="font-size:12px;color:var(--gray-400);margin-bottom:20px;text-align:right;">${pct}% through</div>

    <!-- Question card -->
    <div class="edu-reader-card">
      <div style="font-size:16px;font-weight:600;line-height:1.6;margin-bottom:24px;color:var(--green-dark);">${q.q}</div>
      <div id="kc-options">
        ${q.options.map((opt,i) => `
          <button class="kc-option-btn" id="kc-opt-${i}" onclick="kcAnswer(${i})">
            <span class="kc-option-letter">${letters[i]}</span>
            <span>${opt}</span>
          </button>`).join('')}
      </div>
      <div id="kc-feedback" style="display:none;margin-top:16px;"></div>
    </div>

    <div style="display:flex;justify-content:flex-end;margin-top:12px;">
      <button class="btn btn-primary" id="kc-next-btn" onclick="kcNext()" style="display:none;min-width:140px;">Next →</button>
    </div>`;
}

function kcAnswer(optionIndex) {
  if (kcState.answered) return;
  kcState.answered = true;
  const q = kcState.questions[kcState.currentQ];
  const correct = optionIndex === q.correct;
  kcState.answers.push({ selected:optionIndex, correct });

  for (let i=0; i<q.options.length; i++) {
    const btn = document.getElementById(`kc-opt-${i}`);
    if (!btn) continue;
    btn.disabled = true;
    btn.classList.remove('kc-option-btn');
    if (i===q.correct) btn.className = 'kc-option-btn correct';
    else if (i===optionIndex && !correct) btn.className = 'kc-option-btn incorrect';
  }

  const fb = document.getElementById('kc-feedback');
  if (fb) {
    fb.style.display = 'block';
    if (correct) {
      fb.className = 'alert alert-green';
      fb.innerHTML = `<strong>✅ Correct!</strong>${q.explain ? ' ' + q.explain : ''}`;
    } else {
      fb.className = 'alert alert-red';
      fb.innerHTML = `<strong>❌ Not quite.</strong> The correct answer is: <strong>${q.options[q.correct]}</strong>${q.explain ? '<br><span style="font-size:13px;opacity:0.85;">' + q.explain + '</span>' : ''}`;
    }
  }

  const nxt = document.getElementById('kc-next-btn');
  if (nxt) {
    nxt.style.display = 'inline-flex';
    nxt.textContent = kcState.currentQ >= kcState.questions.length - 1 ? 'Finish ✓' : 'Next →';
  }
}

async function kcNext() {
  if (kcState.currentQ >= kcState.questions.length - 1) {
    // KC complete
    certState.records[`kc_${kcState.moduleId}`] = { done:true, date:new Date().toISOString().split('T')[0] };
    await saveCertStateRecords();
    // Show completion screen
    const correctCount = kcState.answers.filter(a=>a.correct).length;
    const reader = document.getElementById('edu-module-reader');
    if (reader) reader.innerHTML = `
      <div style="text-align:center;padding:40px 0;">
        <div style="font-size:48px;margin-bottom:12px;">🎉</div>
        <h2 style="color:var(--green-dark);">Knowledge Check Complete!</h2>
        <div style="font-size:32px;font-weight:700;color:var(--green);margin:12px 0;">${correctCount}/${kcState.questions.length}</div>
        <p style="color:var(--gray-400);">This is practice — any score is fine. The important thing is you reviewed the material.</p>
        <div style="display:flex;gap:12px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="renderModuleList('${eduState.level}')">← Back to Modules</button>
          <button class="btn btn-outline" onclick="startKnowledgeCheck('${kcState.moduleId}')">Retry (Shuffled)</button>
        </div>
      </div>`;
  } else {
    kcState.currentQ++;
    kcState.answered = false;
    renderKCQuestion();
  }
}

// ── Level Assessment (formal quiz) ───────────────────────────────────────────
function startLevelAssessment(level) {
  const qs = QUIZ_QUESTIONS[level];
  if (!qs) return;
  const count = Math.min(20, qs.length);
  const shuffled = shuffleArray([...qs]).slice(0, count).map(q => {
    const combined = q.o.map((opt,i)=>({ opt, correct: i===q.c }));
    const shuffledOpts = shuffleArray(combined);
    return { q:q.q, options:shuffledOpts.map(x=>x.opt), correct:shuffledOpts.findIndex(x=>x.correct) };
  });
  quizState = { level, questions:shuffled, currentQ:0, answers:[], answered:false };
  safeSet('quiz-title', CERT_LEVELS[level]?.fullLabel || 'Assessment');
  safeSet('quiz-subtitle', `${shuffled.length} questions · 85% required to pass · Questions 0026 answers randomized on every attempt`);
  document.getElementById('quiz-container').style.display = 'block';
  document.getElementById('quiz-results').style.display = 'none';
  renderQuizQuestion();
  showPage('page-quiz');
}

function startQuiz(level) { startLevelAssessment(level); }

function renderQuizQuestion() {
  const { questions, currentQ } = quizState;
  const q = questions[currentQ];
  const total = questions.length;
  document.getElementById('quiz-progress-bar').style.width = Math.round((currentQ/total)*100)+'%';
  safeSet('quiz-question-counter', `Question ${currentQ+1} of ${total}`);
  safeSet('quiz-question-text', q.q);
  document.getElementById('quiz-options').innerHTML = q.options.map((opt,i)=>`
    <button class="btn btn-outline" id="quiz-opt-${i}" style="text-align:left;padding:14px 18px;font-size:14px;justify-content:flex-start;" onclick="quizAnswer(${i})">${String.fromCharCode(65+i)}. ${opt}</button>`).join('');
  document.getElementById('quiz-feedback').style.display = 'none';
  document.getElementById('quiz-next-btn').style.display = 'none';
  quizState.answered = false;
}

function quizAnswer(optionIndex) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = quizState.questions[quizState.currentQ];
  const correct = optionIndex === q.correct;
  quizState.answers.push({ selected:optionIndex, correct });
  for (let i=0; i<q.options.length; i++) {
    const btn = document.getElementById(`quiz-opt-${i}`);
    if (!btn) continue;
    btn.disabled = true;
    if (i===q.correct) { btn.style.background='var(--green)'; btn.style.color='white'; btn.style.borderColor='var(--green)'; }
    else if (i===optionIndex && !correct) { btn.style.background='var(--red)'; btn.style.color='white'; btn.style.borderColor='var(--red)'; }
  }
  const fb = document.getElementById('quiz-feedback');
  fb.style.display='block';
  fb.className=`alert ${correct?'alert-green':'alert-red'}`;
  fb.innerHTML = correct ? '✅ Correct!' : `❌ Incorrect. The correct answer is: <strong>${q.options[q.correct]}</strong>`;
  const nxt = document.getElementById('quiz-next-btn');
  nxt.style.display='inline-flex';
  nxt.textContent = quizState.currentQ>=quizState.questions.length-1 ? 'See Results →' : 'Next Question →';
}

async function quizNext() {
  if (quizState.currentQ >= quizState.questions.length - 1) {
    await finishQuiz();
  } else {
    quizState.currentQ++;
    renderQuizQuestion();
  }
}

async function finishQuiz() {
  const { level, questions, answers } = quizState;
  const correct = answers.filter(a=>a.correct).length;
  const total = questions.length;
  const pct = Math.round((correct/total)*100);
  const passed = pct >= 85;
  const def = CERT_LEVELS[level];
  document.getElementById('quiz-progress-bar').style.width = '100%';
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'block';
  await saveCertRecord(level, pct, passed);
  const color = passed ? 'var(--green)' : 'var(--red)';
  document.getElementById('quiz-results-content').innerHTML = `
    <div style="font-size:64px;margin-bottom:16px;">${passed?'🎉':'😔'}</div>
    <h2 style="font-family:var(--font-display);font-size:28px;color:${color};margin-bottom:8px;">${passed?'Congratulations! You Passed!':'Not Quite — Try Again'}</h2>
    <div style="font-size:48px;font-weight:700;color:${color};margin:16px 0;">${pct}%</div>
    <div style="color:var(--gray-400);margin-bottom:8px;">${correct} correct out of ${total} questions</div>
    <div style="color:var(--gray-400);margin-bottom:32px;">Pass mark: 85%</div>
    ${passed ? `
      <div style="background:var(--gray-100);border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="font-weight:600;margin-bottom:4px;">✅ ${def.fullLabel}</div>
        <div style="font-size:13px;color:var(--gray-400);">Certificate valid for 12 months</div>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="viewCertificate('${level}')">🏆 View My Certificate</button>
        <button class="btn btn-outline" onclick="showPage('page-coach-education');renderEducationHub()">← Back to Education Hub</button>
      </div>` : `
      <p style="color:var(--gray-400);margin-bottom:20px;">Questions and answers will be reshuffled on your next attempt.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="startLevelAssessment('${level}')">Try Again (Reshuffled)</button>
        <button class="btn btn-outline" onclick="showPage('page-coach-education');renderEducationHub()">← Back</button>
      </div>`}`;
}

function viewCertificate(level) {
  const rec = certState.records[level];
  if (!rec || !rec.passed) { alert('Complete the assessment first.'); return; }
  const def = CERT_LEVELS[level];
  const name = rec.name || state.user?.name || 'Coach';
  const certId = `EGK-${level}-${(rec.date||'').replace(/-/g,'')}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;
  document.getElementById('certificate-display').innerHTML = `
    <div style="border:2px solid var(--gold);border-radius:12px;padding:40px;position:relative;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:48px;margin-bottom:12px;">⛳</div>
        <div style="font-family:var(--font-display);font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;">EduGolfKids</div>
        <div style="font-size:12px;color:var(--gray-400);letter-spacing:0.1em;text-transform:uppercase;">Certificate of Achievement</div>
      </div>
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:14px;color:var(--gray-400);margin-bottom:8px;">This certifies that</div>
        <div style="font-family:var(--font-display);font-size:36px;color:var(--green-dark);margin-bottom:8px;">${name}</div>
        <div style="font-size:14px;color:var(--gray-400);margin-bottom:16px;">has successfully completed</div>
        <div style="font-family:var(--font-display);font-size:22px;color:${def.color};padding:12px 24px;border:2px solid ${def.color};border-radius:8px;display:inline-block;">${def.fullLabel}</div>
      </div>
      <div style="display:flex;justify-content:space-around;margin-bottom:32px;text-align:center;">
        <div><div style="font-size:13px;color:var(--gray-400);">Score</div><div style="font-size:24px;font-weight:700;color:var(--green-dark);">${rec.score}%</div></div>
        <div><div style="font-size:13px;color:var(--gray-400);">Date Issued</div><div style="font-size:18px;font-weight:600;color:var(--green-dark);">${rec.date}</div></div>
        <div><div style="font-size:13px;color:var(--gray-400);">Valid Until</div><div style="font-size:18px;font-weight:600;color:var(--green-dark);">${rec.expiry}</div></div>
      </div>
      <div style="border-top:2px solid var(--gold);padding-top:24px;display:flex;justify-content:space-between;align-items:center;">
        <div><div style="font-family:var(--font-display);font-size:16px;color:var(--green-dark);">EduGolfKids LLC</div><div style="font-size:11px;color:var(--gray-400);letter-spacing:0.05em;">MOORESVILLE, NORTH CAROLINA</div></div>
        <div style="text-align:right;"><div style="font-size:11px;color:var(--gray-400);">Certificate ID</div><div style="font-size:12px;font-family:monospace;color:var(--gray-600);">${certId}</div></div>
      </div>
    </div>`;
  showPage('page-certificate');
}

function printCertificate() {
  const certHtml = document.getElementById('certificate-display').innerHTML;
  const win = window.open('','_blank');
  win.document.write(`<html><head><title>EduGolfKids Certificate</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">
    <style>body{margin:40px;font-family:'DM Sans',sans-serif;}@media print{body{margin:20px;}}</style>
    </head><body>${certHtml}</body></html>`);
  win.document.close();
  setTimeout(()=>win.print(),600);
}

// ── HQ Education Stats ───────────────────────────────────────────────────────
function renderHQEducationStats() {
  const coaches = state.data.coaches || [];
  safeSet('cert-network-count', coaches.length);
}

// ── TDP cert page (unchanged) ────────────────────────────────────────────────
function renderTDPCertPage() {
  const page = document.getElementById('page-coach-education');
  if (!page) return;
  page.innerHTML = `
    <div class="page-header"><h1>My Training</h1><p>Territory Development Partner orientation and resources</p></div>
    <div class="card"><div class="card-header"><h3>TDP Orientation Programme</h3></div>
    <div class="checklist-item missing" style="padding:16px 0;">
      <span class="check-icon">📋</span>
      <div style="flex:1;"><strong>TDP Orientation Guide</strong><br><small style="color:var(--gray-400);">Roles, responsibilities, commission structure, compliance requirements and support systems</small></div>
      <button class="btn btn-sm btn-primary" onclick="alert('TDP Orientation Guide — contact HQ for access.')">View Guide</button>
    </div></div>`;
}

// ── Utility ──────────────────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function showInfoModal(title, body) {
  let m = document.getElementById('modal-info-generic');
  if (!m) {
    m = document.createElement('div');
    m.id = 'modal-info-generic';
    m.className = 'modal-overlay';
    m.innerHTML = `<div class="modal"><button class="modal-close" onclick="document.getElementById('modal-info-generic').style.display='none'">✕</button><h2 id="mig-title"></h2><div id="mig-body"></div></div>`;
    document.body.appendChild(m);
  }
  document.getElementById('mig-title').textContent = title;
  document.getElementById('mig-body').innerHTML = body;
  m.style.display = 'flex';
}

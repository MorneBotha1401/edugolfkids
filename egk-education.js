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
M0:[{  id:"M0",  title:"Compliance &amp; Safeguarding",  icon:"\ud83d\udee1\ufe0f",  sections:[    {h:`Compliance &amp; Safeguarding`,b:`<p style="margin:0 0 10px;line-height:1.85;">MODEL 0<em></em></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Foundational Compliance &amp; Safeguarding Certification</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong><em>(Pre-Course Mandatory Requirement – Revised Operational Version)</strong></em></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>1. Duty of Care Framework</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids operates under an elevated duty-of-care standard within school environments.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>All coaches act:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• In loco parentis during sessions(“In the place of a parent.”)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• As mandatory reporters where required by state law</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• In compliance with district safeguarding policies</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Safety, supervision, and safeguarding take priority over instruction.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>2. Background Screening Requirements</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Prior to school placement, each coach must complete:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• State-level criminal background check</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• National sex offender registry screening</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Additional district-required screenings</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Identity and employment eligibility verification</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Documentation must be available for district review.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>No coach may enter a school environment without clearance.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>3. Mandatory Reporter Compliance</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must complete:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• State-required mandatory reporter training</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Child abuse recognition training</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• District reporting protocol review</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>If there is reasonable suspicion of abuse, coaches must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Ensure child safety</strong></li>
  <li style="margin-bottom:5px;"><strong>Report to designated school authority</strong></li>
  <li style="margin-bottom:5px;"><strong>Follow state reporting law</strong></li>
  <li style="margin-bottom:5px;"><strong>Notify EduGolfKids Compliance Officer</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Failure to report results in removal from certification.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>4. Supervision &amp; Visibility Standards</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids requires visible and accountable instruction environments.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Standard Practice:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Sessions must occur in school-approved spaces</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• School staff must have access to session areas</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Doors must remain unlocked when indoors</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Windows or visibility panels used when available</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>When Direct Line-of-Sight Is Not Possible (e.g., gym partition):</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• School staff must know session location</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Coach must remain in open, common-use area</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• No isolated closed-room instruction permitted</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>One-on-One Lessons Policy</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>One-on-one sessions are permitted when:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Low enrollment results in a single participant</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• A second adult is present in the facility (teacher, staff, or parent)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• The session takes place in an open, observable space</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>One-on-one instruction is prohibited:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Behind closed doors</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• In secluded or non-monitored areas</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Without staff awareness</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This maintains compliance without blocking operational flexibility.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>5. Physical Contact Policy </strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids does NOT enforce a zero-contact rule.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead, we enforce Controlled &amp; Transparent Instructional Contact.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Hands-on positioning is permitted only when:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Instructional necessity exists</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Verbal cueing has been attempted first</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Contact is brief, non-invasive, and instructional</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Coach explains contact before making adjustment</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Example:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“I’m going to gently adjust your shoulders so you can feel the correct position.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Contact must never:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Involve sensitive areas</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Be prolonged</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Occur without explanation</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Occur in isolated settings</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This aligns with SafeSport’s “appropriate instructional contact” guidelines.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>6. Equipment &amp; Hitting Zone Safety Protocol</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Strict Safety Rules:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Children may only hold clubs inside designated hitting zones</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Clubs must remain grounded when not actively hitting</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• No child may walk with a club in hand</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• No club may be carried during water breaks</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• All equipment must be placed on the ground inside hitting zones before movement</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Movement Rules:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Children may not enter another child’s hitting zone</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Ball retrieval only upon coach command (“RESET”)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Running in hitting areas prohibited</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This reduces accidental swing contact risk significantly.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>7. Environmental &amp; Gym-Based Safety Adjustments</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>When operating indoors (gym, multipurpose room):</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Foam or low-compression balls mandatory</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Hitting lanes clearly marked with cones</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Wall distance minimum safe buffer enforced</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• No overhead obstruction risk</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>If environmental safety cannot be guaranteed, session must be modified.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>8. Emergency Action Plan (EAP)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Each site must have:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Emergency contact procedure</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• AED location identified</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Nurse or medical access identified</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Severe weather protocol reviewed</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Know EAP before first session</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Report injuries same day</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Complete incident documentation within 24 hours</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Have a EAP plan/card in coaches bag at all times.</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>9. Dress Code Policy </strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>All EduGolfKids coaches must wear:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Golf shirt (collared or approved branded attire)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Golf shorts or golf pants</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Golf-appropriate athletic shoes</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Prohibited attire:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Jeans</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Sweatpants</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Hoodies (unless branded and approved)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Sandals or open-toe shoes</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Non-athletic footwear</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches represent a professional youth sport brand and must maintain a golf-appropriate appearance.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>10. Mobile Phone Usage Policy</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>During active sessions, coaches may NOT:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Take personal calls</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Respond to text messages</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Use phones for personal browsing</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Be distracted by non-session activity</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Permitted phone use:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Recording swing video for instructional purposes</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Taking approved photos (with consent)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Reviewing session plans</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Checking attendance</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Emergency communication</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Phones must remain off or on silent during instruction.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Violation may result in disciplinary review.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>11. Insurance &amp; Liability Standards</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids maintains:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• General liability insurance ($1,000,000 minimum per occurrence)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Professional liability coverage</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Additional insured status for districts upon request</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Certificates of Insurance provided prior to launch.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>12. Inclusion &amp; Non-Discrimination</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids complies with:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Title IX</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• ADA</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Section 504</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Reasonable accommodations will be provided when appropriate.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>No child may be excluded based on protected status.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>13. Incident Reporting Standards</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>All incidents involving:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Injury</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Safety breach</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Behavioral escalation</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Parent concern</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Must be documented within 24 hours.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Reports must include:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Date</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Time</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Location</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Description</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Action taken</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Witnesses</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>14. Compliance Enforcement</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Failure to comply may result in:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Immediate removal from school site</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Suspension of certification</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Termination</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Reporting to authorities when required</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Safeguarding violations override instructional considerations.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>15. Time Management &amp; Supervision Protocol</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong><em>(Custodial Responsibility Standards)</strong></em></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>EduGolfKids recognizes that during lesson time, coaches assume active supervisory responsibility for participating children.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Proper time management and supervision procedures are mandatory and non-negotiable.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>15.1 Coach Arrival &amp; Pre-Session Setup Requirements</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>To ensure safety and professional standards:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Coaches must arrive at the school a minimum of 15 minutes prior to scheduled lesson start time.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Upon arrival, coaches must notify designated school personnel of their presence.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• All equipment and stations must be fully set up before children arrive.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Under no circumstances may:</strong></p>`},    {h:`Compliance &amp; Safeguarding (continued)`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Equipment setup occur while children are present.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Breakdown or packing up occur while children are present.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Children must never be present in an environment where equipment is being assembled, adjusted, or removed.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This prevents:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Equipment-related injury</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Distraction-based accidents</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Loss of supervision focus</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>15.2 Supervision During Lesson Time</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches assume full supervisory responsibility during lesson time.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>At no point may:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• A child be left unsupervised</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• A coach leave the coaching area unattended</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Equipment supervision lapse</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Children move freely without monitoring</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Supervision must be:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Active</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Visible</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Continuous</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Supervision includes both:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Physical safety</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Behavioral oversight</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>15.3 Student Collection &amp; Return Procedures</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must follow each school’s specific protocol for:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Collecting children from classrooms</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Meeting at designated areas</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Escorting students to lesson location</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Before leaving the classroom or pickup location, coaches must:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Verify attendance list</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Confirm number of children matches registration</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>After lesson completion, coaches must:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Escort children back to the correct classroom or designated drop-off area</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Confirm handoff to responsible adult (teacher or authorized staff)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must ensure 100% accountability for every child.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>No child may be dismissed independently unless explicitly authorized by school policy.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>15.4 End-of-Session Custodial Responsibility</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>At lesson conclusion:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Children must be transferred only to:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Assigned school teacher</strong></li>
  <li style="margin-bottom:5px;"><strong>Authorized school staff</strong></li>
  <li style="margin-bottom:5px;"><strong>Verified parent or guardian</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must ensure:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• No child remains unattended</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• No child exits gated school property unsupervised</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• No child is left in parking areas or unsafe environments</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>If a parent is late for pickup:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• The coach must remain with the child</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• The parent must be contacted immediately</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Pickup arrangements must be confirmed</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• The child must remain under adult supervision at all times</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Under no circumstances may a coach leave a child unattended due to late pickup.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>15.5 Drop-Off &amp; Pick-Up Communication Protocol</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Parents must be clearly informed of:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Exact lesson location</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Start time</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• End time</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Approved drop-off area</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Approved pickup area</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This information must be communicated:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Prior to program launch</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• In registration confirmation</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• In reminder communication</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Clear communication reduces liability and prevents unsafe dismissal scenarios.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>15.6 Equipment Breakdown Protocol</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Equipment breakdown may only begin when:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• All children have been safely handed over</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• The session area is fully cleared of participants</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• No child remains within equipment zone</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Packing up while children are present is prohibited.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>15.7 Zero-Unsupervised Policy</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids enforces a strict:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Zero-Unsupervised-Child Standard.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This applies:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Before session</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• During session</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• After session</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• During transitions</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• During bathroom breaks</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• During late pickups</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>At no point may a child be left without adult supervision.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach Acknowledgment</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>“I acknowledge and agree to comply with all EduGolfKids safeguarding, safety, operational, and legal standards as a condition of certification and school assignment.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Signature: __________________________</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Printed Name: _______________________</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Date: _______________________________</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>16. Model 0 Certification Requirement</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Before entering Module 1 Certification, coaches must:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Complete background clearance</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Complete mandatory reporter training</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Pass compliance knowledge check (90% minimum)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>• Sign acknowledgment</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><em></em></p>
<div id="m0-ack-section" style="margin-top:24px;padding:20px;background:#f0faf0;border-radius:10px;border:2px solid var(--green);">
  <h4 style="margin:0 0 12px;color:var(--green-dark);">Coach Acknowledgment</h4>
  <p style="margin-bottom:16px;line-height:1.7;">"I acknowledge and agree to comply with all EduGolfKids safeguarding, safety, operational, and legal standards as a condition of certification and school assignment."</p>
  <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;">
    <input type="checkbox" id="m0-acknowledge" style="margin-top:3px;width:18px;height:18px;flex-shrink:0;" onchange="checkM0Ack()"/>
    <span style="font-size:14px;"><strong>I have read and understood all Model 0 compliance requirements.</strong> I acknowledge and agree to comply with all standards as a condition of certification.</span>
  </label>
  <div id="m0-ack-status" style="margin-top:8px;font-size:13px;color:var(--gray-400);"></div>
</div>`},  ]},],
L1:[{  id:"L1_M1",  title:"Module 1 \u2014 EduGolfKids System Standards",  icon:"\ud83d\udccb",  sections:[    {h:`Non-Negotiable 60-Minute Session Architecture`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 1</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Non-Negotiable 60-Minute Session Architecture</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Policy: Mandatory Structure</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>All sessions MUST follow:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>10 min – Warm-Up Game</strong></li>
  <li style="margin-bottom:5px;"><strong>20 min – Skill Block</strong></li>
  <li style="margin-bottom:5px;"><strong>20 min – Game Reinforcement</strong></li>
  <li style="margin-bottom:5px;"><strong>10 min – Wrap-Up &amp; Reset</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Deviation requires HQ approval.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Why 60 Minutes?</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children 4–10 demonstrate:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Limited sustained attention (10–20 min)</strong></li>
  <li style="margin-bottom:5px;"><strong>High movement need</strong></li>
  <li style="margin-bottom:5px;"><strong>Rapid cognitive fatigue</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Longer sessions reduce:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Quality</strong></li>
  <li style="margin-bottom:5px;"><strong>Focus</strong></li>
  <li style="margin-bottom:5px;"><strong>Retention</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Shorter sessions reduce:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Skill consolidation opportunity</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>60 minutes is neurologically optimized for this age group.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Segment Breakdown (Deep Detail)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>1️⃣ Warm-Up Game (10 Minutes)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Purpose:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Elevate heart rate</strong></li>
  <li style="margin-bottom:5px;"><strong>Activate coordination</strong></li>
  <li style="margin-bottom:5px;"><strong>Increase focus</strong></li>
  <li style="margin-bottom:5px;"><strong>Create emotional engagement</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Must Include:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Whole-body movement</strong></li>
  <li style="margin-bottom:5px;"><strong>Competitive or cooperative scoring</strong></li>
  <li style="margin-bottom:5px;"><strong>Immediate participation (no lines)</strong></li>
  <li style="margin-bottom:5px;"><strong>Foam balls only</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Why It Matters:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Movement primes the brain for learning (Ratey, 2008).</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>2️⃣ Skill Block (20 Minutes)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Purpose:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Introduce new movement concept</strong></li>
  <li style="margin-bottom:5px;"><strong>Refine existing skill</strong></li>
  <li style="margin-bottom:5px;"><strong>Provide guided discovery</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Structure:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>3–4 mini constraints challenges</strong></li>
  <li style="margin-bottom:5px;"><strong><5 min per variation</strong></li>
  <li style="margin-bottom:5px;"><strong>Immediate rotation</strong></li>
  <li style="margin-bottom:5px;"><strong>Constant movement</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>No:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Standing lines</strong></li>
  <li style="margin-bottom:5px;"><strong>10-minute lecture</strong></li>
  <li style="margin-bottom:5px;"><strong>Isolated repetitive swings</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>3️⃣ Game Reinforcement (20 Minutes)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Purpose:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Transfer skill to contextual play</strong></li>
  <li style="margin-bottom:5px;"><strong>Encourage decision-making</strong></li>
  <li style="margin-bottom:5px;"><strong>Add pressure variability</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Examples:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Target scoring challenges</strong></li>
  <li style="margin-bottom:5px;"><strong>Team competitions</strong></li>
  <li style="margin-bottom:5px;"><strong>Accuracy games</strong></li>
  <li style="margin-bottom:5px;"><strong>Time-based scoring</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This is where retention is strengthened.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>4️⃣ Wrap-Up &amp; Reset (10 Minutes)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Purpose:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Reinforce learning verbally</strong></li>
  <li style="margin-bottom:5px;"><strong>Build confidence</strong></li>
  <li style="margin-bottom:5px;"><strong>Review safety</strong></li>
  <li style="margin-bottom:5px;"><strong>Prepare for next session</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Must Include:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Reflection question</strong></li>
  <li style="margin-bottom:5px;"><strong>Positive feedback</strong></li>
  <li style="margin-bottom:5px;"><strong>Equipment reset protocol</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>What Happens Without Structure?</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>You get:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Chaos</strong></li>
  <li style="margin-bottom:5px;"><strong>Inconsistent learning</strong></li>
  <li style="margin-bottom:5px;"><strong>Increased injury risk</strong></li>
  <li style="margin-bottom:5px;"><strong>Parent confusion</strong></li>
  <li style="margin-bottom:5px;"><strong>Uneven progress</strong></li>
  <li style="margin-bottom:5px;"><strong>Brand dilution</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Structure protects both the child and EduGolfKids.</strong></p>`},    {h:`Approved vs Prohibited Drills (Expanded)`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 2</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Approved vs Prohibited Drills (Expanded)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>APPROVED DRILLS MUST:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Be Target-Based</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children need external focus — not internal mechanics.</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Require Decision-Making</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>No autopilot repetition.</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Use Low-Compression Balls</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Safety + confidence.</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Limit Repetition to <5 Minutes</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>After 5 minutes engagement drops significantly.</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Include Movement Variation</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Change distance, target size, scoring rules.</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Encourage Guided Discovery</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Ask:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>“What worked?”</strong></li>
  <li style="margin-bottom:5px;"><strong>“What changed?”</strong></li>
  <li style="margin-bottom:5px;"><strong>“How did you adjust?”</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>PROHIBITED DRILLS (Detailed)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>❌ Long Static Lines</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Why harmful:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>30–45 sec waiting = disengagement</strong></li>
  <li style="margin-bottom:5px;"><strong>Behavioral disruption increases</strong></li>
  <li style="margin-bottom:5px;"><strong>Repetition drops</strong></li>
  <li style="margin-bottom:5px;"><strong>Learning efficiency decreases</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>❌ Blocked Repetition >5 Minutes</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Blocked practice = short-term improvement</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Variable practice = long-term retention</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>❌ Technical Lectures >60 Seconds</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children cannot process abstract biomechanical instruction.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead use:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Analogies</strong></li>
  <li style="margin-bottom:5px;"><strong>External cues</strong></li>
  <li style="margin-bottom:5px;"><strong>Demonstration</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>❌ Full-Speed Uncontrolled Swings</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Major injury liability.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Non-negotiable violation.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>❌ Adult Terminology</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Avoid:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>“Lag angle”</strong></li>
  <li style="margin-bottom:5px;"><strong>“Kinematic sequence”</strong></li>
  <li style="margin-bottom:5px;"><strong>“Ground reaction force”</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Use:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>“Brush the grass”</strong></li>
  <li style="margin-bottom:5px;"><strong>“Hit the rocket”</strong></li>
  <li style="margin-bottom:5px;"><strong>“Make the ball fly to the red cone”</strong></li>
</ul>`},    {h:`Equipment &Spacing Governance (Expanded)`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 3</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Equipment &amp; Spacing Governance (Expanded)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Lateral Spacing: Minimum 6 Feet</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This accounts for:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Swing arc</strong></li>
  <li style="margin-bottom:5px;"><strong>Loss of balance</strong></li>
  <li style="margin-bottom:5px;"><strong>Impulsive movement</strong></li>
  <li style="margin-bottom:5px;"><strong>Delayed reaction time</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Retrieval Protocol</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>When coach says “Retrieve”:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>All clubs on ground</strong></li>
  <li style="margin-bottom:5px;"><strong>All children step behind safety line</strong></li>
  <li style="margin-bottom:5px;"><strong>Walk — no running</strong></li>
  <li style="margin-bottom:5px;"><strong>No club in hand</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Violation = immediate correction.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Swing Zones</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Each child must have:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Defined cone box</strong></li>
  <li style="margin-bottom:5px;"><strong>Target lane</strong></li>
  <li style="margin-bottom:5px;"><strong>No overlapping directions</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This is environmental constraint design.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Equipment Standards</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Foam or low compression balls only</strong></li>
  <li style="margin-bottom:5px;"><strong>Age-appropriate clubs</strong></li>
  <li style="margin-bottom:5px;"><strong>No adult equipment</strong></li>
  <li style="margin-bottom:5px;"><strong>Cones to define zones</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Safety is engineered — not reactive.</strong></p>`},    {h:`No Improvisation Policy (Deep Governance)`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 4</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>No Improvisation Policy (Deep Governance)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This protects:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Brand integrity</strong></li>
  <li style="margin-bottom:5px;"><strong>Skills Passport system</strong></li>
  <li style="margin-bottom:5px;"><strong>Assessment fairness</strong></li>
  <li style="margin-bottom:5px;"><strong>Legal risk exposure</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Improvisation creates:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Inconsistent evaluation</strong></li>
  <li style="margin-bottom:5px;"><strong>Uneven progression</strong></li>
  <li style="margin-bottom:5px;"><strong>Increased injury probability</strong></li>
  <li style="margin-bottom:5px;"><strong>Parental dissatisfaction</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>What Is Allowed?</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Personality:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Energy</strong></li>
  <li style="margin-bottom:5px;"><strong>Encouragement</strong></li>
  <li style="margin-bottom:5px;"><strong>Humor</strong></li>
  <li style="margin-bottom:5px;"><strong>Leadership style</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Not allowed:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Changing structure</strong></li>
  <li style="margin-bottom:5px;"><strong>Changing progression order</strong></li>
  <li style="margin-bottom:5px;"><strong>Adding unsafe drills</strong></li>
  <li style="margin-bottom:5px;"><strong>Modifying spacing rules</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Creativity exists within the framework.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>COACH PRACTICAL APPLICATION (Expanded)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 1 – Design &amp; Defend</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must submit:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Written 60-minute plan</strong></li>
  <li style="margin-bottom:5px;"><strong>Diagram of spacing</strong></li>
  <li style="margin-bottom:5px;"><strong>Justification for:</strong></li>
  <li style="margin-bottom:5px;"><strong>Warm-up design</strong></li>
  <li style="margin-bottom:5px;"><strong>Skill progression</strong></li>
  <li style="margin-bottom:5px;"><strong>Reinforcement game</strong></li>
  <li style="margin-bottom:5px;"><strong>Identify motor learning principle used</strong></li>
  <li style="margin-bottom:5px;"><strong>Identify risk mitigation considerations</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 2 – Fault Analysis Scenario</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>10 children in one line hitting at one net.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must identify:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Engagement flaw:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>→ Long wait time reduces repetition.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Motor learning flaw:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>→ Blocked practice with no contextual variation.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Safety flaw:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>→ Overlapping swing path risk.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Structural violation:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>→ Breaks session architecture + spacing policy.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Redesign:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>→ 3 pods</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>→ 3 targets</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>→ Rotation every 4 minutes</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>→ Foam balls</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>→ Cones defining lanes</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>CERTIFICATION ASSESSMENT (Expanded)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Written Test (30%)</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Structure questions</strong></li>
  <li style="margin-bottom:5px;"><strong>Motor learning theory</strong></li>
  <li style="margin-bottom:5px;"><strong>Safety protocols</strong></li>
  <li style="margin-bottom:5px;"><strong>Drill evaluation scenarios</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario Analysis (30%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Given 3 unsafe scenarios:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Identify violation</strong></li>
  <li style="margin-bottom:5px;"><strong>Redesign properly</strong></li>
  <li style="margin-bottom:5px;"><strong>Justify scientifically</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Live Demonstration (40%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Set up correct spacing</strong></li>
  <li style="margin-bottom:5px;"><strong>Deliver 10-minute micro session</strong></li>
  <li style="margin-bottom:5px;"><strong>Demonstrate reset protocol</strong></li>
  <li style="margin-bottom:5px;"><strong>Show engagement management</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Automatic fail triggers:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Safety violation</strong></li>
  <li style="margin-bottom:5px;"><strong>Full-speed uncontrolled swings</strong></li>
  <li style="margin-bottom:5px;"><strong>Ignoring spacing rules</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>MINIMUM PASS: 85%</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids does not certify average.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Certification means system mastery.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Final Reinforcement for Coaches</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Consistency is not control for control’s sake.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Consistency is:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Neurological optimization</strong></li>
  <li style="margin-bottom:5px;"><strong>Emotional regulation support</strong></li>
  <li style="margin-bottom:5px;"><strong>Risk mitigation</strong></li>
  <li style="margin-bottom:5px;"><strong>Brand protection</strong></li>
  <li style="margin-bottom:5px;"><strong>Development integrity</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>You are not “teaching golf.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>You are engineering developmental environments.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">##</p>`},  ]},{  id:"L1_M2",  title:"Module 2 \u2014 Child Development (Ages 4\u201310)",  icon:"\ud83e\udde0",  sections:[    {h:`Developmental Foundations`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Developmental Foundations</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Child development occurs across four domains:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Cognitive (thinking capacity)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Motor (movement control)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Emotional (self-regulation)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Social (peer interaction)</p>
<p style="margin:0 0 10px;line-height:1.85;">Coaching must align with all four — not just skill instruction.</p>`},    {h:`Age Group Breakdown`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Age Group Breakdown</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">AGE 4–6: Early Fundamentals Stage</h3>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">Neurological Characteristics</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Limited working memory capacity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Short sustained attention (5–8 minutes)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">High sensory curiosity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Imitation-driven learning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Limited abstract reasoning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">They learn best through:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Demonstration</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Play</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Movement exploration</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Immediate feedback</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">External cues</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">They struggle with:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Technical explanation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Sequential instruction beyond 1 step</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Waiting in lines</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Delayed reward systems</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">Motor Development (4–6)</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Developing balance</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Inconsistent coordination</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Limited bilateral control</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Poor spatial awareness</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Impulsive movement</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coaching Implication:</p>
<p style="margin:0 0 10px;line-height:1.85;">Safety management must be heightened.</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">Emotional Characteristics (4–6)</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Rapid mood shifts</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Frustration tolerance is low</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Immediate success needed</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Highly approval-driven</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Fear of public correction</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Frustration signals may include:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Dropping equipment</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Avoiding task</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Silence withdrawal</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Overactive behavior</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Saying “I can’t”</p>
<p style="margin:0 0 10px;line-height:1.85;">This is developmental — not defiance.</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">Instruction Guidelines for 4–6</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Use:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">One-step instructions</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Demonstration first</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Simple language</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">External focus cues</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Short game cycles (<5 minutes)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Avoid:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Technical breakdown</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Multi-part corrections</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Long explanations</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Public criticism</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Example Cue:</p>
<p style="margin:0 0 10px;line-height:1.85;">Instead of:</p>
<p style="margin:0 0 10px;line-height:1.85;">“Shift your weight to your lead side.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Say:</p>
<p style="margin:0 0 10px;line-height:1.85;">“Make the ball fly to the red rocket cone.”</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">AGE 6–9: Late Fundamentals / Early Learning Stage</h3>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">Neurological Characteristics</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Improved working memory</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Sustained attention 10–20 minutes</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Can process 2-step instructions</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Beginning analytical thinking</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">More competitive awareness</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">They learn well through:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Structured challenge</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scoring systems</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Peer comparison</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Clear goals</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Feedback with reasoning</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">Motor Development (6–9)</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Improving coordination</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Better bilateral integration</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">More stable balance</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Increased reaction control</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">However:</p>
<p style="margin:0 0 10px;line-height:1.85;">Consistency is still emerging.</p>
<p style="margin:0 0 10px;line-height:1.85;">Repetition must still be variable.</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">Emotional Characteristics (6–9)</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Increased social comparison</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Sensitive to failure</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Competitive pride developing</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Can verbalize frustration</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Frustration signals may include:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Blaming equipment</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Comparing to peers</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Overtrying</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Withdrawal from competition</p>
<p style="margin:0 0 10px;line-height:1.85;">This stage requires calibrated challenge — not overpressure.</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">Instruction Guidelines for 6–9</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Use:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Two-step instruction</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Tactical challenges</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scoring goals</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Guided discovery questions</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Peer competition</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Example Cue:</p>
<p style="margin:0 0 10px;line-height:1.85;">“Hit three balls past the blue cone. Then try to land one inside the yellow zone.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">This age can begin to understand:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Cause and effect</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Adjustment reasoning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Simple self-reflection</p>`},    {h:`Frustration Recognition & Task Adjustment`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Frustration Recognition &amp; Task Adjustment</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Core Rule:</p>
<p style="margin:0 0 10px;line-height:1.85;">When frustration rises, task difficulty must adjust immediately.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Do NOT:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Add more correction</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Increase technical detail</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Publicly criticize</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Demand repetition without modification</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Instead adjust through constraints:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Increase target size</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Reduce distance</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Change scoring rules</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Modify equipment</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Simplify task goal</p>
<p style="margin:0 0 10px;line-height:1.85;">Developmentally aligned coaching is adaptive.</p>`},    {h:`Language Framework by Age`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Language Framework by Age</p>
<p style="margin:0 0 10px;line-height:1.85;">| Category | Age 4–6 | Age 6–9 |</p>
<p style="margin:0 0 10px;line-height:1.85;">| --- | --- | --- |</p>
<p style="margin:0 0 10px;line-height:1.85;">| Instruction Length | 1 step | 1–2 steps |</p>
<p style="margin:0 0 10px;line-height:1.85;">| Cue Type | External imagery | External + simple reasoning |</p>
<p style="margin:0 0 10px;line-height:1.85;">| Correction Style | Demonstrate | Ask-guided correction |</p>
<p style="margin:0 0 10px;line-height:1.85;">| Competition | Cooperative games | Structured competition |</p>
<p style="margin:0 0 10px;line-height:1.85;">| Feedback | Immediate praise | Specific performance feedback |</p>
<p style="margin:0 0 10px;line-height:1.85;">| Reflection | “Did it go far?” | “What changed that shot?” |</p>`},    {h:`Practical Coaching Translation`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Practical Coaching Translation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Same Drill Example:</p>
<p style="margin:0 0 10px;line-height:1.85;">Target Hitting Game</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coaching a 5-Year-Old</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Language:</p>
<p style="margin:0 0 10px;line-height:1.85;">“Let’s hit the magic rocket to the red cone! Watch me first.”</p>
<p style="margin:0 0 10px;line-height:1.85;">Demonstrate.</p>
<p style="margin:0 0 10px;line-height:1.85;">Short attempts.</p>
<p style="margin:0 0 10px;line-height:1.85;">Celebrate small wins.</p>
<p style="margin:0 0 10px;line-height:1.85;">Keep rotation fast.</p>
<p style="margin:0 0 10px;line-height:1.85;">No scoring pressure.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coaching a 9-Year-Old</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Language:</p>
<p style="margin:0 0 10px;line-height:1.85;">“You get 5 shots. Score 1 point for red, 2 for blue. Can you beat your score?”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Encourage self-evaluation:</p>
<p style="margin:0 0 10px;line-height:1.85;">“What adjustment helped?”</p>
<p style="margin:0 0 10px;line-height:1.85;">Allow peer challenge.</p>
<p style="margin:0 0 10px;line-height:1.85;">Introduce light competitive pressure.</p>`},    {h:`Why Developmental Matching Matters`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Why Developmental Matching Matters</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">When instruction exceeds development:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Anxiety increases</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Motor performance drops</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Engagement falls</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Injury risk rises</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Parent complaints increase</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">When instruction aligns:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Confidence builds</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Skill retention improves</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Emotional regulation stabilizes</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Learning accelerates</p>
<p style="margin:0 0 10px;line-height:1.85;">Development drives instruction — not coach ego.</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">COACH PRACTICAL APPLICATION</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Exercise 1 – Role Play</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Deliver 3-minute instruction to a simulated 5-year-old</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Deliver same drill to a simulated 9-year-old</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Adjust:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Language</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Challenge</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Feedback</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Instruction complexity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Evaluator looks for:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Developmentally appropriate language</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Frustration awareness</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Task scaling</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Safety management</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Exercise 2 – Frustration Adjustment Drill</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scenario:</p>
<p style="margin:0 0 10px;line-height:1.85;">A 6-year-old misses 4 shots and says “This is stupid.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Identify developmental cause</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Modify task immediately</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Use corrective language</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Re-engage child within 60 seconds</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">CERTIFICATION ASSESSMENT</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Written (30%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Questions may include:</p>
<p style="margin:0 0 10px;line-height:1.85;">Identify cognitive differences between 4–6 and 6–9.</p>
<p style="margin:0 0 10px;line-height:1.85;">Explain why long lectures fail under age 7.</p>
<p style="margin:0 0 10px;line-height:1.85;">List three frustration signals in early childhood.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scenario Analysis (30%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Given video or written scenario:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Identify developmental mismatch</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Redesign instruction</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Live Demonstration (40%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Demonstrate age-adjusted instruction</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Modify drill difficulty in real time</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Use correct language structure</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Show emotional regulation management</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Automatic reassessment if:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Adult terminology used repeatedly</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Public shaming behavior</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Overloading multi-step instruction to 4–6 group</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">PASS REQUIREMENT</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Minimum 85%</p>
<p style="margin:0 0 10px;line-height:1.85;">A coach who does not understand development cannot safely or effectively coach children.</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">Key Reinforcement</h3>
<p style="margin:0 0 10px;line-height:1.85;">You are not teaching golf swings.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">You are shaping:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Neural pathways</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Confidence patterns</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Emotional regulation habits</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Movement literacy foundations</p>
<p style="margin:0 0 10px;line-height:1.85;">Development dictates instruction.</p>
<p style="margin:0 0 10px;line-height:1.85;">Not the other way around.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><em></em></p>`},  ]},{  id:"L1_M3",  title:"Module 3 \u2014 Motor Learning &amp; Constraints",  icon:"\u2699\ufe0f",  sections:[    {h:`What Is Motor Learning?`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 1</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>What Is Motor Learning?</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Motor learning is:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>A relatively permanent change in movement capability produced by practice.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Key word: Permanent</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Performance in a session is not learning.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Temporary improvement ≠ retention.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Performance vs Learning</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">| <strong>Performance</strong> | <strong>Learning</strong> |</p>
<p style="margin:0 0 10px;line-height:1.85;">| --- | --- |</p>
<p style="margin:0 0 10px;line-height:1.85;">| <strong>Looks good today</strong> | <strong>Retained next week</strong> |</p>
<p style="margin:0 0 10px;line-height:1.85;">| <strong>Block repetition</strong> | <strong>Variable problem-solving</strong> |</p>
<p style="margin:0 0 10px;line-height:1.85;">| <strong>Heavy correction</strong> | <strong>Exploration-based</strong> |</p>
<p style="margin:0 0 10px;line-height:1.85;">| <strong>Immediate improvement</strong> | <strong>Delayed improvement but stronger</strong> |</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids coaches train for learning, not appearance.</strong></p>`},    {h:`How Children Acquire Movement Skills`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 2</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>How Children Acquire Movement Skills</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Motor learning occurs through:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Repetition WITH variation</strong></li>
  <li style="margin-bottom:5px;"><strong>Environmental feedback</strong></li>
  <li style="margin-bottom:5px;"><strong>Error detection</strong></li>
  <li style="margin-bottom:5px;"><strong>Problem solving</strong></li>
  <li style="margin-bottom:5px;"><strong>Emotional engagement</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children build:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Neural pathways</strong></li>
  <li style="margin-bottom:5px;"><strong>Movement adaptability</strong></li>
  <li style="margin-bottom:5px;"><strong>Sensory-motor calibration</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>They do NOT build skill through:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Listening to lectures</strong></li>
  <li style="margin-bottom:5px;"><strong>Being corrected every swing</strong></li>
  <li style="margin-bottom:5px;"><strong>Copying adult biomechanics</strong></li>
  <li style="margin-bottom:5px;"><strong>Standing in lines</strong></li>
</ul>`},    {h:`Blocked vs Variable Practice`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 3</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Blocked vs Variable Practice</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Blocked Practice</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Example:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Child hits 20 balls from same spot to same target.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Short-term result:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Looks consistent.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Long-term result:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Poor transfer to real performance.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Research (Shea &amp; Morgan, 1979) shows blocked practice limits retention.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Variable Practice</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Example:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Change distance</strong></li>
  <li style="margin-bottom:5px;"><strong>Change target size</strong></li>
  <li style="margin-bottom:5px;"><strong>Change scoring rules</strong></li>
  <li style="margin-bottom:5px;"><strong>Change stance width</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Short-term result:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Messier.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Long-term result:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Stronger retention.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids prioritizes variable practice.</strong></p>`},    {h:`The Constraints-Led Approach (CLA)`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 4</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The Constraints-Led Approach (CLA)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>(Newell, 1986; Renshaw et al., 2010)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead of telling children how to move, coaches manipulate:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>1️⃣ Task Constraints</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Target size</strong></li>
  <li style="margin-bottom:5px;"><strong>Scoring rules</strong></li>
  <li style="margin-bottom:5px;"><strong>Distance</strong></li>
  <li style="margin-bottom:5px;"><strong>Time limits</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>2️⃣ Environmental Constraints</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Cones</strong></li>
  <li style="margin-bottom:5px;"><strong>Boundaries</strong></li>
  <li style="margin-bottom:5px;"><strong>Landing zones</strong></li>
  <li style="margin-bottom:5px;"><strong>Obstacles</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>3️⃣ Individual Constraints</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Height</strong></li>
  <li style="margin-bottom:5px;"><strong>Strength</strong></li>
  <li style="margin-bottom:5px;"><strong>Coordination level</strong></li>
  <li style="margin-bottom:5px;"><strong>Emotional state</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Movement emerges naturally when constraints are designed properly.</strong></p>`},    {h:`Why Traditional Technical Instruction Fails in Children`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 5</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Why Traditional Technical Instruction Fails in Children</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>When coaches say:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“Keep your left arm straight.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The child must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Understand abstract concept</strong></li>
  <li style="margin-bottom:5px;"><strong>Convert to internal movement</strong></li>
  <li style="margin-bottom:5px;"><strong>Execute under coordination limits</strong></li>
  <li style="margin-bottom:5px;"><strong>Retain it under variability</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Most children cannot process this efficiently.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead use:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>External focus cues.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Example:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead of “Rotate your hips,” say:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“Make your belly button face the target.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>External focus improves motor efficiency (Wulf, 2013).</strong></p>`},    {h:`Guided Discovery vs Direct Correction`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 6</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Guided Discovery vs Direct Correction</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Direct Correction:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“You lifted your head.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Guided Discovery:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“What happened when that one went low?”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Guided discovery:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Builds autonomy</strong></li>
  <li style="margin-bottom:5px;"><strong>Improves retention</strong></li>
  <li style="margin-bottom:5px;"><strong>Develops error detection</strong></li>
  <li style="margin-bottom:5px;"><strong>Enhances confidence</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Correction hierarchy:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Adjust environment</strong></li>
  <li style="margin-bottom:5px;"><strong>Adjust task</strong></li>
  <li style="margin-bottom:5px;"><strong>Ask reflective question</strong></li>
  <li style="margin-bottom:5px;"><strong>Demonstrate</strong></li>
  <li style="margin-bottom:5px;"><strong>Direct correction (last resort)</strong></li>
</ul>`},    {h:`Error Is Necessary`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 7</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Error Is Necessary</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children must make errors.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Error allows:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Neural recalibration</strong></li>
  <li style="margin-bottom:5px;"><strong>Self-correction</strong></li>
  <li style="margin-bottom:5px;"><strong>Adaptability</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Over-correction creates:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Fear</strong></li>
  <li style="margin-bottom:5px;"><strong>Overthinking</strong></li>
  <li style="margin-bottom:5px;"><strong>Motor rigidity</strong></li>
  <li style="margin-bottom:5px;"><strong>Coach dependency</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids embraces intelligent error.</strong></p>`},    {h:`Designing a Motor-Learning-Optimized Session`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 8</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Designing a Motor-Learning-Optimized Session</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Within 20-Minute Skill Block:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead of:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>20 minutes same drill.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Use:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>4 x 4-minute constraints challenges.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Example:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Challenge 1:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Hit past blue cone.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Challenge 2:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Land inside yellow circle.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Challenge 3:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Score 3 in a row.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Challenge 4:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Time pressure round.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Movement variability increases learning strength.</strong></p>`},    {h:`Cognitive Load in Children`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 9</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Cognitive Load in Children</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children 4–10 have:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Limited working memory</strong></li>
  <li style="margin-bottom:5px;"><strong>Limited processing capacity</strong></li>
  <li style="margin-bottom:5px;"><strong>High movement need</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Therefore:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Keep instructions under 30 seconds.</strong></li>
  <li style="margin-bottom:5px;"><strong>One focus cue at a time.</strong></li>
  <li style="margin-bottom:5px;"><strong>Avoid multi-step breakdowns.</strong></li>
  <li style="margin-bottom:5px;"><strong>Demonstrate visually.</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Cognitive overload reduces motor execution.</strong></p>`},    {h:`Application to Golf-Specific Skills`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 10</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Application to Golf-Specific Skills</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Putting</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Wrong Approach:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>20 identical 5-foot putts.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Correct Approach:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Change distance each round</strong></li>
  <li style="margin-bottom:5px;"><strong>Shrink target gradually</strong></li>
  <li style="margin-bottom:5px;"><strong>Add scoring rule</strong></li>
  <li style="margin-bottom:5px;"><strong>Introduce obstacle</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Chipping</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Wrong:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>10 identical chips.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Correct:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Vary landing zones</strong></li>
  <li style="margin-bottom:5px;"><strong>Vary target shape</strong></li>
  <li style="margin-bottom:5px;"><strong>Change club length</strong></li>
  <li style="margin-bottom:5px;"><strong>Add time challenge</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Full Swing</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Wrong:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“Fix your backswing.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Correct:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Adjust stance width</strong></li>
  <li style="margin-bottom:5px;"><strong>Change target distance</strong></li>
  <li style="margin-bottom:5px;"><strong>Modify scoring constraint</strong></li>
  <li style="margin-bottom:5px;"><strong>Encourage rhythm cue</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Movement self-organizes under constraints.</strong></p>`},    {h:`Coach Decision-Making Model`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 11</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach Decision-Making Model</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>When child struggles:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Ask:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Is task too hard?</strong></li>
  <li style="margin-bottom:5px;"><strong>Is environment poorly designed?</strong></li>
  <li style="margin-bottom:5px;"><strong>Is instruction overloaded?</strong></li>
  <li style="margin-bottom:5px;"><strong>Is emotional state disrupted?</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Adjust constraints before correcting technique.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>COACH PRACTICAL APPLICATION</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 1 – Drill Redesign</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach is given:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“10 children hitting continuously toward one net.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Identify motor learning flaw</strong></li>
  <li style="margin-bottom:5px;"><strong>Redesign into 3 variable stations</strong></li>
  <li style="margin-bottom:5px;"><strong>Explain constraint used at each station</strong></li>
  <li style="margin-bottom:5px;"><strong>Justify scientifically</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 2 – Guided Discovery Role Play</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Avoid giving direct correction</strong></li>
  <li style="margin-bottom:5px;"><strong>Ask guided question</strong></li>
  <li style="margin-bottom:5px;"><strong>Modify task constraint</strong></li>
  <li style="margin-bottom:5px;"><strong>Observe improvement</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Evaluator measures:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Reduction of verbal overload</strong></li>
  <li style="margin-bottom:5px;"><strong>Proper constraint manipulation</strong></li>
  <li style="margin-bottom:5px;"><strong>Child engagement response</strong></li>
</ul>`},    {h:`Certification Assessment`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 12</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Certification Assessment</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Written (30%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Questions may include:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Define motor learning.</strong></li>
  <li style="margin-bottom:5px;"><strong>Explain contextual interference.</strong></li>
  <li style="margin-bottom:5px;"><strong>List 3 differences between blocked and variable practice.</strong></li>
  <li style="margin-bottom:5px;"><strong>Define constraints-led coaching.</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario-Based (30%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Case:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Child inconsistent in hitting distance.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Adjust constraint</strong></li>
  <li style="margin-bottom:5px;"><strong>Avoid technical lecture</strong></li>
  <li style="margin-bottom:5px;"><strong>Explain reasoning</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Live Demonstration (40%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Run 10-minute skill block</strong></li>
  <li style="margin-bottom:5px;"><strong>Show 3 constraint variations</strong></li>
  <li style="margin-bottom:5px;"><strong>Use external focus cue</strong></li>
  <li style="margin-bottom:5px;"><strong>Avoid over-correction</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Automatic reassessment if:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Coach uses continuous technical correction</strong></li>
  <li style="margin-bottom:5px;"><strong>Runs blocked repetition >5 minutes</strong></li>
  <li style="margin-bottom:5px;"><strong>Uses adult biomechanical language</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>PASS REQUIREMENT</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Minimum 85%</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Motor learning is not optional knowledge.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>It is the engine of EduGolfKids.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Final Reinforcement</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>You are not a swing fixer.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>You are a learning designer.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>You create environments that:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Promote exploration</strong></li>
  <li style="margin-bottom:5px;"><strong>Encourage autonomy</strong></li>
  <li style="margin-bottom:5px;"><strong>Build adaptability</strong></li>
  <li style="margin-bottom:5px;"><strong>Strengthen retention</strong></li>
  <li style="margin-bottom:5px;"><strong>Protect confidence</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Constraints guide behavior.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Structure protects development.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Error builds intelligence.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">##</p>`},  ]},{  id:"L1_M4",  title:"Module 4 \u2014 Long-Term Athlete Development",  icon:"\ud83d\udcc8",  sections:[    {h:`What is LTAD?`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">What is LTAD?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Long-Term Athlete Development (LTAD) is a science-based framework that organizes skill progression according to:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Biological development</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Neuromuscular readiness</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Cognitive maturity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Emotional regulation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Physical growth windows</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">It prevents:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Burnout</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Overuse injuries</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Skill plateaus</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Technical rigidity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Early dropout</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">LTAD asks:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">“What is developmentally appropriate at this stage?”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Not:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">“How fast can we make them good?”</p>`},    {h:`Active Start Stage (Ages 4–6)`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Active Start Stage (Ages 4–6)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Primary Goal:</p>
<p style="margin:0 0 10px;line-height:1.85;">Build movement literacy.</p>
<p style="margin:0 0 10px;line-height:1.85;">Not golf mechanics.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Physical Priorities</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Balance</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coordination</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Running</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Jumping</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Throwing</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Catching</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Spatial awareness</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Golf exposure should be:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Play-based</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Low pressure</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Short duration</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Target-focused</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Movement integrated</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">What NOT To Emphasize</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Grip precision</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Swing plane</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Hip rotation sequencing</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Launch angle</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Technical positions</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">At this stage:</p>
<p style="margin:0 0 10px;line-height:1.85;">Movement quality > Swing aesthetics.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Why?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Neurological development at 4–6 is:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Highly plastic</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Pattern forming</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Exploration-driven</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Early rigid technical instruction reduces:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Creativity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Natural movement exploration</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Adaptive learning</p>`},    {h:`FUNdamentals Stage (Ages 6–9)`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">FUNdamentals Stage (Ages 6–9)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Primary Goal:</p>
<p style="margin:0 0 10px;line-height:1.85;">Build athletic foundation + basic golf control.</p>
<p style="margin:0 0 10px;line-height:1.85;">Still NOT specialization.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Physical Priorities</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Refined balance</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Controlled rotation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Rhythm</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Basic club-face awareness</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Target accuracy</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Athletic play</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Introduce:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Structured scoring</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Basic skill progression</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Controlled competition</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Still Avoid:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Swing reconstruction</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Biomechanical perfectionism</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">High repetition blocked practice</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Adult tournament pressure</p>`},    {h:`The Dangers of Early Technical Overload`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">The Dangers of Early Technical Overload</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Early technical overload occurs when:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coaches focus excessively on mechanics</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Children are corrected every swing</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Complex terminology is introduced</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Adult swing models are imposed</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Performance expectations exceed development</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Risks of Early Technical Overload</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">1️⃣ Motor Rigidity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Children develop:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Overthinking patterns</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Stiff movement</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Reduced fluidity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Loss of adaptability</p>
<p style="margin:0 0 10px;line-height:1.85;">Motor learning science shows variability builds long-term skill (Schmidt &amp; Lee, 2011).</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">2️⃣ Reduced Creativity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Children stop:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Exploring movement solutions</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Self-correcting</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Experimenting</p>
<p style="margin:0 0 10px;line-height:1.85;">They become dependent on coach instruction.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">3️⃣ Increased Injury Risk</p>
<p style="margin:0 0 10px;line-height:1.85;">Overuse + forced mechanics + repetition = preventable injury risk.</p>
<p style="margin:0 0 10px;line-height:1.85;">Youth sport data consistently shows early specialization increases injury rates.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">4️⃣ Psychological Burnout</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Performance pressure before emotional readiness leads to:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Anxiety</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Dropout</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Reduced enjoyment</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Identity stress</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">5️⃣ Plateau Effect</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Early technical perfection often results in:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Early performance spike</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Mid-adolescence stagnation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Difficulty adapting later</p>
<p style="margin:0 0 10px;line-height:1.85;">LTAD prevents early plateau.</p>`},    {h:`Development vs Correction Priority`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Development vs Correction Priority</p>
<p style="margin:0 0 10px;line-height:1.85;">This is critical for certification.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">When observing a child swing, ask:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Is this movement age-appropriate?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Is it safe?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Is it functional?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Does it allow target success?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Is the child frustrated?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">If yes to 2–4:</p>
<p style="margin:0 0 10px;line-height:1.85;">Correction may not be priority.</p>
<p style="margin:0 0 10px;line-height:1.85;">Development takes precedence over aesthetic correction.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Example Analysis</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scenario:</p>
<p style="margin:0 0 10px;line-height:1.85;">7-year-old slices the ball but consistently reaches the target zone.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Decision:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">If:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">No safety issue</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Ball reaches intended distance</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Child confident</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Then:</p>
<p style="margin:0 0 10px;line-height:1.85;">Do NOT reconstruct swing.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Instead:</p>
<p style="margin:0 0 10px;line-height:1.85;">Adjust target constraints.</p>
<p style="margin:0 0 10px;line-height:1.85;">Encourage exploration.</p>
<p style="margin:0 0 10px;line-height:1.85;">Let natural refinement occur over time.</p>`},    {h:`Stage-Appropriate Coaching Behavior`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Stage-Appropriate Coaching Behavior</p>
<p style="margin:0 0 10px;line-height:1.85;">| Stage | Coach Role | Technical Emphasis | Emotional Emphasis |</p>
<p style="margin:0 0 10px;line-height:1.85;">| --- | --- | --- | --- |</p>
<p style="margin:0 0 10px;line-height:1.85;">| 4–6 | Movement guide | Minimal | Fun + safety |</p>
<p style="margin:0 0 10px;line-height:1.85;">| 6–9 | Skill architect | Moderate external cues | Challenge + confidence |</p>`},    {h:`Practical Coaching Translation`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Practical Coaching Translation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Same Drill: Target Accuracy Game</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coaching 5-Year-Old (Active Start)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Focus:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Hit toward target</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Celebrate effort</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Encourage movement exploration</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Language:</p>
<p style="margin:0 0 10px;line-height:1.85;">“Make it fly past the red cone!”</p>
<p style="margin:0 0 10px;line-height:1.85;">No mechanical correction unless safety issue.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coaching 8-Year-Old (FUNdamentals)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Focus:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Target control</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Club awareness</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scoring</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Language:</p>
<p style="margin:0 0 10px;line-height:1.85;">“What changed when that one went straighter?”</p>
<p style="margin:0 0 10px;line-height:1.85;">Encourage reflection, not mechanical lecture.</p>`},    {h:`The LTAD Protection Rule`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">The LTAD Protection Rule</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">EduGolfKids Coaches must never:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Promise performance outcomes</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Push private technical training at early stage</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Over-correct natural movement</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Emphasize tournament identity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Introduce adult swing models</p>
<p style="margin:0 0 10px;line-height:1.85;">EduGolfKids builds foundations — not prodigies.</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">COACH PRACTICAL APPLICATION</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Exercise 1 – Swing Evaluation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach is shown video of:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">A 6-year-old swinging with:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Wide stance</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Open club face</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Off-balance finish</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must determine:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">What is developmentally normal?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">What requires safety correction?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">What can be left to maturation?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">What environmental constraint could guide improvement?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Expected Analysis:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Developmentally normal:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Inconsistent balance</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Face control variability</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Requires correction:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Unsafe spacing</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Excessive overswing if balance risk</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Constraint adjustment:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Narrower stance challenge</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Closer target</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Larger landing zone</p>`},    {h:`Certification Assessment`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Certification Assessment</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Written (30%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Questions may include:</p>
<p style="margin:0 0 10px;line-height:1.85;">Define Active Start stage priorities.</p>
<p style="margin:0 0 10px;line-height:1.85;">List 3 risks of early technical overload.</p>
<p style="margin:0 0 10px;line-height:1.85;">Explain why blocked practice is limited in early development.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scenario-Based (30%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach analyzes written case:</p>
<p style="margin:0 0 10px;line-height:1.85;">Parent demands swing reconstruction for 6-year-old.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Respond professionally</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Explain LTAD reasoning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Protect program philosophy</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Live Demonstration (40%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Evaluate a swing in real time</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Prioritize development over correction</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Avoid adult terminology</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Use constraint-led adjustment</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Automatic reassessment if:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach immediately reconstructs mechanics</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Uses technical jargon</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Prioritizes aesthetics over development</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">PASS REQUIREMENT</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Minimum 85%</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">EduGolfKids certification means:</p>
<p style="margin:0 0 10px;line-height:1.85;">You understand stages.</p>
<p style="margin:0 0 10px;line-height:1.85;">You protect development.</p>
<p style="margin:0 0 10px;line-height:1.85;">You think long term.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Final Reinforcement</p>
<p style="margin:0 0 10px;line-height:1.85;">Great golfers are not built early.</p>
<p style="margin:0 0 10px;line-height:1.85;">They are built correctly.</p>
<p style="margin:0 0 10px;line-height:1.85;">Movement literacy.</p>
<p style="margin:0 0 10px;line-height:1.85;">Adaptability.</p>
<p style="margin:0 0 10px;line-height:1.85;">Confidence.</p>
<p style="margin:0 0 10px;line-height:1.85;">Progressive skill layering.</p>
<p style="margin:0 0 10px;line-height:1.85;">Short-term technical obsession destroys long-term potential.</p>
<p style="margin:0 0 10px;line-height:1.85;">EduGolfKids coaches are long-term architects.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><em></em></p>`},  ]},{  id:"L1_M5",  title:"Module 5 \u2014 21st Century Learning",  icon:"\ud83d\udd2c",  sections:[    {h:`What Are 21st Century Learning Skills?`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 1</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>What Are 21st Century Learning Skills?</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Modern education emphasizes four core competencies:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>1️⃣ Critical Thinking</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>2️⃣ Communication</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>3️⃣ Collaboration</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>4️⃣ Creativity</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Often called the “4 C’s.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids embeds these inside golf activities.</strong></p>`},    {h:`Critical Thinking in Golf Sessions`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 2</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Critical Thinking in Golf Sessions</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Critical thinking is:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The ability to analyze, adjust, and solve problems.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead of telling children what to do, coaches ask:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>“What changed on that shot?”</strong></li>
  <li style="margin-bottom:5px;"><strong>“Why do you think it went farther?”</strong></li>
  <li style="margin-bottom:5px;"><strong>“How can you adjust for that target?”</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This builds:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Decision-making</strong></li>
  <li style="margin-bottom:5px;"><strong>Self-correction</strong></li>
  <li style="margin-bottom:5px;"><strong>Tactical awareness</strong></li>
  <li style="margin-bottom:5px;"><strong>Cognitive flexibility</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children who think about movement retain it better.</strong></p>`},    {h:`Communication Development`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 3</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Communication Development</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Communication is developed when children:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Explain their strategy</strong></li>
  <li style="margin-bottom:5px;"><strong>Give peer feedback</strong></li>
  <li style="margin-bottom:5px;"><strong>Ask questions</strong></li>
  <li style="margin-bottom:5px;"><strong>Reflect on performance</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Encourage verbal reflection</strong></li>
  <li style="margin-bottom:5px;"><strong>Avoid dominating conversation</strong></li>
  <li style="margin-bottom:5px;"><strong>Model concise language</strong></li>
  <li style="margin-bottom:5px;"><strong>Reinforce respectful interaction</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Avoid:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Over-talking</strong></li>
  <li style="margin-bottom:5px;"><strong>Lecture style delivery</strong></li>
  <li style="margin-bottom:5px;"><strong>One-direction communication</strong></li>
</ul>`},    {h:`Collaboration Through Structured Games`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 4</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Collaboration Through Structured Games</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Collaboration teaches:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Turn-taking</strong></li>
  <li style="margin-bottom:5px;"><strong>Emotional regulation</strong></li>
  <li style="margin-bottom:5px;"><strong>Shared success</strong></li>
  <li style="margin-bottom:5px;"><strong>Conflict resolution</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Examples:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Team target competitions</strong></li>
  <li style="margin-bottom:5px;"><strong>Partner scoring challenges</strong></li>
  <li style="margin-bottom:5px;"><strong>Cooperative distance games</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach role:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Facilitate structure</strong></li>
  <li style="margin-bottom:5px;"><strong>Prevent dominance behavior</strong></li>
  <li style="margin-bottom:5px;"><strong>Encourage inclusion</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Collaboration increases social learning and enjoyment.</strong></p>`},    {h:`Creativity Through Constraint Variation`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 5</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Creativity Through Constraint Variation</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Creativity emerges when:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Tasks are open-ended</strong></li>
  <li style="margin-bottom:5px;"><strong>Solutions are not dictated</strong></li>
  <li style="margin-bottom:5px;"><strong>Children experiment safely</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead of:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“Use this exact swing.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Say:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“Find a way to land it inside the yellow circle.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Different children will:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Adjust stance</strong></li>
  <li style="margin-bottom:5px;"><strong>Change speed</strong></li>
  <li style="margin-bottom:5px;"><strong>Alter club angle</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Creative exploration builds adaptive skill.</strong></p>`},    {h:`Growth Mindset Integration`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 6</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Growth Mindset Integration</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>(Growth mindset principles inspired by Dweck)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children must learn:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Skill improves with effort</strong></li>
  <li style="margin-bottom:5px;"><strong>Mistakes are learning data</strong></li>
  <li style="margin-bottom:5px;"><strong>Struggle is normal</strong></li>
  <li style="margin-bottom:5px;"><strong>Comparison is secondary to improvement</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach language matters:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead of:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“You’re a natural.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Say:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“That adjustment worked because you kept trying.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Reinforce effort, not talent.</strong></p>`},    {h:`Self-Regulation &Emotional Intelligence`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 7</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Self-Regulation &amp; Emotional Intelligence</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>21st-century learning includes:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Managing frustration</strong></li>
  <li style="margin-bottom:5px;"><strong>Waiting for turn</strong></li>
  <li style="margin-bottom:5px;"><strong>Following structure</strong></li>
  <li style="margin-bottom:5px;"><strong>Responding to challenge</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Golf is ideal for this because:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>It requires patience</strong></li>
  <li style="margin-bottom:5px;"><strong>It requires control</strong></li>
  <li style="margin-bottom:5px;"><strong>It requires focus</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must model calm tone, structured routine, and positive correction.</strong></p>`},    {h:`Attention &Engagement in Modern Children`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 8</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Attention &amp; Engagement in Modern Children</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Today’s children are exposed to:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>High screen stimulation</strong></li>
  <li style="margin-bottom:5px;"><strong>Rapid content switching</strong></li>
  <li style="margin-bottom:5px;"><strong>Short attention cycles</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Therefore sessions must include:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Movement rotation every 4–5 minutes</strong></li>
  <li style="margin-bottom:5px;"><strong>Clear scoring goals</strong></li>
  <li style="margin-bottom:5px;"><strong>Immediate participation</strong></li>
  <li style="margin-bottom:5px;"><strong>Minimal idle time</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Engagement is engineered.</strong></p>`},    {h:`Reflection &Metacognition`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 9</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Reflection &amp; Metacognition</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Metacognition = Thinking about thinking.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>In wrap-up phase, ask:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>“What helped you hit farther today?”</strong></li>
  <li style="margin-bottom:5px;"><strong>“What did you change that worked?”</strong></li>
  <li style="margin-bottom:5px;"><strong>“What will you try next time?”</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This strengthens:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Self-awareness</strong></li>
  <li style="margin-bottom:5px;"><strong>Long-term retention</strong></li>
  <li style="margin-bottom:5px;"><strong>Confidence</strong></li>
  <li style="margin-bottom:5px;"><strong>Autonomy</strong></li>
</ul>`},    {h:`The Modern Coach Role`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 10</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The Modern Coach Role</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Old Model Coach:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Authority figure</strong></li>
  <li style="margin-bottom:5px;"><strong>Gives instructions</strong></li>
  <li style="margin-bottom:5px;"><strong>Controls performance</strong></li>
  <li style="margin-bottom:5px;"><strong>Corrects constantly</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>21st Century EduGolfKids Coach:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Learning facilitator</strong></li>
  <li style="margin-bottom:5px;"><strong>Environment designer</strong></li>
  <li style="margin-bottom:5px;"><strong>Question asker</strong></li>
  <li style="margin-bottom:5px;"><strong>Confidence builder</strong></li>
  <li style="margin-bottom:5px;"><strong>Structure enforcer</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>You are not a lecturer.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>You are a guided learning architect.</strong></p>`},    {h:`Practical Session Integration`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 11</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Practical Session Integration</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Example – Target Game</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead of:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“Hit 10 balls to the cone.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Use:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“You get 5 attempts. After each one, tell your partner what you adjusted.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Adds:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Reflection</strong></li>
  <li style="margin-bottom:5px;"><strong>Communication</strong></li>
  <li style="margin-bottom:5px;"><strong>Critical thinking</strong></li>
  <li style="margin-bottom:5px;"><strong>Peer interaction</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Same drill. Higher learning value.</strong></p>`},    {h:`Parent Communication Alignment`,b:`<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 12</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Parent Communication Alignment</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Parents today expect:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Structured development</strong></li>
  <li style="margin-bottom:5px;"><strong>Emotional safety</strong></li>
  <li style="margin-bottom:5px;"><strong>Confidence growth</strong></li>
  <li style="margin-bottom:5px;"><strong>Character building</strong></li>
  <li style="margin-bottom:5px;"><strong>Measurable progression</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must be able to explain:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>“We are building decision-making, confidence, and motor adaptability — not just swings.”</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This strengthens retention and brand credibility.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>COACH PRACTICAL APPLICATION</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 1 – Drill Upgrade</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach is given:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Standard hitting drill.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must redesign to include:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Critical thinking question</strong></li>
  <li style="margin-bottom:5px;"><strong>Collaboration element</strong></li>
  <li style="margin-bottom:5px;"><strong>Reflection moment</strong></li>
  <li style="margin-bottom:5px;"><strong>Growth mindset language</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 2 – Language Audit</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Deliver 3-minute instruction.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Evaluator counts:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Number of commands</strong></li>
  <li style="margin-bottom:5px;"><strong>Number of questions</strong></li>
  <li style="margin-bottom:5px;"><strong>Effort-based praise</strong></li>
  <li style="margin-bottom:5px;"><strong>Reflection prompts</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Target ratio:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>More questions than commands.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>CERTIFICATION ASSESSMENT</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Written (30%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Possible questions:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Define the 4 C’s.</strong></li>
  <li style="margin-bottom:5px;"><strong>Explain how critical thinking improves retention.</strong></li>
  <li style="margin-bottom:5px;"><strong>Provide example of growth mindset language.</strong></li>
  <li style="margin-bottom:5px;"><strong>Explain how collaboration improves engagement.</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario-Based (30%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Child frustrated after losing competition.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Apply growth mindset language</strong></li>
  <li style="margin-bottom:5px;"><strong>Reframe challenge</strong></li>
  <li style="margin-bottom:5px;"><strong>Maintain emotional safety</strong></li>
  <li style="margin-bottom:5px;"><strong>Reinforce effort</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Live Demonstration (40%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Run short game incorporating 2 of the 4 C’s</strong></li>
  <li style="margin-bottom:5px;"><strong>Use reflection question</strong></li>
  <li style="margin-bottom:5px;"><strong>Demonstrate growth mindset language</strong></li>
  <li style="margin-bottom:5px;"><strong>Maintain structure</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Automatic reassessment if:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Coach dominates talk time</strong></li>
  <li style="margin-bottom:5px;"><strong>Uses performance shaming</strong></li>
  <li style="margin-bottom:5px;"><strong>Removes collaborative structure</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>PASS REQUIREMENT</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Minimum 85%</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids certification means:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>You teach children how to think.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>How to adapt.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>How to regulate.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>How to grow.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Not just how to swing.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Final Reinforcement</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids is not just sport.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>It is:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Movement education</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Cognitive development</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Emotional regulation training</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Social skill building</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Confidence architecture</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>In a structured, scalable system.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">##</p>`},  ]},{  id:"L1_M6",  title:"Module 6 \u2014 Growth Mindset &amp; Language",  icon:"\ud83d\udcac",  sections:[    {h:`What Is Growth Mindset?`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">What Is Growth Mindset?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Growth mindset is the belief that:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Ability improves with effort</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Mistakes are part of learning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Skill develops through practice</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Struggle is normal</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Fixed mindset believes:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Talent is permanent</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Failure defines identity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Mistakes equal inability</p>
<p style="margin:0 0 10px;line-height:1.85;">EduGolfKids coaches must reinforce growth identity at all times.</p>`},    {h:`Why Language Matters in Ages 4–10`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Why Language Matters in Ages 4–10</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Children 4–10:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Form early self-concept</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Are highly approval-sensitive</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Internalize adult feedback deeply</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Attach identity to performance</p>
<p style="margin:0 0 10px;line-height:1.85;">Negative phrasing becomes internal narrative.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Example:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach says:</p>
<p style="margin:0 0 10px;line-height:1.85;">“You’re not focusing.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Child hears:</p>
<p style="margin:0 0 10px;line-height:1.85;">“I’m bad at this.”</p>
<p style="margin:0 0 10px;line-height:1.85;">Repeated language shapes long-term confidence.</p>`},    {h:`The EduGolfKids Language Code`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">The EduGolfKids Language Code</p>
<p style="margin:0 0 10px;line-height:1.85;">All certified coaches must follow the Language Code.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">APPROVED LANGUAGE</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">• “I see improvement.”</p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">“Let’s try again.”</li>
  <li style="margin-bottom:5px;">“What did you notice?”</li>
  <li style="margin-bottom:5px;">“That adjustment helped.”</li>
  <li style="margin-bottom:5px;">“You kept going.”</li>
  <li style="margin-bottom:5px;">“Good effort.”</li>
  <li style="margin-bottom:5px;">“What could you change?”</li>
  <li style="margin-bottom:5px;">“That was closer.”</li>
  <li style="margin-bottom:5px;">“Keep exploring.”</li>
  <li style="margin-bottom:5px;">“Nice adjustment.”</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Approved language:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Encourages effort</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Reinforces autonomy</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Promotes reflection</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Supports emotional safety</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Builds resilience</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">PROHIBITED LANGUAGE</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">• “That’s wrong.”</p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">“Why can’t you?”</li>
  <li style="margin-bottom:5px;">“You’re not good at this.”</li>
  <li style="margin-bottom:5px;">“No, not like that.”</li>
  <li style="margin-bottom:5px;">“You always do that.”</li>
  <li style="margin-bottom:5px;">“You’re the worst at this.”</li>
  <li style="margin-bottom:5px;">“That’s easy.”</li>
  <li style="margin-bottom:5px;">“You should know this.”</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Prohibited language:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Attacks identity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Creates shame</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Triggers anxiety</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Reduces effort</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Encourages withdrawal</p>
<p style="margin:0 0 10px;line-height:1.85;">Violation of Language Code results in reassessment.</p>`},    {h:`Correction Without Damage`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Correction Without Damage</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">When a child misses:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Instead of:</p>
<p style="margin:0 0 10px;line-height:1.85;">“That’s wrong.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Use:</p>
<p style="margin:0 0 10px;line-height:1.85;">“That one went left. What did you notice?”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Instead of:</p>
<p style="margin:0 0 10px;line-height:1.85;">“You’re doing it wrong.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Use:</p>
<p style="margin:0 0 10px;line-height:1.85;">“Let’s try a different way.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Correction should:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Describe outcome (neutral)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Encourage reflection</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Guide adjustment</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Reinforce effort</p>
<p style="margin:0 0 10px;line-height:1.85;">Language must be neutral, not emotional.</p>`},    {h:`Handling Frustration in Real Time`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Handling Frustration in Real Time</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Frustration signs:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Equipment drop</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Crossing arms</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Silence</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">“This is stupid.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Withdrawal</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Aggressive swing</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach response must:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">1️⃣ Lower tone</p>
<p style="font-weight:700;margin:16px 0 6px;color:var(--green-dark);font-size:15px;">2️⃣ Reduce task difficulty</p>
<p style="font-weight:700;margin:16px 0 6px;color:var(--green-dark);font-size:15px;">3️⃣ Use effort-based praise</p>
<p style="font-weight:700;margin:16px 0 6px;color:var(--green-dark);font-size:15px;">4️⃣ Normalize struggle</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Example:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Child says:</p>
<p style="margin:0 0 10px;line-height:1.85;">“I’m bad at this.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach:</p>
<p style="margin:0 0 10px;line-height:1.85;">“You’re learning this. That’s different. Let’s make it easier and try again.”</p>`},    {h:`Effort vs Outcome Praise`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Effort vs Outcome Praise</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Outcome Praise:</p>
<p style="margin:0 0 10px;line-height:1.85;">“Great shot!”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Effort Praise:</p>
<p style="margin:0 0 10px;line-height:1.85;">“You adjusted your stance — that helped.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Effort praise builds:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Process focus</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Resilience</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Self-awareness</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Outcome praise builds:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Performance dependency</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Fear of failure</p>
<p style="margin:0 0 10px;line-height:1.85;">Balance is critical.</p>`},    {h:`Public vs Private Correction`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Public vs Private Correction</p>
<p style="margin:0 0 10px;line-height:1.85;">Never publicly shame.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">If correction needed:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Lower voice</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Step aside</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Keep tone calm</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Avoid dramatic gestures</p>
<p style="margin:0 0 10px;line-height:1.85;">Children are highly peer-sensitive in 6–9 stage.</p>
<p style="margin:0 0 10px;line-height:1.85;">Public embarrassment can reduce long-term participation.</p>`},    {h:`The 3-Step Language Reset Rule`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">The 3-Step Language Reset Rule</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">If a coach accidentally uses harsh language:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">1️⃣ Rephrase immediately</p>
<p style="font-weight:700;margin:16px 0 6px;color:var(--green-dark);font-size:15px;">2️⃣ Model growth correction</p>
<p style="font-weight:700;margin:16px 0 6px;color:var(--green-dark);font-size:15px;">3️⃣ Reinforce confidence</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Example:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach says:</p>
<p style="margin:0 0 10px;line-height:1.85;">“No, that’s wrong.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Immediately follows with:</p>
<p style="margin:0 0 10px;line-height:1.85;">“Let me rephrase — that one went left. Let’s adjust together.”</p>
<p style="margin:0 0 10px;line-height:1.85;">Accountability protects culture.</p>`},    {h:`Parent Interaction Language`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Parent Interaction Language</p>
<p style="margin:0 0 10px;line-height:1.85;">Coaches must model growth mindset to parents.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Instead of:</p>
<p style="margin:0 0 10px;line-height:1.85;">“He struggles with distance.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Say:</p>
<p style="margin:0 0 10px;line-height:1.85;">“He’s building distance control and improving weekly.”</p>
<p style="margin:0 0 10px;line-height:1.85;">Never label a child in front of parent.</p>`},    {h:`Building Inner Voice Strength`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Building Inner Voice Strength</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Children should leave sessions thinking:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">“I can improve.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">“Mistakes are normal.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">“I’m getting better.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">“I can try again.”</p>
<p style="margin:0 0 10px;line-height:1.85;">That internal narrative lasts longer than any swing lesson.</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">COACH PRACTICAL APPLICATION</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Exercise 1 – Frustration Role Play</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must respond to:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scenario A:</p>
<p style="margin:0 0 10px;line-height:1.85;">Child misses 5 shots and says:</p>
<p style="margin:0 0 10px;line-height:1.85;">“I’m terrible.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scenario B:</p>
<p style="margin:0 0 10px;line-height:1.85;">Child loses competition and refuses to continue.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scenario C:</p>
<p style="margin:0 0 10px;line-height:1.85;">Child compares self negatively to peer.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Evaluator measures:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Tone control</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Growth language</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Task adjustment</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Emotional regulation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Exercise 2 – Language Swap Drill</p>
<p style="margin:0 0 10px;line-height:1.85;">Coach is given 10 negative phrases.</p>
<p style="margin:0 0 10px;line-height:1.85;">Must convert into growth language equivalents.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Example:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">“Why can’t you focus?”</p>
<p style="margin:0 0 10px;line-height:1.85;">→ “Let’s reset and try again.”</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">CERTIFICATION ASSESSMENT</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Written (30%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Possible questions:</p>
<p style="margin:0 0 10px;line-height:1.85;">Define growth mindset.</p>
<p style="margin:0 0 10px;line-height:1.85;">List 3 prohibited phrases.</p>
<p style="margin:0 0 10px;line-height:1.85;">Explain why outcome-only praise is risky.</p>
<p style="margin:0 0 10px;line-height:1.85;">Describe the 3-step language reset rule.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scenario-Based (30%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Case:</p>
<p style="margin:0 0 10px;line-height:1.85;">Child says, “I quit.”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Apply growth mindset language</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Adjust task</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Re-engage within 60 seconds</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Live Evaluation (40%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Run 10-minute segment</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Maintain approved language</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Avoid prohibited phrases</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Demonstrate effort-based praise</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Respond to frustration properly</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Automatic reassessment if:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Shaming language used</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Identity-based criticism</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Repeated harsh tone</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Public embarrassment behavior</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">PASS REQUIREMENT</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Minimum 85%</p>
<p style="margin:0 0 10px;line-height:1.85;">Language violations below safety threshold result in mandatory retraining.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Final Reinforcement</p>
<p style="margin:0 0 10px;line-height:1.85;">Children will forget drills.</p>
<p style="margin:0 0 10px;line-height:1.85;">They will forget scores.</p>
<p style="margin:0 0 10px;line-height:1.85;">They will not forget how you made them feel.</p>
<p style="margin:0 0 10px;line-height:1.85;">Your language becomes their internal coach.</p>
<p style="margin:0 0 10px;line-height:1.85;">EduGolfKids coaches build confidence before performance.</p>
<p style="margin:0 0 10px;line-height:1.85;">Growth mindset is not optional — it is cultural law.</p>
<p style="margin:0 0 10px;line-height:1.85;">##</p>`},  ]},{  id:"L1_M7",  title:"Module 7 \u2014 60-Minute Session Architecture",  icon:"\ud83c\udfd7\ufe0f",  sections:[    {h:`Module 7 — 60-Minute Session Architecture`,b:`<p style="margin:0 0 10px;line-height:1.85;">MODULE 7</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">60-Minute Session Architecture (Integrated Model)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Certification Study Manual – Coach Level 1</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">MODULE PURPOSE</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">This module ensures that every EduGolfKids coach can:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Deliver a structurally consistent 60-minute session</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Integrate ALL prior modules into every lesson</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Apply development, motor learning, LTAD, growth mindset, and safety principles simultaneously</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Maintain rhythm, flow, and energy</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Protect brand integrity through structure</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">Core Principle:</h3>
<p style="margin:0 0 10px;line-height:1.85;">Structure creates rhythm.</p>
<p style="margin:0 0 10px;line-height:1.85;">Rhythm creates learning.</p>
<p style="margin:0 0 10px;line-height:1.85;">Learning requires integration.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Every session must apply:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 2 – Child Development</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 3 – Motor Learning &amp; Constraints</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 4 – LTAD</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 5 – 21st Century Learning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 7 – Growth Mindset Language Code</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Safety &amp; spacing standards</p>
<p style="margin:0 0 10px;line-height:1.85;">Architecture is where theory becomes practice.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">THE NON-NEGOTIABLE TIME FRAME</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Every session must follow:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">0–10: Warm-Up Game</p>
<p style="margin:0 0 10px;line-height:1.85;">10–30: Skill Block</p>
<p style="margin:0 0 10px;line-height:1.85;">30–50: Game Reinforcement</p>
<p style="margin:0 0 10px;line-height:1.85;">50–60: Wrap-Up &amp; Reset</p>
<p style="margin:0 0 10px;line-height:1.85;">Deviation requires HQ approval.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">INTEGRATED SESSION BREAKDOWN</p>
<p style="margin:0 0 10px;line-height:1.85;">Below shows exactly where each training module is practiced inside the session.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">0–10 Minutes</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">WARM-UP GAME</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Primary Goal:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Movement activation + emotional engagement</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Modules Applied Here:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 2 – Child Development</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Short instructions (1-step for 4–6)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Immediate participation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">No long explanations</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Movement-based learning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 3 – Motor Learning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">No blocked repetition</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Target-based activity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Environmental constraints guide behavior</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 4 – LTAD</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Focus on coordination and balance</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Not technical swing correction</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 5 – 21st Century Learning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Collaboration games</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Communication prompts</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Quick reflection moments</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 7 – Growth Mindset</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Effort-based praise from first minute</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Normalize mistakes immediately</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Safety Standards</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Spacing established</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Retrieval protocol reinforced</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Foam balls only</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Warm-up sets:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Energy tone</p>
<p style="margin:0 0 10px;line-height:1.85;">Language tone</p>
<p style="margin:0 0 10px;line-height:1.85;">Behavior expectation</p>
<p style="margin:0 0 10px;line-height:1.85;">Safety expectation</p>
<p style="margin:0 0 10px;line-height:1.85;">If Warm-Up is weak, entire session declines.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">10–30 Minutes</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">SKILL BLOCK</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Primary Goal:</p>
<p style="margin:0 0 10px;line-height:1.85;">Introduce or refine skill through constraint variation.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Modules Applied Here:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 3 – Motor Learning (Primary Focus)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">3–4 mini constraint challenges (4–6 min each)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">External focus cues</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Environmental manipulation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">No technical lecture</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 2 – Child Development</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Age-appropriate instruction length</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Frustration monitoring</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Task difficulty adjusted immediately</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 4 – LTAD</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Development over aesthetics</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">No adult swing reconstruction</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Movement quality prioritized</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 5 – 21st Century Learning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Guided discovery questions</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Critical thinking prompts</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Peer feedback allowed</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 7 – Growth Mindset</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Effort reinforcement</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Language code compliance</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">No identity-based correction</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Safety</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">6-foot spacing maintained</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Controlled swing zones</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Immediate reset commands</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">This is where coaches prove:</p>
<p style="margin:0 0 10px;line-height:1.85;">They understand learning — not just drills.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">30–50 Minutes</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">GAME REINFORCEMENT</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Primary Goal:</p>
<p style="margin:0 0 10px;line-height:1.85;">Transfer skill into contextual play.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Modules Applied Here:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 3 – Motor Learning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Variable scoring</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Decision-making pressure</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Time-based challenges</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">No blocked repetition</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 5 – 21st Century Learning</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Collaboration</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Competition with respect</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Reflection in action</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Tactical decision-making</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 2 – Child Development</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Challenge calibrated to age</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Emotional regulation monitored</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Frustration redirected constructively</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 4 – LTAD</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">No overcorrection mid-game</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Allow natural movement adaptation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Avoid performance obsession</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 7 – Growth Mindset</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Reframe mistakes</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Normalize competitive loss</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Praise effort, not just winners</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Safety</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Clear rotation structure</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Retrieval protocol enforced</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Energy controlled</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Game Reinforcement is where:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Retention strengthens</p>
<p style="margin:0 0 10px;line-height:1.85;">Confidence grows</p>
<p style="margin:0 0 10px;line-height:1.85;">Autonomy develops</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">50–60 Minutes</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">WRAP-UP &amp; RESET</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Primary Goal:</p>
<p style="margin:0 0 10px;line-height:1.85;">Consolidate learning + emotional closure.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Modules Applied Here:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 5 – Reflection &amp; Metacognition</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">“What did you notice?”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">“What helped you improve?”</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Encourage child explanation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 7 – Growth Mindset</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Effort-based praise</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Reinforce improvement</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Avoid outcome-only praise</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Module 2 – Emotional Regulation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Calm tone</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Structured closure</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Positive ending</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Safety Standards</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Clubs down before retrieval</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Equipment stacked</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Clear dismissal protocol</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Children must leave:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Confident</p>
<p style="margin:0 0 10px;line-height:1.85;">Regulated</p>
<p style="margin:0 0 10px;line-height:1.85;">Successful</p>
<p style="margin:0 0 10px;line-height:1.85;">Motivated</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">FULL INTEGRATION MAP</p>
<p style="margin:0 0 10px;line-height:1.85;">| Segment | M2 Dev | M3 Motor | M4 LTAD | M5 Learning | M7 Language | Safety |</p>
<p style="margin:0 0 10px;line-height:1.85;">| --- | --- | --- | --- | --- | --- | --- |</p>
<p style="margin:0 0 10px;line-height:1.85;">| Warm-Up | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |</p>
<p style="margin:0 0 10px;line-height:1.85;">| Skill Block | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |</p>
<p style="margin:0 0 10px;line-height:1.85;">| Game Reinforcement | ✓ | ✓✓ | ✓ | ✓✓ | ✓ | ✓ |</p>
<p style="margin:0 0 10px;line-height:1.85;">| Wrap-Up | ✓ | — | ✓ | ✓✓ | ✓✓ | ✓ |</p>
<p style="margin:0 0 10px;line-height:1.85;">Every session must include all modules.</p>
<p style="margin:0 0 10px;line-height:1.85;">If a coach delivers a technically correct drill but violates language code → failure.</p>
<p style="margin:0 0 10px;line-height:1.85;">If coach manages growth mindset but ignores spacing → failure.</p>
<p style="margin:0 0 10px;line-height:1.85;">If coach teaches skill but ignores development stage → failure.</p>
<p style="margin:0 0 10px;line-height:1.85;">Integration is mandatory.</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">COACH PRACTICAL APPLICATION</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Exercise – Integrated Session Design</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must submit a 60-minute plan that clearly shows:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Where motor learning principles are applied</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Where developmental adjustments occur</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Where growth mindset language is used</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Where LTAD protection is maintained</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Where 21st-century skills are included</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Where safety standards are reinforced</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Session plan must annotate:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">“M2 Applied Here”</p>
<p style="margin:0 0 10px;line-height:1.85;">“M3 Applied Here”</p>
<p style="margin:0 0 10px;line-height:1.85;">“M7 Language Here”</p>
<p style="margin:0 0 10px;line-height:1.85;">No generic plans accepted.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">LIVE DEMONSTRATION STANDARD</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Maintain 60-minute timing discipline</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Demonstrate at least:</p>
<h4 style="color:var(--green-dark);margin:18px 0 8px;font-size:15px;font-weight:700;">2 guided discovery questions</h4>
<h4 style="color:var(--green-dark);margin:18px 0 8px;font-size:15px;font-weight:700;">1 constraint modification</h4>
<h4 style="color:var(--green-dark);margin:18px 0 8px;font-size:15px;font-weight:700;">3 effort-based language statements</h4>
<h4 style="color:var(--green-dark);margin:18px 0 8px;font-size:15px;font-weight:700;">1 reflection question</h4>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Maintain spacing entire session</p>
<p style="margin:0 0 10px;line-height:1.85;">Failure in any integration category = reassessment.</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">CERTIFICATION ASSESSMENT</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Written (30%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">List time structure without notes:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">0–10 Warm-Up</p>
<p style="margin:0 0 10px;line-height:1.85;">10–30 Skill Block</p>
<p style="margin:0 0 10px;line-height:1.85;">30–50 Game Reinforcement</p>
<p style="margin:0 0 10px;line-height:1.85;">50–60 Wrap-Up &amp; Reset</p>
<p style="margin:0 0 10px;line-height:1.85;">AND identify which modules are applied in each segment.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scenario-Based (30%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Scenario:</p>
<p style="margin:0 0 10px;line-height:1.85;">Coach delivers strong drills but gives harsh language.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Candidate must:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Identify module violation</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Redesign language</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Maintain structure</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Live Demonstration (40%)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coach must show:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Integrated execution across all modules</p>
<p style="margin:0 0 10px;line-height:1.85;">Not isolated competence.</p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">PASS REQUIREMENT</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Minimum 85%</p>
<p style="margin:0 0 10px;line-height:1.85;">Architecture mastery + integration mastery required.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Final Reinforcement</p>
<p style="margin:0 0 10px;line-height:1.85;">A great drill is not enough.</p>
<p style="margin:0 0 10px;line-height:1.85;">A positive tone is not enough.</p>
<p style="margin:0 0 10px;line-height:1.85;">A safe setup is not enough.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Only integration creates:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Safety</p>
<p style="margin:0 0 10px;line-height:1.85;">Retention</p>
<p style="margin:0 0 10px;line-height:1.85;">Confidence</p>
<p style="margin:0 0 10px;line-height:1.85;">Progression</p>
<p style="margin:0 0 10px;line-height:1.85;">Brand consistency</p>
<p style="margin:0 0 10px;line-height:1.85;">EduGolfKids is not a collection of modules.</p>
<p style="margin:0 0 10px;line-height:1.85;">It is a unified system delivered every session.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><em></em></p>`},  ]},{  id:"L1_M8",  title:"Module 8 \u2014 Parent &amp; School Communication",  icon:"\ud83e\udd1d",  sections:[    {h:`The Two Audiences: Schools and Parents`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">The Two Audiences: Schools and Parents</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids coaches operate within two distinct adult relationships simultaneously:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>1. The School Relationship</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Schools are institutional partners. They grant access to their students, facilities, and scheduling.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Every coach represents EduGolfKids as a professional vendor within a school environment.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Schools expect:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Punctuality and professionalism</strong></li>
  <li style="margin-bottom:5px;"><strong>Minimal disruption to school operations</strong></li>
  <li style="margin-bottom:5px;"><strong>Clear communication and advance notice of any changes</strong></li>
  <li style="margin-bottom:5px;"><strong>Compliance with all school policies and protocols</strong></li>
  <li style="margin-bottom:5px;"><strong>Visible safeguarding standards</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>2. The Parent Relationship</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Parents are the customers and the advocates. Their satisfaction drives enrollment, retention, and referrals.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Parents expect:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>To understand what their child is learning</strong></li>
  <li style="margin-bottom:5px;"><strong>To feel their child is safe and valued</strong></li>
  <li style="margin-bottom:5px;"><strong>To receive honest, positive progress communication</strong></li>
  <li style="margin-bottom:5px;"><strong>To be heard when they have concerns</strong></li>
  <li style="margin-bottom:5px;"><strong>To trust the program with their child</strong></li>
</ul>`},    {h:`School Communication Standards`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">School Communication Standards</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Pre-Program Requirements</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Before the first session at any school, coaches must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Introduce themselves formally to the school coordinator or principal</strong></li>
  <li style="margin-bottom:5px;"><strong>Review site-specific protocols (check-in procedures, emergency contacts, parking)</strong></li>
  <li style="margin-bottom:5px;"><strong>Confirm lesson location, access routes, and equipment storage</strong></li>
  <li style="margin-bottom:5px;"><strong>Confirm student pickup and drop-off procedures</strong></li>
  <li style="margin-bottom:5px;"><strong>Obtain emergency contact information for the site</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>During the Program</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Sign in at the front office upon every arrival — no exceptions</strong></li>
  <li style="margin-bottom:5px;"><strong>Notify school staff immediately of any incident, injury, or behavioral concern</strong></li>
  <li style="margin-bottom:5px;"><strong>Avoid scheduling conversations during active lesson time</strong></li>
  <li style="margin-bottom:5px;"><strong>Respond to school communication within 24 hours</strong></li>
  <li style="margin-bottom:5px;"><strong>Never speak negatively about the school, its staff, or its policies to parents</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Communication Tone with School Staff</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Always:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Be respectful, brief, and solution-focused</strong></li>
  <li style="margin-bottom:5px;"><strong>Thank staff for their support and cooperation</strong></li>
  <li style="margin-bottom:5px;"><strong>Confirm any changes to schedule or location in writing</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Never:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Go around the school coordinator to speak directly with a teacher about a concern</strong></li>
  <li style="margin-bottom:5px;"><strong>Make verbal agreements that bypass the official program structure</strong></li>
  <li style="margin-bottom:5px;"><strong>Discuss student behavioral issues in hallways or public spaces</strong></li>
</ul>`},    {h:`Parent Communication: Program Launch`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Parent Communication: Program Launch</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Before the first session, parents must receive:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Program overview (what EduGolfKids is, what children will learn)</strong></li>
  <li style="margin-bottom:5px;"><strong>Session schedule (day, time, location, duration)</strong></li>
  <li style="margin-bottom:5px;"><strong>Drop-off and pick-up instructions</strong></li>
  <li style="margin-bottom:5px;"><strong>What to bring (appropriate footwear, water bottle)</strong></li>
  <li style="margin-bottom:5px;"><strong>Coach name and contact method (via approved EduGolfKids channel only)</strong></li>
  <li style="margin-bottom:5px;"><strong>Safeguarding and photo/video consent confirmation</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Welcome Communication Language Example:</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>"Welcome to EduGolfKids! Your child is about to begin a structured developmental program that builds movement skills, confidence, and critical thinking through golf. Our certified coaches follow an evidence-based curriculum designed specifically for ages 4-10. Sessions are 60 minutes and follow a consistent structure every week. If you have any questions, please reach out through [approved channel]."</strong></p>`},    {h:`Progress Communication Standards`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Progress Communication Standards</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Parents want to know their child is progressing.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must provide regular, positive, developmentally framed updates.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>What to Communicate:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>What skill or concept the group is working on this week</strong></li>
  <li style="margin-bottom:5px;"><strong>Specific positive observations about the child's engagement or effort</strong></li>
  <li style="margin-bottom:5px;"><strong>How the child can practice or explore at home (optional reinforcement)</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>What NOT to Communicate:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Comparisons to other children</strong></li>
  <li style="margin-bottom:5px;"><strong>Negative ability assessments ("He struggles with...")</strong></li>
  <li style="margin-bottom:5px;"><strong>Predictions about future performance</strong></li>
  <li style="margin-bottom:5px;"><strong>Technical critiques framed as problems</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Growth Language for Parent Feedback:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead of: "She is behind the group in putting control."</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Say: "She is developing her putting feel and is showing good focus. We are working on a great constraint challenge that will accelerate this."</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Instead of: "He has trouble listening."</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Say: "He brings lots of energy — we channel that well. He is responding really well to the game-based activities."</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Language must be honest, positive, and development-framed at all times.</strong></p>`},    {h:`Handling Difficult Parent Conversations`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Handling Difficult Parent Conversations</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids coaches will inevitably encounter parents with concerns, complaints, or disagreements.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>How you handle these moments defines your professionalism and protects the program.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The 4-Step Response Protocol:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>1. Listen First</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Allow the parent to fully express their concern without interruption.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Do not become defensive. Do not justify immediately.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>2. Acknowledge</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>"I understand your concern and I appreciate you bringing this to me."</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Acknowledgment is not agreement. It is professional respect.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>3. Clarify and Explain</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Once the parent has been heard, explain the EduGolfKids approach clearly.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Use developmental reasoning, not personal opinion.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Example: Parent says: "You're not teaching proper golf technique — my son needs to fix his swing."</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Coach response: "That's a great point to raise. Our Level 1 program is specifically designed around Long-Term Athlete Development science. At this age, technical swing reconstruction actually reduces long-term potential. We focus on movement literacy and confidence now, which gives children the best foundation for technique development in later stages. We follow the same framework used by leading youth sport organizations."</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>4. Escalate When Appropriate</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>If the parent remains unsatisfied or the issue is beyond your authority:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Do not argue or escalate emotionally</strong></li>
  <li style="margin-bottom:5px;"><strong>Acknowledge their concern again</strong></li>
  <li style="margin-bottom:5px;"><strong>Advise that you will connect them with the EduGolfKids program manager</strong></li>
  <li style="margin-bottom:5px;"><strong>Never make promises you cannot keep</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Situations Requiring Immediate Escalation to HQ:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Allegations of misconduct</strong></li>
  <li style="margin-bottom:5px;"><strong>Demands for refunds or program exits</strong></li>
  <li style="margin-bottom:5px;"><strong>Threats or aggressive behavior</strong></li>
  <li style="margin-bottom:5px;"><strong>Safeguarding concerns about another adult</strong></li>
</ul>`},    {h:`Social Media and Digital Communication Policy`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Social Media and Digital Communication Policy</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Use only approved EduGolfKids communication channels for parent contact</strong></li>
  <li style="margin-bottom:5px;"><strong>Never connect with parents or students on personal social media accounts</strong></li>
  <li style="margin-bottom:5px;"><strong>Never share photos or videos of children without verified parental consent</strong></li>
  <li style="margin-bottom:5px;"><strong>Never discuss student progress or behavior in group chat formats</strong></li>
  <li style="margin-bottom:5px;"><strong>Direct all digital communication through the official EduGolfKids system</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Violations of digital communication policy are grounds for immediate certification suspension.</strong></p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">COACH PRACTICAL APPLICATION</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 1 — Difficult Parent Scenario Role Play</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Scenario A: A parent approaches after a session and says: "My daughter cried on the way home. She said you ignored her today."</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Coach must: Listen, acknowledge, investigate, explain, and respond professionally without being defensive.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario B: A parent asks why their child has not been given individual feedback on their swing.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Coach must: Explain the group developmental model and LTAD reasoning in accessible, non-jargon language.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 2 — Parent Welcome Communication Draft</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must write a pre-program welcome message to parents that:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Explains the EduGolfKids philosophy in simple language</strong></li>
  <li style="margin-bottom:5px;"><strong>Sets expectations for the session format</strong></li>
  <li style="margin-bottom:5px;"><strong>Uses growth mindset framing throughout</strong></li>
  <li style="margin-bottom:5px;"><strong>Is warm, professional, and brand-consistent</strong></li>
</ul>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">CERTIFICATION ASSESSMENT</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Written (30%)</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>List 3 things parents must be informed of before the first session.</strong></li>
  <li style="margin-bottom:5px;"><strong>Describe the 4-step difficult parent response protocol.</strong></li>
  <li style="margin-bottom:5px;"><strong>Rewrite a negative parent feedback statement using growth language.</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario-Based (30%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach is given a challenging parent interaction scenario and must demonstrate appropriate response.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Live Demonstration (40%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach participates in a live role play parent interaction covering:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Welcome communication delivery</strong></li>
  <li style="margin-bottom:5px;"><strong>Handling a concern professionally</strong></li>
  <li style="margin-bottom:5px;"><strong>Escalation decision-making</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Automatic reassessment if:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Coach becomes defensive or argumentative</strong></li>
  <li style="margin-bottom:5px;"><strong>Negative child labeling used</strong></li>
  <li style="margin-bottom:5px;"><strong>Unapproved digital communication methods referenced</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>MINIMUM PASS: 85%</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Final Reinforcement</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Parents do not just enroll their child in a program.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>They place their trust in a coach.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Every communication you have — before, during, and after sessions — either builds or erodes that trust.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Professional communication is non-negotiable.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>It is part of your certification.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><em></em></p>`},  ]},{  id:"L1_M9",  title:"Module 9 \u2014 Group Management",  icon:"\ud83d\udc65",  sections:[    {h:`Why Group Management Matters`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Why Group Management Matters</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>In a school-based program, coaches are not just instructors — they are temporary classroom managers.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children arrive from classrooms with existing energy levels, social dynamics, and behavioral patterns.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Without strong group management:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Safety protocols break down</strong></li>
  <li style="margin-bottom:5px;"><strong>Engagement collapses</strong></li>
  <li style="margin-bottom:5px;"><strong>Individual children dominate or disengage</strong></li>
  <li style="margin-bottom:5px;"><strong>Learning stops</strong></li>
  <li style="margin-bottom:5px;"><strong>Incidents increase</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Strong group management creates:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Predictable, safe learning environments</strong></li>
  <li style="margin-bottom:5px;"><strong>High participation rates</strong></li>
  <li style="margin-bottom:5px;"><strong>Reduced behavioral disruption</strong></li>
  <li style="margin-bottom:5px;"><strong>Consistent skill development</strong></li>
  <li style="margin-bottom:5px;"><strong>Positive session culture</strong></li>
</ul>`},    {h:`Establishing Authority Through Structure`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Establishing Authority Through Structure</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Authority is not established through volume or dominance.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>It is established through consistency, clarity, and calm confidence.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The Three Foundations of Coach Authority:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>1. Predictable Routine</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Children respond to predictability. When they know what to expect, anxiety drops and compliance increases.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Every session must start, transition, and end in exactly the same way.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Opening Routine (First 90 Seconds):</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Children arrive and stand behind designated line or cones</strong></li>
  <li style="margin-bottom:5px;"><strong>Coach greets group by name — builds connection and takes visual attendance</strong></li>
  <li style="margin-bottom:5px;"><strong>Coach states session theme in one sentence using child language</strong></li>
  <li style="margin-bottom:5px;"><strong>Coach reviews one safety rule (rotate the rule weekly)</strong></li>
  <li style="margin-bottom:5px;"><strong>Warm-up game is introduced immediately — no waiting</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>2. Clear Signals and Commands</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids coaches must establish and consistently use standard verbal commands.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Required Standard Commands:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>"FREEZE" — All movement stops immediately. Clubs on ground.</strong></li>
  <li style="margin-bottom:5px;"><strong>"RESET" — Return to starting position. No club in hand.</strong></li>
  <li style="margin-bottom:5px;"><strong>"RETRIEVE" — Walk (do not run) to collect balls. Clubs down first.</strong></li>
  <li style="margin-bottom:5px;"><strong>"ROTATE" — Move to next station. Follow direction indicated.</strong></li>
  <li style="margin-bottom:5px;"><strong>"EYES ON ME" — Stop, look at coach, listening position.</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Commands must be practiced in the first session of every new group.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Never assume children from different schools have been trained on the same commands.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>3. Consistent Consequences</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children must understand that rules apply equally to everyone, every time.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Inconsistent enforcement is the fastest way to lose group control.</strong></p>`},    {h:`The Behavior Management Ladder`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">The Behavior Management Ladder</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids uses a 5-step escalation model. Always begin at Step 1.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Step 1: Environmental Adjustment</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Before addressing behavior directly, adjust the environment.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Many disruptive behaviors are caused by:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Too much wait time</strong></li>
  <li style="margin-bottom:5px;"><strong>Task that is too hard or too easy</strong></li>
  <li style="margin-bottom:5px;"><strong>Poor spacing creating crowding</strong></li>
  <li style="margin-bottom:5px;"><strong>Overstimulation from too many instructions</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Fix the environment first. Most disruption disappears.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Step 2: Proximity and Non-Verbal Cue</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Move physically closer to the disruptive child.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Use eye contact and a calm nod or gesture.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Do not call out the child publicly.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Many children self-correct with proximity alone.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Step 3: Private Verbal Redirect</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Crouch to the child's level. Speak quietly — not in front of the group.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>"Hey, I need you to [specific behavior]. You can do that — let's keep going."</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Describe the desired behavior, not the problem behavior.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Step 4: Choice and Consequence</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>If the behavior continues after Steps 1-3:</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>"I need you to [behavior]. If you continue, you will take a 2-minute break from the activity. It's your choice."</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>This maintains dignity and gives the child agency.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Step 5: Removal and Documentation</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>If behavior continues or poses a safety risk:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Remove child to a supervised seated area — never unsupervised</strong></li>
  <li style="margin-bottom:5px;"><strong>Notify school staff immediately</strong></li>
  <li style="margin-bottom:5px;"><strong>Document the incident within 24 hours per incident reporting protocol</strong></li>
  <li style="margin-bottom:5px;"><strong>Contact parent via approved channel after the session</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Physical restraint is NEVER permitted under any circumstance.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>If a child poses immediate physical danger, activate the school Emergency Action Plan immediately.</strong></p>`},    {h:`Managing Common Group Scenarios`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Managing Common Group Scenarios</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario 1: Children arrive chaotic and over-energized</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Solution: Do NOT try to calm with instructions. Channel the energy.</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Begin the warm-up game immediately</strong></li>
  <li style="margin-bottom:5px;"><strong>Use a high-energy, structured activity with clear roles</strong></li>
  <li style="margin-bottom:5px;"><strong>Establish commands within the first 3 minutes of the game</strong></li>
  <li style="margin-bottom:5px;"><strong>Energy will regulate naturally within 5-7 minutes of structured movement</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario 2: One child dominates, others disengage</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Solution: Structural fix — not behavioral correction.</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Redesign activity to remove single-winner format</strong></li>
  <li style="margin-bottom:5px;"><strong>Assign specific roles to quieter children (scorekeeper, cone placer)</strong></li>
  <li style="margin-bottom:5px;"><strong>Use team formats that spread involvement</strong></li>
  <li style="margin-bottom:5px;"><strong>Privately acknowledge the dominant child's energy positively and redirect: "I need your leadership skills to help the team."</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario 3: Child refuses to participate</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Do not force participation. Forcing increases resistance.</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Acknowledge without pressure: "That's okay — you can watch for now."</strong></li>
  <li style="margin-bottom:5px;"><strong>Reduce task difficulty and re-invite in 2-3 minutes</strong></li>
  <li style="margin-bottom:5px;"><strong>Use a peer invitation: "Can you show [child] how it works?"</strong></li>
  <li style="margin-bottom:5px;"><strong>If persistent refusal, check for frustration, fatigue, or emotional distress</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario 4: Physical altercation or aggressive behavior between children</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Immediately use FREEZE command for entire group</strong></li>
  <li style="margin-bottom:5px;"><strong>Position yourself between the children — do not touch unless safety requires</strong></li>
  <li style="margin-bottom:5px;"><strong>Redirect the group to a safe task</strong></li>
  <li style="margin-bottom:5px;"><strong>Separate involved children to supervised areas</strong></li>
  <li style="margin-bottom:5px;"><strong>Notify school staff immediately</strong></li>
  <li style="margin-bottom:5px;"><strong>Document within 24 hours</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario 5: A child becomes emotionally distressed or cries</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Lower your voice and physically crouch to child's level</strong></li>
  <li style="margin-bottom:5px;"><strong>Do not rush the child or create time pressure</strong></li>
  <li style="margin-bottom:5px;"><strong>"It's okay to feel frustrated. Take a moment."</strong></li>
  <li style="margin-bottom:5px;"><strong>Do not call attention from the group</strong></li>
  <li style="margin-bottom:5px;"><strong>Allow child to re-enter when ready — never pressure re-entry</strong></li>
  <li style="margin-bottom:5px;"><strong>If distress is prolonged or concerning, notify school staff</strong></li>
</ul>`},    {h:`Transitions: The Highest Risk Moments`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Transitions: The Highest Risk Moments</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Behavioral problems most commonly occur during transitions:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Moving between warm-up and skill block</strong></li>
  <li style="margin-bottom:5px;"><strong>Rotating between stations</strong></li>
  <li style="margin-bottom:5px;"><strong>Ball retrieval</strong></li>
  <li style="margin-bottom:5px;"><strong>Moving from session area to return to classroom</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Transition Protocol:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Use FREEZE command before every transition</strong></li>
  <li style="margin-bottom:5px;"><strong>Give one clear instruction for the transition: "In 10 seconds, we are rotating to the red cones."</strong></li>
  <li style="margin-bottom:5px;"><strong>Count down out loud: "10... 5... 3... 2... 1... ROTATE."</strong></li>
  <li style="margin-bottom:5px;"><strong>Walk — never allow running during transitions</strong></li>
  <li style="margin-bottom:5px;"><strong>Verify all children have arrived at new station before resuming</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Sloppy transitions cost 5-10 minutes of session time and elevate injury risk significantly.</strong></p>`},    {h:`Attention Management Techniques`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Attention Management Techniques</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids coaches must maintain group attention without relying on shouting.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Proven Techniques:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Call and Response</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Train the group in a call-and-response signal in the first session.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Example: Coach calls "Golf time!" — children respond "Focus time!"</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Use consistently. Children learn rapidly and enjoy the ritual.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Countdown Method</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>"I need everyone ready in 5... 4... 3... 2... 1."</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Spoken calmly — never as a threat. Works consistently across all age groups.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Whisper Technique</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>When the group is loud, lower your voice rather than raise it.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children instinctively quiet to hear. Effective and models emotional regulation.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The Pause</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Stop all instruction. Stand still. Make eye contact. Wait.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Silence draws attention faster than volume.</strong></p>`},    {h:`Bathroom and Water Break Protocol`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Bathroom and Water Break Protocol</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>These are high-vulnerability moments for supervision lapses.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Water Breaks:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Scheduled — not on demand during skill activities</strong></li>
  <li style="margin-bottom:5px;"><strong>Entire group breaks together</strong></li>
  <li style="margin-bottom:5px;"><strong>Coach remains in active supervision position</strong></li>
  <li style="margin-bottom:5px;"><strong>No club handling during water break</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Bathroom Requests:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Child must request directly to coach</strong></li>
  <li style="margin-bottom:5px;"><strong>Coach must notify school staff — a child never walks to the bathroom alone</strong></li>
  <li style="margin-bottom:5px;"><strong>A school staff member or teacher escorts the child</strong></li>
  <li style="margin-bottom:5px;"><strong>Coach never escorts a child to the bathroom alone</strong></li>
  <li style="margin-bottom:5px;"><strong>If school staff unavailable, session is paused and EAP protocol consulted</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Zero-Unsupervised-Child Standard applies to bathroom and water break situations.</strong></p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">COACH PRACTICAL APPLICATION</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 1 — Command Establishment Drill</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must successfully train a simulated group on all 5 standard commands within 5 minutes.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Evaluator measures: Clarity of command, group compliance rate, calm authority tone.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 2 — Behavior Scenario Response</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach is given 3 behavioral scenarios and must demonstrate the correct ladder step response for each.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 3 — Transition Management</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must execute a full station rotation with a simulated group of 8 children.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Evaluator measures: Use of FREEZE, count-down, walking only, full group accountability before resuming.</strong></p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">CERTIFICATION ASSESSMENT</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Written (30%)</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>List the 5 standard EduGolfKids commands and when each is used.</strong></li>
  <li style="margin-bottom:5px;"><strong>Describe the 5-step Behavior Management Ladder.</strong></li>
  <li style="margin-bottom:5px;"><strong>Explain why transitions are high-risk moments.</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario-Based (30%)</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Coach is given a written group management scenario and must identify the correct ladder step and response.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Live Demonstration (40%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must manage a simulated group of 8 through a 15-minute session segment, demonstrating:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Command establishment</strong></li>
  <li style="margin-bottom:5px;"><strong>At least one behavior redirect using the ladder</strong></li>
  <li style="margin-bottom:5px;"><strong>Full transition protocol</strong></li>
  <li style="margin-bottom:5px;"><strong>Consistent calm authority tone</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Automatic reassessment if:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Shouting or aggressive tone used</strong></li>
  <li style="margin-bottom:5px;"><strong>Child left unsupervised during transition or bathroom request</strong></li>
  <li style="margin-bottom:5px;"><strong>Physical contact used as behavioral control</strong></li>
  <li style="margin-bottom:5px;"><strong>Public shaming or humiliation</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>MINIMUM PASS: 85%</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Final Reinforcement</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The best coaches are not the loudest coaches.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>They are the most consistent, the most calm, and the most structured.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>When children know what to expect, they behave accordingly.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Build the environment. Train the commands. Hold the structure.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Group management is not control — it is engineering conditions for learning.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><em></em></p>`},  ]},{  id:"L1_M10",  title:"Module 10 \u2014 Medical, Special Needs &amp; Inclusion",  icon:"\u2764\ufe0f",  sections:[    {h:`Legal Framework (United States)`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Legal Framework (United States)</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids programs operating within school environments are subject to federal law.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must understand the following frameworks:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Americans with Disabilities Act (ADA)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Requires reasonable accommodations for children with disabilities.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches may not exclude a child solely on the basis of a disability.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Reasonable modifications to tasks, equipment, and session structure are required.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Section 504 (Rehabilitation Act)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Children in schools with a 504 Plan have documented accommodations.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches must request and review any 504 Plan relevant to a participating child.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches do not write 504 Plans — but they must honor them.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Title IX (Education Amendments Act)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Prohibits discrimination based on sex in any education program receiving federal funding.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>All EduGolfKids sessions must be equally accessible regardless of gender.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>IDEA (Individuals with Disabilities Education Act)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Some children in your sessions may have an IEP (Individualized Education Program).</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches are not IEP implementers but must be aware of documented behavioral and learning supports.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Consult with school staff before the program begins if IEP-enrolled children are participating.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>When in doubt about legal obligations, contact EduGolfKids HQ before the program launches.</strong></p>`},    {h:`Pre-Program Medical & Needs Screening`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Pre-Program Medical &amp; Needs Screening</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Before the first session, coaches must review registration information for:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Documented medical conditions (asthma, epilepsy, diabetes, heart conditions, severe allergies)</strong></li>
  <li style="margin-bottom:5px;"><strong>Physical limitations or mobility considerations</strong></li>
  <li style="margin-bottom:5px;"><strong>Behavioral diagnoses (ADHD, autism spectrum, anxiety disorders)</strong></li>
  <li style="margin-bottom:5px;"><strong>Sensory processing sensitivities</strong></li>
  <li style="margin-bottom:5px;"><strong>IEP or 504 Plan status</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>If a child has a documented medical condition:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Verify emergency medication location and administration protocol with school nurse</strong></li>
  <li style="margin-bottom:5px;"><strong>Know the child's specific triggers and warning signs</strong></li>
  <li style="margin-bottom:5px;"><strong>Know the response procedure if a medical event occurs</strong></li>
  <li style="margin-bottom:5px;"><strong>Ensure this information is in the coach's EAP card</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches do not diagnose or assess medical conditions.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches prepare and respond — they do not diagnose.</strong></p>`},    {h:`Common Medical Situations and Response Protocol`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Common Medical Situations and Response Protocol</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Asthma Attack</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Signs: Wheezing, shortness of breath, chest tightness, coughing, inability to speak full sentences.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Response:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Stop activity immediately. Sit child in upright position.</strong></li>
  <li style="margin-bottom:5px;"><strong>Retrieve child's inhaler if prescribed — coach does NOT administer unless trained</strong></li>
  <li style="margin-bottom:5px;"><strong>Call school nurse immediately</strong></li>
  <li style="margin-bottom:5px;"><strong>If symptoms worsen or child cannot breathe — call 911</strong></li>
  <li style="margin-bottom:5px;"><strong>Stay with child. Document incident.</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Diabetic Emergency (Hypoglycemia — Low Blood Sugar)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Signs: Dizziness, shaking, confusion, pale skin, sudden fatigue, sweating.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Response:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Stop activity immediately</strong></li>
  <li style="margin-bottom:5px;"><strong>If child is conscious — provide glucose source per school nurse guidance</strong></li>
  <li style="margin-bottom:5px;"><strong>Call school nurse immediately</strong></li>
  <li style="margin-bottom:5px;"><strong>Do not leave child unattended</strong></li>
  <li style="margin-bottom:5px;"><strong>If unconscious or unresponsive — call 911 immediately</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Seizure</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Signs: Uncontrolled shaking, loss of consciousness, staring episode, confusion.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Response:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Protect child from injury — clear area, do not restrain</strong></li>
  <li style="margin-bottom:5px;"><strong>Do NOT put anything in the child's mouth</strong></li>
  <li style="margin-bottom:5px;"><strong>Call 911 and school nurse simultaneously</strong></li>
  <li style="margin-bottom:5px;"><strong>Time the seizure — report duration to medical personnel</strong></li>
  <li style="margin-bottom:5px;"><strong>Place in recovery position after shaking stops if trained to do so</strong></li>
  <li style="margin-bottom:5px;"><strong>Stay with child. Never leave.</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Allergic Reaction / Anaphylaxis</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Signs: Hives, swelling (lips, throat, face), difficulty breathing, vomiting.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Response:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Call 911 immediately for any respiratory symptoms</strong></li>
  <li style="margin-bottom:5px;"><strong>Locate EpiPen if prescribed — school nurse administers</strong></li>
  <li style="margin-bottom:5px;"><strong>Do not give food or liquid</strong></li>
  <li style="margin-bottom:5px;"><strong>Keep child calm and seated upright</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Head Injury</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Signs: Any direct impact to head during session — regardless of apparent severity.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Response:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Stop activity immediately for the affected child</strong></li>
  <li style="margin-bottom:5px;"><strong>Do NOT allow child to return to activity that day — zero-tolerance concussion protocol</strong></li>
  <li style="margin-bottom:5px;"><strong>Notify school nurse</strong></li>
  <li style="margin-bottom:5px;"><strong>Contact parent same day</strong></li>
  <li style="margin-bottom:5px;"><strong>Document incident within 24 hours</strong></li>
  <li style="margin-bottom:5px;"><strong>Medical clearance required before return to EduGolfKids sessions</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Heat-Related Illness (Outdoor Sessions)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Signs: Heavy sweating, dizziness, nausea, cool pale skin, weakness.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Response:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Move child to shade or cool area immediately</strong></li>
  <li style="margin-bottom:5px;"><strong>Provide water — small, frequent sips</strong></li>
  <li style="margin-bottom:5px;"><strong>Call nurse if symptoms persist beyond 5 minutes</strong></li>
  <li style="margin-bottom:5px;"><strong>Modify or end outdoor session if heat index exceeds safe threshold</strong></li>
</ul>`},    {h:`Coaching Children with ADHD`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coaching Children with ADHD</p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>ADHD (Attention Deficit Hyperactivity Disorder) is the most commonly encountered neurodevelopmental condition in youth sport settings.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>What to expect:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Difficulty sustaining attention beyond 5-8 minutes on one task</strong></li>
  <li style="margin-bottom:5px;"><strong>Impulsive movement and verbal outbursts</strong></li>
  <li style="margin-bottom:5px;"><strong>Difficulty waiting for turns</strong></li>
  <li style="margin-bottom:5px;"><strong>High physical energy and restlessness</strong></li>
  <li style="margin-bottom:5px;"><strong>Emotional dysregulation — frustration escalates faster</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>What EduGolfKids structure already does well for ADHD:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Short task rotations every 4-5 minutes — ideal for attention management</strong></li>
  <li style="margin-bottom:5px;"><strong>High movement content — channels hyperactive energy</strong></li>
  <li style="margin-bottom:5px;"><strong>Clear commands and predictable structure — reduces anxiety</strong></li>
  <li style="margin-bottom:5px;"><strong>Game-based learning — sustains engagement longer than instruction</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Additional coaching adjustments for ADHD:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Position the child close to the coach at the start of each segment</strong></li>
  <li style="margin-bottom:5px;"><strong>Give instructions one step at a time — not multi-part</strong></li>
  <li style="margin-bottom:5px;"><strong>Use the child's name before giving them a specific instruction</strong></li>
  <li style="margin-bottom:5px;"><strong>Privately warn the child before transitions: "In 2 minutes we are moving. You're going to do great."</strong></li>
  <li style="margin-bottom:5px;"><strong>Acknowledge even small compliance immediately: "Great — clubs down. Thank you."</strong></li>
  <li style="margin-bottom:5px;"><strong>Do not single out or reprimand publicly</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>ADHD behavior is neurological — not defiance. Coach response must reflect this understanding.</strong></p>`},    {h:`Coaching Children on the Autism Spectrum`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coaching Children on the Autism Spectrum</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Autism Spectrum Disorder (ASD) presents differently in every child.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaches should not make assumptions based on label alone.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Consult with parents and school staff before the program begins.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Common considerations:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Sensitivity to loud sounds, unexpected touch, or sudden changes</strong></li>
  <li style="margin-bottom:5px;"><strong>Strong preference for routine and predictability</strong></li>
  <li style="margin-bottom:5px;"><strong>Difficulty with abstract language or idioms</strong></li>
  <li style="margin-bottom:5px;"><strong>May need additional processing time before responding</strong></li>
  <li style="margin-bottom:5px;"><strong>May have specific sensory sensitivities to equipment, surfaces, or noise</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coaching adjustments:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Pre-inform the child of the session structure at the start: "Here is what we will do today."</strong></li>
  <li style="margin-bottom:5px;"><strong>Avoid sudden changes to routine — announce early if a change is coming</strong></li>
  <li style="margin-bottom:5px;"><strong>Use literal, concrete language — avoid analogies that may confuse</strong></li>
  <li style="margin-bottom:5px;"><strong>Allow additional processing time after instructions — do not rush response</strong></li>
  <li style="margin-bottom:5px;"><strong>Reduce sensory triggers where possible (quieter tone, visual cues, consistent equipment)</strong></li>
  <li style="margin-bottom:5px;"><strong>Never force physical contact — follow the child's lead completely</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Many children on the spectrum thrive in structured, movement-based environments.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids sessions — with their predictable architecture — are naturally well-suited.</strong></p>`},    {h:`Coaching Children with Physical Limitations`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Coaching Children with Physical Limitations</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids is committed to meaningful participation for all children.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The Constraints-Led Approach makes EduGolfKids naturally adaptable.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Modification Principles:</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>1. Modify the task, not the child.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Never draw attention to a child's limitation. Adjust the activity structure silently and naturally.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>2. Use equipment modification.</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Shorter club for limited mobility</strong></li>
  <li style="margin-bottom:5px;"><strong>Larger target for reduced coordination</strong></li>
  <li style="margin-bottom:5px;"><strong>Tee height adjustment for balance challenges</strong></li>
  <li style="margin-bottom:5px;"><strong>Seated hitting station if standing is difficult</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>3. Modify the scoring system.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Create scoring systems where all participation produces positive outcomes regardless of physical output.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>4. Never exclude.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>If an activity cannot be safely modified for a child's limitation, find a meaningful adjacent role — scorekeeper, target placer, team captain.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Full exclusion from any activity is a last resort and must be documented.</strong></p>`},    {h:`Anxiety and Emotional Sensitivity`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Anxiety and Emotional Sensitivity</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Many children experience performance anxiety, social anxiety, or generalized worry.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Youth sport environments can trigger anxiety in children who fear failure, judgment, or public mistakes.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Signs of anxiety in session:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Reluctance or refusal to participate</strong></li>
  <li style="margin-bottom:5px;"><strong>Physical complaints (stomach aches, headaches) at the start of session</strong></li>
  <li style="margin-bottom:5px;"><strong>Clingy behavior or need for reassurance</strong></li>
  <li style="margin-bottom:5px;"><strong>Crying before or during activities</strong></li>
  <li style="margin-bottom:5px;"><strong>Extreme fear of making mistakes</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids coaching approach already addresses anxiety through:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Psychological safety as a core principle (Module 1)</strong></li>
  <li style="margin-bottom:5px;"><strong>Growth mindset language (Module 6)</strong></li>
  <li style="margin-bottom:5px;"><strong>Non-punitive, non-comparative structure</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Additional adjustments for anxious children:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Allow observation before participation — never force entry into activity</strong></li>
  <li style="margin-bottom:5px;"><strong>Reduce stakes of first attempts: "This is just a practice round — no score."</strong></li>
  <li style="margin-bottom:5px;"><strong>Celebrate first participation privately before publicly</strong></li>
  <li style="margin-bottom:5px;"><strong>Check in one-on-one during transition moments: "How's it going? You're doing well."</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>If anxiety appears severe, persistent, or escalating, notify the parent and school counselor.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Do not attempt to diagnose or treat anxiety. Coach, observe, communicate.</strong></p>`},    {h:`Communicating with Parents about Special Needs`,b:`<div class="doc-section-divider"></div>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);">Communicating with Parents about Special Needs</p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Parents of children with special needs often have heightened concerns about how their child will be treated.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>First contact with these parents is critical.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Before the program:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Request a brief conversation with the parent to understand the child's specific needs, triggers, and successful strategies</strong></li>
  <li style="margin-bottom:5px;"><strong>Ask: "What helps your child feel comfortable and successful in a new activity?"</strong></li>
  <li style="margin-bottom:5px;"><strong>Ask: "Is there anything I should know to make this experience great for them?"</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>During the program:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Provide more frequent brief updates: "Just wanted to let you know — today was a great session for [child]."</strong></li>
  <li style="margin-bottom:5px;"><strong>Frame all communication in developmental language</strong></li>
  <li style="margin-bottom:5px;"><strong>If a challenging situation occurs, inform the parent the same day</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Never:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Communicate diagnosis or behavioral observations in written group communication</strong></li>
  <li style="margin-bottom:5px;"><strong>Share a child's special needs status with other parents or children</strong></li>
  <li style="margin-bottom:5px;"><strong>Use a child's diagnosis as an explanation in front of peers</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Confidentiality of special needs information is an absolute standard.</strong></p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">COACH PRACTICAL APPLICATION</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 1 — Medical Response Drill</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach is given a medical scenario (asthma attack during outdoor session).</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Must demonstrate: correct immediate response, group management during incident, documentation awareness.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 2 — Inclusion Design Challenge</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach is given a standard EduGolfKids drill and must redesign it to be fully inclusive for:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>A child with ADHD</strong></li>
  <li style="margin-bottom:5px;"><strong>A child with a mobility limitation</strong></li>
  <li style="margin-bottom:5px;"><strong>A child with high anxiety</strong></li>
</ul>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Evaluator measures: Inclusion without exclusion, task integrity maintained, no child singled out negatively.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Exercise 3 — Parent Communication Scenario</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Coach must draft a communication to the parent of a child with ASD following the first session, using growth language and appropriate confidentiality standards.</strong></p>
<h3 style="color:var(--green-dark);border-bottom:2px solid var(--green-light);padding-bottom:8px;margin:24px 0 12px;font-size:16px;">CERTIFICATION ASSESSMENT</h3>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Written (30%)</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Describe the correct response to a seizure in a session setting.</strong></li>
  <li style="margin-bottom:5px;"><strong>List 3 coaching adjustments for a child with ADHD.</strong></li>
  <li style="margin-bottom:5px;"><strong>Explain the modification principle "modify the task, not the child."</strong></li>
  <li style="margin-bottom:5px;"><strong>What is the difference between ADA accommodation and IEP implementation?</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario-Based (30%)</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Coach is given an inclusion design scenario and must demonstrate appropriate adjustments across physical, cognitive, and emotional needs.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Live Demonstration (40%)</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Coach must run a 10-minute inclusive session segment designed for a mixed-needs group, demonstrating:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Proactive inclusion design</strong></li>
  <li style="margin-bottom:5px;"><strong>Growth mindset language</strong></li>
  <li style="margin-bottom:5px;"><strong>At least one visible accommodation without singling out the child</strong></li>
  <li style="margin-bottom:5px;"><strong>Correct response to a prompted simulated medical moment</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Automatic reassessment if:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;"><strong>Child with special needs excluded from any activity without documented justification</strong></li>
  <li style="margin-bottom:5px;"><strong>Medical response protocol violated</strong></li>
  <li style="margin-bottom:5px;"><strong>Confidential needs information referenced publicly</strong></li>
  <li style="margin-bottom:5px;"><strong>Discriminatory language or behavior observed</strong></li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>MINIMUM PASS: 85%</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Final Reinforcement</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Inclusion is not charity. It is standard.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Every child in your session deserves full access to the EduGolfKids experience.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The Constraints-Led Approach gives you the tools.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The Language Code gives you the voice.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Your preparation gives you the confidence.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>There is no child who cannot participate in a well-designed EduGolfKids session.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Design the environment. Know your children. Coach every one of them.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><em></em></p>`},  ]},{  id:"L1_M11",  title:"Module 11 \u2014 Field Safety",  icon:"\u26c8\ufe0f",  sections:[    {h:`Module 11 — Field Safety`,b:`<p style="margin:0 0 10px;line-height:1.85;">MODULE 11<em></em></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>OPERATIONAL FIELD SAFETY — WEATHER, ENVIRONMENT &amp; EMERGENCY RESPONSE</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Certification Study Manual — Coach Level 1</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>MODULE PURPOSE</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">This module trains coaches to:</p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Identify and respond to weather hazards — specifically lightning, extreme heat, wind, and rain — before and during sessions</li>
  <li style="margin-bottom:5px;">Execute the EduGolfKids Weather Decision Framework correctly every time</li>
  <li style="margin-bottom:5px;">Understand the 30/30 Lightning Safety Rule and apply it without hesitation</li>
  <li style="margin-bottom:5px;">Manage safe and calm evacuation of children from a field or outdoor environment</li>
  <li style="margin-bottom:5px;">Respond to a first aid incident during a session, including seizure, anaphylaxis, and suspected concussion</li>
  <li style="margin-bottom:5px;">Complete all post-incident documentation requirements within the required timeframe</li>
</ul>
<p style="margin:0 0 10px;line-height:1.85;"><strong>⚠  SAFETY IS NOT OPTIONAL. A coach who ignores a weather warning is liable. A coach who panics creates danger. This module trains you to be calm, decisive, and correct every time.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 1 — THE WEATHER DECISION FRAMEWORK</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Every EduGolfKids coach must check the weather before every outdoor session. This is not optional — it is a non-negotiable pre-session duty.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Pre-Session Weather Check — Required Steps:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Check the weather forecast minimum 2 hours before session start</li>
  <li style="margin-bottom:5px;">Use a reliable app — Weather.com, Weather Underground, or your local national weather service</li>
  <li style="margin-bottom:5px;">Check specifically for: lightning risk, wind speed, temperature, and precipitation</li>
  <li style="margin-bottom:5px;">If thunderstorms are forecast within a 4-hour window of your session — begin contingency planning immediately</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>RULE: When in doubt, move indoors or postpone. Never wait for lightning to appear before acting.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The Three-Option Decision Matrix:</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">When weather conditions are uncertain or deteriorating, apply the following in order:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>OPTION 1 — PROCEED OUTDOORS</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Sky is clear or partly cloudy</li>
  <li style="margin-bottom:5px;">No thunderstorm forecast within 4 hours</li>
  <li style="margin-bottom:5px;">Wind is manageable — equipment and children are not at risk</li>
  <li style="margin-bottom:5px;">Temperature is within safe operating range (see Section 2)</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>OPTION 2 — MOVE INDOORS</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Thunderstorms forecast within 4 hours</li>
  <li style="margin-bottom:5px;">Wind speed makes equipment unsafe or children uncomfortable</li>
  <li style="margin-bottom:5px;">Light rain that makes outdoor delivery impractical</li>
  <li style="margin-bottom:5px;">Extreme heat — indoor air-conditioned environment preferred</li>
</ul>
<p style="margin:0 0 10px;line-height:1.85;">→ Proceed with a modified indoor session using foam balls and shortened distances</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>OPTION 3 — POSTPONE / CANCEL</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Active thunderstorm in the area</li>
  <li style="margin-bottom:5px;">School has closed or restricted outdoor access due to weather</li>
  <li style="margin-bottom:5px;">Extreme weather event — tornado warning, flash flood, severe storm watch</li>
  <li style="margin-bottom:5px;">Indoor space is unavailable and conditions make any delivery unsafe</li>
</ul>
<p style="margin:0 0 10px;line-height:1.85;">→ Immediately notify school contact and parents via agreed communication channel</p>
<p style="margin:0 0 10px;line-height:1.85;">→ Reschedule within the same billing month where possible</p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>⚠  A cancelled session without rescheduling represents lost revenue and a broken commitment to schools. Always reschedule — do not simply cancel.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 2 — LIGHTNING SAFETY: THE 30/30 RULE</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>Lightning is the single most serious weather hazard for outdoor golf sessions. Children holding metal clubs are at elevated risk.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>The 30/30 Rule — Memorise This:</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>30 SECONDS: If the time between a lightning flash and thunder is 30 seconds or less — evacuate immediately. The storm is within 6 miles.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>30 MINUTES: Do not resume outdoor activity until 30 minutes after the last lightning flash or thunder. Not 10 minutes. Not 20. 30 full minutes.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Lightning Evacuation Protocol — Step by Step:</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">As soon as you observe lightning or hear thunder within 30 seconds:</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>STEP 1 — CALL IT</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Blow your whistle three times — the EduGolfKids universal stop signal</li>
  <li style="margin-bottom:5px;">Use a calm, firm voice: "Everyone stop. Clubs on the ground. Come to me now."</li>
  <li style="margin-bottom:5px;">Do not run. Walk briskly and calmly. Your tone controls the group's reaction.</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>STEP 2 — GROUND ALL EQUIPMENT</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">All clubs must be placed flat on the ground immediately</li>
  <li style="margin-bottom:5px;">No child carries a club during evacuation — ever</li>
  <li style="margin-bottom:5px;">Do not carry clubs yourself — leave them on the field</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>STEP 3 — MOVE TO SHELTER</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Direct children to the nearest substantial building — school building preferred</li>
  <li style="margin-bottom:5px;">A hard-topped vehicle is an acceptable secondary shelter</li>
  <li style="margin-bottom:5px;">Do NOT shelter under trees, near fences, near flagpoles, or in open structures</li>
  <li style="margin-bottom:5px;">Do NOT shelter in dugouts, covered bleachers, or bus stops — these are not safe</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>STEP 4 — ACCOUNT FOR ALL CHILDREN</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Once inside — count every child against your session register</li>
  <li style="margin-bottom:5px;">No child is unaccounted for. If someone is missing — notify school staff immediately.</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>STEP 5 — NOTIFY</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Notify the school contact that the session has been suspended due to lightning</li>
  <li style="margin-bottom:5px;">Contact parents if children need to wait for extended pickup</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>STEP 6 — WAIT THE FULL 30 MINUTES</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Start timing from the last flash or thunder observed</li>
  <li style="margin-bottom:5px;">If lightning or thunder occurs again during the wait — reset the 30-minute clock</li>
  <li style="margin-bottom:5px;">If 30 minutes expires and the session cannot be resumed — reschedule</li>
</ul>
<p style="margin:0 0 10px;line-height:1.85;"><strong>⚠  NEVER resume a session early because "it looks clear." The 30-minute rule exists because lightning can strike from a storm that appears to have passed. Follow it exactly.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 3 — EXTREME HEAT AND SUN SAFETY</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">Children are significantly more vulnerable to heat illness than adults. Their bodies generate more heat proportionally and cool down less efficiently.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Heat Safety Thresholds:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Below 80°F / 27°C with low humidity — normal session, standard hydration reminders</li>
  <li style="margin-bottom:5px;">80–90°F / 27–32°C — mandatory water break every 15 minutes, shade access required</li>
  <li style="margin-bottom:5px;">Above 90°F / 32°C OR heat index above 95°F / 35°C — consider moving indoors or postponing</li>
  <li style="margin-bottom:5px;">Above 100°F / 38°C — session must be postponed or moved fully indoors</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Heat Safety Non-Negotiables:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Always carry a minimum of one litre of water per child for outdoor sessions</li>
  <li style="margin-bottom:5px;">Water breaks are scheduled — not optional, not "when children ask"</li>
  <li style="margin-bottom:5px;">Identify shaded areas at every venue during your first site visit</li>
  <li style="margin-bottom:5px;">Watch for signs of heat exhaustion: pale skin, heavy sweating, weakness, nausea, dizziness</li>
</ul>
<p style="margin:0 0 10px;line-height:1.85;"><strong>⚠  Heat stroke is a medical emergency. If a child stops sweating but is hot, confused, or unresponsive — call emergency services immediately and move the child to shade or cool environment.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 4 — WIND AND RAIN SAFETY</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Wind:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Wind above 25mph / 40km/h: assess whether equipment can be safely controlled</li>
  <li style="margin-bottom:5px;">Foam balls and light equipment become projectiles in high wind — adjust to putting or indoor alternatives</li>
  <li style="margin-bottom:5px;">Children must not swing clubs in high wind conditions — risk of loss of control</li>
  <li style="margin-bottom:5px;">If pop-up shelters or cones are being displaced — conditions are too windy for safe outdoor delivery</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Rain:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Light drizzle: session may proceed if children are appropriately dressed and surface is safe</li>
  <li style="margin-bottom:5px;">Moderate to heavy rain: move indoors — wet equipment, wet surfaces, and low visibility are all hazards</li>
  <li style="margin-bottom:5px;">Wet grass or hard surfaces: slipping risk is significantly elevated — do not proceed outdoors</li>
  <li style="margin-bottom:5px;">Standing water on surface: session must move indoors or be postponed</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 5 — FIRST AID RESPONSE DURING SESSIONS</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">Every EduGolfKids coach must hold a current First Aid certification before leading sessions independently. This section covers the most likely scenarios in a school golf environment.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario 1 — Struck by Golf Club:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Stop the session immediately — one whistle blast</li>
  <li style="margin-bottom:5px;">Move all other children away from the area calmly</li>
  <li style="margin-bottom:5px;">Assess the injury — do not move the child if head, neck, or back injury is suspected</li>
  <li style="margin-bottom:5px;">Call for school nurse or medical staff immediately</li>
  <li style="margin-bottom:5px;">Do not apply pressure to head wounds without training — cover gently</li>
  <li style="margin-bottom:5px;">Contact parent within 15 minutes of incident</li>
  <li style="margin-bottom:5px;">Complete incident report within 24 hours</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario 2 — Suspected Concussion:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Any blow to the head — the child does NOT return to the session</li>
  <li style="margin-bottom:5px;">Seat the child in a shaded, calm area with adult supervision</li>
  <li style="margin-bottom:5px;">Watch for: headache, confusion, dizziness, nausea, sensitivity to light</li>
  <li style="margin-bottom:5px;">Notify school nurse immediately</li>
  <li style="margin-bottom:5px;">Notify parent — child must be collected and assessed by a medical professional before returning</li>
</ul>`},    {h:`Module 11 — Field Safety (continued)`,b:`<p style="margin:0 0 10px;line-height:1.85;"><strong>RULE: If in doubt, sit them out. A child with a suspected concussion never returns to the session that day under any circumstance.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario 3 — Anaphylaxis / Allergic Reaction:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Check your pre-session register for any child with a known allergy and EpiPen</li>
  <li style="margin-bottom:5px;">Signs: hives, swelling of face or throat, difficulty breathing, pale skin, loss of consciousness</li>
  <li style="margin-bottom:5px;">Call emergency services immediately — do not wait</li>
  <li style="margin-bottom:5px;">Administer EpiPen if the child has one and you are trained — or locate school nurse immediately</li>
  <li style="margin-bottom:5px;">Stay with child until medical assistance arrives</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Scenario 4 — Seizure:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Do not restrain the child — clear the space around them</li>
  <li style="margin-bottom:5px;">Time the seizure</li>
  <li style="margin-bottom:5px;">Place something soft under their head — nothing in the mouth</li>
  <li style="margin-bottom:5px;">After the seizure — place child in recovery position</li>
  <li style="margin-bottom:5px;">Call emergency services if seizure lasts more than 5 minutes or child does not regain consciousness quickly</li>
  <li style="margin-bottom:5px;">Notify school nurse and parent immediately</li>
</ul>
<p style="margin:0 0 10px;line-height:1.85;"><strong>⚠  You are not a medical professional. Your job is to keep the child safe, call for help immediately, and stay calm. Do not attempt treatment beyond your training level.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 6 — INCIDENT DOCUMENTATION</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">Every incident — however minor — must be documented. This protects the child, the school, and you.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>EduGolfKids Incident Report — Required Fields:</strong></p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Date, time, and location of incident</li>
  <li style="margin-bottom:5px;">Child's full name and age</li>
  <li style="margin-bottom:5px;">Nature of incident — describe exactly what happened</li>
  <li style="margin-bottom:5px;">Witnesses present — names and roles</li>
  <li style="margin-bottom:5px;">Action taken — exactly what you did, in sequence</li>
  <li style="margin-bottom:5px;">Medical attention sought — yes/no, by whom</li>
  <li style="margin-bottom:5px;">Parent notified — time and method of contact</li>
  <li style="margin-bottom:5px;">Coach signature and date</li>
</ul>
<p style="margin:0 0 10px;line-height:1.85;"><strong>DEADLINE: All incident reports must be submitted to EduGolfKids HQ and the school contact within 24 hours of the incident. No exceptions.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">Incident reports are submitted via the EduGolfKids operating system (Airtable). If the system is unavailable, email the report to HQ immediately and log it in the system as soon as possible.</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>SECTION 7 — PRE-SESSION SAFETY CHECKLIST</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">Before every outdoor session, complete the following:</p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">☐  Weather checked — forecast reviewed for next 4 hours</li>
  <li style="margin-bottom:5px;">☐  Lightning risk assessed — 30/30 rule understood and ready to apply</li>
  <li style="margin-bottom:5px;">☐  Indoor backup space confirmed with school if weather is uncertain</li>
  <li style="margin-bottom:5px;">☐  Emergency Action Plan (EAP) reviewed for this venue</li>
  <li style="margin-bottom:5px;">☐  AED location identified</li>
  <li style="margin-bottom:5px;">☐  School nurse or medical contact identified</li>
  <li style="margin-bottom:5px;">☐  Session register complete — all children accounted for</li>
  <li style="margin-bottom:5px;">☐  Medical alerts reviewed — allergies, conditions, EpiPens confirmed</li>
  <li style="margin-bottom:5px;">☐  Equipment hitting zones set up — spacing verified</li>
  <li style="margin-bottom:5px;">☐  Children briefed on FREEZE and RETRIEVE commands before session starts</li>
</ul>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>⚠  Do not begin a session without completing this checklist. Preparation is protection.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>CERTIFICATION ASSESSMENT — MODULE 11</strong></p>
<p style="margin:0 0 10px;line-height:1.85;">Written Assessment (minimum pass: 85%):</p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>1.  </strong>A thunderstorm is forecast for 3 hours after your session starts. What do you do before the session begins?</p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>2.  </strong>You are mid-session when you see lightning. You count to 20 before hearing thunder. What do you do, in exact sequence?</p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>3.  </strong>A child has been struck on the head by another child's club during a session. Describe your exact response.</p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>4.  </strong>The temperature at session time is 93°F. No indoor space is available. What is your decision and why?</p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>5.  </strong>What is the 30/30 Rule and why does the second "30" matter?</p>
<p style="margin:0 0 10px;line-height:1.85;"><strong>6.  </strong>A child appears confused, is sweating heavily, and says they feel sick during an outdoor session in summer. What do you do?</p>
<p style="margin:0 0 10px;line-height:1.85;">Practical Assessment:</p>
<ul style="margin:6px 0 12px 22px;line-height:1.85;">
  <li style="margin-bottom:5px;">Coach must demonstrate a full lightning evacuation drill with a simulated group, from first whistle to full shelter, including equipment grounding and headcount.</li>
  <li style="margin-bottom:5px;">Coach must complete a blank incident report for a provided scenario to a satisfactory standard.</li>
</ul>
<p style="margin:0 0 10px;line-height:1.85;"><strong>⚠  AUTOMATIC FAIL: Any coach who demonstrates uncertainty about the lightning evacuation protocol or who cannot complete the pre-session safety checklist correctly will not pass this module and must resit.</strong></p>
<p style="font-weight:700;margin:12px 0 6px;color:var(--green-dark);"><strong>Safety is not a module. It is a mindset.</strong></p>
<p style="margin:0 0 10px;line-height:1.85;"><em>Every child in your session is someone's entire world. Protect them like it.</em></p>`},  ]},],

L2:[
{id:'L2_M1',title:'Module 1 — Putting',icon:'⛳',sections:[
{h:'Why Putting Comes First',b:`Putting is developmentally optimal: club speed is near-zero (minimal injury/fear risk), feedback is immediate and binary (ball goes in or it doesn't), short distances make success achievable at every level, and the pendulum motion trains the fundamental rhythm that transfers to all other skills. US Kids Golf research: children who begin with putting show faster full-game skill acquisition than those who begin with full swing instruction.`},
{h:'4 Functional Putting Principles',b:`<strong>Principle 1: Pendulum Motion</strong> — shoulders rock, arms swing as a unit, wrists quiet. Teach with pool noodle under both arms. <strong>Principle 2: Face Awareness</strong> — putter face must be square at contact. Teach with gate drill: two tees 6 inches apart. <strong>Principle 3: Consistent Setup</strong> — same position every time. Use foot markers and face-line sticker as constraints. <strong>Principle 4: Smooth Acceleration</strong> — no deceleration. Teach with backstroke length limiter (pool noodle behind putter).`},
{h:'Age 4–6 Progression',b:`Equipment: putter below chin, target min 6 inches, foam ball, distance 2–4 feet. <strong>Stage 1 (Sessions 1–2):</strong> Free exploration — celebrate any contact. Do NOT correct grip or stance. <strong>Stage 2 (Sessions 3–4):</strong> Target as a game: "Can you make the ball go inside the yellow circle?" Begin FREEZE/RETRIEVE commands. <strong>Stage 3 (Sessions 5–6):</strong> Move target slightly farther, introduce cooperative pair scoring. <strong>Stage 4 (Sessions 7+):</strong> Simple points game — team vs team only (no individual winner). Skills Passport criteria: strikes a stationary ball toward a target from 3 feet, 3 out of 5 attempts.`},
{h:'Age 6–9 Progression &amp; Error Responses',b:`Equipment: fitted putter, tee gate (two tees 5–6 inches apart), low-compression ball, 3–12 feet. Stage 1: Gate Challenge — narrow gate gradually. Stage 2: Distance Ladder (3, 5, 8, 10 feet). Stage 3: Pressure Rounds. Stage 4: 3-hole Putting Course. <strong>Error responses:</strong> Ball goes left → narrow gate from left side only. Ball stops short → move target closer, build confidence first. Inconsistent direction → foot markers + face-line sticker. Child rushes → 3-count ritual: "Look at target. Look at ball. Go."`},
]},
{id:'L2_M2',title:'Module 2 — Chipping',icon:'🏌️',sections:[
{h:'Chipping-Putting Connection',b:`EduGolfKids connects chipping to putting (not taught as a separate skill). Chipping shares: pendulum motion, downward strike, target-focused attention, consistent face awareness. Key additions: ball position moves back in stance, weight favours lead side slightly, loft creates airtime and bounce, landing zone thinking replaces hole thinking. Motor learning (Wulf 2013): skill transfer is maximized when new movements are anchored to existing neural patterns. Children who have mastered the putting pendulum learn chipping 40% faster.`},
{h:'4 Functional Chipping Principles',b:`<strong>Principle 1: Downward Strike.</strong> Teach with a tee 2 inches behind ball — child must not hit the tee. Age 4–6: "Hit the ball, then brush the grass." Age 6–9: "Ball first — like a hammer hitting a nail." <strong>Principle 2: Landing Zone Awareness.</strong> Use hula hoop or carpet tile as landing target. Score for landing IN the zone — not the finish. Age 6–9: "Where do you need to land it to make it roll to the cone?" <strong>Principle 3: Shaft Lean.</strong> For 4–6, the tee constraint achieves this automatically. <strong>Principle 4: Loft Selection (6–9 only).</strong> Give both a 7-iron and sand wedge — let them discover the difference.`},
{h:'Progressions &amp; Errors',b:`<strong>Ages 4–6:</strong> Stage 1 — Contact first (no target). Stage 2 — Landing target (hula hoop, 5 feet). Stage 3 — Two zones, child chooses. Stage 4 — Mini chipping game, station rotation. <strong>Ages 6–9:</strong> Stage 1 — Precision landing + air gate (two cones, ball must fly through). Stage 2 — Club discovery, both clubs, no instruction. Stage 3 — Variable distance (4 zones). Stage 4 — 3-station chipping course. <strong>Error responses:</strong> Topping → lower tee height or shrink ball. Fat shot → tee behind ball + tape marker. Scooping → raise the landing target (shelf/box). No trajectory → introduce air gate (two cones 12 inches high).`},
]},
{id:'L2_M3',title:'Module 3 — Pitching',icon:'🎯',sections:[
{h:'Why Pitching Is a 6–9 Skill Only',b:`Pitching requires simultaneous integration of hip/shoulder rotation, weight transfer, and trajectory management. These require FUNdamentals stage neurological readiness. <strong>LTAD protection rule: pitching is not introduced until a child demonstrates consistent chipping competency.</strong> Never introduce pitching to the 4–6 age group. Pitching is the bridge skill — it must be earned, not rushed.`},
{h:'Teaching Through Constraints',b:`<strong>Age 6–9 progression:</strong> Stage 1 — Carry Challenge: target 15 feet, must land within 5 feet. Stage 2 — Distance Zones: landing zones at 15, 20, 25, 30 feet; child selects zone, executes, self-scores. Stage 3 — Trajectory Game: air gate set high (24 inches), must carry through and land in target zone. Stage 4 — Pitching + Putting Course: pitch to within putting distance, then putt out — first integration of two skills. <strong>Never:</strong> reconstruct hip rotation or weight transfer through direct instruction. Let the distance constraint develop the movement naturally.`},
]},
{id:'L2_M4',title:'Module 4 — Full Swing',icon:'💥',sections:[
{h:'Full Swing: Movement-Led Development',b:`The full swing is introduced last in the EduGolfKids progression — not first. By this stage, children have: pendulum rhythm (putting), downward strike (chipping), weight transfer and rotation (pitching). The full swing is an extension of everything already built. LTAD protection: full swing is for ages 7+ with consistent pitching competency. For 4–6, full swing movements are explored through free play only — never structured instruction. Goal: a functional, safe, confident striking motion — not a perfect swing.`},
{h:'Constraint-Based Full Swing Teaching',b:`<strong>Never say:</strong> "Fix your backswing." "Rotate your hips." "Keep your left arm straight." — These create motor rigidity and coach dependency. <strong>Use instead:</strong> Rhythm cue: "Make a big brushing motion — back and through." Feet-together drill: forces balanced rotation naturally. Target distance constraint: closer target → shorter swing → more control. Time challenge: swing to a beat or rhythm. <strong>Common scenarios:</strong> Over-swings and loses balance → feet-together drill. Inconsistent contact → shorten target distance significantly. No power → move target farther (natural swing extension). Driver requests → foam balls only, adequate space, consistent 7-iron competency required first.`},
]},
{id:'L2_M5',title:'Module 5 — Rules &amp; Etiquette',icon:'📖',sections:[
{h:'Age-Appropriate Rules Introduction',b:`Rules are introduced progressively — never as a front-loaded lecture. <strong>Age 4–6:</strong> One rule only — "Clubs stay on the ground until I say go." Everything else is caught through session structure. <strong>Age 6–9:</strong> 3–5 core concepts across the term, introduced only when the situation arises in a game. Core concepts: (1) Safety command compliance. (2) Clubs on ground when not hitting. (3) Ball played from where it stops — no repositioning. (4) Wait for others to finish before retrieving. (5) Take turns, no rushing. Method: pause briefly when situation occurs, explain one rule, continue playing. Children learn rules through experience, not instruction.`},
{h:'Etiquette as Culture',b:`EduGolfKids builds golf etiquette culture through every session — not as a separate topic. The behavior coaches model and reinforce IS golf etiquette: waiting patiently, encouraging peers, congratulating good shots regardless of competition outcome, respecting equipment, following commands promptly. <strong>End-of-session etiquette ritual (2 minutes):</strong> children stack equipment correctly, group applause for the best effort of the session (coach nominates), say a positive word to the person next to them. This builds club culture and prepares children for on-course golf. Never enforce etiquette harshly — model it, acknowledge it, celebrate it.`},
]},
{id:'L2_M6',title:'Module 6 — Skills Passport',icon:'📔',sections:[
{h:'What the Skills Passport Is',b:`The EduGolfKids Skills Passport is a term-by-term developmental record for every enrolled child. It documents skill competency against defined criteria, creates tangible progression records parents can understand, motivates children through visible achievement milestones, creates coach accountability, and protects the EduGolfKids brand through consistent documented standards. The Passport belongs to the child. <strong>Completion is mandatory: 100% of enrolled children must receive a Passport entry at the end of every term.</strong> No exceptions.`},
{h:'Assessment Protocol',b:`Passport assessment is conducted in the final session of each term — embedded within the normal session structure, not as a separate test. Assessment moments are embedded in games: the putting game IS the assessment. <strong>Criteria are specific and observable</strong> — coaches observe against defined standards, not personal opinion. A child either meets the standard or has not yet met it. No half-marks. No "almost." Growth Mindset language applies to all assessment feedback. Recording: log in the EduGolfKids platform immediately after the session. Share with parents within 24 hours via approved communication channel.`},
]},
{id:'L2_M7',title:'Module 7 — Video Analysis',icon:'📱',sections:[
{h:'CoachNow in EduGolfKids',b:`Video analysis is a Level 2 tool — not used until basic skill competency is established. <strong>When to use:</strong> Ages 6–9 only. After consistent contact and basic skill pattern are established. For self-discovery questions only — never to show a child "what they're doing wrong." <strong>Protocol:</strong> Record one clip (max 10 seconds). Show immediately after the attempt. Ask: "What did you notice?" before making any observation yourself. Guided discovery applies to video exactly as it applies to live coaching.`},
{h:'Parent Reporting',b:`At the end of each term, every child receives a CoachNow report via the parent's registered email: one short video clip (best effort), written Skills Passport summary, three specific positive observations (effort-based), and next term's focus area. <strong>Report language rules:</strong> Never compare to other children. Never use negative ability labels. Use growth language throughout. Example: "This term Maya developed consistent face awareness in her putting, landing 3 from 4 gate challenges in her final session. She brings outstanding focus to every constraint challenge. Next term we will build on this foundation through our chipping progression."`},
]},
{id:'L2_M8',title:'Module 8 — Skills Session Safety',icon:'⚠️',sections:[
{h:'Safety in Skills Sessions',b:`Chipping and full swing sessions require heightened safety protocols beyond putting. <strong>Minimum spacing for full swing: 10 feet lateral</strong> (vs 6 feet for putting). Forward swing arc must be completely clear. Children behind the hitting line at all times during active swings. <strong>Indoor sessions:</strong> Foam balls ONLY — no hard balls indoors under any circumstance. Hitting zones reduced to 3 metres depth. Ceiling height must be assessed — full swing may not be appropriate in low-ceiling environments. Wall buffer minimum 2 metres behind target. Wind above 25mph — equipment becomes projectiles, children must not swing.`},
{h:'Correcting Unsafe Behavior in Skills Sessions',b:`<strong>Three-Step Correction:</strong> STEP 1 — FREEZE the session: one whistle blast — all activity stops. Never correct an individual while the rest of the group is still active. STEP 2 — Correct calmly and clearly: address the group, not the individual by name in front of peers. "We have a safety rule in EduGolfKids — clubs stay on the ground until I say hit. Let's all reset." Never shame or raise your voice. STEP 3 — Reinforce and resume: confirm understanding before resuming, acknowledge the group when they comply. A child who repeatedly endangers others is removed from the hitting zone for that activity and seated with the coach. Do not return them until they demonstrate the safety behavior.`},
]},
],

L3:[
{id:'L3_M1',title:'Module 1 — Finding &amp; Securing Schools',icon:'🏫',sections:[
{h:'School Tiering System',b:`Target in this order: <strong>Tier 1: Private and Independent Schools — start here, always.</strong> Faster decision-making (principal has authority), parents actively seek enrichment, families have disposable income for $20/lesson, one great partnership generates warm referrals. <strong>Tier 2: Charter and Magnet Schools</strong> — more autonomy than public, faster decisions, strong mission alignment. Approach after first 1–2 private school partnerships are running. <strong>Tier 3: Public Elementary Schools</strong> — largest market but longest sales cycle. Requires district approval. Your private school track record does most of the selling. <strong>Tier 4: After-School Operators and YMCAs</strong> — not schools but high-enrollment and fast-moving. Run parallel to school outreach.`},
{h:'First Contact &amp; Follow-Up',b:`Find the principal's direct email via the school website, Google, LinkedIn, district website, or by calling the front desk. <strong>Email before calling — always.</strong> Build a target list of minimum 20 schools before starting outreach. <strong>Email structure:</strong> Subject: "Golf program for [School Name] students — enrichment opportunity." Body: your name and territory, what EduGolfKids is, certified background-checked coaches, evidence-based curriculum, zero cost to school, request a 20-minute meeting. <strong>Follow-up call (3 business days after email):</strong> "Hi, this is [Name] from EduGolfKids. I sent [Principal Name] an email a few days ago... I'd like to make sure it arrived and see if there's a time I could come in for a brief meeting." Follow up every 3–4 business days until yes or definitive no. 60–70% of meetings are secured within 2–3 contact attempts.`},
{h:'The School Meeting &amp; Agreement',b:`<strong>Bring:</strong> EduGolfKids program one-pager, coach certifications, background check documentation, insurance certificate, reference from another school, sample session plan, Skills Passport sample, parent information letter template. <strong>Meeting structure (20 min):</strong> 1–3: build rapport — ask about their school. 3–10: present EduGolfKids — safe certified coaches, zero cost to school, curriculum-aligned, full insurance. 10–15: address common questions (space, scheduling, injuries, admin). 15–20: close — never leave without a next step: "Based on what we've discussed, is there anything that would prevent you from moving forward?" <strong>Every school partnership must be documented in a signed agreement</strong> — verbal agreements are insufficient. Use only the EduGolfKids HQ template.`},
]},
{id:'L3_M2',title:'Module 2 — Recruiting &amp; Hiring Coaches',icon:'👤',sections:[
{h:'The Ideal Coach Profile',b:`Your coaches are your product. <strong>Non-negotiable qualities:</strong> genuine enjoyment of working with children (not tolerance — genuine enjoyment), energy and enthusiasm for 60 straight minutes, reliability and punctuality, warm professional communication, coachability — willingness to follow the EduGolfKids system exactly. <strong>Red flags — do not hire regardless of golf ability:</strong> no prior experience with children in any form, impatience or short temper visible at any stage, resistance to structure ("I like to do things my own way"), unreliable communication during hiring, condescending tone toward children even casually. Golf ability is assessed last. A patient energetic former teacher with a 20 handicap will outperform an impatient scratch golfer every time in this role.`},
{h:'Recruitment Channels &amp; Screening',b:`<strong>Channel 1 — Indeed (Primary):</strong> Title: "Youth Golf Coach — EduGolfKids (Part-Time / Flexible Hours)." Lead with passion for children and "full training and certification provided." Target age 20–35. Boost the post ($50–100 increases visibility significantly). <strong>Channel 2 — School Teachers:</strong> Post in Facebook teacher groups, ask school partners to share with staff. <strong>Channel 3 — University Sport Science/PE Programs:</strong> Final-year students are an excellent pipeline. <strong>Channel 4 — Referrals:</strong> Highest-quality source — consider a referral bonus. <strong>Screening:</strong> Phone screen (10–15 min) → in-person interview (30 min) → practical assessment (watch them with children for 10 minutes). Natural warmth with children cannot be trained. Everything else can.`},
{h:'Onboarding &amp; Retention',b:`<strong>Onboarding:</strong> Background check (non-negotiable before any offer). Employment structure (consult local attorney — contractor vs employee). Enroll in EduGolfKids certification — Level 1 within 4 weeks. Shadow 2 sessions → co-deliver 2 sessions → first independent session with licensee present. <strong>Retention:</strong> Losing a great coach costs 3–4 weeks recruitment + 4–6 weeks training + their school relationships. What retains coaches: feeling valued (acknowledge great work specifically and regularly), clear progression pathway, schedule flexibility, pay increases tied to performance, team culture. A brief monthly message costs nothing and builds loyalty: "You did a great job at [school] this month. [Specific observation]. Really appreciate you."`},
]},
{id:'L3_M3',title:'Module 3 — Marketing &amp; Enrollment',icon:'📢',sections:[
{h:'Marketing Hierarchy',b:`You do not need to spend money on paid advertising to fill an EduGolfKids program. Prioritize in this order: <strong>Tier 1: Demo Days and Parent Information Sessions</strong> — highest conversion. A parent who sees their child smile in a 10-minute demo will enroll 60%+ of the time. <strong>Tier 2: School Newsletters and Direct-to-Parent Communication</strong> — zero cost, reaches every parent. <strong>Tier 3: Free Trial Vouchers and Referral Programs</strong> — lowers enrollment barrier to zero, turns enrolled families into a sales force. <strong>Tier 4: Social Media</strong> — credibility tool, not direct enrollment. Document what you do. <strong>Tier 5: School Bag Flyers</strong> — effective through school bags. <strong>Tier 6: Paid Digital Advertising</strong> — lowest priority. Only if Tiers 1–5 are maximized.`},
{h:'Demo Days &amp; Parent Info Sessions',b:`<strong>Demo Day (30–45 min):</strong> 5 min energetic welcome game. 15 min putting and chipping challenges — high success rate, immediate fun. 5 min team scoring game with prizes. 5 min parent Q&amp;A and enrollment opportunity. Bring enrollment forms, Skills Passport sample, pricing, and early bird offer for enrollment on the day. Your energy IS your marketing. <strong>Operator benchmark: well-run demo day converts 40–70% of attendees.</strong> Follow up within 48 hours with families who didn't enroll: "It was wonderful to meet [child's name] yesterday. We still have [X] spots available." <strong>Parent Information Session (20–30 min):</strong> developmental philosophy in accessible language → session structure walkthrough → Skills Passport demo → safety/qualifications → pricing with enrollment incentive.`},
{h:'Retention Marketing',b:`<strong>Player of the Week:</strong> every week, one child recognized for effort/improvement/attitude — not best golf. Announce at session end, give a small card, send parent a personal message. Parents share it — every child wants to earn it. <strong>Birthday Phone Call:</strong> 2-minute voice message on the student's birthday. The family remembers it for years. Log all birthdays in your operating system. <strong>End-of-term ritual:</strong> Skills Passport ceremony, group recognition, next term preview, re-enrollment on the day with early bird incentive. <strong>Communication cadence:</strong> Week 1 welcome → mid-term positive observation per child → end-of-term Passport report → re-enrollment reminder.`},
]},
{id:'L3_M4',title:'Module 4 — Pricing &amp; Financial Management',icon:'💰',sections:[
{h:'The Pricing Model',b:`<strong>$20 per child per lesson. Maximum 7 children per coach. 4 sessions per month minimum.</strong> Revenue per class per month: $20 × 7 × 4 = $560. <strong>School facility fees:</strong> pass directly to parents — add the per-child cost on top of $20. Example: school charges 10% revenue share → $20 + $2 = $22. Never absorb school fees into your margin — this erodes profitability rapidly at scale. <strong>Healthy benchmarks:</strong> Coach costs max 30–35% of gross revenue. Overhead max 15–20%. Net profit target 45–55%. A partially filled class of 5 vs 7 costs $40 per session in lost revenue.`},
{h:'Revenue Model',b:`<strong>Layer 1:</strong> 1 class, 1 coach — $560/month gross. <strong>Layer 2:</strong> 2 classes, 1 coach (morning + afternoon) — $1,120/month from one school. <strong>Layer 3:</strong> 3 coaches simultaneously — 21 children/session, $1,680/month gross. Coach costs: 3 × 4 × $35 = $420/month. Net ~$1,260/month before other costs. <strong>At scale:</strong> 5 full schools = $8,400 gross/month. 10 full schools = $16,800 gross/month. Net at 45–55% margin: $7,000–$10,000/month at 10 full schools. Fill before you expand.`},
{h:'Revenue Protection &amp; Invoicing',b:`<strong>4-Lessons-Per-Month Rule:</strong> one missed session at full capacity = $140 lost per class. Any session missed (weather, school event) must be rescheduled within the same billing month. Communicate cancellation + make-up date within 24 hours. Rain is not a cancellation reason — "We moved inside and had a great session" is your standard. <strong>Monthly invoicing:</strong> invoice line items: 4 × $20 = $80 per child/month. Payment due 5 days before session month starts. Send via email with one-click payment link (Stripe or Square). Non-payment: 7 days — polite reminder. 14 days — personal phone call. 21 days — child's spot is at risk. Never allow more than one month unpaid.`},
]},
{id:'L3_M5',title:'Module 5 — Multi-School Operations',icon:'⚙️',sections:[
{h:'The Operating System',b:`A business that depends on the licensee being everywhere at once cannot scale. The EduGolfKids Airtable operating system manages: schools (contact, agreement status, schedule, capacity, fee structure), coaches (certification status, assigned schools, session history), students (enrollment, Skills Passport records, birthdays), sessions (scheduled, completed, cancelled, make-up), invoices (billing, outstanding payments), incidents (documentation and resolution). A licensee running 3+ schools from memory is one unexpected absence away from operational collapse.`},
{h:'Coach Management Framework',b:`<strong>5 elements:</strong> (1) Clear Role Expectations — written summary of assigned schools, responsibilities before/during/after sessions, post-session logging requirements. (2) Session Confirmation Protocol — confirm 24 hours in advance; notify minimum 3 hours before if unable. Always have a cover coach on call. (3) Post-Session Logging — 3 minutes after every session: completion, number of children, incidents, parent concerns, equipment status. (4) Quarterly Observation — session architecture compliance, safety standards, Language Code, engagement, Skills Passport tracking. Frame as development: "I'm coming to see what's working and support your development." (5) Monthly Team Meeting — 30–45 min: wins, challenges, upcoming dates, Skills Passport updates, 10-minute training moment.`},
{h:'Quality Control at Scale',b:`<strong>Tools:</strong> (1) Session Audit — random unannounced observation of one session per month. Every school observed minimum once per quarter. (2) Parent Feedback — end-of-term survey: "How would you rate your child's experience?" / "What did your child enjoy most?" / "Is there anything we could improve?" Act on patterns. (3) Skills Passport Completion Rate — 100% is the target. Below 100% requires immediate attention. (4) Incident Rate Monitoring — zero serious incidents is the target. Patterns suggest a spacing or management issue. <strong>School communication calendar:</strong> start of term (program confirmed), mid-term (enrollment update), end of term (summary + zero incidents + thank you), off-term (one monthly touch).`},
]},
{id:'L3_M6',title:'Module 6 — Territory Growth',icon:'📊',sections:[
{h:'The Fill-First Growth Model',b:`<em>"The ideal business is to get as many schools fully occupied with coaches and students before trying to grow further."</em> A school is "fully occupied" only when ALL five conditions are met: (1) Every class has 7 enrolled children. (2) Sessions running consistently — 4/month, no chronic cancellations. (3) School relationship strong — principal happy, no open issues. (4) Coach stable, certified, performing well. (5) Parent retention above 70%. Only when existing schools are fully occupied should you prioritize adding a new school. Spreading attention across partially-filled schools means none become excellent.`},
{h:'4 Growth Stage Gates',b:`<strong>Stage 1 — Launch:</strong> 1 school, 1 coach, 1 class. Learn the system. Success criteria before Stage 2: class full for 2 consecutive terms, coach L1/L2 certified, 100% Passport completion, parent retention above 70%. <strong>Stage 2 — First Expansion:</strong> 1–2 schools, 2–3 classes. Add second class at School 1, begin approaching School 2. <strong>Stage 3 — Multi-School:</strong> 3–5 schools. Systemize operations, build the team, operating system fully active. <strong>Stage 4 — Territory Optimization:</strong> 5–10 schools. All schools to full capacity. Transition from operator to manager. Lead Coach identified. Revenue predictable and growing.`},
{h:'Revenue Milestones &amp; Business Value',b:`<strong>Revenue milestones:</strong> 3 schools partial → $3,000–$4,000 gross/month. 5 schools full → $8,000–$9,000 gross/month. 10 schools full → $16,000–$18,000 gross/month. Net at 45–55% → $7,000–$10,000/month at 10 full schools. <strong>Business asset value:</strong> Service businesses with recurring revenue typically sell for 2–3x annual net profit. A territory generating $100,000 net per year has an asset value of $200,000–$300,000. This is what disciplined, quality-first growth builds. <strong>Transition to manager:</strong> Identify Lead Coach, delegate session delivery progressively, redirect time to school development, coach recruitment, marketing, and financial management.`},
]},
{id:'L3_M7',title:'Module 7 — Brand Compliance',icon:'🏷️',sections:[
{h:'Why Brand Compliance Matters',b:`Every EduGolfKids territory carries the brand of every other territory. A licensee who delivers a poor experience in their market damages the brand for every other licensee globally. Brand compliance is not bureaucracy — it is protection of the asset you have invested in. <strong>Visual Brand Standards:</strong> All coaches wear approved EduGolfKids branded attire — no substitutions. All marketing materials use approved EduGolfKids templates — no homemade alternatives. Skills Passports use only the official format. <strong>Operational Standards:</strong> Session structure — the 60-minute architecture is non-negotiable. Curriculum — only approved EduGolfKids progressions. Pricing — $20/lesson base is standard; deviations require HQ approval. All coaches must hold current EduGolfKids certification before leading independently.`},
{h:'Licensee Obligations &amp; HQ Relationship',b:`Under the EduGolfKids licensee agreement, licensees must: maintain all compliance documentation current (insurance, certifications, background checks), operate exclusively within the approved territory boundaries, report serious incidents to HQ within 24 hours, complete annual licensee review with HQ, and pay license fees on the agreed schedule. <strong>The HQ relationship:</strong> HQ provides the system, curriculum, marketing templates, operating platform, and certification framework. Licensees provide execution, local market development, and coaching team management. When there is a conflict between a licensee's preferred approach and the EduGolfKids standard, the EduGolfKids standard applies.`},
]},
{id:'L3_M8',title:'Module 8 — Licensee Safety Responsibilities',icon:'🦺',sections:[
{h:'Safety at Scale',b:`As a licensee with multiple schools and coaches, you are accountable for the safety of every session delivered in your territory. <strong>Coach safety compliance:</strong> Verify every coach has completed Model 0 certification and maintains current First Aid certification. Confirm every coach has reviewed the EAP for each specific school they are assigned to. Quarterly observations include explicit safety compliance review. Any safety violation by a coach is treated as a licensee compliance issue. <strong>Site safety management:</strong> Maintain an up-to-date site file for every school including: emergency contact list, AED location, school nurse contact, confirmed indoor backup space, and weather cancellation contact protocol.`},
{h:'Incident Management &amp; Insurance Requirements',b:`<strong>Incident management sequence:</strong> Coach notifies licensee within 1 hour. Licensee notifies HQ within 24 hours via official incident report channel. Licensee manages parent communication with the coach. Official incident report submitted. Follow up with school principal within 24 hours. <strong>Insurance requirements (non-negotiable):</strong> General Liability — minimum $1,000,000 per occurrence. Sexual Abuse and Molestation (SAM) Endorsement — this is a separate coverage, not included in standard GL. <strong>It has zero grace period on expiry.</strong> Professional Liability Insurance. All certificates of insurance must be current before any session is delivered. An expired SAM endorsement means no sessions — period.`},
]},
],

};

// ══════════════════════════════════════════
//  KNOWLEDGE CHECK QUESTIONS (per module)
// ══════════════════════════════════════════

const KNOWLEDGE_CHECKS = {
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
],
L1_M6:[
{q:'A coach says to a 7-year-old in front of the group: "You always rush — you never take your time." Under the EduGolfKids Language Code, this statement:',o:['Is acceptable because it is factually accurate','Violates the Language Code — it uses identity-based criticism ("always," "never") that creates shame and triggers anxiety','Is acceptable if said in a gentle tone','Is acceptable in the 6–9 age group who can handle more direct feedback'],c:1,e:'"You always..." and "you never..." are prohibited language patterns — they attack identity rather than describe behavior. The Language Code requires neutral outcome description and effort-based guidance.'},
{q:'A 9-year-old misses five consecutive putts and says "I\'m terrible at this." The correct coaching response is:',o:['"You\'re not terrible — you just need more practice."','"You\'re learning this — that\'s different from being bad at it. Let\'s adjust and try again."','"You\'ve been really good in previous sessions — I\'m sure you\'ll get it."','"Let\'s see if the next one goes in — just focus."'],c:1,e:'"You\'re learning this — that\'s different from being bad at it" distinguishes learning from identity labeling. This is the growth mindset response that normalizes struggle without dismissing the child\'s feeling or attaching outcome to identity.'},
{q:'A coach accidentally says "No, not like that" to a child. According to the 3-Step Language Reset Rule, the coach should:',o:['Continue the session and address the language at the end','Immediately rephrase: "Let me try that again — that one went left. Let\'s adjust together."','Privately apologize to the child after the session','Make no acknowledgment — drawing attention to the error compounds the issue'],c:1,e:'The 3-Step Language Reset requires immediate rephrasing, modeling the growth correction, and reinforcing confidence. Accountability protects culture.'},
],
L1_M7:[
{q:'A coach delivers an excellent and safe Skill Block but uses multiple prohibited phrases including "No, not like that" during the session. How should this session be evaluated?',o:['As a pass — the technical and safety execution was correct','As a fail — integration is mandatory, and Language Code violation is a failure criterion regardless of technical correctness','As requiring a partial reassessment on language only','As a conditional pass pending a follow-up observation'],c:1,e:'Module 7 states: "If a coach delivers a technically correct drill but violates language code → failure." Integration is mandatory — all modules must be applied simultaneously.'},
{q:'According to the Full Integration Map, which session segment applies the MOST motor learning principles (M3)?',o:['Warm-Up','Skill Block','Game Reinforcement','Wrap-Up'],c:1,e:'The Full Integration Map shows the Skill Block as the highest concentration of motor learning application — multiple constraint challenges, external focus cues, variable practice, and guided discovery are primarily deployed here.'},
],
L1_M8:[
{q:'A parent messages the coach on their personal Instagram asking for a progress update. The correct response is:',o:['Respond with a brief positive update since the intent is harmless','Do not respond via personal social media — direct the parent to contact through the approved EduGolfKids communication channel','Block the parent to avoid further personal contact','Respond but advise the parent to use official channels in future'],c:1,e:'Coaches must use only approved EduGolfKids communication channels for parent contact. Personal social media connections with parents are explicitly prohibited.'},
{q:'A coach wants to send parents a mid-term progress update about a 7-year-old struggling with distance control in putting. Which message is MOST aligned with EduGolfKids communication standards?',o:['"James is having difficulty reaching target distances in putting and needs significant improvement."','"James is building his distance control in putting — he\'s showing great focus and we\'re working through a great challenge that will accelerate this in the final sessions."','"James is below average compared to his peer group in putting distance."','"James enjoys putting but unfortunately cannot reach the target distances we need him to."'],c:1,e:'Parent communication must use growth language: describe progress positively, reference specific program activity, avoid negative ability assessments, never compare to peers.'},
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
],
L2_M2:[
{q:'What is the PRIMARY reason EduGolfKids connects the chipping motion to the putting motion?',o:['It reduces the number of grip adjustments children need to make','Motor learning research shows skill transfer is maximized when new movements are anchored to existing neural patterns — children learn chipping 40% faster this way','It allows children to use the same club for both skills','It is consistent with LTAD stage requirements'],c:1,e:'Motor learning research (Wulf 2013): skill transfer is maximized when new movements anchor to existing neural patterns. The chipping-putting connection leverages the pendulum motion already established.'},
{q:'A 7-year-old consistently tops the ball (ball rolls along ground). The constraints-led response is:',o:['Instruct the child to keep their head down and watch the ball throughout the swing','Lower the tee height so the ball sits closer to the ground, and/or shrink the ball size — both force more precise contact naturally','Use a different club — a shorter iron will reduce the error','Have the child practice the chip motion without a ball first'],c:1,e:'Topping error CLA response: lowering the tee height or shrinking the ball size both require more precise contact. The constraint creates the correct movement pattern through natural problem-solving.'},
],
L2_M3:[
{q:'Which constraint is MOST effective for helping a 9-year-old develop pitching distance awareness WITHOUT direct instruction about swing length?',o:['Instruct the child: "Bigger swing = more distance"','Distance zones: landing targets at 15, 20, 25, 30 feet — child selects zone, executes, self-scores. Distance awareness emerges through exploration','Use different clubs at each distance to vary the trajectory','Time-pressure rounds: child must pitch to all zones within 60 seconds'],c:1,e:'Variable distance constraint: landing zones at progressive distances require the child\'s nervous system to self-regulate swing length for each target. The relationship between swing size and distance is discovered through exploration.'},
],
L2_M4:[
{q:'A 9-year-old has good contact and distance but loses balance consistently at the finish. The constraints-led response is:',o:['Instruct the child to "hold your finish position for 3 seconds after every shot"','Use the feet-together drill — this forces balanced rotation naturally through the movement challenge, no verbal instruction about balance required','Widen the child\'s stance to create a more stable base','Reduce swing speed and build up gradually'],c:1,e:'Feet-together drill: when children cannot maintain balance, their nervous system must find a balanced rotation pattern to execute the swing. Balance improves through the constraint — not through instruction about how to balance.'},
],
L2_M5:[
{q:'An 8-year-old asks why they cannot pick up their ball and place it closer to the hole. The MOST appropriate rules introduction is:',o:['Explain the full rules of golf including stroke play and penalties','Address it in the moment: "In golf, we play the ball from where it stops — that\'s what makes it a great challenge. Let\'s try from there." One rule, in context','Tell the child that EduGolfKids sessions do not follow golf rules','Redirect the child without explanation to avoid a lengthy rules discussion'],c:1,e:'Rules introduction: rules are only introduced when a situation arises — never front-loaded. One rule, explained in context, connected to the game situation.'},
],
L2_M6:[
{q:'At end of term a coach has assessed Skills Passport criteria for 6 out of 7 children. One child was absent for the final assessment session. What must the coach do?',o:['Record "Not Assessed" status for the absent child and move on','Contact the parent to schedule an assessment in the first session of next term — 100% completion is mandatory','Assess the child based on performance observations from earlier in the term','Advise the licensee and allow them to decide'],c:1,e:'100% completion rate is mandatory — every enrolled child must receive a Passport entry at end of every term. An absent child requires a scheduled assessment in the first session of next term.'},
],
L2_M7:[
{q:'After watching a video clip of their putting stroke, a 9-year-old says "My arm is bending." Before responding, the coach should:',o:['Confirm the observation and correct the arm position directly','Validate the self-observation first: "Interesting — what do you think happens to the ball when your arm bends at impact?"','Tell the child not to focus on their arm — external focus is more effective','Use the observation as a teaching moment for the full group'],c:1,e:'Video analysis guided discovery: the child has made a self-observation — a high-quality motor learning moment. The coach validates and converts it to a guided discovery question. This builds autonomy and self-correction ability.'},
],
L2_M8:[
{q:'A coach is running a chipping session in a gym with a 9-foot ceiling. Full chipping swings are hitting the ceiling and bouncing unpredictably. What is the CORRECT response?',o:['Continue the session but ask children to reduce their swing size','Assess the ceiling height as unsafe for full chipping — transition to a putting session or modify to chip-length motion only','Move the children to one half of the gym where the ceiling appears higher','Inform parents about the ceiling issue and seek permission to continue'],c:1,e:'Indoor sessions require ceiling height assessment. If full swing is not appropriate, the coach must modify — shorter iron or chip-length swings only indoors. A ceiling being struck creates unpredictable projectile risk.'},
{q:'During a full swing session, a child repeatedly swings before the RETRIEVE command while others are still collecting balls. Steps 1–3 of the Behavior Management Ladder have been applied with no improvement. What is the correct Step 4 action?',o:['Physically guide the child back to their starting position','"I need you to wait for the RETRIEVE command. If you swing before it is given, you will take a 2-minute break from the activity. It\'s your choice."','Remove the child from the session entirely','Reduce the child\'s equipment to a putter only for the remainder of the session'],c:1,e:'Behavior Management Step 4: choice and consequence. "I need you to [behavior]. If you continue, [consequence]. It\'s your choice." This maintains dignity and gives agency while making the consequence clear.'},
],
L3_M1:[
{q:'A licensee is beginning outreach in their new territory with 8 public schools, 4 private schools, and 3 charter schools. In what order should they approach these schools?',o:['Public schools first — largest enrollment, biggest market opportunity','Private schools first, then charter schools, then public schools — this is the EduGolfKids tiering system','All schools simultaneously to maximize outreach efficiency','Charter schools first — they have more autonomy and move faster'],c:1,e:'EduGolfKids school tiering: Tier 1 (Private/Independent) → Tier 2 (Charter/Magnet) → Tier 3 (Public Elementary). Private schools are approached first because decision-making is faster and parents actively seek enrichment.'},
{q:'At a school meeting, a principal asks: "What if a child gets hurt during your program?" The most effective response is:',o:['"We have never had a serious incident in our program\'s history, so this is very unlikely."','"Our coaches are safeguarding-trained, carry full liability insurance, and have a documented Emergency Action Plan for every site. We maintain $1M general liability coverage and a SAM endorsement."','"Parents sign a liability waiver at enrollment that covers injury claims against the school."','"Injuries are covered by the school\'s own liability insurance under their enrichment program framework."'],c:1,e:'Injury objection response: lead with safeguarding training, full liability insurance, and documented EAP. These are the three elements that remove school liability concern.'},
],
L3_M2:[
{q:'A coaching candidate has a professional golf background but says "I find it hard to follow a strict curriculum — I prefer to adapt sessions using my experience." How should the licensee evaluate this candidate?',o:['Highly positively — adaptability is a key coaching quality','As a significant red flag — resistance to following the EduGolfKids system is a non-negotiable disqualifier regardless of golf ability','Conditionally — offer the role pending a probationary period','Positively — their golf expertise will benefit the program even if their style differs'],c:1,e:'"Resistance to following a structured program" is explicitly listed as a red flag — do not hire regardless of golf ability. The EduGolfKids system depends on curriculum compliance.'},
],
L3_M3:[
{q:'A licensee plans their first demo day at a new school. Only 4 children show up instead of the expected 15. Which response BEST protects the enrollment opportunity?',o:['Postpone the demo day and reschedule for a larger turnout','Deliver an outstanding session for the 4 children present — their experience IS your marketing. Follow up with every family within 48 hours','Run a shortened 15-minute demo since the group is small','Offer the 4 children a free first term to compensate'],c:1,e:'Operator benchmark: a well-run demo day converts 40–70% of attendees regardless of size. 4 children with an outstanding experience will each tell 2–3 friends. Always deliver your best session.'},
],
L3_M4:[
{q:'A school charges a 10% revenue share as a condition of partnership. The licensee has 7 enrolled children paying $20/session. What is the correct adjusted price per child?',o:['$20 — absorb the school fee as a cost of doing business','$22 — add the 10% directly to the base price ($20 + $2 = $22)','$20.50 — split the cost equally between the licensee and parents','$21 — a conservative adjustment to maintain competitiveness'],c:1,e:'Revenue share: $20 × 10% = $2 per child per session. Adjusted price = $22. Never absorb school fees into margin — this erodes profitability rapidly at scale.'},
{q:'In Month 3, a licensee has 1 class of 5 children (not full at 7) at their only school. A new school approaches them about starting a program. What should the licensee do?',o:['Start the new school immediately — more schools means more revenue','Fill the existing class to 7 before prioritizing the new school — a partially filled class of 5 vs 7 costs $40 per session in lost revenue','Accept the new school but keep the existing class size as is','Negotiate a trial with the new school while working on filling the existing class simultaneously'],c:1,e:'Fill-first growth model: the existing class of 5 vs full 7 costs $40 per session in lost revenue. Filling existing schools before expanding is the fundamental discipline.'},
],
L3_M5:[
{q:'A coach calls in sick 90 minutes before a session at the licensee\'s busiest school (21 enrolled children across 3 classes). What is the licensee\'s immediate priority?',o:['Cancel the session and notify parents as quickly as possible','Contact the cover coach immediately — a cover coach must always be on call. If no cover, the licensee delivers the session personally','Contact the school to inform them of the cancellation and reschedule','Ask another active coach to split the 3 classes between 2 coaches'],c:1,e:'"Never rely on a single point of coach failure at a school. Always have a backup." A cover coach must always be on call. If unavailable, the licensee delivers the session — the school relationship and 4-lessons-per-month revenue protection both depend on it.'},
],
L3_M6:[
{q:'A licensee at Stage 2 is pressured by a new school to start immediately. They have one class half-filled at School 1 and a new coach still completing certification. Which response is MOST aligned with the EduGolfKids growth model?',o:['Accept the third school — more schools is always better','Decline to proceed until Stage 2 success criteria are met: second coach certified AND second school first term complete','Accept but delay the start date by 4 weeks','Accept and deliver the third school\'s sessions personally while the coach certifies'],c:1,e:'Stage gate 2 success criteria: second coach certified and performing independently AND School 2 first term completed successfully. Neither criterion is met. Accepting a third school now risks quality at all locations.'},
],
L3_M7:[
{q:'A licensee wants to create their own marketing flyers with a slightly modified EduGolfKids logo to better match their local market. What is the correct approach?',o:['Proceed — minor logo modifications are acceptable if the brand is recognizable','Request the design change through HQ — all marketing materials must use approved EduGolfKids templates and any logo modifications require HQ approval','Use the modified logo for local social media only','Have the materials reviewed by another licensee before use'],c:1,e:'Brand compliance: all marketing materials must use approved EduGolfKids templates. Logo modifications are not permitted without HQ approval. Every territory carries the brand of every other territory.'},
],
L3_M8:[
{q:'A serious incident occurs at one of the licensee\'s schools (a child taken to hospital). The coach calls the licensee. What is the licensee\'s mandatory reporting timeline to HQ?',o:['Within 24 hours via the official incident report channel','Within 48 hours — to allow time to gather full information first','Within 1 week — once the child\'s condition is confirmed','There is no mandatory timeline — report when all information is available'],c:0,e:'Incident management: coach notifies licensee within 1 hour. Licensee notifies HQ within 24 hours via the official incident report channel. This is non-negotiable.'},
{q:'A licensee\'s Sexual Abuse and Molestation (SAM) insurance endorsement expires next week. General Liability insurance is current for another 8 months. What sessions may the licensee run?',o:['All sessions — General Liability coverage is current and is the primary requirement','No sessions may be delivered once the SAM endorsement expires — it has zero grace period on expiry','Sessions at schools without children under 10 may continue','Sessions may continue for 30 days with a grace period during renewal'],c:1,e:'SAM endorsement has zero grace period on expiry. An expired SAM endorsement means no sessions — period. Both GL and SAM must be current.'},
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
    let statusText, statusColor, cardCls;
    if (passed && !expired)      { statusText='✅ Certified'; statusColor='var(--green)'; cardCls='green'; }
    else if (expired)             { statusText='⚠️ Expired';  statusColor='var(--red)';   cardCls='red'; }
    else if (!prereqMet)          { statusText='🔒 Locked';   statusColor='var(--gray-400)'; cardCls=''; }
    else                          { statusText='In Progress'; statusColor='var(--gold)';  cardCls=''; }
    return `<div class="card" style="border-left:4px solid ${def.color};cursor:${prereqMet?'pointer':'default'};opacity:${prereqMet?1:0.6};" onclick="${prereqMet?`openEduLevel('${lvl}')`:''}" >
      <div style="display:flex;align-items:center;gap:12px;padding:4px 0;">
        <div style="font-size:28px;">${passed&&!expired?'🏆':'📚'}</div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:15px;">${def.fullLabel}</div>
          <div style="font-size:13px;color:var(--gray-400);margin-top:2px;">${mods.length} modules · ${modsRead}/${mods.length} read</div>
        </div>
        <div style="text-align:right;"><div style="font-size:13px;font-weight:600;color:${statusColor};">${statusText}</div>
        ${prereqMet&&!passed?`<button class="btn btn-sm btn-primary" style="margin-top:6px;" onclick="event.stopPropagation();openEduLevel('${lvl}')">Continue →</button>`:''}
        ${passed&&!expired?`<button class="btn btn-sm btn-outline" style="margin-top:6px;" onclick="event.stopPropagation();viewCertificate('${lvl}')">View Cert</button>`:''}
        </div>
      </div></div>`;
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
  const def = CERT_LEVELS[lvl];
  const mods = EDU_MODULES[lvl] || [];
  const prereqMet = !def.prereq || hasPassed(def.prereq);
  const allRead = mods.every(m => certState.records[`read_${m.id}`]);
  const kcDone  = mods.every(m => certState.records[`kc_${m.id}`]);
  const passed  = hasPassed(lvl);

  const reader = document.getElementById('edu-module-reader');
  if (!reader) return;

  reader.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
      <button class="btn btn-outline btn-sm" onclick="renderEducationHub();switchTab(document.querySelector('#page-coach-education .tab'),'edu-tab-progress')">← All Levels</button>
      <div style="flex:1;"><h2 style="margin:0;">${def.fullLabel}</h2></div>
      ${allRead&&kcDone&&!passed?`<button class="btn btn-primary" onclick="startLevelAssessment('${lvl}')">🎓 Take Assessment</button>`:''}
      ${passed?`<span class="badge badge-green">✅ Certified</span>`:''}
    </div>
    ${!prereqMet?`<div class="alert alert-amber">🔒 Complete ${CERT_LEVELS[def.prereq]?.label} first to unlock this level.</div>`:''}
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${mods.map((m,i) => {
        const read = !!certState.records[`read_${m.id}`];
        const kcComplete = !!certState.records[`kc_${m.id}`];
        const m0special = lvl==='M0' && !m0Acknowledged();
        return `<div class="card" style="cursor:${prereqMet?'pointer':'default'};opacity:${prereqMet?1:0.5};" onclick="${prereqMet?`openModuleReader('${lvl}','${m.id}')`:''}" >
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="font-size:24px;">${m.icon}</div>
            <div style="flex:1;">
              <div style="font-weight:600;">${m.title}</div>
              <div style="font-size:12px;color:var(--gray-400);margin-top:2px;">${m.sections.length} sections</div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;flex-shrink:0;">
              ${read?'<span class="badge badge-green" style="font-size:11px;">Read ✓</span>':'<span class="badge" style="font-size:11px;background:var(--gray-100);">Unread</span>'}
              ${read?( kcComplete ? '<span class="badge badge-green" style="font-size:11px;">Practice ✓</span>' : '<span class="badge badge-amber" style="font-size:11px;">Practice pending</span>' ) : ''}
            </div>
          </div></div>`;
      }).join('')}
    </div>
    ${allRead&&!kcDone?`<div class="alert alert-blue" style="margin-top:16px;">💡 Complete the Knowledge Check for each module to unlock the Level Assessment.</div>`:''}
    ${allRead&&kcDone&&!passed?`<div style="text-align:center;margin-top:20px;"><button class="btn btn-primary btn-lg" onclick="startLevelAssessment('${lvl}')">🎓 Start Level Assessment</button><div style="font-size:13px;color:var(--gray-400);margin-top:8px;">20+ questions · 85% to pass · Generates your certificate</div></div>`:''}`;
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

  const sections = mod.sections;
  const total    = sections.length;
  const sec      = sections[sectionIdx];
  const isLast   = sectionIdx === total - 1;
  const alreadyRead = !!certState.records[`read_${moduleId}`];
  const kcDone   = !!certState.records[`kc_${moduleId}`];
  const hasKC    = !!(KNOWLEDGE_CHECKS[moduleId]?.length);

  const reader = document.getElementById('edu-module-reader');
  if (!reader) return;

  reader.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
      <button class="btn btn-outline btn-sm" onclick="renderModuleList('${level}')">← Back to Modules</button>
      <div style="flex:1;font-weight:600;font-size:15px;">${mod.icon} ${mod.title}</div>
      <div style="font-size:13px;color:var(--gray-400);">Section ${sectionIdx+1} of ${total}</div>
    </div>

    <!-- Progress bar -->
    <div style="height:6px;background:var(--gray-200);border-radius:3px;margin-bottom:20px;">
      <div style="height:100%;width:${Math.round(((sectionIdx+1)/total)*100)}%;background:var(--green);border-radius:3px;transition:width 0.3s;"></div>
    </div>

    <!-- Section content -->
    <div class="card" style="margin-bottom:16px;">
      <div style="border-bottom:2px solid var(--green);padding-bottom:10px;margin-bottom:16px;">
        <h3 style="margin:0;color:var(--green-dark);">${sec.h}</h3>
      </div>
      <div style="font-size:14px;line-height:1.7;color:var(--gray-700);">${sec.b}</div>
    </div>

    <!-- Navigation -->
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <button class="btn btn-outline" onclick="navModuleSection(-1)" ${sectionIdx===0?'disabled':''}>← Previous</button>
      <div style="display:flex;gap:6px;">
        ${sections.map((_,i)=>`<div style="width:10px;height:10px;border-radius:50%;background:${i<=sectionIdx?'var(--green)':'var(--gray-200)'};cursor:pointer;" onclick="jumpModuleSection(${i})"></div>`).join('')}
      </div>
      ${isLast
        ? `<button class="btn btn-primary" id="mark-read-btn" onclick="markModuleRead('${moduleId}')" ${alreadyRead?'style="background:var(--green-dark);"':''}>
            ${alreadyRead?'✅ Read Complete — Practice Again':'✅ Mark as Read &amp; Start Practice'}
          </button>`
        : `<button class="btn btn-primary" onclick="navModuleSection(1)">Next Section →</button>`
      }
    </div>

    <!-- Knowledge check section (appears after marking read) -->
    ${alreadyRead && hasKC ? `
    <div style="margin-top:24px;padding-top:20px;border-top:2px solid var(--gray-100);">
      <h3 style="margin-bottom:8px;">✏️ Knowledge Check</h3>
      <p style="color:var(--gray-400);font-size:13px;margin-bottom:12px;">Practice questions for this module — ungraded, unlimited retries, answers and questions shuffle each attempt.</p>
      ${kcDone
        ? `<div class="alert alert-green">✅ Knowledge Check complete! Return to modules to continue your certification path.</div>
           <button class="btn btn-outline btn-sm" onclick="startKnowledgeCheck('${moduleId}')">Retry Knowledge Check</button>`
        : `<button class="btn btn-primary" onclick="startKnowledgeCheck('${moduleId}')">Start Knowledge Check →</button>`
      }
    </div>` : ''}`;

  // Restore M0 ack state
  if (moduleId === 'M0_S1' && isLast) {
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
  if (moduleId === 'M0_S1') {
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
  const reader = document.getElementById('edu-module-reader');
  if (!reader) return;
  reader.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
      <button class="btn btn-outline btn-sm" onclick="renderModuleReader()">← Back to Module</button>
      <div style="flex:1;font-weight:600;">✏️ Knowledge Check</div>
      <div style="font-size:13px;color:var(--gray-400);">Question ${currentQ+1} of ${total}</div>
    </div>
    <div style="height:6px;background:var(--gray-200);border-radius:3px;margin-bottom:20px;">
      <div style="height:100%;width:${Math.round(((currentQ+1)/total)*100)}%;background:var(--gold);border-radius:3px;"></div>
    </div>
    <div class="card" style="margin-bottom:16px;">
      <div style="font-size:16px;font-weight:600;line-height:1.5;margin-bottom:20px;color:var(--green-dark);">${q.q}</div>
      <div style="display:flex;flex-direction:column;gap:8px;" id="kc-options">
        ${q.options.map((opt,i)=>`<button class="btn btn-outline" id="kc-opt-${i}" style="text-align:left;padding:12px 16px;font-size:14px;justify-content:flex-start;" onclick="kcAnswer(${i})">${String.fromCharCode(65+i)}. ${opt}</button>`).join('')}
      </div>
      <div id="kc-feedback" style="display:none;margin-top:16px;"></div>
      <div style="display:flex;justify-content:flex-end;margin-top:16px;">
        <button class="btn btn-primary" id="kc-next-btn" onclick="kcNext()" style="display:none;">Next →</button>
      </div>
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
    if (i===q.correct) { btn.style.background='var(--green)'; btn.style.color='white'; btn.style.borderColor='var(--green)'; }
    else if (i===optionIndex && !correct) { btn.style.background='var(--red)'; btn.style.color='white'; btn.style.borderColor='var(--red)'; }
  }
  const fb = document.getElementById('kc-feedback');
  if (fb) {
    fb.style.display = 'block';
    fb.className = `alert ${correct?'alert-green':'alert-red'}`;
    fb.innerHTML = correct
      ? `✅ Correct! ${q.explain||''}`
      : `❌ The correct answer is: <strong>${q.options[q.correct]}</strong>. ${q.explain||''}`;
  }
  const nxt = document.getElementById('kc-next-btn');
  if (nxt) { nxt.style.display='inline-flex'; nxt.textContent = kcState.currentQ>=kcState.questions.length-1?'Finish ✓':'Next →'; }
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

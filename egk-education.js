// ══════════════════════════════════════════
//  EduGolfKids Education Hub v2.0
// ══════════════════════════════════════════

const CERT_LEVELS = {
  M0:      { id:'M0',      label:'Model 0 — Compliance',       fullLabel:'Model 0: Foundational Compliance & Safeguarding', passPct:85, qCount:15, prereq:null, color:'#DC2626', forRoles:['coach','licensee'] },
  L1:      { id:'L1',      label:'Level 1 — Foundations',      fullLabel:'Level 1 Coach Certification — Foundations',         passPct:85, qCount:20, prereq:'M0', color:'#1B5C2A', forRoles:['coach','licensee'] },
  L2:      { id:'L2',      label:'Level 2 — Golf Skills',       fullLabel:'Level 2 Coach Certification — Golf Skills',          passPct:85, qCount:20, prereq:'L1', color:'#2980B9', forRoles:['coach','licensee'] },
  L3:      { id:'L3',      label:'Level 3 — Business Ops',      fullLabel:'Level 3 Licensee Certification — Business Operations',passPct:85, qCount:20, prereq:'L2', color:'#C9A84C', forRoles:['licensee'] },
  REFRESH: { id:'REFRESH', label:'Annual Refresher',            fullLabel:'Annual Certification Refresher',                     passPct:85, qCount:10, prereq:'L1', color:'#8B5CF6', forRoles:['coach','licensee'] },
  TDP_O:   { id:'TDP_O',   label:'TDP Orientation',             fullLabel:'TDP Orientation Certification',                      passPct:85, qCount:10, prereq:null,   color:'#1B5C2A', forRoles:['tdp'] },
  TDP_L:   { id:'TDP_L',   label:'TDP Leadership',              fullLabel:'TDP Leadership Certification',                       passPct:85, qCount:15, prereq:'TDP_O', color:'#C9A84C', forRoles:['tdp'] },
  TDP_C:   { id:'TDP_C',   label:'TDP Compliance Mastery',      fullLabel:'TDP Compliance Mastery Certification',               passPct:85, qCount:15, prereq:'TDP_L', color:'#2980B9', forRoles:['tdp'] },
};

// ── Email Notifications (via GitHub Actions + Resend) ────────────────────────
const HQ_EMAIL = 'morne.marilize@gmail.com';

async function triggerEmailWorkflow(payload) {
  try {
    const res = await fetch('https://api.github.com/repos/MorneBotha1401/edugolfkids/dispatches', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + state.githubToken, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'cert-email', client_payload: payload }),
    });
    if (!res.ok) console.warn('[EGK Email] dispatch failed:', res.status);
  } catch (e) { console.warn('[EGK Email] dispatch error:', e); }
}

function egkEmailBase(bodyContent) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{font-family:'Helvetica Neue',Arial,sans-serif;background:#F8F6F1;margin:0;padding:0;}
    .wrap{max-width:600px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(27,92,42,0.12);}
    .hdr{background:#12401C;padding:28px 36px;text-align:center;}
    .hdr-logo{color:#C9A84C;font-size:13px;letter-spacing:3px;text-transform:uppercase;font-weight:700;}
    .body{padding:36px;}
    .body h2{color:#12401C;font-size:22px;margin:0 0 16px;font-family:Georgia,serif;}
    .body p{color:#5A5A4A;font-size:15px;line-height:1.6;margin:0 0 12px;}
    .score-box{background:#F0F7F2;border:2px solid #1B5C2A;border-radius:10px;padding:20px;text-align:center;margin:20px 0;}
    .score-big{font-size:44px;font-weight:700;color:#12401C;}
    .score-label{color:#5A5A4A;font-size:13px;margin-top:6px;}
    .fail-box{background:#FEF2F2;border:2px solid #C0392B;border-radius:10px;padding:20px;text-align:center;margin:20px 0;}
    .fail-big{font-size:44px;font-weight:700;color:#C0392B;}
    .info-box{background:#FFF8EC;border:2px solid #C9A84C;border-radius:10px;padding:20px;margin:20px 0;}
    .tag{display:inline-block;background:#E8F5EC;color:#12401C;border:1px solid #1B5C2A;border-radius:6px;padding:4px 14px;font-size:13px;font-weight:600;}
    .btn-link{display:inline-block;background:#1B5C2A;color:white;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-top:20px;}
    .ftr{background:#F8F6F1;padding:20px 36px;text-align:center;font-size:12px;color:#9A9A8A;border-top:1px solid #E8E8E0;}
  </style></head><body><div class="wrap">
    <div class="hdr"><div class="hdr-logo">⛳ EduGolfKids</div></div>
    <div class="body">${bodyContent}</div>
    <div class="ftr">EduGolfKids LLC &middot; Mooresville, North Carolina &middot; edugolfkids.com</div>
  </div></body></html>`;
}

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
  const prev    = certState.records[level] || {};
  const attemptCount = (prev.attemptCount || 0) + 1;
  const prevAttempts = prev.attempts || [];
  certState.records[level] = {
    passed, score:pct, date:today, name:state.user?.name||'Coach',
    expiry:      passed ? expiry.toISOString().split('T')[0] : (prev.expiry || null),
    attemptCount,
    failDate:    passed ? null : new Date().toISOString(),
    attempts:    [...prevAttempts, { score: pct, passed, date: today }],
  };
  let usersData = certState.usersData || { users:[] };
  let users     = usersData.users || [];
  let idx       = users.findIndex(u=>u.id===state.user?.id);
  if (idx===-1) { users.push({ id:state.user?.id, name:state.user?.name, certifications:{} }); idx=users.length-1; }
  users[idx].certifications = certState.records;
  if (state.user?.email) users[idx].email = state.user.email;
  usersData.users = users;
  try { await githubPut('data/users/users.json', usersData, certState.sha, `Cert ${level} — ${state.user?.name}`); } catch(e) { console.warn('cert save failed',e); }
  const _eName = state.user?.name || 'Coach';
  const _eDef  = CERT_LEVELS[level];
  const _eDate = new Date().toISOString().split('T')[0];
  const _eExp  = certState.records[level]?.expiry || '';
  const _eAtt  = certState.records[level]?.attemptCount || 1;
  if (passed) {
    const coachBody = egkEmailBase(`
      <h2>&#127942; Congratulations, ${_eName}!</h2>
      <p>You have successfully passed the <span class="tag">${_eDef.fullLabel}</span> assessment.</p>
      <div class="score-box">
        <div class="score-big">${pct}%</div>
        <div class="score-label">Pass score &middot; Certificate valid until ${_eExp}</div>
      </div>
      <p>Log in to download your PDF certificate and start your next level.</p>
      <a class="btn-link" href="https://mornebotha1401.github.io/edugolfkids/">Open My Dashboard &rarr;</a>`);
    const hqBody = egkEmailBase(`
      <h2>Assessment Passed</h2>
      <p><strong>${_eName}</strong> has passed <span class="tag">${_eDef.label}</span>.</p>
      <div class="score-box">
        <div class="score-big">${pct}%</div>
        <div class="score-label">Date: ${_eDate} &middot; Certificate valid until ${_eExp}</div>
      </div>`);
    if (state.user?.email) triggerEmailWorkflow({ to: state.user.email, subject: 'You passed — ' + _eDef.label + ' | EduGolfKids', html: coachBody });
    triggerEmailWorkflow({ to: HQ_EMAIL, subject: '[EGK] ' + _eName + ' passed ' + _eDef.label + ' (' + pct + '%)', html: hqBody });
  } else {
    const coachBody = egkEmailBase(`
      <h2>Assessment Result — ${_eDef.label}</h2>
      <p>Hi ${_eName}, here is your result for the <span class="tag">${_eDef.fullLabel}</span> assessment.</p>
      <div class="fail-box">
        <div class="fail-big">${pct}%</div>
        <div class="score-label">85% required to pass &middot; Attempt ${_eAtt} of 3</div>
      </div>
      <div class="info-box">
        <p style="margin:0;font-size:14px;">&#8987; You can retry after a 24-hour cooling-off period.<br>Re-read the module content — questions reshuffle on every attempt.</p>
      </div>
      <a class="btn-link" href="https://mornebotha1401.github.io/edugolfkids/">Back to Study Materials &rarr;</a>`);
    const hqBody = egkEmailBase(`
      <h2>Assessment Attempt</h2>
      <p><strong>${_eName}</strong> attempted <span class="tag">${_eDef.label}</span> and did not pass.</p>
      <div class="fail-box">
        <div class="fail-big">${pct}%</div>
        <div class="score-label">Attempt ${_eAtt} of 3 &middot; Date: ${_eDate}</div>
      </div>`);
    if (state.user?.email) triggerEmailWorkflow({ to: state.user.email, subject: 'Assessment result — ' + _eDef.label + ' | EduGolfKids', html: coachBody });
    triggerEmailWorkflow({ to: HQ_EMAIL, subject: '[EGK] ' + _eName + ' attempted ' + _eDef.label + ' (' + pct + '%)', html: hqBody });
  }
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
  if (state.user?.email) users[idx].email = state.user.email;
  usersData.users = users;
  try { await githubPut('data/users/users.json', usersData, certState.sha, `M0 Ack — ${state.user?.name}`); } catch(e) { console.warn('ack save failed',e); }
  const _mName = state.user?.name || 'Coach';
  const _mDate = new Date().toISOString().split('T')[0];
  triggerEmailWorkflow({ to: HQ_EMAIL, subject: '[EGK] ' + _mName + ' acknowledged M0 Compliance', html: egkEmailBase(`
    <h2>M0 Compliance Acknowledged</h2>
    <p><strong>${_mName}</strong> has read and acknowledged the M0 Compliance &amp; Safeguarding module.</p>
    <div class="info-box">
      <p style="margin:0;font-size:14px;">Date: ${_mDate}<br>They are now cleared to complete the M0 Knowledge Check and Assessment.</p>
    </div>`) });
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
    {h:`Compliance &amp; Safeguarding`,b:`<div style="background:linear-gradient(135deg,#12401C,#1B5C2A);border-radius:12px;padding:20px;margin:0 0 24px;"><div style="font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">&#127909; Module Introduction</div><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#000;"><iframe src="https://www.youtube-nocookie.com/embed/REPLACE_M0_VIDEO_ID" title="M0 Compliance &amp; Safeguarding Introduction" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div><p style="color:rgba(255,255,255,0.6);font-size:12px;margin:10px 0 0;font-style:italic;">Watch this before working through the reading below. Replace REPLACE_M0_VIDEO_ID with your YouTube video ID.</p></div><h4 class="doc-subheading">1. Duty of Care Framework</h4>
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
    {h:`Non-Negotiable 60-Minute Session Architecture`,b:`<div style="background:linear-gradient(135deg,#12401C,#1B5C2A);border-radius:12px;padding:20px;margin:0 0 24px;"><div style="font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">&#127909; Module Introduction</div><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#000;"><iframe src="https://www.youtube-nocookie.com/embed/REPLACE_L1_VIDEO_ID" title="L1 Foundations Introduction" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div><p style="color:rgba(255,255,255,0.6);font-size:12px;margin:10px 0 0;font-style:italic;">Watch this before working through the reading below. Replace REPLACE_L1_VIDEO_ID with your YouTube video ID.</p></div><div class="doc-section-rule"></div>
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
REFRESH:[],

TDP_O:[{
  id:"TDP_O",
  title:"TDP Orientation",
  icon:"🤝",
  sections:[
    {h:"The EduGolfKids Business Model",b:`<h4 class="doc-subheading">1. What EduGolfKids Is</h4>
<p class="doc-p"><strong>EduGolfKids is a structured, school-based junior golf education platform delivered by certified coaches through licensed territory operators.</strong></p>
<ul class="doc-list"><li>HQ designs the curriculum, certifies coaches, and maintains brand standards</li><li>Licensees operate territories, recruit schools, manage coaches, and collect student revenue</li><li>TDPs recruit and develop licensees within defined geographic regions</li></ul>
<h4 class="doc-subheading">2. The Revenue Model</h4>
<p class="doc-p"><strong>Revenue flows at three levels:</strong></p>
<ul class="doc-list"><li><strong>Student Revenue:</strong> Licensees charge parents $20 per student per session (7-student cap per class)</li><li><strong>License Fee:</strong> Licensees pay HQ $500/month regardless of student count</li><li><strong>TDP Commission:</strong> TDPs earn $150/month per active licensee in their territory</li></ul>
<h4 class="doc-subheading">3. The TDP Role</h4>
<p class="doc-p"><strong>A Territory Development Partner (TDP) is the regional growth engine of EduGolfKids.</strong></p>
<ul class="doc-list"><li>Recruit, vet, and onboard licensees within their assigned region</li><li>Support licensees through the first 90 days of operation</li><li>Monitor licensee compliance and performance monthly</li><li>Represent EduGolfKids brand values in all territory interactions</li></ul>
<p class="doc-p"><strong>TDPs do not manage coaches or deliver sessions — those responsibilities belong to the licensee.</strong></p>
<h4 class="doc-subheading">4. Territory Boundaries</h4>
<ul class="doc-list"><li>Each TDP is assigned a defined geographic territory — typically 2–4 counties or a metro region</li><li>TDPs may not recruit licensees outside their assigned territory without HQ approval</li><li>Territory overlap with other TDPs is not permitted</li></ul>
<h4 class="doc-subheading">5. HQ Relationship</h4>
<ul class="doc-list"><li>TDPs report monthly to their HQ Regional Manager</li><li>Monthly report must include: active licensee count, pipeline count, compliance status, any escalations</li><li>HQ retains final authority over licensee approvals, terminations, and territory disputes</li></ul>`},
    {h:"Commission Structure & Performance Standards",b:`<h4 class="doc-subheading">1. Commission Calculation</h4>
<p class="doc-p"><strong>Commission = Active Licensees × $150/month</strong></p>
<p class="doc-p">A licensee is "active" when:</p>
<ul class="doc-list"><li>License agreement is signed and first fee paid</li><li>At least one school contract is active</li><li>No suspension or remediation holds are in place</li></ul>
<h4 class="doc-subheading">2. Commission Payment Timeline</h4>
<ul class="doc-list"><li>Paid by the 15th of the following month</li><li>Requires submission of monthly TDP report by the 5th</li><li>Disputed commissions must be raised within 30 days</li></ul>
<h4 class="doc-subheading">3. Performance Expectations</h4>
<p class="doc-p"><strong>Year 1 targets:</strong></p>
<ul class="doc-list"><li>Minimum 3 active licensees by month 6</li><li>Minimum 5 active licensees by month 12</li><li>All licensees compliant with monthly reporting</li><li>Zero unresolved compliance escalations older than 30 days</li></ul>
<h4 class="doc-subheading">4. Performance Review</h4>
<ul class="doc-list"><li>Quarterly performance reviews with HQ Regional Manager</li><li>Failure to meet Year 1 minimums triggers a Performance Improvement Plan (PIP)</li><li>Two consecutive quarters below minimum may result in territory reassignment</li></ul>
<h4 class="doc-subheading">5. Intellectual Property</h4>
<ul class="doc-list"><li>All EduGolfKids materials, curriculum, and systems remain HQ property</li><li>TDPs may not create derivative materials without written HQ approval</li><li>TDP branding must always use the EduGolfKids name and logo in accordance with brand guidelines</li></ul>`},
  ]
}],
TDP_L:[{
  id:"TDP_L",
  title:"TDP Leadership",
  icon:"📋",
  sections:[
    {h:"Licensee Recruitment & Onboarding",b:`<h4 class="doc-subheading">1. Ideal Licensee Profile</h4>
<p class="doc-p"><strong>EduGolfKids licensees must meet the following minimum profile:</strong></p>
<ul class="doc-list"><li>Passion for youth sport and education</li><li>Basic business management capability (does not need to be an experienced entrepreneur)</li><li>Access to startup capital ($3,000–$8,000 for equipment, insurance, and launch costs)</li><li>Network or access to local school administrators</li><li>Ability to pass background screening requirements</li></ul>
<h4 class="doc-subheading">2. Disqualifying Factors</h4>
<ul class="doc-list"><li>Criminal record involving children or fraud</li><li>Failed background screening</li><li>Active bankruptcy or insolvency proceedings</li><li>Prior EduGolfKids licensee termination for cause</li></ul>
<h4 class="doc-subheading">3. The Recruitment Process</h4>
<p class="doc-p"><strong>6-step recruitment funnel:</strong></p>
<ul class="doc-list"><li><strong>Step 1 — Discovery:</strong> Initial 30-min conversation to present the opportunity</li><li><strong>Step 2 — Interest Form:</strong> Candidate completes the EGK Licensee Interest Form</li><li><strong>Step 3 — HQ Review:</strong> TDP submits form to HQ; HQ approval required before proceeding</li><li><strong>Step 4 — Due Diligence:</strong> Background check, reference check, financial review</li><li><strong>Step 5 — Agreement:</strong> License Agreement signed, first fee paid</li><li><strong>Step 6 — Onboarding:</strong> 90-day structured launch programme begins</li></ul>
<h4 class="doc-subheading">4. TDP Authority Limits</h4>
<p class="doc-p"><strong>TDPs CANNOT:</strong></p>
<ul class="doc-list"><li>Sign licensees without HQ approval</li><li>Negotiate license fee discounts</li><li>Offer verbal commitments on behalf of HQ</li><li>Access a licensee's financial data directly</li></ul>
<h4 class="doc-subheading">5. The 90-Day Onboarding Programme</h4>
<ul class="doc-list"><li><strong>Week 1–2:</strong> Certification path begins (M0, L1); equipment ordered; legal reviewed</li><li><strong>Week 3–4:</strong> First school meetings facilitated by TDP; insurance confirmed</li><li><strong>Month 2:</strong> First class launched; TDP attends first session as observer</li><li><strong>Month 3:</strong> Second school added; TDP conducts first monthly review</li><li>TDP submits 90-day onboarding report to HQ at close of month 3</li></ul>`},
    {h:"Licensee Performance Monitoring",b:`<h4 class="doc-subheading">1. Monthly TDP Review Standards</h4>
<p class="doc-p"><strong>Every licensee in the TDP's territory must be reviewed monthly against:</strong></p>
<ul class="doc-list"><li>Active school count and attendance trends</li><li>Coach certification status (all coaches current)</li><li>Invoice payment record (no overdue HQ invoices)</li><li>Session submission record (all sessions logged within 48 hours)</li><li>Incident report record (all incidents reported within 24 hours)</li></ul>
<h4 class="doc-subheading">2. Performance Tiers</h4>
<ul class="doc-list"><li><strong>Green (Compliant):</strong> All standards met. Monthly check-in sufficient.</li><li><strong>Amber (At Risk):</strong> One or more standards missed. Documented support call required within 7 days.</li><li><strong>Red (Non-Compliant):</strong> Two or more standards missed or one serious breach. HQ escalation required within 24 hours.</li></ul>
<h4 class="doc-subheading">3. Support Calls (Amber Status)</h4>
<p class="doc-p">TDP must conduct a documented support call covering:</p>
<ul class="doc-list"><li>Root cause of the missed standard</li><li>Agreed action plan with specific deadlines</li><li>TDP follow-up date confirmed</li></ul>
<h4 class="doc-subheading">4. Escalation Procedure (Red Status)</h4>
<ul class="doc-list"><li>TDP notifies HQ within 24 hours of Red classification</li><li>HQ and TDP jointly conduct a Remediation Call with the licensee within 5 business days</li><li>A formal Remediation Plan is issued — licensee has 30 days to return to Green</li><li>Failure to reach Green within 30 days may result in suspension or termination by HQ</li></ul>
<h4 class="doc-subheading">5. Growth Conversations</h4>
<ul class="doc-list"><li>TDPs should conduct quarterly growth conversations with each Green licensee</li><li>Topics: additional school targets, coach development, referral opportunities</li><li>Document outcomes in the HQ platform</li></ul>`},
  ]
}],
TDP_C:[{
  id:"TDP_C",
  title:"TDP Compliance Mastery",
  icon:"🛡️",
  sections:[
    {h:"Compliance Standards & Monitoring",b:`<h4 class="doc-subheading">1. What TDP Compliance Covers</h4>
<p class="doc-p"><strong>TDPs are responsible for monitoring compliance across three dimensions:</strong></p>
<ul class="doc-list"><li><strong>Operational:</strong> Sessions logged, attendance submitted, incident reports filed on time</li><li><strong>Financial:</strong> HQ invoices paid, coach payroll processed, revenue records accurate</li><li><strong>Safety:</strong> Coach certifications current, insurance valid, safeguarding standards maintained</li></ul>
<h4 class="doc-subheading">2. Non-Negotiable Standards</h4>
<p class="doc-p"><strong>The following have zero grace periods — immediate HQ escalation required:</strong></p>
<ul class="doc-list"><li>Expired Sexual Abuse and Molestation (SAM) insurance endorsement</li><li>Coach operating without current M0 certification</li><li>Safeguarding breach of any kind</li><li>Failure to report a child safety incident within 24 hours</li></ul>
<h4 class="doc-subheading">3. Annual Renewal Cycle</h4>
<p class="doc-p"><strong>Every licensee must complete the following annually:</strong></p>
<ul class="doc-list"><li>License Agreement renewal (signed 30 days before expiry)</li><li>Insurance renewal (GL + SAM; certificates sent to HQ before expiry)</li><li>Coach recertification (REFRESH assessment for all coaches due in the renewal month)</li><li>Annual compliance audit (TDP-led; report submitted to HQ within 14 days)</li></ul>
<h4 class="doc-subheading">4. TDP-Led Audit Procedure</h4>
<p class="doc-p"><strong>Annual audit checklist (conducted by TDP, documented in platform):</strong></p>
<ul class="doc-list"><li>Verify all coach certification records — no expired certs</li><li>Confirm insurance certificates are current (GL and SAM)</li><li>Review 3 months of session logs — confirm 100% submission within 48-hour window</li><li>Review incident report log — confirm all incidents reported within 24 hours</li><li>Confirm licensee has completed their own annual REFRESH certification</li><li>Review payroll records — coach payments documented for all sessions in last 3 months</li></ul>
<h4 class="doc-subheading">5. Remediation Standards</h4>
<p class="doc-p"><strong>When a compliance gap is identified during audit:</strong></p>
<ul class="doc-list"><li>Minor gaps (first occurrence, non-safety): Document, issue written guidance, set 14-day correction deadline</li><li>Repeat minor gaps: Escalate to HQ, issue formal Compliance Warning</li><li>Major gaps (safety, financial, or repeat): Immediate HQ escalation. Sessions may be suspended pending resolution.</li></ul>`},
    {h:"Reporting Standards & TDP Obligations",b:`<h4 class="doc-subheading">1. Monthly TDP Report to HQ</h4>
<p class="doc-p"><strong>Required by the 5th of each month, covering the previous month:</strong></p>
<ul class="doc-list"><li>Active licensee count with status summary (Green/Amber/Red)</li><li>Pipeline summary (candidates in recruitment process)</li><li>Open compliance issues and escalation status</li><li>Commission reconciliation — confirm active licensee count</li><li>Any significant licensee risk factors</li></ul>
<h4 class="doc-subheading">2. Incident Escalation Timeline</h4>
<ul class="doc-list"><li><strong>Safeguarding incident:</strong> TDP notified by licensee → TDP notifies HQ within 2 hours</li><li><strong>Serious injury:</strong> TDP notified → TDP notifies HQ within 4 hours</li><li><strong>Compliance breach:</strong> TDP notifies HQ within 24 hours</li><li><strong>Financial dispute:</strong> TDP notifies HQ within 3 business days</li></ul>
<h4 class="doc-subheading">3. Confidentiality Obligations</h4>
<ul class="doc-list"><li>TDPs may not share licensee financial information with third parties</li><li>Child and family data encountered during compliance activities must be treated as strictly confidential</li><li>Recruitment candidate information must not be shared between candidates</li></ul>
<h4 class="doc-subheading">4. TDP Self-Compliance</h4>
<p class="doc-p"><strong>TDPs must maintain their own compliance:</strong></p>
<ul class="doc-list"><li>All three TDP certifications current (TDP_O, TDP_L, TDP_C)</li><li>Monthly reports submitted on time</li><li>Background screening current (renewed every 3 years)</li><li>No active HQ warnings or PIPs</li></ul>
<h4 class="doc-subheading">5. Consequences of TDP Non-Compliance</h4>
<ul class="doc-list"><li>Missed monthly report: $150 commission held until report submitted</li><li>Recurring missed reports (2+): Performance Improvement Plan issued</li><li>Safeguarding breach by TDP: Immediate suspension pending HQ investigation</li><li>Fraudulent reporting: Immediate termination</li></ul>`},
  ]
}],
};


// ══════════════════════════════════════════
//  LESSON PLAN TEMPLATES (post-L1 unlock)
// ══════════════════════════════════════════
const LESSON_TEMPLATES = {
'4-5': {
  label:'Ages 4–5', ltad:'Active Start', color:'#DC2626',
  lessons:[
    { n:1,  title:'Meet the Club',        focus:'Equipment familiarisation & grip',
      wu:  { name:'Freeze Dance Golf',   desc:'Music plays — children walk around the space with their club resting on the ground. When music stops: freeze in a "golf pose". No clubs off the ground during movement.' },
      sk:  { name:'Grip & Stance',        drill:'Show "shake hands with the club." Dominant hand below, light pressure. Feet shoulder-width, toes forward. Children find their own setup.',
             constraint:'Tap the ball with your best handshake — can it roll to the cone?',
             note:'Accept any grip that is safe. Praise the contact, not the technique.' },
      gm:  { name:'Rolling Ball Relay',   setup:'3 targets at 6 ft, 8 ft, 10 ft.',
             rules:'Roll ball from start to each target using the shake-hands grip. Count how many stops it takes.',
             constraint:'Level up: roll ball through two cones (gate) before the target.' },
      wu2: { q:'What did the club feel like in your hands?', success:'Every child held the club safely and tapped a ball.' } },

    { n:2,  title:'The Magic Roll',       focus:'Putting — pendulum stroke',
      wu:  { name:'Tick Tock Robots',    desc:'Children stand in place and swing arms pendulum-style — slow, even tempo. Coach calls "tick... tock... tick... tock." Get progressively slower.' },
      sk:  { name:'Pendulum Stroke',      drill:'Rock both arms together like a clock pendulum. Eyes over the ball. "Tick" = back, "tock" = through. No wrists.',
             constraint:'Tap through 3 different distances using only your tick-tock.',
             note:'If a child flips the wrists, hold a second club across their wrists as a feedback barrier.' },
      gm:  { name:'Colour Zone Putting',  setup:'3 coloured hoops at 4 ft, 7 ft, 10 ft (red, blue, gold).',
             rules:'Each child gets 3 putts. Name the colour before putting. Score 3 pts for gold, 2 for blue, 1 for red.',
             constraint:'Level up: putt with eyes closed on the red hoop.' },
      wu2: { q:'Show me your tick-tock with no ball.', success:'Children reproduce pendulum motion independently.' } },

    { n:3,  title:'Aim It',              focus:'Face alignment & target awareness',
      wu:  { name:'Rocket Cones',        desc:'4 coloured cones spread around the space. Coach calls a colour — children run to it and pose like a rocket. Vary speed: "slow rocket... fast rocket!"' },
      sk:  { name:'Face Alignment',       drill:'Lay a yard stick or rope on the ground pointing at target. Place putter face along it. Children find what "square" feels like with tactile feedback.',
             constraint:'Remove the rope — can you still find square using only your eyes?',
             note:'Name the target before every stroke. "Where is your putter face pointing?"' },
      gm:  { name:'Bullseye Putting',     setup:'Draw 3 concentric circles with chalk or rope. 10 pts centre, 5 pts middle, 2 pts outer.',
             rules:'5 putts each from 6 ft. Track scores. Celebrate every circle.',
             constraint:'Level up: choose your own distance from any point around the circles.' },
      wu2: { q:'How do you make the ball go exactly where you want?', success:'Each child points putter face intentionally before stroke.' } },

    { n:4,  title:'The Gate',            focus:'Accuracy — gate drill putting',
      wu:  { name:'Giant Golf Steps',    desc:'Walk between stations using exaggerated giant steps. Count steps aloud. Compare: who can cross the space in fewest steps? Most steps?' },
      sk:  { name:'Gate Drill',           drill:'Two tees 1 putter-head apart. Roll ball between the gate without touching tees. Start 3 ft, extend to 6 ft.',
             constraint:'Add a second gate 2 ft in front of the first — thread both gates.',
             note:'If a child consistently hits one tee, have them observe putter face direction at contact.' },
      gm:  { name:'Gate Racing',          setup:'3 gates in a row, 2 ft apart. Individual or pairs.',
             rules:'Count how many putts to get through all 3 gates. Lowest score after 5 attempts wins.',
             constraint:'Level up: gates at angles — ball must change direction between gates.' },
      wu2: { q:'What happens to the ball if you hit the gate?', success:'Children diagnose their own gate hits.' } },

    { n:5,  title:'Near and Far',        focus:'Distance control — soft & firm strokes',
      wu:  { name:'Animal Safari',       desc:'Gallop like horses to the blue cone, creep like tigers to the red cone, stomp like elephants to the gold cone. Coach calls animal + colour.' },
      sk:  { name:'Soft vs Firm',         drill:'Two targets: soft target 3 ft, firm target 9 ft. Children practice deliberate soft tap and deliberate firm push — different swing lengths.',
             constraint:'Call it before you putt: "soft" or "firm." Score if ball stops within 1 foot of target.',
             note:'Use swing length as the language: "short arm swing for close, long arm swing for far."' },
      gm:  { name:'Distance Ladder',      setup:'Targets at 3 ft, 6 ft, 9 ft, 12 ft.',
             rules:'Each child works up the ladder. Must land within 1 putter length to advance. 3 putts per rung.',
             constraint:'Level up: add a target at 15 ft. Name the distance before putting.' },
      wu2: { q:'What do you do differently to make the ball go far?', success:'Children adjust swing length intentionally.' } },

    { n:6,  title:'The Big Chip',        focus:'Chipping introduction — "big putt" motion',
      wu:  { name:'Robot Arms',          desc:'Arms locked straight, swing pendulum. "Robot arms can\'t bend at the elbows." Move around the space in robot style, swinging arms.' },
      sk:  { name:'Chip with 7-iron',     drill:'Ball on low tee. Putter grip on 7-iron. Straight arms, no wrist hinge. Ball lands and rolls — "it\'s a big putt that goes up and forward."',
             constraint:'Move the ball off the tee onto the ground — same motion with a ball on the ground.',
             note:'Leaning shaft forward slightly (hands ahead of ball) helps compression — use a visual marker.' },
      gm:  { name:'Hula Hoop Landing',    setup:'Hula hoop 12–15 ft from striking zone on turf or mat.',
             rules:'5 chips each. Score 3 pts for landing inside hoop, 1 pt for landing within 1 putter length.',
             constraint:'Level up: move hoop to 20 ft. Add a roll-out target 5 ft past the hoop.' },
      wu2: { q:'How is a chip different from a putt?', success:'Children describe "up then rolling" vs "just rolling."' } },

    { n:7,  title:'Golf Cricket',        focus:'Putting — cooperation & game context',
      wu:  { name:'Follow the Coach',    desc:'Coach performs slow movement sequences — children mirror exactly. Start simple, add more steps. Children take turns being the leader.' },
      sk:  { name:'Putting Circuit',      drill:'4 stations at different distances. Children rotate every 2 minutes. Focus: gate at station 1, distance at station 2, aim at station 3, choice at station 4.',
             constraint:'At each station, name the focus before you putt.',
             note:'Keep children moving between stations — minimize wait time.' },
      gm:  { name:'Golf Cricket',         setup:'Scoring zones like cricket: boundary = 6, inner = 4, midfield = 2, near = 1.',
             rules:'Putt from set distance. Score based on zone where ball stops. Play 5 "overs" (5 putts each). Add scores.',
             constraint:'Level up: batting team chooses target direction, fielding team sets one blocker cone.' },
      wu2: { q:'What was your favourite station today?', success:'Children self-identify their strongest putting skill.' } },

    { n:8,  title:'Partner Putting',     focus:'Social skill — turn-taking & peer observation',
      wu:  { name:'Mirror Partners',     desc:'Pairs face each other. One leads slow movement, other mirrors. Switch leader every 30 seconds. Hands must always be visible.' },
      sk:  { name:'Peer Teaching',        drill:'Coach demonstrates incorrect stance (closed face, wrong grip). Children identify and correct. Then pairs watch each other and give one positive observation.',
             constraint:'"Tell your partner one thing they did really well."',
             note:'Keep feedback language positive: "I noticed your swing was smooth" not "you did it wrong."' },
      gm:  { name:'Best Ball Pairs',      setup:'4-station mini putting course.',
             rules:'Partners putt from same spot — best shot advances. Both take next shot from best ball position. 4 holes, add scores.',
             constraint:'Level up: one partner putts with eyes closed on every second hole.' },
      wu2: { q:'Why is it important to wait for your partner?', success:'All children demonstrate safe waiting behaviour.' } },

    { n:9,  title:'Obstacle Golf',       focus:'Direction control — putting around obstacles',
      wu:  { name:'Cone Maze Walk',      desc:'Cones set in a winding path. Walk through without touching any cone. Add speed rounds — fastest clean walk.' },
      sk:  { name:'Around the Cone',      drill:'One cone as obstacle between ball and target. Must putt around left or right side. Choose the side before putting.',
             constraint:'Three consecutive makes before moving to the next obstacle configuration.',
             note:'If children are struggling, bring the obstacle closer so ball only needs to skirt it slightly.' },
      gm:  { name:'4-Station Obstacle Course', setup:'4 stations with different obstacle configurations.',
             rules:'Complete each station by holing (or reaching target). Count total putts across all 4 stations. Fewest putts wins.',
             constraint:'Level up: add a time element — complete the full course in under 4 minutes.' },
      wu2: { q:'What was the hardest obstacle and how did you solve it?', success:'Children attempt problem-solving language.' } },

    { n:10, title:'Celebration Day',     focus:'Review, showcase & term celebration',
      wu:  { name:"Children's Choice",   desc:'Coach asks: "What is your favourite warm-up game from this term?" Class votes — top 2 played.' },
      sk:  { name:'My Best Skill',        drill:'Each child chooses one skill they are most proud of and demonstrates it for the group. Group gives 3 claps of encouragement.',
             constraint:'Can you teach your skill to a partner in 30 seconds?',
             note:'No evaluation — pure celebration. Every demonstration gets positive acknowledgement.' },
      gm:  { name:'Mini 3-Hole Tournament', setup:'3 putting holes at age-appropriate distances.',
             rules:'Every child completes all 3 holes. Record scores. Everyone receives a "Graduate" sticker or certificate.',
             constraint:'Children can choose any putter grip — "use your very best one."' },
      wu2: { q:'What is one thing you learned this term that surprised you?', success:'Every child can name at least one skill.' } },

    // ── Q2: Growing Confidence ─────────────────────────────────────────────
    { n:11, title:'Moving Ball Game',   focus:'Striking a gently rolling ball',
      wu:  { name:'Ball Chase',         desc:'Coach rolls balls slowly across the space. Children try to stop each ball with their club before it reaches the end line. No picking up — only clubs.' },
      sk:  { name:'Track & Strike',      drill:'Place ball on a gentle slope so it rolls slowly away. Child chases and strikes before it reaches a cone. Repeat from both sides.',
             constraint:'Tap a moving ball to a partner 3 m away.',
             note:'Reward any clean contact — tracking a moving object is a major developmental milestone at this age.' },
      gm:  { name:'Hoop Relay',          setup:'Two hoops 3 m apart per pair.',
             rules:'Roll ball through both hoops in sequence using only the club. First pair to complete 5 exchanges wins.',
             constraint:'Level up: roll back with non-dominant hand on the club.' },
      wu2: { q:'How did you track the ball with your eyes?', success:'Every child made contact with a moving ball at least once.' } },

    { n:12, title:'Partner Relay',      focus:'Cooperation and communication',
      wu:  { name:'Mirror Move',         desc:'Pairs face each other. One leads slow movement, partner mirrors every motion for 30 seconds. Swap leader.' },
      sk:  { name:'Pass & Receive',      drill:'Sit opposite partner 3 m apart. Gently roll ball to partner using putting grip. Partner traps with club and returns.',
             constraint:'Increase distance to 5 m — still using only the pendulum stroke.',
             note:'Develops spatial awareness and gentle force control — foundational putting skills.' },
      gm:  { name:'Gate Relay',          setup:'3 hoops in a line, 2 m apart.',
             rules:'Each pair rolls ball through all three hoops in order. First pair to complete three full rounds wins.',
             constraint:'Level up: return leg with non-dominant hand only.' },
      wu2: { q:'What did you have to do to help your partner succeed?', success:'Children articulate aiming carefully or rolling softly.' } },

    { n:13, title:'Big Swing!',         focus:'Free full-arm swing — no technique pressure',
      wu:  { name:'Swing the Rainbow',  desc:'Arms wide, feet apart, swing both arms from one side to the other, imagining painting a huge rainbow. No club — just arms. Get as big as possible.' },
      sk:  { name:'Full Swing Attempt', drill:'Take non-dominant hand off club. Swing as big as possible, one-handed. No technique feedback — celebrate big free movement.',
             constraint:'Can the ball reach the far cone? Show me the biggest swing you can make.',
             note:'At this age a large free swing develops shoulder mobility. Never correct technique here.' },
      gm:  { name:'Distance Monster',   setup:'Rope line 4 m from hitting zone.',
             rules:'Each child gets 3 attempts to hit ball past the line. The distance monster is defeated if the ball crosses.',
             constraint:'Level up: move the line back 1 m if every child succeeds.' },
      wu2: { q:'Show me the biggest swing you can make with just your arms.', success:'Every child swings freely past hip height on both sides.' } },

    { n:14, title:'Target Maze',        focus:'Directional control through an obstacle course',
      wu:  { name:'Obstacle Walk',      desc:'Coach sets 5 cones in a winding path. Children walk the path rolling a ball with their foot, then repeat with the club.' },
      sk:  { name:'Maze Golf',           drill:'4 cones in a curved path — child must roll ball through each gate in order.',
             constraint:'Complete the maze in 5 touches or fewer.',
             note:'Encourage planning ahead — "which gate is next?" Develops spatial sequencing.' },
      gm:  { name:'Cone City',           setup:'9 cones scattered randomly.',
             rules:'Roll balls to knock down as many cones as possible in 3 attempts. Count and reset.',
             constraint:'Level up: hit only coloured cones (alternating colours).' },
      wu2: { q:'How did you decide which way to aim?', success:'Children show deliberate directional intent before each shot.' } },

    { n:15, title:'Kick & Putt',        focus:'Comparing foot and hand-eye coordination',
      wu:  { name:'Soccer Golf',         desc:'Children kick a ball to a target from 5 m — 3 attempts each. Observe accuracy.' },
      sk:  { name:'Compare Methods',     drill:'Same target, same distance — now use the putter with pendulum stroke. Compare: which felt more accurate?',
             constraint:'Compare foot vs club — which hits the target more often from 4 m?',
             note:'Many children find putting more accurate because the pendulum is repeatable. This builds confidence in the club.' },
      gm:  { name:'Combo Course',        setup:'3 holes, each 6 m.',
             rules:'Each hole played twice — once kicked, once putted. Score 1 pt per hole for accuracy.',
             constraint:'Level up: non-dominant foot AND non-dominant hand grip.' },
      wu2: { q:'Which was easier — foot or club? Why do you think?', success:'Children experience that technique can be more reliable than raw power.' } },

    { n:16, title:'Follow the Leader',  focus:'Rhythm and tempo exploration',
      wu:  { name:'Speed Dial',          desc:'Coach swings very slowly, then normal, then fast. Children mirror each tempo. Ask: which felt most in control?' },
      sk:  { name:'Tempo Training',      drill:'Swing in slow motion (5 seconds back, 5 through). Then normal. Then fast. Count: "one-and-two" for slow, "tick-tock" for normal.',
             constraint:'Tap a ball softly 3 m to a target using only slow-motion tempo.',
             note:'Slow is a gateway to good. Children who rush benefit enormously from exaggerated slow-motion work.' },
      gm:  { name:'Tempo Simon Says',   setup:'Coach calls tempos: fast, slow, normal.',
             rules:'Children swing to the called tempo without stopping. Failure to match = sit out one round.',
             constraint:'Level up: a child takes over as the tempo caller.' },
      wu2: { q:'Show me what slow-motion golf feels like.', success:'Every child reproduces a recognizable slow swing on command.' } },

    { n:17, title:'Knock Down Golf',    focus:'Striking at vertical targets — directional intent',
      wu:  { name:'Cone Stack',          desc:'Children stack 3 cones and try to knock them over with a gentle underhand roll from 3 m (warm-up only — no clubs yet).' },
      sk:  { name:'Pin Golf',            drill:'Set 5 cones 4 m from starting mat. Strike ball to knock over as many pins as possible.',
             constraint:'Try to hit only the middle pin on purpose — can you direct the ball to one specific target?',
             note:'Introduce aiming at something specific rather than just hitting hard.' },
      gm:  { name:'Bowling League',      setup:'10 cones per pair set like bowling pins 5 m away.',
             rules:'3 balls each. Score = cones knocked down. Reset after 3 balls.',
             constraint:'Level up: place one guard cone in front that must be avoided.' },
      wu2: { q:'What did you aim at before you hit?', success:'Every child demonstrates deliberate aim before at least one shot.' } },

    { n:18, title:'Giant Golf',         focus:'Joyful play with oversized equipment',
      wu:  { name:'Big Ball Challenge', desc:'Introduce large foam balls. Children try to move them with a standard club. Observe how they adapt.' },
      sk:  { name:'Noodle Swing',        drill:'Use foam swim noodles as clubs and large balls. Full swings, targets, no pressure.',
             constraint:'Can you hit the big ball further than your partner using your noodle?',
             note:'Breaking the movement pattern with different equipment resets learning and releases tension.' },
      gm:  { name:'Giant League',        setup:'Large cones as targets, big foam balls.',
             rules:'Free play — any style of safe strike is allowed. Celebrate creativity.',
             constraint:'Level up: use only the thin end of the noodle (precision challenge).' },
      wu2: { q:'Did golf feel different with the big ball? What changed?', success:'Every child swings with complete freedom and joy.' } },

    { n:19, title:'Sound Golf',         focus:'Responding to audio cues — coachability',
      wu:  { name:'Signal Practice',     desc:'Coach establishes signals: FREEZE = stop, SWING = one swing, WALK = move to new spot, SIT = sit down. Practice all 4.' },
      sk:  { name:'Signal Golf',          drill:'Free putting practice. Coach calls signals randomly. Children respond immediately regardless of where they are in their swing.',
             constraint:'When the coach rings a bell, hold your finish position.',
             note:'This is a coachability exercise — children who can stop mid-action and change behaviour are highly trainable.' },
      gm:  { name:'Sound Round',         setup:'3-hole putting course.',
             rules:'Coach interrupts play randomly with signals. Failure to respond correctly = redo the previous shot.',
             constraint:'Level up: a child takes over calling signals.' },
      wu2: { q:'How did it feel when the sound interrupted your swing?', success:'Every child demonstrated the ability to stop and restart on command.' } },

    { n:20, title:'Q2 Showcase',        focus:'Review and celebrate Q2 skills',
      wu:  { name:'Favourite Drill',     desc:'Each child calls out their favourite activity from Q2. Coach leads the top vote-getter for 3 minutes.' },
      sk:  { name:'Best Shot Station',   drill:'4 stations: moving ball tap, partner relay, maze golf, pin bowling. Children rotate every 3 minutes — no scoring, just try.',
             constraint:'At each station: can you do it better than the first time you tried it?',
             note:'The goal is confidence and recall, not assessment. Praise every effort.' },
      gm:  { name:'Q2 Team Challenge',  setup:'All 4 stations running simultaneously.',
             rules:'Teams must complete all 4 stations collectively. Total team score = sum of successful hits.',
             constraint:'Celebrate if team score beats the target (set low to ensure success).' },
      wu2: { q:'What is one new thing you learned in Q2 that you could not do before?', success:'Every child names one genuine skill gained in Q2.' } },

    // ── Q3: Playing Together ───────────────────────────────────────────────
    { n:21, title:'Team Targets',       focus:'Cooperative ball games',
      wu:  { name:'Circle Roll',         desc:'Children sit in a large circle, legs out. Roll ball across the circle to any child who must stop it with their club.' },
      sk:  { name:'All-In Target',       drill:'One large target hoop 5 m away. Team wins when every child has putted a ball into it.',
             constraint:'Each child must use a different technique (putt, roll, chip).',
             note:'Cooperative goals develop empathy — faster children naturally learn to wait and encourage slower peers.' },
      gm:  { name:'Flood the Target',   setup:'One large hoop 6 m away.',
             rules:'Team score = how many balls in the hoop after 5 minutes. Reset and beat your score.',
             constraint:'Level up: coach adds obstacles as team improves.' },
      wu2: { q:'What did you do to help your team?', success:'Children articulate specific helping behaviours.' } },

    { n:22, title:'Storybook Course',   focus:'Imagination and narrative play',
      wu:  { name:'Story Introduction', desc:'Coach tells a short golf story: "Today we play through the Enchanted Forest. Hole 1 is the Dragon Gate, Hole 2 is the Fairy Castle, Hole 3 is the Magic Lake."' },
      sk:  { name:'Enchanted Strokes',  drill:'Each hole has a story element: Dragon Gate = ball must roll under a low obstacle. Fairy Castle = stop inside a hoop. Magic Lake = ball must cross a blue mat.',
             constraint:'Each child narrates their own shot: "I am the brave knight shooting through the Dragon Gate!"',
             note:'Narrative play is age-appropriate and deeply motivating for 4-5 year olds.' },
      gm:  { name:'Storybook Round',    setup:'3 holes with story obstacles.',
             rules:'No scoring — complete the story. Every child plays every hole.',
             constraint:'Children can add one detail to the story before each hole begins.' },
      wu2: { q:'Tell me your favourite part of the golf story.', success:'Every child was engaged, imaginative, and physically active throughout.' } },

    { n:23, title:'Shadow Golf',        focus:'Mirroring and body awareness',
      wu:  { name:'Mirror Mirror',      desc:'Pairs face each other. One leads slow arm movements, other mirrors exactly. Switch after 30 seconds.' },
      sk:  { name:'Shadow Swing',        drill:'One child swings, partner stands behind and mirrors the exact movement simultaneously. Then switch.',
             constraint:'Can the shadow match the leader perfectly from setup to finish?',
             note:'Builds self-awareness in leaders and observation skills in shadows.' },
      gm:  { name:'Shadow Freeze',      setup:'Pairs scattered around space.',
             rules:'Leader swings at half speed. Coach calls FREEZE randomly. Shadows must hold their mirror position.',
             constraint:'Level up: leader calls FREEZE themselves at the top of the backswing.' },
      wu2: { q:'What part was hardest to copy — the start or the finish?', success:'Children identify a specific body part they had to watch carefully.' } },

    { n:24, title:'Fast & Slow',        focus:'Tempo exploration — control through speed',
      wu:  { name:'Tempo Dance',         desc:'Music at slow tempo — children move in slow motion. Fast music — quick movement. Silence = golf speed.' },
      sk:  { name:'Two-Tempo Challenge', drill:'Strike ball with a slow swing (count to 3), then fast. Compare distance and accuracy.',
             constraint:'Slow swing only — putt to a target 4 m away. Is slow more accurate?',
             note:'Children almost always discover slow is more accurate — a powerful self-discovery moment.' },
      gm:  { name:'Tempo Target',        setup:'Three targets at 2 m, 4 m, 6 m.',
             rules:'Slow swing must land in the 2 m zone. Normal = 4 m. Fast = 6 m. Score 3 pts for correct zone.',
             constraint:'Can you use tempo to control distance without changing where you aim?' },
      wu2: { q:'What did slow tempo feel like?', success:'Children describe slow tempo with physical sensations.' } },

    { n:25, title:'Design-a-Hole',      focus:'Creativity, ownership, and spatial reasoning',
      wu:  { name:'Dream Hole',          desc:'Each child describes their ideal golf hole: it can have rainbows, dragons, rivers. No wrong answers.' },
      sk:  { name:'Build Your Hole',     drill:'Each child gets 4 cones, 1 hoop, and 1 mat to design and set up one hole. Explain the rules to the group.',
             constraint:'Every hole must have: a start, one obstacle, and a target.',
             note:'Design thinking at this age is about spatial reasoning and creative expression. Accept every design without critique.' },
      gm:  { name:'Designer Course',     setup:'All children\'s holes combined into one course.',
             rules:'Play every hole — designer explains their hole before others play it.',
             constraint:'Designers can add one rule after watching the first group play.' },
      wu2: { q:'What rule did you make for your hole and why?', success:'Every child created and explained a hole that others could play.' } },

    { n:26, title:'Wild Course Day',    focus:'Creative problem-solving with equipment',
      wu:  { name:'Course Tour',         desc:'Coach walks children through a wild course: "This is the Rainbow Arch (a hoop on a stand). This is the Tunnel of Doom. This is the Volcano."' },
      sk:  { name:'Adaptive Play',       drill:'Children adapt technique to each obstacle: chip through hoop, roll under tunnel arch, circle around volcano.',
             constraint:'Complete each obstacle in no more than 3 attempts.',
             note:'No formal technique required — this is about creative problem-solving with a golf club.' },
      gm:  { name:'Wild Course Round',  setup:'5 wild holes.',
             rules:'Each child plays all 5 holes, scoring 1 pt per hole completed within 3 attempts.',
             constraint:'Reverse the course — play holes in opposite order.' },
      wu2: { q:'Which hole was your favourite? Which was hardest?', success:'Every child completes at least 3 of the 5 wild holes.' } },

    { n:27, title:'Colour Chase',       focus:'Precision targeting by colour',
      wu:  { name:'Colour Warm-Up',     desc:'6 coloured cones scattered. Coach calls a colour — children sprint to touch it and return. Last one back does a golf jump (arms wide).' },
      sk:  { name:'Colour Putt',         drill:'Each child has 3 coloured balls. Each must be putted to a matching coloured cone.',
             constraint:'Complete all 3 colour matches in 6 putts or fewer.',
             note:'Adding colour identity to balls creates ownership — children feel responsible for their ball finding its cone.' },
      gm:  { name:'Colour Scramble',    setup:'5 coloured cones at different distances.',
             rules:'Coach calls a colour — everyone putts to it simultaneously. Score 2 pts for reaching the cone, 3 pts for stopping within 1 m.',
             constraint:'Level up: eyes closed for the closest cone — feel the direction, putt from memory.' },
      wu2: { q:'How did you decide how hard to hit the ball?', success:'Children connect their perception of distance with the force of their stroke.' } },

    { n:28, title:'Golf Freeze',        focus:'Body awareness and listening',
      wu:  { name:'Golf Tag',            desc:'One child is "it." When tagged, freeze in a golf pose. Another child unfreezes them by rolling a ball through their legs.' },
      sk:  { name:'Freeze Check',        drill:'Coach calls FREEZE during free practice. Children hold exact position. Coach checks: feet apart? Club pointing somewhere? Eyes looking?',
             constraint:'Freeze at the top of the backswing — is the club pointing at the sky?',
             note:'Freeze moments create self-awareness without verbal critique.' },
      gm:  { name:'Musical Golf',        setup:'4 stations (putting, chipping, target, free swing).',
             rules:'Music plays — children rotate. Music stops = freeze in current pose. Coach visits each station.',
             constraint:'Level up: coach gives a challenge pose to hold at each freeze.' },
      wu2: { q:'Show me your best freeze pose.', success:'Every child holds a recognizable golf-related body position.' } },

    { n:29, title:'Coaching a Friend',  focus:'Peer teaching — consolidating learning',
      wu:  { name:'Expert Introduction', desc:'"Today you are the coaches. I need your help." Coach holds club incorrectly. Ask children to identify and fix the error.' },
      sk:  { name:'Coach a Partner',     drill:'Child A swings, Child B observes and says one thing they noticed. Swap.',
             constraint:'Observer must say something positive first before any suggestion.',
             note:'Teaching reinforces learning. When children explain a skill they consolidate their own understanding.' },
      gm:  { name:'Fix the Mistake',    setup:'Coach demonstrates 3 deliberate errors.',
             rules:'Children identify each mistake and demonstrate the correct version.',
             constraint:'Children take turns being the "coach with a mistake" for peers to fix.' },
      wu2: { q:'What is the most important thing you taught your partner today?', success:'Every child communicated one piece of coaching feedback to a peer.' } },

    { n:30, title:'Mid-Year Party',     focus:'Celebration and reflection at the halfway mark',
      wu:  { name:'Greatest Hits',      desc:'Coach describes activities from lessons 1-29. Children call out their memories and vote for their all-time favourite.' },
      sk:  { name:'Skills Parade',      drill:'Each child chooses one skill they are proud of and demonstrates it. Group gives one clap after each.',
             constraint:'Can you teach your skill to one other person in 1 minute?',
             note:'Public skill sharing builds confidence and creates a positive community.' },
      gm:  { name:'Champions Relay',    setup:'Team relay using any skill from Q1-Q3.',
             rules:'Teams choose the skill. Relay race format — all children complete one run.',
             constraint:'Teams swap skills for round 2.' },
      wu2: { q:'What are you most proud of from this year so far?', success:'Every child names one genuine achievement from their own perspective.' } },

    // ── Q4: My Best Golf ───────────────────────────────────────────────────
    { n:31, title:'Back to Basics',     focus:'Revisiting grip and stance with fresh eyes',
      wu:  { name:'First Day Memory',   desc:'"Do you remember our very first lesson? Let\'s go back." Repeat the shake-hands grip activity. Children compare how it feels now vs then.' },
      sk:  { name:'Grip Revisited',      drill:'Shake-hands grip check: pressure (firm but gentle), alignment (V of thumb pointing to trail shoulder), club face direction.',
             constraint:'Tap 5 balls with shake-hands grip to a cone 3 m away.',
             note:'Returning to fundamentals after 30 lessons reveals genuine growth. Children are often amazed at how natural the grip now feels.' },
      gm:  { name:'Grip Relay',          setup:'3 stations, each with a target 4 m away.',
             rules:'Putt to each target using correct grip. Team score = how many targets hit in 2 minutes.',
             constraint:'Level up: use only the pinky fingers on the shaft.' },
      wu2: { q:'Does the grip feel different from Lesson 1?', success:'Children notice and articulate genuine growth in comfort and control.' } },

    { n:32, title:'Best Shot Show',     focus:'Personal showcase and positive athletic identity',
      wu:  { name:'Practice Time',      desc:'5 minutes of free, un-coached practice. Each child practices whatever they feel most confident about.' },
      sk:  { name:'Signature Shot',      drill:'Each child identifies their best shot. Demonstrates it for the group. Group observes: what did they do well?',
             constraint:'Can you replicate your signature shot 3 times in a row?',
             note:'Identifying a signature strength builds a positive athletic identity at a formative age.' },
      gm:  { name:'Best Shot Tournament', setup:'Each child sets up for their best shot.',
             rules:'3 attempts each. Group votes for best execution — not distance, but control and intent.',
             constraint:'Coach gives each child a special title based on their signature skill.' },
      wu2: { q:'What makes your signature shot special?', success:'Every child can name what they feel they do best.' } },

    { n:33, title:'Outdoor Adventure',  focus:'Adapting to natural terrain',
      wu:  { name:'Nature Tour',         desc:'Walk the outdoor space with clubs. Point out slopes, trees, grass types, natural obstacles. Ask: where would you aim to avoid the puddle?' },
      sk:  { name:'Natural Terrain',     drill:'Play from different surfaces: short grass, long grass, bare earth, slope. Compare how the ball rolls differently.',
             constraint:'Putt across a slope — aim to the high side and let it curve.',
             note:'Exposing young children to varied terrain builds adaptive skill and comfort in natural environments.' },
      gm:  { name:'Expedition Golf',     setup:'3-hole course using natural features as obstacles.',
             rules:'Play each hole. Count strokes only if desired — keep it fun.',
             constraint:'Children name each hole after a nature feature they spot.' },
      wu2: { q:'What was different about golf outside today?', success:'Every child adapts play to at least one natural feature without frustration.' } },

    { n:34, title:'Safe Trick Shots',   focus:'Creative fun and joyful movement',
      wu:  { name:'Trick Gallery',       desc:'Coach demonstrates 3 safe silly shots: (1) putt with the grip end of the club. (2) swing with eyes closed (in a safe zone only). (3) chip standing on one leg.' },
      sk:  { name:'My Trick Shot',       drill:'Each child invents one safe trick shot. Rules: no club above waist, no swinging near others, must actually strike the ball.',
             constraint:'Demonstrate trick shot to partner who must try to replicate it.',
             note:'Trick shots at age 4-5 are entirely about joy. Safety is the only parameter.' },
      gm:  { name:'Trick Shot Show',    setup:'Children perform tricks in sequence while group watches.',
             rules:'Applause after each. Group votes for funniest, most creative, and most athletic.',
             constraint:'Coach narrates each trick: "The Magnificent Backwards Roller!" etc.' },
      wu2: { q:'What made your trick shot special?', success:'Every child created and executed a safe, creative shot variation.' } },

    { n:35, title:'Parent Golf Day',    focus:'Family engagement and confident demonstration',
      wu:  { name:'Family Intro',        desc:'Children introduce their parents: "This is my parent. The thing I want to show them today is..."' },
      sk:  { name:'Show and Tell',       drill:'Each child demonstrates one skill to their parent. Parent tries to replicate it. Child coaches the parent.',
             constraint:'Child must explain the skill using one feeling word: "it should feel like..."',
             note:'Parent participation sessions have lasting impact on engagement and continuity outside class.' },
      gm:  { name:'Family Teams',        setup:'Child-parent pairs in a cooperative putting relay.',
             rules:'Child putts odd holes, parent putts even holes. Combine scores.',
             constraint:'Parent must follow child\'s advice on every shot — child is the coach.' },
      wu2: { q:'What did you teach your parent today?', success:'Every child confidently demonstrated at least one skill to a family member.' } },

    { n:36, title:'All the Clubs',      focus:'Equipment literacy — club identification',
      wu:  { name:'Club Parade',         desc:'Lay all clubs on the ground in order from shortest to longest. Children walk the parade and name each one. No wrong answers — this is introduction.' },
      sk:  { name:'Club Match',           drill:'Coach calls a club name — children find it from a spread of 6 options. Progress: use picture cards, then name only, then shape description only.',
             constraint:'Can you sort all clubs from shortest to tallest on your own?',
             note:'At age 4-5, knowing putter vs "hitting club" vs "long club" is sufficient. Formal names are a bonus.' },
      gm:  { name:'Club Detective',      setup:'Clubs covered with a cloth.',
             rules:'Coach gives one clue ("this club is very flat and used on the green"). Children identify.',
             constraint:'Children take turns giving clues for others to identify.' },
      wu2: { q:'Which club is your favourite and why?', success:'Every child can identify the putter and at least one other club by name.' } },

    { n:37, title:'My Golf Year',       focus:'Reflection and storytelling',
      wu:  { name:'Memory Lane',         desc:'Coach describes activities from lessons 1-36. Children call out memories. Let them celebrate their year.' },
      sk:  { name:'Golf Story',           drill:'Each child draws or describes their favourite golf moment. Coach scribes key words if needed.',
             constraint:'Include: what happened, how it felt, and what they learned.',
             note:'Narrative reflection at 4-5 is about articulating emotional experience, not technical learning.' },
      gm:  { name:'Story Share',         setup:'Each child presents their golf story in 30 seconds.',
             rules:'Group asks one question each. No wrong answers.',
             constraint:'Children can ask: "What was the hardest part?" or "Would you do it again?"' },
      wu2: { q:'If you told a friend about golf, what would you say?', success:'Every child can describe golf positively to someone who has never tried it.' } },

    { n:38, title:'Skills Passport',    focus:'Personal benchmark record',
      wu:  { name:'Passport Intro',      desc:'Each child receives their Skills Passport card. "Today we fill in your personal record — it\'s not a test, it\'s a map of where you are right now."' },
      sk:  { name:'Passport Stations',   drill:'(1) Grip check. (2) Balance: golf stance for 5 seconds. (3) Putting: ball to cone 3 m. (4) Striking: ball forward 4 m with control. (5) Listening: follow 3 sequential instructions.',
             constraint:'Coach stamps or stickers each station as completed.',
             note:'Every child passes — the passport records current level, not pass/fail.' },
      gm:  { name:'Passport Challenge', setup:'Obstacle course using all 5 stations.',
             rules:'Complete in order, collect a sticker at each station. Final sticker = completion star.',
             constraint:'Children help stamp each other\'s passports under coach supervision.' },
      wu2: { q:'Which station was your strongest?', success:'Every child completes the passport with at least one station they feel proud of.' } },

    { n:39, title:'Best Round',         focus:'Full course confidence — applying all skills',
      wu:  { name:'Season Review',       desc:'Quick tour of highlights: "Remember when we did the moving ball? The storybook course? The wild course?" Children relive their favourite moments.' },
      sk:  { name:'Personal Best Round', drill:'Each child plays a 3-hole course using their own best technique choices — no restrictions, no coaching during play.',
             constraint:'Set a personal target: "I want to complete all 3 holes in X shots."',
             note:'This session is about autonomous decision-making — the coach observes only.' },
      gm:  { name:'My Best Round',      setup:'3-hole course with all skills available.',
             rules:'Each child plays their own ball, their own pace. Celebrate completing every hole.',
             constraint:'One hole must use chipping, one putting, one free choice.' },
      wu2: { q:'What was your best decision in today\'s round?', success:'Every child completes the course and identifies one decision they are proud of.' } },

    { n:40, title:'Graduation Day',     focus:'Celebration, certificates, and farewell',
      wu:  { name:'Personalised Shout-Out', desc:'Coach gives each child a personalised shout-out: "What I will remember about [Name] is..." Children beam.' },
      sk:  { name:'Graduation Showcase', drill:'Each child performs their signature skill one final time. Group responds with: "3... 2... 1... GOLF!" clap.',
             constraint:'Coach names each child\'s special skill: "The Magic Roll Specialist," "The Colour Zone Champion," etc.',
             note:'End with something every single child can succeed at — reinforce a lifelong love of the game.' },
      gm:  { name:'Champions Scramble', setup:'Fun 3-hole scramble — best ball, all children play.',
             rules:'No scores matter today. Every child takes the final putt on the last hole.',
             constraint:'Celebrate every putt regardless of outcome.' },
      wu2: { q:'Are you a golfer?', success:'Every child answers "yes" with confidence.' } },
  ],
},
'6-7': {
  label:'Ages 6–7', ltad:'FUNdamentals', color:'#1B5C2A',
  lessons:[
    { n:1,  title:'Grip & Setup Mastery', focus:'Correct fundamentals — grip, stance, posture',
      wu:  { name:'Posture Freeze',      desc:'Children walk in "tall golfer posture" — hips back, slight forward tilt, arms hanging. On "freeze," hold still. Coach taps shoulders of those with correct posture.' },
      sk:  { name:'Grip Progression',     drill:'Step 1: Lead hand grip — "V" points to trail shoulder. Step 2: Trail hand below, "V" matching. Step 3: Overlap or interlock. Practice grip → release → re-grip 5 times.',
             constraint:'Grip a club, close eyes, open eyes — check your "Vs" without adjusting.',
             note:'Interlocking grip preferred for small hands. Don\'t force overlap until hands are larger.' },
      gm:  { name:'Grip Quality Putting Race', setup:'5 ft gate drill from 4 spots around hole.',
             rules:'Each child checks grip before every putt. Peers observe and call "approved" or "adjust." Points for gate success AND correct grip.',
             constraint:'Level up: child must explain their grip to a partner before putting.' },
      wu2: { q:'Without looking, can you describe what a correct grip feels like?', success:'Children grip and re-grip without correction needed.' } },

    { n:2,  title:'Posture & Alignment', focus:'Setup routine — alignment to target',
      wu:  { name:'Target Walk',         desc:'Place 6 targets around space. Children walk in a straight line from one target to another — discipline of maintaining a line. No curves or detours.' },
      sk:  { name:'Alignment Routine',    drill:'Step 1: Stand behind ball, identify target line. Step 2: Place club behind ball on target line. Step 3: Build stance around club position. Use alignment stick on ground.',
             constraint:'Remove the alignment stick — use only your club and eyes to align.',
             note:'"Pick a spot 2 feet in front of the ball on your target line — aim at the spot, not the far target."' },
      gm:  { name:'Alignment Challenge', setup:'5 targets with alignment sticks pointing at them.',
             rules:'Children align putter to each target using the full routine. Peer checks alignment before putt. Score on accuracy of alignment AND putt result.',
             constraint:'Level up: remove the alignment sticks — use only club and body.' },
      wu2: { q:'What is the first step in your setup routine?', success:'Every child can articulate the 3-step alignment routine.' } },

    { n:3,  title:'Putting — Face Control', focus:'Putter face at impact — gate drill progression',
      wu:  { name:'Face Direction Game', desc:'Coach holds up a club face in different directions. Children point to where the ball would go. Fast-paced, progressive complexity.' },
      sk:  { name:'Gate Drill Progression', drill:'Gate at 4 ft → 7 ft → 10 ft → 12 ft. Must make 3 consecutive clean gates before advancing. Track personal best distance.',
             constraint:'Add a second gate 3 ft in front — both gates must be cleared.',
             note:'If child consistently misses one side, ask: "Which way is your face pointing when you strike?" Self-diagnosis.' },
      gm:  { name:'Distance Ladder with Gates', setup:'Gates at 5 ft, 8 ft, 11 ft, 14 ft. One target circle at each.',
             rules:'Ball must pass through gate AND stop within 2 ft of circle. 3 attempts per rung. Move up on 2 successes.',
             constraint:'Level up: random target selection — coach calls which rung after the backswing.' },
      wu2: { q:'What do you check to make sure your ball goes straight?', success:'Children cite putter face direction as primary variable.' } },

    { n:4,  title:'Putting — Distance Ladder', focus:'Lag putting — distance control to 20 ft',
      wu:  { name:'Near/Far Sprint',     desc:'Coach calls "near" or "far" — children sprint to near cone (5 ft) or far cone (20 ft). Add "medium." Randomize calls.' },
      sk:  { name:'Lag Putting Drill',    drill:'Ball 20 ft from hole. Goal: stop within a 3-ft circle around hole ("lag zone"). Swing length = distance. Demonstrate long backswing = far, short = near.',
             constraint:'From 20 ft: stop ball in lag zone without looking at target after setup. Eyes on ball throughout.',
             note:'Eliminate 3-putts by teaching that a lag putt\'s job is proximity, not holing.' },
      gm:  { name:'Score Card Introduction', setup:'3 putting holes at 8 ft, 14 ft, 20 ft.',
             rules:'Every child keeps their own score card. Record putts per hole. Compare totals. Introduce "par" concept — par 2 per hole.',
             constraint:'Level up: random distances — coach calls the distance, children select appropriate swing length.' },
      wu2: { q:'What swing length do you use for a 20-foot putt vs a 5-foot putt?', success:'Children demonstrate two distinct swing lengths.' } },

    { n:5,  title:'Chipping — The Big Putt', focus:'Chipping introduction — straight-arm pendulum',
      wu:  { name:'Robot Pendulum',      desc:'Arms locked straight at sides — swing them forward and back in sync. Walk in robot-stride around the space, keeping pendulum motion continuous.' },
      sk:  { name:'Chip with 7-iron',     drill:'Ball on low tee, 7-iron, putter grip. Straight arms, no wrist hinge. Ball should land and roll 2:1 — 2 feet of roll for every 1 foot in air. Count bounce-and-roll.',
             constraint:'Move ball to ground — same motion. Progress from 10 ft to 20 ft.',
             note:'Weight forward (60% lead foot). Shaft leans forward slightly. "Hands lead the club head."' },
      gm:  { name:'Land & Roll Challenge', setup:'Landing zone (hula hoop) + scoring zones at 5 ft, 10 ft, 15 ft past it.',
             rules:'Ball must pass through the hoop. Where it stops = score. 5 chips per child.',
             constraint:'Level up: hoop must be hit exactly (not just passed over) — 2 bounces max to reach hoop.' },
      wu2: { q:'How is chipping different from putting?', success:'Children cite "up and roll" vs "only roll" distinction.' } },

    { n:6,  title:'Chipping — Target Accuracy', focus:'Chipping to different targets — club selection',
      wu:  { name:'Club Selection Quiz',  desc:'Coach holds up 3 clubs (putter, 7-iron, wedge). Asks: "Which club to roll on the ground? Chip 10 feet? Chip 30 feet?" Quick-fire Q&A.' },
      sk:  { name:'Multi-Target Chipping', drill:'4 targets at 10 ft, 15 ft, 20 ft, 25 ft. Choose target, then choose club (putter or 7-iron). Chip to land and stop near target.',
             constraint:'Name target AND club selection before every chip — peer checks the choice is logical.',
             note:'Introduce: closer target = less loft needed. Encourage putter for short chips on good turf.' },
      gm:  { name:'Club Choice Scramble', setup:'3 holes, each requiring a different chip distance.',
             rules:'At each hole: choose your club, state your reason, chip. Score: 2 pts for stopping nearest to target, 1 pt for logical club selection.',
             constraint:'Level up: add a "bonus" second shot — if chip stops within 3 ft, earn a bonus putt for 3 extra points.' },
      wu2: { q:'When would you use a 7-iron instead of a putter for a short shot?', success:'Children articulate the grass/distance-based club decision.' } },

    { n:7,  title:'Chip & Putt Combo',   focus:'2-shot holes — combining short game skills',
      wu:  { name:'2-Step Routine',      desc:'Practice the pre-shot routine: (1) stand behind ball, pick target, (2) walk to ball and set up. Do this 5 times without a ball — pure rehearsal.' },
      sk:  { name:'2-Shot Hole Practice', drill:'From 20 ft: one chip to get close, one putt to hole out. Practice the transition — read the chip result and adjust the putt line.',
             constraint:'Chip must land on the "fair" side (not past the hole). Only then proceed to putt.',
             note:'Introduce reading break on the putt after the chip — "which way is the green sloping?"' },
      gm:  { name:'3-Hole Chip & Putt Course', setup:'3 stations: 15 ft chip + 5 ft putt, 20 ft chip + 8 ft putt, 25 ft chip + 10 ft putt.',
             rules:'Complete all 3 holes. Record chip and putt separately. Total score. Par = 2 per hole (par 6 total).',
             constraint:'Level up: par challenge — can any child complete the course in par or better?' },
      wu2: { q:'What do you check after your chip before you putt?', success:'Children identify ball position and putt line reading.' } },

    { n:8,  title:'Pitching Introduction', focus:'Pitching — L-to-L swing, wrist hinge',
      wu:  { name:'L-Shape Freeze',      desc:'Children make an "L" shape with lead arm and club (90° wrist hinge). Coach checks each — freeze and hold the L for 3 seconds.' },
      sk:  { name:'L-to-L Pitching',      drill:'Lead wrist hinges to L at top, releases through to matching L on follow-through. Ball on low tee, gap wedge, swing to L-to-L only. Distance 20–30 ft.',
             constraint:'Progress from tee to ground — same L-to-L. Aim at hoop 25 ft away.',
             note:'Common error: scooping through impact. Cue: "let the club pass your hands AFTER the ball."' },
      gm:  { name:'Pitch Zone Landing', setup:'3 scoring zones at 20 ft, 30 ft, 40 ft.',
             rules:'Pitch to land in the zone you name before the shot. 5 pitches. Score: named zone = 3 pts, adjacent = 1 pt.',
             constraint:'Level up: closest-to-pin format — eliminate zones, score purely on proximity.' },
      wu2: { q:'What does the "L" in L-to-L mean for your lead wrist?', success:'Children reproduce the L position on backswing without prompting.' } },

    { n:9,  title:'Scramble Competition', focus:'Team play — scramble format, sportsmanship',
      wu:  { name:'Team Name Intro',     desc:'Divide into 2 teams. Teams choose a team name and a team cheer. 2 minutes to prepare. Each team performs their cheer for the group.' },
      sk:  { name:'Scramble Rules Review', drill:'Explain scramble: both players hit, team uses best shot, both hit from that spot. Practice the selection conversation: "mine is closer — use mine!"',
             constraint:'Practice 3 scramble chip-and-putt holes before competitive play.',
             note:'Encourage genuine decision-making — "whose shot do YOU think we should use and why?"' },
      gm:  { name:'Team Scramble (5 holes)', setup:'5-station chip and putt course.',
             rules:'Scramble format. 2 teams of 3–4. Score per hole — team with best (lowest) wins the hole. Team winning most holes wins match.',
             constraint:'Sportsmanship score: coach awards 1 bonus point per hole for excellent encouragement.' },
      wu2: { q:'What did your team do really well together today?', success:'Every child contributes one positive observation about their team.' } },

    { n:10, title:'Skills Passport',     focus:'Term assessment & celebration',
      wu:  { name:'Best Skill Warm-Up',  desc:'Each child demonstrates their single best skill from the term. Group gives positive feedback: "I liked how you..."' },
      sk:  { name:'Skills Passport Stations', drill:'4 stations: (1) putting gate at 10 ft, (2) chip to hoop from 20 ft, (3) pitch to zone from 30 ft, (4) 2-shot hole (chip + putt). Coach records each child\'s result.',
             constraint:'Record personal best at each station.',
             note:'Frame as self-assessment: "did you hit your standard?" not competitive ranking.' },
      gm:  { name:'Celebration 5-Hole',  setup:'5-hole chip and putt course, all skills used.',
             rules:'Children play independently. Record scores. Every child receives Skills Passport with personal comments.',
             constraint:'Focus on personal improvement from Lesson 1 — coach shares one specific observation per child.' },
      wu2: { q:'Name one thing you improved at this term. Name one thing you want to work on next term.', success:'Every child receives a completed Skills Passport.' } },

    // ── Q2: Building Skills ────────────────────────────────────────────────
    { n:11, title:'Iron Contact',       focus:'First clean strike with a 7-iron',
      wu:  { name:'Divot Debate',        desc:'Show children two divots: one shallow (good iron contact), one fat (behind ball). Ask: "Which one do you think was hit well and why?"' },
      sk:  { name:'Iron Strike Drill',   drill:'Ball on a low tee. 7-iron. Ball position centre of stance. Strike down and through — the tee should pop out after the ball, not before.',
             constraint:'Move ball to the ground — same motion. Count clean strikes out of 5.',
             note:'"Hitting down makes the ball go up." This is counterintuitive — spend time on the concept before drilling.' },
      gm:  { name:'Fairway Finder',      setup:'Target zone at 40-60 yards (width of a fairway).',
             rules:'5 shots each. Score 2 pts for landing in the fairway zone, 1 pt for just outside.',
             constraint:'Level up: narrow the fairway by 2 m after every round the group succeeds.' },
      wu2: { q:'What does the divot tell you about where you hit the ball?', success:'Children identify that divot starts after the ball position = good contact.' } },

    { n:12, title:'Pitching Basics',    focus:'Wrist hinge, loft, and soft landing',
      wu:  { name:'L-Shape Check',       desc:'All children make an L with their lead arm and club. Coach checks each: "Hold it for 3 seconds." Progressive speed: slow L, fast L.' },
      sk:  { name:'L-to-L Pitch',        drill:'Gap wedge, ball on low tee. Hinge lead wrist to L on backswing, release through to matching L on follow-through. 20-30 yards.',
             constraint:'Progress from tee to ground. Aim at a hoop 25 yards away.',
             note:'Common error: scooping through impact. Cue: "let the club pass your hands AFTER the ball."' },
      gm:  { name:'Pitch Zone',          setup:'3 scoring zones at 20, 30, 40 yards.',
             rules:'Name your zone before each pitch. 5 pitches. Named zone = 3 pts, adjacent zone = 1 pt.',
             constraint:'Level up: closest-to-pin scoring — eliminate zones, pure proximity.' },
      wu2: { q:'What does your lead wrist do at the top of a pitch swing?', success:'Children reproduce the L position on backswing without being prompted.' } },

    { n:13, title:'Bunker Intro',       focus:'Sand play — open face, splash behind ball',
      wu:  { name:'Sand Awareness',      desc:'Walk around the bunker perimeter — never through it. Identify rake entry, ball position, and exit direction before any clubs come out.' },
      sk:  { name:'Splash Drill',        drill:'Sand tray or folded towel under ball. Open stance, open face. Swing through a point 2 inches BEHIND the ball — the surface pushes the ball out.',
             constraint:'Place a tee 2 inches behind ball — splash the tee, not the ball.',
             note:'"The club never touches the ball — the sand pushes it." This concept is counterintuitive; patience required.' },
      gm:  { name:'Splash Target',       setup:'Sand tray or towel, 3 targets at 10, 15, 20 ft.',
             rules:'Ball must clear a lip (raised board). Closest to target after clearing = points.',
             constraint:'Level up: call which target before splashing.' },
      wu2: { q:'Why does the club hit behind the ball in the bunker?', success:'Children explain "the surface pushes the ball out" concept.' } },

    { n:14, title:'Rules Basics I',     focus:'OB, lost ball, unplayable — simple scenarios',
      wu:  { name:'Rules Myth-Busting', desc:'Coach states 3 rules: 1 true, 2 invented. Children vote on which is real. Quick discussion on each.' },
      sk:  { name:'Scenario Practice',  drill:'3 scenarios with cones as OB stakes: (1) ball crosses OB line, (2) ball lost in rough, (3) ball unplayable in tree roots. Children call the correct ruling and take the appropriate drop.',
             constraint:'In pairs: one plays, one acts as rules referee.',
             note:'Rules at this age are about fairness and self-governance, not penalty scores.' },
      gm:  { name:'Rules Round',        setup:'5-hole course with 2 designed rules situations per round.',
             rules:'Coach acts as referee. Children call their own penalties. Bonus point for any child who correctly self-penalises.',
             constraint:'Level up: children are the referee for each other\'s rules situations.' },
      wu2: { q:'What do you do if you can\'t find your ball after 3 minutes?', success:'Children describe the stroke-and-distance or local rule drop procedure.' } },

    { n:15, title:'Keeping Score',      focus:'Stroke play scoring — par, birdie, bogey',
      wu:  { name:'Score Vocabulary',   desc:'Quick quiz: what is par? birdie? bogey? eagle? Children answer. Coach fills in gaps. Use visual chart on whiteboard.' },
      sk:  { name:'Score Card Practice', drill:'Each child gets a scorecard. Play 3 practice holes — coach narrates: "You took 3 shots, par is 2, that\'s a bogey. Write +1." Repeat.',
             constraint:'Children score their partner\'s card — check each other\'s addition.',
             note:'Accurate scoring is a life skill in golf. Emphasise honesty: "you are the referee of your own game."' },
      gm:  { name:'3-Hole Stroke Play', setup:'3-hole chip and putt course, par 2 per hole.',
             rules:'Official scorecards, children mark their own scores. Total the round.',
             constraint:'Level up: play 6 holes and compare front 3 vs back 3 — which was better?' },
      wu2: { q:'Why is it important to keep an accurate score?', success:'Every child completes a scorecard with correct addition.' } },

    { n:16, title:'Lag Putting',        focus:'Distance control from 15+ feet',
      wu:  { name:'Near/Far Sprint',     desc:'Coach calls "near" (5 ft cone) or "far" (25 ft cone) — children sprint to correct cone. Randomise. Add "medium" (15 ft).' },
      sk:  { name:'Lag Zone Drill',      drill:'From 25 ft: goal is to stop ball within a 3-ft circle around the hole (the "lag zone"). Count how many of 5 putts reach the lag zone.',
             constraint:'From 35 ft: same lag zone target. Record success rate.',
             note:'Change the definition of success: "a lag putt\'s job is proximity, not holing out."' },
      gm:  { name:'3-Putt Penalty',     setup:'4 putts from 20-30 ft on varied slopes.',
             rules:'Score: 1-putt = 3 pts, 2-putt = 2 pts, 3-putt = 0 pts. Total over 12 putts.',
             constraint:'Level up: play the same 4 positions twice — compare first vs second round.' },
      wu2: { q:'What swing length do you use for a 25-foot putt vs a 6-foot putt?', success:'Children demonstrate two distinct swing lengths confidently.' } },

    { n:17, title:'Chipping from Rough', focus:'Lie assessment — adjusting contact for longer grass',
      wu:  { name:'Lie Check',           desc:'Show children ball in 3 lies: tight fairway, fringe, and rough. Ask: "How do you think each will behave differently when you chip it?"' },
      sk:  { name:'Rough Adjustment',    drill:'From rough: open stance, steeper angle, strike more down to avoid grass catching the hosel. Compare same chip from tight lie — observe the difference.',
             constraint:'5 chips from rough, 5 from fairway. Count how many reach the same target from each lie.',
             note:'"The rough grabs the hosel — open face slightly and swing steeper to avoid the grass."' },
      gm:  { name:'Lie Challenge',       setup:'3 stations: tight lie, fringe, rough — each 15 ft from hoop.',
             rules:'5 chips from each lie. Score 2 pts per hoop landing.',
             constraint:'Level up: play from the worst lie on the course — coach selects.' },
      wu2: { q:'What changes in your setup when you chip from rough?', success:'Children articulate at least one specific adjustment for rough lies.' } },

    { n:18, title:'Pitch vs Run',       focus:'Choosing the right shot for the situation',
      wu:  { name:'Club Choice Quiz',   desc:'Coach describes 3 situations. Children call the correct shot (chip-and-run, pitch, or putt) and club before the answer is revealed.' },
      sk:  { name:'Decision Drill',      drill:'4 situations with different obstacles and distances. Children select pitch vs chip-and-run vs putt. State the reason before executing.',
             constraint:'"What is the lowest-risk shot from 5 feet off the green with clear green ahead?"',
             note:'Introduce: closer to the green = less loft needed. The putter is often the percentage play from just off the fringe.' },
      gm:  { name:'Shot Selection Scramble', setup:'4-hole course, each hole requiring a different shot type.',
             rules:'Before each hole: partners agree on shot type and explain to coach. Score on result + 1 bonus pt for sound reasoning.',
             constraint:'Level up: one partner can veto the other\'s choice — must negotiate.' },
      wu2: { q:'When would you choose to putt from just off the green instead of chipping?', success:'Children identify flat fringe, no obstacle, and uphill putt as putter-friendly conditions.' } },

    { n:19, title:'Course Etiquette',   focus:'Ready golf, bunker care, ball marking',
      wu:  { name:'Etiquette Quiz',      desc:'True or false: (1) you can walk through someone\'s putting line. (2) you should be ready to play when it\'s your turn. (3) you must rake the bunker after playing from it. Discuss each.' },
      sk:  { name:'Etiquette Stations', drill:'Station 1: mark a ball correctly on the green. Station 2: rake a footprint in sand. Station 3: repair a pitch mark. Station 4: demonstrate ready golf (set up while others are playing).',
             constraint:'Complete all 4 stations in under 8 minutes as a team.',
             note:'Etiquette is what makes golf self-governing. "You are responsible for your own behaviour on the course."' },
      gm:  { name:'Etiquette Round',    setup:'3-hole course.',
             rules:'Coach awards or removes points for etiquette: +1 for marking ball, +1 for raking bunker, -1 for slow play.',
             constraint:'Sportsmanship award: most consistent etiquette throughout the round.' },
      wu2: { q:'Why do golfers repair pitch marks even if they didn\'t make them?', success:'Children articulate "we leave the course better than we found it."' } },

    { n:20, title:'Q2 Assessment',      focus:'Skills circuit — chipping, pitching, putting, iron',
      wu:  { name:'Best Skill Preview', desc:'Each child demonstrates their strongest skill from Q2 to warm up. Group gives positive observations.' },
      sk:  { name:'Q2 Circuit',          drill:'4 stations: (1) 10-ft gate putt (3 consecutive). (2) chip to hoop 20 ft. (3) pitch to zone 35 yards. (4) iron strike to fairway 50 yards.',
             constraint:'Record personal best at each station.',
             note:'Frame as self-improvement vs Q1 baseline, not competition between children.' },
      gm:  { name:'Q2 Challenge Round', setup:'5-hole course using all Q2 skills.',
             rules:'Each child plays independently. Record scores. Coach shares one specific observation per child.',
             constraint:'Children set one personal goal for Q3 based on today\'s results.' },
      wu2: { q:'Which Q2 skill improved most from when you first tried it?', success:'Every child identifies one measurable improvement in their own game.' } },

    // ── Q3: Course Play ────────────────────────────────────────────────────
    { n:21, title:'First Real Hole',    focus:'Full etiquette and play on a real par 3',
      wu:  { name:'Hole Preview',        desc:'Walk children to the tee of a real hole (or simulate with cones). Read the hole together: where are the hazards? Where is the safe miss? Where is the green?' },
      sk:  { name:'One Hole Play',       drill:'Each child plays one par 3 with full etiquette: tee markers, order of play, marking on the green, flagstick protocol.',
             constraint:'Coach acts as caddie — gives one piece of strategic advice per child.',
             note:'Playing on grass changes everything. Allow extra time for the experience.' },
      gm:  { name:'Par 3 Competition',  setup:'One par 3 hole (real or simulated).',
             rules:'Official stroke play. Every child completes the hole. Celebrate pars and birdies.',
             constraint:'Level up: children keep each other\'s score — social accountability.' },
      wu2: { q:'What was different about playing a real hole compared to the practice area?', success:'Every child completes the hole within the time limit.' } },

    { n:22, title:'Club Selection',     focus:'Distance and loft matching — decision framework',
      wu:  { name:'Club Quiz Show',      desc:'Coach calls a distance and lie. Children call the correct club before the answer is revealed. Progressively harder scenarios.' },
      sk:  { name:'Selection Matrix',    drill:'4 stations: 10 yards (putter or wedge?), 30 yards (wedge or 7-iron?), 60 yards (7-iron or 5-iron?), 100 yards (5-iron or 3-wood?). State reason before executing.',
             constraint:'"What is the safest club choice for each distance if you must land on the green?"',
             note:'Introduce: more loft = higher ball, less roll. Less loft = lower ball, more roll.' },
      gm:  { name:'Distance Game',       setup:'4 target flags at different distances.',
             rules:'Coach calls a flag. Child selects club, explains choice, hits. Score: club logic = 1 pt, reaching flag zone = 2 pts.',
             constraint:'Level up: coach calls the flag after child is set up — must switch club.' },
      wu2: { q:'What two factors do you consider when choosing a club?', success:'Children name distance and lie as primary factors.' } },

    { n:23, title:'Fairway Play',       focus:'Iron contact from grass — stance and ball position',
      wu:  { name:'Surface Compare',     desc:'Children hold club at address on a mat (artificial surface) then on real grass. Ask: "What feels different?"' },
      sk:  { name:'Fairway Strike',      drill:'Ball on real grass or fairway mat. Centre of stance, weight 60% forward. Strike through the ball, taking a small divot after impact.',
             constraint:'5 shots from fairway. Count clean strikes (ball then grass) vs fat shots (grass then ball).',
             note:'Help children feel the difference between a clean strike and a fat one through self-assessment, not coach correction.' },
      gm:  { name:'Fairway Challenge',  setup:'Fairway zone 40-60 yards. Various lie types.',
             rules:'3 shots from each lie type (tight, semi-rough, divot). Compare accuracy.',
             constraint:'Level up: add a crosswind — adjust aim, same swing.' },
      wu2: { q:'What tells you that you hit the ball before the ground?', success:'Children identify the sound, feel, and flight of a clean iron strike.' } },

    { n:24, title:'Miss Strategy',      focus:'Course management — where to miss to minimise damage',
      wu:  { name:'Hazard Map',          desc:'Draw a hole on a whiteboard: flag, bunker left, water right. Ask: "If you can only miss in one direction — which side?"' },
      sk:  { name:'Safe Side Aiming',   drill:'Set up approach shots where the safe miss is away from hazards. Children aim to the safe side of each target — not the flag itself.',
             constraint:'"Aim 2 metres right of the flag. Same swing, different target."',
             note:'Introduce: pros miss on the safe side by design. This is not failure — it is intelligent play.' },
      gm:  { name:'Strategy 5-Hole',    setup:'5 holes with deliberate hazard placement.',
             rules:'Before each shot: state target AND safe miss direction. Coach awards 1 strategy pt per shot for sound reasoning.',
             constraint:'Level up: coach adds a "danger zone" mid-round — children must adapt their miss plan.' },
      wu2: { q:'Describe your best strategic decision today.', success:'Children articulate pre-shot strategic thinking, not just results.' } },

    { n:25, title:'Match Play',         focus:'Hole-by-hole scoring — match play introduction',
      wu:  { name:'Match Play Rules',   desc:'Explain the difference: stroke play counts every shot over 18 holes. Match play wins each hole separately. Demonstrate with 3-hole example.' },
      sk:  { name:'Match Play Practice', drill:'Pairs play 3 holes in match play. Coach narrates: "You won that hole, you\'re 1 up. That means you\'re leading by 1 hole."',
             constraint:'Introduce conceding a putt: "Good, it\'s good" when a putt is within tap-in range.',
             note:'"In match play, a bad hole doesn\'t ruin your round — you just start the next hole level."' },
      gm:  { name:'5-Hole Match',       setup:'5-hole chip and putt course.',
             rules:'Pairs play match play. Record holes won. Coach resolves any rules disputes.',
             constraint:'Level up: introduce a handicap — the weaker player gets a shot on the hardest hole.' },
      wu2: { q:'If you\'re 2 down with 3 holes to play, can you still win?', success:'Children understand they can win all 3 remaining holes to win the match.' } },

    { n:26, title:'Wind Play',          focus:'Adjusting aim and club for wind conditions',
      wu:  { name:'Wind Test',           desc:'Children toss grass in the air to read wind direction. Ask: "Is it a headwind, tailwind, or crosswind for this hole?"' },
      sk:  { name:'Wind Adjustment',     drill:'Headwind: take one extra club, swing at 80% (don\'t fight it). Tailwind: take one less club. Crosswind: aim into the wind, let ball drift back.',
             constraint:'Hit 3 shots into headwind, 3 with tailwind. Compare distances — how many yards difference?',
             note:'"When it\'s breezy, swing easy." Trying to hit harder into the wind increases spin and makes it worse.' },
      gm:  { name:'Wind Course',         setup:'5 holes using current wind conditions.',
             rules:'Before each shot: declare wind adjustment (club choice + aim direction). Coach awards 1 strategy pt per correct wind read.',
             constraint:'Level up: coach announces a "gust" on one hole — wind direction changes mid-shot.' },
      wu2: { q:'What do you do differently when hitting into a headwind?', success:'Children articulate taking more club and swinging easier.' } },

    { n:27, title:'Green Reading',      focus:'Slope, grain, and break prediction',
      wu:  { name:'Break Prediction',   desc:'Coach places 3 balls on different spots on a slope. Children predict break direction and amount before the balls are putted. Compare predictions to reality.' },
      sk:  { name:'Two-Look System',     drill:'Read every putt from two positions: (1) behind the ball, (2) behind the hole. Combine the two reads into one plan.',
             constraint:'Aim at an empty spot 6 inches outside the hole — not the hole itself — to allow for break.',
             note:'Speed affects break: a faster putt breaks less. A dying putt breaks more.' },
      gm:  { name:'Break-or-Straight',  setup:'3 putts: 1 straight, 1 breaks left, 1 breaks right.',
             rules:'Before each: predict direction. Score: correct prediction = 1 pt, holed putt = 2 pts.',
             constraint:'Level up: children set up putts for peers — must explain the break first.' },
      wu2: { q:'What two things do you check when reading a breaking putt?', success:'Children cite slope direction and putt speed as variables.' } },

    { n:28, title:'3-Hole Competition', focus:'Full competitive play — etiquette and scoring',
      wu:  { name:'Competition Prep',   desc:'10-minute warm-up: 2 min putting, 2 min chipping, 3 min pitching, 3 min irons. Children lead their own warm-up.' },
      sk:  { name:'Competition Rules',   drill:'Review: scorecard, order of play, pace of play, OB and lost ball procedure, bunker raking, marking ball on green.',
             constraint:'Each child must know their score at all times during the round.',
             note:'Frame as: "This is what real golf feels like. You are ready for this."' },
      gm:  { name:'3-Hole Stroke Play', setup:'3 real or simulated holes, par 3 each.',
             rules:'Official stroke play. Children keep own scorecards. Peers check scores. Coach observes etiquette only.',
             constraint:'Post-round debrief: best decision, one thing to improve for next time.' },
      wu2: { q:'What did you do well under competition conditions today?', success:'Every child completes the round with a valid scorecard.' } },

    { n:29, title:'Long Iron Play',     focus:'5-iron and 4-iron — lower trajectory, more distance',
      wu:  { name:'Trajectory Quiz',    desc:'Coach holds up a 9-iron and a 5-iron. Ask: "Which one sends the ball higher? Which one sends it further? Why?"' },
      sk:  { name:'Long Iron Drill',    drill:'5-iron, ball centre of stance, normal setup. Swing thought: shallower angle than wedge — "sweep it, don\'t dig." Same tempo as a 7-iron.',
             constraint:'5 shots with 7-iron then 5 with 5-iron. Compare distances — what is the gap?',
             note:'Children often try to help the ball into the air with a longer iron — reinforce that loft does the work.' },
      gm:  { name:'Iron Distance Game', setup:'5 targets at 40, 60, 80, 100, 120 yards.',
             rules:'Children select the correct iron for each distance. Coach evaluates club logic. Score on accuracy.',
             constraint:'Level up: mix in fairway woods — what\'s the distance difference vs a 5-iron?' },
      wu2: { q:'Why does a 5-iron go further than a 9-iron with the same swing?', success:'Children articulate less loft = lower ball flight = more roll = greater distance.' } },

    { n:30, title:'Q3 Self-Assessment', focus:'Honest self-evaluation — strengths and focus areas',
      wu:  { name:'Skill Snapshot',     desc:'Each child rates themselves 1-5 on 6 skills: putting, chipping, pitching, iron play, rules knowledge, course management.' },
      sk:  { name:'Coach Rating',        drill:'Coach provides independent 1-5 ratings for the same 6 skills. Compare: where do you agree? Where do you disagree?',
             constraint:'"Where is the biggest gap between your rating and mine — and who do you think is right?"',
             note:'Discrepancies are growth conversations, not corrections. "I rated you higher on course management — let me tell you why I see that."' },
      gm:  { name:'Focus Area Round',   setup:'3-hole course.',
             rules:'Each child plays with one personal focus area in mind (chosen from their self-assessment). Evaluate that focus specifically — not the score.',
             constraint:'Share focus area with partner before the round begins.' },
      wu2: { q:'What is the one skill you most want to improve in Q4?', success:'Every child identifies a specific, genuine improvement target.' } },

    // ── Q4: Getting Competitive ────────────────────────────────────────────
    { n:31, title:'Tournament Formats', focus:'Stableford, scramble, and best-ball explained',
      wu:  { name:'Format Auction',     desc:'Coach describes 3 formats: stroke play, Stableford, scramble. Children vote for which they think sounds most fun and why.' },
      sk:  { name:'Format Practice',    drill:'Play 3 holes in each format (9 holes total). Stableford: 2 pts for par, 1 pt for bogey, 3 pts for birdie. Scramble: best ball, all hit from there.',
             constraint:'In Stableford: what is the smart strategy on a hole where you\'ve already made double bogey?',
             note:'Stableford is forgiving — a bad hole doesn\'t ruin your round. This reduces anxiety and encourages aggressive play.' },
      gm:  { name:'Format Championship', setup:'6-hole course.',
             rules:'First 3 holes: Stableford scoring. Last 3 holes: scramble pairs. Compare: did your strategy change between formats?',
             constraint:'Level up: children explain the scoring to a newcomer (parent or peer) before the round.' },
      wu2: { q:'Why does Stableford scoring make golfers play more aggressively?', success:'Children identify that bad holes are capped and don\'t affect total as much.' } },

    { n:32, title:'Short Course Round', focus:'9-hole confidence play — all skills applied',
      wu:  { name:'Round Strategy',     desc:'Walk the course (or map it on paper). Children identify: where to aim on each hole, one risk to avoid, one opportunity to attack.' },
      sk:  { name:'Pre-Round Routine',  drill:'Structured 12-minute warm-up: 3 min short putts, 3 min lag putting, 3 min chipping, 3 min pitching. Children lead their own warm-up.',
             constraint:'Every child must complete the full routine before teeing off.',
             note:'A pre-round routine is a lifelong habit. Introduce it now — it will feel natural within 3 sessions.' },
      gm:  { name:'9-Hole Round',       setup:'9 holes or equivalent.',
             rules:'Official stroke play. Children keep own scorecards. Debrief: best hole, hardest hole, one decision to make differently.',
             constraint:'Sportsmanship award: coach recognises one player for outstanding attitude and pace of play.' },
      wu2: { q:'What was your best strategic decision in the round?', success:'Every child completes 9 holes with a valid scorecard.' } },

    { n:33, title:'Handicap Story',     focus:'The WHS — how everyone can compete fairly',
      wu:  { name:'Fairness Debate',    desc:'"If a beginner and a scratch golfer play together — who should win?" Discuss. Introduce: the handicap system levels the playing field.' },
      sk:  { name:'Handicap Basics',    drill:'Simple explanation: your handicap is the number of shots above par you typically shoot. With a handicap of 10, you get 10 extra shots spread across the 10 hardest holes.',
             constraint:'Simulate a match play game with a handicap: weaker player gets a shot on the hardest 3 holes.',
             note:'Focus on the concept of fairness, not the calculation. The WHS formula comes later.' },
      gm:  { name:'Handicap Match',     setup:'5-hole match play with simulated handicaps.',
             rules:'Coach assigns handicaps based on ability. Weaker players get shots on agreed holes. Play the match.',
             constraint:'After the match: who do you think the system was fair to? Was anyone disadvantaged?' },
      wu2: { q:'Why does golf have a handicap system?', success:'Children articulate "so players of different abilities can compete fairly."' } },

    { n:34, title:'Par 3 Challenge',    focus:'Hitting greens in regulation — full approach play',
      wu:  { name:'GIR Concept',        desc:'"Greens in regulation" = hitting the green in par minus 2 shots (so on a par 3: in one shot). Professionals average 65% GIR. What do you think yours is today?' },
      sk:  { name:'Approach Accuracy',  drill:'5 approach shots to each of 3 par 3 targets. Count: how many hit the green? How many are within 10 yards?',
             constraint:'"Aim for the centre of the green — not the flag — on every approach."',
             note:'Aiming at the centre gives the most margin for error. Flag-hunting at this age creates bad habits.' },
      gm:  { name:'Par 3 League',       setup:'4 par 3 holes.',
             rules:'Score: on the green in one = 3 pts, within 10 yards = 2 pts, within 20 yards = 1 pt. Total over 4 holes.',
             constraint:'Track GIR percentage across the season — set a personal improvement target.' },
      wu2: { q:'Why should you aim at the centre of the green, not the flag?', success:'Children articulate the margin-for-error principle.' } },

    { n:35, title:'Favourite Club',     focus:'Mastery and confidence building on one club',
      wu:  { name:'Club Vote',           desc:'Each child nominates their favourite club. Why that one? Class discussion — is there a pattern in which clubs are popular?' },
      sk:  { name:'Deep Dive',           drill:'Each child spends 20 minutes on only their favourite club. Set personal challenges: gate drill, distance targets, different lies.',
             constraint:'Can you identify 3 different shots you can play with your favourite club?',
             note:'Mastery of one tool builds transferable confidence. A child who truly owns one club will apply that confidence to new ones.' },
      gm:  { name:'Favourite Club Challenge', setup:'Course designed so every hole can be played with any single club.',
             rules:'Each child uses only their one favourite club for the entire course. Score normally.',
             constraint:'Level up: swap clubs with a partner halfway through — how does it change your game?' },
      wu2: { q:'What three things can your favourite club do that you couldn\'t do at the start of term?', success:'Every child articulates genuine skill growth with their chosen club.' } },

    { n:36, title:'Pressure Putting',   focus:'Performing under observation — mental resilience',
      wu:  { name:'Easy First',          desc:'Children putt from 3 ft privately. Then coach announces: "This next putt counts for the team score. Everyone is watching." Observe how behaviour changes.' },
      sk:  { name:'Pressure Protocol',   drill:'5-step routine on every putt: read, visualise, address, one look, go. Under pressure — faster, not slower.',
             constraint:'Make 5 consecutive 4-ft putts. Start again if you miss. Count attempts needed.',
             note:'"The routine is your anchor. Under pressure, let the routine do the thinking."' },
      gm:  { name:'Last Putt League',   setup:'3-hole course. Last putt on each hole counts double.',
             rules:'All putts scored. Last hole of round: last putt counts triple. Observe: does strategy change on the triple-value hole?',
             constraint:'Debrief: who changed their routine under pressure? Did it help or hurt?' },
      wu2: { q:'What does it feel like to putt when everyone is watching?', success:'Children articulate the mental experience and identify their own pressure response.' } },

    { n:37, title:'Pace of Play',       focus:'Ready golf and efficient decision-making',
      wu:  { name:'Time Trial',          desc:'Time one child playing a single hole at their normal pace. Then a second child playing "ready golf" (ready to hit when it\'s safe, regardless of honour). Compare times.' },
      sk:  { name:'Ready Golf Drill',    drill:'Play a 3-hole course with a 10-minute total time limit. Children must be set up and ready when it is their turn. Practice making club and target decisions while others are playing.',
             constraint:'Each shot must be played within 30 seconds of the previous player finishing.',
             note:'"Think while others play, so you\'re ready when it\'s your turn." This is the pace-of-play professional habit.' },
      gm:  { name:'Speed Round',         setup:'5-hole course, 15-minute limit.',
             rules:'Official scoring within the time limit. Any hole not completed = score of bogey +2. Group that completes with best score wins.',
             constraint:'Post-round: did faster play affect your score? How do you maintain quality under time pressure?' },
      wu2: { q:'What can you do while your partner is playing to save time?', success:'Children list: study lie, select club, rehearse routine — all before it is their turn.' } },

    { n:38, title:'Stroke Play Round',  focus:'Official 9-hole — marked cards and full rules',
      wu:  { name:'Rules Reminder',      desc:'5-question rules refresher: OB, unplayable, marking on green, bunker procedure, order of play. Quick answers, coach confirms.' },
      sk:  { name:'Official Round Prep', drill:'Each child receives an official scorecard. Coach explains: sign the card, check partner\'s score, total must be correct.',
             constraint:'"You are responsible for your score. Your partner is responsible for theirs."',
             note:'Introduce: signing an incorrect scorecard = disqualification. Integrity is the cornerstone of the game.' },
      gm:  { name:'9-Hole Stroke Play', setup:'9 holes or equivalent.',
             rules:'Full rules, official scorecards marked and signed. Coach is available for rules questions only.',
             constraint:'Debrief: best hole, worst hole, one rules situation handled correctly.' },
      wu2: { q:'Why do golfers sign their scorecards?', success:'Children articulate the personal responsibility and integrity principles of golf scoring.' } },

    { n:39, title:'Skills Passport',    focus:'Full benchmark — all skills recorded',
      wu:  { name:'Passport Preview',   desc:'Distribute Skills Passports. Review targets from Q1 passport. Compare: what was your best score then? What is it likely to be now?' },
      sk:  { name:'Passport Stations',  drill:'6 stations: (1) 12-ft gate putt. (2) chip to hoop from 20 ft. (3) pitch to zone from 35 yards. (4) iron to fairway at 60 yards. (5) bunker splash. (6) 2-shot hole. Record each result.',
             constraint:'Beat your Q1 personal best on at least 2 stations.',
             note:'Every result is recorded — no pass/fail. Growth is the only measure.' },
      gm:  { name:'Passport Round',     setup:'5-hole course using all 6 skills.',
             rules:'Children complete the course with pre-shot routine on every shot. Coach records one specific observation per child.',
             constraint:'Children share one improvement they\'re most proud of from the year.' },
      wu2: { q:'Looking at your Q1 and Q4 passports — what changed the most?', success:'Every child leaves with a completed Q4 Skills Passport and one specific achievement they are proud of.' } },

    { n:40, title:'Term Showcase',      focus:'Presenting growth to parents and the community',
      wu:  { name:'Coach Tribute',       desc:'Each child shares one sentence about their coach: "What I appreciate about my coach is..." Collected and shared.' },
      sk:  { name:'Skills Demonstration', drill:'Children demonstrate 2 skills of their choice to parents. One must be a technical skill, one must be a mental skill (routine, strategy decision, etc.).',
             constraint:'Explain the skill to the parent — not just demonstrate it.',
             note:'Articulating what you know consolidates the learning. Teaching is the highest form of understanding.' },
      gm:  { name:'Parent-Child Scramble', setup:'5-hole scramble, child-parent pairs.',
             rules:'Child plays every shot first. Parent plays from child\'s ball position (if better, use parent\'s; if not, use child\'s). Child is the strategic advisor.',
             constraint:'Children give one piece of advice before every parent shot.' },
      wu2: { q:'What is one thing you want to keep working on next term?', success:'Every child leaves with a specific goal, a completed passport, and a genuine sense of achievement.' } },
  ],
},
'8-9': {
  label:'Ages 8–9', ltad:'FUNdamentals+', color:'#2980B9',
  lessons:[
    { n:1,  title:'Swing Mechanics',     focus:'Coil and release — rotational fundamentals',
      wu:  { name:'Rotation Race',       desc:'Children hold a club across their chest. Rotate shoulders 90° right, then 90° left on coach command. Time how many full rotations in 30 seconds. Increase speed.' },
      sk:  { name:'Coil & Release Drill', drill:'Full swing with 7-iron from mat. Focus: shoulder turn to 90° on backswing, hips lead the downswing, full follow-through to balanced finish. Hold finish 3 seconds.',
             constraint:'Feet together drill — full swing with feet together forces rotation over power, improves balance.',
             note:'Common error: lifting arms without rotating. Cue: "Turn your back to the target — let your arms follow."' },
      gm:  { name:'Finish Position Challenge', setup:'Target zone 50–70 yards.',
             rules:'5 shots. Only those held in a balanced finish for 3 seconds count. Score: zone 1 (nearest) = 1, zone 2 = 2, zone 3 = 3. Must finish to score.',
             constraint:'Level up: alternate 7-iron and 5-iron — identify the difference in distance and feel.' },
      wu2: { q:'What moves first on the downswing — your hips or your arms?', success:'Children identify "hips lead, arms follow" without prompting.' } },

    { n:2,  title:'Putting — Reading Slope', focus:'Green-reading — break awareness',
      wu:  { name:'Slope Walk',          desc:'Place a ball on a slight slope. Children observe where it rolls without being hit. Discuss: "Which way does the ground tilt? Which way will the putt break?"' },
      sk:  { name:'Break Reading Drill',  drill:'Set up 3 putts with visible break (use foam wedge under edge of putting mat, or natural slope). Children read break, predict direction, then putt.',
             constraint:'"Aim 6 inches outside the hole" — practice aiming at an empty space to allow for break.',
             note:'Introduce: always read from behind the ball first, then from behind the hole. "Two looks, one plan."' },
      gm:  { name:'Break-or-Straight Bet', setup:'3 putts set up: 1 straight, 1 breaks left, 1 breaks right.',
             rules:'Before each putt, child predicts: straight, left, or right. Score: correct prediction = 1 pt, holed putt = 2 pts.',
             constraint:'Level up: children set up their own putts for peers to read — must explain the break before the putt.' },
      wu2: { q:'What two things do you check when reading a breaking putt?', success:'Children articulate "ground slope direction" and "speed affects break."' } },

    { n:3,  title:'Chipping — Different Lies', focus:'Chipping from uphill, downhill, and sidehill lies',
      wu:  { name:'Lie Identification',  desc:'Place a ball in 4 different lie positions (uphill, downhill, flat, sidehill). Children point to each and name the lie before the session begins.' },
      sk:  { name:'Lie-Adapted Chipping', drill:'Uphill lie: weight stays on lead foot, shaft leans forward, ball back in stance. Downhill lie: weight more forward, swing follows the slope. Sidehill: adjust aim for natural curve.',
             constraint:'Same chip, 3 different lies — count how many land on the target zone from each lie.',
             note:'"The ground tells you where to aim — play with the slope, not against it."' },
      gm:  { name:'3-Lie Challenge',     setup:'3 stations: one uphill lie, one downhill lie, one flat. Each 15 ft from hoop.',
             rules:'5 chips from each lie. Score 2 pts per hoop landing. Compare scores across lies — identify strongest lie.',
             constraint:'Level up: chip from downhill lie to an elevated target — must commit to slope adjustment.' },
      wu2: { q:'Which lie was hardest and what did you change to adapt?', success:'Children articulate one specific technical adjustment per lie.' } },

    { n:4,  title:'Pitching — Distance Control', focus:'Pitching 20–50 yards — swing length controls distance',
      wu:  { name:'Yard Estimating',     desc:'Mark 20, 35, 50 yards with cones. Children stand at each and visualize a ball landing there. Guess: "How many giant steps is that?"' },
      sk:  { name:'Swing Length Ladder', drill:'9 o\'clock swing = 20 yards. 10 o\'clock = 35 yards. 11 o\'clock = 50 yards. Practice each length to feel the distance. No aiming first — just length calibration.',
             constraint:'Partner calls a distance (20, 35, or 50). Child selects swing length without being told which to use.',
             note:'Same tempo at all swing lengths. The ONLY variable is swing length — acceleration must be consistent.' },
      gm:  { name:'Pitch Darts',         setup:'Concentric scoring zones at 20, 35, 50 yards (10 pts centre, 5 pts mid, 2 pts outer).',
             rules:'Call your target distance. 5 pitches. Only pitches to the called distance score. Nearest to called zone = bonus 3 pts.',
             constraint:'Level up: coach calls distance after child is set up — must switch swing length in real time.' },
      wu2: { q:'How do you change distance without changing tempo?', success:'Children name "swing length, not swing speed" as the variable.' } },

    { n:5,  title:'Bunker Concepts',     focus:'Sand play basics — angle of attack and splash',
      wu:  { name:'Sand Awareness',      desc:'Children draw an imaginary bunker with cones. Walk around it — never through it. Identify: "rake entry, ball position, exit direction." No clubs yet.' },
      sk:  { name:'Splash Drill (dry)',   drill:'Use a sand substitute (tray) or towel folded under the ball. Open stance, open face, swing through 2 inches BEHIND the ball. Ball should "pop" up without direct contact.',
             constraint:'Put a tee 2 inches behind ball — splash the tee, not the ball.',
             note:'"The club never touches the ball — the sand/surface pushes the ball out." Patience with this concept — it\'s counterintuitive.' },
      gm:  { name:'Splash Target Game',  setup:'Sand tray or towel, 3 targets at 10, 15, 20 ft.',
             rules:'5 shots. Ball must clear a "lip" (raised board) to score. Closest to target after clearing lip = points.',
             constraint:'Level up: name which target before splashing — committed decision-making.' },
      wu2: { q:'Why does the club hit behind the ball in the bunker — not the ball itself?', success:'Children explain "sand pushes the ball" concept.' } },

    { n:6,  title:'Club Selection',      focus:'Matching club to shot — course management thinking',
      wu:  { name:'Club Quiz Show',      desc:'Coach describes a scenario: "You\'re 10 feet from the hole on the green — which club?" Fast-fire scenarios. Increasingly difficult: obstacles, distances, lies.' },
      sk:  { name:'Club Selection Matrix', drill:'4 scenarios with different distances and lie types. Children select club, state reason, then execute. Evaluate: was the club selection logical, not just the result.',
             constraint:'"What is the highest risk club for this shot? What is the safest?"',
             note:'Introduce the "bump-and-run" concept: putter from off the green is often lowest risk.' },
      gm:  { name:'Club Selection Scramble', setup:'4-hole course with each hole requiring a different club.',
             rules:'Before each hole, pairs discuss and agree on club selection. Explain decision to coach. Then play the hole. 1 bonus point for correct club rationale.',
             constraint:'Level up: one partner can veto the other\'s club choice — must negotiate and agree.' },
      wu2: { q:'What is the lowest-risk club for a shot 5 feet off the edge of the green?', success:'Children identify putter as lower-risk than chipping from close range.' } },

    { n:7,  title:'Scoring & Rules',     focus:'Match play vs stroke play — rules introduction',
      wu:  { name:'Rules Myth-Busting',  desc:'Coach states 3 rules: 1 true, 2 invented. Children vote on which is the real rule. Quick discussion on each.' },
      sk:  { name:'Stroke Play vs Match Play', drill:'Explain: stroke play = total number of shots over 18 holes. Match play = who wins each hole. Play a 3-hole practice round twice — once recording total strokes, once playing hole-by-hole winner.',
             constraint:'"In match play, what changes about your strategy when you\'re 2 up?"',
             note:'Introduce: conceding a putt in match play. "Gimme" concept — generosity and pace of play.' },
      gm:  { name:'Mini Match Play',     setup:'5-hole short course.',
             rules:'Pairs play match play. Track holes won. Introduce basic rules: out of bounds = stroke and distance, lost ball = drop with penalty. Coach resolves disputes.',
             constraint:'Level up: introduce stroke index — one player gives another a "shot" on the hardest hole.' },
      wu2: { q:'If you\'re 3 holes down with 3 to play in match play — are you out?', success:'Children understand "dormie" concept — can still halve the match.' } },

    { n:8,  title:'Course Management',   focus:'Where to aim — strategic thinking',
      wu:  { name:'Risk Map',            desc:'Draw a simple hole on a whiteboard or ground (with cones for hazards, rough, green). Children map the "danger zones" and "safe zones." Discuss: where is the ideal landing area?' },
      sk:  { name:'Miss Direction Drill', drill:'For every shot, identify: "If I miss — which miss is acceptable?" Practice aiming at the SAFE side of the green, not the flag. Reinforce: "always have a miss plan."',
             constraint:'"Aim 10 feet right of the flag — same swing, different target."',
             note:'Introduce: "Pros miss on the safe side. Amateurs aim at trouble." Target management is a professional habit.' },
      gm:  { name:'Strategic 3-Hole Play', setup:'3 holes with designed hazards (cones as out of bounds, areas to avoid).',
             rules:'Before each shot, child must state: "My target is X. If I miss, I am happy to be in Y." Coach evaluates strategy, not just result.',
             constraint:'Level up: pair evaluates each other\'s strategy before the shot — one observer, one player.' },
      wu2: { q:'What is a "miss plan" and why do professional golfers use one?', success:'Children articulate planning for imperfect outcomes.' } },

    { n:9,  title:'Mental Game Intro',   focus:'Pre-shot routine — consistency under pressure',
      wu:  { name:'Pressure Putting',    desc:'Children putt from 4 ft. Easy first. Then: "If you make this next one, you get an extra turn in the game. If you miss, you wait one round." Observe how behaviour changes.' },
      sk:  { name:'Pre-Shot Routine',     drill:'5-step routine: (1) Visualise the shot from behind the ball. (2) One practice swing. (3) Step to ball, set club face. (4) Set feet, look at target ONCE. (5) Go. Same routine EVERY shot.',
             constraint:'Set a 10-second maximum for the routine — starts from when child steps to the ball.',
             note:'"Routine is your anchor. When nervous, it gives you something to do that you know."' },
      gm:  { name:'Pressure Round',      setup:'3-hole course, score counts.',
             rules:'Official scoring. Each child completes a round with pre-shot routine on every shot. Coach counts: how many shots had a full routine? Report back.',
             constraint:'Level up: partner calls "I\'m watching your routine" before each shot — increases pressure simulation.' },
      wu2: { q:'Why does having a routine help when you\'re nervous?', success:'Children articulate "routine removes decision-making under pressure."' } },

    { n:10, title:'Skills Passport',     focus:'Term assessment — full short game & swing evaluation',
      wu:  { name:'Season Best Drill',   desc:'Each child performs their best shot of the term — one attempt, full routine. Group watches and provides one positive observation each.' },
      sk:  { name:'Skills Passport Stations', drill:'(1) Putting: gate at 12 ft, 3 consecutive. (2) Chipping from rough: 20 ft to hoop. (3) Pitching: 35 yards to zone. (4) Club selection scenario: coach describes, child selects and executes.',
             constraint:'Personal benchmark: compare to start of term. Coach records each result.',
             note:'Frame the assessment as self-improvement vs last term, not competition between children.' },
      gm:  { name:'5-Hole Course',       setup:'Full short game course using all skills.',
             rules:'Every child completes the full course with pre-shot routine on every shot. Skills Passport completed and shared.',
             constraint:'Children set one personal goal for next term based on today\'s assessment.' },
      wu2: { q:'What is one thing you can work on at home or at the range before next term?', success:'Every child leaves with a completed Skills Passport and one personal goal.' } },

    // ── Q2: Full Game Development ──────────────────────────────────────────
    { n:11, title:'Driver Introduction', focus:'Tee height, ball position, sweeping motion',
      wu:  { name:'Tee Height Test',    desc:'Place 3 balls on tees at different heights (low, mid, high). Ask: "Which tee height do you think makes the ball go furthest with a driver and why?"' },
      sk:  { name:'Driver Drill',        drill:'Ball forward in stance (inside lead heel), tee height so equator of ball is level with top of club face. Weight slightly behind ball at address. Sweep up through impact — "hit up on the ball."',
             constraint:'Hit 5 driver shots with the thought "sweep, don\'t dig." Count clean contact vs top/fat.',
             note:'"With irons you hit down. With a driver you hit up — the tee allows an upward strike." This is a critical technical distinction.' },
      gm:  { name:'Fairway Finder',      setup:'Fairway corridor 30 yards wide, 150+ yards out.',
             rules:'5 drives. Score: in corridor = 3 pts, within 10 yards of corridor edge = 1 pt.',
             constraint:'Level up: add a maximum distance — must stay in the fairway AND not carry past a far cone.' },
      wu2: { q:'How is the driver swing different from an iron swing?', success:'Children articulate "up on the ball with driver, down with irons."' } },

    { n:12, title:'Fairway Wood',       focus:'Sweeping contact off ground or low tee',
      wu:  { name:'Sweep vs Dig',        desc:'Show two divots: one from an iron (steep, post-ball), one from a wood (shallow, barely any divot). Ask: "Which club made which divot?"' },
      sk:  { name:'3-Wood Drill',        drill:'Ball centre of stance, slightly forward. Sole the club flat at address. Sweep through — very shallow divot or no divot. Off low tee first, then off the ground.',
             constraint:'5 shots off tee, 5 off the ground. Compare — is there a contact difference?',
             note:'"The fairway wood is the most forgiving long club — it has a large sweet spot and shallow face."' },
      gm:  { name:'Long Distance Zone', setup:'3 scoring zones at 100, 130, 160 yards.',
             rules:'5 shots with fairway wood. Score based on distance zone reached.',
             constraint:'Level up: hit from uphill and downhill lies — how does slope affect distance?' },
      wu2: { q:'When would you choose a 3-wood over a driver?', success:'Children identify: accuracy over distance, tight fairway, second shot on a par 5.' } },

    { n:13, title:'Long Iron Precision', focus:'5-iron and 4-iron — shallow angle and punch finish',
      wu:  { name:'Trajectory Compare', desc:'Children hit one shot each with a 9-iron and a 5-iron from the same spot. Compare: trajectory, distance, roll. Discuss why they differ.' },
      sk:  { name:'Long Iron Drill',     drill:'5-iron, ball centre of stance. Shallow angle of attack — "sweep, don\'t dig." Hands slightly forward. Finish: shorter follow-through than a wedge (punch finish option).',
             constraint:'From 80 yards: 3 shots with 9-iron, 3 with 5-iron. Record distance gap.',
             note:'The long iron demands a shallower attack angle. Children who "dig" with a 5-iron get poor results — reinforce the sweep concept.' },
      gm:  { name:'Iron Gapping',        setup:'Targets at 60, 80, 100, 120 yards.',
             rules:'Children identify which iron hits each target distance. Hit 3 shots to each target with correct club.',
             constraint:'Level up: build a personal "distance chart" — record how far each iron carries.' },
      wu2: { q:'What changes in your swing angle between a wedge and a 5-iron?', success:'Children describe the shallower angle and less divot required for long irons.' } },

    { n:14, title:'Course Measurement',  focus:'Yardage markers, GPS, pace-of-play decision speed',
      wu:  { name:'Distance Estimation', desc:'Mark 50, 100, 150, 200 yards with cones. Children guess the distance to each without telling them the answer first. Compare estimates to reality.' },
      sk:  { name:'Yardage Reading',      drill:'Walk to yardage markers on a real hole. Read 150-yard marker, 100-yard marker, sprinkler head. Calculate: "If I\'m 15 yards past the 150 marker, how far to the pin?"',
             constraint:'Estimate carry vs total distance: "The flag is 130 yards but I carry my 7-iron 110. What do I need to account for?"',
             note:'Decision-making speed matters — professional golfers make club decisions in 20 seconds. Practice quick decisions.' },
      gm:  { name:'Yardage Game',        setup:'5 flags at unknown distances. Children estimate each.',
             rules:'Closest estimate to actual distance wins 3 pts. Furthest away scores 0. Play 3 rounds.',
             constraint:'Level up: children pace off distances — 1 adult stride = ~1 yard. How accurate are they?' },
      wu2: { q:'If the 150-yard marker is 20 yards behind you, how far is it to the hole?', success:'Children calculate 130 yards without difficulty.' } },

    { n:15, title:'Wind Play',           focus:'Club adjustment and trajectory management in wind',
      wu:  { name:'Grass Throw Test',   desc:'Each child tosses a handful of grass. Identify wind direction. Class agrees on: headwind, tailwind, or crosswind for the current hole.' },
      sk:  { name:'Wind Adjustment',     drill:'Headwind: take one extra club, swing at 80%, ball back slightly. Tailwind: one less club, normal swing. Crosswind: aim into the wind, let ball drift.',
             constraint:'"When it\'s breezy, swing easy." Hit 3 shots into wind, 3 downwind — measure the distance difference.',
             note:'Introduce trajectory control: de-loft the club (ball back, hands forward) to keep ball under wind.' },
      gm:  { name:'Wind Course',         setup:'5 holes using current wind.',
             rules:'Before each shot: declare wind adjustment. Coach awards 1 strategy pt per correct wind read.',
             constraint:'Bonus: one hole played into a strong headwind — use a punch shot for maximum wind resistance.' },
      wu2: { q:'Why does swinging harder into a headwind usually make things worse?', success:'Children articulate that harder swings create more spin, which magnifies the wind effect.' } },

    { n:16, title:'Slope Play',          focus:'Uphill, downhill, and sidehill lie adjustments',
      wu:  { name:'Lie Description',    desc:'Children stand on a slope and describe: which foot is higher? Where does this send the ball naturally? What do they need to adjust?' },
      sk:  { name:'All Four Lies',       drill:'Uphill: weight stays on lead foot, aim right (ball goes left). Downhill: weight forward, aim left (ball goes right). Sidehill-ball above feet: aim right. Below feet: aim left.',
             constraint:'Hit one shot from each of the 4 lie types in sequence. Count how many land in the target zone.',
             note:'The rule of thumb: ball always flies toward the lower foot on sidehill lies.' },
      gm:  { name:'Slope Challenge',    setup:'4 stations — one per lie type.',
             rules:'5 shots from each lie. Score 2 pts for landing in target zone.',
             constraint:'Level up: combine a sidehill lie AND an uphill slope simultaneously.' },
      wu2: { q:'On a sidehill lie with ball above your feet, which way will the ball naturally curve?', success:'Children correctly identify the ball curves toward the lower foot.' } },

    { n:17, title:'Divot Reading',       focus:'What the divot reveals about the strike',
      wu:  { name:'Divot Detective',    desc:'Coach hits 4 shots: flush, fat, thin, and shank. Children observe the divot after each and describe what they see. No names for the shots yet — just observations.' },
      sk:  { name:'Divot Analysis',      drill:'After each of 5 shots, study the divot: direction (left = out-to-in path), depth (deep = steep), starting point (fat vs flush). Record what each divot tells you.',
             constraint:'Hit 3 intentional "flush" shots. Describe the ideal divot: starts after ball, shallow, target-directional.',
             note:'"The divot is a footprint of your swing. You don\'t need video — the ground tells you everything."' },
      gm:  { name:'Divot Challenge',    setup:'Hitting mat that shows contact point (or real grass).',
             rules:'5 shots. After each, child describes the divot before seeing ball flight. Coach confirms or corrects.',
             constraint:'Level up: child predicts ball flight from divot alone — before looking where ball landed.' },
      wu2: { q:'What does a divot that points left tell you about your swing path?', success:'Children identify out-to-in path (which causes pulls and slices).' } },

    { n:18, title:'Practice Routine',   focus:'Structured range session — building deliberate practice',
      wu:  { name:'Random vs Blocked', desc:'Compare two approaches: (1) hit 30 balls with the same club to the same target. (2) hit 10 balls each to 3 different targets with 3 clubs. Ask: which do you think trains better?' },
      sk:  { name:'Session Structure',   drill:'A structured 45-ball range session: (1) 10 wedge shots varying distances. (2) 10 7-iron shots varying targets. (3) 10 5-iron shots. (4) 10 driver shots. (5) 5 "game situation" shots — random club, random target.',
             constraint:'Each shot: full routine before hitting. No two consecutive shots to the same target.',
             note:'Random practice (varying targets and clubs) produces superior transfer to the course vs blocked practice.' },
      gm:  { name:'Practice Audit',     setup:'Partner observes the 5-part session.',
             rules:'Observer records: routine compliance, target changes, and which club produced most consistent contact.',
             constraint:'After session: debrief — what did you work on? What improved? What needs more attention?' },
      wu2: { q:'Why is it better to vary your targets during range practice instead of hitting the same one 30 times?', success:'Children articulate "game situations are random, so practice should be too."' } },

    { n:19, title:'Scorecard Strategy', focus:'Reading a scorecard — identifying smart plays per hole',
      wu:  { name:'Scorecard Tour',     desc:'Give children a real course scorecard. Walk through: what does the stroke index mean? Where do you get a handicap shot? Which is the hardest hole?' },
      sk:  { name:'Hole-by-Hole Plan',  drill:'For each of 9 holes on the card: identify the scoring target (birdie? par? bogey?), the tee shot target, and the safe miss direction.',
             constraint:'"On hole 3 (par 5, stroke index 1 — the hardest): what is the realistic target score for an 8-9 year old?"',
             note:'Introduce: your target score per hole should be realistic, not "birdie every hole." Plan for bogeys on hard holes.' },
      gm:  { name:'Strategy Round',     setup:'5 holes (real or simulated).',
             rules:'Before each hole: state the plan (target score, tee shot target, safe miss). Play. Evaluate plan vs result.',
             constraint:'Post-round: which hole did you plan best? Which was a surprise?' },
      wu2: { q:'What does the stroke index number on a scorecard tell you?', success:'Children explain: stroke index 1 = hardest hole, 18 = easiest.' } },

    { n:20, title:'Q2 Full Assessment', focus:'Driver, iron, wedge, putt benchmark circuit',
      wu:  { name:'Q2 Highlights',      desc:'Coach asks: "What was the most useful skill you learned in Q2?" Each child answers. Coach identifies the top 3 themes.' },
      sk:  { name:'Assessment Circuit', drill:'(1) 5 driver shots — fairway hit rate. (2) 5 7-iron shots — accuracy to zone. (3) 5 wedge pitches — proximity to hole. (4) 10-ft gate putt — 3 consecutive.',
             constraint:'Record each result. Compare to Q1 Skills Passport.',
             note:'Frame as: "This tells you where you are now. Q3 tells you where you went."' },
      gm:  { name:'Q2 Challenge Round', setup:'5-hole course using driver, irons, and short game.',
             rules:'Full play with scorecards. Children set one Q3 target based on assessment results.',
             constraint:'Coach writes one personalised observation for each child in their passport.' },
      wu2: { q:'Which Q2 skill surprised you — either easier or harder than expected?', success:'Every child receives Q2 Skills Passport section completed.' } },

    // ── Q3: Advanced Skills ────────────────────────────────────────────────
    { n:21, title:'Punch Shot',         focus:'Low trajectory under trees — ball back, short finish',
      wu:  { name:'Obstacle Viz',        desc:'Set up a low obstacle (rope or branch) 10 yards in front of the hitting zone. Ask: "How would you get the ball under that?"' },
      sk:  { name:'Punch Drill',          drill:'Ball back in stance, hands well forward, shaft leaning. Short backswing (9 o\'clock), aggressive through with a short, low finish (no high follow-through). Ball flight should be low and piercing.',
             constraint:'"Punch from 40 yards so it runs up to the green and stops." ',
             note:'"The lower the finish, the lower the ball. Your finish controls your trajectory."' },
      gm:  { name:'Under the Branch',   setup:'Rope or branch 5 ft high, 10 yards out. Target zone 30 yards away.',
             rules:'Ball must pass under the obstacle AND reach the target zone. 5 attempts.',
             constraint:'Level up: obstacle lowered to 3 ft — requires even steeper punch setup.' },
      wu2: { q:'What three things change in your setup for a punch shot?', success:'Children name: ball back, hands forward, short finish — all three.' } },

    { n:22, title:'Flop Shot',          focus:'High, soft landing from tight lies near the green',
      wu:  { name:'Flop Demonstration', desc:'Coach demonstrates a flop shot over a cone to a tight target. Ask: "What did you notice about the face angle and the swing speed?" (face very open, fast aggressive swing).' },
      sk:  { name:'Flop Drill',           drill:'Face wide open (point to 2 o\'clock), ball forward, steep swing, full speed. "The faster you swing, the higher it goes." Never decelerate.',
             constraint:'"Flop from 15 yards over a 6-ft obstacle to a target 5 yards past the obstacle."',
             note:'"The flop requires commitment. Deceleration kills it — the ball stays low and you blade it." Reinforce speed.' },
      gm:  { name:'Flop Challenge',     setup:'3 obstacles at different heights (2 ft, 4 ft, 6 ft). Target hoops on far side.',
             rules:'Match obstacle height to correct technique. 5 attempts per obstacle. Score on clearing + proximity.',
             constraint:'Level up: child selects the obstacle height for the next player to clear.' },
      wu2: { q:'Why must you never decelerate on a flop shot?', success:'Children explain that deceleration results in blading and the ball stays low.' } },

    { n:23, title:'Draw & Fade',        focus:'Intentional ball shaping — path and face relationship',
      wu:  { name:'Shape Review',        desc:'Quick recap: face = start direction, path = curve direction. Children explain it back in their own words — peer-to-peer teaching.' },
      sk:  { name:'Shape Drill',          drill:'Draw: close face slightly relative to swing path. Fade: open face slightly relative to path. Use alignment sticks to set a consistent path. Hit 5 intentional draws, 5 intentional fades.',
             constraint:'"Can you make the ball curve left, then right, then left on three consecutive shots?"',
             note:'Introduce: most tour professionals play a consistent shape — a slight draw or slight fade they can rely on under pressure.' },
      gm:  { name:'Shape Challenge',    setup:'Two flags: one left of centre, one right.',
             rules:'10 shots: 5 must curve left (draw), 5 must curve right (fade). Score: ball starts correct direction = 1 pt, curves to correct flag = 2 pts.',
             constraint:'Level up: call the shape AFTER the child is set up.' },
      wu2: { q:'What does a draw feel like in your hands compared to a fade?', success:'Children describe the feel difference in grip pressure and follow-through direction.' } },

    { n:24, title:'Long Bunker Shot',   focus:'Distance in bunkers — different technique from greenside',
      wu:  { name:'Bunker Compare',     desc:'Ask: "Is the technique for a 10-yard bunker shot the same as a 40-yard bunker shot?" Discuss before revealing answer: no — longer = more normal technique.' },
      sk:  { name:'Long Bunker Drill',  drill:'40-50 yards from sand. Use a 7-iron or 8-iron. Normal setup, ball back slightly. Strike the ball FIRST (not sand first) — treat it like a tight lie iron shot.',
             constraint:'From 30 yards: 3 greenside technique shots (behind ball), 3 fairway bunker shots (ball first). Compare results.',
             note:'"A fairway bunker shot is an iron shot from a different surface — ball first, shallow, normal follow-through."' },
      gm:  { name:'Bunker Distance Control', setup:'Targets at 20, 35, 50 yards from a sand area.',
             rules:'5 shots from sand. Select correct technique (greenside vs fairway) for each distance. Score 2 pts for reaching target zone.',
             constraint:'Level up: coach calls the distance after player is in address position.' },
      wu2: { q:'What changes in your technique when a bunker shot is 40 yards vs 10 yards?', success:'Children articulate ball-first contact for long bunker shots vs sand-first for short.' } },

    { n:25, title:'Rough Escape',       focus:'Thick rough, semi-rough, and wet grass adjustments',
      wu:  { name:'Lie Survey',          desc:'Children each find the worst lie they can on the course. Walk around and examine each other\'s lies — rate them 1-10 (1 = great, 10 = worst possible).' },
      sk:  { name:'Rough Technique',     drill:'Thick rough: open face, steeper angle, shorter backswing, aggressive through. Semi-rough: minor adjustments only. Wet grass: more loft, expect less distance.',
             constraint:'From thick rough: aim 10 yards right — the grass always closes the face and pulls the shot left.',
             note:'The most important thing from deep rough: get the ball back in play. Par is not the goal — bogey max is the goal.' },
      gm:  { name:'Escape Artist',       setup:'3 designated rough areas with targets 20 yards away.',
             rules:'5 shots from each rough type. Score: in target zone = 3 pts, in play = 1 pt, in same rough = 0 pts.',
             constraint:'Level up: coach buries the ball deeper than normal — "buried lie" technique.' },
      wu2: { q:'What is the priority goal when you are in deep rough?', success:'Children identify: get back in play (not "make the green").' } },

    { n:26, title:'Uneven Lies Mastery', focus:'All four lie types in one session',
      wu:  { name:'Lie Stations Tour',  desc:'Walk all four lie stations (uphill, downhill, ball above feet, ball below feet). At each: children describe the natural ball flight and the setup adjustment required.' },
      sk:  { name:'Adaptation Circuit', drill:'5 shots from each of the 4 lie types in sequence. Focus on making the adjustment automatically before checking the result.',
             constraint:'After 4 shots, a partner names a lie type — set up for it in 10 seconds without prompting.',
             note:'The goal is automatic adaptation — seeing the lie and setting up correctly without conscious thought.' },
      gm:  { name:'Lie Challenge Cup',  setup:'4-hole course, each hole on a different uneven lie.',
             rules:'Official scoring. Children set up and play without coaching input. Post-hole: was the adjustment correct?',
             constraint:'Level up: coach sets up all 4 lie types on one hole — child must identify and adapt to all of them.' },
      wu2: { q:'Which of the four uneven lies is hardest for you and what specifically makes it difficult?', success:'Every child can accurately name the adjustment required for all four lie types.' } },

    { n:27, title:'Scramble Recovery',  focus:'Par-saving from bad positions — recovery mindset',
      wu:  { name:'Recovery vs Attack', desc:'"You hit your tee shot into the trees with a recovery shot available to the fairway or a risky shot at the green. Which do you play?" Discuss as a group.' },
      sk:  { name:'Recovery Priority',   drill:'From 3 difficult lies: trees, thick rough, plugged sand. For each: identify the safest exit route, execute the recovery shot, assess: could you have made par from that result?',
             constraint:'"From trees: the first question is NOT what club to use — it\'s which direction gets you back in play."',
             note:'Introduce the par-save mindset: a smart bogey beats a scrambling double. Recovery = get the next shot to be easy.' },
      gm:  { name:'Recovery Round',     setup:'3 holes — coach secretly places each child\'s tee shot in a bad position.',
             rules:'Children must recover to the fairway before attacking the green. Score normally from there.',
             constraint:'Post-round: how many successful recoveries resulted in a par or bogey? Track the percentage.' },
      wu2: { q:'What is the first thing you assess when your ball is in the trees?', success:'Children identify: find an exit route BEFORE selecting a club.' } },

    { n:28, title:'Pressure Round',     focus:'6-hole competition — score counts officially',
      wu:  { name:'Competition Warm-Up', desc:'Structured 15-minute pre-round warm-up led by children. Coach observes only — does not guide. Note who has a warm-up routine and who does not.' },
      sk:  { name:'Pre-Round Routines', drill:'Each child describes their personal warm-up sequence. Peer feedback: did they cover short game, long game, and mental prep?',
             constraint:'"Complete your warm-up in under 12 minutes — pace of play starts before you tee off."',
             note:'A pre-round warm-up is not about getting hot — it\'s about calibrating feel for the day\'s conditions.' },
      gm:  { name:'Pressure 6-Hole',    setup:'6 holes — full rules, marked scorecards.',
             rules:'Official stroke play. Children keep each other\'s score. Post-round: declare one decision they are proud of.',
             constraint:'Sportsmanship point: coach awards one player per hole for outstanding attitude.' },
      wu2: { q:'What did you notice about your routine under pressure vs in practice?', success:'Every child completes the round with a valid scorecard and one identified learning.' } },

    { n:29, title:'Statistics Tracking', focus:'Fairways, greens in regulation, putts per round',
      wu:  { name:'Stats Introduction', desc:'"What do you think PGA Tour professionals average in terms of: fairways hit (%) / greens in regulation (%) / putts per round?" Reveal answers: ~60% / ~65% / ~29.' },
      sk:  { name:'Personal Stats',      drill:'Play 3 holes keeping full stats: (1) did you hit the fairway? (2) did you hit the green in regulation? (3) how many putts?',
             constraint:'Calculate: what percentage of fairways and greens did you hit?',
             note:'"Statistics show you where the shots are being lost. You can\'t improve what you don\'t measure."' },
      gm:  { name:'Stats Round',         setup:'9 holes (or equivalent).',
             rules:'Full stat tracking per hole. Post-round: identify the single biggest area of shot loss.',
             constraint:'Level up: track proximity to hole on approach shots — average how close you are.' },
      wu2: { q:'Based on your stats today, which skill would improve your score the most if you got 10% better at it?', success:'Children identify their weakest stat and connect it to a practice priority.' } },

    { n:30, title:'Mid-Season Review',  focus:'Data-based self-assessment — one Q4 priority',
      wu:  { name:'Season So Far',       desc:'Coach summarises: "In Q1 you learned X, Q2 you added Y, Q3 you worked on Z. Look at your passport — what\'s changed the most?"' },
      sk:  { name:'Priority Setting',    drill:'Compare Q1 and Q3 passport scores. Identify the 3 biggest improvements. Identify the 2 remaining gaps. Choose ONE priority for Q4.',
             constraint:'"Your Q4 priority must be specific — not \'putting\' but \'lag putting from 25+ ft.\'"',
             note:'Specific goals produce specific results. Vague goals produce vague practice.' },
      gm:  { name:'Priority Practice Round', setup:'3 holes — play only with the Q4 priority in mind.',
             rules:'Score normally, but evaluate ONLY the priority skill after each hole. Was it executed? What happened?',
             constraint:'Partner observes and gives one specific piece of feedback per hole on the priority skill.' },
      wu2: { q:'State your Q4 priority in one sentence: "I will improve my [specific skill] by [specific measure]."', success:'Every child leaves with one precise, personal Q4 development target.' } },

    // ── Q4: Performance ────────────────────────────────────────────────────
    { n:31, title:'Pre-Round Warm-Up',  focus:'Owning a structured warm-up routine',
      wu:  { name:'Warm-Up Comparison', desc:'"Athlete A warms up for 30 minutes randomly. Athlete B warms up for 12 minutes with a specific structure. Who is better prepared?" Discuss.' },
      sk:  { name:'12-Minute Routine',  drill:'Lead children through: 2 min short putts (build confidence). 2 min lag putts. 2 min chipping. 3 min pitching. 3 min full swings (wedge → 7-iron → driver). Repeat twice.',
             constraint:'Children lead the warm-up themselves — coach is silent. Time each section.',
             note:'The warm-up is a ritual. It should feel the same every time, in every condition, at every venue.' },
      gm:  { name:'Warm-Up Race',       setup:'Children warm up independently.',
             rules:'Coach evaluates: was it structured? Did it cover all areas? Did it end with the right mental state?',
             constraint:'Children design their own warm-up plan on paper, then execute it next session.' },
      wu2: { q:'What does your warm-up achieve that just going straight to the 1st tee doesn\'t?', success:'Children articulate: calibration, confidence, routine activation, and physical readiness.' } },

    { n:32, title:'Tournament Prep',    focus:'Draw, format, pairings, and rules meeting simulation',
      wu:  { name:'Tournament Day Sim', desc:'Simulate arrival: "You have arrived at a tournament. The rules sheet says: stroke play, 9 holes, no caddies, OB in yellow stakes. What do you do in the next 30 minutes?"' },
      sk:  { name:'Tournament Protocol', drill:'Practice: (1) sign in, get card. (2) find your pairing. (3) warm up on schedule. (4) attend rules meeting. (5) arrive on tee 5 minutes early.',
             constraint:'"You\'re 3 minutes late for your tee time — what are the consequences?" (Penalty in most formats)',
             note:'"Tournament performance starts the night before — know the format, know the course, know your pairings."' },
      gm:  { name:'Tournament Simulation', setup:'9 holes — full tournament conditions.',
             rules:'Children manage their own time, scorecards, and pairings. Coach observes only.',
             constraint:'Post-round: what would you do differently in preparation for a real tournament?' },
      wu2: { q:'List three things you would do the night before a golf tournament.', success:'Children list: equipment check, sleep, course information — in any form.' } },

    { n:33, title:'Match Play Championship', focus:'Bracket knockout format — key hole situations',
      wu:  { name:'Match Play Strategy', desc:'"You are 2 down with 4 holes to play in match play. What is your strategy?" Discuss. Then: "You are 3 up with 2 holes to play — what changes?"' },
      sk:  { name:'Situation Drill',     drill:'Simulate 3 match play situations: (1) 1 down with 1 to play — need a birdie. (2) 1 up with 1 to play — need a par to win. (3) all square on the last — pressure putt to win.',
             constraint:'Full pre-shot routine on every shot in every simulation.',
             note:'"In match play, each hole is a fresh start — there is no such thing as a bad round, only bad holes."' },
      gm:  { name:'6-Hole Knockout',     setup:'Bracket of 6-hole matches.',
             rules:'Winner advances. Sportsmanship observed by coach. Losing players play a consolation 3-hole match.',
             constraint:'Announce the champion and runners-up — celebrate all levels of participation.' },
      wu2: { q:'What is the difference in mindset between being 2 up and being 2 down with 4 to play?', success:'Children articulate the strategic shift: attack vs protect.' } },

    { n:34, title:'Pressure Short Game', focus:'Points-based short game under competition pressure',
      wu:  { name:'High Stakes Putt',   desc:'Start with a 5-ft putt. First child to miss sits out for 2 minutes. Observe how quickly behaviour changes with stakes. Debrief after.' },
      sk:  { name:'Pressure Protocol',  drill:'10 3-ft putts under a time clock (8 seconds per putt from address). After 10 putts: same drill with a partner watching. Compare success rates.',
             constraint:'Identify: which pressure type affected you more — time or audience?',
             note:'Different people respond to different pressure types. Self-knowledge is the beginning of mental management.' },
      gm:  { name:'Short Game Nassau',  setup:'Short game course with point scoring.',
             rules:'3-hole match, points for: closest chip = 2 pts, 1-putt = 3 pts, 2-putt = 1 pt, 3-putt = 0 pts.',
             constraint:'Last hole is worth double — observe how strategy changes on the high-value hole.' },
      wu2: { q:'What did you notice about your behaviour when the stakes were higher?', success:'Every child identifies a specific physical or mental change under pressure.' } },

    { n:35, title:'On-Course Commentary', focus:'Verbalising strategic decisions during play',
      wu:  { name:'Commentary Demo',   desc:'Coach plays one shot while narrating out loud: "I\'m 130 yards out. Wind is left to right. Hazard is right. I\'m taking an 8-iron, aiming 10 yards left of the flag..."' },
      sk:  { name:'Narrated Play',       drill:'Each child narrates every shot out loud: club selection, target, wind, miss plan, result. Partner listens and evaluates: was the plan sound?',
             constraint:'"Your commentary must include: club, target, wind adjustment, and miss plan — in that order."',
             note:'Verbalising decisions forces complete thinking. Children who narrate discover their own gaps in course management.' },
      gm:  { name:'Commentary Round',  setup:'3 holes.',
             rules:'Each child narrates every shot. Partners score the commentary (1 pt per element included) independently of the shot result.',
             constraint:'Post-round: whose commentary was most complete? What did the group learn from each other?' },
      wu2: { q:'What is the one element of your pre-shot thinking you most often skip?', success:'Every child identifies a specific gap in their decision-making process.' } },

    { n:36, title:'Skills Passport Advanced', focus:'All stations vs Q1 benchmarks',
      wu:  { name:'Q1 Comparison',      desc:'Coach reads out Q1 Skills Passport scores for the group. Children estimate their improvement before testing.' },
      sk:  { name:'Advanced Stations',  drill:'(1) 12-ft gate putt — 3 consecutive. (2) Chip from rough — 20 ft hoop. (3) Pitch — 40 yards to zone. (4) Driver — fairway hit rate from 5 shots. (5) Bunker splash to hoop. (6) 2-shot hole — chip + putt.',
             constraint:'Beat personal Q1 best on at least 3 of the 6 stations.',
             note:'Frame as: you have 40 lessons of experience — what does that look like in numbers?' },
      gm:  { name:'Q4 Challenge Round', setup:'5-hole course, all skills.',
             rules:'Full stroke play with scorecards. Compare to Q1 round scores.',
             constraint:'Coach provides one written observation per child in their passport.' },
      wu2: { q:'What is the biggest improvement you have made from Q1 to Q4?', success:'Every child receives a completed Q4 Skills Passport with specific coach observations.' } },

    { n:37, title:'Goal Setting',       focus:'SMART goals for next year\'s development',
      wu:  { name:'Goals vs Wishes',    desc:'"I wish I could hit a 300-yard drive" — is that a goal? Discuss: what makes it a goal vs a wish? (specific, measurable, achievable, realistic, time-bound — introduce SMART).' },
      sk:  { name:'Goal Writing',        drill:'Each child writes 3 goals: (1) one technical skill (e.g., "I want to hit 7 fairways out of 14 in my next tournament"). (2) one mental skill. (3) one course management goal.',
             constraint:'"Each goal must include: what you will do, how you will measure it, and when you will achieve it by."',
             note:'"A goal without a plan is just a wish. A goal WITH a plan is a commitment."' },
      gm:  { name:'Goal Accountability', setup:'Partner review.',
             rules:'Share all 3 goals with your partner. Partner rates: is each goal SMART? Provide one improvement suggestion per goal.',
             constraint:'Goals are signed by the child and the coach and stored in the Skills Passport.' },
      wu2: { q:'Read your most important goal out loud. What is the very first step you will take to achieve it?', success:'Every child has 3 written SMART goals stored in their passport.' } },

    { n:38, title:'Peer Coaching',      focus:'Observing and evaluating a partner\'s swing',
      wu:  { name:'Coaching Checklist', desc:'Children receive a simple 6-point swing checklist: grip, stance width, ball position, takeaway, impact, finish. Practice identifying each point on a static setup.' },
      sk:  { name:'Observation Practice', drill:'Pairs: Child A hits 5 shots. Child B evaluates using the checklist, recording one strength and one area for improvement.',
             constraint:'"Feedback must be: (1) specific — not just \'good.\' (2) observable — something you actually saw."',
             note:'Effective feedback is a life skill. Teaching others to observe improves their own self-awareness.' },
      gm:  { name:'Coaching Tournament', setup:'3 holes.',
             rules:'Each pair plays. One coaches, one plays per hole. Swap every hole. Coach\'s observations are shared after the round.',
             constraint:'Post-round: did the coaching feedback improve the player\'s results? What worked?' },
      wu2: { q:'What is the most useful piece of feedback you gave or received today?', success:'Every child provides and receives at least one specific, actionable observation.' } },

    { n:39, title:'Open Day',           focus:'Parents attend — children demonstrate skills',
      wu:  { name:'Welcome Address',    desc:'Children introduce themselves and the programme to parents. Each child delivers one sentence: "My name is X, I\'ve been playing for Y months, and today I\'m going to show you..."' },
      sk:  { name:'Skills Showcase',    drill:'Each child demonstrates 2 skills: one technical (their best shot), one strategic (narrate a course management decision out loud).',
             constraint:'Explain the skill to the parent — not just perform it. "This is a punch shot, and I use it when..."',
             note:'Articulating what you know is the highest form of understanding. This session reveals how much children have truly internalised.' },
      gm:  { name:'Parent-Child Match', setup:'5-hole scramble — child and parent vs another pair.',
             rules:'Child gives strategic advice before every shot. Parent follows the advice.',
             constraint:'Children award a sportsmanship point to the parent who followed advice most gracefully.' },
      wu2: { q:'What is one thing your parent said after the session that you will remember?', success:'Every child receives specific positive feedback from a family member.' } },

    { n:40, title:'Season Awards',      focus:'Celebration, recognition, and season closure',
      wu:  { name:'Season Highlights', desc:'Coach describes one memorable moment for each child from the year. Personal, specific, and affirming.' },
      sk:  { name:'Award Ceremony',     drill:'Categories: Most Improved Technical Skill, Most Consistent Course Management, Best Scramble Recovery, Most Improved Mental Game, Best Sportsmanship.',
             constraint:'Children vote for each other in secret — coach tallies. All children win something.',
             note:'"In sport — and in life — how you compete matters as much as the result."' },
      gm:  { name:'Champions Farewell Round', setup:'9 holes (or equivalent) — low pressure, pure fun.',
             rules:'Scramble format. Children choose partners. No formal scoring — just celebration.',
             constraint:'Each child completes the year with a handshake and one word that describes their golf season.' },
      wu2: { q:'What is one thing golf has taught you this year that is useful outside of golf?', success:'Every child articulates a transferable life lesson from their year in the programme.' } },
  ],
},
'10+': {
  label:'Ages 10+', ltad:'Learning to Train', color:'#C9A84C',
  lessons:[
    { n:1,  title:'Ball Flight Laws',    focus:'Face angle vs swing path — cause and effect',
      wu:  { name:'Ball Flight Predict', desc:'Coach hits 3 shots: straight, pull, push. Children identify what changed in the setup. Quick discussion before revealing the answer.' },
      sk:  { name:'Face & Path Drill',    drill:'Use alignment sticks to set up path lines. Swing along path with face open = fade. Swing along path with face closed = draw. Exaggerate each, then blend.',
             constraint:'"Hit 3 intentional fades, 3 intentional draws — compare the feel difference in your hands."',
             note:'Introduce D-Plane: ball starts where face is pointing, curves away from path. Simplify: "face = start direction, path = curve direction."' },
      gm:  { name:'Shape Challenge',     setup:'Two target flags: one left, one right of centre.',
             rules:'10 shots — 5 draw, 5 fade. Score: ball starts in correct half of fairway = 2 pts, lands on correct side of flag = 3 pts.',
             constraint:'Level up: coach calls "draw" or "fade" after the child is set up — must adapt.' },
      wu2: { q:'A ball starts left and curves further left. What do you know about the face and path?', success:'Children correctly identify: face is left of path (both open relative to target).' } },

    { n:2,  title:'Short Game Mastery',  focus:'All shots inside 50 yards — selection & execution',
      wu:  { name:'Shot Type Quiz',      desc:'Coach describes lies and distances. Children call the correct shot type (chip, pitch, bump-and-run, lob) and club before the answer is revealed.' },
      sk:  { name:'5-Shot Short Game Circuit', drill:'Station 1: 5 ft putt (routine). Station 2: 20 ft chip on fringe. Station 3: 30 ft pitch from rough. Station 4: 45 ft high lob over obstacle. Station 5: bump-and-run from 30 ft.',
             constraint:'At each station, name the club AND the landing target before striking.',
             note:'Evaluate decision-making, not results. "Did the shot selection make sense for the situation?"' },
      gm:  { name:'Short Game Scramble', setup:'5-hole course all within 50 yards.',
             rules:'Pairs. Best ball scramble. Every hole requires a different shot type. Pair must agree on shot type before playing.',
             constraint:'Level up: no putter on holes 1 and 3 — must chip or pitch into the hole.' },
      wu2: { q:'What factors determine which short game shot you choose?', success:'Children list: lie, distance to pin, obstacles, green speed as primary factors.' } },

    { n:3,  title:'Specialty Shots',     focus:'Punch shot & flop shot — advanced situations',
      wu:  { name:'Obstacle Visualisation', desc:'Set up a tree branch (or stick) 10 yards in front of hitting area. Discussion: "How do you get the ball under or over this obstacle?"' },
      sk:  { name:'Punch & Flop Techniques', drill:'Punch: ball back in stance, hands forward, short follow-through, low trajectory. Flop: ball forward, face wide open, steep swing, high soft shot. Practice each 8 times from tee.',
             constraint:'"Punch from 40 yards to stop quickly. Flop from 15 yards over a 6-ft obstacle."',
             note:'"The flop requires confidence — if you decelerate, the ball won\'t get up. Commit to the speed."' },
      gm:  { name:'Obstacle Course',     setup:'3 obstacles (under, over, curved). Course of 5 shots.',
             rules:'Each obstacle requires the correct specialty shot — punch under, flop over, draw/fade around. Coach scores on execution of correct shot type.',
             constraint:'Level up: child designs an obstacle and coaches peers on the correct shot type before execution.' },
      wu2: { q:'When would you choose a punch over a chip — and what changes in your setup?', success:'Children articulate ball position, hand position, and follow-through differences.' } },

    { n:4,  title:'Course Management',   focus:'Strategic decision-making — risk vs reward',
      wu:  { name:'Course Architect',    desc:'Groups draw a simple 3-hole layout (cones as hazards, string as fairway). Identify: risk zones, safe landing areas, ideal approach angles to the green.' },
      sk:  { name:'Risk/Reward Analysis', drill:'Present 3 scenarios: (1) 150 yards, water right, safe left. (2) 180 yards, bunker blocking front, bail-out right. (3) 100 yards, tight pin, open back-left quadrant. Discuss optimal target for each.',
             constraint:'"What is the best play if you\'re 2 up in match play? What if you\'re 2 down?"',
             note:'Introduce: "play to your miss." If you predominantly miss right, aim left of trouble.' },
      gm:  { name:'Strategic 5-Hole',    setup:'Designed 5-hole course with deliberate risk zones.',
             rules:'Before each shot: state target, state miss plan. Coach awards 1 strategy point per shot for sound reasoning, 1 score point for result. Compare strategy vs result scores.',
             constraint:'Level up: one hole is "high stakes" — double points. Observe how strategy changes under pressure.' },
      wu2: { q:'Describe your best strategic decision today — target, miss plan, and what happened.', success:'Children articulate pre-shot strategic thinking, not just outcomes.' } },

    { n:5,  title:'Pre-Shot Routine',    focus:'Refining and owning a consistent routine',
      wu:  { name:'Routine Audit',       desc:'Children demonstrate their current pre-shot routine. Peers time it (under 15 seconds?). Coach observes: is it consistent shot to shot?' },
      sk:  { name:'Routine Refinement',   drill:'Each child builds or refines their 5-step routine. Must include: (1) vision from behind. (2) practice swing with intention. (3) address with club face first. (4) feet in, one look. (5) commit and go.',
             constraint:'"Video yourself or have a partner observe 5 shots. Is every routine identical?"',
             note:'"Tour pros\' routines are the same in practice as under pressure. The routine must be pressure-proof."' },
      gm:  { name:'Routine Under Fire',  setup:'5-hole course, scoring counts.',
             rules:'Partner counts and records: full routine, partial routine, or no routine before each shot. Scorecard has two sections: shots AND routine compliance. Debrief after round.',
             constraint:'Level up: 30-second shot clock — if routine isn\'t complete in 30 seconds, child must re-start.' },
      wu2: { q:'What are the 5 steps of your routine in order?', success:'Every child can articulate all 5 steps consistently.' } },

    { n:6,  title:'Mental Game',         focus:'Pressure performance — focus cues & reset habits',
      wu:  { name:'Pressure Experiment', desc:'Children putt from 3 ft normally. Then: coach announces "this putt counts for 50 points." Observe change in behaviour, time, and outcome. Discuss openly.' },
      sk:  { name:'Focus Cue & Reset',    drill:'Each child identifies: (1) a focus cue (word or feeling, e.g., "smooth") to use before the shot. (2) a reset habit (e.g., take one breath, look at a target 100 yards away) after a bad shot.',
             constraint:'"Use your focus cue on every shot for the next 10 minutes — even if it feels odd."',
             note:'"The reset habit is for bad shots only. It signals your brain that the bad shot is finished and a new shot is beginning."' },
      gm:  { name:'Focus Cue Challenge', setup:'5-hole course, scoring counts.',
             rules:'Must say focus cue aloud before each shot. Must perform reset habit visibly after any shot that missed the target. Coach tracks: routines, cues, and resets.',
             constraint:'Level up: partner must observe and confirm both the cue (before) and reset (after bad shots).' },
      wu2: { q:'What is your focus cue and when do you use your reset habit?', success:'Every child can name both and execute them on command.' } },

    { n:7,  title:'Putting — Advanced',  focus:'Lag putting, reading greens, pace of play',
      wu:  { name:'Green Reading Race',  desc:'Place 3 balls in different positions on a sloped surface. Children compete to correctly predict break direction AND amount for all 3 before the coach reveals answers.' },
      sk:  { name:'3-Putt Elimination',  drill:'From 30 ft: goal is always two putts maximum. Practice: (1) lag to within 3 ft, (2) complete the hole. Count 3-putts as failures and identify cause (pace, line, or both).',
             constraint:'From 50 ft: maximum 2 putts. Record success rate over 10 attempts.',
             note:'Introduce: "The first putt\'s job is to set up an easy second putt — not to hole out." Change the definition of success.' },
      gm:  { name:'2-Putt Challenge',    setup:'6 putts from various distances (10–40 ft), including break.',
             rules:'Score: 0 pts for 3-putt, 2 pts for 2-putt, 5 pts for 1-putt. Track total over 18 putts (3 rounds of 6).',
             constraint:'Level up: introduce "lag zone" (3-ft circle). Ball stopping in lag zone from 30+ ft = bonus 2 pts.' },
      wu2: { q:'What is the primary goal of a 30-foot putt?', success:'Children identify "set up an easy second putt" not "hole it."' } },

    { n:8,  title:'Competition Prep',    focus:'Practice competition — all skills, full routine',
      wu:  { name:'Pre-round Warm-Up',   desc:'Structure a 10-minute pre-round warm-up: 2 min putting (start short), 2 min chipping, 3 min pitching, 3 min full swing. Children lead their own warm-up with minimal coach input.' },
      sk:  { name:'Shot Simulation',      drill:'Coach calls real on-course scenarios: "fairway bunker, 120 yards, pin front-right, wind against." Children select club, identify target, state miss plan, then execute.',
             constraint:'"Every decision in 15 seconds — no more thinking time."',
             note:'Simulate real decisions under time pressure. The goal is automatic application of course management skills.' },
      gm:  { name:'9-Hole Competition',  setup:'Full 9-hole layout using all available facilities.',
             rules:'Official stroke play. Full rules apply. Scorecards kept by playing partners. Post-round debrief: best decision, hardest moment, one thing to improve.',
             constraint:'Sportsmanship award: coach observes and awards one player for outstanding behaviour, attitude, and pace of play.' },
      wu2: { q:'What was your best strategic decision in today\'s round?', success:'Every child can identify one decision they are proud of.' } },

    { n:9,  title:'Round Simulation',    focus:'Full round conditions — rules, strategy, mental game',
      wu:  { name:'Rules Test',          desc:'5-question rules quiz (multiple choice). Children answer individually then discuss. Common scenarios: out of bounds, unplayable lie, water hazard, wrong ball, practice strokes.' },
      sk:  { name:'Match Play Simulation', drill:'Pairs play match play over 3 holes with full rules in effect. Coach acts as referee. Disputes resolved by reference to rules. Introduction to conceding putts and "halved holes."',
             constraint:'"Play your own ball at all times. If in doubt — play two balls and ask the pro later."',
             note:'Introduce the concept of playing honestly even when no one is watching — integrity as a core golf value.' },
      gm:  { name:'Match Play Championship', setup:'Bracket of 6-hole matches.',
             rules:'Match play. Winner advances. Coach ensures rules are followed and disputes handled correctly. Sportsmanship is evaluated as part of the competition.',
             constraint:'Losing players: play one more 3-hole consolation match — everyone finishes competing.' },
      wu2: { q:'Name one rule situation you handled correctly today that you weren\'t sure about last term.', success:'Children demonstrate growing rule knowledge and independent application.' } },

    { n:10, title:'Season Review',       focus:'Goal setting — strengths, growth areas, next season',
      wu:  { name:'Season Highlight Reel', desc:'Each child describes their best shot or moment of the term in 30 seconds. Group can ask one question each. Celebrate contributions.' },
      sk:  { name:'Strengths & Growth Assessment', drill:'Children self-assess on 6 categories (1–5 scale): Putting, Chipping, Pitching, Full Swing, Course Management, Mental Game. Coach provides their own independent rating. Compare and discuss gaps.',
             constraint:'"Where do you see the biggest gap between your rating and mine — and who do you think is right?"',
             note:'Use discrepancies as growth conversations, not corrections. "I rated you higher on course management — let me tell you why I see that."' },
      gm:  { name:'Goal Setting Round',  setup:'3-hole course — play with one specific goal in mind (chosen by child).',
             rules:'Play the 3 holes focusing only on the personal goal — not the score. After: set 3 goals for next term (1 technical, 1 mental, 1 course management).',
             constraint:'Write goals in the Skills Passport — signed by child and coach.' },
      wu2: { q:'What is one specific thing you will practice before next term starts?', success:'Every child leaves with 3 written goals in their Skills Passport.' } },

    // ── Q2: Advanced Technique ─────────────────────────────────────────────
    { n:11, title:'Swing Analysis',     focus:'Video self-review — 3 key checkpoints',
      wu:  { name:'Checkpoint Intro',   desc:'Introduce the 3 swing checkpoints: (1) address/setup, (2) top of backswing, (3) impact position. Children view professional screenshots and identify each checkpoint.' },
      sk:  { name:'Video Review',        drill:'Record each child\'s swing on a phone. Review together: (1) spine angle maintained? (2) club position at top — across, under, or over? (3) impact — hands ahead, shaft leaning, weight forward?',
             constraint:'"Identify one thing you do consistently well and one thing to change."',
             note:'Video is the most powerful feedback tool available. Children are often shocked — their feel and reality differ significantly.' },
      gm:  { name:'Before & After',     setup:'Record swing at start and end of session.',
             rules:'Children implement one correction after the first recording. Record again. Compare frames.',
             constraint:'Peer review: partner identifies the change that was made — did it happen?' },
      wu2: { q:'What was the biggest surprise when you saw your swing on video?', success:'Every child identifies one specific, observable difference between feel and reality.' } },

    { n:12, title:'Impact Position',    focus:'Lag, shaft lean, and wrist angles at impact',
      wu:  { name:'Impact Freeze',      desc:'Children freeze their swing at impact — hold the position for 10 seconds. Coach checks: hands ahead of ball? Shaft leaning forward? Weight on lead side? Belt buckle facing target?' },
      sk:  { name:'Lag Drill',           drill:'Practice maintaining lag (wrist angle) as long as possible into the downswing. "Fire" the club head through impact, not before. Use a towel under the lead arm for connection feedback.',
             constraint:'"Intentionally hold the angle as late as possible, then release explosively — feel the difference in club head speed."',
             note:'Lag is not a position — it is a sequence. You cannot force lag; you can only learn to release later.' },
      gm:  { name:'Impact Quality Game', setup:'Impact tape on club face, hitting targets.',
             rules:'5 shots. Study impact tape after each: centre face = 3 pts, off-centre but on face = 1 pt, miss = 0.',
             constraint:'Level up: aim for the low-centre of the face (optimal for irons) specifically.' },
      wu2: { q:'What is shaft lean at impact and why does it matter?', success:'Children explain: shaft lean = hands ahead of ball = compression = distance and trajectory control.' } },

    { n:13, title:'Wedge Gapping',      focus:'Testing and recording carry distances for all wedges',
      wu:  { name:'Gap Analysis',        desc:'"If your pitching wedge carries 100 yards and your gap wedge carries 85 yards — what distance has no coverage?" Discuss: the yardage gap is a scoring opportunity or liability.' },
      sk:  { name:'Distance Testing',    drill:'Hit 10 shots each with pitching wedge, gap wedge, sand wedge, and lob wedge (if applicable). Record average carry distance for each. Build personal "wedge map."',
             constraint:'"Eliminate your ego — hit each wedge at 80% swing, not maximum. Record your consistent carry, not your best."',
             note:'A wedge map built on 80% swings is reliable under pressure. A map built on maximum effort is not.' },
      gm:  { name:'Gap Coverage',        setup:'Targets at every 5-yard interval from 40-100 yards.',
             rules:'Children try to cover every 5-yard slot using their wedges. Identify uncovered distances.',
             constraint:'If a gap exists: can a partial swing with the longer wedge fill it? Practice half and three-quarter swings.' },
      wu2: { q:'What is the distance gap between your pitching wedge and your next wedge?', success:'Every child can state their wedge carry distances to within 5 yards.' } },

    { n:14, title:'Putting Mechanics',  focus:'Stroke arc, face at impact, and putter path',
      wu:  { name:'Arc or Straight?',   desc:'"Should a putting stroke follow a straight path or a slight arc?" Reveal: slight arc (matching the body\'s rotation). Demonstrate both — what does the ball do differently?' },
      sk:  { name:'Stroke Analysis',     drill:'Use an alignment mirror or putting arc tool. Check: (1) face angle at impact (dominant factor), (2) path (slight arc matching stance). Tempo: consistent back and through.',
             constraint:'"3 consecutive gates from 8 ft — face must be square at impact. Use the mirror to self-check."',
             note:'Face angle at impact accounts for 85% of initial ball direction. Path affects curve. Face is the priority.' },
      gm:  { name:'Face Control Game',  setup:'Gate drill at 6, 8, 10, 12, 14 ft.',
             rules:'Must make 3 consecutive clean gates before advancing. Track personal best distance.',
             constraint:'Level up: add a random-distance caller — partner calls distance after backswing.' },
      wu2: { q:'What percentage of the initial ball direction comes from face angle vs path?', success:'Children recall the 85% face / 15% path split and explain why face is the priority.' } },

    { n:15, title:'Green Speed Adaptation', focus:'Adjusting putting stroke for fast and slow surfaces',
      wu:  { name:'Speed Audit',         desc:'Children putt 3 balls from 20 ft on a practice green. Then on a different surface. Ask: "How did you adjust?" Were the adjustments instinctive or deliberate?' },
      sk:  { name:'Speed Calibration',   drill:'Fast green: shorter backswing, same tempo, firmer hands through. Slow green: longer backswing, same tempo, no deceleration. Test on two different speed surfaces.',
             constraint:'"From 15 ft: hit 5 putts on fast surface, 5 on slow. Change only swing length — not tempo."',
             note:'Tempo should never change. Only swing length changes for speed adaptation. Changing tempo destroys timing.' },
      gm:  { name:'Surface Challenge',  setup:'Practise on at least two surfaces of different speeds.',
             rules:'5 lag putts from 25 ft on each surface. Score: lag zone (3-ft circle) = 3 pts, within 6 ft = 1 pt.',
             constraint:'Level up: switch surfaces every other putt — rapid adaptation.' },
      wu2: { q:'If you arrive at a tournament and the greens are significantly faster than your home course, what do you adjust?', success:'Children articulate shorter backswing, same tempo, firm through — never faster tempo.' } },

    { n:16, title:'Driving Consistency', focus:'Fairway finding strategy vs maximum distance',
      wu:  { name:'Risk vs Distance',   desc:'"Driver off every tee vs 3-wood on tight holes — which do you think produces a lower score over 18 holes?" Present stats: most amateurs score better with more conservative tee shots.' },
      sk:  { name:'Accuracy First',      drill:'5 drives aiming for maximum distance. Record fairways hit. 5 drives at 80% swing speed, same target. Compare: fairways hit AND distance loss.',
             constraint:'"How many yards did you lose by swinging at 80%? Is that a fair trade for the accuracy gained?"',
             note:'"The driver is a scoring weapon only when it finds the fairway. In the rough, it becomes a scoring liability."' },
      gm:  { name:'Fairway Challenge',  setup:'Narrow corridor 20 yards wide, 150+ yards out.',
             rules:'Round 1: swing for maximum distance. Round 2: fairway-finding priority. Compare: accuracy rate AND scoring potential from each landing zone.',
             constraint:'Define your personal tee-shot decision framework: "I use driver when... I use 3-wood when..."' },
      wu2: { q:'What is your personal rule for choosing between driver and 3-wood off the tee?', success:'Every child articulates a consistent, personal decision framework for tee shots.' } },

    { n:17, title:'Approach Shot Planning', focus:'Pin position, quadrant targeting, and safe-miss zones',
      wu:  { name:'Quadrant Map',        desc:'"Divide a green into 4 quadrants (front-left, front-right, back-left, back-right). Given a pin in the back-left — which quadrant has the most margin for error?" Discuss.' },
      sk:  { name:'Safe Miss Drill',     drill:'3 approach shot scenarios with hazards: (1) pin tight to bunker on right — aim centre-green. (2) pin behind water — aim to back of green. (3) pin front, slope behind — aim pin-high for centre fall.',
             constraint:'"What is the worst possible miss for this pin position?" Name it before every shot.',
             note:'"Tour pros don\'t aim at pins — they aim at the quadrant that gives the safest miss distance."' },
      gm:  { name:'Quadrant Game',       setup:'Flag positions change each round (front, back, left, right).',
             rules:'Before each shot: state target quadrant, not pin. Score on landing in correct quadrant.',
             constraint:'Level up: no practice swing — make the decision and commit in 20 seconds.' },
      wu2: { q:'The pin is tucked right with a bunker. Where should you aim?', success:'Children identify: centre-green or left side — giving the largest margin for error.' } },

    { n:18, title:'Sand Play Mastery',  focus:'Distance control in bunkers — long and short',
      wu:  { name:'Distance Bunker Test', desc:'Children hit 3 greenside bunker shots and 3 fairway bunker shots without coaching. Observe: does their technique change appropriately between distances?' },
      sk:  { name:'Distance Variables', drill:'Greenside distance control: more sand behind ball = shorter shot, less sand = longer shot. Swing speed also affects distance. Test 3 sand entry points for 3 different distances.',
             constraint:'"From the same address: control distance by sand entry point only — same swing, same face, different entry."',
             note:'Introducing sand entry as a distance variable is an advanced concept. Only appropriate for 10+ who have mastered the basic splash.' },
      gm:  { name:'Bunker Circuit',     setup:'Greenside bunker with 5 targets at 5, 10, 15, 20, 25 ft. Fairway bunker at 40 yards.',
             rules:'Hit to each target in sequence. Score: within 3 ft = 3 pts, within 6 ft = 1 pt.',
             constraint:'Level up: coach calls the target after player is settled in the address position.' },
      wu2: { q:'How do you control distance on a greenside bunker shot without changing swing speed?', success:'Children articulate varying sand entry point as the primary distance variable.' } },

    { n:19, title:'Difficult Lies',     focus:'All unusual and uneven lie conditions in one session',
      wu:  { name:'Lie Hunt',            desc:'Children find the worst lie they can on the course. Group evaluates each lie: what technique adjustment does this require? What is the best realistic outcome?' },
      sk:  { name:'Lie Library',         drill:'Station 1: bare lie (no grass). Station 2: divot. Station 3: plugged in sand. Station 4: steeply downhill. Station 5: sidehill below feet. One specific adjustment required for each.',
             constraint:'"At each station: name the adjustment before setting up. No practice swings from the lie — make the setup correct from the start."',
             note:'Experienced players read lies automatically. 10+ students should begin building that library of adjustments.' },
      gm:  { name:'Lie Circuit',         setup:'5 stations in sequence.',
             rules:'One shot per station. Score: gets in play = 1 pt, reaches target area = 2 pts, pin high = 3 pts.',
             constraint:'Level up: coach creates two simultaneous lie challenges — compound difficulty.' },
      wu2: { q:'From a bare lie (no grass), what changes in your setup vs a normal fairway shot?', success:'Children articulate: ball back slightly, more shaft lean, steeper angle, no pick-up through impact.' } },

    { n:20, title:'Q2 Technical Assessment', focus:'Video, stats, and benchmark comparison to Q1',
      wu:  { name:'Q1 vs Q2 Compare',   desc:'Coach reads out Q1 benchmark scores. Children estimate their improvement before testing. Discuss: which areas likely improved most? Which might have stayed similar?' },
      sk:  { name:'Assessment Day',      drill:'(1) Video swing review — 3 checkpoint evaluation. (2) 10 wedge shots — proximity to 75-yard flag. (3) 5 drives — fairway hit rate. (4) Approach accuracy — 5 shots to simulated green.',
             constraint:'Record all results. Compare to Q1 baseline — calculate improvement in percentage terms.',
             note:'"Measurement creates accountability. The numbers don\'t lie — but they also don\'t define you."' },
      gm:  { name:'Q2 Championship',    setup:'9-hole round.',
             rules:'Full stroke play, stats tracking (fairways, GIR, putts). Compare stats to Q1 round.',
             constraint:'Coach provides one written technical observation per child in their passport.' },
      wu2: { q:'Where did your numbers improve most between Q1 and Q2?', success:'Every child receives Q2 technical assessment with specific video-referenced observations.' } },

    // ── Q3: Mental & Competitive ───────────────────────────────────────────
    { n:21, title:'Zone Management',    focus:'Identifying and recreating peak performance state',
      wu:  { name:'Zone Memory',         desc:'"Think of a time in sport (any sport) when everything clicked — you felt effortless, accurate, and confident. What did that feel like?" Share in pairs.' },
      sk:  { name:'Zone Triggers',       drill:'Each child identifies: (1) physical cues that signal they are in the zone (breathing, muscle tension, vision). (2) what they were thinking (or not thinking). (3) what preceded it (warm-up, attitude, mindset).',
             constraint:'"Design a 3-step pre-shot ritual that recreates your zone conditions."',
             note:'The zone is not random — it has a recipe. Self-knowledge allows you to create the conditions for it.' },
      gm:  { name:'Zone Round',          setup:'6 holes.',
             rules:'Play with deliberate focus on zone-entering behaviours: breathing, slow walking, quiet internal dialogue.',
             constraint:'After each hole: rate your "zone level" 1-10. Coach observes and tracks from outside.' },
      wu2: { q:'What is the one thing you can do immediately before a shot to increase your chance of being in the zone?', success:'Every child identifies a specific, personal zone-entry trigger.' } },

    { n:22, title:'Visualization',      focus:'Full shot visualization sequence before execution',
      wu:  { name:'Viz Demo',            desc:'Coach stands behind a shot and narrates a visualization: "I can see the ball starting slightly left, curving right, landing on the front of the green, rolling to 10 feet past the flag." Then executes the shot.' },
      sk:  { name:'Viz Sequence',        drill:'5-step visualization before every shot: (1) see the ball at the target. (2) trace the flight path backwards to impact. (3) see the impact moment. (4) feel the swing that produces it. (5) go.',
             constraint:'"Your visualization must be clear enough that you could describe it to someone in 10 words or less."',
             note:'"The brain cannot distinguish between a vivid imagination and reality. The more real your visualization, the more it prepares the motor system."' },
      gm:  { name:'Viz Round',           setup:'9 holes.',
             rules:'Mandatory visualization before every shot. Partner confirms: "Did you visualize?" before each swing.',
             constraint:'Debrief after round: did visualization improve or interfere? What type of visualization worked best (visual, feeling, or both)?' },
      wu2: { q:'Describe in 10 words the visualization you used on your best shot today.', success:'Every child has developed a personal visualization protocol they can execute under pressure.' } },

    { n:23, title:'Pressure Ladder',    focus:'Progressive pressure — building performance under stress',
      wu:  { name:'Baseline Putt',       desc:'Each child putts 10 balls from 6 ft privately. Record success rate. This is the baseline.' },
      sk:  { name:'Ladder Protocol',     drill:'Level 1: putt alone (baseline). Level 2: partner watching. Level 3: coach watching. Level 4: group watching. Level 5: consequences (missed putt = 10 press-ups). Compare success rates across levels.',
             constraint:'"Which level affected you most? Why? What changed in your body and your thinking?"',
             note:'"Pressure reveals character — not to judge it, but to know it. You cannot prepare for what you don\'t know."' },
      gm:  { name:'Pressure Scramble',  setup:'Last-hole scramble with accumulated pressure stakes.',
             rules:'Pairs compete. Both players\' putts count. The putt that clinches or loses the match must be taken last.',
             constraint:'Debrief: describe your physical state on the final putt. What did you do to manage it?' },
      wu2: { q:'What physical change did you notice at the highest pressure level?', success:'Every child identifies a specific physiological pressure response and names one coping strategy.' } },

    { n:24, title:'Breathing & Focus',  focus:'Box breathing and pre-shot mental trigger sequence',
      wu:  { name:'Breathing Demo',      desc:'Coach leads box breathing: inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 3 times. Ask: "How do you feel different after that vs before?"' },
      sk:  { name:'Mental Trigger',      drill:'Design a 3-part mental trigger sequence: (1) one breath (box). (2) focus word or phrase (e.g., "smooth," "trust it"). (3) visual target lock.',
             constraint:'"Use this trigger on every shot for the next 6 holes — no exceptions."',
             note:'"The trigger is not superstition — it is a physiological reset. The breath activates the parasympathetic nervous system, reducing anxiety response."' },
      gm:  { name:'Trigger Evaluation', setup:'6-hole round.',
             rules:'Use mental trigger before every shot. After each hole: rate focus quality 1-5. Identify the shot you felt most focused on.',
             constraint:'Partner observes and records: how consistently was the trigger used? Did it appear in rhythm or as an afterthought?' },
      wu2: { q:'What are the 3 parts of your personal mental trigger sequence?', success:'Every child has a defined, practised trigger they can describe and execute without prompting.' } },

    { n:25, title:'Match Play Psychology', focus:'Managing leads, deficits, and key hole situations',
      wu:  { name:'Scenario Debate',     desc:'"You are 3 up with 3 to play (dormie). Do you attack or defend?" Discuss: tour players opinions are divided. What does the data say? (Answer: play your normal game — don\'t change strategy.)' },
      sk:  { name:'Situation Training',  drill:'Simulate 4 match play situations: (1) 1 down, last hole — must make birdie. (2) 1 up, last hole — need bogey to win. (3) 3 down, 5 to play. (4) 3 up, 3 to play.',
             constraint:'"In each situation: state your strategy before playing. Does your strategy change your club selection?"',
             note:'"The worst match play error is changing your game under pressure. Your best golf is your best chance."' },
      gm:  { name:'Match Play Championship', setup:'9-hole knockout bracket.',
             rules:'Full match play rules. All results recorded. Third-place match for losers.',
             constraint:'Post-match: did you change your game under pressure? Did it help or hurt?' },
      wu2: { q:'What does "dormie" mean and what is the correct strategy when you are dormie?', success:'Children explain dormie (cannot lose) and articulate: play your normal game, do not change strategy.' } },

    { n:26, title:'Stroke Play Strategy', focus:'18-hole risk management — when to attack, when to lay up',
      wu:  { name:'Risk Audit',           desc:'"On a par 5 with water guarding the green — when do you go for the green in 2, and when do you lay up?" Discuss specific thresholds: carry distance required, current score, wind, lie.' },
      sk:  { name:'Decision Framework', drill:'5 scenarios with risk/reward decisions. For each: calculate the expected score from aggressive vs conservative play. Which has the lower expected score over many attempts?',
             constraint:'"On the par 5: if you carry the water 50% of the time — is it worth going for it?" (Hint: 50% means you\'re in the water every other attempt.)',
             note:'Introduce expected value: the statistically correct play is not always the exciting play, but it produces lower scores over time.' },
      gm:  { name:'Strategy 9',           setup:'9-hole round with pre-committed strategy per hole.',
             rules:'Before the round: for each hole, commit to aggressive, conservative, or neutral. Play accordingly. Post-round: evaluate each decision.',
             constraint:'Debrief: which decision produced the biggest gap between expected and actual result?' },
      wu2: { q:'On a 40% success rate shot at the green — what is the statistically correct play?', success:'Children identify: lay up — 40% success means 60% failure, which almost always produces a higher score.' } },

    { n:27, title:'Recovery Mindset',   focus:'Response protocol after bogeys and doubles',
      wu:  { name:'Hole 1 Disaster',    desc:'"You make a triple bogey on hole 1. Describe exactly what happens in your head on the walk to hole 2." Honest sharing. Discuss: is that response helpful? What would a tour professional do?' },
      sk:  { name:'Reset Protocol',      drill:'Design a personal reset protocol for a bad hole: (1) accept the result (say it out loud: "that\'s done"). (2) physical reset (deep breath, change pace). (3) refocus on next shot only — not the round score.',
             constraint:'"On the walk to the next tee: you are allowed to think about the last hole for exactly 30 seconds. Then it\'s done."',
             note:'"You cannot change the last shot. You can only play the next one." The best players have the shortest memory for bad shots.' },
      gm:  { name:'Comeback Round',     setup:'Coach secretly adds 2 shots to each child\'s score on holes 1 and 2.',
             rules:'Children know they start 4 over. Play 7 more holes trying to recover. Track: how many respond vs spiral?',
             constraint:'Debrief: who recovered successfully? What was different about their approach?' },
      wu2: { q:'What is your personal reset protocol after a bad hole?', success:'Every child has a defined, practised 3-step reset protocol they can execute immediately.' } },

    { n:28, title:'Caddie Communication', focus:'Yardage, wind, line calls, and club selection dialogue',
      wu:  { name:'Caddie Job',          desc:'Ask: "What does a tour caddie actually do?" Brainstorm. Reveal: yardages, club selection, green reading, wind calls, mental support, rules advice, pace management.' },
      sk:  { name:'Caddie Practice',     drill:'Pairs: one player, one caddie per hole. Caddie provides: (1) exact yardage (paced or estimated). (2) wind direction and strength. (3) pin sheet reading. (4) recommended club with rationale. (5) one piece of mental support.',
             constraint:'"The player must accept the caddie\'s club recommendation — even if they disagree — for this exercise."',
             note:'"A great caddie gives the player the best decision, then lets them execute it without interference."' },
      gm:  { name:'Caddie Round',        setup:'9 holes with alternating caddie/player roles per hole.',
             rules:'Caddie must provide all 5 elements before each shot. Player rates caddie performance after each hole (1-5).',
             constraint:'Post-round: who was the most helpful caddie and why? What made their information useful?' },
      wu2: { q:'What is the most important piece of information a caddie provides before a shot?', success:'Children identify yardage and wind as foundational; pin position and club recommendation as derived from those.' } },

    { n:29, title:'Official Competition', focus:'9+ holes — full rules, marked card, real conditions',
      wu:  { name:'Competition Mindset', desc:'Pre-round: "How do you feel right now?" Identify nervous, excited, or flat. Ask: which is most useful? Nervous and excited are the same physiological state — your label changes the outcome.' },
      sk:  { name:'Competition Prep',    drill:'Full tournament preparation: warm-up, rules knowledge, scorecard, pairing. Treat this exactly as a real event. No shortcuts.',
             constraint:'"Your only job right now is to play the next shot as well as possible. Nothing else matters."',
             note:'"Competition is not about the result — it is about the process. Execute your process on every shot."' },
      gm:  { name:'Official Round',      setup:'9+ holes, full rules, signed cards.',
             rules:'Full stroke play with all rules applied. Cards signed and submitted. Results posted.',
             constraint:'Post-round debrief: best decision, hardest moment, one shot to play differently.' },
      wu2: { q:'What does it mean to "relabel" nerves as excitement — and why does it help performance?', success:'Children explain the identical physiological response and the power of interpretation in changing performance.' } },

    { n:30, title:'Mental Self-Assessment', focus:'Identifying mental strengths and development areas',
      wu:  { name:'Mental Audit',        desc:'Self-rate 1-5 on 8 mental skills: focus, routine consistency, recovery from bad shots, pressure performance, visualization, pre-shot routine, confidence, and patience.' },
      sk:  { name:'Gap Analysis',        drill:'Compare self-rating to coach rating on the same 8 skills. Identify 2 strengths (above 3.5) and 2 development areas (below 3). Discuss: how does each affect your score?',
             constraint:'"Connect each mental skill to a specific stroke: \'When I lose focus, I tend to...\'"',
             note:'"Physical skills have a ceiling defined by genetics and time. Mental skills have almost no ceiling — they respond directly to training."' },
      gm:  { name:'Targeted Mental Round', setup:'6 holes.',
             rules:'Each child plays with ONE mental skill as their focus. Rate the skill after each hole. Coach observes and confirms.',
             constraint:'Post-round: did focusing on one mental skill affect your technical game? How?' },
      wu2: { q:'Which of your 8 mental skills, if improved by 20%, would most impact your scoring?', success:'Every child identifies a specific mental skill and connects it to a measurable scoring impact.' } },

    // ── Q4: Tournament Ready ───────────────────────────────────────────────
    { n:31, title:'World Handicap System', focus:'How index is calculated and how to use it effectively',
      wu:  { name:'Handicap Quiz',       desc:'"True or false: (1) A lower handicap is better. (2) Your handicap is your average score. (3) You can use your handicap in any format." Discuss all three.' },
      sk:  { name:'WHS Explained',       drill:'Walk through: Adjusted Gross Score → Score Differential → Best 8 of last 20 → Handicap Index → Course Handicap. Use a real example with the group\'s scores.',
             constraint:'"If your Handicap Index is 12 and the Course Rating is 68 / Slope is 113 — what is your Course Handicap?" (Answer: 12 × 113/113 = 12).',
             note:'"Your handicap is portable — it works at any course in the world. That is the power of the WHS."' },
      gm:  { name:'Handicap Match',      setup:'9-hole stroke play with handicaps applied.',
             rules:'Apply full WHS course handicaps. Play from appropriate tees. Compare: did the handicap produce a fair result?',
             constraint:'Post-round: calculate each player\'s score differential — would this round help or hurt their index?' },
      wu2: { q:'What is the difference between a Handicap Index and a Course Handicap?', success:'Children explain: Index = portable measure, Course Handicap = shots received on a specific course on a specific day.' } },

    { n:32, title:'Strokeplay Tournament', focus:'18-hole or equivalent — full rules, official card',
      wu:  { name:'Tournament Morning', desc:'Simulate tournament morning: arrive, sign in, warm up to schedule, attend rules meeting, arrive on tee with 5 minutes to spare. Coach times and evaluates the process.' },
      sk:  { name:'Full Warm-Up',        drill:'Personal warm-up routine — children lead entirely. 12 minutes maximum. Short putts → lag putts → chipping → pitching → irons → driver → one specific focus shot.',
             constraint:'"End your warm-up with a shot you feel completely confident about — enter the round with momentum."',
             note:'The final warm-up shot should always be a success. If you miss it, hit another. Never walk to the first tee on a failure.' },
      gm:  { name:'18-Hole Tournament', setup:'18 holes (or equivalent — 2 rounds of 9).',
             rules:'Full stroke play, WHS score differential calculated. Cards signed and submitted. Results posted and celebrated.',
             constraint:'Post-round: stat review — fairways, GIR, putts. Where did the round go well? Where were the shots lost?' },
      wu2: { q:'What does signing an incorrect scorecard result in under official rules?', success:'Children state disqualification — and understand why integrity is non-negotiable in golf.' } },

    { n:33, title:'Match Play Final',   focus:'Knockout bracket — pressure in key situations',
      wu:  { name:'Final Prep',          desc:'"You are about to play the match play final. What is your preparation?" Discuss: some players try harder in finals, some freeze. What is your pattern?' },
      sk:  { name:'Key Situation Drill', drill:'Simulate: (1) first tee nerves — tight drive needed. (2) 1 down on 17. (3) 1 up on 18 — par wins the match. (4) halved on 18 — sudden death.',
             constraint:'"On sudden death: what changes about your strategy vs a normal hole?" (Answer: almost nothing — play your game).',
             note:'"The players who win finals are the ones who treat it most like a regular round."' },
      gm:  { name:'Match Play Final',   setup:'Full 9-hole or 18-hole knockout final.',
             rules:'Full match play rules. Coach available for rules questions only. Sportsmanship observed.',
             constraint:'Post-match handshakes and recognition of both finalists — plus a comment from each about what they learned from the match.' },
      wu2: { q:'What is the best mindset to have going into a match play final?', success:'Children articulate: play your game, trust your process, treat it like any other match.' } },

    { n:34, title:'Golf Fitness',       focus:'Mobility, golf-specific strength, and injury prevention',
      wu:  { name:'Mobility Screening', desc:'5 tests: (1) hip rotation (seated, 90° each direction). (2) thoracic rotation (arms crossed, rotate). (3) hip hinge (deadlift pattern). (4) shoulder mobility (reach behind back). (5) single-leg balance (10 seconds each side).' },
      sk:  { name:'Golf Fitness Intro', drill:'4 golf-specific exercises: (1) cable rotation or band rotation (power transfer). (2) Romanian deadlift (hip hinge/glute strength). (3) single-leg balance with club swing (stability). (4) thoracic rotation stretch (T-spine mobility).',
             constraint:'"Research shows: every 1 mph of club head speed = ~2.5 yards of distance. Fitness is a performance tool."',
             note:'Introduce: injury prevention > performance enhancement. Priority: protect the lower back, hips, and trail elbow.' },
      gm:  { name:'Fitness Impact Test', setup:'Hit 5 drives before fitness circuit. Complete circuit. Hit 5 drives after.',
             rules:'Compare before/after: club head speed (estimated) and contact quality.',
             constraint:'Design a 10-minute home fitness routine using 3 of the exercises from today.' },
      wu2: { q:'What two physical qualities most directly affect club head speed?', success:'Children identify rotational power (core strength) and hip mobility as primary drivers.' } },

    { n:35, title:'Home Practice Design', focus:'Structuring an effective weekly practice plan',
      wu:  { name:'Practice Audit',     desc:'"How many hours per week do you currently practice? What do you work on?" Honest sharing. Discuss: is the time spent on the areas that most affect your score?' },
      sk:  { name:'Practice Pyramid',   drill:'Priority pyramid: base = putting and short game (40% of shots). Middle = approach play (30%). Top = driver (10%). Design: for 5 hours per week, how much time to each area?',
             constraint:'"Every session: start with putting (calibrate feel). End with your weakest area. Middle is your choice."',
             note:'"The range is for developing skills. The course is for testing them. Most players do both on the range — that\'s inefficient."' },
      gm:  { name:'Practice Plan Creation', setup:'Partner review.',
             rules:'Each child writes a weekly practice plan (7 sessions, 30 min each). Partner reviews for balance and specificity.',
             constraint:'Plans must include: specific skill focus, drill or method, success measure, and time allocation.' },
      wu2: { q:'What percentage of your practice time should be devoted to putting and short game?', success:'Children recall the 40% figure and can justify it using the shot distribution on a typical round.' } },

    { n:36, title:'Advanced Statistics', focus:'Strokes gained concept and identifying improvement priorities',
      wu:  { name:'Strokes Gained Intro', desc:'"Strokes gained measures your performance vs the average golfer at your level, not par. Why is this more useful than just counting strokes?" Discuss.' },
      sk:  { name:'Personal Stats',      drill:'Using 2 recent rounds of stats: calculate (1) strokes gained putting. (2) strokes gained approach. (3) strokes gained tee-to-green. Identify: where are most shots gained or lost vs benchmark?',
             constraint:'"If you gained 1 stroke per round in your weakest category, how many shots would that save over a season?"',
             note:'Strokes gained is the most powerful player development tool available. It eliminates the bias of "having a good putting day."' },
      gm:  { name:'Priority Round',      setup:'9 holes with full stat tracking.',
             rules:'Track all strokes gained categories. Post-round: calculate SG for each. Identify biggest opportunity.',
             constraint:'Set a specific, measurable SG target for next term: "I will improve SG Putting from -0.5 to 0.0."' },
      wu2: { q:'Why is "strokes gained" a better measure of putting performance than "putts per round"?', success:'Children explain: putts per round is affected by proximity to hole (which depends on approach quality), making it an inaccurate putting measure.' } },

    { n:37, title:'Next Steps in Golf',  focus:'Pathways for junior development — clubs, academies, squads',
      wu:  { name:'Pathway Map',         desc:'Draw a pathway map: local programme → club member → provincial/state squad → national junior → college golf → professional. Discuss: which level is realistic? Which is a goal? Which is a dream?' },
      sk:  { name:'Pathway Information', drill:'Discuss the 4 key decisions: (1) join a golf club (access to handicap, competitive events). (2) enter local junior events. (3) apply for regional development squads. (4) investigate golf scholarships if applicable.',
             constraint:'"What is ONE action you can take this month to move one step along your pathway?"',
             note:'"The pathway is not linear. Some players skip steps. Some return to earlier steps. What matters is consistent engagement with the game."' },
      gm:  { name:'Pathway Planning',   setup:'Individual reflection + group share.',
             rules:'Each child writes: "My realistic goal is X. My dream goal is Y. The next step I will take is Z — by [date]."',
             constraint:'Coach co-signs each pathway commitment card.' },
      wu2: { q:'What is the difference between a realistic goal and a dream goal — and why do you need both?', success:'Children articulate: realistic goals build confidence, dream goals build direction.' } },

    { n:38, title:'Season Debrief',     focus:'Data, highlights, and honest assessment of the year',
      wu:  { name:'Data Walk',           desc:'Coach displays Q1-Q4 stats for the group. Walk through: where did the group improve most? What was unexpected? What did the data confirm you already knew?' },
      sk:  { name:'Individual Review',   drill:'Each child reviews their personal data: handicap trajectory, Skills Passport progression, stat trends. Identify: 3 genuine improvements. 1 area that did not improve as expected. 1 unexpected development.',
             constraint:'"Be honest — including about what did not go well. That\'s where the real learning is."',
             note:'"Honest self-assessment is the rarest and most valuable skill in sport. It requires both the willingness to look and the courage to see."' },
      gm:  { name:'Debrief Round',       setup:'9-hole reflection round — no scorecards.',
             rules:'Play for enjoyment only. After the round: one-word season summary from each player.',
             constraint:'Coach provides a written, personalised season summary for each child in their passport.' },
      wu2: { q:'What was the one moment this year that changed the way you think about golf?', success:'Every child identifies a specific turning point in their development.' } },

    { n:39, title:'Goal Setting Workshop', focus:'1-year and 3-year SMART goals with milestones',
      wu:  { name:'Goal Review',          desc:'Review goals set at the end of Q4 last year (or earlier this year). Which were achieved? Which were not? Why? What did the process teach you about how to set goals?' },
      sk:  { name:'Long-Term Goal Design', drill:'Two goals per child: (1) 1-year goal: specific, measurable, achievable. Milestone every 3 months. (2) 3-year goal: aspirational but realistic. Annual milestone.',
             constraint:'"For each goal: what is the single most important practice habit that will determine whether you achieve it?"',
             note:'"Goals are only as powerful as the daily habits they generate. A goal without a habit is decoration."' },
      gm:  { name:'Goal Accountability System', setup:'Partner pairing for the year ahead.',
             rules:'Pairs exchange goal cards. Agree to check in quarterly. Each writes a message of support to their partner\'s future self.',
             constraint:'Goals signed by child, coach, and accountability partner.' },
      wu2: { q:'What is the difference between a goal and a habit — and which is more important for long-term improvement?', success:'Children articulate: goals set direction, habits determine outcomes — habits are more important.' } },

    { n:40, title:'Showcase & Ceremony',  focus:'Parents, certificates, guest professional, celebration',
      wu:  { name:'Welcome',              desc:'Children introduce the programme to parents: "This is what we worked on. This is what we learned. This is who we became as golfers and as people."' },
      sk:  { name:'Skills Showcase',      drill:'Each child demonstrates 2 skills: one technical, one mental. For the mental skill: narrate a strategic decision out loud — not just a shot.',
             constraint:'"Explain the skill to the audience — not just perform it."',
             note:'Articulating understanding is the highest demonstration of mastery.' },
      gm:  { name:'Showcase Round',       setup:'Scramble format with parents and guest professional.',
             rules:'Guest professional plays with each group for 1-2 holes. Children are the strategic advisors. Guest provides one personalised piece of advice per child.',
             constraint:'Each child receives a signed certificate with one specific, personal achievement recorded by the coach.' },
      wu2: { q:'Looking back at Lesson 1 — who are you as a golfer now that you were not then?', success:'Every child articulates genuine growth — technical, mental, and personal — with specific examples.' } },
  ],
},
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

{q:'Which statement BEST describes the modern EduGolfKids coach role according to 21st Century Learning principles?',o:['Authority figure who gives instructions, controls session flow, and corrects performance','Learning facilitator, environment designer, question asker, and confidence builder — the coach asks more questions than they give commands','Junior golf professional who simplifies adult technique for young learners','Activity supervisor who keeps children safe and engaged during structured drills'],c:1,e:'The 21st Century EduGolfKids coach role is a learning facilitator, not an authority figure. The goal is to engineer learning environments that produce autonomy, critical thinking, and self-correction — not coach-dependency.'},
{q:'A 9-year-old finishes a distance challenge and says nothing about what they noticed. The BEST wrap-up prompt is:',o:['"Great session — you all worked hard today"','"What did you change between your first attempt and your best one today?"','"Remember to keep your eye on the ball next session"','"Who improved the most? Give yourselves a hand"'],c:1,e:'Metacognitive wrap-up prompts ask children to reflect on what changed — not what happened. "What did you change?" activates self-awareness and consolidates learning beyond the session.'}
],
L1_M6:[
{q:'A coach says to a 7-year-old in front of the group: "You always rush — you never take your time." Under the EduGolfKids Language Code, this statement:',o:['Is acceptable because it is factually accurate','Violates the Language Code — it uses identity-based criticism ("always," "never") that creates shame and triggers anxiety','Is acceptable if said in a gentle tone','Is acceptable in the 6–9 age group who can handle more direct feedback'],c:1,e:'"You always..." and "you never..." are prohibited language patterns — they attack identity rather than describe behavior. The Language Code requires neutral outcome description and effort-based guidance.'},
{q:'A 9-year-old misses five consecutive putts and says "I\'m terrible at this." The correct coaching response is:',o:['"You\'re not terrible — you just need more practice."','"You\'re learning this — that\'s different from being bad at it. Let\'s adjust and try again."','"You\'ve been really good in previous sessions — I\'m sure you\'ll get it."','"Let\'s see if the next one goes in — just focus."'],c:1,e:'"You\'re learning this — that\'s different from being bad at it" distinguishes learning from identity labeling. This is the growth mindset response that normalizes struggle without dismissing the child\'s feeling or attaching outcome to identity.'},
{q:'A coach accidentally says "No, not like that" to a child. According to the 3-Step Language Reset Rule, the coach should:',o:['Continue the session and address the language at the end','Immediately rephrase: "Let me try that again — that one went left. Let\'s adjust together."','Privately apologize to the child after the session','Make no acknowledgment — drawing attention to the error compounds the issue'],c:1,e:'The 3-Step Language Reset requires immediate rephrasing, modeling the growth correction, and reinforcing confidence. Accountability protects culture.'},
],
L1_M7:[
{q:'A coach delivers an excellent and safe Skill Block but uses multiple prohibited phrases including "No, not like that" during the session. How should this session be evaluated?',o:['As a pass — the technical and safety execution was correct','As a fail — integration is mandatory, and Language Code violation is a failure criterion regardless of technical correctness','As requiring a partial reassessment on language only','As a conditional pass pending a follow-up observation'],c:1,e:'Module 7 states: "If a coach delivers a technically correct drill but violates language code → failure." Integration is mandatory — all modules must be applied simultaneously.'},
{q:'According to the Full Integration Map, which session segment applies the MOST motor learning principles (M3)?',o:['Warm-Up','Skill Block','Game Reinforcement','Wrap-Up'],c:1,e:'The Full Integration Map shows the Skill Block as the highest concentration of motor learning application — multiple constraint challenges, external focus cues, variable practice, and guided discovery are primarily deployed here.'},

{q:'A coach skips the Wrap-Up segment to allow 10 extra minutes of Game Reinforcement. What is the consequence of this deviation?',o:['Positive — more game time deepens skill transfer and engagement','The Wrap-Up is non-negotiable. Skipping it eliminates the reflection and emotional closure that consolidate learning. Deviations require HQ approval.','Neutral — the Wrap-Up can be absorbed into Game Reinforcement without impact','Negative only for younger groups (4–6) — older children do not require the Wrap-Up'],c:1,e:'The 60-minute structure is non-negotiable. The Wrap-Up provides the reflection, effort-based praise, and emotional closure that consolidate learning from the session. Deviation requires HQ approval.'},
{q:'A coach\'s Skill Block runs 4 x 4-minute constraint challenges and the Game Reinforcement runs 20 minutes of one scoring game. Which integration principle needs attention?',o:['M4 LTAD — the LTAD stage is not referenced in Game Reinforcement','M3 Motor Learning — Game Reinforcement should include variable scoring, decision pressure, and time-based challenges — not one continuous blocked game format','M6 Language Code — insufficient effort-based praise in the game segment','M8 Communication — parent feedback not integrated'],c:1,e:'Game Reinforcement must include variable conditions — different scoring rules, time pressure, decision-making challenges. A single blocked scoring game does not produce the same retention as variable contextual practice.'}
],
L1_M8:[
{q:'A parent messages the coach on their personal Instagram asking for a progress update. The correct response is:',o:['Respond with a brief positive update since the intent is harmless','Do not respond via personal social media — direct the parent to contact through the approved EduGolfKids communication channel','Block the parent to avoid further personal contact','Respond but advise the parent to use official channels in future'],c:1,e:'Coaches must use only approved EduGolfKids communication channels for parent contact. Personal social media connections with parents are explicitly prohibited.'},
{q:'A coach wants to send parents a mid-term progress update about a 7-year-old struggling with distance control in putting. Which message is MOST aligned with EduGolfKids communication standards?',o:['"James is having difficulty reaching target distances in putting and needs significant improvement."','"James is building his distance control in putting — he\'s showing great focus and we\'re working through a great challenge that will accelerate this in the final sessions."','"James is below average compared to his peer group in putting distance."','"James enjoys putting but unfortunately cannot reach the target distances we need him to."'],c:1,e:'Parent communication must use growth language: describe progress positively, reference specific program activity, avoid negative ability assessments, never compare to peers.'},

{q:'A school coordinator contacts the coach directly about a scheduling change. The correct response is:',o:['Address the issue immediately and confirm the change with the coordinator','Listen respectfully, acknowledge the concern, and escalate to the licensee — all schedule changes must be confirmed in writing by the licensee','Agree to the change verbally to maintain the school relationship','Refer the coordinator to contact EduGolfKids HQ directly'],c:1,e:'School communication protocol: coaches respond respectfully to concerns but escalate scheduling or agreement changes to the licensee. Verbal-only school agreements are not permitted — all changes must be confirmed in writing.'},
{q:'A parent attempts to discuss their child\'s progress with the coach during an active session. The correct response is:',o:['Pause the session briefly to address the parent\'s concern with a quick update','Acknowledge the parent warmly and arrange a brief conversation after the session: "I\'d love to share an update — let\'s connect right after we finish"','Signal to school staff to redirect the parent','Continue coaching and ignore the parent — no communication during sessions is permitted'],c:1,e:'Parent conversations must not interrupt active sessions — child supervision and safety are the priority. Acknowledge warmly and arrange a brief post-session debrief. Never discuss child progress during the session.'}
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
{q:'A 7-year-old consistently scoops the ball (flips wrists at impact) when chipping. The MOST effective constraint response is:',o:['Instruct the child: "Don\'t scoop. Shaft lean. Hands forward at impact."','Raise the landing target (a box or shelf) — aiming upward naturally discourages the scooping instinct without any verbal instruction','Switch to a shorter club which produces a more controlled downward arc','Have the child chip without a ball until the correct motion is established'],c:1,e:'Scooping CLA: raise the target. When the child aims at an elevated target, the body naturally suppresses the scooping instinct to produce a more penetrating trajectory. The constraint creates the correction without technical instruction.'}
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

{q:'A licensee is reviewing candidates. Candidate A is a former PE teacher with no golf background. Candidate B is a scratch golfer with no experience working with children. Who should the licensee prioritize?',o:['Candidate B — golf ability is the primary requirement for a golf coaching role','Candidate A — child-focus, structured environment experience, and coachability outweigh golf ability in the EduGolfKids model','Neither — both need to be eliminated from consideration','Both — golf ability and child-focus are equally weighted criteria'],c:1,e:'EduGolfKids hiring model: child-focus, reliability, energy, and coachability come first. Golf knowledge is the last thing assessed. "A patient former teacher with a 20 handicap outperforms an impatient scratch golfer every time."'},
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

{q:'A licensee operates 4 classes across 2 schools with only 5 children in each class (maximum is 7). What is the monthly revenue impact compared to full capacity?',o:['$0 — revenue expectations are set per school, not per maximum capacity','$640/month in lost revenue (4 classes × 2 missing children × $20 × 4 sessions)','$160/month in lost revenue — the gap is small and acceptable','$320/month in lost revenue across all 4 classes'],c:1,e:'4 classes × 2 missing × $20 × 4 sessions = $640/month in lost revenue. Filling existing classes to 7 before expanding is the highest-leverage revenue action available.'},
{q:'A licensee\'s revenue is $3,000 this month. Coach costs are $1,050 and overhead is $500. What is the net profit margin and does it meet the EduGolfKids benchmark?',o:['48.3% — within the healthy 45–55% benchmark','38.3% — below the benchmark; coach costs must be reduced','65% — above the benchmark; pricing may be set too high','48.3% — below the benchmark; additional school revenue is required'],c:0,e:'Net profit = $3,000 − $1,050 − $500 = $1,450. Margin = $1,450/$3,000 = 48.3%. This falls within the healthy 45–55% benchmark.'},
{q:'What are the three healthy benchmark percentages for a well-run operation?',o:['Coach costs max 20%, overhead max 10%, net profit min 70%','Coach costs max 30–35%, overhead max 15–20%, net profit target 45–55%','Coach costs max 40%, overhead max 25%, net profit target 35%','Coach costs max 50%, overhead max 20%, net profit target 30%'],c:1,e:'Healthy benchmarks: coach costs max 30–35%, overhead max 15–20%, net profit target 45–55%.'}
],
L3_M5:[
{q:'A coach calls in sick 90 minutes before a session at the licensee\'s busiest school (21 enrolled children across 3 classes). What is the licensee\'s immediate priority?',o:['Cancel the session and notify parents as quickly as possible','Contact the cover coach immediately — a cover coach must always be on call. If no cover, the licensee delivers the session personally','Contact the school to inform them of the cancellation and reschedule','Ask another active coach to split the 3 classes between 2 coaches'],c:1,e:'"Never rely on a single point of coach failure at a school. Always have a backup." A cover coach must always be on call. If unavailable, the licensee delivers the session — the school relationship and 4-lessons-per-month revenue protection both depend on it.'},

{q:'What are the 5 elements of the Coach Management Framework?',o:['Recruitment, onboarding, training, assessment, termination','Clear role expectations, session confirmation protocol, post-session logging, quarterly observation, monthly team meeting','Background checks, certification, shadowing, supervision, performance review','School assignment, delivery, parent communication, incident reporting, annual review'],c:1,e:'The 5 elements: (1) Clear Role Expectations, (2) Session Confirmation Protocol, (3) Post-Session Logging, (4) Quarterly Observation, (5) Monthly Team Meeting.'},
{q:'A principal calls the licensee to report that a coach arrived 20 minutes late and children were left waiting. What must the licensee do?',o:['Apologize and remind the coach of the 15-minute arrival requirement at the next team meeting','Contact the coach immediately, address professionally that same day, notify the school within 24 hours with a written action plan, and observe the coach\'s next session','Log the incident and address it at the next monthly team meeting','Terminate the coach immediately — punctuality is non-negotiable'],c:1,e:'Lateness at a school damages the relationship and risks program termination. Address same day, communicate professionally with the principal, provide a written action plan, and increase monitoring.'},
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

{q:'A coach at one of the licensee\'s schools discloses a child\'s special needs diagnosis to other parents during pickup. What must the licensee do?',o:['Monitor the situation — if no complaint is received, no formal action is required','Immediately address the breach: special needs information is absolutely confidential. Inform HQ, conduct a documented coaching session with the coach, implement communication re-training before the coach returns.','Wait for a parent complaint before taking formal action','Issue a verbal warning and remind the coach of confidentiality at the next team meeting'],c:1,e:'Confidentiality of special needs information is an absolute standard. A breach must be treated seriously regardless of whether a complaint arises. HQ notification, documented coaching, and re-training are required before the coach returns to sessions.'},
{q:'What does the quarterly coach observation checklist cover?',o:['Financial performance — class fill rates and invoice compliance','Session architecture compliance, safety and spacing standards, Language Code compliance, engagement management, and Skills Passport tracking','Marketing effectiveness — parent satisfaction and referral rates','Administrative compliance — session logging, incident reporting, and attendance records'],c:1,e:'Quarterly observation: session architecture compliance, safety/spacing standards, Language Code compliance, engagement management (all children active, no long lines), Skills Passport tracking.'},
{q:'What are the 4 steps in the licensee incident management sequence?',o:['Gather information → notify HQ → notify school → notify parents','Coach notifies licensee within 1 hour → licensee notifies HQ within 24 hours → official incident report submitted → follow up with school principal within 24 hours','Notify parents first → notify HQ within 48 hours → submit incident report → debrief coach','Notify school principal first → notify HQ within 24 hours → notify parents → submit incident report'],c:1,e:'Incident management: (1) Coach notifies licensee within 1 hour. (2) Licensee notifies HQ within 24 hours. (3) Official incident report submitted. (4) Follow up with school principal within 24 hours.'}
],
TDP_O:[
{q:'What is the monthly commission a TDP earns per active licensee?',o:['$100','$150','$200','$250'],c:1,e:'TDPs earn $150 per active licensee per month. A licensee is "active" when the agreement is signed, first fee paid, at least one school contract is active, and no suspension holds exist.'},
{q:'A TDP identifies a promising candidate. What must happen before proceeding past the Discovery call?',o:['The TDP may sign the candidate immediately if confident','The candidate must complete the Interest Form and HQ must approve before proceeding','The TDP may provisionally offer a verbal commitment pending paperwork','The TDP may begin the background check independently'],c:1,e:'HQ approval is required at Step 3 of the recruitment funnel before any further steps. TDPs cannot sign or make verbal commitments on behalf of HQ.'},
{q:'At what point in the 90-day onboarding does the TDP attend the licensee\'s first session as an observer?',o:['Week 1 — to establish expectations early','Month 2 — when the first class launches','Month 3 — when the second school is added','End of Day 90 — as part of the onboarding sign-off'],c:1,e:'The TDP attends the licensee\'s first session as an observer in Month 2. This is part of the structured onboarding programme.'},
{q:'TDP commission requires the monthly report to be submitted by:',o:['The last day of the month','The 5th of the following month','The 15th of the following month','Any time before the commission is disputed'],c:1,e:'Commission is paid by the 15th of the following month, but requires the TDP monthly report submitted by the 5th.'},
{q:'A candidate asks the TDP if the $500 license fee can be reduced. The TDP should:',o:['Offer a 50% reduction to secure the candidate','Explain that HQ sets all fees and the TDP has no authority to negotiate discounts','Ask HQ if an exception can be made before responding','Offer informal support instead of a fee discount'],c:1,e:'TDPs cannot negotiate license fee discounts. All fee structures are set by HQ.'},
{q:'Which would immediately disqualify a licensee candidate?',o:['No prior business ownership experience','Startup capital of $3,500','A prior EduGolfKids licensee termination for cause','A network limited to 2 school contacts'],c:2,e:'A prior EduGolfKids licensee termination for cause is an absolute disqualifying factor.'},
],
TDP_L:[
{q:'A licensee misses the session submission deadline for 2 weeks. What must the TDP do?',o:['Green — one missed deadline is acceptable','Amber — conduct a documented support call within 7 days','Red — escalate to HQ within 24 hours','Red — suspend the licensee\'s sessions immediately'],c:1,e:'Missing one compliance standard = Amber. TDP must conduct a documented support call within 7 days covering root cause, action plan, and follow-up date.'},
{q:'A licensee has two coaches with expired M0 certifications AND an overdue HQ invoice. What status applies?',o:['Amber — two issues but no immediate safety risk','Green — minor administrative gaps','Red — two or more standards missed; HQ must be notified within 24 hours','Amber — address each issue over the next 30 days'],c:2,e:'Two or more missed standards = Red. HQ must be notified within 24 hours. A joint HQ-TDP Remediation Call must occur within 5 business days.'},
{q:'A Red-status licensee is issued a Remediation Plan. Their deadline to return to Green is:',o:['14 days','21 days','30 days','60 days'],c:2,e:'Licensees have 30 days under a formal Remediation Plan to return to Green. Failure may result in suspension or termination.'},
{q:'Growth conversations with Green licensees should cover:',o:['Compliance gaps from the previous quarter','Additional school targets, coach development, and referral opportunities','Session pricing strategy and parent satisfaction','HQ branding requirements'],c:1,e:'Growth conversations focus on forward-looking development: additional schools, coach development, referral opportunities.'},
{q:'A background check returns a minor driving offense from 8 years ago. The TDP should:',o:['Immediately disqualify the candidate','Submit to HQ for a determination — it is not the TDP\'s decision','Advise the candidate to disclose it and proceed','Proceed — only child-related offenses are relevant'],c:1,e:'Background check outcomes are reviewed by HQ, not the TDP. Submit findings to HQ and await their determination.'},
{q:'Which is included in the monthly licensee review?',o:['A spot-check by attending a session unannounced','Active school count, coach cert status, invoice record, session submissions, and incident reports','A financial review of the licensee\'s bank statements','A parent satisfaction survey'],c:1,e:'Monthly review covers: active school count/attendance, coach cert status, invoice payment record, session submission record, and incident report record.'},
],
TDP_C:[
{q:'A licensee\'s SAM insurance expires tomorrow. Renewal is in progress. What must the TDP do?',o:['Allow sessions — renewal is in progress','Immediately notify HQ and halt sessions — zero grace period applies','Issue a 7-day extension informally','Allow 48 hours for renewal to process'],c:1,e:'SAM endorsement has zero grace period. Sessions must halt immediately upon expiry.'},
{q:'When a safeguarding breach is identified, the TDP must notify HQ within:',o:['24 hours','2 hours','4 hours','48 hours'],c:1,e:'A safeguarding breach requires TDP notification to HQ within 2 hours — the most urgent escalation timeline.'},
{q:'During an annual audit, a licensee cannot produce 6 weeks of session logs. This is classified as:',o:['Minor gap — set a 14-day correction deadline','Major gap — immediate HQ escalation; sessions may be suspended','Amber — conduct a support call within 7 days','Green with conditions — accept the explanation and document'],c:1,e:'Missing 6 weeks of session logs is a major gap. Immediate HQ escalation is required.'},
{q:'The annual TDP-led audit report must be submitted to HQ within:',o:['7 days','14 days','30 days','By end of the calendar year'],c:1,e:'Annual audit reports must be submitted to HQ within 14 days of the audit.'},
{q:'The TDP\'s commission is held when:',o:['A licensee misses their monthly report','The TDP fails to submit their own report by the 5th','A licensee\'s SAM expires','The TDP has an open Amber licensee with no action plan'],c:1,e:'The TDP\'s commission requires the TDP to submit their own monthly report by the 5th.'},
{q:'Which TDP self-compliance obligation is renewed every 3 years?',o:['TDP_C certification','Monthly report history','Background screening','HQ contract renewal'],c:2,e:'TDP background screening must be renewed every 3 years.'},
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
{q:'A coach wants to teach a 7-year-old putting distance control without any verbal instruction about swing length. The MOST effective constraint is:',o:['Instruct the child: "Smaller swing means the ball goes closer. Bigger swing means farther."','Place a pool noodle behind the child as a backstroke limiter — noodle close = short putt, noodle farther back = longer putt. The child physically discovers the distance relationship.','Have the child practice only from the same 5-foot distance until control is consistent','Switch to a longer putter to generate more distance stability'],c:1},
{q:'A coach is running a session with 4-year-olds and wants to introduce pitching. What is the correct response?',o:['Allow pitching using foam balls only — safety is the primary concern','Pitching is for ages 6–9 only. It requires simultaneous hip rotation, weight transfer, and arm swing that demand FUNdamentals stage neurological readiness. Introduce only putting and chipping at this stage.','Allow a simplified half-swing pitching motion for children who show strong coordination','Allow pitching as long as the backswing does not exceed shoulder height'],c:1},
{q:'Why does EduGolfKids introduce the full swing LAST in the skill progression?',o:['The full swing requires the most space, so schools need additional time to set up the environment','By the time full swing is introduced, children already have pendulum rhythm (putting), downward strike (chipping), and weight transfer with rotation (pitching) — the full swing is an extension of existing skills, not a new one','The full swing is the most technically complex and requires the most warm-up preparation','Full swing clubs are the most expensive so their use is rationed throughout the program'],c:1},
{q:'In Stage 2 of the pitching progression, children must call their target before each attempt. What is the PRIMARY developmental purpose?',o:['To create a consistent scoring system the coach can track across the group','Pre-commitment builds intentional practice — the child must plan before acting, developing focus, self-accountability, and cognitive engagement with the task','To slow down impulsive movement and reduce the physical injury risk during pitching','To help coaches assess whether children understand the distance zone system'],c:1},
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
TDP_O:[
{q:'What is the monthly commission a TDP earns per active licensee?',o:['$100','$150','$200','$500'],c:1},
{q:'Which immediately disqualifies a licensee candidate?',o:['Less than 2 years business experience','Startup capital under $5,000','A prior EduGolfKids licensee termination for cause','No existing school contacts'],c:2},
{q:'A TDP may sign a licensee candidate without HQ approval:',o:['If the TDP has known the candidate for more than 12 months','Never — HQ approval is required before proceeding','If the background check is clear','If the territory has fewer than 3 active licensees'],c:1},
{q:'TDP commission payment requires the TDP report submitted by:',o:['The last day of the previous month','The 5th of the following month','The 15th of the following month','Any time before the quarter closes'],c:1},
{q:'During the 90-day onboarding, when does the TDP attend the licensee\'s first session?',o:['Week 1','Week 4','Month 2','Month 3'],c:2},
{q:'Which is NOT within TDP authority?',o:['Facilitating the licensee\'s first school meeting','Submitting the Interest Form to HQ','Negotiating a license fee discount','Observing the licensee\'s first session'],c:2},
{q:'The minimum Year 1 performance target for a TDP is:',o:['5 active licensees by month 6','3 active licensees by month 6 and 5 by month 12','2 active licensees by month 3 and 4 by month 6','10 active licensees by year end'],c:1},
{q:'TDPs may recruit outside their assigned territory:',o:['At any time if an opportunity exists','Only with HQ written approval','Only if the adjacent territory has fewer than 3 licensees','Never under any circumstances'],c:1},
{q:'The monthly HQ license fee paid by each licensee is:',o:['$150','$350','$500','$750'],c:2},
{q:'What does the TDP submit to HQ at the close of month 3 of onboarding?',o:['The licensee\'s first P&L statement','A 90-day onboarding completion report','The licensee\'s background check results','The school contract for the first school'],c:1},
],
TDP_L:[
{q:'How many missed compliance standards places a licensee in Red status?',o:['One serious breach OR one missed standard repeated in two consecutive months','Two or more standards missed, OR one serious breach','Three or more minor gaps across 90 days','Any missed payment to HQ'],c:1},
{q:'When a licensee is Red, HQ must be notified within:',o:['5 business days','24 hours','48 hours','The next monthly report'],c:1},
{q:'A Remediation Plan gives the licensee how long to return to Green?',o:['14 days','21 days','30 days','60 days'],c:2},
{q:'Which is NOT included in the monthly licensee review?',o:['Active school count','Coach certification status','A review of the licensee\'s bank statements','Invoice payment record'],c:2},
{q:'When should a TDP conduct a quarterly growth conversation?',o:['Only with Amber and Red licensees','Only with Green licensees','With all licensees regardless of status','Only after the licensee\'s first year'],c:1},
{q:'A TDP-led Remediation Call after Red classification must occur within:',o:['24 hours','5 business days','30 days','The next monthly review'],c:1},
{q:'The Amber support call documentation must cover:',o:['The licensee\'s financial outlook and revenue targets','Root cause, agreed action plan with deadlines, and TDP follow-up date','Coaching observations from the previous month','School pipeline and expansion targets'],c:1},
{q:'Which is a valid reason for Amber status?',o:['Student count not growing in 2 months','One compliance standard missed','The licensee\'s top coach left','The licensee missed a TDP development call'],c:1},
{q:'The TDP\'s role during a licensee\'s first school meeting is:',o:['To lead the meeting and introduce the licensee','To facilitate — the licensee should present independently','To observe without speaking','To prepare the presentation but not attend'],c:1},
{q:'Which background check outcome definitively disqualifies a licensee?',o:['A driving offense from 4 years ago','Bankruptcy concluded 2 years ago','A criminal record involving a child','A prior employment dispute'],c:2},
{q:'Monthly review must include which insurance compliance check?',o:['Coach certification records only','General Liability current AND SAM endorsement current','General Liability only','Licensee self-certifies insurance compliance'],c:1},
{q:'A licensee wants to expand to 5 schools. What must they complete first?',o:['Notify HQ via the monthly report','3 compliant schools operating at Green for at least 2 months','Complete L3 Business Operations certification','Obtain the TDP\'s written approval'],c:1},
{q:'When must a TDP escalate a licensee from Amber to Red?',o:['Automatically after 2 consecutive Amber months','When two or more standards are missed or one serious breach occurs','After the licensee misses 3 consecutive support calls','When student count drops below 10 per week'],c:1},
{q:'A licensee\'s coach allowed a student to use equipment outside a designated zone. This is:',o:['Green — minor coaching lapse','Amber — document and set correction deadline','A non-negotiable safety breach — HQ escalation required','TDP discretionary — TDP decides severity'],c:2},
{q:'A Remediation Plan is issued when:',o:['A licensee misses one monthly submission','Two or more standards are missed simultaneously, or one serious breach occurs','Three or more Green months are followed by a single Amber month','The licensee\'s student count falls below 15 for two consecutive months'],c:1},
],
TDP_C:[
{q:'Which has zero grace period, requiring immediate session halt and HQ notification?',o:['Two coaches with sessions logged 3 days late','An expired SAM insurance endorsement','A licensee who missed one monthly report','A coach who has not yet completed L2'],c:1},
{q:'The TDP-led annual audit report must be submitted to HQ within:',o:['7 days','14 days','30 days','By end of the financial year'],c:1},
{q:'When a safeguarding breach is identified, the TDP must notify HQ within:',o:['24 hours','2 hours','4 hours','48 hours'],c:1},
{q:'A TDP\'s own commission is held when:',o:['A licensee misses their monthly report','The TDP fails to submit their own monthly report by the 5th','A licensee\'s SAM insurance expires','The TDP has an open Amber licensee with no action plan'],c:1},
{q:'During an annual audit, what must be verified for all coaches?',o:['Coach birth certificates and ID documents','Coach certification records — no expired certifications','Coach session delivery quality via video review','Coach payment records for the past 12 months'],c:1},
{q:'A minor compliance gap in a first occurrence has a correction deadline of:',o:['7 days','14 days','30 days','Immediate correction required'],c:1},
{q:'A TDP background screening must be renewed every:',o:['1 year','2 years','3 years','5 years'],c:2},
{q:'A repeat minor compliance gap (second occurrence) must be:',o:['Documented and continue monitoring','Escalated to HQ with a formal Compliance Warning','Reported to the licensee\'s school contacts','Recommended for a PIP immediately'],c:1},
{q:'What triggers an immediate TDP Performance Improvement Plan?',o:['One missed monthly report','Two or more consecutive quarters below minimum targets','Any licensee reaching Red status','A coach certification expiry in the territory'],c:1},
{q:'A licensee cannot produce 6 weeks of session logs during the annual audit. This is:',o:['Minor — set a 14-day correction deadline','Major — immediate HQ escalation; sessions may be suspended','Amber — conduct a support call within 7 days','Green with conditions — accept the explanation'],c:1},
{q:'The TDP\'s monthly report must cover:',o:['Active school count only','Active licensee status (Green/Amber/Red), pipeline summary, open compliance issues, and commission reconciliation','Commission reconciliation only','Pipeline summary and revenue data'],c:1},
{q:'A serious injury at a licensee\'s school means the TDP must notify HQ within:',o:['1 hour','2 hours','4 hours','24 hours'],c:2},
{q:'The correct consequence for fraudulent TDP reporting is:',o:['Commission held for the month','A formal Compliance Warning','Immediate termination of the TDP agreement','A Performance Improvement Plan'],c:2},
{q:'Which certifications must the TDP keep current to remain self-compliant?',o:['TDP_O only','TDP_O and TDP_L only','All three: TDP_O, TDP_L, and TDP_C','TDP_L and TDP_C only'],c:2},
{q:'A licensee\'s GL insurance is current but SAM endorsement expires in 3 days. The TDP should:',o:['Monitor the situation — GL is the primary policy','Alert the licensee and ensure renewal is confirmed before expiry — then halt sessions immediately if not renewed','Issue a 7-day informal extension','Allow sessions until HQ issues a formal direction'],c:1},
],
};

// ══════════════════════════════════════════
//  EDUCATION HUB RENDERING
// ══════════════════════════════════════════

function getModulesForRole() {
  const role = state.role;
  if (role === 'tdp') return ['TDP_O','TDP_L','TDP_C'];
  const levels = role === 'licensee' ? ['M0','L1','L2','L3'] : ['M0','L1','L2'];
  if (hasPassed('L1')) levels.push('REFRESH');
  return levels;
}

function renderCertPage() {
  if (state.role === 'tdp') { renderTDPCertPage(); return; }
  loadCertData().then(() => renderEducationHub());
}

function renderEducationHub() {
  const page = document.getElementById('page-coach-education');
  if (!page) return;

  const levels = getModulesForRole();

  // Determine the current active level (first unlocked, not yet passed)
  const activeLevel = levels.find(lvl => !hasPassed(lvl) && (!CERT_LEVELS[lvl].prereq || hasPassed(CERT_LEVELS[lvl].prereq)));
  const activeDef   = activeLevel ? CERT_LEVELS[activeLevel] : null;
  const activeMods  = activeLevel ? (EDU_MODULES[activeLevel] || []) : [];
  const activeRead  = activeMods.filter(m => certState.records[`read_${m.id}`]).length;
  const activeKC    = activeMods.filter(m => certState.records[`kc_${m.id}`]).length;
  const activePct   = activeMods.length ? Math.round((activeRead / activeMods.length) * 100) : 0;

  // Has the user started anything at all?
  const hasStarted  = levels.some(lvl =>
    hasPassed(lvl) || (EDU_MODULES[lvl]||[]).some(m => certState.records[`read_${m.id}`])
  );

  // Welcome card — first-time only
  const welcomeCard = !hasStarted ? `
    <div class="card" style="margin-bottom:16px;background:linear-gradient(135deg,var(--green-dark),#2a7a42);color:white;border:none;">
      <div style="font-size:28px;margin-bottom:8px;">👋</div>
      <h3 style="color:white;margin:0 0 8px;font-family:var(--font-display);">Welcome to your certification path</h3>
      <p style="color:rgba(255,255,255,0.85);margin:0 0 16px;font-size:14px;line-height:1.6;">You have 3 certification levels. Start with <strong>Model 0 — Compliance</strong>. Each level has study modules, ungraded practice checks, and a final graded assessment. Most coaches complete M0 in under 45 minutes.</p>
      <button class="btn" style="background:white;color:var(--green-dark);font-weight:700;border:none;" onclick="openEduLevel('M0')">Begin Model 0 →</button>
    </div>` : '';

  // Focus card — current level in progress
  const focusCard = (activeDef && hasStarted) ? `
    <div class="card" style="margin-bottom:16px;border:2px solid ${activeDef.color};">
      <div style="font-size:11px;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Currently Working On</div>
      <div style="font-weight:700;font-size:17px;color:var(--green-dark);margin-bottom:10px;">${activeDef.fullLabel}</div>
      <div id="edu-focus-progress" style="display:flex;gap:20px;font-size:13px;color:var(--gray-400);margin-bottom:10px;flex-wrap:wrap;">
        <span>📖 ${activeRead}/${activeMods.length} modules read</span>
        <span>✏️ ${activeKC}/${activeMods.length} practice done</span>
      </div>
      <div style="height:8px;background:var(--gray-200);border-radius:4px;overflow:hidden;margin-bottom:14px;">
        <div style="height:100%;width:${activePct}%;background:${activeDef.color};border-radius:4px;transition:width 0.5s;"></div>
      </div>
      <button class="btn btn-primary btn-sm" style="background:${activeDef.color};border-color:${activeDef.color};" onclick="openEduLevel('${activeLevel}')">Continue ${activeDef.label} →</button>
    </div>` : '';

  const levelCards = levels.map(lvl => {
    const def      = CERT_LEVELS[lvl];
    const passed   = hasPassed(lvl);
    const expired  = isExpired(lvl);
    const prereqMet = !def.prereq || hasPassed(def.prereq);
    const mods     = EDU_MODULES[lvl] || [];
    const modsRead = mods.filter(m => certState.records[`read_${m.id}`]).length;
    const modPct   = mods.length ? Math.round((modsRead / mods.length) * 100) : 0;

    // Locked levels get a clearly distinct treatment
    if (!prereqMet) {
      return `<div class="edu-level-card locked" style="border-left:4px solid var(--gray-300);background:var(--gray-50);cursor:default;opacity:1;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:48px;height:48px;background:var(--gray-100);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;opacity:0.4;">🔒</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:15px;color:var(--gray-400);">${def.fullLabel}</div>
            <div style="font-size:12px;color:var(--gray-400);margin-top:4px;">Complete <strong style="color:var(--gray-500);">${CERT_LEVELS[def.prereq]?.label}</strong> first to unlock</div>
          </div>
          <div style="font-size:18px;opacity:0.25;">🔒</div>
        </div>
      </div>`;
    }

    let statusBadge;
    if (passed && !expired) statusBadge = `<span class="badge badge-green">🏆 Certified</span>`;
    else if (expired)        statusBadge = `<span class="badge badge-red">⚠️ Expired</span>`;
    else                     statusBadge = `<span style="font-size:12px;color:var(--gold-dark);font-weight:600;">In Progress</span>`;

    return `<div class="edu-level-card" style="border-left:4px solid ${def.color};" onclick="openEduLevel('${lvl}')">
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:48px;height:48px;background:${def.color}18;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">${passed&&!expired?'🏆':'📚'}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:15px;color:var(--green-dark);">${def.fullLabel}</div>
          <div style="font-size:12px;color:var(--gray-400);margin-top:2px;">${mods.length} modules · ${modsRead}/${mods.length} read</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">
          ${statusBadge}
          ${!passed?`<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();openEduLevel('${lvl}')">Continue →</button>`:''}
          ${passed&&!expired?`<button class="btn btn-sm btn-outline" onclick="event.stopPropagation();viewCertificate('${lvl}')">View Cert</button>`:''}
        </div>
      </div>
      ${!passed && mods.length ? `
      <div class="edu-level-progress-bar">
        <div class="edu-level-progress-fill" style="width:${modPct}%;"></div>
      </div>` : ''}
    </div>`;
  }).join('');

  page.innerHTML = `
    <div class="page-header"><h1>Education Hub</h1><p>Your professional certification pathway</p></div>
    <div class="tabs">
      <div class="tab active" onclick="switchTab(this,'edu-tab-progress')">My Progress</div>
      <div class="tab" onclick="switchTab(this,'edu-tab-certs')">My Certificates</div>
      <div class="tab" onclick="switchTab(this,'edu-tab-lessons')">Lesson Plans</div>
    </div>

    <div id="edu-tab-progress">
      ${welcomeCard}
      ${focusCard}
      <div id="edu-level-list" style="display:flex;flex-direction:column;gap:12px;">${levelCards}</div>
      <div id="edu-module-reader" style="display:none;"></div>
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

  const levelList = document.getElementById('edu-level-list');
  const reader    = document.getElementById('edu-module-reader');
  if (levelList) levelList.style.display = 'none';
  if (reader)    reader.style.display    = '';
  window.scrollTo({ top:0, behavior:'smooth' });

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
    const readTime = estimateReadTime(m);
    return `<div class="edu-module-card${clickable?'':' locked'}"
      onclick="${clickable ? `openModuleReader('${lvl}','${m.id}')` : ''}">
      <div class="edu-module-icon">${m.icon}</div>
      <div class="edu-module-info">
        <div class="edu-module-title">${m.title}</div>
        <div class="edu-module-meta">${m.sections.length} sections · ~${readTime}</div>
      </div>
      <div class="edu-status-badges">${badges}</div>
    </div>`;
  }).join('');

  reader.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
      <button class="btn btn-outline btn-sm" onclick="renderEducationHub()">← All Levels</button>
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
  const alreadyRead  = !!certState.records[`read_${moduleId}`];
  const kcDone       = !!certState.records[`kc_${moduleId}`];
  const hasKC        = !!(KNOWLEDGE_CHECKS[moduleId]?.length);
  const pct          = Math.round(((sectionIdx + 1) / total) * 100);
  const allLevelRead = mods.every(m => certState.records[`read_${m.id}`]);
  const allLevelKC   = mods.every(m => certState.records[`kc_${m.id}`]);
  const levelPassed  = hasPassed(level);

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
        ${!alreadyRead
          ? `<button class="btn btn-primary" id="mark-read-btn" onclick="markModuleRead('${moduleId}')" style="min-width:220px;">✅ Mark as Read</button>`
          : `<span style="font-size:13px;color:var(--green-dark);font-weight:600;display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#e8f5ec;border-radius:8px;">✅ Module read</span>`}
      ` : `
        <button class="btn btn-primary" onclick="navModuleSection(1)" style="min-width:160px;">
          Next Section →
        </button>`}
    </div>
    ${isLast && !alreadyRead ? `<div style="margin-top:8px;font-size:12px;color:var(--gray-400);text-align:center;">Read through all sections, then mark as read to unlock the Knowledge Check.</div>` : ''}

    <!-- Knowledge check (unlocks after read) -->
    ${alreadyRead && hasKC ? `
    <div style="margin-top:28px;padding:24px;background:linear-gradient(135deg,#f8fdf9 0%,#f0f7f2 100%);border-radius:12px;border:1px solid var(--gray-200);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="font-size:24px;">✏️</div>
        <div>
          <div style="font-weight:700;font-size:15px;color:var(--green-dark);">Knowledge Check <span style="font-size:11px;color:var(--gray-400);font-weight:400;">(ungraded practice)</span></div>
          <div style="font-size:13px;color:var(--gray-400);">Questions &amp; answers shuffle every attempt</div>
        </div>
      </div>
      ${kcDone
        ? `<div class="alert alert-green" style="margin-top:12px;">✅ Practice complete for this module!</div>
           <button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="startKnowledgeCheck('${moduleId}')">Retry (reshuffled)</button>`
        : `<button class="btn btn-primary" style="margin-top:12px;width:100%;" onclick="startKnowledgeCheck('${moduleId}')">Start Knowledge Check →</button>
           <div style="margin-top:8px;font-size:12px;color:var(--gray-400);text-align:center;">Ungraded — any score is fine.</div>`
      }
    </div>
    ${kcDone && allLevelRead && allLevelKC && !levelPassed ? `
    <div style="margin-top:20px;padding:24px;background:linear-gradient(135deg,#f0f7f2,#e8f5ec);border-radius:12px;border:2px solid var(--green);text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">🎓</div>
      <div style="font-weight:700;font-size:17px;color:var(--green-dark);margin-bottom:6px;">Ready for your graded assessment!</div>
      <div style="font-size:13px;color:var(--gray-400);margin-bottom:16px;">All modules read and practice complete. Pass the <strong>${CERT_LEVELS[level]?.label}</strong> Assessment at 85% to earn your certificate.</div>
      <button class="btn btn-primary" style="width:100%;padding:14px;" onclick="startLevelAssessment('${level}')">🎓 Take ${CERT_LEVELS[level]?.label} Assessment →</button>
    </div>` : ''}` : ''}`;

  // M0 acknowledgment checkbox state
  if (moduleId === 'M0' && isLast) {
    const ackBox = document.getElementById('m0-acknowledge');
    if (ackBox) ackBox.checked = !!certState.records['M0_ACK'];
    checkM0Ack();
  }
}

function estimateReadTime(mod) {
  const raw = mod.sections.map(s => (s.b||'') + ' ' + (s.h||'')).join(' ');
  const words = raw.replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 180)) + ' min';
}

function navModuleSection(dir) {
  const { level, moduleId } = eduState;
  const mod = (EDU_MODULES[level]||[]).find(m=>m.id===moduleId);
  if (!mod) return;
  const next = eduState.sectionIdx + dir;
  if (next >= 0 && next < mod.sections.length) {
    eduState.sectionIdx = next;
    renderModuleReader();
    window.scrollTo({ top:0, behavior:'smooth' });
  }
}

function jumpModuleSection(idx) {
  eduState.sectionIdx = idx;
  renderModuleReader();
  window.scrollTo({ top:0, behavior:'smooth' });
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
    // Refresh focus card stats in-place
    const _fp = document.getElementById('edu-focus-progress');
    if (_fp) {
      const _kcLvl   = eduState.level;
      const _kcMods  = EDU_MODULES[_kcLvl] || [];
      const _kRead   = _kcMods.filter(m => certState.records[`read_${m.id}`]).length;
      const _kKC     = _kcMods.filter(m => certState.records[`kc_${m.id}`]).length;
      _fp.innerHTML  = `<span>📖 ${_kRead}/${_kcMods.length} modules read</span><span>✏️ ${_kKC}/${_kcMods.length} practice done</span>`;
    }
    // Show completion screen
    const correctCount = kcState.answers.filter(a=>a.correct).length;
    const kcLvl      = eduState.level;
    const kcLvlMods  = EDU_MODULES[kcLvl] || [];
    const kcAllRead  = kcLvlMods.every(m => certState.records[`read_${m.id}`]);
    const kcAllKC    = kcLvlMods.every(m => certState.records[`kc_${m.id}`]);
    const kcPassed   = hasPassed(kcLvl);
    const showAssessmentCTA = kcAllRead && kcAllKC && !kcPassed;
    const reader = document.getElementById('edu-module-reader');
    if (reader) reader.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="font-size:48px;margin-bottom:12px;">✅</div>
        <h2 style="color:var(--green-dark);">Practice Complete!</h2>
        <div style="font-size:32px;font-weight:700;color:var(--green);margin:12px 0;">${correctCount}/${kcState.questions.length}</div>
        <p style="color:var(--gray-400);max-width:360px;margin:0 auto;">This is ungraded practice — any score is fine.</p>
        ${showAssessmentCTA ? `
        <div style="margin:24px auto;max-width:420px;padding:20px;background:linear-gradient(135deg,#f0f7f2,#e8f5ec);border-radius:12px;border:2px solid var(--green);">
          <div style="font-weight:700;color:var(--green-dark);margin-bottom:6px;">🎓 All modules done!</div>
          <div style="font-size:13px;color:var(--gray-400);margin-bottom:14px;">Now take the graded <strong>${CERT_LEVELS[kcLvl]?.label}</strong> Assessment (85% to pass) to earn your certificate.</div>
          <button class="btn btn-primary" style="width:100%;" onclick="startLevelAssessment('${kcLvl}')">Take ${CERT_LEVELS[kcLvl]?.label} Assessment →</button>
        </div>` : ''}
        <div style="display:flex;gap:12px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
          <button class="btn btn-outline" onclick="renderModuleList('${eduState.level}')">← Back to Modules</button>
          <button class="btn btn-outline btn-sm" onclick="startKnowledgeCheck('${kcState.moduleId}')">Retry (Shuffled)</button>
        </div>
      </div>`;
  } else {
    kcState.currentQ++;
    kcState.answered = false;
    renderKCQuestion();
  }
}

// ── Quiz progress persistence ────────────────────────────────────────────────
function _quizKey(level) {
  return 'egk_quiz_' + (state.user?.id || 'anon') + '_' + level;
}
function saveQuizProgress() {
  try { localStorage.setItem(_quizKey(quizState.level), JSON.stringify(quizState)); } catch(e) {}
}
function loadQuizProgress(level) {
  try { const d = localStorage.getItem(_quizKey(level)); return d ? JSON.parse(d) : null; } catch(e) { return null; }
}
function clearQuizProgress(level) {
  try { localStorage.removeItem(_quizKey(level)); } catch(e) {}
}

// ── Level Assessment (formal quiz) ───────────────────────────────────────────
function startLevelAssessment(level) {
  const rec = certState.records[level] || {};
  if (!rec.passed) {
    if (rec.failDate) {
      const hoursLeft = 24 - (Date.now() - new Date(rec.failDate).getTime()) / 3600000;
      if (hoursLeft > 0) {
        const h = Math.ceil(hoursLeft);
        alert('Please wait ' + h + ' more hour' + (h !== 1 ? 's' : '') + ' before retrying this assessment.\n\nUse this time to re-read the modules — the questions are reshuffled each attempt.');
        return;
      }
    }
    if ((rec.attemptCount || 0) >= 3) {
      alert('You have used all 3 attempts for this assessment.\n\nPlease contact EduGolfKids HQ to unlock another attempt:\nmorne.marilize@gmail.com');
      return;
    }
  }
  // Check for a saved in-progress attempt
  const savedProgress = loadQuizProgress(level);
  if (savedProgress && savedProgress.answers?.length > 0 && savedProgress.currentQ > 0) {
    const q = savedProgress.currentQ + 1;
    const total = savedProgress.questions.length;
    const resume = confirm(
      'You have an in-progress ' + (CERT_LEVELS[level]?.label || level) + ' assessment.\n' +
      'Question ' + q + ' of ' + total + ' — ' + savedProgress.answers.length + ' answer' + (savedProgress.answers.length !== 1 ? 's' : '') + ' recorded.\n\n' +
      'OK = Continue where you left off\nCancel = Start a fresh attempt (questions will reshuffle)'
    );
    if (resume) {
      quizState = savedProgress;
      safeSet('quiz-title', CERT_LEVELS[level]?.fullLabel || 'Assessment');
      safeSet('quiz-subtitle', total + ' questions · 85% required to pass · Questions and answers randomized on every attempt');
      document.getElementById('quiz-container').style.display = 'block';
      document.getElementById('quiz-results').style.display = 'none';
      renderQuizQuestion();
      showPage('page-quiz');
      return;
    }
    clearQuizProgress(level);
  }

  const qs = QUIZ_QUESTIONS[level];
  if (!qs) return;
  const count = Math.min(CERT_LEVELS[level]?.qCount || 20, qs.length);
  const shuffled = shuffleArray([...qs]).slice(0, count).map(q => {
    const combined = q.o.map((opt,i)=>({ opt, correct: i===q.c }));
    const shuffledOpts = shuffleArray(combined);
    return { q:q.q, options:shuffledOpts.map(x=>x.opt), correct:shuffledOpts.findIndex(x=>x.correct) };
  });
  quizState = { level, questions:shuffled, currentQ:0, answers:[], answered:false };
  safeSet('quiz-title', CERT_LEVELS[level]?.fullLabel || 'Assessment');
  safeSet('quiz-subtitle', `${shuffled.length} questions · 85% required to pass · Questions and answers randomized on every attempt`);
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
    saveQuizProgress();
    renderQuizQuestion();
  }
}

async function finishQuiz() {
  clearQuizProgress(quizState.level);
  const { level, questions, answers } = quizState;
  const correct = answers.filter(a=>a.correct).length;
  const total = questions.length;
  const pct = Math.round((correct/total)*100);
  const passed = pct >= 85;
  const def = CERT_LEVELS[level];
  const allLevelsArr = getModulesForRole ? getModulesForRole() : ['M0','L1','L2'];
  const curLvlIdx  = allLevelsArr.indexOf(level);
  const nextLvl    = passed && curLvlIdx >= 0 && curLvlIdx < allLevelsArr.length - 1 ? allLevelsArr[curLvlIdx + 1] : null;
  const nextLvlDef = nextLvl ? CERT_LEVELS[nextLvl] : null;
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
      <div style="background:var(--gray-100);border-radius:12px;padding:20px;margin-bottom:20px;">
        <div style="font-weight:600;margin-bottom:4px;">✅ ${def.fullLabel}</div>
        <div style="font-size:13px;color:var(--gray-400);">Certificate valid for 12 months</div>
      </div>
      ${nextLvlDef ? `
      <div style="background:linear-gradient(135deg,#f0f7f2,#e8f5ec);border:2px solid var(--green);border-radius:12px;padding:18px;margin-bottom:20px;">
        <div style="font-weight:700;color:var(--green-dark);margin-bottom:4px;">🔓 ${nextLvlDef.fullLabel} is now unlocked!</div>
        <div style="font-size:13px;color:var(--gray-400);">Your next certification level is ready to begin.</div>
      </div>` : `
      <div style="background:linear-gradient(135deg,#f0f7f2,#e8f5ec);border:2px solid var(--green);border-radius:12px;padding:18px;margin-bottom:20px;">
        <div style="font-weight:700;color:var(--green-dark);margin-bottom:4px;">🏆 Full certification pathway complete!</div>
        <div style="font-size:13px;color:var(--gray-400);">You have completed all available certification levels.</div>
      </div>`}
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="viewCertificate('${level}')">🏆 View My Certificate</button>
        ${nextLvlDef ? `<button class="btn btn-primary" style="background:var(--green-dark);" onclick="showPage('page-coach-education');renderEducationHub();setTimeout(()=>openEduLevel('${nextLvl}'),80)">Start ${nextLvlDef.label} →</button>` : ''}
        <button class="btn btn-outline" onclick="egkResendResult('${level}',${pct},true)">📧 Resend to HQ</button>
        <button class="btn btn-outline" onclick="showPage('page-coach-education');renderEducationHub()">← Back to Hub</button>
      </div>` : `
      <p style="color:var(--gray-400);margin-bottom:20px;">Questions and answers will be reshuffled on your next attempt.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="startLevelAssessment('${level}')">Try Again (Reshuffled)</button>
        <button class="btn btn-outline" onclick="egkResendResult('${level}',${pct},false)">📧 Resend to HQ</button>
        <button class="btn btn-outline" onclick="showPage('page-coach-education');renderEducationHub()">← Back</button>
      </div>`}`;
}

function egkResendResult(level, pct, passed) {
  const def  = CERT_LEVELS[level];
  const name = state.user?.name || 'Coach';
  const date = new Date().toISOString().split('T')[0];
  const att  = certState.records[level]?.attemptCount || 1;
  const subj = '[EGK] Result resend — ' + name + ' ' + def.label + ' (' + pct + '%)';
  const body = passed
    ? egkEmailBase(`<h2>Result Resent — ${def.label}</h2><p><strong>${name}</strong> requested a resend of their pass confirmation.</p><div class="score-box"><div class="score-big">${pct}%</div><div class="score-label">PASSED &middot; Date: ${date}</div></div>`)
    : egkEmailBase(`<h2>Result Resent — ${def.label}</h2><p><strong>${name}</strong> requested a resend of their attempt result.</p><div class="fail-box"><div class="fail-big">${pct}%</div><div class="score-label">Attempt ${att} of 3 &middot; Date: ${date}</div></div>`);
  const btn = event?.target;
  triggerEmailWorkflow({ to: HQ_EMAIL, subject: subj, html: body }).then(() => { if (btn) { btn.textContent = '✓ Sent'; btn.disabled = true; } });
}

function viewCertificate(level) {
  window._lastCertLevel = level;
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

function downloadCertificatePDF(level) {
  if (!window.jspdf) { alert('PDF library not loaded. Please refresh the page and try again.'); return; }
  const rec = certState.records[level];
  if (!rec || !rec.passed) { alert('Complete the assessment first.'); return; }
  const def  = CERT_LEVELS[level];
  const name = rec.name || state.user?.name || 'Coach';
  const certId = 'EGK-' + level + '-' + (rec.date || '').replace(/-/g, '');
  window._lastCertLevel = level;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297, H = 210;
  // Cream background
  doc.setFillColor(248, 246, 241); doc.rect(0, 0, W, H, 'F');
  // Double gold border
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(3); doc.rect(10, 10, W - 20, H - 20);
  doc.setLineWidth(0.8); doc.rect(14, 14, W - 28, H - 28);
  // Brand header
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(201, 168, 76);
  doc.text('EDUGOLFKIDS', W / 2, 32, { align: 'center', charSpace: 3 });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90, 90, 74);
  doc.text('CERTIFICATE OF ACHIEVEMENT', W / 2, 40, { align: 'center', charSpace: 2 });
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5); doc.line(60, 46, W - 60, 46);
  // Body
  doc.setFont('helvetica', 'italic'); doc.setFontSize(12); doc.setTextColor(90, 90, 74);
  doc.text('This certifies that', W / 2, 60, { align: 'center' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(30); doc.setTextColor(18, 64, 28);
  doc.text(name, W / 2, 78, { align: 'center' });
  doc.setFont('helvetica', 'italic'); doc.setFontSize(12); doc.setTextColor(90, 90, 74);
  doc.text('has successfully completed', W / 2, 90, { align: 'center' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(27, 92, 42);
  doc.text(def.fullLabel, W / 2, 104, { align: 'center' });
  // Divider + stats
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5); doc.line(40, 114, W - 40, 114);
  const c1 = 70, c2 = W / 2, c3 = W - 70;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90, 90, 74);
  doc.text('Score', c1, 124, { align: 'center' });
  doc.text('Date Issued', c2, 124, { align: 'center' });
  doc.text('Valid Until', c3, 124, { align: 'center' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(18, 64, 28);
  doc.text(rec.score + '%', c1, 136, { align: 'center' });
  doc.setFontSize(14);
  doc.text(rec.date || '', c2, 136, { align: 'center' });
  doc.text(rec.expiry || '', c3, 136, { align: 'center' });
  // Footer
  doc.setDrawColor(201, 168, 76); doc.setLineWidth(0.5); doc.line(20, 148, W - 20, 148);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(18, 64, 28);
  doc.text('EduGolfKids LLC', 28, 158);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(90, 90, 74);
  doc.text('MOORESVILLE, NORTH CAROLINA', 28, 165);
  doc.text('Certificate ID: ' + certId, W - 28, 158, { align: 'right' });
  doc.text('edugolfkids.com', W - 28, 165, { align: 'right' });
  doc.save('EGK-Certificate-' + level + '-' + name.replace(/\s+/g, '-') + '.pdf');
}

// ── HQ Education Stats ───────────────────────────────────────────────────────
function renderHQEducationStats() {
  loadCertData().then(() => {
    const allUsers = certState.usersData?.users || [];
    const trainees = allUsers.filter(u => u.role === 'coach' || u.role === 'licensee');
    const today = new Date();

    const certifiedL1  = trainees.filter(u => u.certifications?.L1?.passed).length;
    const overdue      = trainees.filter(u => {
      const certs = u.certifications || {};
      return Object.entries(certs).some(([k,r]) =>
        CERT_LEVELS[k] && r.passed && r.expiry && new Date(r.expiry) < today
      );
    }).length;
    const compliant    = trainees.filter(u => {
      const certs = u.certifications || {};
      const levels = Object.keys(CERT_LEVELS).filter(k => k !== 'REFRESH');
      const applicable = levels.filter(k => CERT_LEVELS[k]?.forRoles?.includes(u.role));
      if (!applicable.length) return false;
      return applicable.every(k => {
        const r = certs[k];
        return r?.passed && (!r.expiry || new Date(r.expiry) >= today);
      });
    }).length;
    const compliancePct = trainees.length ? Math.round((compliant / trainees.length) * 100) : 0;

    safeSet('cert-network-count', certifiedL1);
    safeSet('cert-overdue-count', overdue);
    safeSet('cert-compliance-pct', compliancePct + '%');

    const tableRows = trainees.map(u => {
      const certs = u.certifications || {};
      const levels = u.role === 'licensee'
        ? ['M0','L1','L2','L3','REFRESH']
        : ['M0','L1','L2','REFRESH'];
      const badges = levels.map(k => {
        const r = certs[k];
        if (!r?.passed) return `<span class="badge badge-gray">${k}</span>`;
        const expired = r.expiry && new Date(r.expiry) < today;
        return expired
          ? `<span class="badge badge-red">${k} exp</span>`
          : `<span class="badge badge-green">${k}</span>`;
      }).join(' ');
      const nextExpiry = levels.map(k => certs[k]?.expiry).filter(Boolean).sort()[0];
      return `<tr>
        <td><strong>${u.name || u.id}</strong></td>
        <td><span class="badge badge-gray">${u.role}</span></td>
        <td>${badges}</td>
        <td style="font-size:12px;color:var(--gray-400);">${nextExpiry || '—'}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="4" style="color:var(--gray-400);text-align:center;">No coaches or licensees found in users.json</td></tr>';

    const tableEl = document.getElementById('cert-network-table');
    if (tableEl) tableEl.innerHTML = tableRows;

    const refreshRows = trainees.filter(u => {
      const certs = u.certifications || {};
      return Object.entries(certs).some(([k,r]) =>
        CERT_LEVELS[k] && r.passed && r.expiry &&
        (new Date(r.expiry) - today) / (1000 * 60 * 60 * 24) <= 60
      );
    }).map(u => {
      const certs = u.certifications || {};
      const soonExpiry = Object.entries(certs)
        .filter(([k,r]) => CERT_LEVELS[k] && r.passed && r.expiry)
        .sort(([,a],[,b]) => new Date(a.expiry) - new Date(b.expiry))[0];
      const days = soonExpiry
        ? Math.ceil((new Date(soonExpiry[1].expiry) - today) / (1000*60*60*24))
        : null;
      return `<tr>
        <td><strong>${u.name || u.id}</strong></td>
        <td><span class="badge badge-gray">${u.role}</span></td>
        <td><span class="badge ${days < 0 ? 'badge-red' : 'badge-amber'}">${days < 0 ? 'Expired' : days + ' days'}</span></td>
        <td style="font-size:12px;">${soonExpiry?.[1].expiry || '—'}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="4" style="color:var(--gray-400);text-align:center;">No upcoming expirations — all certifications current</td></tr>';

    const refreshTableEl = document.getElementById('cert-refresher-table');
    if (refreshTableEl) refreshTableEl.innerHTML = refreshRows;
    renderHQActivityReport();
  });
}

// ── Coach Home Dashboard ─────────────────────────────────────────────────────
async function updateAndSaveStreak() {
  const userId = state.user?.id;
  if (!userId) return;
  const key   = 'egk_streak_' + userId;
  const today = new Date().toISOString().split('T')[0];
  let stored;
  try { stored = JSON.parse(localStorage.getItem(key) || 'null'); } catch { stored = null; }
  let streak = 1;
  let changed = true;
  if (stored?.lastDate) {
    const last = new Date(stored.lastDate);
    const diff = Math.round((new Date(today) - last) / 864e5);
    if      (diff === 0) { streak = stored.streak || 1; changed = false; }
    else if (diff === 1) { streak = (stored.streak || 0) + 1; }
    else                 { streak = 1; }
  }
  try { localStorage.setItem(key, JSON.stringify({ streak, lastDate: today })); } catch {}
  state.streak = streak;
  const _users = certState.usersData?.users || [];
  const _idx   = _users.findIndex(u => u.id === userId);
  if (_idx !== -1) { _users[_idx].streak = streak; _users[_idx].lastLogin = today; }
  if (changed) {
    try { await saveCertStateRecords(); } catch(e) { console.warn('streak save failed', e); }
  }
}

function renderCoachHome() {
  const page = document.getElementById('page-coach-home');
  if (!page) return;
  loadCertData().then(() => {
    const name    = state.user?.name || 'Coach';
    const today   = new Date();
    const todayStr = today.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    const levels  = getModulesForRole();
    const records = certState.records || {};

    // Highest passed + next level
    let highestPassed = null, nextLevel = null;
    for (const lvl of levels) {
      if (records[lvl]?.passed) highestPassed = lvl;
      else if (!nextLevel) nextLevel = lvl;
    }

    // Stats
    const passedCount = levels.filter(l => records[l]?.passed).length;
    const modsRead    = Object.keys(records).filter(k => k.startsWith('read_')).length;
    const streak      = state.streak || (() => { try { return JSON.parse(localStorage.getItem('egk_streak_'+(state.user?.id||''))||'{}').streak||0; } catch { return 0; } })();

    // Expiry alert
    let expiryHtml = '';
    const expiring = Object.entries(records).filter(([k,r]) => CERT_LEVELS[k] && r.passed && r.expiry && (new Date(r.expiry)-today)/(864e5) <= 60);
    if (expiring.length) {
      const [k, r] = expiring.sort(([,a],[,b])=>new Date(a.expiry)-new Date(b.expiry))[0];
      const days = Math.ceil((new Date(r.expiry)-today)/864e5);
      expiryHtml = `<div class="alert alert-red" style="margin-bottom:20px;">⚠️ <strong>${CERT_LEVELS[k].label}</strong> ${days<=0?'has expired':'expires in '+days+' days'}. <a href="#" onclick="showPage('page-coach-education');renderEducationHub()">Renew now →</a></div>`;
    }

    // Next action card
    let actionHtml = '';
    if (nextLevel) {
      const def = CERT_LEVELS[nextLevel];
      const isRead   = !!records[`read_${nextLevel}`];
      const isKCDone = !!records[`kc_${nextLevel}`]?.done;
      const hasFailed = records[nextLevel] && !records[nextLevel].passed;
      const attUsed   = records[nextLevel]?.attemptCount || 0;
      const bg = isKCDone ? 'linear-gradient(135deg,#1a3a6b,#2980B9)' : 'linear-gradient(135deg,var(--green-dark),var(--green))';
      let step, detail, btnLabel, btnAction;
      if (!isRead) {
        step='Step 1 of 3 — Read the Module'; detail=`Open ${def.label} and work through the reading material.`; btnLabel='Start Reading →'; btnAction=`showPage('page-coach-education');renderEducationHub();setTimeout(()=>openEduLevel('${nextLevel}'),80)`;
      } else if (!isKCDone) {
        step='Step 2 of 3 — Knowledge Check'; detail='You\'ve read the content. Complete the Knowledge Check before your formal assessment.'; btnLabel='Take Knowledge Check →'; btnAction=`showPage('page-coach-education');renderEducationHub();setTimeout(()=>openEduLevel('${nextLevel}'),80)`;
      } else {
        step='Step 3 of 3 — Formal Assessment'; detail=`${def.qCount} questions · 85% to pass · ${attUsed > 0 ? 'Attempt '+(attUsed+1)+' of 3' : 'First attempt — good luck!'}`; btnLabel='Start Assessment →'; btnAction=`startLevelAssessment('${nextLevel}')`;
      }
      actionHtml = `<div style="background:${bg};border-radius:16px;padding:28px;color:white;margin-bottom:24px;">
        <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.75;margin-bottom:6px;">${def.label} · ${step}</div>
        <div style="font-size:22px;font-weight:700;margin-bottom:8px;">${!isRead?'Start '+def.label:!isKCDone?'Complete Knowledge Check':'Ready to be Assessed'}</div>
        <div style="font-size:14px;opacity:0.85;margin-bottom:20px;">${detail}</div>
        <button class="btn" style="background:var(--gold);color:var(--green-dark);font-weight:700;padding:12px 24px;" onclick="${btnAction}">${btnLabel}</button>
      </div>`;
    } else {
      actionHtml = `<div style="background:linear-gradient(135deg,#8B5006,var(--gold));border-radius:16px;padding:28px;color:white;margin-bottom:24px;">
        <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.75;margin-bottom:6px;">Pathway Complete</div>
        <div style="font-size:22px;font-weight:700;margin-bottom:8px;">All Levels Certified 🏆</div>
        <div style="font-size:14px;opacity:0.85;margin-bottom:20px;">Excellent work — you have completed the full EduGolfKids certification pathway.</div>
        <button class="btn" style="background:white;color:var(--green-dark);font-weight:700;padding:12px 24px;" onclick="showPage('page-coach-education');renderEducationHub()">View Education Hub →</button>
      </div>`;
    }

    // Level progress strip
    const strip = levels.map(lvl => {
      const def = CERT_LEVELS[lvl];
      const p = records[lvl]?.passed;
      const cur = lvl === nextLevel;
      return `<div style="text-align:center;flex:1;">
        <div style="width:40px;height:40px;border-radius:50%;background:${p?def.color:cur?'var(--gray-200)':'var(--gray-100)'};border:3px solid ${p?def.color:cur?'var(--gray-400)':'var(--gray-200)'};display:flex;align-items:center;justify-content:center;font-size:16px;margin:0 auto 5px;color:${p?'white':cur?'var(--gray-600)':'var(--gray-400)'};">${p?'✓':cur?'→':'○'}</div>
        <div style="font-size:10px;font-weight:600;color:${p?def.color:cur?'var(--gray-600)':'var(--gray-400)'};">${lvl}</div>
      </div>`;
    }).join('<div style="flex:0 0 12px;height:2px;background:var(--gray-200);align-self:center;margin-bottom:21px;"></div>');

    page.innerHTML = `
      <div class="page-header"><h1>Welcome back, ${name.split(' ')[0]}</h1><p>${todayStr}</p></div>
      ${expiryHtml}
      ${actionHtml}
      <div class="grid-2" style="gap:16px;margin-bottom:24px;">
        <div style="display:grid;gap:12px;">
          <div class="stat-card green"><div class="stat-icon">🎓</div><div class="stat-value">${passedCount} <span style="font-size:16px;font-weight:400;color:var(--gray-400);">/ ${levels.length}</span></div><div class="stat-label">Levels Certified</div></div>
          <div class="stat-card"><div class="stat-icon">📖</div><div class="stat-value">${modsRead}</div><div class="stat-label">Modules Read</div></div>
          <div class="stat-card" style="border-left:4px solid #F97316;"><div class="stat-icon">🔥</div><div class="stat-value">${streak}</div><div class="stat-label">Day Streak</div></div>
        </div>
        <div class="card" style="padding:20px;">
          <div style="font-size:11px;color:var(--gray-400);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">Certification Pathway</div>
          <div style="display:flex;align-items:center;">${strip}</div>
        </div>
      </div>
      ${(() => {
        const histRows = levels.flatMap(l => {
          const def = CERT_LEVELS[l];
          return (records[l]?.attempts || []).slice().reverse().map(a => `<tr>
            <td style="padding:8px 12px;">${def.label}</td>
            <td style="padding:8px 12px;font-weight:700;color:${a.passed?'var(--green-dark)':' var(--red)'};">${a.score}%</td>
            <td style="padding:8px 12px;"><span style="color:${a.passed?'var(--green-dark)':'var(--red)'};">${a.passed?'Passed':'Not passed'}</span></td>
            <td style="padding:8px 12px;color:var(--gray-400);">${a.date}</td>
          </tr>`);
        });
        if (!histRows.length) return '';
        return `<div class="card" style="margin-bottom:24px;">
          <div class="card-header"><h3>📊 Attempt History</h3></div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <thead><tr style="border-bottom:2px solid var(--border);">
                <th style="padding:8px 12px;text-align:left;color:var(--gray-400);font-weight:600;">Level</th>
                <th style="padding:8px 12px;text-align:left;color:var(--gray-400);font-weight:600;">Score</th>
                <th style="padding:8px 12px;text-align:left;color:var(--gray-400);font-weight:600;">Result</th>
                <th style="padding:8px 12px;text-align:left;color:var(--gray-400);font-weight:600;">Date</th>
              </tr></thead>
              <tbody>${histRows.join('')}</tbody>
            </table>
          </div>
        </div>`;
      })()}
      <div class="card">
        <div class="card-header"><h3>📢 HQ Announcement</h3></div>
        <div class="alert alert-blue" style="margin:0;">Welcome to the EduGolfKids Learning Platform. Complete your certification pathway to lead sessions independently. Contact HQ at morne.marilize@gmail.com for support.</div>
      </div>`;
  });
}

// ── HQ Activity Report ────────────────────────────────────────────────────────
function renderHQActivityReport() {
  const allUsers = certState.usersData?.users || [];
  const trainees = allUsers.filter(u => u.role === 'coach' || u.role === 'licensee');
  const today    = new Date();

  let compliant = 0, inProgress = 0, notStarted = 0;

  const rows = trainees.map(u => {
    const certs   = u.certifications || {};
    const role    = u.role || 'coach';
    const levels  = role === 'licensee' ? ['M0','L1','L2','L3'] : ['M0','L1','L2'];
    const passed  = levels.filter(k => certs[k]?.passed);
    const pct     = levels.length ? Math.round((passed.length / levels.length) * 100) : 0;

    // Derive last activity from most recent cert date
    const dates = Object.values(certs).map(r => r.date || r.expiry || null).filter(Boolean).sort().reverse();
    const lastActivity = dates[0] || '—';
    const daysSince = lastActivity !== '—' ? Math.floor((today - new Date(lastActivity)) / 864e5) : null;
    const lastActivityLabel = lastActivity === '—' ? 'No activity' : (daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : daysSince + ' days ago');

    // Status
    let status, statusColor;
    const hasExpired = Object.entries(certs).some(([k,r]) => CERT_LEVELS[k] && r.passed && r.expiry && new Date(r.expiry) < today);
    if (hasExpired) {
      status = 'Overdue'; statusColor = 'var(--red)'; inProgress++;
    } else if (pct === 100) {
      status = 'Compliant'; statusColor = 'var(--success)'; compliant++;
    } else if (pct === 0) {
      status = 'Not Started'; statusColor = 'var(--gray-400)'; notStarted++;
    } else {
      status = 'In Progress'; statusColor = 'var(--amber)'; inProgress++;
    }

    const bar = `<div style="display:flex;align-items:center;gap:8px;">
      <div style="flex:1;background:var(--gray-100);border-radius:4px;height:8px;overflow:hidden;">
        <div style="width:${pct}%;background:var(--green);height:100%;border-radius:4px;"></div>
      </div>
      <span style="font-size:12px;color:var(--gray-600);white-space:nowrap;">${passed.length}/${levels.length}</span>
    </div>`;

    return `<tr>
      <td><strong>${u.name || u.id}</strong>${u.email ? `<br><span style="font-size:11px;color:var(--gray-400);">${u.email}</span>` : ''}</td>
      <td><span class="badge badge-gray">${role}</span></td>
      <td style="min-width:140px;">${bar}</td>
      <td><span class="badge" style="background:${statusColor}20;color:${statusColor};border:1px solid ${statusColor}40;">${status}</span></td>
      <td style="font-size:12px;color:var(--gray-400);">${lastActivityLabel}</td>
      <td><button class="btn btn-sm btn-outline" onclick="hqManageTrainee('${u.id}')">Manage →</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" style="color:var(--gray-400);text-align:center;">No coaches or licensees found</td></tr>';

  safeSet('rpt-compliant',   compliant);
  safeSet('rpt-in-progress', inProgress);
  safeSet('rpt-not-started', notStarted);
  const el = document.getElementById('rpt-activity-table');
  if (el) el.innerHTML = rows;
}

// ── HQ trainee management ────────────────────────────────────────────────────
function hqManageTrainee(userId) {
  const allUsers = certState.usersData?.users || [];
  const u = allUsers.find(u => u.id === userId);
  if (!u) return;
  const certs = u.certifications || {};
  const role = u.role || 'coach';
  const levels = role === 'tdp' ? ['TDP_O','TDP_L','TDP_C'] : role === 'licensee' ? ['M0','L1','L2','L3','REFRESH'] : ['M0','L1','L2','REFRESH'];
  const rows = levels.map(lvl => {
    const def = CERT_LEVELS[lvl]; if (!def) return '';
    const rec = certs[lvl] || {};
    const att = rec.attemptCount || 0;
    const result = rec.passed ? '<span style="color:var(--success);">✅ Passed</span>' : att > 0 ? '<span style="color:var(--red);">❌ Not passed</span>' : '<span style="color:var(--gray-400);">—</span>';
    const score  = rec.score != null ? rec.score + '%' : '—';
    const reset  = (att > 0 || rec.failDate) ? `<button class="btn btn-sm btn-outline" onclick="hqResetAttempts('${userId}','${lvl}')">Reset attempts</button>` : '—';
    return `<tr><td>${def.label}</td><td>${result}</td><td>${score}</td><td>${att}/3</td><td>${reset}</td></tr>`;
  }).join('');
  showInfoModal(
    `Manage: ${u.name || userId}`,
    `<p style="color:var(--gray-400);font-size:13px;margin-bottom:12px;">Use Reset to clear attempt history and allow a fresh start on any level.</p>
     <table class="data-table">
       <thead><tr><th>Level</th><th>Result</th><th>Score</th><th>Attempts</th><th>Action</th></tr></thead>
       <tbody>${rows}</tbody>
     </table>`
  );
}

async function hqResetAttempts(userId, level) {
  const allUsers = certState.usersData?.users || [];
  const u = allUsers.find(u => u.id === userId);
  if (!u || !confirm(`Reset ${level} attempts for ${u.name || userId}? They will get 3 fresh attempts.`)) return;
  if (!u.certifications) u.certifications = {};
  const rec = u.certifications[level];
  if (rec) { rec.attemptCount = 0; rec.failDate = null; rec.passed = false; rec.attempts = []; }
  else { u.certifications[level] = { attemptCount:0, failDate:null, passed:false, attempts:[] }; }
  certState.usersData.users = allUsers;
  try {
    await githubPut('data/users/users.json', certState.usersData, certState.sha, `HQ reset ${level} — ${u.name || userId}`);
    alert(`✅ ${level} attempts reset for ${u.name || userId}. They can now attempt the assessment again.`);
    const m = document.getElementById('modal-info-generic');
    if (m) m.style.display = 'none';
    renderHQActivityReport();
  } catch(e) { alert('Error: ' + e.message); }
}

// ── TDP cert page ────────────────────────────────────────────────────────────
function renderTDPCertPage() {
  loadCertData().then(() => renderEducationHub());
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

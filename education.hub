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

M0:[{id:'M0_S1',title:'Compliance & Safeguarding',icon:'🛡️',sections:[
{h:'Duty of Care',b:`EduGolfKids operates under an elevated duty-of-care standard in school environments. All coaches act <em>in loco parentis</em> — "In the place of a parent." You are a mandatory reporter where required by state law. Safety, supervision, and safeguarding take priority over instruction — always.`},
{h:'Background Screening',b:`No coach may enter a school without clearance. Prior to school placement every coach must complete: a state-level criminal background check, national sex offender registry screening, additional district-required screenings, and identity/employment eligibility verification. Documentation must be available for district review at all times.`},
{h:'Mandatory Reporting',b:`If there is reasonable suspicion of abuse, coaches must: <strong>(1)</strong> Ensure child safety. <strong>(2)</strong> Report to the designated school authority. <strong>(3)</strong> Follow state reporting law. <strong>(4)</strong> Notify the EduGolfKids Compliance Officer. Failure to report results in removal from certification. Coaches must complete mandatory reporter training before working independently.`},
{h:'Supervision Standards',b:`Sessions must occur in school-approved spaces with doors unlocked and windows/visibility panels used. When direct line-of-sight is not possible, no isolated closed-room instruction is permitted. <strong>One-on-one sessions</strong> require a second adult present in the facility and the space must be open and observable.`},
{h:'Physical Contact Policy',b:`EduGolfKids enforces <strong>Controlled &amp; Transparent Instructional Contact</strong>. Hands-on positioning is permitted only when: instructional necessity exists, verbal cueing has been attempted first, contact is brief and non-invasive, and the coach explains contact before making it — e.g. "I'm going to gently adjust your shoulders." Contact must never involve sensitive areas, be prolonged, occur without explanation, or occur in isolated settings.`},
{h:'Equipment &amp; Zone Safety',b:`Children may only hold clubs inside designated hitting zones. Clubs must remain grounded when not actively hitting. No child may walk with a club in hand. <strong>Minimum lateral spacing: 6 feet.</strong> Ball retrieval only on coach command (RETRIEVE/RESET). Indoors: foam or low-compression balls mandatory at all times.`},
{h:'Emergency Action Plan',b:`Each site must have: AED location identified, nurse/medical access confirmed, severe weather protocol reviewed, and an emergency contact procedure. Coaches must know the EAP before their first session, carry an EAP card at all times, report injuries same day, and complete incident documentation within 24 hours.`},
{h:'Dress Code &amp; Phone Policy',b:`Required attire: collared golf shirt, golf shorts or pants, golf-appropriate athletic shoes. Prohibited: jeans, sweatpants, unapproved hoodies, sandals. During active sessions phones may NOT be used for personal calls, texts, or browsing. Permitted use: instructional video recording, approved photos with consent, session plans, attendance, emergency communication.`},
{h:'Supervision Protocol',b:`Coaches must arrive <strong>minimum 15 minutes before session start.</strong> Equipment must be fully set up before children arrive — never while children are present. Zero-Unsupervised-Child Standard applies at all times — before, during, after sessions, during transitions and bathroom breaks. At session end, children transfer only to the assigned teacher, authorized staff, or verified parent/guardian. If a parent is late, the coach remains with the child.`},
{h:'Acknowledgment',b:`Before proceeding to the Model 0 Assessment, you must sign the EduGolfKids compliance acknowledgment. <div id="m0-ack-section" style="margin-top:16px;padding:16px;background:var(--gray-100);border-radius:8px;border:2px solid var(--gray-200);"><label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;"><input type="checkbox" id="m0-acknowledge" style="margin-top:3px;width:18px;height:18px;flex-shrink:0;" onchange="checkM0Ack()"/><span style="font-size:14px;"><strong>I acknowledge and agree</strong> to comply with all EduGolfKids safeguarding, safety, operational, and legal standards as a condition of certification and school assignment.</span></label><div id="m0-ack-status" style="margin-top:8px;font-size:13px;color:var(--gray-400);"></div></div>`},
]}],

L1:[
{id:'L1_M1',title:'Module 1 — System Standards',icon:'📋',sections:[
{h:'EduGolfKids Philosophy',b:`EduGolfKids is grounded in five scientific pillars: <strong>(1) Child Development Science</strong> — children 4–10 learn through movement, play, exploration, immediate feedback, and emotional engagement. <strong>(2) LTAD (Balyi &amp; Hamilton 2004)</strong> — under-10s are in the FUNdamentals stage; goal is movement literacy, not specialization. <strong>(3) Motor Learning Science (Schmidt &amp; Lee 2011)</strong> — varied practice and contextual challenges produce retention; blocked repetition does not. <strong>(4) Constraints-Led Approach (Newell 1986)</strong> — manipulate environment, task, and equipment rather than telling children what to do. <strong>(5) Psychological Safety (Edmondson 2018)</strong> — children perform and persist when they feel safe, supported, and encouraged.`},
{h:'The 60-Minute Structure',b:`Every session MUST follow this — no deviation without HQ approval: <strong>0–10 min Warm-Up Game</strong> — whole-body movement, foam balls, immediate participation. <strong>10–30 min Skill Block</strong> — 3–4 mini constraint challenges, max 5 min each, no lectures, no standing lines. <strong>30–50 min Game Reinforcement</strong> — contextual play, scoring, decision-making. <strong>50–60 min Wrap-Up &amp; Reset</strong> — reflection question, positive feedback, equipment reset. 60 minutes is neurologically optimized for this age group.`},
{h:'Approved vs Prohibited Drills',b:`<strong>Approved drills MUST:</strong> be target-based, require decision-making, use low-compression balls, limit repetition to under 5 minutes, include movement variation, and encourage guided discovery. <strong>Prohibited: ❌</strong> Long static lines (waiting = disengagement). ❌ Blocked repetition over 5 minutes. ❌ Technical lectures over 60 seconds. ❌ Full-speed uncontrolled swings (non-negotiable safety violation). ❌ Adult terminology — use "brush the grass," not "lag angle."`},
{h:'Equipment &amp; Spacing',b:`Minimum lateral spacing: <strong>6 feet per child,</strong> accounting for swing arc, balance loss, impulsive movement, and delayed reaction. Every child must have a defined cone box with no overlapping directions. Retrieval: clubs on ground first, step behind safety line, walk only. Foam or low-compression balls always. Safety is engineered — not reactive.`},
{h:'No Improvisation Policy',b:`Strict no-improvisation policy protects brand integrity, Skills Passport fairness, and legal risk exposure. <strong>Allowed:</strong> your personality — energy, encouragement, humor, leadership style. <strong>Not allowed:</strong> changing structure, changing progression order, adding unsafe drills, modifying spacing rules. You are not "teaching golf." You are engineering developmental environments.`},
]},
{id:'L1_M2',title:'Module 2 — Child Development',icon:'🧠',sections:[
{h:'Four Domains',b:`Coaching must address all four simultaneously: <strong>Cognitive</strong> (thinking capacity), <strong>Motor</strong> (movement control), <strong>Emotional</strong> (self-regulation), <strong>Social</strong> (peer interaction). Core principle: <em>Children are not mini adults.</em> When instruction exceeds developmental capacity, learning stops.`},
{h:'Ages 4–6: Early Fundamentals',b:`<strong>Attention span: 5–8 minutes.</strong> They learn through demonstration, play, movement exploration, immediate feedback, external cues. They struggle with technical explanation, multi-step instructions, waiting, and delayed rewards. Motor development: poor spatial awareness, impulsive movement — heightened safety management required. Emotional: low frustration tolerance, highly approval-driven. Frustration signals (dropping club, "I can't") are developmental, not defiance. <strong>Instruct with:</strong> one-step instructions, demonstration first, simple language, external focus cues, short game cycles under 5 minutes.`},
{h:'Ages 6–9: Late Fundamentals',b:`<strong>Attention span: 10–20 minutes.</strong> Can process 2-step instructions, beginning analytical thinking, growing competitive awareness. Motor: improving coordination, better bilateral integration — consistency still emerging. Emotional: sensitive to failure, social comparison developing. Frustration signals: blaming equipment, overtrying, withdrawal. Requires calibrated challenge — not overpressure. <strong>Instruct with:</strong> 2-step instructions, tactical challenges, scoring goals, guided discovery: "Hit three balls past the blue cone. Then try to land one inside the yellow zone."`},
{h:'Frustration &amp; Task Adjustment',b:`Core rule: when frustration rises, <strong>task difficulty must adjust immediately.</strong> Do NOT add correction or increase detail. Adjust constraints: increase target size, reduce distance, change scoring rules, simplify the goal. Example: 5-year-old — "Let's hit the magic rocket to the red cone! Watch me first." 9-year-old — "You get 5 shots. Score 1 point for red, 2 for blue. Can you beat your score?"`},
{h:'Language by Age',b:`<table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:var(--gray-100);"><th style="padding:8px;text-align:left;">Category</th><th style="padding:8px;">Age 4–6</th><th style="padding:8px;">Age 6–9</th></tr></thead><tbody><tr><td style="padding:7px;border-top:1px solid var(--gray-100);">Instruction</td><td>1 step</td><td>1–2 steps</td></tr><tr><td style="padding:7px;border-top:1px solid var(--gray-100);">Cue Type</td><td>External imagery</td><td>External + reasoning</td></tr><tr><td style="padding:7px;border-top:1px solid var(--gray-100);">Correction</td><td>Demonstrate</td><td>Ask-guided</td></tr><tr><td style="padding:7px;border-top:1px solid var(--gray-100);">Competition</td><td>Cooperative games</td><td>Structured competition</td></tr><tr><td style="padding:7px;border-top:1px solid var(--gray-100);">Feedback</td><td>Immediate praise</td><td>Specific performance</td></tr></tbody></table>`},
]},
{id:'L1_M3',title:'Module 3 — Motor Learning',icon:'⚙️',sections:[
{h:'Performance vs Learning',b:`Motor learning is a relatively permanent change in movement capability produced by practice. Key word: <em>permanent.</em> Performance in a session is not learning. Temporary improvement ≠ retention. <strong>Blocked practice</strong> (same drill repeated) looks good today — poor transfer long-term. <strong>Variable practice</strong> (change distance, target, rules) looks messier — significantly stronger retention. Research (Shea &amp; Morgan 1979) confirms this. EduGolfKids coaches train for learning, not appearance.`},
{h:'Constraints-Led Approach (CLA)',b:`Based on Newell (1986). Instead of telling children how to move, manipulate: <strong>(1) Task constraints</strong> — target size, scoring rules, distance, time limits. <strong>(2) Environmental constraints</strong> — cones, boundaries, landing zones. <strong>(3) Individual constraints</strong> — height, strength, emotional state. External focus cues improve motor efficiency (Wulf 2013): instead of "Rotate your hips," say "Make your belly button face the target." Movement emerges naturally when constraints are designed properly.`},
{h:'Guided Discovery',b:`<strong>Direct correction:</strong> "You lifted your head." <strong>Guided discovery:</strong> "What happened when that one went low?" Guided discovery builds autonomy, improves retention, develops error detection. <strong>Correction hierarchy:</strong> (1) Adjust the environment. (2) Adjust the task. (3) Ask a reflective question. (4) Demonstrate. (5) Direct correction — last resort only. Error is necessary for neural recalibration. Over-correction creates fear, motor rigidity, and coach dependency.`},
{h:'Session Design',b:`Within the 20-minute Skill Block, use <strong>4 × 4-minute constraint challenges:</strong> Challenge 1: Hit past blue cone. Challenge 2: Land inside yellow circle. Challenge 3: Score 3 in a row. Challenge 4: Time pressure round. Keep instructions under 30 seconds. One focus cue at a time. When a child struggles, ask: Is the task too hard? Is the environment poorly designed? Is instruction overloaded? Is emotional state disrupted? Adjust constraints before correcting technique.`},
]},
{id:'L1_M4',title:'Module 4 — LTAD',icon:'📈',sections:[
{h:'LTAD Framework',b:`Long-Term Athlete Development (Balyi &amp; Hamilton 2004) organizes skill progression according to biological development, neuromuscular readiness, and cognitive maturity. It prevents burnout, overuse injuries, skill plateaus, and early dropout. LTAD asks: "What is developmentally appropriate at this stage?" — not "How fast can we make them good?"`},
{h:'Active Start (Ages 4–6)',b:`<strong>Primary goal: movement literacy — not golf mechanics.</strong> Golf exposure should be play-based, low pressure, short duration, and target-focused. Do NOT emphasize: grip precision, swing plane, hip rotation, launch angle, or technical positions. Why? Neurological development at 4–6 is highly plastic and exploration-driven. Early rigid technical instruction reduces creativity, natural movement exploration, and adaptive learning.`},
{h:'FUNdamentals (Ages 6–9)',b:`<strong>Primary goal: athletic foundation + basic golf control — still NOT specialization.</strong> Introduce structured scoring, basic skill progression, controlled competition. Still avoid: swing reconstruction, biomechanical perfectionism, high repetition blocked practice, adult tournament pressure. <strong>Key scenario:</strong> A 7-year-old slices but consistently reaches the target zone. No safety issue, ball reaches distance, child is confident — <em>do NOT reconstruct the swing.</em> Adjust constraints and let natural refinement occur.`},
{h:'Early Technical Overload Risks',b:`The five documented risks: <strong>(1) Motor Rigidity</strong> — overthinking, stiff movement, loss of adaptability. <strong>(2) Reduced Creativity</strong> — children stop exploring, become coach-dependent. <strong>(3) Increased Injury Risk</strong> — overuse + forced mechanics. <strong>(4) Psychological Burnout</strong> — anxiety, dropout, reduced enjoyment. <strong>(5) Plateau Effect</strong> — early performance spike, mid-adolescence stagnation. EduGolfKids coaches are long-term architects.`},
]},
{id:'L1_M5',title:'Module 5 — 21st Century Learning',icon:'🔬',sections:[
{h:'The 4 Cs',b:`EduGolfKids sessions are structured learning environments aligned with modern educational science. The four core competencies: <strong>(1) Critical Thinking</strong> — analyzing, adjusting, solving problems. Ask: "What changed on that shot?" <strong>(2) Communication</strong> — children explain strategy, reflect on performance. <strong>(3) Collaboration</strong> — team target games, partner scoring. <strong>(4) Creativity</strong> — open-ended tasks: "Find a way to land it inside the yellow circle." Golf sessions are classrooms in motion.`},
{h:'Growth Mindset &amp; Reflection',b:`Children must learn that skill improves with effort and mistakes are learning data. Coach language: instead of "You're a natural," say "That adjustment worked because you kept trying." Reinforce effort, not talent. <strong>Wrap-up metacognition:</strong> "What helped you hit farther today?" "What will you try next time?" This strengthens self-awareness, long-term retention, and autonomy. Today's children have short attention cycles — sessions must include movement rotation every 4–5 minutes and minimal idle time.`},
{h:'The Modern Coach Role',b:`<strong>Old Model:</strong> authority figure, gives instructions, corrects constantly. <strong>EduGolfKids Coach:</strong> learning facilitator, environment designer, question asker, confidence builder, structure enforcer. Target communication ratio: more questions than commands. Parents today expect structured development, emotional safety, confidence growth, character building, and measurable progression. Be able to explain: "We are building decision-making, confidence, and motor adaptability — not just swings."`},
]},
{id:'L1_M6',title:'Module 6 — Growth Mindset Language',icon:'💬',sections:[
{h:'Why Language Shapes Identity',b:`Children 4–10 form early self-concept, are highly approval-sensitive, and internalize adult feedback deeply. Negative phrasing becomes internal narrative: if a coach says "You're not focusing," the child hears "I'm bad at this." <strong>Your language becomes their inner voice.</strong> Children will forget drills. They will forget scores. They will not forget how you made them feel.`},
{h:'The Language Code',b:`<strong>APPROVED:</strong> "I see improvement." / "Let's try again." / "What did you notice?" / "That adjustment helped." / "You kept going." / "Good effort." / "What could you change?" / "Keep exploring." — These encourage effort, reinforce autonomy, promote reflection, support emotional safety.<br><br><strong>PROHIBITED:</strong> "That's wrong." / "Why can't you?" / "You're not good at this." / "You always do that." / "That's easy." — These attack identity, create shame, trigger anxiety. <strong>Violation of the Language Code results in reassessment.</strong>`},
{h:'Correction &amp; Frustration Response',b:`When a child misses: instead of "That's wrong" → "That one went left. What did you notice?" <strong>Frustration signals:</strong> equipment drop, crossed arms, silence, "This is stupid," aggressive swing. <strong>Coach response:</strong> (1) Lower tone. (2) Reduce task difficulty. (3) Effort-based praise. (4) Normalize struggle: "You're learning this. That's different from being bad at it. Let's make it easier and try again." <strong>Effort vs outcome:</strong> "Great shot!" builds performance dependency. "You adjusted your stance — that helped" builds process focus. Never publicly shame — crouch to child's level, speak quietly.`},
{h:'3-Step Language Reset',b:`If a coach accidentally uses harsh language: <strong>(1)</strong> Rephrase immediately. <strong>(2)</strong> Model the growth correction. <strong>(3)</strong> Reinforce confidence. Example: Coach says "No, not like that." → Immediately follows: "Let me rephrase — that one went left. Let's adjust together." Accountability protects culture. <strong>Parent communication:</strong> instead of "She's behind the group in putting" → "She's developing her putting feel and showing great focus — we're working through a challenge that will accelerate this."`},
]},
{id:'L1_M7',title:'Module 7 — Session Architecture',icon:'🏗️',sections:[
{h:'Integration: Theory into Practice',b:`Module 7 is where all prior modules become one. Every session must simultaneously apply: M2 (Child Development), M3 (Motor Learning), M4 (LTAD), M5 (21st Century Learning), M6 (Language Code), and all safety standards. A great drill alone is not enough. A positive tone alone is not enough. A safe setup alone is not enough. Only integration creates safety, retention, confidence, progression, and brand consistency.`},
{h:'Warm-Up &amp; Skill Block',b:`<strong>Warm-Up (0–10 min):</strong> M2 — short instructions, immediate participation. M3 — target-based, constraints used. M4 — coordination/balance focus, no technical correction. M6 — effort-based praise from minute one. Safety: spacing established, foam balls only. If warm-up is weak, the entire session declines. <strong>Skill Block (10–30 min):</strong> M3 (primary focus) — 3–4 mini constraint challenges (4–6 min each), external focus cues, no technical lecture. M2 — age-appropriate instruction, frustration monitoring. M4 — development over aesthetics, no adult swing reconstruction. Safety: 6-foot spacing maintained throughout.`},
{h:'Game Reinforcement &amp; Wrap-Up',b:`<strong>Game Reinforcement (30–50 min):</strong> Transfer skill to contextual play. Variable scoring, decision-making pressure. Do NOT overcorrect mid-game — allow natural movement adaptation. Reframe mistakes, normalize competitive loss. This is where retention strengthens and autonomy develops. <strong>Wrap-Up (50–60 min):</strong> Reflection: "What did you notice?" "What helped you improve?" Effort-based praise. Calm tone, structured closure. Equipment: clubs down before retrieval, clear dismissal. Children must leave confident, regulated, successful, and motivated.`},
{h:'Integration Map',b:`<table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:var(--gray-100);"><th style="padding:7px;text-align:left;">Segment</th><th style="padding:6px;text-align:center;">M2</th><th style="padding:6px;text-align:center;">M3</th><th style="padding:6px;text-align:center;">M4</th><th style="padding:6px;text-align:center;">M5</th><th style="padding:6px;text-align:center;">M6</th><th style="padding:6px;text-align:center;">Safety</th></tr></thead><tbody><tr><td style="padding:7px;border-top:1px solid var(--gray-100);">Warm-Up</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td></tr><tr><td style="padding:7px;border-top:1px solid var(--gray-100);">Skill Block</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓✓✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td></tr><tr><td style="padding:7px;border-top:1px solid var(--gray-100);">Game</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td></tr><tr><td style="padding:7px;border-top:1px solid var(--gray-100);">Wrap-Up</td><td style="text-align:center;">✓</td><td style="text-align:center;">—</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓✓</td><td style="text-align:center;">✓✓</td><td style="text-align:center;">✓</td></tr></tbody></table>`},
]},
{id:'L1_M8',title:'Module 8 — Parent &amp; School Communication',icon:'🤝',sections:[
{h:'Two Audiences',b:`<strong>Schools</strong> are institutional partners who grant access to students, facilities, and scheduling. They expect punctuality, minimal disruption, advance notice of changes, compliance with school policies, and visible safeguarding standards. <strong>Parents</strong> are the customers and advocates. They expect to understand what their child is learning, to feel their child is safe and valued, honest positive progress communication, and to be heard when they have concerns. Your communication with adults is as important as your coaching of children.`},
{h:'School Communication Standards',b:`Before first session: introduce yourself formally, review site protocols (check-in, parking, emergency contacts), confirm lesson location, access routes, equipment storage, and pickup/drop-off procedures. During program: sign in at the front office every arrival — no exceptions. Notify school staff immediately of any incident. Respond to school communication within 24 hours. Never speak negatively about the school or its staff to parents. Never make verbal agreements that bypass the official program structure.`},
{h:'Parent Communication &amp; Difficult Conversations',b:`Pre-program parents must receive: program overview, session schedule, drop-off/pick-up instructions, coach contact via approved channel only, and safeguarding/photo consent. Progress language: instead of "She is behind the group" → "She is developing her putting feel and showing great focus." <strong>Difficult parent 4-step protocol:</strong> (1) Listen first — no interruptions. (2) Acknowledge — "I understand your concern and I appreciate you bringing this to me." (3) Clarify and explain using developmental reasoning. (4) Escalate when appropriate. Immediate HQ escalation required for: allegations of misconduct, refund demands, threats or aggressive behavior, safeguarding concerns.`},
]},
{id:'L1_M9',title:'Module 9 — Group Management',icon:'👥',sections:[
{h:'Authority Through Structure',b:`Authority is established through consistency, clarity, and calm confidence — not volume or dominance. <strong>5 Standard Commands</strong> — must be taught at the start with every new group: <em>FREEZE</em> — all movement stops, clubs on ground. <em>RESET</em> — return to starting position. <em>RETRIEVE</em> — walk to collect balls. <em>ROTATE</em> — move to next station. <em>EYES ON ME</em> — stop, look at coach. <strong>Opening routine (first 90 seconds):</strong> children behind line, coach greets by name, states session theme in one sentence, reviews one safety rule, warm-up game introduced immediately.`},
{h:'5-Step Behavior Management Ladder',b:`Always begin at Step 1: <strong>Step 1: Environmental Adjustment</strong> — fix the environment first (wait time? task difficulty? spacing?). Most disruption disappears. <strong>Step 2: Proximity &amp; Non-Verbal Cue</strong> — move closer, calm eye contact. <strong>Step 3: Private Verbal Redirect</strong> — crouch down, speak quietly: "Hey, I need you to [specific behavior]. You can do that." <strong>Step 4: Choice &amp; Consequence</strong> — "I need you to [behavior]. If you continue, you will take a 2-minute break. It's your choice." <strong>Step 5: Removal &amp; Documentation</strong> — supervised seated area, notify school staff, document within 24 hours. <strong>Physical restraint is NEVER permitted under any circumstance.</strong>`},
{h:'Transitions &amp; Bathroom Protocol',b:`<strong>Transitions are the highest risk moments.</strong> Protocol: FREEZE command before every transition, one clear instruction, count down out loud ("10... 5... 3... 2... 1... ROTATE"), walk only, verify all children at new station before resuming. Sloppy transitions cost 5–10 minutes and elevate injury risk significantly. <strong>Attention techniques:</strong> call-and-response ("Golf time!" → "Focus time!"), countdown method (calm — never as a threat), whisper technique (lower your voice — children quiet to hear). <strong>Bathroom:</strong> child requests to coach → coach notifies school staff → school staff member escorts. Coaches NEVER escort alone. If staff unavailable, pause session and consult EAP.`},
]},
{id:'L1_M10',title:'Module 10 — Medical &amp; Inclusion',icon:'❤️',sections:[
{h:'Legal Framework &amp; Pre-Program Screening',b:`EduGolfKids operates under federal law: <strong>ADA</strong> — reasonable accommodations required; coaches may not exclude a child solely on the basis of disability. <strong>Section 504</strong> — coaches must request and review any 504 Plan. <strong>Title IX</strong> — all sessions equally accessible regardless of gender. Before the first session, review registration for: documented medical conditions, physical limitations, behavioral diagnoses (ADHD, ASD, anxiety), sensory sensitivities, and IEP/504 status. Verify emergency medication location with school nurse. Coaches prepare and respond — they do not diagnose.`},
{h:'Medical Emergencies',b:`<strong>Asthma:</strong> Stop activity, sit child upright, retrieve inhaler (coach does NOT administer unless trained), call nurse, call 911 if worsening. <strong>Seizure:</strong> Do NOT restrain, clear space, do NOT put anything in the mouth, call 911 and nurse, time the seizure, recovery position after. <strong>Anaphylaxis:</strong> Call 911 immediately for any respiratory symptoms, locate EpiPen (school nurse administers), keep child calm and seated upright. <strong>Head Injury:</strong> Stop activity — ZERO-TOLERANCE concussion protocol. Child does NOT return that day. Notify nurse, contact parent same day, medical clearance required before return. RULE: If in doubt, sit them out. <strong>Heat above 100°F/38°C:</strong> session must move indoors or postpone.`},
{h:'Inclusive Coaching',b:`<strong>ADHD</strong> — adjustments: position child close to coach, one-step instructions, use child's name before instructions, privately warn before transitions, acknowledge small compliance immediately. ADHD behavior is neurological — not defiance. <strong>ASD</strong> — pre-inform child of session structure at start, avoid sudden routine changes, use literal concrete language, allow extra processing time, never force physical contact. <strong>Physical limitations</strong> — modify the task, not the child. Equipment modification (shorter club, larger target, seated station). Never draw attention to the limitation. <strong>Anxiety</strong> — allow observation before participation, reduce stakes of first attempts, check in privately. Confidentiality of special needs information is an absolute standard.`},
]},
{id:'L1_M11',title:'Module 11 — Field Safety',icon:'⛈️',sections:[
{h:'Weather Decision Framework',b:`Check weather minimum 2 hours before every outdoor session — no exceptions. <strong>3-Option Matrix: OPTION 1 — Proceed Outdoors:</strong> clear sky, no storm within 4 hours, manageable wind, safe temperature. <strong>OPTION 2 — Move Indoors:</strong> storm forecast within 4 hours, high wind, light rain, extreme heat. Use foam balls for modified indoor session. <strong>OPTION 3 — Postpone/Cancel:</strong> active thunderstorm, extreme weather event, no indoor space. Always reschedule — never simply cancel. A cancelled session without rescheduling is lost revenue and a broken commitment.`},
{h:'The 30/30 Lightning Rule',b:`<strong>Memorize this:</strong> If the time between lightning flash and thunder is 30 seconds or less — evacuate immediately (storm is within 6 miles). Do not resume until 30 minutes after the last flash or thunder. <strong>Evacuation protocol:</strong> STEP 1 — Three whistle blasts, calm firm voice: "Everyone stop. Clubs on the ground. Come to me now." STEP 2 — All clubs flat on ground. No child carries a club during evacuation — ever. STEP 3 — Move to substantial building (school preferred). NOT under trees, near fences, flagpoles, in dugouts, covered bleachers, or bus stops. STEP 4 — Count every child against session register. STEP 5 — Notify school contact and parents. STEP 6 — Wait the full 30 minutes. Reset clock if lightning occurs again. NEVER resume early because "it looks clear."`},
{h:'Heat, Wind, Rain &amp; Incidents',b:`<strong>Heat:</strong> 80–90°F — water break every 15 min. Above 90°F — consider moving indoors. Above 100°F — move indoors or postpone. <strong>Wind above 25mph</strong> — equipment becomes projectiles; no full swings outdoors. <strong>Rain:</strong> moderate to heavy → move indoors; wet surfaces → slipping risk, do not proceed outdoors. <strong>Head injury:</strong> stop activity, do NOT move child if neck/back injury suspected, call nurse. <strong>Incident documentation:</strong> every incident within 24 hours. Required fields: date, time, location, child's full name and age, nature of incident, witnesses, action taken, medical attention, parent notification time and method.`},
]},
],

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
  const shuffled = shuffleArray([...qs]).slice(0, Math.min(20, qs.length)).map(q => {
    const combined = q.o.map((opt,i)=>({ opt, correct: i===q.c }));
    const shuffledOpts = shuffleArray(combined);
    return { q:q.q, options:shuffledOpts.map(x=>x.opt), correct:shuffledOpts.findIndex(x=>x.correct) };
  });
  quizState = { level, questions:shuffled, currentQ:0, answers:[], answered:false };
  safeSet('quiz-title', CERT_LEVELS[level]?.fullLabel || 'Assessment');
  safeSet('quiz-subtitle', `${shuffled.length} questions · 85% required to pass · Questions and answers are randomized`);
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

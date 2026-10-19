// Jonathan Coaching – Kunden-App und Coach-Bereich, Daten in Supabase
const SUPABASE_URL = 'https://mbkvtrlceawgogrixacu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_L0ufxjSMG6pnl8U1nZWu5g_g4p0Tqql';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const DAYS = ['mo','di','mi','do','fr','sa','so'];
const DAYNAMES = {mo:'Montag',di:'Dienstag',mi:'Mittwoch',do:'Donnerstag',fr:'Freitag',sa:'Samstag',so:'Sonntag'};
const KINDS = {ems:'EMS',ausdauer:'Ausdauer',kraft:'Kraft',mobility:'Beweglichkeit',alltag:'Gewohnheit'};
const TYPES = ['tenless-Mitglied','Personal Training','Online-Coaching'];
const MEASURES = [['weight','Gewicht','kg'],['body_fat','Körperfett','%'],['chest','Brust','cm'],['arm','Oberarm','cm'],['waist','Taille','cm'],['hip','Hüfte','cm'],['thigh','Oberschenkel','cm']];
const LOWER_IS_BETTER = ['weight','body_fat','waist','hip'];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => n == null ? '–' : String(Math.round(n*10)/10).replace('.', ',');
const iso = d => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0,10); };
const dayIdx = d => (new Date(d).getDay() + 6) % 7;
const dayKey = d => DAYS[dayIdx(d)];
const addDays = (d,n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const today = () => { const t = new Date(); t.setHours(12,0,0,0); return t; };
const parseNum = v => { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
const gender = () => (C && C.p && C.p.gender) || 'm';
// Übung vormachen: Foto-Überblendung, wenn vorhanden (passende Figur, sonst die andere), sonst animiertes Männchen
function exMedia(e, lv){
  // Reihenfolge: passende echte Fotos (m/w) → 3D-Avatar (a) → andere Figur
  const have = PHOTOS[e.id] || [], g = have.includes(gender()) ? gender() : have.includes('a') ? 'a' : have[0];
  if (!g) return ANIM.svg(e.anim, lv, gender());
  const src = n => `img/ex/${e.id}_${g}_${n}.jpg?v=1`;
  return `<div class="photoanim" role="img" aria-label="${esc(e.name)} vorgemacht"><img src="${src(1)}" alt="" decoding="async"><img class="b" src="${src(2)}" alt="" decoding="async"></div>`;
}
const shortDate = d => new Date(d+'T12:00').toLocaleDateString('de-DE',{day:'numeric',month:'numeric'});

let session = null, me = null;       // me = eigenes Profil
let C = null;                        // geladener Kunde
let roster = [];                     // Coach: alle Kunden mit Daten
let codes = [];                      // Coach: Einladungscodes
let tab = 'heute', coachSel = null, coachEx = null, authMode = 'login', authMsg = '', busy = false;
let exFilter = 'alle', muscleSel = null, preview = false;
let OV = null;                       // offenes Vollbild: {type:'ex', id} | {type:'workout', …} | {type:'summary', …}
let timer = null;                    // {mode:'rest'|'work', end, total, onDone}

function toast(m){ const t = document.getElementById('toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, 2400); }
function fail(e){ console.error(e); toast('Das hat nicht geklappt. Bitte prüf deine Internetverbindung.'); }

// ---------- Daten laden ----------
function shape(profile, items, checkins, extras, measures, body, checks = []){
  const plan = {}; DAYS.forEach(k => plan[k] = []);
  items.forEach(t => plan[DAYS[t.weekday]].push({id:t.id, title:t.title, kind:t.kind, min:t.minutes, note:t.note, exercises: Array.isArray(t.exercises) ? t.exercises : []}));
  const done = {}; checkins.forEach(c => (done[c.day] ||= []).push(c.item_id));
  const workouts = checkins.filter(c => c.details).length + extras.filter(x => x.details).length;
  const ex = {}; extras.forEach(x => (ex[x.day] ||= []).push({id:x.id, title:x.title, min:x.minutes}));
  // Verlauf aller Trainings mit Sätzen (für „Letztes Mal“, Rekorde und Rückmeldungen)
  const history = [];
  checkins.forEach(ch => { if (ch.details) { const it = items.find(t => t.id === ch.item_id); history.push({day: ch.day, title: it ? it.title : 'Training', details: ch.details, item: ch.item_id}); } });
  extras.forEach(x => { if (x.details) history.push({day: x.day, title: x.title, details: x.details, extra: x.id}); });
  history.sort((a, b) => a.day < b.day ? -1 : a.day > b.day ? 1 : 0);
  const ck = {tag: {}, woche: {}}; checks.forEach(x => { if (ck[x.kind]) ck[x.kind][x.day] = x.data || {}; });
  return { p: profile, plan, done, extras: ex, workouts, history, checks: ck,
    body: body.sort((a,b) => a.day < b.day ? -1 : 1),
    goal: { title: profile.goal_title, unit: profile.goal_unit, start: profile.goal_start == null ? null : +profile.goal_start,
            target: profile.goal_target == null ? null : +profile.goal_target,
            history: measures.sort((a,b) => a.day < b.day ? -1 : 1).map(m => ({date:m.day, value:+m.value})) } };
}
async function q(promise){ const { data, error } = await promise; if (error) throw error; return data; }
// Tages-/Wochen-Checks: falls die Tabelle (noch) fehlt, läuft die App ohne sie weiter
const safe = promise => q(promise).catch(e => { console.warn('checks', e); return []; });
async function loadClient(id){
  const since = iso(addDays(today(), -90));
  const [profile, items, checkins, extras, measures, body, checks] = await Promise.all([
    q(sb.from('profiles').select('*').eq('id', id).single()),
    q(sb.from('plan_items').select('*').eq('client_id', id).order('created_at')),
    q(sb.from('checkins').select('item_id,day,details').eq('client_id', id).gte('day', since)),
    q(sb.from('extras').select('*').eq('client_id', id).gte('day', since)),
    q(sb.from('measurements').select('*').eq('client_id', id)),
    q(sb.from('body_measures').select('*').eq('client_id', id)),
    safe(sb.from('checks').select('kind,day,data').eq('client_id', id).gte('day', since))]);
  return shape(profile, items, checkins, extras, measures, body, checks);
}
async function loadRoster(){
  const since = iso(addDays(today(), -60));
  const [profiles, items, checkins, extras, measures, body, checks] = await Promise.all([
    q(sb.from('profiles').select('*').neq('role','coach').order('created_at')),
    q(sb.from('plan_items').select('*').order('created_at')),
    q(sb.from('checkins').select('client_id,item_id,day,details').gte('day', since)),
    q(sb.from('extras').select('*').gte('day', since)),
    q(sb.from('measurements').select('*')),
    q(sb.from('body_measures').select('*')),
    safe(sb.from('checks').select('client_id,kind,day,data').gte('day', since))]);
  const by = (arr, id) => arr.filter(x => x.client_id === id);
  roster = profiles.map(p => shape(p, by(items,p.id), by(checkins,p.id), by(extras,p.id), by(measures,p.id), by(body,p.id), by(checks,p.id)));
  roster.sort((a, b) => AMPEL_ORDER[ampel(a).lvl] - AMPEL_ORDER[ampel(b).lvl]);
}

// ---------- Berechnungen ----------
function weekDates(){ const t = today(); const mon = addDays(t, -dayIdx(t)); return DAYS.map((k,i) => addDays(mon, i)); }
function dayStatus(c, d){ const items = c.plan[dayKey(d)] || []; const done = (c.done[iso(d)] || []).filter(id => items.some(t => t.id === id)); return {total:items.length, done:done.length}; }
function weekMinutes(c){ let m = 0; for (const d of weekDates()){ if (d > today()) continue; const items = c.plan[dayKey(d)] || [], done = c.done[iso(d)] || []; items.forEach(t => { if (done.includes(t.id)) m += t.min || 0; }); (c.extras[iso(d)] || []).forEach(x => m += x.min || 0); } return m; }
function weekRate(c){ let t = 0, d = 0; for (const x of weekDates()){ if (x > today()) continue; const s = dayStatus(c,x); t += s.total; d += s.done; } return t ? Math.round(d/t*100) : 0; }
function streak(c){ let n = 0; for (let i = 0; i < 90; i++){ const d = addDays(today(), -i); const s = dayStatus(c,d); const ex = (c.extras[iso(d)] || []).length; if (s.total === 0 && !ex) continue; if (s.done > 0 || ex) n++; else { if (i === 0) continue; break; } } return n; }
function goalPct(c){ const g = c.goal; if (g.start == null || g.target == null || g.start === g.target) return {cur:null, pct:0}; const cur = g.history.length ? g.history[g.history.length-1].value : g.start; const p = (cur - g.start) / (g.target - g.start); return {cur, pct: Math.max(0, Math.min(100, Math.round(p*100)))}; }
function countDone(c, kind){ let n = 0; for (const date in c.done){ const items = c.plan[dayKey(date+'T12:00')] || []; c.done[date].forEach(id => { const t = items.find(t => t.id === id); if (t && (!kind || t.kind === kind)) n++; }); } return n; }
function fullWeeks(c){ let n = 0; for (let w = 0; w < 8; w++){ let ok = true, any = false; const mon = addDays(today(), -dayIdx(today()) - 7*(w+1)); for (let i = 0; i < 7; i++){ const s = dayStatus(c, addDays(mon,i)); if (s.total){ any = true; if (s.done < s.total) ok = false; } } if (any && ok) n++; } return n; }
function exHistory(c, exId){ const out = []; for (const h of c.history || []) for (const st of (h.details.sets || [])) if (st.ex === exId && st.done) out.push({day: h.day, kg: (st.kg || []).map(parseNum).filter(v => v != null), reps: st.reps, done: st.done}); return out; }
function lastFor(c, exId){ const h = exHistory(c, exId); return h.length ? h[h.length - 1] : null; }
function bestKg(c, exId){ return Math.max(0, ...exHistory(c, exId).flatMap(x => x.kg)); }
// Wochen-Serie: zählt Wochen mit erreichtem Wochenziel; pro Monat rettet ein Joker eine schwache Woche
function weekGoal(c){ const n = DAYS.reduce((a, k) => a + c.plan[k].length, 0); return Math.max(1, Math.min(3, n || 2)); }
function weekCount(c, mon){ let n = 0; for (let i = 0; i < 7; i++){ const d = addDays(mon, i); n += dayStatus(c, d).done + (c.extras[iso(d)] || []).length; } return n; }
function weekStreak(c){
  const goal = weekGoal(c), mon0 = addDays(today(), -dayIdx(today())), used = {};
  const thisWeek = weekCount(c, mon0); let n = thisWeek >= goal ? 1 : 0;
  for (let w = 1; w <= 12; w++){
    const mon = addDays(mon0, -7*w), mk = iso(mon).slice(0, 7);
    if (weekCount(c, mon) >= goal) { n++; continue; }
    if (n > 0 && !used[mk] && weekCount(c, addDays(mon, -7)) >= goal) { used[mk] = true; continue; }
    break;
  }
  return {n, goal, thisWeek, jokerLeft: !used[iso(today()).slice(0, 7)]};
}
// Feier-Moment: kurzes rotes Konfetti (nicht bei „Bewegung reduzieren“)
function celebrate(){
  if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti'; document.body.appendChild(cv);
  const W = cv.width = innerWidth * devicePixelRatio, H = cv.height = innerHeight * devicePixelRatio, ctx = cv.getContext('2d');
  const cols = ['#E0283A', '#FF5A66', '#7A0012', '#FFFFFF', '#FFB3BA'];
  const ps = Array.from({length: 110}, () => ({x: W/2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 26, vy: -Math.random() * 30 - 8, r: (Math.random() * 6 + 4) * devicePixelRatio, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6, s: Math.random() * .3 - .15}));
  const t0 = performance.now();
  (function f(t){ const k = (t - t0) / 1800; ctx.clearRect(0, 0, W, H); ps.forEach(p => { p.vy += 1.1; p.x += p.vx; p.y += p.vy; p.vx *= .985; p.a += p.s; ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r/2, -p.r/4, p.r, p.r/2); ctx.restore(); }); if (k < 1) requestAnimationFrame(f); else cv.remove(); })(t0);
}
const MOODS = [['top','💪','Top'],['gut','🙂','Gut'],['ok','😐','Okay'],['muede','😮‍💨','Müde'],['schmerz','🤕','Schmerz']];
const moodOf = k => (MOODS.find(m => m[0] === k) || [])[1] || '';
// Übungen einer Einheit: eingetragene oder aus dem Titel erraten (EMS, Spaziergang, Rad …)
function guessEx(t){ const s = t.title.toLowerCase(); if (t.kind === 'ems' || s.includes('ems')) return 'ems'; if (s.includes('nordic')) return 'nordic'; if (s.includes('spazier') || s.includes('schritte') || s.includes('walk')) return 'spaziergang'; if (s.includes('rad')) return 'radfahren'; if (s.includes('treppe')) return 'treppen'; return null; }
function itemMuscles(t){ if (t.exercises.length) return muscleLevels(t.exercises); const g = guessEx(t); return g ? muscleLevels([g]) : {}; }
function mergeLevels(list){ const out = {}; list.forEach(lv => { for (const k in lv) out[k] = Math.max(out[k] || 0, lv[k]); }); return out; }
function latestBody(c){ const v = {}, first = {}; for (const r of c.body) for (const [k] of MEASURES) if (r[k] != null) { if (first[k] == null) first[k] = +r[k]; v[k] = +r[k]; } return {v, first}; }

// ---------- Bausteine ----------
function ring(pct, size=96){ const r = size/2-9, C2 = 2*Math.PI*r; return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${pct} Prozent erledigt"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="10"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C2*pct/100} ${C2}" transform="rotate(-90 ${size/2} ${size/2})"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="${size/4.4}">${pct}%</text></svg>`; }
function head(c, title, label){ return `<div class="top"><div style="min-width:0"><div class="label">${esc(label || c.p.type_label)}</div><h1>${title ? esc(title) : 'Hallo ' + esc(c.p.name || 'du')}</h1></div><button class="avatar" data-act="menu" aria-label="Profil und Abmelden">${esc((c.p.name||'?')[0].toUpperCase())}</button></div>`; }
// Drei Aktivitätsringe wie bei der Apple Watch: heute erledigt, Minuten der Woche, aktive Tage
function rings3(vals, size = 132){
  const cols = ['var(--ring1)','var(--ring2)','var(--ring3)'], w = 15, gap = 3;
  return `<svg class="rings" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Aktivitätsringe">${vals.map((v, i) => { const r = size/2 - w/2 - i*(w+gap), C2 = 2*Math.PI*r, p = Math.max(0, Math.min(1, v)); return `<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${cols[i]}" stroke-opacity=".22" stroke-width="${w}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${cols[i]}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${(C2*p).toFixed(1)} ${C2.toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})"/>`; }).join('')}</svg>`;
}
// Tageskarte: drei schräge Tempo-Balken im Stil des MX-Logos
function tempoBars(pct, min, days){
  const bar = (l, v, unit, frac) => `<div class="tk-bar"><div class="lbl"><span>${l}</span><span><b class="tk-num">${v}</b> ${unit}</span></div><div class="tk-track" role="progressbar" aria-label="${l}" aria-valuenow="${Math.round(Math.min(1, frac)*100)}" aria-valuemin="0" aria-valuemax="100"><div class="tk-fill" style="width:${Math.max(3, Math.min(100, frac*100))}%"></div></div></div>`;
  return `<div class="tk-bars">${bar('Heute erledigt', pct, '%', pct/100)}${bar('Bewegung diese Woche', min, '/ 150 Min', min/150)}${bar('Aktive Tage', days, '/ 7', days/7)}</div>`;
}
function activeDays(c){ return weekDates().filter(d => d <= today() && (dayStatus(c, d).done > 0 || (c.extras[iso(d)] || []).length)).length; }
function strip(c){
  const T = today();
  return `<div class="strip">${weekDates().map(d => { const s = dayStatus(c,d); const cls = [iso(d) === iso(T) ? 'today' : '', d > T ? '' : s.total && s.done === s.total ? 'full' : s.done ? 'part' : '', s.total ? '' : 'rest'].join(' '); return `<div class="sd ${cls}">${DAYNAMES[dayKey(d)].slice(0,2)}<i>${d.getDate()}</i></div>`; }).join('')}</div>`;
}
function taskBtn(t, isDone){
  const hasEx = t.exercises.length > 0;
  return `<button class="task ${isDone?'is-done':''}" data-act="${hasEx ? 'openitem' : 'toggle'}" data-id="${t.id}" aria-pressed="${isDone}"><span class="box"></span><span class="t-body"><span class="t-title">${esc(t.title)}</span><span class="row" style="gap:6px;margin-top:4px;flex-wrap:wrap"><span class="chip ${t.kind}">${KINDS[t.kind]}</span>${t.min?`<span class="chip">${t.min} Min</span>`:''}${hasEx?`<span class="chip">${t.exercises.length} Übungen</span>`:''}${t.note?`<span class="small muted">${esc(t.note)}</span>`:''}</span></span>${hasEx && !isDone ? '<span class="go">Start</span>' : ''}</button>`;
}
function muscleChips(lv){ const hot = Object.keys(lv).filter(k => lv[k] >= 1), warm = Object.keys(lv).filter(k => lv[k] < 1); return `<div class="musclelist">${hot.map(k => `<span class="chip kraft">${BODY.NAMES[k]}</span>`).join('')}${warm.map(k => `<span class="chip">${BODY.NAMES[k]}</span>`).join('')}</div>`; }
function routineCard(r){ const cover = COVERS.includes(r.id); return `<div class="routine${cover ? ' cover' : ''}">${cover ? `<img class="coverimg" src="img/prog/${r.id}.jpg?v=1" alt="" decoding="async">` : `<div class="mini">${BODY.pair(muscleLevels(r.items.map(i => i[0])))}</div>`}<div class="label" style="color:#FF8A95">${r.min} Min · ${r.items.length} Übungen</div><h2>${esc(r.name)}</h2><div class="small muted">${esc(r.info)}</div><button class="btn" data-act="startroutine" data-id="${r.id}">Starten</button></div>`; }

// ---------- Ansichten Kunde ----------
// „Als Nächstes“: ein klarer nächster Schritt ganz oben
function nextCard(c){
  const T = today(), items = c.plan[dayKey(T)] || [], done = c.done[iso(T)] || [], open = items.filter(t => !done.includes(t.id));
  if (DAYS.every(k => !c.plan[k].length)) return `<div class="nextcard"><div class="nc-icon">⏳</div><div class="nc-body"><div class="label" style="color:var(--tint)">Gleich geht's los</div><h2>Jonathan erstellt deinen Plan</h2><div class="small muted">Bis dahin: Starte ein Programm unter „Übungen“.</div><button class="btn" data-tab="uebungen">Programme ansehen</button></div></div>`;
  if (open.length) {
    const t = open[0], f = t.exercises[0] ? EXMAP[t.exercises[0].ex] : (guessEx(t) ? EXMAP[guessEx(t)] : null), hasEx = t.exercises.length > 0;
    return `<div class="nextcard"><div class="nc-media">${f ? exMedia(f, itemMuscles(t)) : ''}</div><div class="nc-body"><div class="label" style="color:var(--tint)">Als Nächstes</div><h2>${esc(t.title)}</h2><div class="row" style="gap:6px;flex-wrap:wrap"><span class="chip ${t.kind}">${KINDS[t.kind]}</span>${t.min ? `<span class="chip">${t.min} Min</span>` : ''}${hasEx ? `<span class="chip">${t.exercises.length} Übungen</span>` : ''}</div><button class="btn" data-act="${hasEx ? 'openitem' : 'toggle'}" data-id="${t.id}">${hasEx ? 'Training starten' : 'Erledigt abhaken'}</button></div></div>`;
  }
  if (items.length) return `<div class="nextcard done"><div class="nc-icon ok">✓</div><div class="nc-body"><div class="label" style="color:var(--done)">Tagesziel geschafft</div><h2>Stark, alles erledigt!</h2><div class="small muted">Erholung gehört dazu. Lust auf mehr? Unten wartet ein Programm.</div></div></div>`;
  for (let i = 1; i <= 7; i++){ const d = addDays(T, i), it = c.plan[dayKey(d)] || []; if (it.length) return `<div class="nextcard"><div class="nc-icon">🌙</div><div class="nc-body"><div class="label" style="color:var(--tint)">Heute Ruhetag</div><h2>${i === 1 ? 'Morgen' : DAYNAMES[dayKey(d)]}: ${esc(it[0].title)}</h2><div class="small muted">Erholung macht dich stärker. Ein lockerer Spaziergang tut trotzdem gut.</div><button class="btn ghost" data-tab="woche">Woche ansehen</button></div></div>`; }
  return '';
}
function streakLine(c){
  const w = weekStreak(c);
  return `<div class="streakline"><span class="flame" aria-hidden="true"></span><span><b class="tk-num">${w.n}</b> ${w.n === 1 ? 'Woche' : 'Wochen'} in Folge</span><span class="muted">· diese Woche ${Math.min(w.thisWeek, 99)}/${w.goal}</span><span class="joker ${w.jokerLeft ? '' : 'used'}" title="Ein Joker pro Monat rettet eine schwache Woche">${w.jokerLeft ? '🃏 Joker bereit' : '🃏 Joker genutzt'}</span></div>`;
}
// ---------- Tages-Check, Wochen-Check-in, Coach-Ampel ----------
const DC_Q = [['schlaf','Schlaf',['😫','😕','😐','🙂','😴'],'schlecht','super'],['energie','Energie',['🪫','😮‍💨','😐','🙂','⚡'],'leer','voll'],['stress','Stress',['😌','🙂','😐','😟','🤯'],'entspannt','sehr hoch']];
let dcOpen = false;
const monIso = d => iso(addDays(d, -dayIdx(d)));
function dayCheck(c){ return c.checks.tag[iso(today())] || {}; }
function dcDone(d){ return DC_Q.every(([k]) => d[k]); }
function dailyCheck(c){
  const d = dayCheck(c), w = d.wasser || 0, wg = waterGoal(c);
  if (dcDone(d) && !dcOpen) return `<button class="card dcsum" data-act="dcopen"><span class="dcok">✓</span><span style="min-width:0;flex:1"><b>Tages-Check erledigt</b><span class="small muted" style="display:block">${DC_Q.map(([k, l, em]) => `${l} ${em[d[k]-1]}`).join(' · ')} · ${w} ${w === 1 ? 'Glas' : 'Gläser'}${d.schritte ? ' · ' + d.schritte.toLocaleString('de-DE') + ' Schritte' : ''}</span></span><span class="small muted">Ändern</span></button>`;
  return `<div class="card stack dc"><div class="row between"><div class="label">Tages-Check</div><span class="small muted">20 Sekunden</span></div>
   ${DC_Q.map(([k, l, em, lo, hi]) => `<div class="dcq"><div class="row between"><b>${l}</b><span class="small muted">${lo} → ${hi}</span></div><div class="dcb">${em.map((e, i) => `<button class="moodb${d[k] === i+1 ? ' on' : ''}" data-act="dc" data-id="${k}-${i+1}" aria-pressed="${d[k] === i+1}" aria-label="${l} ${i+1} von 5"><span>${e}</span></button>`).join('')}</div></div>`).join('')}
   <div class="row between dcq"><div><b>Wasser</b><div class="small muted">${(w*0.25).toLocaleString('de-DE')} von ${(wg*0.25).toLocaleString('de-DE')} Litern</div></div><div class="row" style="gap:8px"><button class="stepb" data-act="dcwater" data-id="-1" aria-label="Ein Glas weniger">−</button><span class="tk-num" style="font-size:1.4rem;min-width:28px;text-align:center">${w}</span><button class="stepb" data-act="dcwater" data-id="1" aria-label="Ein Glas mehr">+</button></div></div>
   <div class="glasses" aria-hidden="true">${Array.from({length: wg}, (_, i) => `<i class="${i < w ? 'on' : ''}"></i>`).join('')}</div>
   <label class="field"><span class="small muted">Schritte heute (optional)</span><input id="dcSteps" type="number" inputmode="numeric" min="0" max="100000" value="${d.schritte || ''}" placeholder="z. B. 8000"></label>
   ${dcDone(d) ? '<button class="btn" data-act="dcclose">Fertig</button>' : ''}</div>`;
}
async function saveDayCheck(data){
  const k = iso(today()); C.checks.tag[k] = data;
  await q(sb.from('checks').upsert({client_id: me.id, kind: 'tag', day: k, data, updated_at: new Date().toISOString()}, {onConflict: 'client_id,kind,day'}));
}
// Wochen-Check-in: Fr–So für die laufende Woche
function weekCheckDue(c){ return dayIdx(today()) >= 4 && !c.checks.woche[monIso(today())]; }
function weekFacts(c){
  const mon = addDays(today(), -dayIdx(today())), dcs = weekDates().map(d => c.checks.tag[iso(d)]).filter(Boolean);
  const avg = k => { const v = dcs.map(x => x[k]).filter(Boolean); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10 : null; };
  return {einheiten: weekCount(c, mon), minuten: weekMinutes(c), tage: activeDays(c), schlaf: avg('schlaf'), energie: avg('energie'), stress: avg('stress')};
}
function weekCheckCard(c){
  if (weekCheckDue(c)) { const f = weekFacts(c); return `<div class="card hi stack weekcard"><div class="label" style="color:var(--tint)">Wochen-Check-in · 1 Minute</div><h2 style="margin:0">Wie war deine Woche?</h2><div class="small muted">${f.einheiten} Einheiten · ${f.minuten} Min · ${f.tage} aktive Tage. Jonathan schaut sich deine Antworten an und plant danach die nächste Woche.</div><button class="btn" data-act="wkopen">Check-in starten</button></div>`; }
  const last = c.checks.woche[monIso(addDays(today(), -7))], cur = c.checks.woche[monIso(today())], v = (cur || last || {}).vorsatz;
  if (cur) return `<div class="card row" style="gap:12px"><span class="dcok">✓</span><div style="min-width:0"><b>Wochen-Check-in gesendet</b><div class="small muted">${v ? 'Dein Vorsatz: „' + esc(v) + '“' : 'Danke! Jonathan meldet sich.'}</div></div></div>`;
  return v ? `<div class="card row" style="gap:12px"><span class="avatar" style="flex:0 0 auto">🎯</span><div style="min-width:0"><div class="label">Dein Vorsatz diese Woche</div><div>${esc(v)}</div></div></div>` : '';
}
function viewWeekCheck(){
  const W = OV, f = weekFacts(C), t = (id, l, ph) => `<label class="field"><span class="small muted">${l}</span><textarea data-wk="${id}" rows="2" maxlength="300" placeholder="${ph}">${esc(W.data[id] || '')}</textarea></label>`;
  return `<div class="wrap stack" style="padding-top:28px"><div class="row between"><div class="label" style="color:var(--tint)">Wochen-Check-in</div><button class="btn link" data-act="closeov">Später</button></div><h1>Deine Woche</h1>
  <div class="stats"><div class="stat"><b>${f.einheiten}</b><span class="small muted">Einheiten</span></div><div class="stat"><b>${f.minuten}</b><span class="small muted">Minuten</span></div><div class="stat"><b>${f.tage}/7</b><span class="small muted">aktive Tage</span></div></div>
  ${f.schlaf != null ? `<div class="small muted">Laut deinem Tages-Check: Schlaf ${fmt(f.schlaf)}/5 · Energie ${fmt(f.energie)}/5 · Stress ${fmt(f.stress)}/5</div>` : ''}
  <div class="card stack"><div class="label">Wie zufrieden bist du mit deiner Woche?</div><div class="small muted">1 = gar nicht, 10 = rundum zufrieden</div>
   <div class="rpe">${Array.from({length: 10}, (_, n) => `<button class="rpeb${W.data.zufrieden === n+1 ? ' on' : ''}" data-act="wkrate" data-id="${n+1}" aria-pressed="${W.data.zufrieden === n+1}">${n+1}</button>`).join('')}</div></div>
  <div class="card stack">${t('gut', 'Was lief richtig gut?', 'z. B. 3× trainiert trotz Stress')}${t('schwer', 'Was war schwierig?', 'z. B. abends keine Energie')}${t('vorsatz', 'Dein Vorsatz für nächste Woche', 'z. B. jeden Tag 8000 Schritte')}${t('wunsch', 'Frage oder Wunsch an Jonathan (optional)', 'z. B. mehr Übungen für den Rücken')}</div>
  <button class="btn" data-act="wksave">Check-in senden</button></div>`;
}
async function saveWeekCheck(){
  const W = OV; if (!W.data.zufrieden) { toast('Tipp kurz an, wie zufrieden du bist.'); return; }
  const f = weekFacts(C), data = {...W.data, einheiten: f.einheiten, minuten: f.minuten, tage: f.tage};
  ['gut','schwer','vorsatz','wunsch'].forEach(k => data[k] = String(data[k] || '').trim().slice(0, 300));
  const k = monIso(today());
  await q(sb.from('checks').upsert({client_id: me.id, kind: 'woche', day: k, data, updated_at: new Date().toISOString()}, {onConflict: 'client_id,kind,day'}));
  C.checks.woche[k] = data; closeOverlay(); render(); celebrate(); toast('Danke! Jonathan sieht deinen Check-in.');
}
// Coach-Ampel: rot = braucht dich jetzt, gelb = im Blick behalten, grün = läuft
const AMPEL_ORDER = {rot: 0, gelb: 1, gruen: 2};
function lastActive(c){
  let last = null;
  for (const k in c.done) if (c.done[k].length && (!last || k > last)) last = k;
  for (const k in c.extras) if (c.extras[k].length && (!last || k > last)) last = k;
  return last;
}
function ampel(c){
  const red = [], yellow = [], T = today(), hasPlan = DAYS.some(k => c.plan[k].length);
  const la = lastActive(c), since = Math.round((T - new Date((la || String(c.p.created_at || '').slice(0, 10) || iso(T)) + 'T12:00')) / 864e5);
  if (hasPlan && since >= 5) red.push(la ? `seit ${since} Tagen nichts gemacht` : 'noch nichts abgehakt');
  else if (hasPlan && since >= 3) yellow.push(`seit ${since} Tagen nichts gemacht`);
  const pain = (c.history || []).find(h => h.details.feel && h.details.feel.mood === 'schmerz' && h.day >= iso(addDays(T, -7)));
  if (pain) red.push('meldet Schmerzen');
  const wk = c.checks.woche[monIso(T)] || c.checks.woche[monIso(addDays(T, -7))];
  if (wk && wk.zufrieden && wk.zufrieden <= 4) red.push(`Woche nur ${wk.zufrieden}/10`);
  if (wk && wk.wunsch) yellow.push('hat eine Frage an dich');
  const tags = Object.keys(c.checks.tag).sort().slice(-3).filter(k => k >= iso(addDays(T, -4))).map(k => c.checks.tag[k]);
  if (tags.length >= 2) {
    const avg = k => tags.reduce((a, x) => a + (x[k] || 3), 0) / tags.length;
    if (avg('energie') <= 2) yellow.push('wenig Energie');
    if (avg('stress') >= 4) yellow.push('viel Stress');
    if (avg('schlaf') <= 2) yellow.push('schläft schlecht');
  }
  if (!hasPlan) yellow.push('noch kein Plan');
  if (dayIdx(T) === 0 && hasPlan && !c.checks.woche[monIso(addDays(T, -7))]) yellow.push('Wochen-Check-in fehlt');
  return red.length ? {lvl: 'rot', why: [...red, ...yellow]} : yellow.length ? {lvl: 'gelb', why: yellow} : {lvl: 'gruen', why: ['läuft']};
}
function coachChecks(c){
  const weeks = Object.keys(c.checks.woche).sort().reverse().slice(0, 2);
  const lastDays = Object.keys(c.checks.tag).sort().reverse().slice(0, 7);
  if (!weeks.length && !lastDays.length) return `<div class="card stack" style="gap:6px"><div class="label">Check-ins</div><span class="small muted">Noch kein Tages-Check und kein Wochen-Check-in.</span></div>`;
  return `<div class="card stack" style="gap:10px"><div class="label">Check-ins</div>
  ${weeks.map(k => { const w = c.checks.woche[k]; return `<div class="fb"><div class="row between"><b>Woche ab ${shortDate(k)}</b><span class="chip ${w.zufrieden <= 4 ? 'ems' : 'kraft'}">${w.zufrieden}/10 zufrieden</span></div><div class="small muted">${w.einheiten ?? '–'} Einheiten · ${w.minuten ?? '–'} Min · ${w.tage ?? '–'} aktive Tage</div>${[['gut','Lief gut'],['schwer','Schwierig'],['vorsatz','Vorsatz'],['wunsch','Frage an dich']].filter(([q]) => w[q]).map(([q, l]) => `<div class="small"><b>${l}:</b> ${esc(w[q])}</div>`).join('')}</div>`; }).join('<hr class="sep">')}
  ${lastDays.length ? `${weeks.length ? '<hr class="sep">' : ''}<div class="small muted">Tages-Check (letzte ${lastDays.length})</div><div class="dctable"><span></span><span>Schlaf</span><span>Energie</span><span>Stress</span><span>Wasser</span><span>Eiweiß</span><span>Schritte</span>${lastDays.map(k => { const d = c.checks.tag[k]; return `<span>${shortDate(k)}</span>${DC_Q.map(([q, , em]) => `<span>${d[q] ? em[d[q]-1] : '–'}</span>`).join('')}<span>${d.wasser || 0}</span><span>${d.essen && d.essen.length ? eatenOf(d) + ' g' : '–'}</span><span>${d.schritte ? (d.schritte/1000).toLocaleString('de-DE', {maximumFractionDigits: 1}) + 'k' : '–'}</span>`; }).join('')}</div>` : ''}</div>`;
}
// ---------- Essen: Eiweiß, Wasser, Rezepte, rund ums Training ----------
let recipeTag = 'alle';
// Bezugsgewicht: Zielgewicht, falls niedriger (übliche Praxis bei Übergewicht), sonst aktuelles Gewicht
function refWeight(c){
  const w = latestBody(c).v.weight || (c.p.goal_unit === 'kg' && c.p.goal_start != null ? +c.p.goal_start : null);
  const t = c.p.goal_unit === 'kg' && c.p.goal_target != null ? +c.p.goal_target : null;
  if (w && t && t < w) return {kg: t, src: 'ziel'};
  return w ? {kg: w, src: 'gewicht'} : {kg: c.p.gender === 'w' ? 65 : 80, src: 'schaetzung'};
}
// 1,6 g/kg (Morton 2018), Spanne 1,2–2,0 g/kg (Jäger 2017, PROT-AGE), pro Mahlzeit 0,4 g/kg (Schoenfeld & Aragon 2018)
function proteinGoal(c){ const {kg, src} = refWeight(c), r5 = x => Math.round(x / 5) * 5; return {g: r5(kg * 1.6), lo: r5(kg * 1.2), hi: r5(kg * 2.0), meal: r5(kg * 0.4), kg, src}; }
// Trinken: EFSA (Männer 2,5 l / Frauen 2,0 l Gesamtwasser, ~80 % aus Getränken) + 0,5 l an Trainingstagen
function waterGoal(c, d = today()){ return (c.p.gender === 'w' ? 7 : 8) + ((c.plan[dayKey(d)] || []).length ? 2 : 0); }
function eatenOf(d){ return (d.essen || []).reduce((a, x) => a + (+x.g || 0), 0); }
const liters = n => (n * 0.25).toLocaleString('de-DE');
function recipeCard(r){ return `<button class="rcard" data-act="openrecipe" data-id="${r.id}"><img src="${UNSPLASH(r.img, 600, 380)}" alt="${esc(r.name)}" decoding="async"><span class="rtxt"><b>${esc(r.name)}</b><span class="small muted">${r.p} g Eiweiß · ${r.kcal} kcal · ${r.min} Min</span></span></button>`; }
function viewEssen(c){
  const T = today(), d = dayCheck(c), list = d.essen || [], eaten = eatenOf(d), pg = proteinGoal(c), wg = waterGoal(c), w = d.wasser || 0;
  const train = c.plan[dayKey(T)] || [], rest = Math.max(0, pg.g - eaten);
  const sugg = rest > 0 ? [...RECIPES].filter(r => r.p >= 15).sort((a, b) => Math.abs(a.p - rest) - Math.abs(b.p - rest))[0] : null;
  const bar = (l, v, unit, frac, cls) => `<div class="tk-bar"><div class="lbl"><span>${l}</span><span><b class="tk-num">${v}</b> ${unit}</span></div><div class="tk-track"><div class="tk-fill${cls ? ' ' + cls : ''}" style="width:${Math.max(3, Math.min(100, frac * 100))}%"></div></div></div>`;
  const recs = RECIPES.filter(r => recipeTag === 'alle' || r.tags.includes(recipeTag));
  return `${head(c, 'Essen', 'Eiweiß · Wasser · Rezepte')}<div class="stack">
  <div class="card stack" style="gap:14px">
   ${bar('Eiweiß heute', eaten, `/ ${pg.g} g`, eaten / pg.g)}
   ${bar('Wasser heute', liters(w), `/ ${liters(wg)} l`, w / wg, 'water')}
   <div class="row between"><span class="small muted">${w} von ${wg} Gläsern (0,25 l)${train.length ? ' · Trainingstag +0,5 l' : ''}</span><span class="row" style="gap:8px"><button class="stepb" data-act="dcwater" data-id="-1" aria-label="Ein Glas weniger">−</button><button class="stepb water" data-act="dcwater" data-id="1" aria-label="Ein Glas mehr">+ 💧</button></span></div>
   <div class="small">${eaten >= pg.g ? '<b>Eiweißziel geschafft.</b> Stark!' : `Noch <b>${rest} g</b> Eiweiß.${sugg ? ` Idee: <button class="btn link inline" data-act="openrecipe" data-id="${sugg.id}">${esc(sugg.name)} (${sugg.p} g)</button>` : ''}`}</div></div>

  <details class="card"><summary class="row between" style="cursor:pointer;min-height:28px"><b>Dein Ziel: ${pg.g} g Eiweiß am Tag</b><span class="small muted">Warum?</span></summary>
   <div class="stack" style="gap:8px;margin-top:10px"><div class="small">1,6 g pro kg ${pg.src === 'ziel' ? 'Zielgewicht' : 'Körpergewicht'} (${fmt(pg.kg)} kg). Sinnvolle Spanne: ${pg.lo}–${pg.hi} g. Am besten auf 3–4 Mahlzeiten mit je ca. <b>${pg.meal} g</b> verteilen.</div>
   ${pg.src === 'schaetzung' ? '<div class="small" style="color:var(--warm)">Noch geschätzt – trag unter „Körper“ dein Gewicht ein, dann wird dein Ziel genau.</div>' : ''}
   <div class="small muted">Ab 40 baut der Körper leichter Muskeln ab – genug Eiweiß und Krafttraining sind die beste Gegenstrategie.</div></div></details>

  ${train.length ? `<div class="card hi stack" style="gap:8px"><div class="label" style="color:var(--tint)">Heute ist Training</div><div><b>${esc(train.map(t => t.title).join(', '))}</b></div><div class="small muted">Vorher: Kohlenhydrate, z. B. Banane. Danach: 20–40 g Eiweiß. Unten bei „Rund ums Training“ steht, wie.</div><div class="row" style="gap:8px"><button class="btn ghost" style="flex:1;min-width:0" data-act="openrecipe" data-id="vorher_snack">🍌 Vorher</button><button class="btn ghost" style="flex:1;min-width:0" data-act="openrecipe" data-id="quark_banane">💪 Nachher</button></div></div>` : ''}

  <div class="section"><h2>Eiweiß eintragen</h2><span class="small muted">antippen = dazu</span></div>
  <div class="foodgrid">${FOODS.map(f => `<button class="food" data-act="eat" data-id="${f[0]}"><span class="fe" aria-hidden="true">${f[1]}</span><span class="fn"><b>${esc(f[2])}</b><span class="small muted">${esc(f[3])}</span></span><span class="fp">+${f[4]} g</span></button>`).join('')}</div>
  <form class="row" data-form="eatcustom" style="gap:8px"><input id="eatN" maxlength="40" placeholder="Eigenes, z. B. Joghurt" style="flex:1;min-width:0"><input id="eatG" type="number" inputmode="numeric" min="1" max="150" placeholder="g" required style="width:72px"><button class="btn">+</button></form>
  ${list.length ? `<div class="card stack" style="gap:6px"><div class="label">Heute gegessen</div>${list.map((x, i) => `<div class="row between"><span>${esc(x.n)}</span><span class="row" style="gap:10px"><b class="tk-num">${x.g} g</b><button class="btn link" style="color:var(--danger)" data-act="eatdel" data-id="${i}" aria-label="${esc(x.n)} entfernen">✕</button></span></div>`).join('')}</div>` : ''}

  <div class="section"><h2>Rezepte</h2><span class="small muted">${recs.length} Ideen</span></div>
  <div class="chips">${RTAGS.map(([k, l]) => `<button class="fchip${recipeTag === k ? ' on' : ''}" data-act="rtag" data-id="${k}" aria-pressed="${recipeTag === k}">${l}</button>`).join('')}</div>
  <div class="rgrid">${recs.map(recipeCard).join('')}</div>

  <div class="section"><h2>Rund ums Training</h2></div>
  <div class="card stack boost">${BOOST.map(b => `<div class="bt"><span class="bi" aria-hidden="true">${b.icon}</span><div style="min-width:0"><div class="label">${b.when}</div><b>${b.t}</b><div class="small">${b.s}</div>${b.r ? `<button class="btn link inline" data-act="openrecipe" data-id="${b.r}">Rezept: ${esc(RECIPES.find(r => r.id === b.r).name)}</button>` : ''}</div></div>`).join('')}</div>

  <p class="small muted" style="margin:0 4px">Allgemeine Infos für gesunde Erwachsene, keine medizinische Beratung. Bei Nierenerkrankungen, Schwangerschaft, Diabetes oder Medikamenten bitte vorher mit dem Arzt sprechen. Nährwerte sind Richtwerte. Fotos: <a href="https://unsplash.com/${UTM}" target="_blank" rel="noopener">Unsplash</a>.</p>
  </div>`;
}
function viewRecipe(r){
  return `<div class="recipe"><div class="rhero"><img src="${UNSPLASH(r.img, 1000, 650)}" alt="${esc(r.name)}"><button class="btn ghost rclose" data-act="closeov" aria-label="Schließen">✕</button></div>
  <div class="wrap stack" style="padding-top:16px"><div class="small muted">Foto: <a href="https://unsplash.com/@${r.by[1]}${UTM}" target="_blank" rel="noopener">${esc(r.by[0])}</a> auf <a href="https://unsplash.com/${UTM}" target="_blank" rel="noopener">Unsplash</a></div>
  <h1>${esc(r.name)}</h1>
  <div class="stats"><div class="stat"><b>${r.p} g</b><span class="small muted">Eiweiß</span></div><div class="stat"><b>${r.kcal}</b><span class="small muted">kcal</span></div><div class="stat"><b>${r.min}</b><span class="small muted">Minuten</span></div></div>
  <div class="small">${esc(r.why)}</div>
  <div class="card stack" style="gap:6px"><div class="label">Zutaten · 1 Portion</div>${r.zut.map(z => `<div class="row" style="gap:10px"><span class="dotb"></span><span>${esc(z)}</span></div>`).join('')}</div>
  <div class="card stack" style="gap:10px"><div class="label">So geht's</div>${r.steps.map((st, i) => `<div class="row" style="gap:12px;align-items:flex-start"><span class="stepn">${i + 1}</span><span>${esc(st)}</span></div>`).join('')}</div>
  <button class="btn" data-act="eatrecipe" data-id="${r.id}">Gegessen – ${r.p} g Eiweiß eintragen</button>
  <button class="btn link" data-act="closeov">Schließen</button></div></div>`;
}
async function addEat(entry){
  const d = dayCheck(C), before = eatenOf(d), list = [...(d.essen || []), entry], nd = {...d, essen: list}, goal = proteinGoal(C).g;
  C.checks.tag[iso(today())] = nd; render();
  if (before < goal && eatenOf(nd) >= goal) { celebrate(); toast('Eiweißziel geschafft!'); } else toast(`+${entry.g} g Eiweiß`);
  await saveDayCheck(nd);
}
// ---------- 360°-Körper: eigenes Dreh-Video → 36 Bilder (6×6-Raster), privat in Supabase Storage ----------
const SPIN = {};                     // Kunden-ID → {loading} | {none} | {url}
const SPIN_N = 36, SPIN_COLS = 6, SPIN_W = 360, SPIN_H = 648, SPIN_SCAN = 48;
const spinPath = id => id + '/dreh.jpg';
function rerenderKeep(){ if (OV) return; const y = scrollY; render(); scrollTo(0, y); }
async function loadSpin(id){
  if (!id || SPIN[id]) return; SPIN[id] = {loading: true};
  try { const {data, error} = await sb.storage.from('koerper').download(spinPath(id)); SPIN[id] = error || !data ? {none: true} : {url: URL.createObjectURL(data)}; }
  catch (e) { SPIN[id] = {none: true}; }
  rerenderKeep();
}
function spinUpload(id, label){ return `<label class="btn ghost spinup"><input type="file" accept="video/*" data-spinfile="${id}" hidden>${label}</label>`; }
function spinView(id, own){
  const sp = SPIN[id]; loadSpin(id);
  if (!sp || sp.loading) return `<div class="spin loading"><span class="small muted">Lädt …</span></div>`;
  if (sp.url) return `<div class="spinwrap"><div class="spin" data-spin="${id}" style="background-image:url(${sp.url})" role="img" aria-label="${own ? 'Dein Körper' : 'Körper'} in 360°, zum Drehen wischen"></div><span class="spinhint">↔ Wischen zum Drehen</span></div>${spinUpload(id, 'Neu aufnehmen')}`;
  return null;
}
function spinInvite(id, own){
  return `<div class="spinempty stack" style="gap:8px"><b>${own ? 'Sieh dich selbst in 360°' : '360°-Körper anlegen'}</b><div class="small muted">Handy hochkant hinstellen (2–3 m Abstand, Hüfthöhe), Sportkleidung, gutes Licht. Video starten und dich einmal langsam um dich selbst drehen – ca. 10 Sekunden. Die Bilder sieht nur ${own ? 'du und Jonathan' : 'der Kunde und du'}.</div>${spinUpload(id, '🎥 Dreh-Video auswählen')}</div>`;
}
function setFrame(el, f){ f = ((f % SPIN_N) + SPIN_N) % SPIN_N; el.dataset.f = f; el.style.backgroundPosition = `${(f % SPIN_COLS) * 100 / (SPIN_COLS - 1)}% ${Math.floor(f / SPIN_COLS) * 100 / (SPIN_COLS - 1)}%`; }
// Nach jedem Rendern: Startbild setzen und beim ersten Anzeigen einmal langsam drehen
function initSpins(){
  document.querySelectorAll('.spin[data-spin]').forEach(el => {
    const sp = SPIN[el.dataset.spin]; if (!sp) return;
    setFrame(el, sp.f || 0);
    if (!sp.intro) { sp.intro = true; const t0 = performance.now(); (function step(t){ if (el.dataset.drag || !el.isConnected) return; const k = Math.min(1, (t - t0) / 2600); setFrame(el, Math.round(k * SPIN_N)); sp.f = +el.dataset.f; if (k < 1) requestAnimationFrame(step); })(t0); }
  });
}
let spinDrag = null;
document.addEventListener('pointerdown', e => { const el = e.target.closest && e.target.closest('.spin[data-spin]'); if (!el) return; el.dataset.drag = '1'; spinDrag = {el, x: e.clientX, f: +el.dataset.f || 0}; try { el.setPointerCapture(e.pointerId); } catch (_) {} });
document.addEventListener('pointermove', e => { if (!spinDrag) return; setFrame(spinDrag.el, spinDrag.f + Math.round((e.clientX - spinDrag.x) / 8)); const sp = SPIN[spinDrag.el.dataset.spin]; if (sp) sp.f = +spinDrag.el.dataset.f; });
['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, () => { if (spinDrag) delete spinDrag.el.dataset.drag; spinDrag = null; }));

// Video im Browser in Bilder zerlegen (nichts verlässt das Handy außer dem fertigen Bild)
function seekTo(v, t){ return new Promise(res => { let done = false; const fin = () => { if (done) return; done = true; v.removeEventListener('seeked', fin); res(); }; v.addEventListener('seeked', fin); setTimeout(fin, 3000); v.currentTime = Math.min(Math.max(0, t), Math.max(0, v.duration - 0.05)); }); }
function drawCover(ctx, v, x, y, w, h){ const vw = v.videoWidth || v.width, vh = v.videoHeight || v.height, s = Math.max(w / vw, h / vh), sw = w / s, sh = h / s; ctx.drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, x, y, w, h); }
async function startSpinMake(id, file){
  OV = {type: 'spinmake', id, step: 'scan', p: 0, thumbs: [], a: 0, b: SPIN_SCAN - 1}; openOverlay();
  try {
    const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; v.src = URL.createObjectURL(file);
    await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = () => rej(new Error('video')); v.load(); });
    try { await v.play(); v.pause(); } catch (_) {}
    if (!v.duration || !isFinite(v.duration)) throw new Error('dauer');
    OV.v = v; const c = document.createElement('canvas'); c.width = 108; c.height = 192; const ctx = c.getContext('2d', {willReadFrequently: true}); const grays = [];
    for (let i = 0; i < SPIN_SCAN; i++) {
      if (!OV || OV.type !== 'spinmake') return;
      await seekTo(v, v.duration * (i + 0.5) / SPIN_SCAN); drawCover(ctx, v, 0, 0, 108, 192);
      OV.thumbs.push(c.toDataURL('image/jpeg', 0.6));
      const px = ctx.getImageData(0, 0, 108, 192).data, g = new Float32Array(108 * 192); for (let k = 0; k < g.length; k++) g[k] = (px[k*4] + px[k*4+1] + px[k*4+2]) / 3; grays.push(g);
      OV.p = Math.round((i + 1) / SPIN_SCAN * 100); renderOverlay();
    }
    // Drehung erkennen: Bewegung zwischen benachbarten Bildern; ruhiges Stehen am Anfang/Ende wird abgeschnitten
    const diff = grays.map((g, i) => { if (!i) return 0; let s = 0; for (let k = 0; k < g.length; k++) s += Math.abs(g[k] - grays[i-1][k]); return s / g.length; });
    // geglättet: längste zusammenhängende Bewegung = Drehung (Feinschliff per Schieberegler)
    const sm = diff.map((x, i) => (diff[Math.max(1, i - 1)] + x + diff[Math.min(diff.length - 1, i + 1)]) / 3), thr = Math.max(...sm) * 0.4;
    let a = 0, b = SPIN_SCAN - 1, best = 0;
    for (let i = 1; i < sm.length; i++) { if (sm[i] <= thr) continue; let j = i; while (j + 1 < sm.length && sm[j + 1] > thr) j++; if (j - i > best) { best = j - i; a = i - 1; b = j; } i = j; }
    if (best < 8) { a = 0; b = SPIN_SCAN - 1; }
    Object.assign(OV, {step: 'trim', a, b}); renderOverlay(); spinPreview();
  } catch (e) { console.error(e); if (OV) { OV.step = 'fail'; renderOverlay(); } }
}
function spinPreview(){
  clearInterval(spinPreview.h); let i = 0;
  spinPreview.h = setInterval(() => { const img = document.getElementById('spinPrev'); if (!OV || OV.type !== 'spinmake' || !img) { clearInterval(spinPreview.h); return; } const n = OV.b - OV.a + 1; img.src = OV.thumbs[OV.a + (i++ % n)]; }, 110);
}
function loadAvatarLib(){ return window.AVATAR ? Promise.resolve() : new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'avatar.js?v=35'; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); }); }
async function saveSpin(){
  const W = OV, v = W.v, d = v.duration, ta = d * (W.a + 0.5) / SPIN_SCAN, tb = d * (W.b + 0.5) / SPIN_SCAN;
  W.step = 'build'; W.p = 0; W.msg = 'Bilder aus dem Video holen …'; renderOverlay();
  // 36 Einzelbilder (lange Seite höchstens 960 px)
  const k = Math.min(1, 960 / Math.max(v.videoWidth, v.videoHeight)), fw = Math.round(v.videoWidth * k), fh = Math.round(v.videoHeight * k), frames = [];
  for (let i = 0; i < SPIN_N; i++) {
    if (!OV || OV.type !== 'spinmake') return;
    await seekTo(v, ta + (tb - ta) * i / SPIN_N); const f = document.createElement('canvas'); f.width = fw; f.height = fh; f.getContext('2d').drawImage(v, 0, 0, fw, fh); frames.push(f);
    W.p = Math.round((i + 1) / SPIN_N * 10); renderOverlay();
  }
  // Avatar-Look: freistellen + Studio + Podest; klappt das nicht, bleibt die einfache Video-Version
  let cells = null;
  try {
    W.msg = 'KI stellt dich frei … (1–3 Minuten, App bitte offen lassen)'; renderOverlay();
    await loadAvatarLib();
    cells = await AVATAR.process(frames, SPIN_W, SPIN_H, p => { if (OV === W) { W.p = 10 + Math.round(p * 85); renderOverlay(); } });
  } catch (e) { console.warn('Avatar', e); cells = null; }
  if (!OV || OV.type !== 'spinmake') return;
  const c = document.createElement('canvas'); c.width = SPIN_W * SPIN_COLS; c.height = SPIN_H * Math.ceil(SPIN_N / SPIN_COLS); const ctx = c.getContext('2d');
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, c.width, c.height);
  frames.forEach((f, i) => { const x = (i % SPIN_COLS) * SPIN_W, y = Math.floor(i / SPIN_COLS) * SPIN_H; if (cells) ctx.drawImage(cells[i], x, y); else drawCover(ctx, f, x, y, SPIN_W, SPIN_H); });
  const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.84));
  W.step = 'upload'; renderOverlay();
  const {error} = await sb.storage.from('koerper').upload(spinPath(W.id), blob, {upsert: true, contentType: 'image/jpeg', cacheControl: '60'});
  if (error) throw error;
  URL.revokeObjectURL(v.src); SPIN[W.id] = {url: URL.createObjectURL(blob)};
  closeOverlay(); render(); toast(cells ? 'Dein 360°-Avatar ist fertig' : 'Gespeichert (ohne Freistellen – das Handy war dafür zu langsam)');
}
function viewSpinMake(){
  const W = OV, bar = p => `<div class="bar"><span style="width:${p}%"></span></div>`;
  const top = `<div class="wrap stack" style="padding-top:28px"><div class="row between"><div class="label" style="color:var(--tint)">360°-Körper</div><button class="btn link" data-act="closeov">Abbrechen</button></div>`;
  if (W.step === 'fail') return `${top}<h1>Das Video ließ sich nicht lesen</h1><p class="muted">Bitte nimm es nochmal mit der normalen Kamera-App auf (hochkant, ca. 10 Sekunden) und wähle es dann aus.</p><button class="btn" data-act="closeov">OK</button></div>`;
  if (W.step === 'scan') return `${top}<h1>Video wird angeschaut …</h1>${bar(W.p)}<p class="small muted">Das passiert direkt auf deinem Handy.</p></div>`;
  if (W.step === 'build' || W.step === 'upload') return `${top}<h1>${W.step === 'build' ? 'Dein Avatar entsteht …' : 'Wird gespeichert …'}</h1>${bar(W.step === 'build' ? W.p : 97)}<p class="small muted">${W.step === 'build' ? esc(W.msg || '') : ''}</p></div>`;
  const t = i => (W.v.duration * (i + 0.5) / SPIN_SCAN).toFixed(1).replace('.', ',');
  return `${top}<h1>Passt die Drehung?</h1>
   <div class="spintrim"><img id="spinPrev" src="${W.thumbs[W.a]}" alt="Vorschau der Drehung"></div>
   <p class="small muted" style="margin:0">Die Vorschau zeigt deine Drehung in Schleife. Falls am Anfang oder Ende noch Stehen dabei ist, hier verschieben:</p>
   <label class="field"><span class="small muted">Start der Drehung: ${t(W.a)} s</span><input type="range" min="0" max="${SPIN_SCAN - 2}" value="${W.a}" data-spinrange="a"></label>
   <label class="field"><span class="small muted">Wieder vorne: ${t(W.b)} s</span><input type="range" min="1" max="${SPIN_SCAN - 1}" value="${W.b}" data-spinrange="b"></label>
   <button class="btn" data-act="spinsave">Speichern</button></div>`;
}
function viewHeute(c){
  const T = today(), items = c.plan[dayKey(T)] || [], done = c.done[iso(T)] || [];
  const pct = items.length ? Math.round(items.filter(t => done.includes(t.id)).length / items.length * 100) : 100;
  const open = items.filter(t => !done.includes(t.id));
  const ex = c.extras[iso(T)] || [];
  const noPlan = DAYS.every(k => !c.plan[k].length);
  const msg = noPlan ? 'Dein Plan kommt bald.' : pct === 100 && items.length ? 'Alles erledigt. Stark!' : open.length ? `Noch ${open.length} ${open.length===1?'Einheit':'Einheiten'} heute.` : 'Ruhetag. Erholung gehört dazu.';
  const rem = (c.p.reminder || '18:00').slice(0,5); const now = new Date(); const [rh, rm] = rem.split(':').map(Number);
  const due = open.length && (now.getHours() > rh || (now.getHours() === rh && now.getMinutes() >= rm));
  const lv = mergeLevels(items.map(itemMuscles));
  const home = ROUTINES.filter(r => r.ort === 'zuhause'), sugg = home[dayIdx(T) % home.length];
  return `${head(c, null, DAYNAMES[dayKey(T)] + ', ' + T.toLocaleDateString('de-DE',{day:'numeric',month:'long'}))}<div class="stack">
  ${strip(c)}
  ${due ? `<div class="reminder"><b>Erinnerung:</b> ${open.map(t => esc(t.title)).join(', ')} ${open.length===1?'wartet':'warten'} noch auf dich.</div>` : ''}
  ${nextCard(c)}
  ${weekCheckCard(c)}
  ${dailyCheck(c)}
  <div class="card stack" style="gap:12px">${tempoBars(pct, weekMinutes(c), activeDays(c))}${streakLine(c)}</div>
  ${c.p.coach_note ? `<div class="coachmsg"><span class="avatar">J</span><div style="min-width:0"><div class="small" style="font-weight:600">Jonathan</div><div>${esc(c.p.coach_note)}</div></div></div>` : ''}
  ${items.length ? `<div class="section"><h2>Dein Programm</h2><span class="small muted">${msg}</span></div><div class="list">${items.map(t => taskBtn(t, done.includes(t.id))).join('')}</div>` : ''}
  ${Object.keys(lv).length ? `<div class="section"><h2>Heute trainiert</h2></div><div class="card stack">${BODY.pair(lv)}${muscleChips(lv)}</div>` : ''}
  <div class="section"><h2>${items.length ? 'Lust auf mehr?' : 'Für deinen freien Tag'}</h2><button class="btn link" data-tab="uebungen">Alle</button></div>${routineCard(sugg)}
  ${ex.length ? `<div class="card stack" style="gap:8px"><div class="label">Extra heute</div>${ex.map(x => `<div class="row between"><span>${esc(x.title)}</span><span class="row" style="gap:6px"><span class="chip">${x.min} Min</span><button class="btn link" style="color:var(--danger)" data-act="delextra" data-id="${x.id}">Löschen</button></span></div>`).join('')}</div>` : ''}
  <details class="card"><summary style="font-weight:600;cursor:pointer;min-height:28px">Extra-Einheit & Erinnerung</summary>
   <form class="stack sheet" data-form="extra" style="margin-top:12px"><div class="label">Eigene Extra-Einheit</div><div class="formrow"><label class="field"><span class="small muted">Was hast du gemacht?</span><input id="exTitle" required maxlength="80" placeholder="z. B. Schwimmen, Wandern"></label><label class="field" style="flex:0 0 110px"><span class="small muted">Minuten</span><input id="exMin" type="number" min="1" max="600" value="30" required></label></div><button class="btn">Speichern</button></form>
   <div class="row between sheet" style="margin-top:12px"><div><div class="label">Erinnerung</div><div>Täglich ab <b>${esc(rem)}</b> Uhr, falls noch etwas offen ist</div></div><input id="remTime" type="time" value="${esc(rem)}" style="width:auto" aria-label="Uhrzeit der Erinnerung"></div></details>
  </div>`;
}
// Wochenansicht: Tag antippen → kurze Übersicht der Übungen (Antippen einer Übung öffnet die Anleitung)
function dayPreview(c, d){
  const k = dayKey(d), items = c.plan[k] || [], done = c.done[iso(d)] || [], isToday = iso(d) === iso(today());
  const mins = items.reduce((a, t) => a + (t.min || 0), 0);
  const head = `<div style="min-width:0"><b>${DAYNAMES[k]}${isToday ? ' <span class="chip kraft">Heute</span>' : ''}</b><div class="small muted">${items.map(t => (done.includes(t.id) ? '✓ ' : '') + esc(t.title)).join(' · ') || 'Ruhetag'}</div></div><span class="row" style="gap:8px;flex:none"><span class="small muted">${items.length ? mins + ' Min' : ''}</span>${items.length ? '<span class="chev" aria-hidden="true"></span>' : ''}</span>`;
  if (!items.length) return `<div class="dayline">${head}</div>`;
  const body = items.map(t => {
    const ex = t.exercises.length ? t.exercises : (guessEx(t) ? [{ex: guessEx(t), sets: 1, reps: (t.min || '') + ' Min'}] : []);
    return `<div class="dp-unit"><div class="dp-title"><span class="chip ${t.kind}">${KINDS[t.kind]}</span> <b>${esc(t.title)}</b>${done.includes(t.id) ? ' <span class="small" style="color:var(--done)">✓ erledigt</span>' : ''}</div>${ex.length ? `<div class="dp-list">${ex.map((x, n) => { const e = EXMAP[x.ex]; return e ? `<button class="dp-ex" data-act="openex" data-id="${e.id}"><span class="dp-n">${n + 1}</span><span class="dp-name">${esc(e.name)}</span><span class="dp-sr">${x.sets > 1 ? x.sets + ' × ' : ''}${esc(x.reps)}</span></button>` : ''; }).join('')}</div>` : `<div class="small muted">${t.note ? esc(t.note) : 'Keine einzelnen Übungen eingetragen.'}</div>`}</div>`;
  }).join('');
  return `<details class="dayline dp"${isToday ? ' open' : ''}><summary>${head}</summary><div class="dp-body">${body}</div></details>`;
}
function viewWoche(c){
  const wd = weekDates();
  return `${head(c, 'Woche')}<div class="stack">
  <div class="stats"><div class="stat"><b>${weekRate(c)}%</b><span class="small muted">erledigt</span></div><div class="stat"><b>${weekMinutes(c)}</b><span class="small muted">aktive Min.</span></div><div class="stat"><b>${streak(c)}</b><span class="small muted">Tage Serie</span></div></div>
  ${strip(c)}
  <div class="card daylist">${wd.map(d => dayPreview(c, d)).join('')}</div>
  <div class="section"><h2>Muskeln diese Woche</h2></div><div class="card stack">${BODY.pair(mergeLevels(DAYS.flatMap(k => c.plan[k].map(itemMuscles))))}</div>
  </div>`;
}
function viewUebungen(c){
  const FILTERS = [['alle','Alle'],['zuhause','Zuhause'],['studio','Studio'],['mobility','Beweglichkeit'],['ausdauer','Ausdauer']];
  const list = EX.filter(e => e.id !== 'ems').filter(e => exFilter === 'alle' ? true : exFilter === 'mobility' || exFilter === 'ausdauer' ? e.kat === exFilter : e.ort === exFilter || e.ort === 'beides')
                 .filter(e => !muscleSel || e.m.includes(muscleSel) || e.s.includes(muscleSel));
  const lv = muscleSel ? {[muscleSel]: 1} : {};
  return `${head(c, 'Übungen')}<div class="stack">
  <div class="section"><h2>Für zuhause</h2><span class="small muted">${ROUTINES.filter(r => r.ort === 'zuhause' && !r.nurCoach).length} Programme</span></div>
  <div class="routines">${ROUTINES.filter(r => r.ort === 'zuhause' && !r.nurCoach).map(routineCard).join('')}</div>
  <div class="section"><h2>Im Studio</h2><span class="small muted">${ROUTINES.filter(r => r.ort === 'studio' && !r.nurCoach).length} Programme</span></div>
  <div class="routines">${ROUTINES.filter(r => r.ort === 'studio' && !r.nurCoach).map(routineCard).join('')}</div>
  <div class="section"><h2>Alle Übungen</h2><span class="small muted">${list.length}</span></div>
  <div class="card stack"><div class="label">${muscleSel ? 'Übungen für: ' + BODY.NAMES[muscleSel] : 'Tipp auf einen Muskel'}</div>${BODY.pair(lv, {clickable:true})}${muscleSel ? '<button class="btn ghost" data-act="musclereset">Alle Muskeln zeigen</button>' : ''}</div>
  <div class="filters">${FILTERS.map(([k,l]) => `<button class="fchip" data-act="exfilter" data-id="${k}" aria-pressed="${exFilter===k}">${l}</button>`).join('')}</div>
  <div class="exlist">${list.map(e => `<button class="exitem" data-act="openex" data-id="${e.id}"><span class="thumb">${exMedia(e, muscleLevels([e.id]))}</span><span class="t-body"><span class="t-title">${esc(e.name)}</span><span class="small muted">${esc(ORT[e.ort])} · ${esc(e.geraet)} · ${esc(KAT[e.kat])}</span></span></button>`).join('') || '<div class="card muted">Keine Übung passt zu diesem Filter.</div>'}</div>
  <p class="credit">Bei Schmerzen abbrechen und mit Jonathan sprechen. Muskelmodell: Wikimedia Commons „Muscular system“ und wger.de, Lizenz CC BY-SA.</p>
  </div>`;
}
function chart(c){
  const h = c.goal.history; if (h.length < 2) return '<p class="muted small" style="margin:0">Die Kurve erscheint ab dem zweiten eingetragenen Wert.</p>';
  const W = 320, H = 140, p = {l:34, r:12, t:12, b:24};
  const vals = h.map(x => x.value).concat(c.goal.target != null ? [c.goal.target] : []); const mn = Math.min(...vals), mx = Math.max(...vals); const pad = (mx-mn)*.15 || 1; const lo = mn-pad, hi = mx+pad;
  const X = i => p.l + (W-p.l-p.r) * (i/(h.length-1)), Y = v => p.t + (H-p.t-p.b) * (1-(v-lo)/(hi-lo));
  const pts = h.map((x,i) => `${X(i)},${Y(x.value)}`).join(' ');
  const step = Math.ceil(h.length / 6);
  const tgt = c.goal.target != null ? `<line x1="${p.l}" x2="${W-p.r}" y1="${Y(c.goal.target)}" y2="${Y(c.goal.target)}" stroke="var(--warm)" stroke-dasharray="5 4" stroke-width="1.5"/><text x="${W-p.r}" y="${Y(c.goal.target)-5}" text-anchor="end" style="fill:var(--warm)">Ziel ${fmt(c.goal.target)} ${esc(c.goal.unit)}</text>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Verlauf">${tgt}
  <polygon points="${p.l},${H-p.b} ${pts} ${X(h.length-1)},${H-p.b}" fill="var(--tint-soft)"/>
  <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>
  ${h.map((x,i) => `<circle cx="${X(i)}" cy="${Y(x.value)}" r="${i===h.length-1?5.5:3.5}" fill="var(--accent)"/>${i % step === 0 || i === h.length-1 ? `<text x="${X(i)}" y="${H-6}" text-anchor="middle">${shortDate(x.date)}</text>` : ''}`).join('')}
  <text x="4" y="${Y(h[0].value)+4}">${fmt(h[0].value)}</text></svg>`;
}
// Realistisches Körperbild mit Messringen (Position in % vom Bild: y, x-Mitte, Breite)
const PHOTO_RINGS = {
  m: {chest:[26,50,38], arm:[31,29,10], waist:[42,50,34], hip:[47,50,40], thigh:[56,39,19]},
  w: {chest:[27,50,31], arm:[31,29,8], waist:[39,50,26], hip:[47,50,33], thigh:[56,41,16]}
};
function bodyPhoto(c, v){
  const g = c.p.gender === 'w' ? 'w' : 'm', R = PHOTO_RINGS[g];
  const items = [['chest','Brust','r'],['arm','Oberarm','l'],['waist','Taille','l'],['hip','Hüfte','r'],['thigh','Oberschenkel','r']];
  return `<div class="bodyphoto"><img src="img/koerper_${g}.jpg?v=1" alt="Körperbild" onerror="this.closest('.bodyphoto').classList.add('noimg')">${items.map(([k,l,side]) => { const [y,x,w] = R[k], left = side === 'l'; return `<span class="pring${v[k] != null ? ' on' : ''}" style="top:${y}%;left:${x - w/2}%;width:${w}%"></span><span class="plabel ${left ? 'l' : 'r'}" style="top:${y}%">${l}<b>${v[k] != null ? fmt(v[k]) + ' cm' : '–'}</b></span>`; }).join('')}${v.body_fat != null ? `<span class="plabel fat" style="top:52%">Körperfett<b>${fmt(v.body_fat)} %</b></span>` : ''}</div>`;
}
function bodyCard(c, editable){
  const {v, first} = latestBody(c);
  const last = c.body.length ? c.body[c.body.length-1].day : null;
  const box = ([k,l,u]) => { const d = v[k] != null && first[k] != null ? v[k] - first[k] : 0; const cls = !d ? '' : LOWER_IS_BETTER.includes(k) ? (d < 0 ? 'good' : 'bad') : 'good'; return `<div class="mbox"><span class="small muted">${l}</span><b>${v[k] != null ? fmt(v[k]) + ' ' + u : '–'}</b>${d ? `<span class="delta ${cls}">${d > 0 ? '+' : ''}${fmt(d)} ${u} seit Start</span>` : ''}</div>`; };
  const own = me && me.id === c.p.id, sv = spinView(c.p.id, own);
  return `<div class="card stack"><div class="row between"><div class="label">Körpervermessung</div>${last ? `<span class="small muted">zuletzt ${shortDate(last)}</span>` : ''}</div>
   ${sv || bodyPhoto(c, v) + spinInvite(c.p.id, own || preview)}
   <div class="measures">${MEASURES.map(box).join('')}</div>
   ${c.body.length ? '' : `<p class="muted small" style="margin:0">${editable ? 'Noch keine Maße. Trag die Werte der Körpervermessung unten ein.' : 'Bei der nächsten Körpervermessung trägt Jonathan deine Maße hier ein. Du kannst sie auch selbst messen.'}</p>`}
   <details${editable ? ' open' : ''}><summary style="font-weight:700;cursor:pointer;min-height:28px">${editable ? 'Neue Messung eintragen' : '+ Selbst gemessen? Eintragen'}</summary>
    <form class="stack sheet" data-form="body" style="margin-top:12px"><div class="measures">${MEASURES.map(([k,l,u]) => `<label class="field"><span class="small muted">${l} (${u})</span><input id="b-${k}" inputmode="decimal" placeholder="${v[k] != null ? fmt(v[k]) : ''}"></label>`).join('')}</div><button class="btn">Messung speichern</button></form></details></div>`;
}
function viewKoerper(c){
  const g = c.goal;
  let goalHtml;
  if (g.start == null || g.target == null) goalHtml = `<div class="card stack"><div class="label">Dein Ziel</div><h2>${esc(g.title) || 'Kommt bald'}</h2><p class="muted" style="margin:0">Jonathan legt dein Ziel mit dir fest, zum Beispiel nach der Körpervermessung.</p></div>`;
  else {
    const {cur, pct} = goalPct(c); const diff = Math.abs(g.target - cur);
    goalHtml = `<div class="card hi stack"><div class="label">Dein Ziel</div><h2>${esc(g.title)}</h2>
   <div class="row between"><span class="muted">Start ${fmt(g.start)} ${esc(g.unit)}</span><b style="font-family:var(--display);font-size:1.5rem;font-weight:700;letter-spacing:-.02em">${fmt(cur)} ${esc(g.unit)}</b><span class="muted">Ziel ${fmt(g.target)} ${esc(g.unit)}</span></div>
   <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
   <div>${pct >= 100 ? '<b>Ziel erreicht!</b> Zeit für ein neues mit Jonathan.' : `<b>${pct}% geschafft.</b> Noch ${fmt(diff)} ${esc(g.unit)} bis zum Ziel.`}</div>${chart(c)}
   <form class="stack sheet" data-form="measure"><label class="field"><span class="small muted">Neuer Wert in ${esc(g.unit)}</span><input id="mVal" type="text" inputmode="decimal" required placeholder="${fmt(cur)}"></label><button class="btn">Eintragen</button></form></div>`;
  }
  return `${head(c, 'Körper')}<div class="stack">${goalHtml}${bodyCard(c, false)}</div>`;
}
function badgesFor(c){
  const {pct} = goalPct(c), st = streak(c), ex = Object.values(c.extras).flat().length, aus = countDone(c,'ausdauer'), all = countDone(c);
  return [
   {t:'Erster Haken', d:'Die erste Einheit erledigt', got: all >= 1, m:'1'},
   {t:'Dranbleiber', d:'3 Wochen in Folge Wochenziel', got: weekStreak(c).n >= 3, m:'3'},
   {t:'Wochensieger', d:'Eine ganze Woche komplett', got: fullWeeks(c) >= 1, m:'W'},
   {t:'Frischluft', d:'10 Ausdauer-Einheiten', got: aus >= 10, m:'10'},
   {t:'Extra-Meile', d:'Eine Extra-Einheit gemacht', got: ex >= 1, m:'+'},
   {t:'Workout-Profi', d:'5 Trainings mit Sätzen absolviert', got: c.workouts >= 5, m:'5'},
   {t:'Rekordjäger', d:'Einen neuen Gewichts-Rekord geschafft', got: (c.history || []).some(h => h.details.prs && Object.keys(h.details.prs).length), m:'PR'},
   {t:'Halbzeit', d:'50 % vom Ziel geschafft', got: pct >= 50, m:'½'},
   {t:'Ziel erreicht', d:'Dein großes Ziel geschafft', got: pct >= 100, m:'★'}];
}
function viewErfolge(c){
  const b = badgesFor(c), n = b.filter(x => x.got).length;
  return `${head(c, 'Erfolge')}<div class="stack"><div class="card"><div class="label">Kleine Erfolge</div><h2>${n} von ${b.length} gesammelt</h2><p class="muted" style="margin:6px 0 0">Jeder Haken zählt. ${countDone(c)} Einheiten hast du in den letzten Wochen geschafft.</p></div>
  <div class="badges">${b.map(x => `<div class="badge ${x.got?'got':''}"><span class="medal">${x.m}</span><b>${esc(x.t)}</b><span class="small muted">${esc(x.d)}</span></div>`).join('')}</div>
  <button class="btn ghost" data-act="logout">Abmelden</button></div>`;
}

// ---------- Vollbild: Übung, Training, Zusammenfassung ----------
function exDetail(e){
  const lv = muscleLevels([e.id]);
  return `<div class="wrap stack"><div class="top"><button class="btn ghost" data-act="closeov">← Zurück</button><span class="chip ${e.kat === 'ems' ? 'ems' : 'kraft'}">${esc(KAT[e.kat])}</span></div>
  <h1>${esc(e.name)}</h1>
  <div class="animbox">${exMedia(e, lv)}</div>
  <div class="card stack"><div class="label">Diese Muskeln arbeiten</div>${BODY.pair(lv)}${muscleChips(lv)}</div>
  <div class="row" style="flex-wrap:wrap;gap:6px"><span class="chip">${esc(ORT[e.ort])}</span><span class="chip">${esc(e.geraet)}</span><span class="chip">${e.sets} × ${esc(e.reps)}</span></div>
  <div class="card stack"><div class="label">So geht's</div><ol class="steps">${e.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
  <div class="card stack"><div class="label" style="color:var(--tint)">Tipp</div><div>${esc(e.tip)}</div><div class="label" style="color:var(--warm)">Typischer Fehler</div><div>${esc(e.fehler)}</div></div>
  ${OV.back ? '' : '<button class="btn" data-act="startsingle" data-id="' + e.id + '">Diese Übung jetzt machen</button>'}</div>`;
}
function startWorkout(title, list, src){
  OV = {type:'workout', title, src, start: Date.now(), prs: {}, best: Object.fromEntries(list.map(it => [it.ex, C ? bestKg(C, it.ex) : 0])), list: list.map(it => ({ex: it.ex, sets: +it.sets || 3, reps: String(it.reps || '10'), done: Array(+it.sets || 3).fill(false), kg: Array(+it.sets || 3).fill('')})).filter(it => EXMAP[it.ex])};
  openOverlay();
}
function viewWorkout(){
  const W = OV, total = W.list.reduce((a,x) => a + x.sets, 0), dn = W.list.reduce((a,x) => a + x.done.filter(Boolean).length, 0);
  const lv = muscleLevels(W.list);
  return `<div class="wrap stack"><div class="top"><button class="btn ghost" data-act="closeov">✕ Abbrechen</button><span class="small muted">${dn} / ${total} Sätze</span></div>
  <h1>${esc(W.title)}</h1>
  <div class="progress"><span style="width:${total ? dn/total*100 : 0}%"></span></div>
  <div class="card stack"><div class="label">Diese Muskeln trainierst du</div>${BODY.pair(lv)}</div>
  ${W.list.map((it, i) => { const e = EXMAP[it.ex], sec = secondsOf(it.reps); return `<div class="card stack"><div class="exhead"><div class="mini">${exMedia(e, muscleLevels([e.id]))}</div><div style="min-width:0"><div class="label">Übung ${i+1}</div><h3>${esc(e.name)}</h3><div class="small muted">${it.sets} × ${esc(it.reps)}${sec ? ' · Timer startet beim Antippen' : ''}</div>${(() => { const l = C ? lastFor(C, it.ex) : null; return l ? `<div class="lastline">Letztes Mal: ${l.kg.length ? '<b>' + fmt(Math.max(...l.kg)) + ' kg</b> · ' : ''}${l.done} ${l.done === 1 ? 'Satz' : 'Sätze'} · ${shortDate(l.day)}</div>` : ''; })()}${W.prs[it.ex] ? `<div class="prbadge">Neuer Rekord · ${fmt(W.prs[it.ex].kg)} kg</div>` : ''}<button class="btn ghost" style="min-height:38px;padding:6px 12px;margin-top:6px" data-act="exinfo" data-id="${e.id}">So geht's</button></div></div>
    <div class="stack" style="gap:8px"><div class="setrow small muted"><span>Satz</span><span>${sec ? 'Zeit' : 'Wdh.'}</span><span>${e.ort === 'studio' ? 'kg' : ''}</span><span></span></div>
    ${it.done.map((d, s) => `<div class="setrow"><span class="n">${s+1}</span><span>${esc(it.reps)}</span>${e.ort === 'studio' ? `<input data-kg="${i}-${s}" inputmode="decimal" value="${esc(it.kg[s])}" placeholder="${(() => { const l = C ? lastFor(C, it.ex) : null; return l && l.kg.length ? fmt(l.kg[Math.min(s, l.kg.length - 1)]) : ''; })()}" aria-label="Gewicht Satz ${s+1}">` : '<span></span>'}<button class="setbtn ${d ? 'on' : ''}" data-act="set" data-id="${i}-${s}" aria-label="Satz ${s+1} erledigt" aria-pressed="${d}"></button></div>`).join('')}</div></div>`; }).join('')}
  <button class="btn" data-act="finish">${dn === total ? 'Training abschließen' : 'Training beenden'}</button>
  ${W.src.item ? '<button class="btn link" data-act="quickdone">Ohne Sätze abhaken</button>' : ''}</div>`;
}
function viewSummary(){
  const S = OV, lv = muscleLevels(S.list.filter(x => x.done.some(Boolean)));
  return `<div class="wrap stack" style="padding-top:28px"><div class="label" style="color:var(--tint)">Geschafft</div><h1>${esc(S.title)}</h1>
  <div class="stats"><div class="stat"><b>${S.min}</b><span class="small muted">Minuten</span></div><div class="stat"><b>${S.sets}</b><span class="small muted">Sätze</span></div><div class="stat"><b>${S.exCount}</b><span class="small muted">Übungen</span></div></div>
  ${Object.keys(S.prs || {}).length ? `<div class="card stack" style="gap:8px"><div class="label" style="color:var(--tint)">Neue Rekorde</div>${Object.entries(S.prs).map(([ex, r]) => `<div class="row between"><span>${esc(EXMAP[ex].name)}</span><span class="prbadge">${fmt(r.kg)} kg · +${fmt(r.plus)}</span></div>`).join('')}</div>` : ''}
  <div class="card stack"><div class="label">Wie war's?</div>
   <div class="small muted">Wie anstrengend? 1 = sehr leicht, 10 = maximal</div>
   <div class="rpe">${Array.from({length: 10}, (_, n) => `<button class="rpeb${S.feel.rpe === n+1 ? ' on' : ''}" data-act="feelrpe" data-id="${n+1}" aria-pressed="${S.feel.rpe === n+1}">${n+1}</button>`).join('')}</div>
   <div class="small muted">Wie fühlst du dich?</div>
   <div class="moods">${MOODS.map(([k, e, l]) => `<button class="moodb${S.feel.mood === k ? ' on' : ''}" data-act="feelmood" data-id="${k}" aria-pressed="${S.feel.mood === k}"><span>${e}</span>${l}</button>`).join('')}</div>
   <label class="field"><span class="small muted">Nachricht an Jonathan (optional)</span><input id="feelNote" maxlength="300" placeholder="z. B. Knie hat leicht gezwickt"></label>
   <button class="btn" data-act="feelsave">Rückmeldung senden</button></div>
  <div class="card hi stack"><div class="label">Trainierte Muskeln</div>${BODY.pair(lv)}${muscleChips(lv)}</div>
  <button class="btn link" data-act="closeov">Ohne Rückmeldung schließen</button></div>`;
}
function openOverlay(){ document.body.style.overflow = 'hidden'; document.getElementById('layer').innerHTML = '<div class="overlay" id="ov"></div><div id="timerbox"></div>'; renderOverlay(); }
function closeOverlay(){ clearInterval(spinPreview.h); OV = null; stopTimer(); document.body.style.overflow = ''; document.getElementById('layer').innerHTML = ''; }
function renderOverlay(){
  const ov = document.getElementById('ov'); if (!ov || !OV) return;
  ov.innerHTML = OV.type === 'ex' ? exDetail(EXMAP[OV.id]) : OV.type === 'workout' ? viewWorkout() : OV.type === 'week' ? viewWeekCheck() : OV.type === 'recipe' ? viewRecipe(RECIPES.find(r => r.id === OV.id)) : OV.type === 'spinmake' ? viewSpinMake() : viewSummary();
}
// Pausen- und Satz-Timer
function startTimer(mode, secs, onDone){
  stopTimer(); timer = {mode, end: Date.now() + secs*1000, total: secs, onDone};
  timer.h = setInterval(tickTimer, 250); tickTimer();
}
function stopTimer(){ if (timer) clearInterval(timer.h); timer = null; const tb = document.getElementById('timerbox'); if (tb) tb.innerHTML = ''; }
function tickTimer(){
  if (!timer) return; const left = Math.max(0, Math.ceil((timer.end - Date.now())/1000));
  const tb = document.getElementById('timerbox'); if (!tb) return;
  tb.innerHTML = `<div class="timer"><div class="in"><div><div class="label" style="color:${timer.mode === 'rest' ? 'var(--tint)' : 'var(--warm)'}">${timer.mode === 'rest' ? 'Pause' : 'Halten'}</div><b>${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}</b></div><div class="row">${timer.mode === 'rest' ? '<button class="btn ghost" data-act="timerplus">+15 s</button>' : ''}<button class="btn" data-act="timerskip">${timer.mode === 'rest' ? 'Weiter' : 'Fertig'}</button></div></div></div>`;
  if (left <= 0) { const cb = timer.onDone; stopTimer(); if (navigator.vibrate) navigator.vibrate(200); if (cb) cb(); }
}
function markSet(i, s){
  const it = OV.list[i]; it.done[s] = !it.done[s];
  if (it.done[s]) { const kg = parseNum(it.kg[s]), best = OV.best[it.ex] || 0;
    if (kg != null && best > 0 && kg > best) { OV.best[it.ex] = kg; OV.prs[it.ex] = {kg, plus: kg - best}; toast(`Neuer Rekord! ${EXMAP[it.ex].name} +${fmt(kg - best)} kg`); celebrate(); } }
  renderOverlay();
  if (it.done[s]) startTimer('rest', EXMAP[it.ex].kat === 'mobility' ? 20 : 60);
}
async function finishWorkout(){
  const W = OV, sets = W.list.reduce((a,x) => a + x.done.filter(Boolean).length, 0);
  if (!sets) { toast('Hake mindestens einen Satz ab oder brich ab.'); return; }
  const min = Math.max(1, Math.round((Date.now() - W.start) / 60000));
  const details = {sets: W.list.map(x => ({ex: x.ex, reps: x.reps, done: x.done.filter(Boolean).length, kg: x.kg.filter(Boolean)})), prs: W.prs};
  const k = iso(today()); let ref;
  if (W.src.item) {
    await q(sb.from('checkins').upsert({client_id: me.id, item_id: W.src.item, day: k, details}, {onConflict: 'item_id,day'})); ref = {item: W.src.item, day: k};
  } else {
    const row = await q(sb.from('extras').insert({client_id: me.id, day: k, title: W.title, minutes: min, details}).select('id').single()); ref = {extra: row.id};
  }
  C = await loadClient(me.id);
  stopTimer();
  OV = {type:'summary', title: W.title, list: W.list, min: W.src.item ? (findItem(W.src.item)?.min || min) : min, sets, exCount: W.list.filter(x => x.done.some(Boolean)).length, prs: W.prs, details, ref, feel: {}};
  renderOverlay(); document.getElementById('ov').scrollTop = 0; render(); celebrate();
}
async function saveFeel(){
  const S = OV; if (!S.feel.rpe && !S.feel.mood) { toast('Tipp kurz an, wie anstrengend es war.'); return; }
  const note = (document.getElementById('feelNote') || {}).value || '';
  const details = {...S.details, feel: {rpe: S.feel.rpe || null, mood: S.feel.mood || null, note: note.trim().slice(0, 300)}};
  if (S.ref.item) await q(sb.from('checkins').update({details}).eq('item_id', S.ref.item).eq('day', S.ref.day));
  else await q(sb.from('extras').update({details}).eq('id', S.ref.extra));
  C = await loadClient(me.id); closeOverlay(); render(); toast('Danke! Jonathan sieht deine Rückmeldung.');
}
function findItem(id){ for (const k of DAYS) { const t = C.plan[k].find(x => x.id === id); if (t) return t; } return null; }

// ---------- Ansichten Coach ----------
function viewCoach(){
  if (coachSel) return viewCoachEdit(roster.find(c => c.p.id === coachSel));
  const pending = roster.filter(c => c.p.role === 'pending'), active = roster.filter(c => c.p.role === 'client');
  return `<div class="top"><div><div class="label">Coach-Bereich</div><h1>Deine Kunden</h1></div><button class="avatar" data-act="menu" aria-label="Abmelden" style="color:var(--warm)">J</button></div>
  <div class="stack">
  ${pending.length ? `<div class="card stack"><div class="label">Neue Anmeldungen</div>${pending.map(c => `<div class="row between" style="flex-wrap:wrap"><div style="min-width:0"><b>${esc(c.p.name||'Ohne Namen')}</b><div class="small muted" style="word-break:break-all">${esc(c.p.email)}</div></div><div class="row" style="gap:6px"><select id="type-${c.p.id}" style="width:auto">${TYPES.map(t => `<option>${t}</option>`).join('')}</select><button class="btn" data-act="approve" data-id="${c.p.id}">Freischalten</button></div></div>`).join('<hr class="sep">')}</div>` : ''}
  ${active.length ? (() => { const n = {rot: 0, gelb: 0, gruen: 0}; active.forEach(c => n[ampel(c).lvl]++); return `<div class="ampelsum"><span><i class="adot rot"></i><b>${n.rot}</b> brauchen dich</span><span><i class="adot gelb"></i><b>${n.gelb}</b> im Blick</span><span><i class="adot gruen"></i><b>${n.gruen}</b> laufen</span></div>`; })() : ''}
  ${active.map(c => { const r = weekRate(c), {pct} = goalPct(c), am = ampel(c); return `<button class="pick" data-act="coachsel" data-id="${c.p.id}"><span class="avatar" style="position:relative">${esc((c.p.name||'?')[0].toUpperCase())}<i class="adot ${am.lvl} onav" aria-hidden="true"></i></span><span class="t-body"><b>${esc(c.p.name)}${c.p.age?', '+c.p.age:''}</b> <span class="chip">${esc(c.p.type_label)}</span><span class="ampelwhy ${am.lvl}">${esc(am.why.join(' · '))}</span><span class="small muted" style="display:block;margin-top:4px">Diese Woche ${r}% · ${weekMinutes(c)} Min · Ziel ${pct}%${(() => { const f = [...(c.history || [])].reverse().find(h => h.details.feel); return f ? ` · zuletzt ${moodOf(f.details.feel.mood)}${f.details.feel.rpe ? ' ' + f.details.feel.rpe + '/10' : ''}` : ''; })()}</span><span class="bar" style="display:block;margin-top:8px;height:8px"><span style="width:${r}%;${r<50?'background:var(--warm)':''}"></span></span></span></button>`; }).join('') || (pending.length ? '' : `<div class="card stack"><h2>Noch keine Kunden</h2><p class="muted" style="margin:0">Schick deinen Kunden den Link zur App. Mit Einladungscode sind sie sofort freigeschaltet, sonst erscheinen sie hier unter „Neue Anmeldungen“.</p></div>`)}
  <div class="card stack"><div class="label">Einladungscodes</div><p class="small muted" style="margin:0">Wer bei der Registrierung einen aktiven Code eingibt, ist sofort freigeschaltet.</p>${codes.map(k => `<form class="row" data-form="code" data-id="${k.id}" style="flex-wrap:wrap"><label class="field" style="min-width:120px"><span class="small muted">${esc(k.type_label)}</span><input id="code-${k.id}" value="${esc(k.code)}" required maxlength="30" autocapitalize="characters"></label><button class="btn" style="align-self:flex-end">Speichern</button><button type="button" class="btn ghost" style="align-self:flex-end" data-act="codeactive" data-id="${k.id}">${k.active ? 'Aktiv' : 'Aus'}</button></form>`).join('')}</div>
  <div class="card stack"><div class="label">Dein eigener 360°-Körper</div>${spinView(me.id, true) || spinInvite(me.id, true)}<p class="small muted" style="margin:0">So sehen es deine Kunden unter „Körper“ – gut zum Vorführen.</p></div>
  <div class="card stack"><div class="label">Link für Kunden</div><div style="word-break:break-all"><b>${esc(location.origin + location.pathname)}</b></div><button class="btn ghost" data-act="copylink">Link kopieren</button></div>
  <button class="btn ghost" data-act="logout">Abmelden</button></div>`;
}
// Übungsauswahl für den Coach, nach Körperbereich sortiert
const AREA_OF = {brust:'Brust', latissimus:'Rücken', ruecken_oben:'Rücken', unterer_ruecken:'Rücken', schultern:'Schultern', bizeps:'Arme', trizeps:'Arme', unterarme:'Arme', oberschenkel_vorne:'Beine & Po', oberschenkel_hinten:'Beine & Po', po:'Beine & Po', waden:'Beine & Po', bauch:'Bauch & Rumpf', seitlich:'Bauch & Rumpf'};
const AREAS = ['Brust','Rücken','Schultern','Arme','Beine & Po','Bauch & Rumpf','Beweglichkeit','Ausdauer','EMS'];
const areaOf = e => e.kat === 'mobility' ? 'Beweglichkeit' : e.kat === 'ausdauer' ? 'Ausdauer' : e.kat === 'ems' ? 'EMS' : AREA_OF[e.m[0]] || 'Bauch & Rumpf';
const exOptions = () => AREAS.map(a => { const list = EX.filter(e => areaOf(e) === a).sort((x, y) => x.name.localeCompare(y.name, 'de')); return list.length ? `<optgroup label="${a}">${list.map(e => `<option value="${e.id}">${esc(e.name)}${e.ort === 'studio' ? ' · Studio' : ''}</option>`).join('')}</optgroup>` : ''; }).join('');
const routineOptions = () => `<optgroup label="5-Tage-Split">${ROUTINES.filter(r => r.nurCoach).map(r => `<option value="${r.id}">${esc(r.name)}</option>`).join('')}</optgroup><optgroup label="Programme">${ROUTINES.filter(r => !r.nurCoach).map(r => `<option value="${r.id}">${esc(r.name)} (${r.min} Min)</option>`).join('')}</optgroup>`;
function exEditor(t){
  return `<div class="stack sheet" style="gap:8px">
   ${t.exercises.map((x, i) => `<div class="row" style="flex-wrap:wrap;gap:6px"><span style="flex:1;min-width:140px">${esc(EXMAP[x.ex]?.name || x.ex)}</span><input data-exsets="${i}" type="number" min="1" max="10" value="${x.sets}" style="width:64px" aria-label="Sätze"><input data-exreps="${i}" value="${esc(x.reps)}" style="width:110px" aria-label="Wiederholungen"><button class="btn link" style="color:var(--danger)" data-act="exdel" data-id="${i}">✕</button></div>`).join('') || '<span class="small muted">Noch keine Übungen.</span>'}
   <div class="formrow"><select id="exAdd" style="flex:2;min-width:170px">${exOptions()}</select><button class="btn ghost" data-act="exadd">+ Übung</button></div>
   <div class="formrow"><select id="exRoutine" style="flex:2;min-width:170px">${routineOptions()}</select><button class="btn ghost" data-act="exroutine">Einsetzen</button></div>
   <button class="btn" data-act="exsave" data-id="${t.id}">Übungen speichern</button></div>`;
}
function viewCoachEdit(c){
  const p = c.p;
  return `<div class="top"><button class="btn ghost" data-act="coachback">← Kunden</button><span class="avatar">${esc((p.name||'?')[0].toUpperCase())}</span></div>
  <div class="stack"><h1>${esc(p.name)}</h1>
  ${(() => { const am = ampel(c); return `<div class="ampelline ${am.lvl}"><i class="adot ${am.lvl}"></i><span>${esc(am.why.join(' · '))}</span></div>`; })()}
  <button class="btn" data-act="startpreview" data-id="${p.id}">App als ${esc(p.name)} ansehen</button>
  ${coachChecks(c)}
  ${(c.history || []).length ? `<div class="card stack" style="gap:10px"><div class="label">Letzte Trainings & Rückmeldungen</div>${[...c.history].reverse().slice(0, 6).map(h => { const f = h.details.feel || {}, prs = Object.entries(h.details.prs || {}), sets = (h.details.sets || []).reduce((a, x) => a + (x.done || 0), 0); return `<div class="fb"><div class="row between"><b>${esc(h.title)}</b><span class="small muted">${shortDate(h.day)}</span></div><div class="small muted">${sets} Sätze${f.rpe ? ' · Anstrengung ' + f.rpe + '/10' : ''}${f.mood ? ' · ' + moodOf(f.mood) : ''}${prs.length ? ' · Rekord: ' + prs.map(([ex, r]) => esc(EXMAP[ex] ? EXMAP[ex].name : ex) + ' ' + fmt(r.kg) + ' kg').join(', ') : ''}</div>${f.note ? `<div class="fbnote">„${esc(f.note)}“</div>` : ''}</div>`; }).join('<hr class="sep">')}</div>` : ''}
  <div class="stats"><div class="stat"><b>${weekRate(c)}%</b><span class="small muted">diese Woche</span></div><div class="stat"><b>${weekMinutes(c)}</b><span class="small muted">aktive Min.</span></div><div class="stat"><b>${streak(c)}</b><span class="small muted">Tage Serie</span></div></div>
  <form class="card stack" data-form="note"><div class="label">Nachricht an ${esc(p.name)}</div><textarea id="noteTxt" rows="3" maxlength="500">${esc(p.coach_note)}</textarea><button class="btn">Nachricht speichern</button></form>
  <div class="card stack"><div class="label">Fertiger Trainingsplan</div><p class="small muted" style="margin:0">Legt den 5-Tage-Split komplett an: Mo Brust + Rücken, Di Beine + Rumpf, Mi Schultern + Arme, Fr Oberkörper, Sa Unterkörper – mit allen Übungen, Sätzen und Wiederholungen. Danach kannst du alles einzeln anpassen.</p><button class="btn ghost" data-act="addsplit">5-Tage-Split anlegen</button></div>
  <div class="card stack"><div class="label">Wochenplan</div>${DAYS.map(k => `<div class="stack" style="gap:6px"><b>${DAYNAMES[k]}</b>${c.plan[k].map(t => `<div style="border:1px solid var(--line);border-radius:12px;padding:8px 10px"><div class="row between" style="flex-wrap:wrap"><span style="min-width:0">${esc(t.title)} <span class="chip ${t.kind}">${KINDS[t.kind]}</span>${t.min?` <span class="chip">${t.min} Min</span>`:''}</span><span class="row" style="gap:4px"><button class="btn link" data-act="exedit" data-id="${t.id}">Übungen (${t.exercises.length})</button><button class="btn link" style="color:var(--danger)" data-act="delitem" data-id="${t.id}">Entfernen</button></span></div>${coachEx && coachEx.id === t.id ? exEditor(coachEx) : ''}</div>`).join('') || '<span class="small muted">Ruhetag</span>'}</div>`).join('')}</div>
  <form class="card stack" data-form="add"><div class="label">Einheit hinzufügen</div>
   <label class="field"><span class="small muted">Was?</span><input id="aTitle" required maxlength="80" placeholder="z. B. Rücken-Fit zuhause"></label>
   <div class="formrow"><label class="field"><span class="small muted">Tag</span><select id="aDay">${DAYS.map((k,i) => `<option value="${i}">${DAYNAMES[k]}</option>`).join('')}</select></label><label class="field"><span class="small muted">Art</span><select id="aKind">${Object.entries(KINDS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}</select></label><label class="field" style="flex:0 0 100px"><span class="small muted">Minuten</span><input id="aMin" type="number" min="0" value="30"></label></div>
   <label class="field"><span class="small muted">Übungen aus Vorlage (optional)</span><select id="aRoutine"><option value="">Keine – später einzeln hinzufügen</option>${routineOptions()}</select></label>
   <label class="field"><span class="small muted">Hinweis (optional)</span><input id="aNote" maxlength="120" placeholder="z. B. lockeres Tempo"></label>
   <button class="btn">Hinzufügen</button></form>
  ${bodyCard(c, true)}
  <form class="card stack" data-form="goal"><div class="label">Ziel</div><label class="field"><span class="small muted">Beschreibung</span><input id="gTitle" value="${esc(p.goal_title)}" required placeholder="z. B. 5 kg leichter"></label><div class="formrow"><label class="field"><span class="small muted">Start</span><input id="gStart" inputmode="decimal" value="${p.goal_start == null ? '' : fmt(p.goal_start)}" required></label><label class="field"><span class="small muted">Ziel</span><input id="gTarget" inputmode="decimal" value="${p.goal_target == null ? '' : fmt(p.goal_target)}" required></label><label class="field" style="flex:0 0 80px"><span class="small muted">Einheit</span><input id="gUnit" value="${esc(p.goal_unit)}" required></label></div><button class="btn">Ziel speichern</button>
   ${c.goal.history.length ? `<div class="small muted">Letzte Werte: ${c.goal.history.slice(-4).map(h => `${shortDate(h.date)}: ${fmt(h.value)}`).join(' · ')}</div>` : ''}</form>
  <form class="card stack" data-form="profile"><div class="label">Kunde</div><div class="formrow"><label class="field"><span class="small muted">Name</span><input id="pName" value="${esc(p.name)}" required></label><label class="field" style="flex:0 0 90px"><span class="small muted">Alter</span><input id="pAge" type="number" min="10" max="99" value="${p.age ?? ''}"></label></div><div class="formrow"><label class="field"><span class="small muted">Betreuung</span><select id="pType">${TYPES.map(t => `<option ${t===p.type_label?'selected':''}>${t}</option>`).join('')}</select></label><label class="field" style="flex:0 0 130px"><span class="small muted">Figur in der App</span><select id="pGender"><option value="m" ${p.gender !== 'w' ? 'selected' : ''}>Mann</option><option value="w" ${p.gender === 'w' ? 'selected' : ''}>Frau</option></select></label></div><button class="btn">Speichern</button></form>
  <button class="btn link" style="color:var(--danger)" data-act="archive" data-id="${p.id}">Kunde archivieren</button></div>`;
}

// ---------- Anmeldung ----------
function viewAuth(){
  const reg = authMode === 'register';
  return `<div class="auth stack"><div class="stack" style="gap:10px"><img class="brandlogo" src="img/logo.png?v=1" alt="Logo Jonathan Coaching"><div><div class="label">Jonathan Coaching</div><h1>${reg ? 'Konto erstellen' : 'Willkommen zurück'}</h1><p class="muted" style="margin:6px 0 0">Dein persönlicher Trainingsplan, deine Erfolge, dein Ziel.</p></div></div>
  <div class="card">${BODY.pair({brust:1, bauch:1, oberschenkel_vorne:1, po:1, latissimus:1, schultern:.5, waden:.5})}</div>
  <div class="seg"><button data-act="mode" data-mode="login" aria-pressed="${!reg}">Anmelden</button><button data-act="mode" data-mode="register" aria-pressed="${reg}">Registrieren</button></div>
  <form class="card stack" data-form="auth">
   ${reg ? `<label class="field"><span class="small muted">Vorname</span><input id="uName" autocomplete="given-name" required maxlength="40"></label>` : ''}
   <label class="field"><span class="small muted">E-Mail</span><input id="uMail" type="email" autocomplete="email" required></label>
   <label class="field"><span class="small muted">Passwort${reg ? ' (mindestens 8 Zeichen)' : ''}</span><input id="uPass" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" minlength="${reg ? 8 : 1}" required></label>
   ${reg ? `<label class="field"><span class="small muted">Einladungscode von Jonathan (falls du einen hast)</span><input id="uCode" autocapitalize="characters" autocomplete="off" maxlength="30"></label>` : ''}
   ${authMsg}
   <button class="btn" ${busy ? 'disabled' : ''}>${busy ? 'Einen Moment …' : reg ? 'Konto erstellen' : 'Anmelden'}</button>
  </form>
  <p class="small muted">Passwort vergessen? Schreib Jonathan kurz, er setzt es für dich zurück.</p></div>`;
}
function viewPending(){
  return `<div class="auth stack"><div class="label">Jonathan Coaching</div><h1>Danke, ${esc(me.name || 'schön dass du da bist')}!</h1>
  <div class="card stack"><p style="margin:0">Dein Konto ist angelegt. Jonathan schaltet dich frei und erstellt deinen persönlichen Plan. Danach siehst du hier dein Programm.</p><button class="btn" data-act="reload">Nochmal prüfen</button></div>
  <button class="btn link" data-act="logout">Abmelden</button></div>`;
}
const AUTH_ERRORS = {'Invalid login credentials':'E-Mail oder Passwort stimmt nicht.','User already registered':'Diese E-Mail ist schon registriert. Bitte melde dich an.','Email not confirmed':'Deine E-Mail ist noch nicht bestätigt. Bitte melde dich bei Jonathan.'};
const authErr = m => `<p class="err">${esc(AUTH_ERRORS[m] || (m.includes('Password') ? 'Das Passwort ist zu kurz oder zu einfach.' : m.includes('rate') ? 'Zu viele Versuche. Bitte warte kurz.' : 'Das hat nicht geklappt: ' + m))}</p>`;

// ---------- Ablauf ----------
const TABS = {heute:['Heute','<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'], woche:['Woche','<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'], uebungen:['Übungen','<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>'], essen:['Essen','<path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2.5 1.5-3.5 4-3.5 8h3.5"/>'], koerper:['Körper','<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M8 10l4 1 4-1M10 21l2-6 2 6"/>'], erfolge:['Erfolge','<circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7"/>']};
function render(){
  const app = document.getElementById('app'), tabs = document.getElementById('tabs');
  tabs.hidden = true;
  if (!session) { app.innerHTML = viewAuth(); return; }
  if (!me) { app.innerHTML = '<div class="loading">Lädt …</div>'; return; }
  if (me.role === 'coach' && !preview) { app.innerHTML = viewCoach(); initSpins(); return; }
  if ((me.role !== 'client' && !preview) || !C) { app.innerHTML = viewPending(); return; }
  app.innerHTML = (preview ? `<div class="reminder row between" style="margin-top:8px"><span><b>Vorschau:</b> So sieht ${esc(C.p.name)} die App.</span><button class="btn ghost" style="min-height:40px;padding:6px 12px" data-act="endpreview">Zurück</button></div>` : '') + ({heute:viewHeute, woche:viewWoche, uebungen:viewUebungen, essen:viewEssen, koerper:viewKoerper, erfolge:viewErfolge})[tab](C);
  tabs.hidden = false;
  initSpins();
  document.getElementById('tabsIn').innerHTML = Object.entries(TABS).map(([k,[l,ic]]) => `<button class="tab" data-tab="${k}" ${k===tab?'aria-current="page"':''}><svg viewBox="0 0 24 24">${ic}</svg>${l}</button>`).join('');
}
async function boot(){
  try {
    if (!session) { me = null; C = null; render(); return; }
    me = await q(sb.from('profiles').select('*').eq('id', session.user.id).single());
    if (me.role === 'coach') { await loadRoster(); await loadCodes(); }
    else if (me.role === 'client') C = await loadClient(me.id);
  } catch (e) { fail(e); }
  render();
}
async function loadCodes(){ codes = await q(sb.from('invite_codes').select('*').order('code')); }
async function refreshCoachClient(id){ const fresh = await loadClient(id); roster = roster.map(c => c.p.id === id ? fresh : c); }
function readExEditor(){ document.querySelectorAll('[data-exsets]').forEach(el => { const x = coachEx.exercises[+el.dataset.exsets]; if (x) x.sets = Math.max(1, +el.value || 1); }); document.querySelectorAll('[data-exreps]').forEach(el => { const x = coachEx.exercises[+el.dataset.exreps]; if (x) x.reps = el.value.trim() || x.reps; }); }
function routineItems(id){ const r = ROUTINES.find(x => x.id === id); return r ? r.items.map(([ex, sets, reps]) => ({ex, sets, reps})) : []; }

document.addEventListener('click', async e => {
  const tb = e.target.closest('[data-tab]'); if (tb) { tab = tb.dataset.tab; render(); scrollTo(0,0); return; }
  const mu = e.target.closest('[data-muscle]'); if (mu && !OV) { muscleSel = mu.dataset.muscle === muscleSel ? null : mu.dataset.muscle; render(); return; }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, id = b.dataset.id;
  try {
    if (a === 'startpreview') { C = roster.find(x => x.p.id === id); preview = true; tab = 'heute'; render(); scrollTo(0,0); return; }
    if (a === 'endpreview') { preview = false; C = null; closeOverlay(); render(); scrollTo(0,0); return; }
    if (preview && ['toggle','finish','quickdone','delextra','feelsave','dc','dcwater','wksave','eat','eatdel','eatrecipe'].includes(a)) { toast('Vorschau: hier wird nichts gespeichert'); return; }
    // Vollbild
    if (a === 'openex') { OV = {type:'ex', id}; openOverlay(); return; }
    if (a === 'exinfo') { OV.back = {...OV}; const back = OV.back; OV = {type:'ex', id, back}; renderOverlay(); document.getElementById('ov').scrollTop = 0; return; }
    if (a === 'closeov') { if (OV && OV.back) { OV = OV.back; delete OV.back; renderOverlay(); return; } closeOverlay(); render(); return; }
    if (a === 'startroutine') { const r = ROUTINES.find(x => x.id === id); startWorkout(r.name, routineItems(id), {routine: id}); return; }
    if (a === 'startsingle') { const ex = EXMAP[id]; startWorkout(ex.name, [{ex: id, sets: ex.sets, reps: ex.reps}], {single: id}); return; }
    if (a === 'openitem') { const t = findItem(id); if (!t) return; startWorkout(t.title, t.exercises, {item: id}); return; }
    if (a === 'set') {
      const [i, s] = id.split('-').map(Number), it = OV.list[i], sec = secondsOf(it.reps);
      if (!it.done[s] && sec) { startTimer('work', sec, () => markSet(i, s)); return; }
      markSet(i, s); return;
    }
    if (a === 'timerplus') { if (timer) { timer.end += 15000; tickTimer(); } return; }
    if (a === 'timerskip') { const cb = timer && timer.mode === 'work' ? timer.onDone : null; stopTimer(); if (cb) cb(); return; }
    if (a === 'finish') { await finishWorkout(); return; }
    if (a === 'feelrpe') { const note = (document.getElementById('feelNote') || {}).value; OV.feel.rpe = +id; renderOverlay(); if (note) document.getElementById('feelNote').value = note; return; }
    if (a === 'feelmood') { const note = (document.getElementById('feelNote') || {}).value; OV.feel.mood = id; renderOverlay(); if (note) document.getElementById('feelNote').value = note; return; }
    if (a === 'feelsave') { await saveFeel(); return; }
    if (a === 'quickdone') { const k = iso(today()); (C.done[k] ||= []).includes(OV.src.item) || C.done[k].push(OV.src.item); await q(sb.from('checkins').upsert({client_id: me.id, item_id: OV.src.item, day: k}, {onConflict: 'item_id,day'})); closeOverlay(); toast('Abgehakt. Weiter so!'); render(); return; }
    if (a === 'spinsave') { try { await saveSpin(); } catch (err) { if (OV) { OV.step = 'trim'; renderOverlay(); spinPreview(); } fail(err); } return; }
    // Essen
    if (a === 'eat') { const f = FOODS.find(x => x[0] === id); await addEat({n: f[2], g: f[4]}); return; }
    if (a === 'eatdel') { const d = dayCheck(C), list = [...(d.essen || [])]; list.splice(+id, 1); const nd = {...d, essen: list}; C.checks.tag[iso(today())] = nd; render(); await saveDayCheck(nd); return; }
    if (a === 'rtag') { recipeTag = id; render(); return; }
    if (a === 'openrecipe') { OV = {type: 'recipe', id}; openOverlay(); document.getElementById('ov').scrollTop = 0; return; }
    if (a === 'eatrecipe') { const r = RECIPES.find(x => x.id === id); closeOverlay(); await addEat({n: r.name, g: r.p}); return; }
    // Tages-Check und Wochen-Check-in
    if (a === 'dc') { const [k, v] = id.split('-'), d = {...dayCheck(C), [k]: +v}; const wasDone = dcDone(dayCheck(C)); render(); await saveDayCheck(d); if (!wasDone && dcDone(d)) { dcOpen = false; toast('Tages-Check gespeichert. Danke!'); } render(); return; }
    if (a === 'dcwater') { const d = dayCheck(C), w = Math.max(0, Math.min(16, (d.wasser || 0) + +id)); const nd = {...d, wasser: w}; C.checks.tag[iso(today())] = nd; render(); if (w === waterGoal(C) && +id > 0) { toast('Wasserziel geschafft!'); celebrate(); } await saveDayCheck(nd); return; }
    if (a === 'dcopen') { dcOpen = true; render(); return; }
    if (a === 'dcclose') { dcOpen = false; render(); return; }
    if (a === 'wkopen') { OV = {type: 'week', data: {}}; openOverlay(); return; }
    if (a === 'wkrate') { OV.data.zufrieden = +id; renderOverlay(); return; }
    if (a === 'wksave') { await saveWeekCheck(); return; }
    // Übungen-Seite
    if (a === 'exfilter') { exFilter = id; }
    if (a === 'musclereset') { muscleSel = null; }
    // Anmeldung und Kunde
    if (a === 'mode') { authMode = b.dataset.mode; authMsg = ''; }
    if (a === 'menu') { if (preview) { preview = false; C = null; render(); return; } if (me.role === 'coach') { scrollTo(0, document.body.scrollHeight); return; } tab = 'erfolge'; render(); scrollTo(0, document.body.scrollHeight); toast('Abmelden findest du unten'); return; }
    if (a === 'logout') { for (const k in SPIN) delete SPIN[k]; await sb.auth.signOut(); session = null; me = null; C = null; roster = []; coachSel = null; tab = 'heute'; }
    if (a === 'reload') { await boot(); return; }
    if (a === 'toggle') {
      const k = iso(today()), arr = C.done[k] ||= [], i = arr.indexOf(id);
      if (i >= 0) { arr.splice(i,1); render(); await q(sb.from('checkins').delete().eq('item_id', id).eq('day', k)); }
      else { arr.push(id); const items = C.plan[dayKey(today())]; toast(arr.length === items.length ? 'Tagesziel geschafft!' : 'Abgehakt. Weiter so!'); render(); if (arr.length === items.length) celebrate(); await q(sb.from('checkins').insert({client_id: me.id, item_id: id, day: k})); }
      return;
    }
    if (a === 'delextra') { await q(sb.from('extras').delete().eq('id', id)); C = await loadClient(me.id); toast('Gelöscht'); }
    // Coach
    if (a === 'approve') { const type = document.getElementById('type-'+id).value; await q(sb.from('profiles').update({role:'client', type_label:type}).eq('id', id)); await loadRoster(); coachSel = id; toast('Freigeschaltet. Jetzt Plan und Ziel anlegen.'); }
    if (a === 'codeactive') { const k = codes.find(x => x.id === id); await q(sb.from('invite_codes').update({active: !k.active}).eq('id', id)); await loadCodes(); toast(k.active ? 'Code ausgeschaltet' : 'Code eingeschaltet'); }
    if (a === 'coachsel') { coachSel = id; coachEx = null; render(); scrollTo(0,0); return; }
    if (a === 'coachback') { coachSel = null; coachEx = null; await loadRoster(); }
    if (a === 'delitem') { await q(sb.from('plan_items').delete().eq('id', id)); await refreshCoachClient(coachSel); toast('Einheit entfernt'); }
    if (a === 'addsplit') { if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Wirklich anlegen? Nochmal tippen'; return; } const days = [['split_a',0],['split_b',1],['split_c',2],['split_d',4],['split_e',5]]; const rows = days.map(([rid, wd]) => { const r = ROUTINES.find(x => x.id === rid); return {client_id: coachSel, weekday: wd, title: r.name.replace('Split ', ''), kind: 'kraft', minutes: r.min, note: '', exercises: routineItems(rid)}; }); await q(sb.from('plan_items').insert(rows)); await refreshCoachClient(coachSel); toast('5-Tage-Split angelegt'); }
    if (a === 'exedit') { if (coachEx && coachEx.id === id) coachEx = null; else { const c = roster.find(x => x.p.id === coachSel); let t; for (const k of DAYS) t = t || c.plan[k].find(x => x.id === id); coachEx = {id, exercises: t.exercises.map(x => ({...x}))}; } }
    if (a === 'exadd') { readExEditor(); const ex = EXMAP[document.getElementById('exAdd').value]; coachEx.exercises.push({ex: ex.id, sets: ex.sets, reps: ex.reps}); }
    if (a === 'exroutine') { readExEditor(); coachEx.exercises.push(...routineItems(document.getElementById('exRoutine').value)); }
    if (a === 'exdel') { readExEditor(); coachEx.exercises.splice(+id, 1); }
    if (a === 'exsave') { readExEditor(); await q(sb.from('plan_items').update({exercises: coachEx.exercises}).eq('id', id)); coachEx = null; await refreshCoachClient(coachSel); toast('Übungen gespeichert'); }
    if (a === 'archive') { if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Wirklich archivieren? Nochmal tippen'; return; } await q(sb.from('profiles').update({role:'archived'}).eq('id', id)); coachSel = null; await loadRoster(); toast('Kunde archiviert'); }
    if (a === 'copylink') { try { await navigator.clipboard.writeText(location.origin + location.pathname); toast('Link kopiert'); } catch { toast('Bitte den Link oben markieren und kopieren'); } return; }
  } catch (err) { fail(err); }
  const y = scrollY; render(); if (me && me.role === 'coach') scrollTo(0, y);
});
document.addEventListener('keydown', e => { const mu = e.target.closest && e.target.closest('[data-muscle]'); if (mu && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); mu.dispatchEvent(new MouseEvent('click', {bubbles: true})); } });
document.addEventListener('input', e => { const sr = e.target.dataset && e.target.dataset.spinrange; if (sr && OV && OV.type === 'spinmake') { const n = +e.target.value; if (sr === 'a') OV.a = Math.min(n, OV.b - 1); else OV.b = Math.max(n, OV.a + 1); const lab = e.target.previousElementSibling; if (lab) lab.textContent = (sr === 'a' ? 'Start der Drehung: ' : 'Wieder vorne: ') + (OV.v.duration * ((sr === 'a' ? OV.a : OV.b) + 0.5) / SPIN_SCAN).toFixed(1).replace('.', ',') + ' s'; return; } const wk = e.target.dataset && e.target.dataset.wk; if (wk && OV && OV.type === 'week') { OV.data[wk] = e.target.value; return; } const k = e.target.dataset && e.target.dataset.kg; if (k && OV && OV.list) { const [i, s] = k.split('-').map(Number); OV.list[i].kg[s] = e.target.value; } });

document.addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target.dataset.form, v = id => document.getElementById(id).value.trim();
  const y = scrollY;
  if (preview && ['extra','measure','body','eatcustom'].includes(f)) { toast('Vorschau: hier wird nichts gespeichert'); return; }
  try {
    if (f === 'auth') {
      busy = true; authMsg = ''; const mail = v('uMail'), pass = document.getElementById('uPass').value;
      const name = authMode === 'register' ? v('uName') : '', code = authMode === 'register' ? v('uCode') : '';
      render(); document.getElementById('uMail').value = mail; if (name) document.getElementById('uName').value = name; if (code) document.getElementById('uCode').value = code;
      const res = authMode === 'register'
        ? await sb.auth.signUp({email: mail, password: pass, options: {data: {name, invite: code}}})
        : await sb.auth.signInWithPassword({email: mail, password: pass});
      busy = false;
      if (res.error) { authMsg = authErr(res.error.message); render(); document.getElementById('uMail').value = mail; return; }
      if (!res.data.session) { authMsg = '<p class="ok">Konto angelegt. Bitte melde dich jetzt an.</p>'; authMode = 'login'; render(); return; }
      return; // onAuthStateChange übernimmt
    }
    if (f === 'eatcustom') { const g = Math.max(1, Math.min(150, parseInt(v('eatG')) || 0)); await addEat({n: v('eatN') || 'Eigenes', g}); return; }
    if (f === 'extra') { await q(sb.from('extras').insert({client_id: me.id, day: iso(today()), title: v('exTitle'), minutes: +v('exMin') || 0})); C = await loadClient(me.id); toast('Extra-Einheit gespeichert'); }
    if (f === 'measure') { const val = parseNum(v('mVal')); if (val == null) { toast('Bitte eine Zahl eintragen, z. B. 79,5'); return; } await q(sb.from('measurements').upsert({client_id: me.id, day: iso(today()), value: val}, {onConflict: 'client_id,day'})); C = await loadClient(me.id); toast('Wert eingetragen'); }
    if (f === 'body') {
      const row = {client_id: me.role === 'coach' ? coachSel : me.id, day: iso(today())}; let any = false;
      MEASURES.forEach(([k]) => { const n = parseNum(v('b-'+k)); if (n != null) { row[k] = n; any = true; } });
      if (!any) { toast('Bitte mindestens einen Wert eintragen'); return; }
      await q(sb.from('body_measures').upsert(row, {onConflict: 'client_id,day'}));
      if (me.role === 'coach') await refreshCoachClient(coachSel); else C = await loadClient(me.id);
      toast('Messung gespeichert');
    }
    if (f === 'code') { const id = e.target.dataset.id, val = v('code-'+id).toUpperCase().replace(/\s+/g, ''); if (!val) return; await q(sb.from('invite_codes').update({code: val}).eq('id', id)); await loadCodes(); toast('Code gespeichert: ' + val); }
    if (f === 'note') { await q(sb.from('profiles').update({coach_note: v('noteTxt')}).eq('id', coachSel)); await refreshCoachClient(coachSel); toast('Nachricht gespeichert'); }
    if (f === 'profile') { await q(sb.from('profiles').update({name: v('pName'), age: parseInt(v('pAge')) || null, type_label: v('pType'), gender: v('pGender')}).eq('id', coachSel)); await refreshCoachClient(coachSel); toast('Gespeichert'); }
    if (f === 'goal') { const s = parseNum(v('gStart')), t = parseNum(v('gTarget')); if (s == null || t == null) { toast('Start und Ziel bitte als Zahl eintragen'); return; } await q(sb.from('profiles').update({goal_title: v('gTitle'), goal_start: s, goal_target: t, goal_unit: v('gUnit')}).eq('id', coachSel)); await refreshCoachClient(coachSel); toast('Ziel gespeichert'); }
    if (f === 'add') { const exs = routineItems(v('aRoutine')); await q(sb.from('plan_items').insert({client_id: coachSel, weekday: +v('aDay'), title: v('aTitle'), kind: v('aKind'), minutes: +v('aMin') || 0, note: v('aNote'), exercises: exs})); await refreshCoachClient(coachSel); toast('Einheit hinzugefügt'); }
  } catch (err) { busy = false; fail(err); }
  render(); if (me && me.role === 'coach') scrollTo(0, y);
});
document.addEventListener('change', async e => {
  const sf = e.target.dataset && e.target.dataset.spinfile;
  if (sf) { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return; if (preview) { toast('Vorschau: hier wird nichts gespeichert'); return; } if (f.size > 300 * 1024 * 1024) { toast('Das Video ist zu groß. Bitte kürzer aufnehmen (ca. 10 Sekunden).'); return; } startSpinMake(sf, f); return; }
  if (e.target.id === 'dcSteps') { if (preview) { toast('Vorschau: hier wird nichts gespeichert'); return; } const n = Math.max(0, Math.min(100000, parseInt(e.target.value) || 0)); try { await saveDayCheck({...dayCheck(C), schritte: n || null}); toast(n ? n.toLocaleString('de-DE') + ' Schritte gespeichert' : 'Schritte gelöscht'); render(); } catch (err) { fail(err); } return; }
  if (e.target.id !== 'remTime' || !e.target.value) return;
  if (preview) { toast('Vorschau: hier wird nichts gespeichert'); return; }
  try { await q(sb.from('profiles').update({reminder: e.target.value}).eq('id', me.id)); C.p.reminder = e.target.value; toast('Erinnerung auf ' + e.target.value + ' Uhr gestellt'); render(); } catch (err) { fail(err); }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && me && me.role === 'client' && C && !OV) render(); });

sb.auth.onAuthStateChange((event, s) => {
  const changed = (s?.user?.id) !== (session?.user?.id);
  session = s;
  if (changed) setTimeout(boot, 0);
});
sb.auth.getSession().then(({data}) => { session = data.session; boot(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

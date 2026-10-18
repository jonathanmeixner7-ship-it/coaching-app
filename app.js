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
const shortDate = d => new Date(d+'T12:00').toLocaleDateString('de-DE',{day:'numeric',month:'numeric'});

let session = null, me = null;       // me = eigenes Profil
let C = null;                        // geladener Kunde
let roster = [];                     // Coach: alle Kunden mit Daten
let codes = [];                      // Coach: Einladungscodes
let tab = 'heute', coachSel = null, coachEx = null, authMode = 'login', authMsg = '', busy = false;
let exFilter = 'alle', muscleSel = null;
let OV = null;                       // offenes Vollbild: {type:'ex', id} | {type:'workout', …} | {type:'summary', …}
let timer = null;                    // {mode:'rest'|'work', end, total, onDone}

function toast(m){ const t = document.getElementById('toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => t.hidden = true, 2400); }
function fail(e){ console.error(e); toast('Das hat nicht geklappt. Bitte prüf deine Internetverbindung.'); }

// ---------- Daten laden ----------
function shape(profile, items, checkins, extras, measures, body){
  const plan = {}; DAYS.forEach(k => plan[k] = []);
  items.forEach(t => plan[DAYS[t.weekday]].push({id:t.id, title:t.title, kind:t.kind, min:t.minutes, note:t.note, exercises: Array.isArray(t.exercises) ? t.exercises : []}));
  const done = {}; checkins.forEach(c => (done[c.day] ||= []).push(c.item_id));
  const workouts = checkins.filter(c => c.details).length + extras.filter(x => x.details).length;
  const ex = {}; extras.forEach(x => (ex[x.day] ||= []).push({id:x.id, title:x.title, min:x.minutes}));
  return { p: profile, plan, done, extras: ex, workouts,
    body: body.sort((a,b) => a.day < b.day ? -1 : 1),
    goal: { title: profile.goal_title, unit: profile.goal_unit, start: profile.goal_start == null ? null : +profile.goal_start,
            target: profile.goal_target == null ? null : +profile.goal_target,
            history: measures.sort((a,b) => a.day < b.day ? -1 : 1).map(m => ({date:m.day, value:+m.value})) } };
}
async function q(promise){ const { data, error } = await promise; if (error) throw error; return data; }
async function loadClient(id){
  const since = iso(addDays(today(), -90));
  const [profile, items, checkins, extras, measures, body] = await Promise.all([
    q(sb.from('profiles').select('*').eq('id', id).single()),
    q(sb.from('plan_items').select('*').eq('client_id', id).order('created_at')),
    q(sb.from('checkins').select('item_id,day,details').eq('client_id', id).gte('day', since)),
    q(sb.from('extras').select('*').eq('client_id', id).gte('day', since)),
    q(sb.from('measurements').select('*').eq('client_id', id)),
    q(sb.from('body_measures').select('*').eq('client_id', id))]);
  return shape(profile, items, checkins, extras, measures, body);
}
async function loadRoster(){
  const since = iso(addDays(today(), -60));
  const [profiles, items, checkins, extras, measures, body] = await Promise.all([
    q(sb.from('profiles').select('*').neq('role','coach').order('created_at')),
    q(sb.from('plan_items').select('*').order('created_at')),
    q(sb.from('checkins').select('client_id,item_id,day,details').gte('day', since)),
    q(sb.from('extras').select('*').gte('day', since)),
    q(sb.from('measurements').select('*')),
    q(sb.from('body_measures').select('*'))]);
  const by = (arr, id) => arr.filter(x => x.client_id === id);
  roster = profiles.map(p => shape(p, by(items,p.id), by(checkins,p.id), by(extras,p.id), by(measures,p.id), by(body,p.id)));
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
// Übungen einer Einheit: eingetragene oder aus dem Titel erraten (EMS, Spaziergang, Rad …)
function guessEx(t){ const s = t.title.toLowerCase(); if (t.kind === 'ems' || s.includes('ems')) return 'ems'; if (s.includes('nordic')) return 'nordic'; if (s.includes('spazier') || s.includes('schritte') || s.includes('walk')) return 'spaziergang'; if (s.includes('rad')) return 'radfahren'; if (s.includes('treppe')) return 'treppen'; return null; }
function itemMuscles(t){ if (t.exercises.length) return muscleLevels(t.exercises); const g = guessEx(t); return g ? muscleLevels([g]) : {}; }
function mergeLevels(list){ const out = {}; list.forEach(lv => { for (const k in lv) out[k] = Math.max(out[k] || 0, lv[k]); }); return out; }
function latestBody(c){ const v = {}, first = {}; for (const r of c.body) for (const [k] of MEASURES) if (r[k] != null) { if (first[k] == null) first[k] = +r[k]; v[k] = +r[k]; } return {v, first}; }

// ---------- Bausteine ----------
function ring(pct, size=96){ const r = size/2-9, C2 = 2*Math.PI*r; return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${pct} Prozent erledigt"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="10"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C2*pct/100} ${C2}" transform="rotate(-90 ${size/2} ${size/2})"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="${size/4.4}">${pct}%</text></svg>`; }
function head(c){ return `<div class="top"><div style="min-width:0"><div class="label">${esc(c.p.type_label)}</div><h1>Hallo ${esc(c.p.name || 'du')}</h1></div><button class="avatar" data-act="menu" aria-label="Abmelden">${esc((c.p.name||'?')[0].toUpperCase())}</button></div>`; }
function strip(c){
  const T = today();
  return `<div class="strip">${weekDates().map(d => { const s = dayStatus(c,d); const cls = [iso(d) === iso(T) ? 'today' : '', d > T ? '' : s.total && s.done === s.total ? 'full' : s.done ? 'part' : '', s.total ? '' : 'rest'].join(' '); return `<div class="sd ${cls}">${DAYNAMES[dayKey(d)].slice(0,2)}<i>${d.getDate()}</i></div>`; }).join('')}</div>`;
}
function taskBtn(t, isDone){
  const hasEx = t.exercises.length > 0;
  return `<button class="task ${isDone?'is-done':''}" data-act="${hasEx ? 'openitem' : 'toggle'}" data-id="${t.id}" aria-pressed="${isDone}"><span class="box"></span><span class="t-body"><span class="t-title">${esc(t.title)}</span><span class="row" style="gap:6px;margin-top:4px;flex-wrap:wrap"><span class="chip ${t.kind}">${KINDS[t.kind]}</span>${t.min?`<span class="chip">${t.min} Min</span>`:''}${hasEx?`<span class="chip">${t.exercises.length} Übungen</span>`:''}${t.note?`<span class="small muted">${esc(t.note)}</span>`:''}</span></span>${hasEx && !isDone ? '<span class="go">START ›</span>' : ''}</button>`;
}
function muscleChips(lv){ const hot = Object.keys(lv).filter(k => lv[k] >= 1), warm = Object.keys(lv).filter(k => lv[k] < 1); return `<div class="musclelist">${hot.map(k => `<span class="chip kraft">${BODY.NAMES[k]}</span>`).join('')}${warm.map(k => `<span class="chip">${BODY.NAMES[k]}</span>`).join('')}</div>`; }
function routineCard(r){ const first = EXMAP[r.items[0][0]]; return `<div class="routine"><div class="row between" style="align-items:flex-start"><div class="label" style="color:var(--accent)">${r.min} Min · ${r.items.length} Übungen · ${r.ort === 'studio' ? 'Studio' : 'Zuhause'}</div><div class="mini">${ANIM.svg(first.anim, muscleLevels(r.items.map(i => i[0])), gender())}</div></div><h2>${esc(r.name)}</h2><div class="small muted">${esc(r.info)}</div><button class="btn" data-act="startroutine" data-id="${r.id}">Starten</button></div>`; }

// ---------- Ansichten Kunde ----------
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
  return `${head(c)}<div class="stack">
  ${strip(c)}
  ${due ? `<div class="reminder"><b>Erinnerung:</b> ${open.map(t => esc(t.title)).join(', ')} ${open.length===1?'wartet':'warten'} noch auf dich.</div>` : ''}
  <div class="card hi today-head">${ring(pct)}<div class="stack" style="gap:4px;min-width:0"><div class="label">${DAYNAMES[dayKey(T)]}, ${T.toLocaleDateString('de-DE',{day:'numeric',month:'long'})}</div><h2>${msg}</h2><div class="muted small">${streak(c)} ${streak(c) === 1 ? 'Tag' : 'Tage'} in Folge aktiv</div></div></div>
  ${c.p.coach_note ? `<div class="coachmsg"><div class="label" style="color:var(--accent)">Nachricht von Jonathan</div><div>${esc(c.p.coach_note)}</div></div>` : ''}
  <h2>Dein Programm heute</h2>
  ${items.map(t => taskBtn(t, done.includes(t.id))).join('') || `<div class="card muted">${noPlan ? 'Jonathan erstellt gerade deinen persönlichen Plan.' : 'Für heute ist nichts geplant.'}</div>`}
  ${Object.keys(lv).length ? `<div class="card stack"><div class="label">Heute trainiert</div>${BODY.pair(lv)}${muscleChips(lv)}</div>` : ''}
  <div class="stack" style="gap:10px"><h2>${items.length ? 'Lust auf mehr?' : 'Für deinen freien Tag'}</h2>${routineCard(sugg)}<button class="btn link" data-tab="uebungen">Alle Übungen und Programme ansehen</button></div>
  ${ex.length ? `<div class="card stack" style="gap:8px"><div class="label">Extra heute</div>${ex.map(x => `<div class="row between"><span>${esc(x.title)}</span><span class="row" style="gap:6px"><span class="chip">${x.min} Min</span><button class="btn link" style="color:var(--danger)" data-act="delextra" data-id="${x.id}">Löschen</button></span></div>`).join('')}</div>` : ''}
  <details class="card"><summary style="font-weight:700;cursor:pointer;min-height:28px">+ Eigene Extra-Einheit eintragen</summary>
   <form class="stack sheet" data-form="extra" style="margin-top:12px"><div class="formrow"><label class="field"><span class="small muted">Was hast du gemacht?</span><input id="exTitle" required maxlength="80" placeholder="z. B. Schwimmen, Wandern"></label><label class="field" style="flex:0 0 110px"><span class="small muted">Minuten</span><input id="exMin" type="number" min="1" max="600" value="30" required></label></div><button class="btn">Speichern</button></form></details>
  <div class="card row between"><div><div class="label">Erinnerung</div><div>Täglich ab <b>${esc(rem)}</b> Uhr, falls noch etwas offen ist</div></div><input id="remTime" type="time" value="${esc(rem)}" style="width:auto" aria-label="Uhrzeit der Erinnerung"></div>
  </div>`;
}
function viewWoche(c){
  const wd = weekDates();
  return `${head(c)}<div class="stack">
  <div class="stats"><div class="stat"><b>${weekRate(c)}%</b><span class="small muted">erledigt</span></div><div class="stat"><b>${weekMinutes(c)}</b><span class="small muted">aktive Min.</span></div><div class="stat"><b>${streak(c)}</b><span class="small muted">Tage Serie</span></div></div>
  ${strip(c)}
  <div class="card daylist">${wd.map(d => { const items = c.plan[dayKey(d)] || [], done = c.done[iso(d)] || []; return `<div class="dayline"><div style="min-width:0"><b>${DAYNAMES[dayKey(d)]}</b><div class="small muted">${items.map(t => (done.includes(t.id)?'✓ ':'') + esc(t.title) + (t.exercises.length ? ` (${t.exercises.length} Übungen)` : '')).join(' · ') || 'Ruhetag'}</div></div><span class="small muted" style="flex:none">${items.length ? items.reduce((a,t) => a+(t.min||0), 0) + ' Min' : ''}</span></div>`; }).join('')}</div>
  <div class="card stack"><div class="label">Muskeln diese Woche</div>${BODY.pair(mergeLevels(DAYS.flatMap(k => c.plan[k].map(itemMuscles))))}</div>
  </div>`;
}
function viewUebungen(c){
  const FILTERS = [['alle','Alle'],['zuhause','Zuhause'],['studio','Studio'],['mobility','Beweglichkeit'],['ausdauer','Ausdauer']];
  const list = EX.filter(e => e.id !== 'ems').filter(e => exFilter === 'alle' ? true : exFilter === 'mobility' || exFilter === 'ausdauer' ? e.kat === exFilter : e.ort === exFilter || e.ort === 'beides')
                 .filter(e => !muscleSel || e.m.includes(muscleSel) || e.s.includes(muscleSel));
  const lv = muscleSel ? {[muscleSel]: 1} : {};
  return `${head(c)}<div class="stack">
  <h2>Programme für zuhause</h2>
  <div class="routines">${ROUTINES.filter(r => r.ort === 'zuhause').map(routineCard).join('')}</div>
  <h2>Programme fürs Studio</h2>
  <div class="routines">${ROUTINES.filter(r => r.ort === 'studio').map(routineCard).join('')}</div>
  <h2>Übungen</h2>
  <div class="card stack"><div class="label">${muscleSel ? 'Übungen für: ' + BODY.NAMES[muscleSel] : 'Tipp auf einen Muskel'}</div>${BODY.pair(lv, {clickable:true})}${muscleSel ? '<button class="btn ghost" data-act="musclereset">Alle Muskeln zeigen</button>' : ''}</div>
  <div class="filters">${FILTERS.map(([k,l]) => `<button class="fchip" data-act="exfilter" data-id="${k}" aria-pressed="${exFilter===k}">${l}</button>`).join('')}</div>
  <div class="stack" style="gap:10px">${list.map(e => `<button class="exitem" data-act="openex" data-id="${e.id}"><span class="thumb">${ANIM.svg(e.anim, muscleLevels([e.id]), gender())}</span><span class="t-body"><span class="t-title">${esc(e.name)}</span><span class="small muted">${esc(ORT[e.ort])} · ${esc(e.geraet)} · ${esc(KAT[e.kat])}</span></span></button>`).join('') || '<div class="card muted">Keine Übung passt zu diesem Filter.</div>'}</div>
  <p class="credit">Übungen und Grafiken von Jonathan Coaching. Bei Schmerzen abbrechen und mit Jonathan sprechen.</p>
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
  <polygon points="${p.l},${H-p.b} ${pts} ${X(h.length-1)},${H-p.b}" fill="var(--accent-soft)"/>
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
  return `<div class="card stack"><div class="row between"><div class="label">Körpervermessung</div>${last ? `<span class="small muted">zuletzt ${shortDate(last)}</span>` : ''}</div>
   ${bodyPhoto(c, v)}
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
   <div class="row between"><span class="muted">Start ${fmt(g.start)} ${esc(g.unit)}</span><b style="font-family:var(--display);font-size:1.5rem;font-style:italic">${fmt(cur)} ${esc(g.unit)}</b><span class="muted">Ziel ${fmt(g.target)} ${esc(g.unit)}</span></div>
   <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
   <div>${pct >= 100 ? '<b>Ziel erreicht!</b> Zeit für ein neues mit Jonathan.' : `<b>${pct}% geschafft.</b> Noch ${fmt(diff)} ${esc(g.unit)} bis zum Ziel.`}</div>${chart(c)}
   <form class="stack sheet" data-form="measure"><label class="field"><span class="small muted">Neuer Wert in ${esc(g.unit)}</span><input id="mVal" type="text" inputmode="decimal" required placeholder="${fmt(cur)}"></label><button class="btn">Eintragen</button></form></div>`;
  }
  return `${head(c)}<div class="stack">${goalHtml}${bodyCard(c, false)}</div>`;
}
function badgesFor(c){
  const {pct} = goalPct(c), st = streak(c), ex = Object.values(c.extras).flat().length, aus = countDone(c,'ausdauer'), all = countDone(c);
  return [
   {t:'Erster Haken', d:'Die erste Einheit erledigt', got: all >= 1, m:'1'},
   {t:'Dranbleiber', d:'3 Tage in Folge aktiv', got: st >= 3, m:'3'},
   {t:'Wochensieger', d:'Eine ganze Woche komplett', got: fullWeeks(c) >= 1, m:'W'},
   {t:'Frischluft', d:'10 Ausdauer-Einheiten', got: aus >= 10, m:'10'},
   {t:'Extra-Meile', d:'Eine Extra-Einheit gemacht', got: ex >= 1, m:'+'},
   {t:'Workout-Profi', d:'5 Trainings mit Sätzen absolviert', got: c.workouts >= 5, m:'5'},
   {t:'Halbzeit', d:'50 % vom Ziel geschafft', got: pct >= 50, m:'½'},
   {t:'Ziel erreicht', d:'Dein großes Ziel geschafft', got: pct >= 100, m:'★'}];
}
function viewErfolge(c){
  const b = badgesFor(c), n = b.filter(x => x.got).length;
  return `${head(c)}<div class="stack"><div class="card hi"><div class="label">Kleine Erfolge</div><h2>${n} von ${b.length} gesammelt</h2><p class="muted" style="margin:6px 0 0">Jeder Haken zählt. ${countDone(c)} Einheiten hast du in den letzten Wochen geschafft.</p></div>
  <div class="badges">${b.map(x => `<div class="badge ${x.got?'got':''}"><span class="medal">${x.m}</span><b>${esc(x.t)}</b><span class="small muted">${esc(x.d)}</span></div>`).join('')}</div>
  <button class="btn ghost" data-act="logout">Abmelden</button></div>`;
}

// ---------- Vollbild: Übung, Training, Zusammenfassung ----------
function exDetail(e){
  const lv = muscleLevels([e.id]);
  return `<div class="wrap stack"><div class="top"><button class="btn ghost" data-act="closeov">← Zurück</button><span class="chip ${e.kat === 'ems' ? 'ems' : 'kraft'}">${esc(KAT[e.kat])}</span></div>
  <h1>${esc(e.name)}</h1>
  <div class="animbox">${ANIM.svg(e.anim, lv, gender())}</div>
  <div class="card stack"><div class="label">Diese Muskeln arbeiten</div>${BODY.pair(lv)}${muscleChips(lv)}</div>
  <div class="row" style="flex-wrap:wrap;gap:6px"><span class="chip">${esc(ORT[e.ort])}</span><span class="chip">${esc(e.geraet)}</span><span class="chip">${e.sets} × ${esc(e.reps)}</span></div>
  <div class="card stack"><div class="label">So geht's</div><ol class="steps">${e.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
  <div class="card stack"><div class="label" style="color:var(--accent)">Tipp</div><div>${esc(e.tip)}</div><div class="label" style="color:var(--warm)">Typischer Fehler</div><div>${esc(e.fehler)}</div></div>
  ${OV.back ? '' : '<button class="btn" data-act="startsingle" data-id="' + e.id + '">Diese Übung jetzt machen</button>'}</div>`;
}
function startWorkout(title, list, src){
  OV = {type:'workout', title, src, start: Date.now(), list: list.map(it => ({ex: it.ex, sets: +it.sets || 3, reps: String(it.reps || '10'), done: Array(+it.sets || 3).fill(false), kg: Array(+it.sets || 3).fill('')})).filter(it => EXMAP[it.ex])};
  openOverlay();
}
function viewWorkout(){
  const W = OV, total = W.list.reduce((a,x) => a + x.sets, 0), dn = W.list.reduce((a,x) => a + x.done.filter(Boolean).length, 0);
  const lv = muscleLevels(W.list);
  return `<div class="wrap stack"><div class="top"><button class="btn ghost" data-act="closeov">✕ Abbrechen</button><span class="small muted">${dn} / ${total} Sätze</span></div>
  <h1>${esc(W.title)}</h1>
  <div class="progress"><span style="width:${total ? dn/total*100 : 0}%"></span></div>
  <div class="card stack"><div class="label">Diese Muskeln trainierst du</div>${BODY.pair(lv)}</div>
  ${W.list.map((it, i) => { const e = EXMAP[it.ex], sec = secondsOf(it.reps); return `<div class="card stack"><div class="exhead"><div class="mini">${ANIM.svg(e.anim, muscleLevels([e.id]), gender())}</div><div style="min-width:0"><div class="label">Übung ${i+1}</div><h3>${esc(e.name)}</h3><div class="small muted">${it.sets} × ${esc(it.reps)}${sec ? ' · Timer startet beim Antippen' : ''}</div><button class="btn ghost" style="min-height:38px;padding:6px 12px;margin-top:6px" data-act="exinfo" data-id="${e.id}">So geht's</button></div></div>
    <div class="stack" style="gap:8px"><div class="setrow small muted"><span>Satz</span><span>${sec ? 'Zeit' : 'Wdh.'}</span><span>${e.ort === 'studio' ? 'kg' : ''}</span><span></span></div>
    ${it.done.map((d, s) => `<div class="setrow"><span class="n">${s+1}</span><span>${esc(it.reps)}</span>${e.ort === 'studio' ? `<input data-kg="${i}-${s}" inputmode="decimal" value="${esc(it.kg[s])}" aria-label="Gewicht Satz ${s+1}">` : '<span></span>'}<button class="setbtn ${d ? 'on' : ''}" data-act="set" data-id="${i}-${s}" aria-label="Satz ${s+1} erledigt" aria-pressed="${d}"></button></div>`).join('')}</div></div>`; }).join('')}
  <button class="btn" data-act="finish">${dn === total ? 'Training abschließen' : 'Training beenden'}</button>
  ${W.src.item ? '<button class="btn link" data-act="quickdone">Ohne Sätze abhaken</button>' : ''}</div>`;
}
function viewSummary(){
  const S = OV, lv = muscleLevels(S.list.filter(x => x.done.some(Boolean)));
  return `<div class="wrap stack" style="padding-top:28px"><div class="label" style="color:var(--accent)">Geschafft</div><h1>${esc(S.title)}</h1>
  <div class="stats"><div class="stat"><b>${S.min}</b><span class="small muted">Minuten</span></div><div class="stat"><b>${S.sets}</b><span class="small muted">Sätze</span></div><div class="stat"><b>${S.exCount}</b><span class="small muted">Übungen</span></div></div>
  <div class="card hi stack"><div class="label">Trainierte Muskeln</div>${BODY.pair(lv)}${muscleChips(lv)}</div>
  <button class="btn" data-act="closeov">Fertig</button></div>`;
}
function openOverlay(){ document.body.style.overflow = 'hidden'; document.getElementById('layer').innerHTML = '<div class="overlay" id="ov"></div><div id="timerbox"></div>'; renderOverlay(); }
function closeOverlay(){ OV = null; stopTimer(); document.body.style.overflow = ''; document.getElementById('layer').innerHTML = ''; }
function renderOverlay(){
  const ov = document.getElementById('ov'); if (!ov || !OV) return;
  ov.innerHTML = OV.type === 'ex' ? exDetail(EXMAP[OV.id]) : OV.type === 'workout' ? viewWorkout() : viewSummary();
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
  tb.innerHTML = `<div class="timer"><div class="in"><div><div class="label" style="color:${timer.mode === 'rest' ? 'var(--accent)' : 'var(--warm)'}">${timer.mode === 'rest' ? 'Pause' : 'Halten'}</div><b>${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}</b></div><div class="row">${timer.mode === 'rest' ? '<button class="btn ghost" data-act="timerplus">+15 s</button>' : ''}<button class="btn" data-act="timerskip">${timer.mode === 'rest' ? 'Weiter' : 'Fertig'}</button></div></div></div>`;
  if (left <= 0) { const cb = timer.onDone; stopTimer(); if (navigator.vibrate) navigator.vibrate(200); if (cb) cb(); }
}
function markSet(i, s){
  const it = OV.list[i]; it.done[s] = !it.done[s]; renderOverlay();
  if (it.done[s]) startTimer('rest', EXMAP[it.ex].kat === 'mobility' ? 20 : 60);
}
async function finishWorkout(){
  const W = OV, sets = W.list.reduce((a,x) => a + x.done.filter(Boolean).length, 0);
  if (!sets) { toast('Hake mindestens einen Satz ab oder brich ab.'); return; }
  const min = Math.max(1, Math.round((Date.now() - W.start) / 60000));
  const details = {sets: W.list.map(x => ({ex: x.ex, reps: x.reps, done: x.done.filter(Boolean).length, kg: x.kg.filter(Boolean)}))};
  const k = iso(today());
  if (W.src.item) {
    await q(sb.from('checkins').upsert({client_id: me.id, item_id: W.src.item, day: k, details}, {onConflict: 'item_id,day'}));
  } else {
    await q(sb.from('extras').insert({client_id: me.id, day: k, title: W.title, minutes: min, details}));
  }
  C = await loadClient(me.id);
  stopTimer();
  OV = {type:'summary', title: W.title, list: W.list, min: W.src.item ? (findItem(W.src.item)?.min || min) : min, sets, exCount: W.list.filter(x => x.done.some(Boolean)).length};
  renderOverlay(); document.getElementById('ov').scrollTop = 0; render();
}
function findItem(id){ for (const k of DAYS) { const t = C.plan[k].find(x => x.id === id); if (t) return t; } return null; }

// ---------- Ansichten Coach ----------
function viewCoach(){
  if (coachSel) return viewCoachEdit(roster.find(c => c.p.id === coachSel));
  const pending = roster.filter(c => c.p.role === 'pending'), active = roster.filter(c => c.p.role === 'client');
  return `<div class="top"><div><div class="label">Coach-Bereich</div><h1>Deine Kunden</h1></div><button class="avatar" data-act="menu" aria-label="Abmelden" style="color:var(--warm)">J</button></div>
  <div class="stack">
  ${pending.length ? `<div class="card stack"><div class="label">Neue Anmeldungen</div>${pending.map(c => `<div class="row between" style="flex-wrap:wrap"><div style="min-width:0"><b>${esc(c.p.name||'Ohne Namen')}</b><div class="small muted" style="word-break:break-all">${esc(c.p.email)}</div></div><div class="row" style="gap:6px"><select id="type-${c.p.id}" style="width:auto">${TYPES.map(t => `<option>${t}</option>`).join('')}</select><button class="btn" data-act="approve" data-id="${c.p.id}">Freischalten</button></div></div>`).join('<hr class="sep">')}</div>` : ''}
  ${active.map(c => { const r = weekRate(c), {pct} = goalPct(c); return `<button class="pick" data-act="coachsel" data-id="${c.p.id}"><span class="avatar">${esc((c.p.name||'?')[0].toUpperCase())}</span><span class="t-body"><b>${esc(c.p.name)}${c.p.age?', '+c.p.age:''}</b> <span class="chip">${esc(c.p.type_label)}</span><span class="small muted" style="display:block;margin-top:4px">Diese Woche ${r}% · ${weekMinutes(c)} Min · Ziel ${pct}%</span><span class="bar" style="display:block;margin-top:8px;height:8px"><span style="width:${r}%;${r<50?'background:var(--warm)':''}"></span></span></span></button>`; }).join('') || (pending.length ? '' : `<div class="card stack"><h2>Noch keine Kunden</h2><p class="muted" style="margin:0">Schick deinen Kunden den Link zur App. Mit Einladungscode sind sie sofort freigeschaltet, sonst erscheinen sie hier unter „Neue Anmeldungen“.</p></div>`)}
  <div class="card stack"><div class="label">Einladungscodes</div><p class="small muted" style="margin:0">Wer bei der Registrierung einen aktiven Code eingibt, ist sofort freigeschaltet.</p>${codes.map(k => `<form class="row" data-form="code" data-id="${k.id}" style="flex-wrap:wrap"><label class="field" style="min-width:120px"><span class="small muted">${esc(k.type_label)}</span><input id="code-${k.id}" value="${esc(k.code)}" required maxlength="30" autocapitalize="characters"></label><button class="btn" style="align-self:flex-end">Speichern</button><button type="button" class="btn ghost" style="align-self:flex-end" data-act="codeactive" data-id="${k.id}">${k.active ? 'Aktiv' : 'Aus'}</button></form>`).join('')}</div>
  <div class="card stack"><div class="label">Link für Kunden</div><div style="word-break:break-all"><b>${esc(location.origin + location.pathname)}</b></div><button class="btn ghost" data-act="copylink">Link kopieren</button></div>
  <button class="btn ghost" data-act="logout">Abmelden</button></div>`;
}
const exOptions = () => Object.entries(KAT).map(([k,l]) => `<optgroup label="${l}">${EX.filter(e => e.kat === k).map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join('')}</optgroup>`).join('');
function exEditor(t){
  return `<div class="stack sheet" style="gap:8px">
   ${t.exercises.map((x, i) => `<div class="row" style="flex-wrap:wrap;gap:6px"><span style="flex:1;min-width:140px">${esc(EXMAP[x.ex]?.name || x.ex)}</span><input data-exsets="${i}" type="number" min="1" max="10" value="${x.sets}" style="width:64px" aria-label="Sätze"><input data-exreps="${i}" value="${esc(x.reps)}" style="width:110px" aria-label="Wiederholungen"><button class="btn link" style="color:var(--danger)" data-act="exdel" data-id="${i}">✕</button></div>`).join('') || '<span class="small muted">Noch keine Übungen.</span>'}
   <div class="formrow"><select id="exAdd" style="flex:2;min-width:170px">${exOptions()}</select><button class="btn ghost" data-act="exadd">+ Übung</button></div>
   <div class="formrow"><select id="exRoutine" style="flex:2;min-width:170px">${ROUTINES.map(r => `<option value="${r.id}">Vorlage: ${esc(r.name)}</option>`).join('')}</select><button class="btn ghost" data-act="exroutine">Einsetzen</button></div>
   <button class="btn" data-act="exsave" data-id="${t.id}">Übungen speichern</button></div>`;
}
function viewCoachEdit(c){
  const p = c.p;
  return `<div class="top"><button class="btn ghost" data-act="coachback">← Kunden</button><span class="avatar">${esc((p.name||'?')[0].toUpperCase())}</span></div>
  <div class="stack"><h1>${esc(p.name)}</h1>
  <div class="stats"><div class="stat"><b>${weekRate(c)}%</b><span class="small muted">diese Woche</span></div><div class="stat"><b>${weekMinutes(c)}</b><span class="small muted">aktive Min.</span></div><div class="stat"><b>${streak(c)}</b><span class="small muted">Tage Serie</span></div></div>
  <form class="card stack" data-form="note"><div class="label">Nachricht an ${esc(p.name)}</div><textarea id="noteTxt" rows="3" maxlength="500">${esc(p.coach_note)}</textarea><button class="btn">Nachricht speichern</button></form>
  <div class="card stack"><div class="label">Wochenplan</div>${DAYS.map(k => `<div class="stack" style="gap:6px"><b>${DAYNAMES[k]}</b>${c.plan[k].map(t => `<div style="border:1px solid var(--line);border-radius:12px;padding:8px 10px"><div class="row between" style="flex-wrap:wrap"><span style="min-width:0">${esc(t.title)} <span class="chip ${t.kind}">${KINDS[t.kind]}</span>${t.min?` <span class="chip">${t.min} Min</span>`:''}</span><span class="row" style="gap:4px"><button class="btn link" data-act="exedit" data-id="${t.id}">Übungen (${t.exercises.length})</button><button class="btn link" style="color:var(--danger)" data-act="delitem" data-id="${t.id}">Entfernen</button></span></div>${coachEx && coachEx.id === t.id ? exEditor(coachEx) : ''}</div>`).join('') || '<span class="small muted">Ruhetag</span>'}</div>`).join('')}</div>
  <form class="card stack" data-form="add"><div class="label">Einheit hinzufügen</div>
   <label class="field"><span class="small muted">Was?</span><input id="aTitle" required maxlength="80" placeholder="z. B. Rücken-Fit zuhause"></label>
   <div class="formrow"><label class="field"><span class="small muted">Tag</span><select id="aDay">${DAYS.map((k,i) => `<option value="${i}">${DAYNAMES[k]}</option>`).join('')}</select></label><label class="field"><span class="small muted">Art</span><select id="aKind">${Object.entries(KINDS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}</select></label><label class="field" style="flex:0 0 100px"><span class="small muted">Minuten</span><input id="aMin" type="number" min="0" value="30"></label></div>
   <label class="field"><span class="small muted">Übungen aus Vorlage (optional)</span><select id="aRoutine"><option value="">Keine – später einzeln hinzufügen</option>${ROUTINES.map(r => `<option value="${r.id}">${esc(r.name)} (${r.min} Min)</option>`).join('')}</select></label>
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
  return `<div class="auth stack"><div><div class="label">Jonathan Coaching</div><h1>${reg ? 'Konto erstellen' : 'Willkommen zurück'}</h1><p class="muted" style="margin:6px 0 0">Dein persönlicher Trainingsplan, deine Erfolge, dein Ziel.</p></div>
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
const TABS = {heute:['Heute','<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'], woche:['Woche','<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'], uebungen:['Übungen','<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>'], koerper:['Körper','<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M8 10l4 1 4-1M10 21l2-6 2 6"/>'], erfolge:['Erfolge','<circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7"/>']};
function render(){
  const app = document.getElementById('app'), tabs = document.getElementById('tabs');
  tabs.hidden = true;
  if (!session) { app.innerHTML = viewAuth(); return; }
  if (!me) { app.innerHTML = '<div class="loading">Lädt …</div>'; return; }
  if (me.role === 'coach') { app.innerHTML = viewCoach(); return; }
  if (me.role !== 'client' || !C) { app.innerHTML = viewPending(); return; }
  app.innerHTML = ({heute:viewHeute, woche:viewWoche, uebungen:viewUebungen, koerper:viewKoerper, erfolge:viewErfolge})[tab](C);
  tabs.hidden = false;
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
    if (a === 'quickdone') { const k = iso(today()); (C.done[k] ||= []).includes(OV.src.item) || C.done[k].push(OV.src.item); await q(sb.from('checkins').upsert({client_id: me.id, item_id: OV.src.item, day: k}, {onConflict: 'item_id,day'})); closeOverlay(); toast('Abgehakt. Weiter so!'); render(); return; }
    // Übungen-Seite
    if (a === 'exfilter') { exFilter = id; }
    if (a === 'musclereset') { muscleSel = null; }
    // Anmeldung und Kunde
    if (a === 'mode') { authMode = b.dataset.mode; authMsg = ''; }
    if (a === 'menu') { if (me.role === 'coach') { scrollTo(0, document.body.scrollHeight); return; } tab = 'erfolge'; render(); scrollTo(0, document.body.scrollHeight); toast('Abmelden findest du unten'); return; }
    if (a === 'logout') { await sb.auth.signOut(); session = null; me = null; C = null; roster = []; coachSel = null; tab = 'heute'; }
    if (a === 'reload') { await boot(); return; }
    if (a === 'toggle') {
      const k = iso(today()), arr = C.done[k] ||= [], i = arr.indexOf(id);
      if (i >= 0) { arr.splice(i,1); render(); await q(sb.from('checkins').delete().eq('item_id', id).eq('day', k)); }
      else { arr.push(id); const items = C.plan[dayKey(today())]; toast(arr.length === items.length ? 'Tagesziel geschafft!' : 'Abgehakt. Weiter so!'); render(); await q(sb.from('checkins').insert({client_id: me.id, item_id: id, day: k})); }
      return;
    }
    if (a === 'delextra') { await q(sb.from('extras').delete().eq('id', id)); C = await loadClient(me.id); toast('Gelöscht'); }
    // Coach
    if (a === 'approve') { const type = document.getElementById('type-'+id).value; await q(sb.from('profiles').update({role:'client', type_label:type}).eq('id', id)); await loadRoster(); coachSel = id; toast('Freigeschaltet. Jetzt Plan und Ziel anlegen.'); }
    if (a === 'codeactive') { const k = codes.find(x => x.id === id); await q(sb.from('invite_codes').update({active: !k.active}).eq('id', id)); await loadCodes(); toast(k.active ? 'Code ausgeschaltet' : 'Code eingeschaltet'); }
    if (a === 'coachsel') { coachSel = id; coachEx = null; render(); scrollTo(0,0); return; }
    if (a === 'coachback') { coachSel = null; coachEx = null; await loadRoster(); }
    if (a === 'delitem') { await q(sb.from('plan_items').delete().eq('id', id)); await refreshCoachClient(coachSel); toast('Einheit entfernt'); }
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
document.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.kg; if (k && OV && OV.list) { const [i, s] = k.split('-').map(Number); OV.list[i].kg[s] = e.target.value; } });

document.addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target.dataset.form, v = id => document.getElementById(id).value.trim();
  const y = scrollY;
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
  if (e.target.id !== 'remTime' || !e.target.value) return;
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

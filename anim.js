// Animiertes Übungs-Männchen (Seitenansicht, schaut nach rechts). Boden bei y = 0, oben ist negativ.
// Eine Bewegung besteht aus Schlüssel-Posen; dazwischen wird weich übergeblendet.
// Pose: hip [x,y], lean (Oberkörper-Neigung in Grad, 0 = aufrecht, + nach vorne), curve (Rundung der Wirbelsäule),
// tilt (Kopf), an/af = Knöchel nah/fern, hn/hf = Hände (bei rel:true relativ zur Schulter),
// fn/ff = Fußwinkel (90 = flach nach vorne, 0 = Zehen nach unten), kn/kf/en/ef = Beugerichtung von Knie/Ellbogen (±1).
const ANIM = (() => {
  const L = {torso: 58, neck: 8, head: 12, ua: 30, fa: 27, th: 42, sh: 40, ft: 13};
  const R = Math.PI / 180;
  const dir = a => [Math.sin(a * R), -Math.cos(a * R)];
  const STAND = {hip: [0, -86], lean: 3, curve: 0, tilt: 0, an: [4, -6], af: [-4, -6], hn: [9, -90], hf: [1, -90], fn: 90, ff: 90, kn: -1, kf: -1, en: 1, ef: 1};

  function ik(r, t, l1, l2, sign){
    const dx = t[0] - r[0], dy = t[1] - r[1];
    let d = Math.hypot(dx, dy); d = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.5), l1 + l2 - 0.01);
    const a = Math.atan2(dy, dx), b = Math.acos((l1*l1 + d*d - l2*l2) / (2*l1*d)), ang = a + sign*b;
    const mid = [r[0] + l1*Math.cos(ang), r[1] + l1*Math.sin(ang)];
    const ea = Math.atan2(t[1] - mid[1], t[0] - mid[0]);
    return [mid, [mid[0] + l2*Math.cos(ea), mid[1] + l2*Math.sin(ea)]];
  }
  function solve(p){
    const hip = p.hip, d = dir(p.lean), sh = [hip[0] + d[0]*L.torso, hip[1] + d[1]*L.torso];
    const hd = dir(p.lean + p.tilt), head = [sh[0] + hd[0]*(L.neck + L.head), sh[1] + hd[1]*(L.neck + L.head)];
    const neck = [sh[0] + hd[0]*L.neck, sh[1] + hd[1]*L.neck];
    const perp = [Math.cos(p.lean*R), Math.sin(p.lean*R)], mid = [(hip[0]+sh[0])/2 + perp[0]*p.curve, (hip[1]+sh[1])/2 + perp[1]*p.curve];
    const hand = h => p.rel ? [sh[0] + h[0], sh[1] + h[1]] : h;
    const [kN, aN] = ik(hip, p.an, L.th, L.sh, p.kn), [kF, aF] = ik(hip, p.af, L.th, L.sh, p.kf);
    const [eN, hN] = ik(sh, hand(p.hn), L.ua, L.fa, p.en), [eF, hF] = ik(sh, hand(p.hf), L.ua, L.fa, p.ef);
    const toe = (a, f) => [a[0] + Math.sin(f*R)*L.ft, a[1] + Math.cos(f*R)*L.ft];
    return {hip, sh, mid, neck, head, kN, aN, tN: toe(aN, p.fn), kF, aF, tF: toe(aF, p.ff), eN, hN, eF, hF};
  }
  const lerp = (a, b, t) => typeof a === 'number' ? a + (b - a)*t : a.map((v, i) => v + (b[i] - v)*t);
  function blend(A, B, t){ const o = {}; for (const k in A) o[k] = (k === 'rel' || /^[ke][nf]$/.test(k)) ? (t < .5 ? A[k] : B[k]) : lerp(A[k], B[k], t); return o; }
  const P = (o) => Object.assign({}, STAND, o);

  // ---------- Bewegungen ----------
  const squatB = {hip: [-30, -50], lean: 42, hn: [56, -112], hf: [52, -112], en: -1, ef: -1};
  const quad = {hip: [-32, -50], lean: 80, an: [-74, -7], af: [-72, -7], hn: [27, -6], hf: [24, -6], fn: 180, ff: 180, kn: -1, kf: -1, en: -1, ef: -1, tilt: 10};
  const supine = {hip: [0, -13], lean: -90, an: [34, -6], af: [30, -6], hn: [2, -7], hf: [-2, -7], kn: -1, kf: -1, en: -1, ef: -1};
  const seated = {hip: [-12, -50], lean: -2, an: [30, -6], af: [26, -6], kn: -1, kf: -1};
  const walkF = (s) => ({hip: [0, -84], lean: 5, an: s ? [24, -6] : [-20, -9], af: s ? [-20, -9] : [24, -6], fn: s ? 80 : 40, ff: s ? 40 : 80, hn: s ? [-12, -92] : [26, -96], hf: s ? [26, -96] : [-12, -92]});
  const walkM = (s) => ({hip: [0, -87], lean: 5, an: s ? [2, -6] : [8, -26], af: s ? [8, -26] : [2, -6], fn: 90, ff: 90, hn: [7, -90], hf: [5, -90]});
  const pedal = (k) => { const c = [14, -34], r = 15, a = k * Math.PI/2; return {hip: [-26, -84], lean: 32, an: [c[0] + r*Math.cos(a), c[1] + r*Math.sin(a)], af: [c[0] - r*Math.cos(a), c[1] - r*Math.sin(a)], hn: [44, -116], hf: [42, -116], en: -1, ef: -1}; };
  const prop = {
    chair: '<g class="prop"><rect x="-66" y="-50" width="40" height="6" rx="2"/><rect x="-66" y="-50" width="5" height="50"/><rect x="-31" y="-50" width="5" height="50"/><rect x="-66" y="-100" width="5" height="52"/></g>',
    wallR: '<rect class="prop" x="66" y="-190" width="10" height="190"/>',
    wallL: '<rect class="prop" x="-66" y="-190" width="10" height="190"/>',
    step: '<rect class="prop" x="0" y="-26" width="58" height="26" rx="2"/>',
    bench: '<g class="prop"><rect x="-90" y="-46" width="125" height="8" rx="3"/><rect x="-80" y="-38" width="6" height="38"/><rect x="18" y="-38" width="6" height="38"/></g>',
    seat: '<g class="prop"><rect x="-40" y="-44" width="50" height="7" rx="3"/><rect x="-18" y="-37" width="6" height="37"/></g>',
    benchRow: '<g class="prop"><rect x="34" y="-62" width="62" height="8" rx="3"/><rect x="62" y="-54" width="6" height="54"/></g>',
    legpress: '<g class="prop"><rect x="-86" y="-38" width="56" height="7" rx="3" transform="rotate(-38 -58 -34)"/><rect x="-62" y="-31" width="6" height="31"/></g>',
    bike: '<g class="prop prop-line"><circle cx="-44" cy="-22" r="22"/><circle cx="66" cy="-22" r="22"/><path d="M-44,-22 L14,-34 L-24,-84 M14,-34 L48,-104 L66,-22 M-34,-86 L-14,-86 M40,-114 L54,-116"/></g>',
    mat: '<rect class="prop" x="-98" y="-3" width="196" height="3" rx="1.5"/>'
  };
  const M = {
    squat: {frames: [P({}), P(squatB)]},
    squatChair: {frames: [P({}), P({hip: [-34, -58], lean: 36, hn: [52, -116], hf: [48, -116], en: -1, ef: -1})], props: [prop.chair]},
    goblet: {frames: [P({rel: true, hn: [16, 24], hf: [14, 24], en: 1, ef: 1}), P({...squatB, rel: true, hn: [16, 24], hf: [14, 24], en: 1, ef: 1})], dumbbell: true},
    lunge: {frames: [P({}), P({hip: [-14, -50], lean: 6, an: [26, -6], af: [-50, -6], ff: 10, kf: -1, hn: [-4, -56], hf: [-8, -56]})]},
    bridge: {frames: [P({...supine}), P({...supine, hip: [0, -40], lean: -115, tilt: 25})], props: [prop.mat]},
    wallPush: {frames: [P({hip: [-4, -84], lean: 22, an: [-16, -6], af: [-20, -6], hn: [64, -132], hf: [64, -128], en: 1, ef: 1}), P({hip: [4, -82], lean: 33, an: [-16, -6], af: [-20, -6], hn: [64, -132], hf: [64, -128], en: 1, ef: 1})], props: [prop.wallR]},
    kneePush: {frames: [P({hip: [-12, -30], lean: 72, an: [-70, -14], af: [-72, -14], fn: 200, ff: 200, kn: -1, kf: -1, hn: [50, -5], hf: [46, -5], en: 1, ef: 1}), P({hip: [-10, -18], lean: 82, an: [-70, -12], af: [-72, -12], fn: 200, ff: 200, kn: -1, kf: -1, hn: [50, -5], hf: [46, -5], en: 1, ef: 1})], props: [prop.mat]},
    birddog: {frames: [P(quad), P({...quad, hn: [94, -58], af: [-114, -56], ff: 180})], props: [prop.mat]},
    catcow: {frames: [P({...quad, curve: -12, tilt: 40}), P({...quad, curve: 9, tilt: -20})], props: [prop.mat]},
    plank: {frames: [P({hip: [-22, -25], lean: 78, an: [-102, -8], af: [-100, -8], fn: 10, ff: 10, hn: [62, -6], hf: [58, -6], en: 1, ef: 1, tilt: 6}), P({hip: [-22, -27], lean: 78, an: [-102, -8], af: [-100, -8], fn: 10, ff: 10, hn: [62, -6], hf: [58, -6], en: 1, ef: 1, tilt: 6})], props: [prop.mat], dur: 1.8},
    sidePlank: {frames: [P({hip: [-22, -16], lean: 80, an: [-102, -8], af: [-100, -8], fn: 10, ff: 10, hn: [62, -6], hf: [40, -60], en: 1, ef: 1}), P({hip: [-22, -30], lean: 76, an: [-102, -8], af: [-100, -8], fn: 10, ff: 10, hn: [62, -6], hf: [40, -80], en: 1, ef: 1})], props: [prop.mat]},
    deadbug: {frames: [P({...supine, an: [40, -56], af: [38, -56], kn: -1, kf: -1, hn: [-58, -70], hf: [-56, -70]}), P({...supine, an: [80, -22], af: [38, -56], kn: -1, kf: -1, hn: [-112, -22], hf: [-56, -70]})], props: [prop.mat]},
    calf: {frames: [P({}), P({hip: [0, -98], an: [4, -17], af: [-4, -17], fn: 35, ff: 35, hn: [9, -102], hf: [1, -102]})]},
    superman: {frames: [P({hip: [0, -11], lean: 90, an: [-82, -6], af: [-80, -6], fn: -90, ff: -90, kn: 1, kf: 1, hn: [112, -8], hf: [110, -8], en: -1, ef: -1, tilt: 10}), P({hip: [0, -12], lean: 76, an: [-82, -18], af: [-80, -18], fn: -90, ff: -90, kn: 1, kf: 1, hn: [106, -40], hf: [104, -40], en: -1, ef: -1, tilt: -6})], props: [prop.mat]},
    wallSit: {frames: [P({hip: [-40, -48], lean: 0, an: [4, -6], af: [0, -6], hn: [-6, -58], hf: [-10, -58], en: 1, ef: 1}), P({hip: [-40, -49], lean: 0, an: [4, -6], af: [0, -6], hn: [-6, -59], hf: [-10, -59], en: 1, ef: 1})], props: [prop.wallL], dur: 1.8},
    stepup: {frames: [P({hip: [-4, -82], an: [26, -32], af: [-8, -6], hn: [-6, -90], hf: [14, -94]}), P({hip: [20, -112], an: [26, -32], af: [40, -62], hn: [30, -118], hf: [8, -116]})], props: [prop.step]},
    balance: {frames: [P({af: [22, -46], hn: [36, -112], hf: [-26, -112]}), P({hip: [2, -86], lean: 1, af: [24, -48], hn: [38, -110], hf: [-24, -114]})], dur: 1.6},
    chestOpen: {frames: [P({hn: [30, -100], hf: [26, -100]}), P({lean: -4, tilt: -12, hn: [-26, -96], hf: [-30, -96], en: -1, ef: -1})]},
    hipFlexor: {frames: [P({hip: [-10, -48], lean: 0, an: [36, -6], af: [-60, -8], kf: -1, ff: 200, hn: [20, -64], hf: [16, -64]}), P({hip: [4, -45], lean: -6, an: [36, -6], af: [-60, -8], kf: -1, ff: 200, hn: [26, -62], hf: [22, -62]})], props: [prop.mat], dur: 1.6},
    openBook: {frames: [P({...supine, an: [26, -30], af: [24, -28], kn: -1, kf: -1, hn: [-52, -66], hf: [-52, -66]}), P({...supine, an: [26, -30], af: [24, -28], kn: -1, kf: -1, tilt: -20, hn: [-112, -14], hf: [-52, -66]})], props: [prop.mat], dur: 1.6},
    row: {frames: [P({hip: [-2, -84], lean: 14, hn: [66, -112], hf: [64, -112], en: 1, ef: 1}), P({hip: [-2, -84], lean: 10, hn: [6, -100], hf: [4, -100], en: 1, ef: 1})], band: [100, -112]},
    pullApart: {frames: [P({hn: [60, -130], hf: [58, -128], en: 1, ef: 1}), P({lean: -2, hn: [12, -130], hf: [-14, -130], en: 1, ef: 1})], bandBetween: true},
    sideWalk: {frames: [P({hip: [-12, -74], lean: 18, an: [10, -6], af: [-10, -6], hn: [36, -100], hf: [34, -100]}), P({hip: [-10, -76], lean: 18, an: [10, -6], af: [-8, -16], hn: [36, -100], hf: [34, -100]})], dur: .8},
    curl: {frames: [P({rel: true, hn: [6, 56], hf: [2, 56], en: -1, ef: -1}), P({rel: true, hn: [22, 2], hf: [18, 2], en: 1, ef: 1})], band: 'floor'},
    curlDb: {frames: [P({rel: true, hn: [6, 56], hf: [2, 56], en: -1, ef: -1}), P({rel: true, hn: [22, 2], hf: [18, 2], en: 1, ef: 1})], dumbbell: true},
    rdl: {frames: [P({rel: true, hn: [6, 56], hf: [2, 56]}), P({hip: [-26, -80], lean: 72, rel: true, hn: [0, 56], hf: [-2, 56]})], dumbbell: true},
    dbRow: {frames: [P({hip: [-26, -80], lean: 78, an: [-6, -6], af: [-30, -6], rel: true, hn: [0, 56], hf: [24, 30], en: 1, ef: -1}), P({hip: [-26, -80], lean: 78, an: [-6, -6], af: [-30, -6], rel: true, hn: [-22, 20], hf: [24, 30], en: 1, ef: -1})], props: [prop.benchRow], dumbbell: 'near'},
    press: {frames: [P({...seated, rel: true, hn: [16, -4], hf: [12, -4], en: 1, ef: 1}), P({...seated, rel: true, hn: [6, -56], hf: [4, -56], en: 1, ef: 1})], props: [prop.seat], dumbbell: true},
    bench: {frames: [P({hip: [0, -50], lean: -90, an: [40, -6], af: [36, -6], kn: -1, kf: -1, rel: true, hn: [2, -56], hf: [0, -56], en: -1, ef: -1}), P({hip: [0, -50], lean: -90, an: [40, -6], af: [36, -6], kn: -1, kf: -1, rel: true, hn: [6, -14], hf: [4, -14], en: -1, ef: -1})], props: [prop.bench], bar: true},
    latPull: {frames: [P({...seated, lean: -8, rel: true, hn: [10, -56], hf: [8, -56], en: 1, ef: 1}), P({...seated, lean: -14, rel: true, hn: [20, -2], hf: [18, -2], en: 1, ef: 1})], props: [prop.seat], bar: true, cable: true},
    legPress: {frames: [P({hip: [-40, -46], lean: -52, an: [10, -76], af: [8, -74], fn: 160, ff: 160, kn: -1, kf: -1, hn: [-26, -48], hf: [-28, -48]}), P({hip: [-40, -46], lean: -52, an: [32, -108], af: [30, -106], fn: 160, ff: 160, kn: -1, kf: -1, hn: [-26, -48], hf: [-28, -48]})], props: [prop.legpress], platform: true},
    pushdown: {frames: [P({lean: 8, rel: true, hn: [30, 26], hf: [28, 26], en: 1, ef: 1}), P({lean: 8, rel: true, hn: [8, 56], hf: [6, 56], en: 1, ef: 1})], cable: true},
    walk: {frames: [P(walkF(1)), P(walkM(1)), P(walkF(0)), P(walkM(0))], loop: true, dur: .45},
    nordic: {frames: [P(walkF(1)), P(walkM(1)), P(walkF(0)), P(walkM(0))], loop: true, dur: .5, poles: true},
    bike: {frames: [P(pedal(0)), P(pedal(1)), P(pedal(2)), P(pedal(3))], loop: true, dur: .32, props: [prop.bike], linear: true}
  };

  // ---------- Zeichnen ----------
  const seg = (a, b, w, cls) => `<line class="${cls}" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke-width="${w}"/>`;
  function zones(levels){
    const z = {legs: 0, torso: 0, arms: 0}, pick = (k, v) => { z[k] = Math.max(z[k], v); };
    for (const [m, v] of Object.entries(levels || {})) {
      if (['oberschenkel_vorne','oberschenkel_hinten','po','waden'].includes(m)) pick('legs', v);
      if (['bauch','seitlich','unterer_ruecken','latissimus','ruecken_oben','brust'].includes(m)) pick('torso', v);
      if (['bizeps','trizeps','schultern','unterarme','brust'].includes(m)) pick('arms', v);
    }
    const c = v => v >= 1 ? ' hot' : v > 0 ? ' warm' : '';
    return {legs: c(z.legs), torso: c(z.torso), arms: c(z.arms)};
  }
  // Plastische Körperteile: verjüngte Kapseln mit Lichtkante, Rumpf als gefüllte Form
  const f1 = n => n.toFixed(1);
  function capsule(a, b, r1, r2, cls){
    const dx = b[0]-a[0], dy = b[1]-a[1], l = Math.hypot(dx, dy) || 1, nx = -dy/l, ny = dx/l;
    const pts = [[a[0]+nx*r1, a[1]+ny*r1], [b[0]+nx*r2, b[1]+ny*r2], [b[0]-nx*r2, b[1]-ny*r2], [a[0]-nx*r1, a[1]-ny*r1]];
    const s = nx*-0.5 + ny*-1 > 0 ? 1 : -1; // Licht kommt von oben links
    const h = [[a[0]+nx*r1*.42*s, a[1]+ny*r1*.42*s], [b[0]+nx*r2*.42*s, b[1]+ny*r2*.42*s]];
    return `<g class="${cls}"><path class="sk" d="M${pts.map(p => f1(p[0])+','+f1(p[1])).join(' L')} Z"/><circle class="sk" cx="${f1(a[0])}" cy="${f1(a[1])}" r="${r1}"/><circle class="sk" cx="${f1(b[0])}" cy="${f1(b[1])}" r="${r2}"/><line class="hl" x1="${f1(h[0][0])}" y1="${f1(h[0][1])}" x2="${f1(h[1][0])}" y2="${f1(h[1][1])}" stroke-width="${f1(Math.min(r1, r2)*.55)}"/></g>`;
  }
  const at = (a, b, t) => [a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t];
  function leg(hip, k, an, toe, cls, g){
    const calf = at(k, an, .32);
    return capsule(hip, k, g === 'w' ? 11.5 : 11, g === 'w' ? 7 : 7.5, cls) + capsule(k, calf, 7, g === 'w' ? 7.2 : 8, cls) + capsule(calf, an, g === 'w' ? 7.2 : 8, 4.5, cls) + capsule(an, toe, 4.6, 3.4, cls.replace(/ (hot|warm)/, ''));
  }
  function arm(sh, e, h, cls, g){
    const bi = at(sh, e, .45), fa = at(e, h, .3);
    return capsule(sh, bi, g === 'w' ? 6 : 7, g === 'w' ? 5.8 : 7.4, cls) + capsule(bi, e, g === 'w' ? 5.8 : 7.4, 5, cls) + capsule(e, fa, 5.2, g === 'w' ? 5 : 5.8, cls) + capsule(fa, h, g === 'w' ? 5 : 5.8, 3.6, cls) + `<g class="${cls}"><circle class="sk" cx="${f1(h[0])}" cy="${f1(h[1])}" r="4.6"/></g>`;
  }
  function torso(s, cls, g){
    // Breiten vorne/hinten entlang der Wirbelsäule (Hüfte → Schulter)
    const F = g === 'w' ? [11, 9.5, 9, 14.5, 9] : [11, 10.5, 10.5, 14, 10];
    const B = g === 'w' ? [15.5, 11, 9.5, 10.5, 10] : [14, 10.5, 10.5, 12.5, 11];
    const T = [0, .25, .45, .72, 1], q = t => { const u = 1-t; return [u*u*s.hip[0] + 2*u*t*s.mid[0] + t*t*s.sh[0], u*u*s.hip[1] + 2*u*t*s.mid[1] + t*t*s.sh[1]]; };
    const tan = t => { const a = q(Math.max(0, t-.02)), b = q(Math.min(1, t+.02)), l = Math.hypot(b[0]-a[0], b[1]-a[1]) || 1; return [(b[0]-a[0])/l, (b[1]-a[1])/l]; };
    const front = [], back = [];
    T.forEach((t, i) => { const c = q(t), d = tan(t), n = [-d[1], d[0]]; front.push([c[0] + n[0]*F[i], c[1] + n[1]*F[i]]); back.push([c[0] - n[0]*B[i], c[1] - n[1]*B[i]]); });
    const pts = front.concat(back.reverse());
    let d = `M${f1((pts[0][0]+pts[pts.length-1][0])/2)},${f1((pts[0][1]+pts[pts.length-1][1])/2)}`;
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i+1) % pts.length]; d += ` Q${f1(a[0])},${f1(a[1])} ${f1((a[0]+b[0])/2)},${f1((a[1]+b[1])/2)}`; }
    const hl = [q(.2), q(.85)].map(c => c), side = tan(.5), n = [-side[1], side[0]], sgn = n[0]*-0.5 + n[1]*-1 > 0 ? 1 : -1;
    return `<g class="${cls}"><path class="sk" d="${d} Z"/><line class="hl" x1="${f1(hl[0][0]+n[0]*6*sgn)}" y1="${f1(hl[0][1]+n[1]*6*sgn)}" x2="${f1(hl[1][0]+n[0]*7*sgn)}" y2="${f1(hl[1][1]+n[1]*7*sgn)}" stroke-width="5"/></g>`;
  }
  function figure(p, z, mv, g){
    const s = solve(p); let out = '';
    const near = 'part near', far = 'part far';
    if (mv.poles) out += seg(s.hF, [s.hF[0] - 30, -1], 2.5, 'pole');
    out += arm(s.sh, s.eF, s.hF, far + z.arms, g);
    out += leg(s.hip, s.kF, s.aF, s.tF, far + z.legs, g);
    out += torso(s, near + z.torso, g);
    out += capsule(s.sh, s.neck, 6, 5.5, near);
    const hd = dir(p.lean + p.tilt), ang = Math.atan2(hd[1], hd[0]) * 180 / Math.PI + 90;
    if (g === 'w') out += `<circle class="hair" cx="${f1(s.head[0] - hd[1]*-9 - hd[0]*2)}" cy="${f1(s.head[1] + hd[0]*-9 - hd[1]*2)}" r="7"/>`;
    out += `<g class="${near}"><ellipse class="sk" cx="${f1(s.head[0])}" cy="${f1(s.head[1])}" rx="10.5" ry="12.5" transform="rotate(${f1(ang)} ${f1(s.head[0])} ${f1(s.head[1])})"/></g>`;
    if (g === 'w') out += `<path class="hair" d="M${f1(s.head[0]-11)},${f1(s.head[1]-1)} A11.5,12.5 0 0 1 ${f1(s.head[0]+11)},${f1(s.head[1]-1)}" transform="rotate(${f1(ang)} ${f1(s.head[0])} ${f1(s.head[1])})"/>`;
    out += capsule(s.sh, at(s.sh, s.eN, .35), g === 'w' ? 8 : 9.5, 7, near + z.arms);
    out += leg(s.hip, s.kN, s.aN, s.tN, near + z.legs, g);
    out += arm(s.sh, s.eN, s.hN, near + z.arms, g);
    if (mv.dumbbell) for (const h of mv.dumbbell === 'near' ? [s.hN] : [s.hF, s.hN]) out += `<rect class="weight" x="${f1(h[0]-10)}" y="${f1(h[1]-4.5)}" width="20" height="9" rx="3"/>`;
    if (mv.bar) out += `<rect class="weight" x="${f1(s.hN[0]-4.5)}" y="${f1(s.hN[1]-4.5)}" width="9" height="9" rx="2"/>`;
    if (mv.band === 'floor') out += seg(s.hN, [s.aN[0] + 4, -2], 2.5, 'band');
    else if (mv.band) out += seg(s.hN, mv.band, 2.5, 'band');
    if (mv.bandBetween) out += seg(s.hN, s.hF, 2.5, 'band');
    if (mv.cable) out += seg(s.hN, [s.hN[0] + 2, -190], 2, 'band');
    if (mv.poles) out += seg(s.hN, [s.hN[0] - 30, -1], 2.5, 'pole');
    if (mv.platform) out += `<line class="prop-line" x1="${f1(s.tN[0]-18)}" y1="${f1(s.tN[1]-14)}" x2="${f1(s.tN[0]+10)}" y2="${f1(s.tN[1]+22)}" stroke-width="5"/>`;
    return out;
  }
  const ease = t => .5 - Math.cos(Math.PI*t)/2;
  function poseAt(mv, time){
    const f = mv.frames, d = mv.dur || 1.2, hold = mv.loop ? 0 : .35;
    if (mv.loop) { const u = (time / d) % f.length, i = Math.floor(u), t = u - i; return blend(f[i], f[(i+1) % f.length], mv.linear ? t : ease(t)); }
    const cyc = 2*(d + hold), u = time % cyc;
    if (u < hold) return f[0];
    if (u < hold + d) return blend(f[0], f[1], ease((u - hold)/d));
    if (u < 2*hold + d) return f[1];
    return blend(f[1], f[0], ease((u - 2*hold - d)/d));
  }
  function frameSVG(name, levels, time, g){
    const mv = M[name] || M.squat;
    return `<ellipse class="shadow" cx="0" cy="0" rx="70" ry="5"/><g class="props">${(mv.props || []).join('')}</g><line class="ground" x1="-100" y1="0" x2="100" y2="0"/><g class="fig">${figure(poseAt(mv, time), zones(levels), mv, g === 'w' ? 'w' : 'm')}</g>`;
  }
  function svg(name, levels, g){
    const lv = JSON.stringify(levels || {}).replace(/"/g, '&quot;');
    return `<svg class="anim" viewBox="-100 -190 200 200" data-anim="${name}" data-g="${g === 'w' ? 'w' : 'm'}" data-lv="${lv}" role="img" aria-label="Animation der Übung">${frameSVG(name, levels, .6, g)}</svg>`;
  }
  // Ein gemeinsamer Takt für alle sichtbaren Animationen (~30 Bilder pro Sekunde)
  let last = 0; const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
  const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick(now){
    requestAnimationFrame(tick);
    if (now - last < 33) return; last = now;
    // Bei „Bewegung reduzieren“ laufen nur die erklärenden großen Animationen, Vorschaubilder bleiben ruhig
    document.querySelectorAll('svg.anim[data-anim]').forEach(el => {
      if (still && el.closest('.thumb, .routine')) return;
      const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      if (!el._lv) el._lv = JSON.parse(el.dataset.lv || '{}');
      el.innerHTML = frameSVG(el.dataset.anim, el._lv, (now - t0)/1000, el.dataset.g);
    });
  }
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(tick);
  return {svg, frameSVG, names: Object.keys(M), M, poseAt};
})();

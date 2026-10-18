// Körper-Männchen (vorne/hinten) als SVG: Muskeln einfärben, Messringe zeigen.
// Gezeichnet wird nur die linke Körperhälfte (x < 110), die rechte entsteht gespiegelt.
const BODY = (() => {
  const W = 220, H = 440;
  const head = '<ellipse cx="110" cy="36" rx="20" ry="25"/>';
  const halfSilhouette = 'M111,62 L100,62 L100,72 Q84,74 72,82 Q58,88 56,104 L54,132 Q51,148 50,162 L46,196 Q44,206 44,216 Q42,232 48,240 Q54,238 55,226 L56,214 Q60,196 63,178 L67,160 L70,132 L73,120 Q76,150 78,180 Q80,198 76,214 Q74,236 77,262 Q80,292 84,320 Q82,336 82,352 Q84,384 89,408 Q84,420 85,428 L105,429 Q104,418 102,408 Q104,380 104,352 Q104,336 104,322 Q106,292 107,262 Q108,248 111,238 Z';
  const silhouette = `${head}<path d="${halfSilhouette}"/><path d="${halfSilhouette}" transform="translate(${W},0) scale(-1,1)"/>`;

  // Muskelflächen der linken Hälfte; mirror:false = liegt mittig und wird nicht gespiegelt
  const FRONT = {
    schultern: ['M76,84 Q62,88 59,102 Q60,114 66,120 Q72,104 84,92 Z'],
    brust: ['M108,90 L86,90 Q76,98 77,112 Q90,124 108,120 Z'],
    bizeps: ['M64,122 Q57,136 58,152 Q63,158 67,153 Q71,138 70,124 Z'],
    unterarme: ['M56,164 Q49,184 50,206 L56,208 Q63,188 64,167 Z'],
    bauch: [{d: 'M97,126 Q110,122 123,126 L123,192 Q110,200 97,192 Z', mirror: false}],
    seitlich: ['M93,128 Q83,150 86,188 L94,194 L94,130 Z'],
    oberschenkel_vorne: ['M82,222 Q76,262 86,312 Q96,318 102,308 Q106,266 104,234 Q94,224 82,222 Z'],
    waden: ['M87,334 Q83,360 90,396 L98,396 Q102,362 100,334 Z']
  };
  const BACK = {
    ruecken_oben: [{d: 'M110,66 L98,74 L80,86 L96,100 L110,132 L124,100 L140,86 L122,74 Z', mirror: false}],
    schultern: ['M76,84 Q62,88 59,102 Q60,114 66,120 Q72,104 82,94 Z'],
    trizeps: ['M64,122 Q56,138 58,154 L67,154 Q72,136 70,124 Z'],
    unterarme: ['M56,164 Q49,184 50,206 L56,208 Q63,188 64,167 Z'],
    latissimus: ['M84,100 Q76,138 90,176 L106,182 L106,136 L96,104 Z'],
    unterer_ruecken: [{d: 'M98,152 Q110,148 122,152 L122,196 Q110,200 98,196 Z', mirror: false}],
    po: ['M80,202 Q76,232 96,240 Q108,238 108,214 L108,202 Z'],
    oberschenkel_hinten: ['M82,246 Q78,282 88,314 L102,314 Q106,282 104,246 Z'],
    waden: ['M85,330 Q78,356 90,386 L100,386 Q104,356 100,330 Z']
  };
  const NAMES = {brust:'Brust', schultern:'Schultern', bizeps:'Bizeps', trizeps:'Trizeps', unterarme:'Unterarme', bauch:'Bauch', seitlich:'Seitliche Bauchmuskeln', ruecken_oben:'Oberer Rücken', latissimus:'Breiter Rückenmuskel', unterer_ruecken:'Unterer Rücken', po:'Po', oberschenkel_vorne:'Oberschenkel vorne', oberschenkel_hinten:'Oberschenkel hinten', waden:'Waden'};

  function layer(map, levels, clickable){
    let out = '';
    for (const [key, shapes] of Object.entries(map)) {
      const lv = levels[key] || 0, cls = lv >= 1 ? 'm hot' : lv > 0 ? 'm warm' : 'm';
      const attrs = clickable ? ` data-muscle="${key}" role="button" tabindex="0" aria-label="${NAMES[key]}"` : '';
      let g = '';
      for (const s of shapes) {
        const d = typeof s === 'string' ? s : s.d, mirror = typeof s === 'string' || s.mirror !== false;
        g += `<path d="${d}"/>` + (mirror ? `<path d="${d}" transform="translate(${W},0) scale(-1,1)"/>` : '');
      }
      out += `<g class="${cls}"${attrs}><title>${NAMES[key]}</title>${g}</g>`;
    }
    return out;
  }
  // levels: {muskel: 1 (Hauptmuskel) | 0.5 (hilft mit)}
  function figure(side, levels = {}, opts = {}){
    const map = side === 'back' ? BACK : FRONT;
    const rings = (opts.rings || []).map(r => `<ellipse class="ring" cx="${r.cx ?? 110}" cy="${r.y}" rx="${r.rx}" ry="5"/>`).join('');
    return `<svg class="body" viewBox="0 0 ${W} ${H}" role="img" aria-label="Männchen ${side === 'back' ? 'hinten' : 'vorne'}"><g class="sil">${silhouette}</g>${layer(map, levels, opts.clickable)}${rings}</svg>`;
  }
  function pair(levels = {}, opts = {}){
    return `<div class="bodypair"><div><div class="bodylabel">vorne</div>${figure('front', levels, opts)}</div><div><div class="bodylabel">hinten</div>${figure('back', levels, opts)}</div></div>`;
  }
  // Messpunkte der Körpervermessung, y = Höhe auf dem Männchen
  const RINGS = [
    {key:'chest', label:'Brust', y:104, rx:40},
    {key:'arm', label:'Oberarm', y:138, rx:9, cx:64},
    {key:'waist', label:'Taille', y:178, rx:33},
    {key:'hip', label:'Hüfte', y:214, rx:36},
    {key:'thigh', label:'Oberschenkel', y:262, rx:16, cx:92}
  ];
  return {figure, pair, NAMES, RINGS};
})();

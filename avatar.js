// Avatar-Look für den 360°-Körper – läuft komplett auf dem Handy:
// Person freistellen mit MODNet (Open Source, Apache-2.0, via transformers.js), Löcher füllen,
// ruhig zentrieren und auf ein leuchtendes Podest vor dunkelblauen Studio-Hintergrund stellen.
window.AVATAR = (() => {
  const LIB = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1';
  let T = null, model = null, proc = null;
  async function init(){
    if (model) return;
    T = await import(LIB);
    const dev = navigator.gpu ? 'webgpu' : 'wasm';
    try { model = await T.AutoModel.from_pretrained('Xenova/modnet', {dtype: dev === 'webgpu' ? 'fp32' : 'q8', device: dev}); }
    catch (e) { model = await T.AutoModel.from_pretrained('Xenova/modnet', {dtype: 'q8', device: 'wasm'}); }
    proc = await T.AutoProcessor.from_pretrained('Xenova/modnet');
  }
  // Maske 0..255 in Bildgröße, aufgeräumt: nur größte Fläche, Löcher gefüllt
  async function maskOf(cv){
    const img = await T.RawImage.fromCanvas(cv), {pixel_values} = await proc(img), {output} = await model({input: pixel_values});
    const m = (await T.RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(cv.width, cv.height)).data;
    const w = cv.width, h = cv.height, n = w * h, fg = new Uint8Array(n);
    for (let i = 0; i < n; i++) fg[i] = m[i] > 120 ? 1 : 0;
    // größte zusammenhängende Fläche
    const lab = new Int32Array(n), q = new Int32Array(n); let best = 0, bestId = 0, id = 0;
    for (let s = 0; s < n; s++) {
      if (!fg[s] || lab[s]) continue; id++; let qh = 0, qt = 0, cnt = 0; q[qt++] = s; lab[s] = id;
      while (qh < qt) { const p = q[qh++]; cnt++; const x = p % w, y = (p / w) | 0;
        if (x > 0 && fg[p-1] && !lab[p-1]) { lab[p-1] = id; q[qt++] = p-1; } if (x < w-1 && fg[p+1] && !lab[p+1]) { lab[p+1] = id; q[qt++] = p+1; }
        if (y > 0 && fg[p-w] && !lab[p-w]) { lab[p-w] = id; q[qt++] = p-w; } if (y < h-1 && fg[p+w] && !lab[p+w]) { lab[p+w] = id; q[qt++] = p+w; } }
      if (cnt > best) { best = cnt; bestId = id; }
    }
    // Hintergrund von den Rändern aus fluten → alles andere ist Person (füllt Löcher)
    const out = new Uint8Array(n), seen = new Uint8Array(n); let qh = 0, qt = 0;
    const push = p => { if (!seen[p] && lab[p] !== bestId) { seen[p] = 1; q[qt++] = p; } };
    for (let x = 0; x < w; x++) { push(x); push((h-1) * w + x); } for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
    while (qh < qt) { const p = q[qh++], x = p % w, y = (p / w) | 0; if (x > 0) push(p-1); if (x < w-1) push(p+1); if (y > 0) push(p-w); if (y < h-1) push(p+w); }
    let top = h, bot = -1, sx = 0, cnt = 0;
    for (let i = 0; i < n; i++) {
      if (seen[i]) { out[i] = lab[i] === bestId ? 0 : Math.min(m[i], 90); continue; }
      out[i] = lab[i] === bestId ? Math.max(m[i], 200) : 255;
      const y = (i / w) | 0; if (y < top) top = y; if (y > bot) bot = y; sx += i % w; cnt++;
    }
    return {a: out, w, h, top, bot, cx: cnt ? sx / cnt : w / 2, ok: cnt > n * 0.02 && bot - top > h * 0.3};
  }
  function background(W, H){
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    let gr = g.createRadialGradient(W * .5, H * .42, 4, W * .5, H * .42, H * .72);
    gr.addColorStop(0, '#1e50a0'); gr.addColorStop(.45, '#0c285c'); gr.addColorStop(1, '#040a18');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    gr = g.createRadialGradient(W * .5, -H * .05, 4, W * .5, -H * .05, H * .55);
    gr.addColorStop(0, 'rgba(110,160,230,.6)'); gr.addColorStop(1, 'rgba(110,160,230,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    return c;
  }
  function podium(g, W, H, py){
    const rx = W * .40, ry = W * .075, th = H * .022;
    g.save(); g.filter = `blur(${Math.round(W * .05)}px)`; g.fillStyle = 'rgba(175,210,255,.43)';
    g.beginPath(); g.ellipse(W / 2, py + th + ry * .5, rx * 1.45, ry * 2.1, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.fillStyle = '#c4d0e2'; g.fillRect(W / 2 - rx, py, rx * 2, th); g.beginPath(); g.ellipse(W / 2, py + th, rx, ry, 0, 0, Math.PI); g.fill();
    g.save(); g.shadowColor = 'rgba(225,240,255,1)'; g.shadowBlur = W * .03; g.strokeStyle = '#fff'; g.lineWidth = Math.max(2, W * .008);
    g.beginPath(); g.ellipse(W / 2, py + th, rx, ry, 0, 0, Math.PI); g.stroke(); g.restore();
    const gr = g.createLinearGradient(0, py - ry, 0, py + ry); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#e1e8f2');
    g.fillStyle = gr; g.beginPath(); g.ellipse(W / 2, py, rx, ry, 0, 0, Math.PI * 2); g.fill();
  }
  const tick = () => new Promise(r => setTimeout(r, 0));
  // frames: Canvas-Liste (Originalbilder) → Avatar-Bilder W×H. onProgress(0..1)
  async function process(frames, W, H, onProgress){
    await init(); onProgress && onProgress(0.05);
    const masks = [];
    for (let i = 0; i < frames.length; i++) { masks.push(await maskOf(frames[i])); onProgress && onProgress(.05 + (i + 1) / frames.length * .8); await tick(); }
    if (masks.filter(m => m.ok).length < frames.length * .6) throw new Error('keine Person erkannt');
    const med = arr => { const v = arr.filter(x => x != null).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
    const smooth = (arr, k) => arr.map((_, i) => { const v = []; for (let j = -k; j <= k; j++) v.push(arr[(i + j + arr.length) % arr.length]); return med(v); });
    const hgt = masks.map(m => m.ok ? m.bot - m.top : null), hM = med(hgt);
    const sh = smooth(hgt.map(x => x == null ? hM : x), 3), scx = smooth(masks.map(m => m.cx), 2), sb = smooth(masks.map(m => m.ok ? m.bot : null).map(x => x == null ? med(masks.map(m => m.bot)) : x), 2);
    const bg = background(W, H), py = H * .885, targetH = H * .76, out = [];
    const mc = document.createElement('canvas'), pc = document.createElement('canvas');
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i], m = masks[i], s = targetH / sh[i], fw = f.width, fh = f.height;
      mc.width = m.w; mc.height = m.h; const mg = mc.getContext('2d'), id = mg.createImageData(m.w, m.h);
      for (let k = 0; k < m.a.length; k++) id.data[k * 4 + 3] = m.a[k];
      mg.putImageData(id, 0, 0);
      pc.width = fw; pc.height = fh; const pg = pc.getContext('2d');
      pg.clearRect(0, 0, fw, fh); pg.globalCompositeOperation = 'source-over';
      pg.filter = 'blur(1px)'; pg.drawImage(mc, 0, 0); pg.filter = 'none';
      pg.globalCompositeOperation = 'source-in'; pg.filter = 'contrast(1.08) saturate(.88)'; pg.drawImage(f, 0, 0); pg.filter = 'none';
      pg.globalCompositeOperation = 'source-atop'; pg.fillStyle = 'rgba(40,80,160,.08)'; pg.fillRect(0, 0, fw, fh);
      const gr = pg.createLinearGradient(0, 0, fw, 0); gr.addColorStop(0, 'rgba(120,170,255,.16)'); gr.addColorStop(.5, 'rgba(120,170,255,0)'); gr.addColorStop(1, 'rgba(120,170,255,.16)');
      pg.fillStyle = gr; pg.fillRect(0, 0, fw, fh); pg.globalCompositeOperation = 'source-over';
      const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
      g.drawImage(bg, 0, 0); podium(g, W, H, py);
      g.save(); g.filter = `blur(${Math.round(W * .02)}px)`; g.fillStyle = 'rgba(30,40,60,.45)'; g.beginPath(); g.ellipse(W / 2, py + 2, W * .17, W * .03, 0, 0, Math.PI * 2); g.fill(); g.restore();
      g.drawImage(pc, W / 2 - scx[i] * s, py + H * .012 - sb[i] * s, fw * s, fh * s);
      out.push(c); onProgress && onProgress(.85 + (i + 1) / frames.length * .15);
    }
    return out;
  }
  return {init, process};
})();

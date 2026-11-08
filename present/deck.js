/* Lavanya AI Consultancy – presentation engine.
   Keys: → / Space next · ← back · F full screen · P play the flow.
   Each deck page sets window.DECK = {slug, title, slides:[...]}. */
(function () {
  const D = window.DECK, W = 1600, H = 900, LOGO = "../assets/logo.jpg";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
  document.title = D.title + " – Lavanya AI Consultancy";

  const stage = document.createElement("div");
  stage.className = "stage";
  document.body.appendChild(stage);

  /* ---------- slide renderers ---------- */
  const R = {
    title: s => `<img class="t-logo" src="${LOGO}" alt="Lavanya AI Consultancy logo">
      <div class="kicker">${fmt(s.kicker)}</div><h1>${fmt(s.title)}</h1>
      <p class="lead">${fmt(s.sub)}</p>
      <div class="chips">${(s.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
      <div class="byline">Presented by Lavanya Srivastava · Lavanya AI Consultancy</div>`,
    points: s => `<div class="kicker">${fmt(s.kicker)}</div><h2>${fmt(s.title)}</h2>
      ${s.intro ? `<p class="intro">${fmt(s.intro)}</p>` : ""}
      <div class="grid" style="grid-template-columns:repeat(${s.cols || Math.min(s.items.length, 3)},1fr)">
      ${s.items.map((it, i) => `<div class="card">${s.numbered ? `<div class="num">0${i + 1}</div>` : ""}<h3>${fmt(it.h)}</h3><p>${fmt(it.p)}</p></div>`).join("")}</div>`,
    arch: s => `<div class="arch"><div class="kicker">${fmt(s.kicker || "Architecture")}</div><h2>${fmt(s.title)}</h2>
      ${archSvg(s)}
      <div class="caption"><div class="sn"></div><div class="tx"></div><button class="play" type="button">▶ Play the flow</button></div></div>`,
    shots: s => `<div class="kicker">${fmt(s.kicker || "See it working")}</div><h2>${fmt(s.title)}</h2>
      <div class="shots">${s.images.map(im => `<figure class="shot" style="margin:0;flex:${im.flex || 1}"><div class="frame"><img src="${esc(im.src)}" alt="${esc(im.cap)}"></div><figcaption class="cap">${fmt(im.cap)}</figcaption></figure>`).join("")}</div>`,
    stats: s => `<div class="kicker">${fmt(s.kicker)}</div><h2>${fmt(s.title)}</h2>
      <div class="stats" style="grid-template-columns:repeat(${s.stats.length},1fr)">${s.stats.map(x => `<div class="stat"><div class="n">${esc(x.n)}</div><div class="l">${fmt(x.l)}</div></div>`).join("")}</div>
      ${s.table ? `<table class="t" style="margin-top:28px"><tr>${s.table[0].map(c => `<th>${fmt(c)}</th>`).join("")}</tr>${s.table.slice(1).map(r => `<tr>${r.map(c => `<td>${fmt(c)}</td>`).join("")}</tr>`).join("")}</table>` : ""}
      ${s.note ? `<p class="note">${fmt(s.note)}</p>` : ""}`,
    table: s => `<div class="kicker">${fmt(s.kicker)}</div><h2>${fmt(s.title)}</h2>
      <table class="t"><tr>${s.rows[0].map(c => `<th>${fmt(c)}</th>`).join("")}</tr>${s.rows.slice(1).map(r => `<tr>${r.map(c => `<td>${fmt(c)}</td>`).join("")}</tr>`).join("")}</table>
      ${s.note ? `<p class="note">${fmt(s.note)}</p>` : ""}`,
    run: s => `<div class="kicker">${fmt(s.kicker)}</div><h2>${fmt(s.title)}</h2>
      <div class="run">${s.rows.map(r => `<div class="row"><div class="who">${esc(r.who)}</div><div class="box ${r.tone || ""}">${fmt(r.text)}</div></div>`).join("")}</div>
      ${s.note ? `<p class="note">${fmt(s.note)}</p>` : ""}`,
    cta: s => `<div class="kicker">${fmt(s.kicker || "Next step")}</div><h1 style="font-size:76px">${fmt(s.title)}</h1>
      <p class="lead">${fmt(s.sub)}</p>
      <div class="cta-links">${(s.links || []).map((l, i) => `<a class="${i === 0 ? "p" : ""}" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div>
      <div class="contact">Lavanya Srivastava · Lavanya AI Consultancy<br><span>lavanya.sriva@gmail.com · lavanya-portfolio-azure.vercel.app</span></div>`,
  };

  /* ---------- architecture diagram ---------- */
  function archSvg(s) {
    const N = {};
    s.nodes.forEach(n => (N[n.id] = n));
    const anchor = (n, tx, ty) => {
      const cx = n.x + n.w / 2, cy = n.y + n.h / 2, dx = tx - cx, dy = ty - cy;
      const k = Math.min(dx ? (n.w / 2 + 6) / Math.abs(dx) : 1e9, dy ? (n.h / 2 + 6) / Math.abs(dy) : 1e9);
      return [cx + dx * k, cy + dy * k];
    };
    const edges = s.edges.map((e0, i) => {
      let e = e0;
      const a = N[e.from], b = N[e.to];
      const ac = [a.x + a.w / 2, a.y + a.h / 2], bc = [b.x + b.w / 2, b.y + b.h / 2];
      const mx = (ac[0] + bc[0]) / 2, my = (ac[1] + bc[1]) / 2;
      const len = Math.hypot(bc[0] - ac[0], bc[1] - ac[1]) || 1;
      const bend = e.bend || 0;
      const c = [mx - ((bc[1] - ac[1]) / len) * bend, my + ((bc[0] - ac[0]) / len) * bend];
      const p0 = anchor(a, c[0], c[1]), p1 = anchor(b, c[0], c[1]);
      const d = `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
      const lx = 0.25 * p0[0] + 0.5 * c[0] + 0.25 * p1[0] + (e.lx || 0), ly = 0.25 * p0[1] + 0.5 * c[1] + 0.25 * p1[1] + (e.ly || 0);
      const plen = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      const lw = e.label ? e.label.length * 8.4 + 16 : 0;
      if (lw > plen - 30) e = { ...e, label: "" }; // too short to label clearly
      return `<g class="edge" data-i="${i}"><path d="${d}" marker-end="url(#ah-${D.slug})"/>
        <circle class="dot" r="7"><animateMotion dur="${e.dur || 1.6}s" repeatCount="indefinite" path="${d}"/></circle>
        ${e.label ? `<rect class="elb" x="${lx - lw / 2}" y="${ly - 14}" width="${lw}" height="26" rx="6"/><text class="el" x="${lx}" y="${ly + 5}" text-anchor="middle">${esc(e.label)}</text>` : ""}</g>`;
    }).join("");
    const nodes = s.nodes.map(n => {
      const cx = n.x + n.w / 2, subs = (n.sub || "").split("\n").filter(Boolean);
      const top = n.y + n.h / 2 - ((n.tag ? 18 : 0) + 26 + subs.length * 22) / 2;
      let y = top;
      let t = "";
      if (n.tag) { y += 14; t += `<text class="nk" x="${cx}" y="${y}" text-anchor="middle">${esc(n.tag)}</text>`; y += 4; }
      y += 24; t += `<text class="nl" x="${cx}" y="${y}" text-anchor="middle">${esc(n.label)}</text>`;
      subs.forEach(l => { y += 22; t += `<text class="ns" x="${cx}" y="${y}" text-anchor="middle">${esc(l)}</text>`; });
      return `<g class="node k-${n.kind || "box"}" data-id="${n.id}"><rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="16"/>${t}</g>`;
    }).join("");
    return `<svg viewBox="0 0 ${s.vw || 1420} ${s.vh || 560}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(s.title)}">
      <defs><marker id="ah-${D.slug}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#8A5A12"/></marker></defs>
      ${edges}${nodes}</svg>`;
  }

  /* ---------- build ---------- */
  const slides = D.slides.map((s, i) => {
    const sec = document.createElement("section");
    sec.className = "slide" + (s.type === "title" || s.type === "cta" || s.dark ? " dark" : "");
    sec.innerHTML = R[s.type](s) + `<div class="foot"><img src="${LOGO}" alt=""><span>${esc(D.title)}</span><span class="pg">${i + 1} / ${D.slides.length}</span></div>`;
    stage.appendChild(sec);
    sec._s = s;
    sec._step = -1;
    if (s.type === "arch") {
      sec.querySelector(".play").addEventListener("click", ev => { ev.stopPropagation(); togglePlay(sec); });
      setStep(sec, -1);
    }
    return sec;
  });
  const bar = document.createElement("div");
  bar.className = "bar";
  stage.appendChild(bar);

  function setStep(sec, k) {
    const s = sec._s, svg = sec.querySelector("svg");
    sec._step = k;
    const nodes = svg.querySelectorAll(".node"), edges = svg.querySelectorAll(".edge");
    const sn = sec.querySelector(".sn"), tx = sec.querySelector(".tx");
    nodes.forEach(n => n.classList.remove("lit", "now"));
    edges.forEach(e => e.classList.remove("lit"));
    if (k < 0) {
      svg.classList.remove("stepping");
      sn.textContent = "";
      tx.innerHTML = fmt(s.intro || "Press → to walk through the flow one step at a time, or press Play.");
      return;
    }
    if (k >= s.steps.length) { // final: everything flowing
      svg.classList.remove("stepping");
      nodes.forEach(n => n.classList.add("lit"));
      edges.forEach(e => e.classList.add("lit"));
      sn.textContent = "✓";
      tx.innerHTML = fmt(s.summary || "The complete flow.");
      return;
    }
    svg.classList.add("stepping");
    s.steps.forEach((st, j) => {
      if (j > k) return;
      (st.nodes || []).forEach(id => { const n = svg.querySelector(`.node[data-id="${id}"]`); if (n) { n.classList.add("lit"); if (j === k) n.classList.add("now"); } });
      (st.edges || []).forEach(ix => { const e = svg.querySelector(`.edge[data-i="${ix}"]`); if (e) e.classList.add("lit"); });
    });
    sn.textContent = String(k + 1).padStart(2, "0");
    tx.innerHTML = fmt(s.steps[k].text);
  }

  let timer = null;
  function stopPlay() {
    if (timer) clearInterval(timer);
    timer = null;
    document.querySelectorAll(".play").forEach(b => (b.textContent = "▶ Play the flow"));
  }
  function togglePlay(sec) {
    if (timer) return stopPlay();
    if (sec._step >= sec._s.steps.length) setStep(sec, -1);
    sec.querySelector(".play").textContent = "❚❚ Pause";
    const tick = () => {
      if (sec._step >= sec._s.steps.length) return stopPlay();
      setStep(sec, sec._step + 1);
    };
    tick();
    timer = setInterval(tick, 3200);
  }

  /* ---------- navigation ---------- */
  let cur = Math.min(Math.max(parseInt(location.hash.slice(1), 10) - 1 || 0, 0), slides.length - 1);
  function show(i) {
    stopPlay();
    cur = Math.min(Math.max(i, 0), slides.length - 1);
    slides.forEach((s, j) => s.classList.toggle("active", j === cur));
    bar.style.width = ((cur + 1) / slides.length) * 100 + "%";
    history.replaceState(null, "", "#" + (cur + 1));
  }
  function next() {
    const sec = slides[cur];
    if (sec._s.type === "arch" && sec._step < sec._s.steps.length) { stopPlay(); return setStep(sec, sec._step + 1); }
    show(cur + 1);
  }
  function prev() {
    const sec = slides[cur];
    if (sec._s.type === "arch" && sec._step >= 0) { stopPlay(); return setStep(sec, sec._step - 1); }
    show(cur - 1);
  }
  document.addEventListener("keydown", e => {
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === "Home") show(0);
    else if (e.key === "End") show(slides.length - 1);
    else if (e.key === "f" || e.key === "F") fullscreen();
    else if ((e.key === "p" || e.key === "P") && slides[cur]._s.type === "arch") togglePlay(slides[cur]);
  });
  stage.addEventListener("click", e => {
    if (e.target.closest("a,button")) return;
    const r = stage.getBoundingClientRect();
    (e.clientX - r.left < r.width * 0.3 ? prev : next)();
  });
  let tx0 = null;
  stage.addEventListener("touchstart", e => (tx0 = e.touches[0].clientX), { passive: true });
  stage.addEventListener("touchend", e => {
    if (tx0 === null) return;
    const dx = e.changedTouches[0].clientX - tx0;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    tx0 = null;
  });
  function fullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  const ctrl = document.createElement("div");
  ctrl.className = "ctrl";
  ctrl.innerHTML = `<a href="../#projects">← Portfolio</a><button type="button" data-a="prev" aria-label="Previous">‹</button><button type="button" data-a="next" aria-label="Next">›</button><button type="button" data-a="fs">Full screen</button><a href="${D.slug}.pdf" download>PDF</a>`;
  ctrl.addEventListener("click", e => {
    const a = e.target.closest("button")?.dataset.a;
    if (a === "prev") prev(); else if (a === "next") next(); else if (a === "fs") fullscreen();
  });
  document.body.appendChild(ctrl);
  const rot = document.createElement("div");
  rot.className = "rotate";
  rot.textContent = "Turn your phone sideways to see the slides larger.";
  document.body.appendChild(rot);

  function fit() {
    const vw = document.documentElement.clientWidth || innerWidth, vh = document.documentElement.clientHeight || innerHeight;
    const s = Math.min(vw / W, vh / H);
    stage.style.transform = `translate(${(vw - W * s) / 2}px,${(vh - H * s) / 2}px) scale(${s})`;
  }
  addEventListener("resize", fit);
  addEventListener("beforeprint", () => slides.forEach(s => s._s.type === "arch" && setStep(s, s._s.steps.length)));
  fit();
  show(cur);
  window.__deck = { show, next, prev, setStep, slides };
})();

(() => {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lbImg");
  const title = document.getElementById("lbTitle");
  const canvas = document.getElementById("lbCanvas");

  let scale = 1, minScale = 1, maxScale = 12;
  let tx = 0, ty = 0;
  let dragging = false, sx = 0, sy = 0, stx = 0, sty = 0;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const apply = () => {
    img.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`;
  };

  const fit = () => {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;

    const pad = 18;
    const s = Math.min((cw - pad*2) / iw, (ch - pad*2) / ih);
    minScale = clamp(s, 0.05, 4);
    scale = minScale;
    tx = 0; ty = 0;
    apply();
  };

  const open = (src, t) => {
    img.src = src;
    title.textContent = t || "Figure";
    lb.classList.add("open");
    if (img.complete) fit();
    else img.onload = fit;
  };

  const close = () => {
    lb.classList.remove("open");
    img.src = "";
  };

  document.querySelectorAll("[data-lightbox]").forEach(el => {
    el.addEventListener("click", () => {
      open(el.getAttribute("data-full") || el.src, el.getAttribute("data-title") || el.alt || "Figure");
    });
  });

  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });

  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbReset").addEventListener("click", fit);

  document.getElementById("lbIn").addEventListener("click", () => {
    scale = clamp(scale * 1.25, minScale, maxScale);
    apply();
  });

  document.getElementById("lbOut").addEventListener("click", () => {
    scale = clamp(scale / 1.25, minScale, maxScale);
    apply();
  });

  document.getElementById("lbFull").addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await lb.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  });

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    canvas.setPointerCapture(e.pointerId);
    sx = e.clientX; sy = e.clientY;
    stx = tx; sty = ty;
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    tx = stx + (e.clientX - sx);
    ty = sty + (e.clientY - sy);
    apply();
  });

  canvas.addEventListener("pointerup", () => dragging = false);
  canvas.addEventListener("pointercancel", () => dragging = false);

  canvas.addEventListener("wheel", (e) => {
    if (!lb.classList.contains("open")) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top  - rect.height / 2;

    const old = scale;
    const zoomIn = e.deltaY > 0 ? -1 : 1;
    const factor = zoomIn > 0 ? 1.12 : (1 / 1.12);
    scale = clamp(scale * factor, minScale, maxScale);

    const k = (scale / old) - 1;
    tx += -cx * k;
    ty += -cy * k;
    apply();
  }, { passive:false });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb.classList.contains("open")) close();
  });

  window.addEventListener("resize", () => {
    if (lb.classList.contains("open")) fit();
  });
})();
export function initHeroCanvas() {
  const canvas = document.querySelector("#networkCanvas");
  const host = document.querySelector("#heroArt");
  const context = canvas?.getContext("2d", { alpha: true });
  if (!context) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = Array.from({ length: 31 }, (_, index) => ({
    x: Math.sin(index * 2.399) * (0.2 + (index % 5) * 0.085),
    y: Math.cos(index * 1.713) * (0.2 + (index % 7) * 0.065),
    z: Math.sin(index * 1.117) * 0.65,
    phase: index * 1.43,
    size: index % 9 === 0 ? 2.4 : 1.1 + (index % 3) * 0.35,
  }));
  let width = 0,
    height = 0,
    frame = 0,
    visible = true,
    pointerX = 0,
    pointerY = 0,
    tick = 0;
  const resize = () => {
    const bounds = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };
  const draw = () => {
    context.clearRect(0, 0, width, height);
    const cx = width / 2,
      cy = height / 2;
    const rotateY = pointerX * 0.24,
      rotateX = -pointerY * 0.2;
    const points = nodes.map((node) => {
      const drift = reduced ? 0 : Math.sin(tick + node.phase) * 0.012;
      const x = node.x + drift,
        y = node.y + (reduced ? 0 : Math.cos(tick * 0.7 + node.phase) * 0.011);
      const rx = x * Math.cos(rotateY) - node.z * Math.sin(rotateY);
      const rz = x * Math.sin(rotateY) + node.z * Math.cos(rotateY);
      const ry = y * Math.cos(rotateX) - rz * Math.sin(rotateX);
      const depth = y * Math.sin(rotateX) + rz * Math.cos(rotateX);
      const scale = 1 / (1 + depth * 0.34);
      return {
        x: cx + rx * Math.min(width, height) * 0.9 * scale,
        y: cy + ry * Math.min(width, height) * 0.82 * scale,
        z: depth,
        scale,
        size: node.size,
      };
    });
    for (let i = 0; i < points.length; i++)
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i],
          b = points[j],
          distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 92) {
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(112,221,235,${(1 - distance / 92) * 0.22 * (1 - Math.max(a.z, b.z) * 0.3)})`;
          context.lineWidth = 0.7;
          context.stroke();
        }
      }
    points.forEach((point, index) => {
      const glow = index % 9 === 0;
      context.beginPath();
      context.arc(point.x, point.y, point.size * point.scale, 0, Math.PI * 2);
      context.fillStyle = glow
        ? "rgba(137,246,239,.95)"
        : "rgba(165,188,242,.7)";
      if (glow) {
        context.shadowBlur = 12;
        context.shadowColor = "rgba(118,240,236,.8)";
      }
      context.fill();
      context.shadowBlur = 0;
    });
  };
  const animate = () => {
    if (!visible) return;
    tick += 0.007;
    draw();
    frame = requestAnimationFrame(animate);
  };
  const start = () => {
    cancelAnimationFrame(frame);
    if (reduced) draw();
    else frame = requestAnimationFrame(animate);
  };
  host.addEventListener(
    "pointermove",
    (event) => {
      const bounds = host.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    },
    { passive: true },
  );
  host.addEventListener(
    "pointerleave",
    () => {
      pointerX = 0;
      pointerY = 0;
    },
    { passive: true },
  );
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host);
  else window.addEventListener("resize", resize, { passive: true });
  if ("IntersectionObserver" in window)
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(frame);
    }).observe(host);
  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    if (visible) start();
    else cancelAnimationFrame(frame);
  });
  resize();
  start();
}

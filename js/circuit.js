(function () {
  const canvas = document.getElementById('circuitCanvas');
  const ctx    = canvas.getContext('2d');

  let stars        = [];
  let shooters     = [];
  let nebulae      = [];
  let lastShooter  = 0;
  const SHOOTER_INTERVAL = 4000; // ms entre estrellas fugaces

  let mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  /* -------- resize -------- */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
  }

  /* -------- init -------- */
  function init() {
    stars   = [];
    nebulae = [];

    // Nebulosas difusas de fondo
    const nebulaColors = [
      'rgba(245,158,11,',   // ámbar
      'rgba(160,180,255,',  // azul frío
      'rgba(200,100,255,',  // violeta suave
    ];
    for (let i = 0; i < 6; i++) {
      nebulae.push({
        x:   Math.random() * canvas.width,
        y:   Math.random() * canvas.height,
        r:   120 + Math.random() * 200,
        alpha: 0.018 + Math.random() * 0.028,
        color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
      });
    }

    // Estrellas en tres capas de profundidad
    const total = Math.floor((canvas.width * canvas.height) / 22000);
    for (let i = 0; i < total; i++) {
      const layer = Math.random(); // 0=fondo, 0.7=medio, 0.9=frente
      let radius, baseAlpha, speed;

      if (layer < 0.70) {
        radius = 0.3 + Math.random() * 0.5;
        baseAlpha = 0.2 + Math.random() * 0.4;
        speed = 0.003 + Math.random() * 0.007;
      } else if (layer < 0.90) {
        radius = 0.6 + Math.random() * 0.8;
        baseAlpha = 0.4 + Math.random() * 0.4;
        speed = 0.008 + Math.random() * 0.015;
      } else {
        radius = 1.0 + Math.random() * 1.4;
        baseAlpha = 0.6 + Math.random() * 0.4;
        speed = 0.015 + Math.random() * 0.025;
      }

      // Algunas estrellas con tinte de color
      const rng = Math.random();
      let color;
      if      (rng < 0.08) color = 'rgba(245,158,11,';   // ámbar (soles cálidos)
      else if (rng < 0.15) color = 'rgba(160,200,255,';  // azul (estrellas frías)
      else if (rng < 0.18) color = 'rgba(255,180,180,';  // rojizo
      else                 color = 'rgba(255,255,255,';   // blanco puro

      stars.push({
        x:      Math.random() * canvas.width,
        y:      Math.random() * canvas.height,
        r:      radius,
        baseAlpha,
        alpha:  0,
        phase:  Math.random() * Math.PI * 2,
        speed,
        color,
      });
    }
  }

  /* -------- Estrella fugaz -------- */
  class Shooter {
    constructor() {
      // Nace fuera del borde superior-izquierdo
      this.x     = Math.random() * canvas.width * 1.2 - canvas.width * 0.1;
      this.y     = Math.random() * canvas.height * 0.3 - 20;
      this.angle = 0.3 + Math.random() * 0.5;      // entre ~17° y ~45°
      this.speed = 3 + Math.random() * 4;
      this.len   = 80 + Math.random() * 100;
      this.life  = 0;
      this.maxLife = 100 + Math.random() * 80;
      this.active  = true;
    }

    update() {
      this.life++;
      if (this.life > this.maxLife) { this.active = false; return; }
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
    }

    draw() {
      if (!this.active) return;
      const p = this.life / this.maxLife;
      // fade-in rápido, fade-out suave
      const opacity = p < 0.15 ? p / 0.15 : p > 0.65 ? (1 - p) / 0.35 : 1;

      const tx = this.x - Math.cos(this.angle) * this.len;
      const ty = this.y - Math.sin(this.angle) * this.len;

      const grad = ctx.createLinearGradient(tx, ty, this.x, this.y);
      grad.addColorStop(0,   `rgba(255,255,255,0)`);
      grad.addColorStop(0.6, `rgba(245,158,11,${opacity * 0.35})`);
      grad.addColorStop(1,   `rgba(255,255,255,${opacity * 0.95})`);

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.2;
      ctx.shadowBlur  = 6;
      ctx.shadowColor = `rgba(245,158,11,${opacity * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      // destello en la punta
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 10);
      glow.addColorStop(0, `rgba(255,255,255,${opacity})`);
      glow.addColorStop(0.4, `rgba(245,158,11,${opacity * 0.5})`);
      glow.addColorStop(1,   `rgba(245,158,11,0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* -------- loop principal -------- */
  function loop(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 0 — halo del mouse sobre el fondo
    if (mouse.x > 0) {
      const RADIUS = 260;
      const halo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, RADIUS);
      halo.addColorStop(0,   'rgba(245,158,11,0.07)');
      halo.addColorStop(0.4, 'rgba(245,158,11,0.03)');
      halo.addColorStop(1,   'rgba(245,158,11,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1 — nebulosas
    nebulae.forEach(n => {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, n.color + n.alpha + ')');
      g.addColorStop(1, n.color + '0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2 — estrellas
    stars.forEach(s => {
      s.phase += s.speed;
      // titilación suave con doble seno para hacerla irregular
      const twinkle = 0.5 + 0.3 * Math.sin(s.phase) + 0.2 * Math.sin(s.phase * 2.3 + 1);
      s.alpha = s.baseAlpha * twinkle;

      // brillo extra si el mouse está cerca (max 140px)
      const dx = s.x - mouse.x;
      const dy = s.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 140) {
        s.alpha = Math.min(1, s.alpha + (1 - d / 140) * 0.5);
      }

      // halo para estrellas grandes
      if (s.r > 1) {
        const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
        halo.addColorStop(0, s.color + (s.alpha * 0.25) + ')');
        halo.addColorStop(1, s.color + '0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // núcleo de la estrella
      ctx.fillStyle = s.color + s.alpha + ')';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3 — estrellas fugaces
    if (ts - lastShooter > SHOOTER_INTERVAL && shooters.length < 2) {
      shooters.push(new Shooter());
      lastShooter = ts;
    }
    shooters = shooters.filter(s => s.active);
    shooters.forEach(s => { s.update(); s.draw(); });

    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(loop);
})();

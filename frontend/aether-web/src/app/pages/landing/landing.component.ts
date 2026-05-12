import {
  AfterViewInit, Component, ElementRef, QueryList, ViewChildren
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface Stat {
  key: string;
  target: number;
  suffix: string;
  label: string;
  current: number;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="aurora" aria-hidden="true">
        <div class="aurora-blob blob-1"></div>
        <div class="aurora-blob blob-2"></div>
        <div class="aurora-blob blob-3"></div>
        <div class="grid-mask"></div>
      </div>

      <div class="hero-content">
        <div class="badge">
          <span class="badge-dot"></span>
          Plataforma premium de radio
        </div>
        <h1>
          Descubre tu próxima
          <br>
          <span class="gradient-text">emisora favorita</span>
        </h1>
        <p class="hero-sub">
          Aether conecta millones de oyentes con las mejores emisoras del mundo.
          Posiciona la tuya en la portada y llega a una audiencia global.
        </p>
        <div class="hero-actions">
          <a routerLink="/request" class="btn btn-primary">
            <span>Destacar mi emisora</span>
            <span class="btn-arrow">→</span>
            <span class="btn-shimmer"></span>
          </a>
          <a routerLink="/status" class="btn btn-secondary">Ver estado de solicitud</a>
        </div>

        <div class="trust-row">
          <span class="trust-dot"></span>
          <span>Revisión en menos de 24h · 5 posiciones simultáneas</span>
        </div>
      </div>

      <div class="hero-visual">
        <div class="phone-glow"></div>
        <div class="phone-mock">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-header">
              <span class="app-name">AETHER</span>
              <span class="now-playing">
                <span class="play-dot"></span>
                En directo
              </span>
            </div>

            <div class="station-card featured card-slide" style="--d:0.9s">
              <div class="station-color" style="background: linear-gradient(135deg,#646cff,#a78bfa)"></div>
              <div class="station-info">
                <span class="station-tag">★ Destacada</span>
                <span class="station-name">Radio Nación</span>
                <span class="station-genre">Pop · Español</span>
              </div>
            </div>

            <div class="station-card card-slide" style="--d:1.1s">
              <div class="station-color" style="background: linear-gradient(135deg,#f97316,#fbbf24)"></div>
              <div class="station-info">
                <span class="station-name">Jazz FM</span>
                <span class="station-genre">Jazz · Internacional</span>
              </div>
            </div>

            <div class="station-card card-slide" style="--d:1.3s">
              <div class="station-color" style="background: linear-gradient(135deg,#10b981,#34d399)"></div>
              <div class="station-info">
                <span class="station-name">Chill Lounge</span>
                <span class="station-genre">Lounge · Electrónica</span>
              </div>
            </div>

            <div class="player-bar card-slide" style="--d:1.5s">
              <span class="player-track">
                <span class="player-icon">♪</span>
                Radio Nación
              </span>
              <span class="pulse-dot"></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats" #statsSection>
      <div class="section-eyebrow">En cifras</div>
      <div class="stats-grid">
        @for (stat of stats; track stat.key) {
          <div class="stat-card" #statCard>
            <div class="stat-conic"></div>
            <span class="stat-number" #statNumber>{{ stat.current }}{{ stat.suffix }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        }
      </div>
    </section>

    <!-- Features -->
    <section class="features" #featuresSection>
      <div class="section-eyebrow">Ventajas</div>
      <h2>¿Por qué elegir <span class="gradient-text">Aether</span>?</h2>
      <div class="features-grid">
        <div class="feature-card" style="--d:0s">
          <div class="feature-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s-8-4.5-8-12a8 8 0 1 1 16 0c0 7.5-8 12-8 12Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h3>Emisoras cercanas</h3>
          <p>Detecta automáticamente las emisoras de tu ubicación vía GPS.</p>
        </div>
        <div class="feature-card" style="--d:0.1s">
          <div class="feature-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2 14.5 9 22 9.5 16.5 14 18 21 12 17.5 6 21 7.5 14 2 9.5 9.5 9Z"/>
            </svg>
          </div>
          <h3>Recomendaciones</h3>
          <p>Nuestro algoritmo aprende tus gustos y afina lo que más te gusta.</p>
        </div>
        <div class="feature-card" style="--d:0.2s">
          <div class="feature-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <h3>Destacadas premium</h3>
          <p>Visibilidad máxima en la portada de la app para tus emisoras.</p>
        </div>
        <div class="feature-card" style="--d:0.3s">
          <div class="feature-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"/>
            </svg>
          </div>
          <h3>Favoritos sincronizados</h3>
          <p>Guarda y accede a tus emisoras desde cualquier dispositivo.</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="cta-gradient" aria-hidden="true"></div>
      <h2>¿Tienes una emisora?</h2>
      <p>Consigue visibilidad premium en nuestra app durante 7 días. Solo 5 spots disponibles simultáneamente.</p>
      <a routerLink="/request" class="btn btn-primary btn-large">
        <span>Solicitar posición destacada</span>
        <span class="btn-arrow">→</span>
        <span class="btn-shimmer"></span>
      </a>
    </section>

    <footer class="footer">
      <span>© 2025 Radio Aether · Todos los derechos reservados</span>
    </footer>
  `,
  styles: [`
    :host { display: block; position: relative; }

    /* ══════════════════════════════════════════════════════════════════════
       HERO
    ══════════════════════════════════════════════════════════════════════ */
    .hero {
      position: relative;
      min-height: 88vh;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5rem 6rem 6rem;
      gap: 5rem;
      overflow: hidden;
    }

    /* ── Aurora background ── */
    .aurora {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
    }
    .aurora-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.55;
      will-change: transform;
    }
    .blob-1 {
      width: 620px; height: 620px;
      top: -200px; left: -120px;
      background: radial-gradient(circle, #646cff 0%, transparent 70%);
      animation: auroraShift 28s ease-in-out infinite;
    }
    .blob-2 {
      width: 520px; height: 520px;
      top: 10%; right: -100px;
      background: radial-gradient(circle, #a78bfa 0%, transparent 70%);
      animation: auroraShift 34s ease-in-out infinite reverse;
    }
    .blob-3 {
      width: 460px; height: 460px;
      bottom: -160px; left: 30%;
      background: radial-gradient(circle, #4f46e5 0%, transparent 70%);
      animation: auroraShift 40s ease-in-out infinite;
      opacity: 0.4;
    }
    .grid-mask {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(100,108,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(100,108,255,0.05) 1px, transparent 1px);
      background-size: 64px 64px;
      mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 40%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 40%, transparent 100%);
    }

    /* ── Hero content ── */
    .hero-content {
      flex: 1;
      max-width: 580px;
      position: relative;
      z-index: 1;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(100,108,255,0.08);
      border: 1px solid rgba(100,108,255,0.25);
      border-radius: 999px;
      padding: 0.4rem 0.95rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--subtext-2);
      margin-bottom: 1.75rem;
      backdrop-filter: blur(8px);
      opacity: 0;
      animation: fadeUp 0.7s var(--ease-out) 0.1s forwards;
    }
    .badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 10px rgba(100,108,255,0.8);
      animation: pulseGlow 2.5s ease-in-out infinite;
    }

    h1 {
      font-size: clamp(2.5rem, 5.2vw, 4rem);
      font-weight: 900;
      line-height: 1.02;
      letter-spacing: -0.035em;
      margin-bottom: 1.4rem;
      color: #fff;
      opacity: 0;
      animation: fadeUp 0.8s var(--ease-out) 0.25s forwards;
    }
    .gradient-text {
      background: linear-gradient(135deg, #646cff 0%, #a78bfa 60%, #c4b5fd 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-sub {
      font-size: 1.1rem;
      color: var(--subtext);
      line-height: 1.65;
      margin-bottom: 2.25rem;
      max-width: 500px;
      opacity: 0;
      animation: fadeUp 0.8s var(--ease-out) 0.4s forwards;
    }

    .hero-actions {
      display: flex;
      gap: 0.9rem;
      flex-wrap: wrap;
      opacity: 0;
      animation: fadeUp 0.8s var(--ease-out) 0.55s forwards;
    }

    .trust-row {
      margin-top: 2rem;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      color: var(--subtext);
      font-size: 0.82rem;
      opacity: 0;
      animation: fadeUp 0.8s var(--ease-out) 0.7s forwards;
    }
    .trust-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 10px rgba(16,185,129,0.5);
    }

    /* ══════════════════════════════════════════════════════════════════════
       BUTTONS
    ══════════════════════════════════════════════════════════════════════ */
    .btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.85rem 1.6rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.92rem;
      letter-spacing: -0.005em;
      text-decoration: none;
      transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out), background 0.25s var(--ease-out);
      overflow: hidden;
      cursor: pointer;
      isolation: isolate;
    }
    .btn-arrow {
      transition: transform 0.35s var(--ease-spring);
      display: inline-block;
    }
    .btn:hover .btn-arrow { transform: translateX(4px); }

    .btn-primary {
      background: linear-gradient(135deg, #646cff 0%, #5558e3 100%);
      color: #fff;
      box-shadow:
        0 1px 0 rgba(255,255,255,0.15) inset,
        0 10px 32px rgba(100,108,255,0.35),
        0 0 0 1px rgba(100,108,255,0.4);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.2) inset,
        0 14px 40px rgba(100,108,255,0.5),
        0 0 0 1px rgba(100,108,255,0.6);
    }
    .btn-shimmer {
      position: absolute;
      top: 0; left: 0;
      width: 40%; height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255,255,255,0.25) 50%,
        transparent 100%
      );
      transform: translateX(-120%) skewX(-20deg);
      pointer-events: none;
    }
    .btn-primary:hover .btn-shimmer {
      animation: shimmer 1.1s ease-out;
    }

    .btn-secondary {
      background: rgba(255,255,255,0.03);
      color: var(--subtext-2);
      border: 1px solid var(--border);
      backdrop-filter: blur(8px);
    }
    .btn-secondary:hover {
      color: #fff;
      border-color: rgba(100,108,255,0.5);
      background: rgba(100,108,255,0.06);
      transform: translateY(-2px);
    }

    .btn-large { padding: 1.05rem 2.25rem; font-size: 1rem; }

    /* ══════════════════════════════════════════════════════════════════════
       PHONE MOCKUP
    ══════════════════════════════════════════════════════════════════════ */
    .hero-visual {
      position: relative;
      flex: 0 0 auto;
      z-index: 1;
    }
    .phone-glow {
      position: absolute;
      inset: -40px;
      background: radial-gradient(circle, rgba(100,108,255,0.25), transparent 70%);
      filter: blur(40px);
      z-index: -1;
    }
    .phone-mock {
      position: relative;
      width: 310px;
      height: 590px;
      background: linear-gradient(180deg, #1c1c34 0%, #14142a 100%);
      border-radius: 42px;
      border: 1px solid rgba(100,108,255,0.18);
      padding: 1.4rem 1.2rem;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.04) inset,
        0 1px 0 rgba(255,255,255,0.08) inset,
        0 40px 80px rgba(0,0,0,0.6),
        0 0 120px rgba(100,108,255,0.15);
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      opacity: 0;
      animation:
        fadeUp 1s var(--ease-out) 0.4s forwards,
        float 7s ease-in-out 1.4s infinite;
    }
    .phone-notch {
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      width: 96px;
      height: 22px;
      background: #0a0a14;
      border-radius: 14px;
    }
    .phone-screen {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      height: 100%;
      padding-top: 1.4rem;
    }
    .phone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.3rem;
    }
    .app-name {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 4px;
      color: var(--accent);
    }
    .now-playing {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.68rem;
      color: var(--success);
      font-weight: 600;
    }
    .play-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 8px rgba(16,185,129,0.8);
      animation: pulseGlow 1.8s ease-in-out infinite;
    }

    .card-slide {
      opacity: 0;
      transform: translateX(18px);
      animation: slideInCard 0.7s var(--ease-out) var(--d, 0s) forwards;
    }
    @keyframes slideInCard {
      to { opacity: 1; transform: translateX(0); }
    }

    .station-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      padding: 0.75rem;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .station-card.featured {
      border-color: rgba(100,108,255,0.4);
      background: linear-gradient(135deg, rgba(100,108,255,0.12), rgba(167,139,250,0.05));
      animation:
        slideInCard 0.7s var(--ease-out) var(--d, 0s) forwards,
        pulseGlow 3.5s ease-in-out 1.8s infinite;
    }
    .station-color { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0; }
    .station-info { display: flex; flex-direction: column; gap: 2px; }
    .station-tag {
      font-size: 0.62rem;
      color: var(--accent);
      font-weight: 700;
      letter-spacing: 1px;
    }
    .station-name { font-size: 0.85rem; font-weight: 700; color: #fff; }
    .station-genre { font-size: 0.7rem; color: var(--subtext); }

    .player-bar {
      margin-top: auto;
      background: linear-gradient(135deg, rgba(100,108,255,0.2), rgba(167,139,250,0.1));
      border: 1px solid rgba(100,108,255,0.3);
      border-radius: 12px;
      padding: 0.7rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.78rem;
      color: #fff;
      font-weight: 600;
    }
    .player-track { display: flex; align-items: center; gap: 0.4rem; }
    .player-icon { color: var(--accent-2); font-size: 0.9rem; }
    .pulse-dot {
      width: 8px; height: 8px;
      background: var(--success);
      border-radius: 50%;
      animation: pulseGlow 1.5s ease-in-out infinite;
      box-shadow: 0 0 8px rgba(16,185,129,0.8);
    }

    /* ══════════════════════════════════════════════════════════════════════
       STATS
    ══════════════════════════════════════════════════════════════════════ */
    .stats {
      padding: 5rem 6rem 2rem;
      position: relative;
    }
    .section-eyebrow {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 3px;
      color: var(--accent);
      text-transform: uppercase;
      margin-bottom: 1rem;
      display: block;
      text-align: center;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.2rem;
    }

    .stat-card {
      position: relative;
      background: linear-gradient(180deg, var(--surface) 0%, var(--bg) 120%);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.25rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      overflow: hidden;
      transition: transform 0.35s var(--ease-out), border-color 0.35s var(--ease-out);
      isolation: isolate;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      border-color: rgba(100,108,255,0.5);
    }

    /* Rotating conic gradient glow on hover */
    .stat-conic {
      position: absolute;
      inset: -50%;
      background: conic-gradient(
        from 0deg,
        transparent 0deg,
        rgba(100,108,255,0.5) 60deg,
        rgba(167,139,250,0.5) 120deg,
        transparent 180deg,
        transparent 360deg
      );
      opacity: 0;
      transition: opacity 0.4s var(--ease-out);
      animation: rotateConic 6s linear infinite;
      pointer-events: none;
      z-index: -1;
    }
    .stat-card::after {
      content: '';
      position: absolute;
      inset: 1px;
      background: linear-gradient(180deg, var(--surface) 0%, var(--bg) 120%);
      border-radius: 15px;
      z-index: -1;
    }
    .stat-card:hover .stat-conic { opacity: 1; }

    .stat-number {
      font-size: 2.4rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #fff 0%, var(--accent-2) 120%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      font-variant-numeric: tabular-nums;
    }
    .stat-label {
      font-size: 0.85rem;
      color: var(--subtext);
      font-weight: 500;
    }

    /* ══════════════════════════════════════════════════════════════════════
       FEATURES
    ══════════════════════════════════════════════════════════════════════ */
    .features { padding: 5rem 6rem; position: relative; }
    .features h2 {
      font-size: clamp(1.8rem, 3vw, 2.3rem);
      font-weight: 800;
      text-align: center;
      letter-spacing: -0.02em;
      margin-bottom: 3rem;
      color: #fff;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.2rem;
    }

    .feature-card {
      position: relative;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: transform 0.4s var(--ease-out), border-color 0.4s var(--ease-out);
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px);
      isolation: isolate;
    }
    .features.in-view .feature-card {
      animation: fadeUp 0.8s var(--ease-out) var(--d, 0s) forwards;
    }

    .feature-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 1px;
      background: linear-gradient(135deg, rgba(100,108,255,0.6), rgba(167,139,250,0.3));
      -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.35s var(--ease-out);
      pointer-events: none;
    }
    .feature-card:hover { transform: translateY(-4px); }
    .feature-card:hover::before { opacity: 1; }

    .feature-icon-wrap {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: rgba(100,108,255,0.1);
      border: 1px solid rgba(100,108,255,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent);
      margin-bottom: 0.25rem;
      transition: transform 0.4s var(--ease-spring), box-shadow 0.4s var(--ease-out), color 0.3s var(--ease-out);
    }
    .feature-icon-wrap svg { width: 20px; height: 20px; }
    .feature-card:hover .feature-icon-wrap {
      transform: scale(1.08) rotate(-4deg);
      color: var(--accent-2);
      box-shadow: 0 0 24px rgba(100,108,255,0.4);
    }

    .feature-card h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.01em;
    }
    .feature-card p {
      font-size: 0.88rem;
      color: var(--subtext);
      line-height: 1.6;
    }

    /* ══════════════════════════════════════════════════════════════════════
       CTA
    ══════════════════════════════════════════════════════════════════════ */
    .cta {
      position: relative;
      margin: 2rem 6rem 4rem;
      border: 1px solid rgba(100,108,255,0.3);
      border-radius: 24px;
      padding: 4.5rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.2rem;
      overflow: hidden;
      isolation: isolate;
    }
    .cta-gradient {
      position: absolute;
      inset: -30%;
      background:
        radial-gradient(circle at 20% 30%, rgba(100,108,255,0.45) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(167,139,250,0.35) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(79,70,229,0.25) 0%, transparent 60%);
      filter: blur(40px);
      animation: auroraShift 18s ease-in-out infinite;
      z-index: -1;
    }
    .cta h2 {
      font-size: clamp(1.8rem, 3vw, 2.3rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #fff;
    }
    .cta p {
      color: var(--subtext-2);
      font-size: 1rem;
      max-width: 520px;
      line-height: 1.6;
    }

    /* ══════════════════════════════════════════════════════════════════════
       FOOTER
    ══════════════════════════════════════════════════════════════════════ */
    .footer {
      text-align: center;
      padding: 2rem;
      color: var(--subtext);
      font-size: 0.85rem;
      border-top: 1px solid var(--border);
    }

    /* ══════════════════════════════════════════════════════════════════════
       RESPONSIVE
    ══════════════════════════════════════════════════════════════════════ */
    @media (max-width: 1024px) {
      .hero { padding: 3rem 2rem; flex-direction: column; gap: 3rem; }
      .stats { padding: 2rem; }
      .stats-grid { grid-template-columns: repeat(2,1fr); }
      .features { padding: 3rem 2rem; }
      .features-grid { grid-template-columns: repeat(2,1fr); }
      .cta { margin: 2rem 1.5rem 3rem; padding: 3rem 1.5rem; }
    }
    @media (max-width: 560px) {
      .stats-grid, .features-grid { grid-template-columns: 1fr; }
      .phone-mock { width: 280px; height: 540px; }
    }
  `]
})
export class LandingComponent implements AfterViewInit {
  stats: Stat[] = [
    { key: 'stations',  target: 50,  suffix: 'K+', label: 'Emisoras disponibles',        current: 0 },
    { key: 'countries', target: 120, suffix: '+',  label: 'Países cubiertos',            current: 0 },
    { key: 'listeners', target: 500, suffix: 'K+', label: 'Oyentes activos',             current: 0 },
    { key: 'spots',     target: 5,   suffix: '',   label: 'Spots destacados disponibles', current: 0 },
  ];

  @ViewChildren('statNumber') statNumbers!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('statCard')   statCards!:   QueryList<ElementRef<HTMLElement>>;

  private animated = false;

  ngAfterViewInit(): void {
    this.setupStatsObserver();
    this.setupFeaturesObserver();
  }

  private setupStatsObserver(): void {
    const firstCard = this.statCards?.first?.nativeElement;
    if (!firstCard || !('IntersectionObserver' in window)) {
      this.stats.forEach(s => (s.current = s.target));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.animated) {
          this.animated = true;
          this.animateCountUp();
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });

    observer.observe(firstCard);
  }

  private setupFeaturesObserver(): void {
    const section = document.querySelector('.features');
    if (!section || !('IntersectionObserver' in window)) {
      section?.classList.add('in-view');
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.add('in-view');
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(section);
  }

  private animateCountUp(): void {
    const duration = 1600;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = ease(progress);

      this.stats.forEach((s, i) => {
        s.current = Math.round(eased * s.target);
        const el = this.statNumbers.get(i)?.nativeElement;
        if (el) el.textContent = `${s.current}${s.suffix}`;
      });

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}

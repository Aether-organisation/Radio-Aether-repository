import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="badge">◈ Plataforma de Radio Online</div>
        <h1>Descubre tu próxima<br><span class="gradient-text">emisora favorita</span></h1>
        <p class="hero-sub">Radio Aether conecta a millones de oyentes con las mejores emisoras del mundo. Música sin fronteras, en cualquier lugar.</p>
        <div class="hero-actions">
          <a routerLink="/request" class="btn btn-primary">Destacar mi emisora</a>
          <a routerLink="/status" class="btn btn-secondary">Ver estado de solicitud</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="phone-mock">
          <div class="phone-screen">
            <div class="phone-header">
              <span class="app-name">AETHER</span>
              <span class="now-playing">▶ En directo</span>
            </div>
            <div class="station-card featured">
              <div class="station-color" style="background: linear-gradient(135deg,#646cff,#a78bfa)"></div>
              <div class="station-info">
                <span class="station-tag">⭐ Destacada</span>
                <span class="station-name">Radio Nación</span>
                <span class="station-genre">Pop · Español</span>
              </div>
            </div>
            <div class="station-card">
              <div class="station-color" style="background: linear-gradient(135deg,#f97316,#fbbf24)"></div>
              <div class="station-info">
                <span class="station-name">Jazz FM</span>
                <span class="station-genre">Jazz · Internacional</span>
              </div>
            </div>
            <div class="station-card">
              <div class="station-color" style="background: linear-gradient(135deg,#10b981,#34d399)"></div>
              <div class="station-info">
                <span class="station-name">Chill Lounge</span>
                <span class="station-genre">Lounge · Electrónica</span>
              </div>
            </div>
            <div class="player-bar">
              <span>🎵 Radio Nación</span>
              <span class="pulse-dot"></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">50K+</span>
          <span class="stat-label">Emisoras disponibles</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">120+</span>
          <span class="stat-label">Países cubiertos</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">500K+</span>
          <span class="stat-label">Oyentes activos</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">5</span>
          <span class="stat-label">Spots destacados disponibles</span>
        </div>
      </div>
    </section>

    <section class="features">
      <h2>¿Por qué elegir <span class="gradient-text">Aether</span>?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-icon">📍</span>
          <h3>Emisoras cercanas</h3>
          <p>Descubre emisoras cerca de tu ubicación con detección GPS automática.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">✨</span>
          <h3>Recomendaciones personalizadas</h3>
          <p>Nuestro algoritmo aprende tus gustos para mostrarte lo que más te gusta.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">⭐</span>
          <h3>Emisoras destacadas</h3>
          <p>Posiciones premium en la pantalla principal para máxima visibilidad.</p>
        </div>
        <div class="feature-card">
          <span class="feature-icon">❤️</span>
          <h3>Favoritos sincronizados</h3>
          <p>Guarda tus emisoras favoritas y accede desde cualquier dispositivo.</p>
        </div>
      </div>
    </section>

    <section class="cta">
      <h2>¿Tienes una emisora?</h2>
      <p>Consigue visibilidad premium en nuestra app durante 7 días. Solo hay 5 spots disponibles.</p>
      <a routerLink="/request" class="btn btn-primary btn-large">Solicitar posición destacada →</a>
    </section>

    <footer class="footer">
      <span>© 2025 Radio Aether · Todos los derechos reservados</span>
    </footer>
  `,
  styles: [`
    /* ── Hero ── */
    .hero {
      min-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4rem 6rem;
      position: relative;
      overflow: hidden;
      gap: 4rem;
    }
    .hero-glow {
      position: absolute;
      top: -20%;
      left: -10%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(100,108,255,0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-content { flex: 1; max-width: 560px; position: relative; z-index: 1; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(100,108,255,0.12);
      border: 1px solid rgba(100,108,255,0.3);
      border-radius: 999px;
      padding: 0.4rem 1rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #646cff;
      margin-bottom: 1.5rem;
    }
    h1 { font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 900; line-height: 1.1; margin: 0 0 1.2rem; color: #fff; }
    .gradient-text { background: linear-gradient(135deg, #646cff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-sub { font-size: 1.1rem; color: #9399b2; line-height: 1.7; margin-bottom: 2rem; }
    .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

    /* ── Buttons ── */
    .btn {
      display: inline-flex;
      align-items: center;
      padding: 0.75rem 1.8rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }
    .btn-primary { background: #646cff; color: #fff; box-shadow: 0 4px 20px rgba(100,108,255,0.4); }
    .btn-primary:hover { background: #5558e3; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(100,108,255,0.5); }
    .btn-secondary { background: rgba(100,108,255,0.1); color: #9399b2; border: 1px solid rgba(100,108,255,0.25); }
    .btn-secondary:hover { color: #fff; border-color: rgba(100,108,255,0.6); }
    .btn-large { padding: 1rem 2.5rem; font-size: 1.05rem; }

    /* ── Phone mockup ── */
    .hero-visual { flex: 0 0 auto; }
    .phone-mock {
      width: 300px;
      height: 580px;
      background: #16162a;
      border-radius: 36px;
      border: 2px solid rgba(100,108,255,0.25);
      padding: 1.2rem;
      box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(100,108,255,0.1);
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .phone-screen { display: flex; flex-direction: column; gap: 0.75rem; height: 100%; }
    .phone-header { display: flex; justify-content: space-between; align-items: center; }
    .app-name { font-size: 0.7rem; font-weight: 800; letter-spacing: 4px; color: #646cff; }
    .now-playing { font-size: 0.7rem; color: #10b981; font-weight: 600; }
    .station-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255,255,255,0.04);
      border-radius: 12px;
      padding: 0.75rem;
      border: 1px solid rgba(255,255,255,0.07);
    }
    .station-card.featured { border-color: rgba(100,108,255,0.4); background: rgba(100,108,255,0.08); }
    .station-color { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0; }
    .station-info { display: flex; flex-direction: column; gap: 2px; }
    .station-tag { font-size: 0.65rem; color: #646cff; font-weight: 700; }
    .station-name { font-size: 0.85rem; font-weight: 700; color: #fff; }
    .station-genre { font-size: 0.72rem; color: #9399b2; }
    .player-bar {
      margin-top: auto;
      background: rgba(100,108,255,0.15);
      border-radius: 10px;
      padding: 0.6rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #fff;
      font-weight: 600;
    }
    .pulse-dot {
      width: 8px; height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }

    /* ── Stats ── */
    .stats { padding: 4rem 6rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
    .stat-card {
      background: #16162a;
      border: 1px solid #2d2d4a;
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      display: flex; flex-direction: column; gap: 0.4rem;
    }
    .stat-number { font-size: 2.2rem; font-weight: 900; color: #646cff; }
    .stat-label { font-size: 0.85rem; color: #9399b2; }

    /* ── Features ── */
    .features { padding: 4rem 6rem; }
    .features h2 { font-size: 2rem; font-weight: 800; text-align: center; margin-bottom: 2.5rem; color: #fff; }
    .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
    .feature-card {
      background: #16162a;
      border: 1px solid #2d2d4a;
      border-radius: 16px;
      padding: 2rem;
      display: flex; flex-direction: column; gap: 0.75rem;
      transition: border-color 0.2s, transform 0.2s;
    }
    .feature-card:hover { border-color: rgba(100,108,255,0.5); transform: translateY(-4px); }
    .feature-icon { font-size: 1.8rem; }
    .feature-card h3 { font-size: 1rem; font-weight: 700; color: #fff; margin: 0; }
    .feature-card p { font-size: 0.875rem; color: #9399b2; line-height: 1.6; margin: 0; }

    /* ── CTA ── */
    .cta {
      margin: 2rem 6rem 4rem;
      background: linear-gradient(135deg, rgba(100,108,255,0.15), rgba(167,139,250,0.1));
      border: 1px solid rgba(100,108,255,0.3);
      border-radius: 24px;
      padding: 4rem;
      text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
    }
    .cta h2 { font-size: 2rem; font-weight: 800; color: #fff; margin: 0; }
    .cta p { color: #9399b2; font-size: 1rem; max-width: 500px; margin: 0; }

    /* ── Footer ── */
    .footer { text-align: center; padding: 2rem; color: #9399b2; font-size: 0.85rem; border-top: 1px solid #2d2d4a; }

    @media (max-width: 1024px) {
      .hero { padding: 3rem 2rem; flex-direction: column; }
      .stats { padding: 2rem; }
      .stats-grid { grid-template-columns: repeat(2,1fr); }
      .features { padding: 2rem; }
      .features-grid { grid-template-columns: repeat(2,1fr); }
      .cta { margin: 1rem 2rem 2rem; padding: 2.5rem 1.5rem; }
    }
  `]
})
export class LandingComponent {}

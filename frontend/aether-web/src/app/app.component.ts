import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <a routerLink="/" class="nav-brand">
          <span class="nav-logo">◈</span>
          <span class="nav-title">AETHER</span>
        </a>
        <ul class="nav-links">
          <li>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
              <span>Inicio</span>
              <span class="nav-dot"></span>
            </a>
          </li>
          <li>
            <a routerLink="/request" routerLinkActive="active">
              <span>Destacar mi radio</span>
              <span class="nav-dot"></span>
            </a>
          </li>
          <li>
            <a routerLink="/status" routerLinkActive="active">
              <span>Estado solicitud</span>
              <span class="nav-dot"></span>
            </a>
          </li>
        </ul>
      </div>
      <div class="nav-border"></div>
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    :host { display: block; }

    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(14, 14, 26, 0.6);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      animation: slideDown 0.7s var(--ease-out) both;
    }

    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2.5rem;
      height: 68px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Brand */
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      text-decoration: none;
      transition: transform 0.3s var(--ease-out);
    }
    .nav-brand:hover { transform: translateY(-1px); }

    .nav-logo {
      font-size: 1.35rem;
      color: var(--accent);
      text-shadow: 0 0 16px rgba(100,108,255,0.6);
      transition: transform 0.4s var(--ease-spring);
    }
    .nav-brand:hover .nav-logo { transform: rotate(90deg); }

    .nav-title {
      font-weight: 800;
      font-size: 0.95rem;
      letter-spacing: 5px;
      background: linear-gradient(135deg, #fff 0%, var(--accent-2) 120%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Links */
    .nav-links {
      display: flex;
      gap: 0.4rem;
      list-style: none;
    }
    .nav-links a {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.55rem 1rem;
      color: var(--subtext);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      letter-spacing: -0.005em;
      border-radius: 8px;
      transition: color 0.25s var(--ease-out), background 0.25s var(--ease-out);
    }
    .nav-links a:hover {
      color: #fff;
      background: rgba(100,108,255,0.06);
    }
    .nav-links a.active { color: #fff; }
    .nav-links a.active::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(100,108,255,0.18), rgba(167,139,250,0.08));
      border: 1px solid rgba(100,108,255,0.25);
      opacity: 0;
      animation: fadeIn 0.35s var(--ease-out) forwards;
      z-index: -1;
    }

    /* Active dot indicator */
    .nav-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 8px rgba(100,108,255,0.8);
      opacity: 0;
      transform: scale(0);
      transition: opacity 0.3s var(--ease-out), transform 0.4s var(--ease-spring);
    }
    .nav-links a.active .nav-dot {
      opacity: 1;
      transform: scale(1);
    }

    /* Bottom animated border gradient */
    .nav-border {
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(100,108,255,0) 10%,
        rgba(100,108,255,0.5) 40%,
        rgba(167,139,250,0.5) 60%,
        rgba(100,108,255,0) 90%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: borderSweep 8s linear infinite;
    }

    @media (max-width: 720px) {
      .nav-inner { padding: 0 1.25rem; }
      .nav-links { gap: 0; }
      .nav-links a { padding: 0.5rem 0.7rem; font-size: 0.8rem; }
      .nav-title { letter-spacing: 3px; }
    }
  `]
})
export class AppComponent {}

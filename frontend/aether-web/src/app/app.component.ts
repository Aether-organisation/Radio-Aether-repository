import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <span class="nav-logo">◈</span>
        <span class="nav-title">AETHER</span>
      </div>
      <ul class="nav-links">
        <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Inicio</a></li>
        <li><a routerLink="/request" routerLinkActive="active">Destacar mi radio</a></li>
        <li><a routerLink="/status" routerLinkActive="active">Estado solicitud</a></li>
      </ul>
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 64px;
      background: rgba(14,14,26,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(100,108,255,0.18);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-brand { display: flex; align-items: center; gap: 0.5rem; }
    .nav-logo { font-size: 1.4rem; color: #646cff; }
    .nav-title { font-weight: 800; font-size: 1rem; letter-spacing: 4px; color: #646cff; }
    .nav-links { display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0; }
    .nav-links a { color: #9399b2; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
    .nav-links a:hover, .nav-links a.active { color: #fff; }
    main { min-height: calc(100vh - 64px); }
  `]
})
export class AppComponent {}

import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface FeaturedStation {
  id: string;
  stationName: string;
  genre: string;
  logoUrl: string;
  streamUrl: string;
  featuredFrom: string;
  featuredUntil: string;
  isActive: boolean;
  odooRequestId: string;
}

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="noise-overlay"></div>
    <div class="page-wrapper">
      <div class="aurora-glow aurora-1"></div>
      <div class="aurora-glow aurora-2"></div>

      <div class="status-container">
        <div class="page-header">
          <div class="page-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h1>Consultar <span class="gradient-text">estado</span> de solicitud</h1>
          <p>Introduce el ID de solicitud que te enviamos al registrarte para ver si tu emisora ha sido aprobada.</p>
        </div>

        <div class="search-card">
          <div class="search-box">
            <div class="input-wrap">
              <input
                type="text"
                [(ngModel)]="requestId"
                name="requestId"
                placeholder="Pega aquí tu ID de solicitud…"
                class="search-input"
                (keydown.enter)="checkStatus()">
            </div>
            <button class="btn btn-primary" (click)="checkStatus()" [disabled]="loading() || !requestId.trim()">
              @if (loading()) {
                <span class="loading-dots"><span></span><span></span><span></span></span>
              } @else {
                <span>Consultar</span>
                <span class="btn-arrow">→</span>
                <span class="btn-shimmer"></span>
              }
            </button>
          </div>
        </div>

        @if (error()) {
          <div class="result-card error-card">
            <div class="result-icon-wrap error-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            </div>
            <div>
              <h3>No encontrado</h3>
              <p>{{ error() }}</p>
            </div>
          </div>
        }

        @if (station()) {
          <div class="result-card" [class.approved]="station()!.isActive" [class.pending]="!station()!.isActive">
            <div class="result-badge" [class.badge-approved]="station()!.isActive" [class.badge-pending]="!station()!.isActive">
              @if (station()!.isActive) {
                <span class="badge-dot"></span>
                APROBADA
              } @else {
                <span class="badge-dot"></span>
                PENDIENTE DE APROBACIÓN
              }
            </div>

            <div class="station-detail">
              @if (station()!.logoUrl) {
                <img [src]="station()!.logoUrl" [alt]="station()!.stationName" class="station-logo" (error)="onImgError($event)">
              } @else {
                <div class="station-logo-fallback">{{ station()!.stationName[0]?.toUpperCase() }}</div>
              }
              <div class="station-meta">
                <h2>{{ station()!.stationName }}</h2>
                <span class="station-genre">{{ station()!.genre }}</span>
              </div>
            </div>

            @if (station()!.isActive) {
              <div class="dates-grid">
                <div class="date-item">
                  <span class="date-label">ACTIVA DESDE</span>
                  <span class="date-value">{{ formatDate(station()!.featuredFrom) }}</span>
                </div>
                <div class="date-item">
                  <span class="date-label">EXPIRA EL</span>
                  <span class="date-value">{{ formatDate(station()!.featuredUntil) }}</span>
                </div>
              </div>
              <div class="stream-url">
                <span class="url-label">STREAM URL</span>
                <code class="url-value">{{ station()!.streamUrl }}</code>
              </div>
            } @else {
              <p class="pending-msg">
                Tu solicitud está siendo revisada por nuestro equipo.
                Recibirás una notificación en menos de 24 horas.
              </p>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      min-height: calc(100vh - 68px);
      overflow: hidden;
    }

    .page-wrapper {
      min-height: calc(100vh - 68px);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 4rem 2rem 6rem;
      position: relative;
      z-index: 1;
      animation: fadeUp 0.7s var(--ease-out) both;
    }

    .aurora-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
      z-index: 0;
    }
    .aurora-1 {
      bottom: 10%;
      left: -8%;
      width: 450px; height: 450px;
      background: radial-gradient(circle, rgba(167,139,250,0.22), transparent 70%);
      animation: auroraShift 28s ease-in-out infinite;
    }
    .aurora-2 {
      top: 8%;
      right: -10%;
      width: 520px; height: 520px;
      background: radial-gradient(circle, rgba(100,108,255,0.18), transparent 70%);
      animation: auroraShift 36s ease-in-out infinite reverse;
    }

    .status-container {
      width: 100%;
      max-width: 620px;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* ── Header ── */
    .page-header { text-align: center; }
    .page-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      margin: 0 auto 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent);
      background: linear-gradient(135deg, rgba(100,108,255,0.2), rgba(167,139,250,0.1));
      border: 1px solid rgba(100,108,255,0.3);
      box-shadow: 0 10px 40px rgba(100,108,255,0.25);
    }
    .page-icon svg { width: 28px; height: 28px; }
    .page-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }
    .gradient-text {
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .page-header p {
      color: var(--subtext);
      font-size: 0.98rem;
      line-height: 1.6;
      max-width: 480px;
      margin: 0 auto;
    }

    /* ── Search ── */
    .search-card {
      background: rgba(22,22,42,0.6);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1rem;
    }
    .search-box { display: flex; gap: 0.75rem; }

    .input-wrap {
      position: relative;
      flex: 1;
      border-radius: 10px;
      isolation: isolate;
    }
    .input-wrap::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 11px;
      padding: 1px;
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.25s var(--ease-out);
      pointer-events: none;
      z-index: 1;
    }
    .input-wrap:focus-within::before { opacity: 1; }

    .search-input {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.9rem 1rem;
      color: #fff;
      font-size: 0.95rem;
      font-family: 'SF Mono', 'Cascadia Code', Menlo, monospace;
      outline: none;
      transition: border-color 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);
    }
    .search-input:hover { border-color: var(--border-strong); }
    .search-input:focus {
      border-color: transparent;
      box-shadow: 0 0 0 4px rgba(100,108,255,0.12);
    }
    .search-input::placeholder { color: var(--subtext); font-family: inherit; }

    /* ── Buttons ── */
    .btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.9rem 1.7rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.92rem;
      letter-spacing: -0.005em;
      border: none;
      cursor: pointer;
      transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);
      white-space: nowrap;
      overflow: hidden;
      isolation: isolate;
    }
    .btn-arrow { transition: transform 0.35s var(--ease-spring); display: inline-block; }
    .btn:hover:not(:disabled) .btn-arrow { transform: translateX(4px); }

    .btn-primary {
      background: linear-gradient(135deg, #646cff 0%, #5558e3 100%);
      color: #fff;
      box-shadow:
        0 1px 0 rgba(255,255,255,0.15) inset,
        0 8px 24px rgba(100,108,255,0.3),
        0 0 0 1px rgba(100,108,255,0.4);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.2) inset,
        0 12px 32px rgba(100,108,255,0.45),
        0 0 0 1px rgba(100,108,255,0.6);
    }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-shimmer {
      position: absolute;
      top: 0; left: 0;
      width: 40%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
      transform: translateX(-120%) skewX(-20deg);
      pointer-events: none;
    }
    .btn-primary:hover:not(:disabled) .btn-shimmer {
      animation: shimmer 1.1s ease-out;
    }

    .loading-dots { display: inline-flex; gap: 3px; }
    .loading-dots span {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: #fff;
      animation: loadDot 1.1s ease-in-out infinite;
    }
    .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
    .loading-dots span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes loadDot {
      0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
      40%           { opacity: 1;   transform: scale(1.1); }
    }

    /* ── Result card ── */
    .result-card {
      background: rgba(22,22,42,0.7);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.3rem;
      animation: fadeUp 0.55s var(--ease-out) both;
    }
    .result-card.approved { border-color: rgba(16,185,129,0.4); }
    .result-card.pending  { border-color: rgba(251,191,36,0.35); }

    .result-card.error-card {
      flex-direction: row;
      align-items: center;
      gap: 1rem;
      border-color: rgba(239,68,68,0.35);
      background: linear-gradient(135deg, rgba(239,68,68,0.05), rgba(239,68,68,0.02));
    }
    .result-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .error-icon-wrap {
      background: rgba(239,68,68,0.12);
      border: 1px solid rgba(239,68,68,0.3);
      color: var(--danger);
    }
    .error-icon-wrap svg { width: 22px; height: 22px; }
    .result-card.error-card h3 { color: var(--danger); font-size: 1.05rem; margin-bottom: 0.3rem; font-weight: 700; }
    .result-card.error-card p { color: var(--subtext); font-size: 0.9rem; line-height: 1.5; }

    /* ── Badge ── */
    .result-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      align-self: flex-start;
      padding: 0.4rem 0.95rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 1.5px;
    }
    .badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
    }
    .badge-approved {
      background: rgba(16,185,129,0.12);
      color: var(--success);
      border: 1px solid rgba(16,185,129,0.35);
    }
    .badge-approved .badge-dot {
      background: var(--success);
      box-shadow: 0 0 8px rgba(16,185,129,0.8);
      animation: pulseGlow 2s ease-in-out infinite;
    }
    .badge-pending {
      background: rgba(251,191,36,0.08);
      color: var(--warning);
      border: 1px solid rgba(251,191,36,0.3);
    }
    .badge-pending .badge-dot {
      background: var(--warning);
      box-shadow: 0 0 8px rgba(251,191,36,0.8);
      animation: pulseGlow 2s ease-in-out infinite;
    }

    /* ── Station detail ── */
    .station-detail { display: flex; align-items: center; gap: 1rem; }
    .station-logo {
      width: 64px; height: 64px;
      border-radius: 12px;
      object-fit: cover;
      border: 1px solid var(--border);
    }
    .station-logo-fallback {
      width: 64px; height: 64px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(100,108,255,0.25), rgba(167,139,250,0.15));
      border: 1px solid rgba(100,108,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.7rem;
      font-weight: 800;
      color: var(--accent);
      flex-shrink: 0;
    }
    .station-meta { display: flex; flex-direction: column; gap: 0.25rem; }
    .station-meta h2 {
      font-size: 1.3rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
    }
    .station-genre { font-size: 0.85rem; color: var(--subtext); }

    /* ── Dates ── */
    .dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .date-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      background: rgba(14,14,26,0.5);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.85rem 1rem;
    }
    .date-label {
      font-size: 0.68rem;
      color: var(--subtext);
      letter-spacing: 1.5px;
      font-weight: 600;
    }
    .date-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #fff;
    }

    /* ── Stream URL ── */
    .stream-url { display: flex; flex-direction: column; gap: 0.4rem; }
    .url-label {
      font-size: 0.68rem;
      color: var(--subtext);
      letter-spacing: 1.5px;
      font-weight: 600;
    }
    .url-value {
      font-size: 0.82rem;
      color: var(--accent);
      font-family: 'SF Mono', 'Cascadia Code', Menlo, monospace;
      word-break: break-all;
      background: rgba(100,108,255,0.06);
      border: 1px solid rgba(100,108,255,0.15);
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
    }

    .pending-msg {
      color: var(--subtext-2);
      font-size: 0.92rem;
      line-height: 1.6;
      background: rgba(251,191,36,0.05);
      border: 1px solid rgba(251,191,36,0.15);
      border-radius: 10px;
      padding: 1rem 1.25rem;
    }

    @media (max-width: 720px) {
      .page-wrapper { padding: 2.5rem 1.25rem 4rem; }
      .page-header h1 { font-size: 1.6rem; }
      .search-box { flex-direction: column; }
      .dates-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class StatusComponent {
  requestId = '';
  loading = signal(false);
  station = signal<FeaturedStation | null>(null);
  error = signal('');

  constructor(private http: HttpClient) {}

  checkStatus(): void {
    if (!this.requestId.trim()) { return; }
    this.loading.set(true);
    this.station.set(null);
    this.error.set('');

    this.http.get<FeaturedStation>(`/api/featured/status/${this.requestId.trim()}`).subscribe({
      next: (station) => {
        this.station.set(station);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.error.set('No se encontró ninguna solicitud con ese ID. Comprueba que el ID sea correcto.');
        } else {
          this.error.set('Error de conexión. No se pudo consultar el estado en este momento.');
        }
        this.loading.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) { return '—'; }
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}

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
    <div class="page-wrapper">
      <div class="page-glow"></div>
      <div class="status-container">

        <div class="page-header">
          <span class="page-icon">🔍</span>
          <h1>Consultar estado de solicitud</h1>
          <p>Introduce el ID de solicitud que te enviamos al registrarte para ver si tu emisora ha sido aprobada.</p>
        </div>

        <div class="search-box">
          <input
            type="text"
            [(ngModel)]="requestId"
            name="requestId"
            placeholder="Pega aquí tu ID de solicitud…"
            class="search-input"
            (keydown.enter)="checkStatus()">
          <button class="btn btn-primary" (click)="checkStatus()" [disabled]="loading() || !requestId.trim()">
            @if (loading()) { ⏳ } @else { Consultar }
          </button>
        </div>

        @if (error()) {
          <div class="result-card error-card">
            <span class="result-icon">❌</span>
            <div>
              <h3>No encontrado</h3>
              <p>{{ error() }}</p>
            </div>
          </div>
        }

        @if (station()) {
          <div class="result-card" [class.approved]="station()!.isActive" [class.pending]="!station()!.isActive">
            <div class="result-badge" [class.badge-approved]="station()!.isActive" [class.badge-pending]="!station()!.isActive">
              @if (station()!.isActive) { ✅ APROBADA } @else { ⏳ PENDIENTE DE APROBACIÓN }
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
                  <span class="date-label">📅 Activa desde</span>
                  <span class="date-value">{{ formatDate(station()!.featuredFrom) }}</span>
                </div>
                <div class="date-item">
                  <span class="date-label">⏰ Expira el</span>
                  <span class="date-value">{{ formatDate(station()!.featuredUntil) }}</span>
                </div>
              </div>
              <div class="stream-url">
                <span class="url-label">🎵 Stream URL</span>
                <code class="url-value">{{ station()!.streamUrl }}</code>
              </div>
            } @else {
              <p class="pending-msg">Tu solicitud está siendo revisada por nuestro equipo. Recibirás una notificación en menos de 24 horas.</p>
            }
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .page-wrapper {
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      position: relative;
    }
    .page-glow {
      position: fixed;
      bottom: 10%;
      left: 5%;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .status-container {
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      position: relative;
      z-index: 1;
    }
    .page-header { text-align: center; }
    .page-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
    .page-header h1 { font-size: 1.8rem; font-weight: 800; color: #fff; margin: 0 0 0.75rem; }
    .page-header p { color: #9399b2; font-size: 0.95rem; line-height: 1.6; margin: 0; }

    .search-box { display: flex; gap: 0.75rem; }
    .search-input {
      flex: 1;
      background: #16162a;
      border: 1px solid #2d2d4a;
      border-radius: 10px;
      padding: 0.875rem 1rem;
      color: #fff;
      font-size: 0.95rem;
      font-family: monospace;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: #646cff; box-shadow: 0 0 0 3px rgba(100,108,255,0.15); }
    .search-input::placeholder { color: #9399b2; font-family: inherit; }

    .btn {
      display: inline-flex;
      align-items: center;
      padding: 0.875rem 1.75rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-primary { background: #646cff; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #5558e3; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .result-card {
      background: #16162a;
      border: 1px solid #2d2d4a;
      border-radius: 16px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .result-card.approved { border-color: rgba(16,185,129,0.4); }
    .result-card.pending { border-color: rgba(234,179,8,0.3); }
    .result-card.error-card {
      flex-direction: row;
      align-items: center;
      gap: 1rem;
      border-color: rgba(239,68,68,0.3);
      background: rgba(239,68,68,0.05);
    }
    .result-card.error-card h3 { color: #f87171; margin: 0 0 0.25rem; }
    .result-card.error-card p { color: #9399b2; margin: 0; font-size: 0.9rem; }
    .result-icon { font-size: 1.8rem; flex-shrink: 0; }

    .result-badge {
      display: inline-flex;
      align-self: flex-start;
      padding: 0.3rem 0.9rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .badge-approved { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
    .badge-pending { background: rgba(234,179,8,0.1); color: #fbbf24; border: 1px solid rgba(234,179,8,0.25); }

    .station-detail { display: flex; align-items: center; gap: 1rem; }
    .station-logo { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; }
    .station-logo-fallback {
      width: 64px; height: 64px;
      border-radius: 12px;
      background: rgba(100,108,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 800;
      color: #646cff;
      flex-shrink: 0;
    }
    .station-meta { display: flex; flex-direction: column; gap: 0.25rem; }
    .station-meta h2 { font-size: 1.3rem; font-weight: 800; color: #fff; margin: 0; }
    .station-genre { font-size: 0.85rem; color: #9399b2; }

    .dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .date-item { display: flex; flex-direction: column; gap: 0.25rem; background: rgba(255,255,255,0.03); border-radius: 10px; padding: 0.75rem 1rem; }
    .date-label { font-size: 0.75rem; color: #9399b2; }
    .date-value { font-size: 0.9rem; font-weight: 600; color: #fff; }

    .stream-url { display: flex; flex-direction: column; gap: 0.3rem; }
    .url-label { font-size: 0.78rem; color: #9399b2; }
    .url-value { font-size: 0.8rem; color: #646cff; font-family: monospace; word-break: break-all; background: rgba(100,108,255,0.08); padding: 0.5rem 0.75rem; border-radius: 6px; }

    .pending-msg { color: #9399b2; font-size: 0.9rem; line-height: 1.6; margin: 0; }
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

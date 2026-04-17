import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface RequestForm {
  stationName: string;
  streamUrl: string;
  logoUrl: string;
  genre: string;
}

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="noise-overlay"></div>
    <div class="page-wrapper">
      <div class="aurora-glow aurora-1"></div>
      <div class="aurora-glow aurora-2"></div>

      <div class="form-container">
        <div class="form-header">
          <div class="form-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2 14.5 9 22 9.5 16.5 14 18 21 12 17.5 6 21 7.5 14 2 9.5 9.5 9Z"/>
            </svg>
          </div>
          <h1>Solicitar posición <span class="gradient-text">destacada</span></h1>
          <p>
            Consigue máxima visibilidad en Radio Aether. Solo <strong>5 spots</strong>
            disponibles simultáneamente, durante <strong>7 días</strong> cada uno.
          </p>
        </div>

        @if (successId()) {
          <div class="success-box">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h3>¡Solicitud enviada!</h3>
            <p>Tu solicitud ha sido recibida y está pendiente de revisión por nuestro equipo.</p>
            <div class="request-id-box">
              <span class="id-label">TU ID DE SOLICITUD</span>
              <code class="id-value">{{ successId() }}</code>
            </div>
            <p class="id-hint">Guarda este ID. Lo necesitarás para consultar el estado.</p>
            <a routerLink="/status" class="btn btn-primary">
              <span>Ver estado de mi solicitud</span>
              <span class="btn-arrow">→</span>
              <span class="btn-shimmer"></span>
            </a>
          </div>
        }

        @if (error()) {
          <div class="error-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="err-icon">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>{{ error() }}</span>
          </div>
        }

        @if (!successId()) {
          <form class="request-form" (ngSubmit)="submitRequest()">
            <div class="form-group">
              <label for="stationName">Nombre de la emisora *</label>
              <div class="input-wrap">
                <input id="stationName" type="text" [(ngModel)]="form.stationName" name="stationName"
                  placeholder="ej. Radio Nación FM" required class="form-input" autocomplete="off">
              </div>
            </div>

            <div class="form-group">
              <label for="streamUrl">URL del Stream *</label>
              <div class="input-wrap">
                <input id="streamUrl" type="url" [(ngModel)]="form.streamUrl" name="streamUrl"
                  placeholder="https://stream.tuemisora.com/live" required class="form-input" autocomplete="off">
              </div>
              <span class="field-hint">URL directa al audio en streaming (MP3, AAC, HLS)</span>
            </div>

            <div class="form-group">
              <label for="logoUrl">URL del Logo</label>
              <div class="input-wrap">
                <input id="logoUrl" type="url" [(ngModel)]="form.logoUrl" name="logoUrl"
                  placeholder="https://tuemisora.com/logo.png" class="form-input" autocomplete="off">
              </div>
              <span class="field-hint">Imagen cuadrada, mínimo 200×200px recomendado</span>
            </div>

            <div class="form-group">
              <label for="genre">Género musical *</label>
              <div class="input-wrap">
                <select id="genre" [(ngModel)]="form.genre" name="genre" required class="form-input">
                  <option value="" disabled>Selecciona un género…</option>
                  <option>Pop</option>
                  <option>Rock</option>
                  <option>Jazz</option>
                  <option>Clásica</option>
                  <option>Electrónica</option>
                  <option>Reggaeton</option>
                  <option>Hip-Hop</option>
                  <option>Flamenco</option>
                  <option>Noticias y Deportes</option>
                  <option>Lounge / Chillout</option>
                  <option>Otro</option>
                </select>
              </div>
            </div>

            <div class="pricing-info">
              <div class="pricing-row">
                <span class="pricing-label">Duración del spot</span>
                <strong>7 días</strong>
              </div>
              <div class="pricing-sep"></div>
              <div class="pricing-row">
                <span class="pricing-label">Posición</span>
                <strong>Portada de la App</strong>
              </div>
              <div class="pricing-sep"></div>
              <div class="pricing-row">
                <span class="pricing-label">Revisión</span>
                <strong>En menos de 24h</strong>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-full" [disabled]="loading()">
              @if (loading()) {
                <span class="loading-dots"><span></span><span></span><span></span></span>
                <span>Enviando solicitud…</span>
              } @else {
                <span>Enviar solicitud de destacado</span>
                <span class="btn-arrow">→</span>
                <span class="btn-shimmer"></span>
              }
            </button>
          </form>
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

    /* Aurora background blobs */
    .aurora-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
      z-index: 0;
    }
    .aurora-1 {
      top: 5%;
      right: -10%;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(100,108,255,0.25), transparent 70%);
      animation: auroraShift 26s ease-in-out infinite;
    }
    .aurora-2 {
      bottom: 10%;
      left: -8%;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(167,139,250,0.18), transparent 70%);
      animation: auroraShift 32s ease-in-out infinite reverse;
    }

    .form-container {
      width: 100%;
      max-width: 580px;
      display: flex;
      flex-direction: column;
      gap: 2.25rem;
    }

    /* ── Header ── */
    .form-header { text-align: center; }
    .form-icon {
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
    .form-icon svg { width: 28px; height: 28px; }
    .form-header h1 {
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
    .form-header p {
      color: var(--subtext);
      font-size: 0.98rem;
      line-height: 1.6;
      max-width: 460px;
      margin: 0 auto;
    }
    .form-header strong { color: #fff; font-weight: 600; }

    /* ── Form ── */
    .request-form {
      display: flex;
      flex-direction: column;
      gap: 1.3rem;
      background: rgba(22,22,42,0.6);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 2rem;
    }
    .form-group { display: flex; flex-direction: column; gap: 0.45rem; }
    label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--subtext-2);
      letter-spacing: -0.005em;
    }

    .input-wrap {
      position: relative;
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

    .form-input {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      color: #fff;
      font-size: 0.95rem;
      font-family: inherit;
      transition: border-color 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }
    .form-input:hover { border-color: var(--border-strong); }
    .form-input:focus {
      border-color: transparent;
      box-shadow: 0 0 0 4px rgba(100,108,255,0.12);
    }
    .form-input::placeholder { color: var(--subtext); }
    select.form-input {
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' stroke='%239399b2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.9rem center;
      padding-right: 2.5rem;
    }
    select.form-input option { background: var(--surface); color: #fff; }
    .field-hint { font-size: 0.78rem; color: var(--subtext); }

    /* ── Pricing info ── */
    .pricing-info {
      background: linear-gradient(135deg, rgba(100,108,255,0.06), rgba(167,139,250,0.03));
      border: 1px solid rgba(100,108,255,0.2);
      border-radius: 12px;
      padding: 1.1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .pricing-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.88rem;
    }
    .pricing-label { color: var(--subtext); }
    .pricing-row strong { color: #fff; font-weight: 600; }
    .pricing-sep { height: 1px; background: var(--border); margin: 0; }

    /* ── Buttons ── */
    .btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.95rem 1.8rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      letter-spacing: -0.005em;
      text-decoration: none;
      transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);
      border: none;
      cursor: pointer;
      overflow: hidden;
      isolation: isolate;
    }
    .btn-arrow { transition: transform 0.35s var(--ease-spring); }
    .btn:hover:not(:disabled) .btn-arrow { transform: translateX(4px); }

    .btn-primary {
      background: linear-gradient(135deg, #646cff 0%, #5558e3 100%);
      color: #fff;
      box-shadow:
        0 1px 0 rgba(255,255,255,0.15) inset,
        0 10px 32px rgba(100,108,255,0.35),
        0 0 0 1px rgba(100,108,255,0.4);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.2) inset,
        0 14px 40px rgba(100,108,255,0.5),
        0 0 0 1px rgba(100,108,255,0.6);
    }
    .btn-primary:disabled { opacity: 0.75; cursor: not-allowed; }

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
    .btn-full { width: 100%; }

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

    /* ── Success ── */
    .success-box {
      background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.03));
      border: 1px solid rgba(16,185,129,0.35);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      animation: fadeUp 0.6s var(--ease-out) both;
    }
    .success-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.1));
      border: 1px solid rgba(16,185,129,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--success);
      animation: pulseGlow 2.5s ease-in-out infinite;
      box-shadow: 0 0 30px rgba(16,185,129,0.3);
    }
    .success-icon svg { width: 28px; height: 28px; }
    .success-box h3 {
      color: var(--success);
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .success-box p {
      color: var(--subtext-2);
      font-size: 0.95rem;
      max-width: 380px;
      line-height: 1.6;
    }
    .request-id-box {
      background: rgba(14,14,26,0.7);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      width: 100%;
      align-items: center;
    }
    .id-label {
      font-size: 0.7rem;
      color: var(--subtext);
      letter-spacing: 2px;
      font-weight: 600;
    }
    .id-value {
      font-family: 'SF Mono', 'Cascadia Code', Menlo, monospace;
      font-size: 0.92rem;
      color: var(--accent);
      word-break: break-all;
    }
    .id-hint { font-size: 0.82rem; color: var(--subtext); }

    /* ── Error ── */
    .error-box {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.35);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      color: var(--danger);
      font-size: 0.9rem;
      animation: fadeUp 0.4s var(--ease-out) both;
    }
    .err-icon { width: 18px; height: 18px; flex-shrink: 0; }

    @media (max-width: 720px) {
      .page-wrapper { padding: 2.5rem 1.25rem 4rem; }
      .request-form { padding: 1.5rem; }
      .form-header h1 { font-size: 1.6rem; }
    }
  `]
})
export class RequestComponent {
  form: RequestForm = { stationName: '', streamUrl: '', logoUrl: '', genre: '' };
  loading = signal(false);
  successId = signal('');
  error = signal('');

  constructor(private http: HttpClient) {}

  submitRequest(): void {
    if (!this.form.stationName || !this.form.streamUrl || !this.form.genre) {
      this.error.set('Por favor rellena todos los campos obligatorios.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.http.post<string>('/api/featured/request', {
      stationName: this.form.stationName,
      streamUrl: this.form.streamUrl,
      logoUrl: this.form.logoUrl,
      genre: this.form.genre
    }, { responseType: 'text' as 'json' }).subscribe({
      next: (id: string) => {
        this.successId.set(id);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al enviar la solicitud. Inténtalo de nuevo.';
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }
}

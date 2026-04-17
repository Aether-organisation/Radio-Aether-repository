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
    <div class="page-wrapper">
      <div class="page-glow"></div>
      <div class="form-container">

        <div class="form-header">
          <span class="form-icon">⭐</span>
          <h1>Solicitar posición destacada</h1>
          <p>Consigue máxima visibilidad en Radio Aether. Solo <strong>5 spots</strong> disponibles simultáneamente, durante <strong>7 días</strong> cada uno.</p>
        </div>

        @if (successId()) {
          <div class="success-box">
            <span class="success-icon">✅</span>
            <h3>¡Solicitud enviada!</h3>
            <p>Tu solicitud ha sido recibida y está pendiente de revisión por nuestro equipo.</p>
            <div class="request-id-box">
              <span class="id-label">Tu ID de solicitud:</span>
              <code class="id-value">{{ successId() }}</code>
            </div>
            <p class="id-hint">Guarda este ID. Lo necesitarás para consultar el estado de tu solicitud.</p>
            <a routerLink="/status" class="btn btn-primary">Ver estado de mi solicitud →</a>
          </div>
        }

        @if (error()) {
          <div class="error-box">
            <span>⚠️ {{ error() }}</span>
          </div>
        }

        @if (!successId()) {
          <form class="request-form" (ngSubmit)="submitRequest()">
            <div class="form-group">
              <label for="stationName">Nombre de la emisora *</label>
              <input id="stationName" type="text" [(ngModel)]="form.stationName" name="stationName"
                placeholder="ej. Radio Nación FM" required class="form-input">
            </div>

            <div class="form-group">
              <label for="streamUrl">URL del Stream *</label>
              <input id="streamUrl" type="url" [(ngModel)]="form.streamUrl" name="streamUrl"
                placeholder="https://stream.tuemisora.com/live" required class="form-input">
              <span class="field-hint">URL directa al audio en streaming (MP3, AAC, HLS)</span>
            </div>

            <div class="form-group">
              <label for="logoUrl">URL del Logo</label>
              <input id="logoUrl" type="url" [(ngModel)]="form.logoUrl" name="logoUrl"
                placeholder="https://tuemisora.com/logo.png" class="form-input">
              <span class="field-hint">Imagen cuadrada, mínimo 200×200px recomendado</span>
            </div>

            <div class="form-group">
              <label for="genre">Género musical *</label>
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

            <div class="pricing-info">
              <div class="pricing-row">
                <span>⏱ Duración del spot</span>
                <strong>7 días</strong>
              </div>
              <div class="pricing-row">
                <span>📍 Posición</span>
                <strong>Pantalla principal de la App</strong>
              </div>
              <div class="pricing-row">
                <span>✅ Revisión</span>
                <strong>En menos de 24h</strong>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-full" [disabled]="loading()">
              @if (loading()) { ⏳ Enviando solicitud… }
              @else { Enviar solicitud de destacado → }
            </button>
          </form>
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
      top: 20%;
      right: 10%;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(100,108,255,0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .form-container {
      width: 100%;
      max-width: 560px;
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .form-header { text-align: center; }
    .form-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
    .form-header h1 { font-size: 1.8rem; font-weight: 800; color: #fff; margin: 0 0 0.75rem; }
    .form-header p { color: #9399b2; font-size: 0.95rem; line-height: 1.6; margin: 0; }
    .form-header strong { color: #fff; }

    .request-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 0.875rem; font-weight: 600; color: #c8caf0; }
    .form-input {
      background: #16162a;
      border: 1px solid #2d2d4a;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      color: #fff;
      font-size: 0.95rem;
      font-family: inherit;
      transition: border-color 0.2s;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }
    .form-input:focus { border-color: #646cff; box-shadow: 0 0 0 3px rgba(100,108,255,0.15); }
    .form-input::placeholder { color: #9399b2; }
    .field-hint { font-size: 0.78rem; color: #9399b2; }

    select.form-input option { background: #16162a; }

    .pricing-info {
      background: rgba(100,108,255,0.06);
      border: 1px solid rgba(100,108,255,0.2);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .pricing-row { display: flex; justify-content: space-between; font-size: 0.9rem; }
    .pricing-row span { color: #9399b2; }
    .pricing-row strong { color: #fff; }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.875rem 2rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
    }
    .btn-primary { background: #646cff; color: #fff; box-shadow: 0 4px 20px rgba(100,108,255,0.35); }
    .btn-primary:hover:not(:disabled) { background: #5558e3; transform: translateY(-2px); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-full { width: 100%; }

    .success-box {
      background: rgba(16,185,129,0.08);
      border: 1px solid rgba(16,185,129,0.3);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .success-icon { font-size: 2rem; }
    .success-box h3 { color: #10b981; margin: 0; font-size: 1.3rem; }
    .success-box p { color: #9399b2; margin: 0; font-size: 0.9rem; }
    .request-id-box {
      background: #0e0e1a;
      border: 1px solid #2d2d4a;
      border-radius: 10px;
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      width: 100%;
    }
    .id-label { font-size: 0.75rem; color: #9399b2; text-transform: uppercase; letter-spacing: 1px; }
    .id-value { font-family: monospace; font-size: 0.9rem; color: #646cff; word-break: break-all; }
    .id-hint { font-size: 0.8rem; color: #9399b2; }

    .error-box {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 10px;
      padding: 1rem 1.25rem;
      color: #f87171;
      font-size: 0.9rem;
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

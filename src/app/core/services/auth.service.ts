import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiRespuesta } from '../models/api-respuesta.model';
import {
  CredencialesLogin,
  DatosRegistroPaciente,
  PacienteRegistrado,
  PayloadToken,
  RespuestaLogin,
} from '../models/auth.model';
import { ROLES, Usuario } from '../models/usuario.model';
import { AvisoService } from './aviso.service';

const CLAVE_TOKEN = 'clinica.token';
/** Mayor demora que acepta setTimeout (~24 días); por encima se dispararía al instante. */
const DEMORA_MAXIMA_MS = 2_147_483_647;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly avisos = inject(AvisoService);
  private readonly url = `${API_BASE_URL}/auth`;

  private readonly _token = signal<string | null>(this.leerTokenVigente());
  private readonly _usuario = signal<Usuario | null>(null);

  readonly token = this._token.asReadonly();
  /** Datos del usuario logueado (se completan con GET /auth/perfil). */
  readonly usuario = this._usuario.asReadonly();
  readonly payload = computed(() => this.decodificar(this._token()));
  readonly haySesion = computed(() => this.payload() !== null);
  readonly rol = computed(() => this.payload()?.rol ?? null);

  constructor() {
    // Si la sesión sobrevive a una recarga, se recuperan los datos del usuario para el header.
    if (this.haySesion()) {
      this.refrescarPerfil().subscribe({ error: () => undefined });
    }

    // Si el token vence mientras se usa la aplicación, se vuelve al login sin esperar otro pedido.
    effect((alLimpiar) => {
      const vencimiento = this.payload()?.exp;
      if (!vencimiento) return;
      const restante = vencimiento * 1000 - Date.now();
      if (restante > DEMORA_MAXIMA_MS) return;
      const temporizador = setTimeout(() => this.expirarSesion(), restante);
      alLimpiar(() => clearTimeout(temporizador));
    });
  }

  registrarPaciente(datos: DatosRegistroPaciente): Observable<PacienteRegistrado> {
    return this.http
      .post<ApiRespuesta<PacienteRegistrado>>(`${this.url}/registro`, datos)
      .pipe(map((r) => r.datos));
  }

  iniciarSesion(credenciales: CredencialesLogin): Observable<Usuario> {
    return this.http.post<ApiRespuesta<RespuestaLogin>>(`${this.url}/login`, credenciales).pipe(
      tap((r) => this.guardarToken(r.datos.token)),
      switchMap(() => this.refrescarPerfil()),
      // Si el perfil no puede obtenerse, no se deja una sesión a medias.
      catchError((error) => {
        this.limpiarSesion();
        return throwError(() => error);
      }),
    );
  }

  obtenerPerfil(): Observable<Usuario> {
    return this.http.get<ApiRespuesta<Usuario>>(`${this.url}/perfil`).pipe(map((r) => r.datos));
  }

  /** Vuelve a pedir el perfil y actualiza los datos del usuario logueado (header, Mis datos). */
  refrescarPerfil(): Observable<Usuario> {
    return this.obtenerPerfil().pipe(tap((usuario) => this._usuario.set(usuario)));
  }

  cerrarSesion(): void {
    this.limpiarSesion();
    this.router.navigate(['/']);
  }

  /** Cierra la sesión por token vencido/inválido y lleva al login. */
  expirarSesion(): void {
    this.limpiarSesion();
    this.avisos.error('Tu sesión expiró. Iniciá sesión nuevamente.');
    this.router.navigate(['/login']);
  }

  private guardarToken(token: string): void {
    try {
      localStorage.setItem(CLAVE_TOKEN, token);
    } catch {
      // Sin almacenamiento disponible la sesión dura lo que dure la pestaña.
    }
    this._token.set(token);
  }

  private limpiarSesion(): void {
    try {
      localStorage.removeItem(CLAVE_TOKEN);
    } catch {
      // nada que limpiar
    }
    this._token.set(null);
    this._usuario.set(null);
  }

  private leerTokenVigente(): string | null {
    let token: string | null = null;
    try {
      token = localStorage.getItem(CLAVE_TOKEN);
    } catch {
      return null;
    }
    if (token && this.decodificar(token) === null) {
      try {
        localStorage.removeItem(CLAVE_TOKEN);
      } catch {
        // ignorado
      }
      return null;
    }
    return token;
  }

  /** Decodifica el payload del JWT; devuelve null si está malformado o vencido. */
  private decodificar(token: string | null): PayloadToken | null {
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = new TextDecoder().decode(
        Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)),
      );
      const payload = JSON.parse(json) as PayloadToken;
      if (!ROLES.includes(payload.rol)) return null;
      if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
      return payload;
    } catch {
      return null;
    }
  }
}

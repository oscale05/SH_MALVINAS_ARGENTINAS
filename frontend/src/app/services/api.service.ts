import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  health() {
    return this.http.get<{ status: string; env: string }>(`${this.baseUrl}/health`);
  }

  login(username: string, password: string) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/auth/login`, { username, password });
  }

  upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    const token = localStorage.getItem('token') || '';
    return this.http.post<{ status: string; path: string; rows: number }>(`${this.baseUrl}/uploads`, form, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  macro(uploadId?: number, mes?: number, anio?: number) {
    const params = [];
    if (uploadId) params.push(`upload_id=${uploadId}`);
    if (mes) params.push(`mes=${mes}`);
    if (anio) params.push(`anio=${anio}`);
    const q = params.length ? '?' + params.join('&') : '';
    return this.http.get<{ rows: number; total: number; totals_by_origin: Record<string, number> }>(`${this.baseUrl}/dashboard/macro${q}`);
  }

  mensual(anio?: number) {
    const q = anio ? `?anio=${anio}` : '';
    return this.http.get<{ anio: number; meses: Record<string, { total: number; rows: number }> }>(`${this.baseUrl}/dashboard/mensual${q}`);
  }

  subsecretaria(secretariaId?: number) {
    const q = secretariaId ? `?secretaria_id=${secretariaId}` : '';
    return this.http.get<{ rows: number; totals_by_subsecretaria: Record<string, number> }>(`${this.baseUrl}/dashboard/subsecretaria${q}`);
  }

  direccion(subsecretariaId?: number) {
    const q = subsecretariaId ? `?subsecretaria_id=${subsecretariaId}` : '';
    return this.http.get<{ rows: number; totals_by_direccion: Record<string, number> }>(`${this.baseUrl}/dashboard/direccion${q}`);
  }

  eje() {
    return this.http.get<{ rows: number; totals_by_eje: Record<string, number> }>(`${this.baseUrl}/dashboard/eje`);
  }

  secretaria(ejeId?: number) {
    const q = ejeId ? `?eje_id=${ejeId}` : '';
    return this.http.get<{ rows: number; totals_by_secretaria: Record<string, number> }>(`${this.baseUrl}/dashboard/secretaria${q}`);
  }

  uploads() {
    return this.http.get<{ uploads: Array<{ id: number; filename: string; uploaded_at: string; status: string }> }>(`${this.baseUrl}/uploads`);
  }

  completo() {
    return this.http.get<{ rows: number; total: number; origenes: Record<string, number>; ejes: Record<string, number>; secretarias: Record<string, number>; subsecretarias: Record<string, number>; direcciones: Record<string, number>; concurrentes: Record<string, number> }>(`${this.baseUrl}/dashboard/completo`);
  }

  ampliaciones() {
    return this.http.get<{ ampliaciones: Array<{ id: number; codigo: string; concepto: string; tipo: string; valor: number }> }>(`${this.baseUrl}/dashboard/ampliaciones`);
  }

  changePassword(password: string) {
    const token = localStorage.getItem('token') || '';
    return this.http.post<{ status: string }>(`${this.baseUrl}/auth/change-password`, { password }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  healthFull() {
    return this.http.get<{ status: string; checks: Record<string, string> }>(`${this.baseUrl}/health/full`);
  }

  exportCsvUrl(uploadId?: number) {
    const q = uploadId ? `?upload_id=${uploadId}` : '';
    return `${this.baseUrl}/export/csv${q}`;
  }

  summary() {
    return this.http.get<{ uploads: number; users: number; ingresos: number }>(`${this.baseUrl}/dashboard/summary`);
  }

  resumen() {
    return this.http.get<{ rows: number; total: number }>(`${this.baseUrl}/dashboard/resumen`);
  }

  concepto(codigo: string) {
    return this.http.get<Record<string, unknown>>(`${this.baseUrl}/dashboard/concepto?codigo=${encodeURIComponent(codigo)}`);
  }

  conceptos() {
    return this.http.get<{ items: Array<{ codigo: string; imputacion: string; origen: string }> }>(`${this.baseUrl}/dashboard/conceptos`);
  }

  createTasa(data: any) {
    const token = localStorage.getItem('token') || '';
    return this.http.post<{ status: string; id: number }>(`${this.baseUrl}/tasas`, data, { headers: { Authorization: `Bearer ${token}` } });
  }

  updateTasa(data: any) {
    const token = localStorage.getItem('token') || '';
    return this.http.put<{ status: string; affected: number }>(`${this.baseUrl}/tasas`, data, { headers: { Authorization: `Bearer ${token}` } });
  }

  deleteTasa(codigo: string) {
    const token = localStorage.getItem('token') || '';
    return this.http.delete<{ status: string; deleted: number }>(`${this.baseUrl}/tasas?codigo=${encodeURIComponent(codigo)}`, { headers: { Authorization: `Bearer ${token}` } });
  }
}

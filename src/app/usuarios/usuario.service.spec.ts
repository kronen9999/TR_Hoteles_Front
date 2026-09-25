import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';
import { environment } from '../../environments/environment';

describe('UsuarioService: contrato CRUD por ID', () => {
  let service: UsuarioService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});
    service=TestBed.inject(UsuarioService); http=TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('consulta individual por GET', () => {
    service.obtenerPorId(7).subscribe();
    const request=http.expectOne(`${environment.authUrl}/admin/usuarios/7`);
    expect(request.request.method).toBe('GET'); request.flush({});
  });
  it('actualiza por PUT con contraseña omitida', () => {
    const body={username:'renombrado',roles:['ROLE_USER'] as ('ROLE_USER')[]};
    service.actualizar(7,body).subscribe();
    const request=http.expectOne(`${environment.authUrl}/admin/usuarios/7`);
    expect(request.request.method).toBe('PUT'); expect(request.request.body).toEqual(body); request.flush({});
  });
  it('elimina por DELETE con ID estable', () => {
    service.eliminar(7).subscribe();
    const request=http.expectOne(`${environment.authUrl}/admin/usuarios/7`);
    expect(request.request.method).toBe('DELETE'); request.flush({});
  });
});

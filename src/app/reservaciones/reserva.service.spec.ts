import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReservaService } from './reserva.service';
import { environment } from '../../environments/environment';
import { ReservaRequest, ReservaResponse } from '../core/models/reserva.model';

describe('ReservaService', () => {
  let service: ReservaService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/api/reservas`;

  const reservaMock: ReservaResponse = {
    idReserva: 1,
    idHuesped: 2,
    idHabitacion: 3,
    fechaEntrada: '2026-09-25',
    fechaSalida: '2026-09-30',
    estadoReserva: 'CONFIRMADA',
    estadoRegistro: 'ACTIVO'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReservaService]
    });
    service = TestBed.inject(ReservaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('cambiarEstado(check-in) debe hacer PATCH con codigo 2 (EN_CURSO)', () => {
    service.cambiarEstado(1, 'EN_CURSO').subscribe(res => {
      expect(res.estadoReserva).toBe('EN_CURSO');
    });

    const req = httpMock.expectOne(`${baseUrl}/1/estado/2`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...reservaMock, estadoReserva: 'EN_CURSO' });
  });

  it('cambiarEstado(check-out) debe hacer PATCH con codigo 3 (FINALIZADA)', () => {
    service.cambiarEstado(1, 'FINALIZADA').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1/estado/3`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...reservaMock, estadoReserva: 'FINALIZADA' });
  });

  it('cambiarEstado(cancelar) debe hacer PATCH con codigo 4 (CANCELADA)', () => {
    service.cambiarEstado(1, 'CANCELADA').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1/estado/4`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...reservaMock, estadoReserva: 'CANCELADA' });
  });

  it('registrar() debe hacer POST con fechas en formato LocalDate', () => {
    const request: ReservaRequest = {
      idHuesped: 2,
      idHabitacion: 3,
      fechaEntrada: '2026-09-25',
      fechaSalida: '2026-09-30'
    };

    service.registrar(request).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(reservaMock);
  });
});

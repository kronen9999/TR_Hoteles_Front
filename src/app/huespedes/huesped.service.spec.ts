import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HuespedService } from './huesped.service';
import { environment } from '../../environments/environment';
import { HuespedRequest, HuespedResponse } from '../core/models/huesped.model';

describe('HuespedService', () => {
  let service: HuespedService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/api/huespedes`;

  const huespedMock: HuespedResponse = {
    idHuesped: 1,
    nombre: 'Juan Perez Gomez',
    email: 'juan@test.com',
    telefono: '1234567890',
    documento: 'PASAPORTE',
    numDocumento: '12345',
    nacionalidad: 'Mexico'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HuespedService]
    });
    service = TestBed.inject(HuespedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('listar() debe hacer GET al gateway', () => {
    service.listar().subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].email).toBe('juan@test.com');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([huespedMock]);
  });

  it('obtenerPorId() debe hacer GET a /id-huesped/{id}', () => {
    service.obtenerPorId(1).subscribe(res => {
      expect(res.idHuesped).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/id-huesped/1`);
    expect(req.request.method).toBe('GET');
    req.flush(huespedMock);
  });

  it('registrar() debe hacer POST con el request completo', () => {
    const request: HuespedRequest = {
      nombre: 'Juan',
      apellidoPaterno: 'Perez',
      apellidoMaterno: 'Gomez',
      email: 'juan@test.com',
      telefono: '1234567890',
      documento: 'PASAPORTE',
      numDocumento: '12345',
      nacionalidad: 'Mexico'
    };

    service.registrar(request).subscribe(res => {
      expect(res.idHuesped).toBe(1);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(huespedMock);
  });

  it('actualizar() debe hacer PUT a /{id}', () => {
    const request: HuespedRequest = {
      nombre: 'Juan',
      apellidoPaterno: 'Perez',
      apellidoMaterno: 'Gomez',
      email: 'nuevo@test.com',
      telefono: '1234567890',
      documento: 'PASAPORTE',
      numDocumento: '12345',
      nacionalidad: 'Mexico'
    };

    service.actualizar(1, request).subscribe(res => {
      expect(res.email).toBe('juan@test.com');
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(huespedMock);
  });

  it('eliminar() debe hacer DELETE a /{id}', () => {
    service.eliminar(1).subscribe(res => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

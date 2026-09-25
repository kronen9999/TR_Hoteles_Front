// Pruebas de cumplimiento del README. Los fallos documentan requisitos pendientes.
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { HabitacionFormComponent } from './habitaciones/habitacion-form/habitacion-form.component';
import { HuespedFormComponent } from './huespedes/huesped-form/huesped-form.component';
import { UsuarioFormComponent } from './usuarios/usuario-form/usuario-form.component';
import { ReservaFormComponent } from './reservaciones/reserva-form/reserva-form.component';
import { ReservaListComponent } from './reservaciones/reserva-list/reserva-list.component';
import { AuthService } from './core/services/auth.service';
import { authGuard } from './core/guards/authGuard';
import { roleGuard } from './core/guards/roleGuard';

describe('Cumplimiento README: formularios y guards', () => {
  const fb = new FormBuilder();
  const noop: any = { open: () => {}, close: () => {} };
  const room = { numeroHabitacion: 10, tipoHabitacion: 'DOBLE', precio: 1200, capacidad: 2 };
  const guest = { nombre: 'Ana Maria', apellidoPaterno: 'Lopez', apellidoMaterno: 'Perez',
    email: 'qa@example.com', telefono: '5512345678', documento: 'PASAPORTE', numDocumento: '81234', nacionalidad: 'Mexico' };
  const reservation: any = { idReserva: 1, idHuesped: 1, idHabitacion: 1,
    fechaEntrada: '2026-10-10', fechaSalida: '2026-10-12', estadoReserva: 'CONFIRMADA', estadoRegistro: 'ACTIVO' };

  function roomForm() {
    const c = new HabitacionFormComponent(fb, noop, noop, noop, null);
    c.form.patchValue(room); return c;
  }
  function guestForm(data: any = null) {
    const c = new HuespedFormComponent(fb, noop, noop, noop, data);
    c.form.patchValue(guest); return c;
  }
  function userForm(data: any = null) {
    const c = new UsuarioFormComponent(fb, noop, noop, noop, data);
    c.form.patchValue({username:'pruebaqa',password:'Prueba123',roles:['ROLE_USER']});
    return c;
  }
  function reservationForm(state: string) {
    const c = new ReservaFormComponent(fb, noop,
      {listar: () => of([{idHuesped:1,nombre:'Ana'}])} as any,
      {listar: () => of([{idHabitacion:1,numeroHabitacion:10,estadoHabitacion:'OCUPADA'}])} as any,
      noop, noop, {...reservation,estadoReserva:state});
    c.ngOnInit(); return c;
  }

  it('HA01 acepta una habitación válida', () => expect(roomForm().form.valid).toBeTrue());
  it('HA02 rechaza número cero', () => {
    const c=roomForm(); c.form.patchValue({numeroHabitacion:0}); expect(c.form.invalid).toBeTrue();
  });
  it('HA03 exige número de habitación entero', () => {
    const c=roomForm(); c.form.patchValue({numeroHabitacion:1.5}); expect(c.form.invalid).toBeTrue();
  });
  it('HA04 rechaza precio cero', () => {
    const c=roomForm(); c.form.patchValue({precio:0}); expect(c.form.invalid).toBeTrue();
  });
  it('HA05 replica máximo de dos decimales exigido por backend', () => {
    const c=roomForm(); c.form.patchValue({precio:12.345}); expect(c.form.invalid).toBeTrue();
  });
  it('HA06 rechaza capacidad cero', () => {
    const c=roomForm(); c.form.patchValue({capacidad:0}); expect(c.form.invalid).toBeTrue();
  });
  it('H01 acepta datos válidos', () => expect(guestForm().form.valid).toBeTrue());
  for (const value of ['123456789','12345678901','12345abcde']) {
    it('H02 rechaza teléfono '+value, () => {
      const c=guestForm(); c.form.patchValue({telefono:value}); expect(c.form.invalid).toBeTrue();
    });
  }
  it('H03 rechaza email inválido', () => {
    const c=guestForm(); c.form.patchValue({email:'sin-arroba'}); expect(c.form.invalid).toBeTrue();
  });
  it('H04 rechaza nombre de un carácter', () => {
    const c=guestForm(); c.form.patchValue({nombre:'A'}); expect(c.form.invalid).toBeTrue();
  });
  it('H05 permite editar respuesta real con documento Pasaporte sin corregir el catálogo', () => {
    const c=guestForm({...guest,idHuesped:1,nombre:'Ana Maria Lopez Perez',documento:'Pasaporte'});
    c.ngOnInit(); expect(c.form.valid).toBeTrue();
  });
  it('H06 conserva un nombre compuesto al abrir edición', () => {
    const c=guestForm({...guest,idHuesped:1,nombre:'Ana Maria Lopez Perez'});
    c.ngOnInit(); expect(c.form.get('nombre')?.value).toBe('Ana Maria');
    expect(c.form.get('apellidoPaterno')?.value).toBe('Lopez');
  });
  it('U01 rechaza username de cuatro caracteres', () => {
    const c=userForm(); c.form.patchValue({username:'abcd'}); expect(c.form.invalid).toBeTrue();
  });
  for (const password of ['abc123','sololetras','12345678']) {
    it('U02 rechaza contraseña inválida en alta: '+password, () => {
      const c=userForm(); c.form.patchValue({password}); expect(c.form.invalid).toBeTrue();
    });
  }
  it('U03 rechaza contraseña nueva inválida en edición', () => {
    const c=userForm({username:'pruebaqa',roles:['ROLE_USER']}); c.ngOnInit();
    c.form.patchValue({password:'a'}); expect(c.form.invalid).toBeTrue();
  });
  it('R01 impide cambiar huésped y habitación en edición', () => {
    const c=reservationForm('CONFIRMADA');
    expect(c.form.get('idHuesped')?.disabled).toBeTrue();
    expect(c.form.get('idHabitacion')?.disabled).toBeTrue();
  });
  it('R02 exige entrada anterior a salida', () => {
    const c=reservationForm('CONFIRMADA');
    c.form.patchValue({fechaEntrada:'2026-10-12',fechaSalida:'2026-10-12'});
    expect(c.form.invalid).toBeTrue();
  });
  it('R03 permite solo salida después de check-in', () => {
    const c=reservationForm('EN_CURSO');
    expect(c.form.get('fechaEntrada')?.disabled).toBeTrue();
    expect(c.form.get('fechaSalida')?.enabled).toBeTrue();
    c.form.patchValue({fechaSalida:'2026-10-09'}); expect(c.form.invalid).toBeTrue();
  });
  it('R04 oculta cancelación para reservas EN_CURSO', () => {
    const c=new ReservaListComponent(noop,noop,noop,noop,noop);
    expect(c.puedeCancelar({...reservation,estadoReserva:'EN_CURSO'})).toBeFalse();
  });
  for (const state of ['FINALIZADA','CANCELADA']) {
    it('R05 reserva '+state+' es solo consulta histórica', () => {
      const c=new ReservaListComponent(noop,noop,noop,noop,noop);
      expect(c.puedeEditar({...reservation,estadoReserva:state})).toBeFalse();
      expect(c.puedeEliminar({...reservation,estadoReserva:state})).toBeFalse();
    });
  }
  it('S01 guard rechaza sesión ausente', () => {
    const auth={isAuthenticated:()=>false,logout:jasmine.createSpy('logout')};
    TestBed.configureTestingModule({providers:[{provide:AuthService,useValue:auth},{provide:Router,useValue:noop}]});
    expect(TestBed.runInInjectionContext(()=>authGuard({} as any,{} as any))).toBeFalse();
    expect(auth.logout).toHaveBeenCalled();
  });
  it('S02 guard impide acceso USER a usuarios', () => {
    const router={navigate:jasmine.createSpy('navigate')};
    TestBed.configureTestingModule({providers:[
      {provide:AuthService,useValue:{isAuthenticated:()=>true,hasAnyRole:()=>false}},
      {provide:Router,useValue:router},{provide:MatSnackBar,useValue:noop}]});
    const route={data:{roles:['ROLE_ADMIN']}} as unknown as ActivatedRouteSnapshot;
    expect(TestBed.runInInjectionContext(()=>roleGuard(route,{} as any))).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});

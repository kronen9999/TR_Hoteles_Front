import { of } from 'rxjs';
import { ReservaListComponent } from './reserva-list.component';
import { EstadoReserva, ReservaResponse } from '../../core/models/reserva.model';

describe('ReservaListComponent: eliminación según README', () => {
  let component: ReservaListComponent;
  let service: any;
  let snackbar: any;
  const reserva = (estadoReserva: EstadoReserva): ReservaResponse => ({
    idReserva: 1, idHuesped: 2, idHabitacion: 3,
    fechaEntrada: '2026-10-10', fechaSalida: '2026-10-12',
    estadoReserva, estadoRegistro: 'ACTIVO'
  });

  beforeEach(() => {
    service = { eliminar: jasmine.createSpy('eliminar').and.returnValue(of(undefined)) };
    snackbar = { open: jasmine.createSpy('open') };
    component = new ReservaListComponent(service, {} as any, {} as any, {} as any, snackbar);
  });

  for (const estado of ['CONFIRMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'] as EstadoReserva[]) {
    it('visibilidad de eliminar para ' + estado, () => {
      expect(component.puedeEliminar(reserva(estado))).toBe(estado === 'CONFIRMADA');
    });
  }

  for (const estado of ['EN_CURSO', 'FINALIZADA', 'CANCELADA'] as EstadoReserva[]) {
    it('rechaza la llamada directa a eliminar para ' + estado, () => {
      const confirm = spyOn(window, 'confirm');
      component.eliminar(reserva(estado));
      expect(confirm).not.toHaveBeenCalled();
      expect(service.eliminar).not.toHaveBeenCalled();
      expect(snackbar.open).toHaveBeenCalled();
    });
  }

  it('conserva eliminación de confirmadas y refresca la lista', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const buscar = spyOn(component, 'buscar');
    component.eliminar(reserva('CONFIRMADA'));
    expect(service.eliminar).toHaveBeenCalledOnceWith(1);
    expect(buscar).toHaveBeenCalled();
  });
});

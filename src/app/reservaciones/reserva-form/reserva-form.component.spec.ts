import { FormBuilder } from '@angular/forms';
import { fechasConsistentesValidator } from './reserva-form.component';

describe('fechasConsistentesValidator (regla del README: fechaEntrada < fechaSalida)', () => {
  let fb: FormBuilder;

  beforeEach(() => {
    fb = new FormBuilder();
  });

  const formulario = (entrada: string, salida: string) => {
    const grupo = fb.group({ fechaEntrada: [entrada], fechaSalida: [salida] });
    grupo.setValidators(fechasConsistentesValidator);
    grupo.updateValueAndValidity();
    return grupo;
  };

  it('es valido cuando fechaEntrada < fechaSalida', () => {
    const grupo = formulario('2026-09-25', '2026-09-30');
    expect(grupo.errors).toBeNull();
  });

  it('es invalido quando fechaEntrada > fechaSalida', () => {
    const grupo = formulario('2026-09-30', '2026-09-25');
    expect(grupo.errors).toEqual({ fechasInconsistentes: true });
  });

  it('es invalido cuando las fechas son iguales', () => {
    const grupo = formulario('2026-09-25', '2026-09-25');
    expect(grupo.errors).toEqual({ fechasInconsistentes: true });
  });

  it('no marca error cuando falta la fecha de salida', () => {
    const grupo = formulario('2026-09-25', '');
    expect(grupo.errors).toBeNull();
  });
});

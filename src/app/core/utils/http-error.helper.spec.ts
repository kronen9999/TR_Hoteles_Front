import { HttpErrorHelper } from './http-error.helper';

describe('HttpErrorHelper', () => {

  it('debe devolver el mensaje del backend cuando existe', () => {
    const error: any = { status: 409, error: { message: 'Ya existe un huésped activo con ese email' } };
    expect(HttpErrorHelper.obtenerMensaje(error)).toBe('Ya existe un huésped activo con ese email');
  });

  it('debe mapear 400 a mensaje de validación', () => {
    const error: any = { status: 400, error: null };
    const msg = HttpErrorHelper.obtenerMensaje(error);
    expect(msg).toContain('inválidos');
  });

  it('debe mapear 404 a recurso no encontrado', () => {
    const error: any = { status: 404 };
    expect(HttpErrorHelper.obtenerMensaje(error)).toContain('no existe');
  });

  it('debe mapear 409 a conflicto de reglas de negocio', () => {
    const error: any = { status: 409 };
    expect(HttpErrorHelper.obtenerMensaje(error)).toContain('Conflicto');
  });

  it('debe mapear 401 a sesión expirada', () => {
    const error: any = { status: 401 };
    expect(HttpErrorHelper.obtenerMensaje(error)).toContain('expirado');
  });

  it('debe mapear 403 a permisos', () => {
    const error: any = { status: 403 };
    expect(HttpErrorHelper.obtenerMensaje(error)).toContain('permisos');
  });

  it('debe mapear 500 a error interno', () => {
    const error: any = { status: 500 };
    expect(HttpErrorHelper.obtenerMensaje(error)).toContain('Error interno');
  });

  it('debe mapear 0 a problema de conexión', () => {
    const error: any = { status: 0 };
    expect(HttpErrorHelper.obtenerMensaje(error)).toContain('conectar');
  });
});

import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { UsuarioFormComponent } from './usuario-form.component';
import { UsuarioListComponent } from '../usuario-list/usuario-list.component';
import { UsuarioResponse } from '../../core/models/usuario.model';

describe('Usuarios: edición y eliminación por ID', () => {
  const user: UsuarioResponse = {idUsuario:7,username:'pruebauser',roles:['ROLE_USER'],estadoRegistro:'ACTIVO'};
  let service: any;
  let snackbar: any;
  let dialog: any;
  let form: UsuarioFormComponent;

  beforeEach(() => {
    service = {
      actualizar: jasmine.createSpy('actualizar').and.returnValue(of(user)),
      registrar: jasmine.createSpy('registrar').and.returnValue(of(user)),
      eliminar: jasmine.createSpy('eliminar').and.returnValue(of({...user,estadoRegistro:'ELIMINADO'})),
      obtenerPorId: jasmine.createSpy('obtenerPorId').and.returnValue(of({...user,username:'datoActual'}))
    };
    snackbar = {open:jasmine.createSpy('open')};
    dialog = {close:jasmine.createSpy('close'),open:jasmine.createSpy('open').and.returnValue({afterClosed:()=>of(false)})};
    form = new UsuarioFormComponent(new FormBuilder(), service, snackbar, dialog, user);
    form.ngOnInit();
  });

  it('permite editar username conservando el ID y omite password vacío', () => {
    expect(form.form.get('username')?.enabled).toBeTrue();
    form.form.patchValue({username:'renombrado'});
    form.guardar();
    expect(service.actualizar).toHaveBeenCalledOnceWith(7,{username:'renombrado',roles:['ROLE_USER']});
  });

  it('permite cambiar roles sin cambiar contraseña', () => {
    form.form.patchValue({roles:['ROLE_ADMIN']});
    form.guardar();
    expect(service.actualizar).toHaveBeenCalledOnceWith(7,{username:'pruebauser',roles:['ROLE_ADMIN']});
  });

  for (const password of ['a','sololetras','12345678','a1'.repeat(11)]) {
    it('rechaza nueva contraseña inválida: '+password, () => {
      form.form.patchValue({password});
      form.guardar();
      expect(service.actualizar).not.toHaveBeenCalled();
      expect(form.form.invalid).toBeTrue();
    });
  }

  it('envía contraseña nueva válida cuando se proporciona', () => {
    form.form.patchValue({password:'Nueva123'});
    form.guardar();
    expect(service.actualizar).toHaveBeenCalledOnceWith(7,{username:'pruebauser',roles:['ROLE_USER'],password:'Nueva123'});
  });

  it('exige contraseña al crear usuario', () => {
    form=new UsuarioFormComponent(new FormBuilder(),service,snackbar,dialog,null);
    form.form.patchValue({username:'pruebauser',roles:['ROLE_USER']});
    form.guardar();
    expect(service.registrar).not.toHaveBeenCalled();
  });

  it('consulta por ID los datos actuales antes de editar', () => {
    const list=new UsuarioListComponent(service,dialog,snackbar);
    list.abrirFormulario(user);
    expect(service.obtenerPorId).toHaveBeenCalledOnceWith(7);
    expect(dialog.open).toHaveBeenCalledWith(UsuarioFormComponent,{width:'450px',data:{...user,username:'datoActual'}});
  });

  it('elimina por ID aunque username haya cambiado', () => {
    spyOn(window,'confirm').and.returnValue(true);
    const list=new UsuarioListComponent(service,dialog,snackbar);
    spyOn(list,'buscar');
    list.eliminar({...user,username:'renombrado'});
    expect(service.eliminar).toHaveBeenCalledOnceWith(7);
    expect(list.buscar).toHaveBeenCalled();
  });
});

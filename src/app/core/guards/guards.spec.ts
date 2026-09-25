import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { authGuard } from './authGuard';
import { guestGuard } from './guestGuard';
import { roleGuard } from './roleGuard';
import { AuthService } from '../services/auth.service';
import { ROLES } from '../models/usuario.model';

describe('Guards de autenticación y rol', () => {
  let authServiceSpy: { isAuthenticated: jasmine.Spy; hasAnyRole: jasmine.Spy; logout: jasmine.Spy };
  let routerSpy: { navigate: jasmine.Spy };

  const preparar = (autenticado: boolean, rolesUsuario: string[]) => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'hasAnyRole', 'logout']);
    authServiceSpy.isAuthenticated.and.returnValue(autenticado);
    authServiceSpy.hasAnyRole.and.callFake((permitidos: string[]) =>
      rolesUsuario.some(r => permitidos.includes(r))
    );

    routerSpy = { navigate: jasmine.createSpy('navigate') };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  };

  describe('authGuard', () => {
    it('debe permitir acceso si está autenticado', () => {
      preparar(true, [ROLES[0]]);
      expect(TestBed.runInInjectionContext(() => authGuard())).toBeTrue();
    });

    it('debe denegar y desloguear si no está autenticado', () => {
      preparar(false, []);
      expect(TestBed.runInInjectionContext(() => authGuard())).toBeFalse();
      expect(authServiceSpy.logout).toHaveBeenCalled();
    });
  });

  describe('guestGuard', () => {
    it('debe redirigir al dashboard si ya está autenticado', () => {
      preparar(true, [ROLES[0]]);
      expect(TestBed.runInInjectionContext(() => guestGuard())).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('debe dejar entrar a anonimos', () => {
      preparar(false, []);
      expect(TestBed.runInInjectionContext(() => guestGuard())).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('roleGuard', () => {
    const route = (roles: string[]) => ({
      data: { roles }
    } as unknown as ActivatedRouteSnapshot);

    it('debe dejar entrar si el usuario tiene el rol permitido', () => {
      preparar(true, [ROLES[0]]);
      const resultado = TestBed.runInInjectionContext(() => roleGuard(route([ROLES[0]])));
      expect(resultado).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('debe denegar y redirigir al dashboard si no tiene el rol', () => {
      preparar(true, []);
      const resultado = TestBed.runInInjectionContext(() => roleGuard(route([ROLES[0]])));
      expect(resultado).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });
});

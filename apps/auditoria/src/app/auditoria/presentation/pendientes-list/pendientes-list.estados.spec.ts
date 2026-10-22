import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { PendientesListComponent } from './pendientes-list.component';
import { PendienteRepository } from '../../domain/ports/pendiente.repository';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { LineaRepository } from '../../domain/ports/linea.repository';
import { CuentaFacade } from '../../application/facades/cuenta.facade';
import { PendienteFacade } from '../../application/facades/pendiente.facade';
import { CuentaMedicaModel } from '../../domain/models/cuenta-medica.model';
import { MotivoPendienteModel, ResumenMotivoModel } from '../../domain/models/motivo-pendiente.model';

/**
 * Resolver pendientes no es cambiar datos (decisión del 2026-10-21): la pestaña de pendientes
 * resuelve en cualquier estado de la cuenta (EST-03.1), y lo que se resuelve avisa a la cuenta,
 * que puede cambiar de estado (EST-03.4). Los códigos son de prueba; ningún dato identifica a una
 * persona.
 */

const PENDIENTE: MotivoPendienteModel = {
  identificador: 41, codigo: 'MOT-PRUEBA', descripcion: 'Motivo de prueba', resuelto: false,
  soloAdjudicacion: false, nivel: 'CABECERA', referenciaLinea: null, numeroLinea: null,
  bloqueante: true, version: 3,
};

const RESUMEN: ResumenMotivoModel = {
  codigo: 'MOT-PRUEBA', descripcion: 'Motivo de prueba', sinResolver: 1, lineasAfectadas: 0,
  enCabecera: true, soloAdjudicacion: false, bloqueante: true,
};

const cuentaEn = (estado: string): CuentaMedicaModel => ({
  codigo: 'CM-94421', estado, admiteCambios: estado === 'MODIFICACION', version: 7,
  pendientesSinResolver: 1, novedades: [],
} as unknown as CuentaMedicaModel);

describe('PendientesListComponent — se resuelve en cualquier estado', () => {
  let fixture: ComponentFixture<PendientesListComponent>;
  let resolver: ReturnType<typeof vi.fn>;

  const montar = async (estado: string) => {
    resolver = vi.fn(() => of({}));
    await TestBed.configureTestingModule({
      imports: [PendientesListComponent],
      providers: [
        provideRouter([]), provideNoopAnimations(),
        { provide: PendienteRepository, useValue: {
            listarSinResolver: () => of({ elementos: [PENDIENTE], cursorSiguiente: null,
                                          totalRegistros: 1, tamanoPagina: 25 }),
            resumirMotivos: () => of([RESUMEN]),
            resolver,
        } },
        { provide: CuentaRepository, useValue: {
            consultar: () => of(cuentaEn(estado)),
            consultarAcciones: () => of({ codigo: 'CM-94421', accionesDisponibles: [] }),
        } },
        { provide: LineaRepository, useValue: {} },
      ],
    }).compileComponents();
    // La cuenta la carga la vista que contiene la pestaña; aquí no está, así que se carga a mano.
    TestBed.inject(CuentaFacade).buscar('CM-94421');

    fixture = TestBed.createComponent(PendientesListComponent);
    fixture.componentRef.setInput('codigo', 'CM-94421');
    await estabilizar();
  };

  const estabilizar = async () => {
    fixture.detectChanges();
    await new Promise(r => setTimeout(r));
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const botonResolver = () => [...(fixture.nativeElement as HTMLElement)
    .querySelectorAll<HTMLButtonElement>('td.mat-column-acciones button')]
    .find(b => b.textContent?.trim() === 'Resolver') ?? null;

  for (const estado of ['ADJUDICACION_MANUAL', 'FINALIZADA', 'EN_PROCESO']) {
    it(`[EST-03.1] [EST-03.4] en ${estado} la pestaña ofrece resolver, resuelve y avisa a la cuenta`, async () => {
      await montar(estado);
      expect(TestBed.inject(CuentaFacade).admiteCambios()).toBe(false);

      const boton = botonResolver();
      expect(boton).not.toBeNull();
      expect(boton!.disabled).toBe(false);
      boton!.click();
      await estabilizar();
      expect(fixture.componentInstance.pendienteSeleccionado()?.identificador).toBe(41);

      fixture.componentInstance.form.patchValue({ justificacion: 'Soporte revisado' });
      await fixture.componentInstance.resolver();
      await estabilizar();

      expect(resolver).toHaveBeenCalledWith('CM-94421', 41,
        { justificacion: 'Soporte revisado', alcance: 'CUENTA_Y_LINEAS' }, expect.anything());
      expect(TestBed.inject(PendienteFacade).ultimaResolucionDe('CM-94421')).not.toBeNull();
    });
  }
});

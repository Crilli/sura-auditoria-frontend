import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CuentaBusquedaComponent } from './cuenta-busqueda.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { BusquedaFacade } from '../../application/facades/busqueda.facade';
import { ResumenCuentaModel } from '../../domain/models/cuenta-medica.model';
import { VersionCuentaDialogComponent } from '../version-cuenta-dialog/version-cuenta-dialog.component';

/**
 * La pantalla del buscador. Los códigos, facturas y NIT son de prueba; ninguno identifica a
 * una persona.
 */

const RESULTADOS: ResumenCuentaModel[] = [
  {
    codigo: 'CM-57944424433', numeroFactura: 'JONATHAN201', fechaRadicacion: '2026-10-01',
    prestadorNit: '800000000', prestadorNombre: 'Prestador de prueba', valorFactura: 8_800_000,
    estado: 'ADJUDICACION_MANUAL',
    versiones: [
      { numero: 3, fechaEntrada: '2026-09-09', valor: 8_800_000, estado: 'Finalizado', estadoDesde: null },
      { numero: 2, fechaEntrada: '2026-09-05', valor: 6_000_000, estado: 'Finalizado', estadoDesde: null },
      { numero: 1, fechaEntrada: '2026-09-01', valor: 4_000_001, estado: 'Finalizado', estadoDesde: null },
    ],
  },
  {
    codigo: 'CM-2', numeroFactura: 'JONATHAN201', fechaRadicacion: '2026-10-02',
    prestadorNit: '800000000', prestadorNombre: 'Prestador de prueba', valorFactura: 100,
    estado: 'ESTADO NUEVO', versiones: [],
  },
];

describe('CuentaBusquedaComponent', () => {
  let fixture: ComponentFixture<CuentaBusquedaComponent>;
  let repo: { buscar: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    repo = {
      buscar: vi.fn().mockReturnValue(of({
        elementos: RESULTADOS, desplazamiento: 0, tamanoPagina: 25, pagina: 0,
        totalRegistros: 2, totalPaginas: 1, hayMas: false,
      })),
    };
    await TestBed.configureTestingModule({
      imports: [CuentaBusquedaComponent],
      providers: [
        provideRouter([]), provideNoopAnimations(),
        { provide: CuentaRepository, useValue: repo },
      ],
    }).compileComponents();

    // La fachada vive en la raíz: se limpia para que una prueba no herede la búsqueda de otra.
    TestBed.inject(BusquedaFacade).limpiar();
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(CuentaBusquedaComponent);
    await fixture.whenStable();
  });

  const dom = (): HTMLElement => fixture.nativeElement;
  const escribir = (id: string, valor: string) => {
    const input = dom().querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  };
  const buscar = async (factura: string) => {
    escribir('input-factura', factura);
    dom().querySelector<HTMLButtonElement>('#btn-buscar')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const filas = () => Array.from(dom().querySelectorAll<HTMLTableRowElement>('tr.resultado'));

  it('[BUS-01] la pantalla de inicio es el buscador de facturas', () => {
    expect(dom().textContent).toContain('Buscar facturas');
    expect(dom().querySelector('#input-factura')).not.toBeNull();
    expect(dom().querySelector('#input-radicado')).not.toBeNull();
  });

  it('[BUS-01] sin criterio lo dice aquí y no sale al servicio', async () => {
    dom().querySelector<HTMLButtonElement>('#btn-buscar')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(dom().querySelector('[role="alert"]')?.textContent).toContain('Escriba un número de factura');
    expect(repo.buscar).not.toHaveBeenCalled();
  });

  it('[BUS-12] con varios resultados enseña la lista y no salta al detalle', async () => {
    const navegar = vi.spyOn(router, 'navigate');
    await buscar('JONATHAN201');

    expect(filas()).toHaveLength(2);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('[BUS-14] [BUS-15] [BUS-16] [BUS-17] [BUS-18] cada fila trae radicado, llegada, factura, prestador y valor', async () => {
    await buscar('JONATHAN201');
    const celdas = Array.from(filas()[0].querySelectorAll('td')).map(td => td.textContent!.trim());

    expect(celdas[1]).toBe('CM-57944424433');
    expect(celdas[2]).toBe('01/10/2026');
    expect(celdas[3]).toBe('JONATHAN201');
    // La razón social, con el NIT al lado y no en su lugar.
    expect(celdas[4]).toContain('Prestador de prueba');
    expect(celdas[4]).toContain('NIT 800000000');
    expect(celdas[5]).toContain('8,800,000');
  });

  it('[BUS-19] el estado se enseña como lo publica el servicio: traducido, o el literal si no lo conoce', async () => {
    await buscar('JONATHAN201');

    expect(filas()[0].textContent).toContain('ADJUDICACION_MANUAL');
    expect(filas()[0].textContent).not.toContain('MANUAL ADJUDICATION');
    expect(filas()[1].textContent).toContain('ESTADO NUEVO');
  });

  it('[BUS-02] abrir un resultado lleva a la vista 360 de esa cuenta', async () => {
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    await buscar('JONATHAN201');

    filas()[0].click();

    expect(navegar).toHaveBeenCalledWith(['/auditoria', 'CM-57944424433']);
  });

  it('[BUS-13] despliega las versiones bajo su cuenta, la vigente arriba, sin abrir la cuenta', async () => {
    const navegar = vi.spyOn(router, 'navigate');
    await buscar('JONATHAN201');
    expect(filas()[0].textContent).toContain('3 versiones');

    filas()[0].querySelector<HTMLButtonElement>('button')!.click();
    fixture.detectChanges();

    const versiones = Array.from(dom().querySelectorAll<HTMLTableRowElement>('tr.version'));
    expect(versiones.map(v => v.querySelector('td')!.textContent!.trim()))
      .toEqual(['V3 vigente', 'V2', 'V1']);
    expect(navegar).not.toHaveBeenCalled();
  });

  it('[BUS-13] una cuenta sin transmitir no ofrece versiones', async () => {
    await buscar('JONATHAN201');

    expect(filas()[1].querySelector('button')).toBeNull();
    expect(filas()[1].textContent).not.toContain('versi');
  });

  it('[BUS-20] elegir una versión abre su foto en un diálogo', async () => {
    // El del componente, no el de la raíz: al importar MatDialogModule trae su propia instancia.
    const dialogo = fixture.debugElement.injector.get(MatDialog);
    const abrir = vi.spyOn(dialogo, 'open').mockReturnValue(undefined as never);
    await buscar('JONATHAN201');
    filas()[0].querySelector<HTMLButtonElement>('button')!.click();
    fixture.detectChanges();

    dom().querySelectorAll<HTMLTableRowElement>('tr.version')[1].click();

    expect(abrir).toHaveBeenCalledWith(VersionCuentaDialogComponent, expect.objectContaining({
      data: { codigoCuenta: 'CM-57944424433', numero: 2 },
    }));
  });
});

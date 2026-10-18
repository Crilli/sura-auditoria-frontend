import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { VersionCuentaDialogComponent } from './version-cuenta-dialog.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { FotoVersionModel } from '../../domain/models/cuenta-medica.model';

/** La foto de una versión. Código y factura de prueba; nada identifica a una persona. */

const FOTO: FotoVersionModel = {
  codigo: 'CM-57944424433', numero: 2, fechaEntrada: '2026-09-02', numeroFactura: 'JONATHAN201',
  prestador: 'Prestador de prueba', valorFactura: 6_000_000, totalCargado: 6_000_000,
  totalAutorizado: 5_000_000, totalCubierto: 5_000_000, totalGlosado: 1_000_000,
  totalNotasCredito: null, estadoActual: 'Finalizado',
  historial: [
    { estado: 'Pendiente', desde: '2026-09-02T15:00:00Z' },
    { estado: 'Finalizado', desde: '2026-09-05T15:00:00Z' },
  ],
};

describe('VersionCuentaDialogComponent', () => {
  const montar = async (respuesta: ReturnType<CuentaRepository['consultarVersion']>) => {
    const repo = { consultarVersion: vi.fn().mockReturnValue(respuesta) };
    await TestBed.configureTestingModule({
      imports: [VersionCuentaDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { codigoCuenta: 'CM-57944424433', numero: 2 } },
        { provide: CuentaRepository, useValue: repo },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(VersionCuentaDialogComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, repo, dom: fixture.nativeElement as HTMLElement };
  };

  it('[BUS-20] abre esa versión: su cabecera y sus importes', async () => {
    const { dom, repo } = await montar(of(FOTO));

    expect(repo.consultarVersion).toHaveBeenCalledWith('CM-57944424433', 2);
    expect(dom.textContent).toContain('versión 2');
    expect(dom.textContent).toContain('6,000,000');
    expect(dom.textContent).toContain('1,000,000');
    expect(dom.textContent).toContain('Finalizado');
  });

  it('[BUS-20] dice arriba que es una foto y no la cuenta actual', async () => {
    const { dom } = await montar(of(FOTO));

    const aviso = dom.querySelector('[role="note"]');
    expect(aviso?.textContent).toContain('tal como se transmitió');
    expect(aviso?.textContent).toContain('no son los de la cuenta actual');
  });

  it('[BUS-20] un importe que no viene se pinta como raya, no como cero', async () => {
    const { dom } = await montar(of(FOTO));

    const notas = Array.from(dom.querySelectorAll('tr'))
      .find(tr => tr.textContent!.includes('Notas crédito'))!;
    expect(notas.querySelector('td')!.textContent!.trim()).toBe('—');
  });

  it('[BUS-20] si la versión no existe, lo dice y deja reintentar', async () => {
    const { dom, fixture } = await montar(
      throwError(() => new Error('La cuenta CM-57944424433 no tiene versión 2')));

    expect(dom.querySelector('[role="alert"]')?.textContent).toContain('no tiene versión 2');
    expect(fixture.componentInstance.cargando()).toBe(false);
  });
});

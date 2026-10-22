import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { VersionCuentaDialogComponent } from './version-cuenta-dialog.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { FotoVersionModel } from '../../domain/models/cuenta-medica.model';

/**
 * La foto de una versión. Código y factura de prueba; nada identifica a una persona.
 *
 * Cada total con una cifra distinta (cargado 5.500.000, convenido 5.000.000, autorizado 4.500.000,
 * glosado 1.000.000) para que un cruce entre convenido y autorizado se note.
 */

const FOTO: FotoVersionModel = {
  codigo: 'CM-57944424433', numero: 2, fechaEntrada: '2026-09-02', numeroFactura: 'FE-PRUEBA-2',
  prestador: 'Prestador de prueba', valorFactura: 6_000_000, totalCargado: 5_500_000,
  totalConvenido: 5_000_000, totalAutorizado: 4_500_000, totalGlosado: 1_000_000,
  // Como los publica el servicio: traducidos del español del histórico al nombre del dominio.
  totalNotasCredito: null, estadoActual: 'FINALIZADA',
  historial: [
    { estado: 'ADJUDICACION_MANUAL', desde: '2026-09-02T15:00:00Z' },
    { estado: 'FINALIZADA', desde: '2026-09-05T15:00:00Z' },
  ],
};

describe('VersionCuentaDialogComponent', () => {
  const montar = async (respuesta: ReturnType<CuentaRepository['consultarVersion']>) => {
    const repo = { consultarVersion: vi.fn().mockReturnValue(respuesta) };
    const dialogo = { close: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [VersionCuentaDialogComponent],
      providers: [
        provideRouter([]),
        { provide: MAT_DIALOG_DATA, useValue: { codigoCuenta: 'CM-57944424433', numero: 2 } },
        { provide: MatDialogRef, useValue: dialogo },
        { provide: CuentaRepository, useValue: repo },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(VersionCuentaDialogComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, repo, dialogo, dom: fixture.nativeElement as HTMLElement };
  };

  it('[BUS-20] abre esa versión: su cabecera y sus importes', async () => {
    const { dom, repo } = await montar(of(FOTO));

    expect(repo.consultarVersion).toHaveBeenCalledWith('CM-57944424433', 2);
    expect(dom.textContent).toContain('versión 2');
    expect(dom.textContent).toContain('6,000,000');
    expect(dom.textContent).toContain('1,000,000');
    expect(dom.textContent).toContain('Finalizada');
  });

  it('[BUS-20] los totales con los rótulos de la cuenta viva: cargado, convenido, autorizado, glosado', async () => {
    const { dom } = await montar(of(FOTO));

    const filas = Object.fromEntries(Array.from(dom.querySelectorAll('.foto__importes tr'))
      .map(tr => [tr.querySelector('th')!.textContent!.trim(),
                  tr.querySelector('td')!.textContent!.replace(/\D/g, '') || tr.querySelector('td')!.textContent!.trim()]));
    expect(Object.keys(filas)).toEqual(['Valor factura', 'Total cargado', 'Total convenido',
                                        'Total autorizado', 'Total glosado', 'Notas crédito']);
    expect(filas['Total cargado']).toBe('5500000');
    expect(filas['Total convenido']).toBe('5000000');
    expect(filas['Total autorizado']).toBe('4500000');
    expect(filas['Total glosado']).toBe('1000000');
    expect(dom.textContent).not.toContain('Total cubierto');
  });

  it('[BUS-19] su historia habla como la cuenta: en palabras, no con el nombre del dominio', async () => {
    const { dom } = await montar(of(FOTO));

    const pasos = Array.from(dom.querySelectorAll('.foto__historial li'))
      .map(li => li.textContent!.replace(/\s+/g, ' ').trim());
    expect(pasos[0]).toContain('Adjudicación manual');
    expect(pasos[1]).toContain('Finalizada');
    expect(dom.textContent).not.toContain('ADJUDICACION_MANUAL');
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
    // Sin foto no hay versión que abrir: llevaría al mismo error, ya fuera de la lista.
    expect(dom.querySelector('#btn-abrir-version')).toBeNull();
  });

  it('[BUS-20] «Abrir esta versión» cierra la vista rápida y lleva a la foto entera de la versión', async () => {
    const { dom, dialogo } = await montar(of(FOTO));
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    dom.querySelector<HTMLButtonElement>('#btn-abrir-version')!.click();

    expect(dialogo.close).toHaveBeenCalledTimes(1);
    expect(navegar).toHaveBeenCalledWith(['/auditoria', 'CM-57944424433', 'versiones', 2]);
  });

  it('[BUS-20] la foto del diálogo es la misma pieza que la de la vista de la cuenta', async () => {
    const { dom } = await montar(of(FOTO));

    expect(dom.querySelector('sura-foto-version')).not.toBeNull();
    expect(dom.querySelector('sura-foto-version')?.textContent).toContain('Estado de la versión');
  });
});

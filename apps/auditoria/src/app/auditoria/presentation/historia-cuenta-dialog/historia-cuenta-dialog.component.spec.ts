import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { of } from 'rxjs';
import { HistoriaCuentaDialogComponent } from './historia-cuenta-dialog.component';
import { CuentaRepository } from '../../domain/ports/cuenta.repository';
import { HitoModel } from '../../domain/models/cuenta-medica.model';

/** La historia de la cuenta. Código de prueba; el autor es un identificador opaco. */

const HITOS: HitoModel[] = [
  { tipo: 'DESFINALIZACION', etiqueta: 'RESPUESTA_GLOSA_BLOQUEO', detalle: 'Respuesta a glosa con bloqueo',
    autor: 'auditor', loHizoElSistema: false, ocurridoEn: '2026-09-21T15:50:08Z' },
  { tipo: 'CAMBIO_DE_ESTADO', etiqueta: 'ADJUDICACION_MANUAL', detalle: null,
    autor: 'Internal System User', loHizoElSistema: true, ocurridoEn: '2026-09-21T16:45:48Z' },
];

describe('HistoriaCuentaDialogComponent', () => {
  const montar = async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriaCuentaDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { codigoCuenta: 'CM-57944424433' } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: CuentaRepository, useValue: { consultarHistoria: () => of(HITOS) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HistoriaCuentaDialogComponent);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  };
  const texto = (el: Element) => el.textContent!.replace(/\s+/g, ' ').trim();

  it('[BUS-19] los cambios de estado hablan como la cuenta, con la palabra de OHI en la ayuda', async () => {
    const fixture = await montar();
    const pasos = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.historia li'));

    expect(texto(pasos[1])).toContain('Adjudicación manual');
    expect(fixture.nativeElement.textContent).not.toContain('ADJUDICACION_MANUAL');
    const ayuda = fixture.debugElement.queryAll(By.css('.historia li strong'))[1].injector.get(MatTooltip);
    expect(ayuda.message).toBe('En OHI: Pendiente');
  });

  it('[BUS-19] una desfinalización sigue diciendo su motivo, que no es un estado', async () => {
    const fixture = await montar();
    const primero = (fixture.nativeElement as HTMLElement).querySelector('.historia li')!;

    expect(texto(primero)).toContain('Desfinalizada: RESPUESTA_GLOSA_BLOQUEO — Respuesta a glosa con bloqueo');
  });
});

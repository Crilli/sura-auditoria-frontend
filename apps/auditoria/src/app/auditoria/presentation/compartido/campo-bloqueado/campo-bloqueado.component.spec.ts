import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatTooltip } from '@angular/material/tooltip';
import { CampoBloqueadoComponent } from './campo-bloqueado.component';
import { MOTIVOS_BLOQUEO } from '../motivos-bloqueo';

describe('CampoBloqueadoComponent', () => {
  let fixture: ComponentFixture<CampoBloqueadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampoBloqueadoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CampoBloqueadoComponent);
    fixture.componentRef.setInput('motivo', MOTIVOS_BLOQUEO.calculado);
    await fixture.whenStable();
  });

  const candado = () => fixture.nativeElement.querySelector('mat-icon');

  it('pinta un candado', () => {
    expect(candado()).not.toBeNull();
    expect(candado().textContent.trim()).toBe('lock');
    expect(candado().classList).toContain('sura-candado');
  });

  it('lleva el motivo en el tooltip', () => {
    const tooltip = fixture.debugElement.query(By.directive(MatTooltip))
      .injector.get(MatTooltip);
    expect(tooltip.message).toBe(MOTIVOS_BLOQUEO.calculado);
  });

  it('cambia el motivo cuando cambia la entrada', async () => {
    fixture.componentRef.setInput('motivo', MOTIVOS_BLOQUEO.afiliado);
    await fixture.whenStable();

    const tooltip = fixture.debugElement.query(By.directive(MatTooltip))
      .injector.get(MatTooltip);
    expect(tooltip.message).toBe(MOTIVOS_BLOQUEO.afiliado);
  });

  // El motivo tiene que poder leerse también con teclado: Material abre el
  // tooltip al recibir el foco, y sin `tabindex` el icono no lo recibe nunca.
  it('es enfocable y se anuncia como no editable', () => {
    expect(candado().getAttribute('tabindex')).toBe('0');
    expect(candado().getAttribute('aria-label')).toBe('No editable');
  });
});

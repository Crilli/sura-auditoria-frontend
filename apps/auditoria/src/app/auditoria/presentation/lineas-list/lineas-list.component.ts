import {
  Component, OnInit, Input, inject, computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule }           from '@angular/material/table';
import { MatButtonModule }          from '@angular/material/button';
import { MatIconModule }            from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule }           from '@angular/material/chips';
import { MatTooltipModule }         from '@angular/material/tooltip';
import { LineaFacade }              from '../../application/facades/linea.facade';
import { ResumenLineaModel }        from '../../domain/models/linea-cuenta.model';

/**
 * Lista de líneas con paginación KEYSET (cursor-based).
 * ✅ SIEMPRE pide tamano=25 al servidor.
 * ✅ El botón "Siguiente" envía el cursor devuelto por el servidor.
 * PROHIBIDO: cargar todas las líneas de una vez.
 */
@Component({
  selector: 'sura-lineas-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, MatTableModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, MatTooltipModule
  ],
  templateUrl: './lineas-list.component.html',
  styleUrls:   ['./lineas-list.component.scss']
})
export class LineasListComponent implements OnInit {

  /** El parámetro de la ruta padre se llama `codigo`; el alias hace el enlace. */
  @Input({ required: true, alias: 'codigo' }) codigoCuenta!: string;

  readonly facade = inject(LineaFacade);

  readonly displayedColumns = [
    'numeroLinea', 'codigoProcedimiento', 'codigoAfiliado',
    'valorAutorizado', 'valorCubierto', 'pendientes', 'estado', 'acciones'
  ];

  // Signals del facade (rxResource — async declarativo)
  readonly lineas      = this.facade.lineas;
  readonly loading     = this.facade.loading;
  readonly listError   = this.facade.listError;
  readonly isEmpty     = this.facade.isEmpty;
  readonly hayMas      = this.facade.hayMas;
  readonly totalLineas = this.facade.totalLineas;

  // ── Paginación ───────────────────────────────────────────────────────────
  readonly paginaActual   = this.facade.paginaActual;
  readonly totalPaginas   = this.facade.totalPaginas;
  readonly recorriendo    = this.facade.recorriendo;
  readonly hayAnterior    = this.facade.hayPaginaAnterior;
  readonly haySiguiente   = this.facade.hayPaginaSiguiente;
  readonly ocupado        = computed(() => this.loading() || this.recorriendo());

  /**
   * Números a pintar en el paginador: siempre la primera y la última, más una
   * ventana alrededor de la actual. Los cortes se marcan con puntos suspensivos.
   */
  readonly paginasVisibles = computed<(number | '…')[]>(() => {
    const total  = this.totalPaginas();
    const actual = this.paginaActual();
    if (total === null || total <= 1) return [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const ventana = new Set<number>([1, total, actual]);
    for (const alrededor of [actual - 1, actual + 1]) {
      if (alrededor > 1 && alrededor < total) ventana.add(alrededor);
    }

    const ordenadas = [...ventana].sort((a, b) => a - b);
    const resultado: (number | '…')[] = [];
    let anterior = 0;
    for (const numero of ordenadas) {
      if (anterior && numero - anterior > 1) resultado.push('…');
      resultado.push(numero);
      anterior = numero;
    }
    return resultado;
  });

  /** Rango de registros que se está mostrando, para el texto de apoyo. */
  readonly rangoVisible = computed(() => {
    const total = this.totalLineas();
    if (total === null) return null;
    const desde = (this.paginaActual() - 1) * this.facade.TAMANO_PAGINA + 1;
    const hasta = Math.min(desde + this.lineas().length - 1, total);
    return { desde, hasta, total };
  });

  esNumero(valor: number | '…'): valor is number {
    return valor !== '…';
  }

  ngOnInit(): void {
    // ✅ Primera página (sin cursor) — tamano=25
    this.facade.cargarLineas(this.codigoCuenta);
  }

  irAPagina(numero: number | '…'): void {
    if (this.esNumero(numero)) void this.facade.irAPagina(numero);
  }

  primera():  void { void this.facade.primeraPagina(); }
  anterior(): void { void this.facade.paginaAnterior(); }
  siguiente(): void { void this.facade.paginaSiguiente(); }
  ultima():   void { void this.facade.ultimaPagina(); }

  async verDetalle(linea: ResumenLineaModel): Promise<void> {
    await this.facade.consultarDetalle(this.codigoCuenta, linea.referencia);
  }

  /**
   * Motivos pendientes de la línea, uno por renglón, para el tooltip del
   * contador. Sin esto el auditor ve un número y tiene que abrir la línea
   * para saber qué la bloquea.
   */
  motivosDe(linea: ResumenLineaModel): string {
    return (linea.pendientes ?? [])
      .map(p => p.descripcion ? `${p.codigo} — ${p.descripcion}` : p.codigo)
      .join('\n');
  }
}

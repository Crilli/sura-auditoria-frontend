import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'sura-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-container">
      <h1>404</h1>
      <h2>Página no encontrada</h2>
      <a routerLink="/">Volver al inicio</a>
    </div>
  `,
  styles: [`
    .not-found-container { padding: 4rem; text-align: center; }
    h1 { font-size: 4rem; color: #f44336; margin: 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {}

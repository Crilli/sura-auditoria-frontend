import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sura-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <h2>Iniciar Sesión</h2>
      <p>Simulación de Login OIDC</p>
    </div>
  `,
  styles: [`
    .login-container { padding: 2rem; text-align: center; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {}

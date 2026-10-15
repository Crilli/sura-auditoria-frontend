export const environment = {
  production: false,
  // Vacío = mismo origen. En desarrollo el dev server enruta /api al
  // microservicio (ver apps/shell/proxy.conf.json), así no hace falta CORS.
  // En despliegue se pone aquí la URL del API Gateway.
  apiGatewayUrl: '',
  /**
   * Quién firma las operaciones que cambian la cuenta: viaja en la cabecera
   * `X-Auditor` y es lo que queda en la traza de auditoría.
   *
   * **Vacío a propósito, y mientras lo esté no se puede resolver ningún
   * pendiente.** Antes había aquí un `auditor@sura.com.co` escrito a fuego, lo
   * que significa que toda resolución contra producción —irreversible y sobre
   * todas las filas del motivo— quedaba atribuida a una dirección que no es de
   * nadie. Con la autenticación todavía sin montar (`libs/data-access/auth` es
   * un andamio vacío) no hay sesión de la que sacar la identidad, así que se
   * declara aquí y se exige explícitamente.
   *
   * Ponga su usuario de red o su correo corporativo. En despliegue esto debe
   * salir del token de la sesión, no de este fichero: un valor fijo aquí firma
   * igual a quien se siente delante, así que mientras siga escrito es una
   * identidad de desarrollo, no una autenticación.
   */
  auditor: 'jonathan.contreras@sofka.com.co',
  oidc: {
    authority:    'https://sso-dev.sura.com.co/auth/realms/sura',
    clientId:     'sura-auditoria-frontend',
    redirectUri:  'http://localhost:4200/callback',
    scope:        'openid profile email',
    responseType: 'code'
  },
  mfeRemotes: {
    auditoria: 'http://localhost:4201/remoteEntry.js'
  }
};

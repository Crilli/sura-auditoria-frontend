export const environment = {
  production: false,
  // Vacío = mismo origen. En desarrollo el dev server enruta /api al
  // microservicio (ver apps/shell/proxy.conf.json), así no hace falta CORS.
  // En despliegue se pone aquí la URL del API Gateway.
  apiGatewayUrl: '',
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

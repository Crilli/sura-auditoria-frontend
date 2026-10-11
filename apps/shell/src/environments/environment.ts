export const environment = {
  production: false,
  apiGatewayUrl: 'http://localhost:8080',
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

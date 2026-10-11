#!/bin/zsh
# Arranca ms-auditoria-cuenta-medica en perfil prod, sin base de datos.
# Las exclusiones apagan R2DBC, JDBC y Flyway: el micro solo habla con OHI.
set -e
BASE=/Users/criscaor/Documents/Proyectos/ms-auditoria-cuenta-medica
cd "$BASE"

set -a
. "$BASE/.env"            # trae OHI_CLIENT_SECRET_PROD
set +a

export JAVA_HOME=/Users/criscaor/.jdk/current-jdk-21/Contents/Home

# En la red del campus el firewall re-firma TLS y la JVM falla con PKIX, lo que el micro
# reporta como 503 en todos los endpoints aunque /actuator/health siga en 200.
CERTS=$HOME/.local/share/certs/sura-cacerts
if [[ -f $CERTS ]]; then
  export JAVA_TOOL_OPTIONS="-Djavax.net.ssl.trustStore=$CERTS -Djavax.net.ssl.trustStorePassword=changeit"
  echo "Uso el truststore propio: $CERTS"
fi
GRADLE=/Users/criscaor/.gradle/wrapper/dists/gradle-8.9-bin/90cnw93cvbtalezasaz0blq0a/gradle-8.9/bin/gradle

EXCLUIR=org.springframework.boot.autoconfigure.r2dbc.R2dbcAutoConfiguration
EXCLUIR=$EXCLUIR,org.springframework.boot.autoconfigure.data.r2dbc.R2dbcDataAutoConfiguration
EXCLUIR=$EXCLUIR,org.springframework.boot.autoconfigure.data.r2dbc.R2dbcRepositoriesAutoConfiguration
EXCLUIR=$EXCLUIR,org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
EXCLUIR=$EXCLUIR,org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration

exec "$GRADLE" :aplicacion-servicio-app:bootRun --console=plain \
  --args="--spring.profiles.active=prod \
--spring.flyway.enabled=false \
--spring.main.lazy-initialization=true \
--integraciones.cors.origenes=http://localhost:4200,http://localhost:4201 \
--spring.autoconfigure.exclude=$EXCLUIR"

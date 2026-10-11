#!/bin/zsh
set -e
cd /Users/criscaor/Documents/Proyectos/sura-auditoria-frontend
export PATH=/Users/criscaor/.local/node/bin:$PATH
exec npx nx serve shell --port 4200

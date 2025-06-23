#!/bin/sh

echo 'Testando conexão com PostgreSQL...'

if nc -z $DB_HOST $DB_PORT; then
    echo 'PostgreSQL está acessível'
else
    echo 'PostgreSQL não está acessível'
fi

echo 'Iniciando aplicação...'
exec "$@"

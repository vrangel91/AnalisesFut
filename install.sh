#!/bin/bash

echo "========================================"
echo "   INSTALANDO ZEROLOSS SURBETS"
echo "========================================"
echo

echo "Instalando dependencias do servidor..."
npm install

echo
echo "Instalando dependencias do cliente..."
cd client
npm install
cd ..

echo
echo "========================================"
echo "   INSTALACAO CONCLUIDA!"
echo "========================================"
echo
echo "Para iniciar o projeto:"
echo "  npm run dev"
echo
echo "Para apenas o servidor:"
echo "  npm run server"
echo
echo "Para apenas o cliente:"
echo "  npm run client"
echo

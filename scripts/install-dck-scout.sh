#!/bin/bash

# Verifica se o Docker Scout está instalado
if ! docker scout version &> /dev/null
then
    echo "[INFO] Docker Scout não encontrado. Iniciando instalação..."
    
    # Atualiza pacotes e garante que o curl esteja disponível
    sudo apt-get update && sudo apt-get install -x curl -y
    
    # Executa o script oficial de instalação do Docker Scout
    curl -sSfL https://raw.githubusercontent.com/docker/scout-cli/main/install.sh | sh -s -- -b /usr/local/bin
    
    if [ $? -eq 0 ]; then
        echo "[SUCCESS] Docker Scout instalado com sucesso!"
    else
        echo "[ERROR] Falha na instalação do Docker Scout."
        exit 1
    fi
else
    echo "[INFO] Docker Scout já está presente no sistema."
fi
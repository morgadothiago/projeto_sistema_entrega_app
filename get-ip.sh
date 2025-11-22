#!/bin/bash
# Script para descobrir o IP da máquina local

echo "🔍 Buscando IP da máquina..."
echo ""

if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Mac ou Linux
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
    
    if [ -z "$IP" ]; then
        # Tenta alternativa
        IP=$(hostname -I | awk '{print $1}')
    fi
    
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    IP=$(ipconfig | grep -i "IPv4" | awk '{print $NF}' | head -n 1)
fi

if [ -z "$IP" ]; then
    echo "❌ Não foi possível detectar o IP automaticamente."
    echo ""
    echo "Execute manualmente:"
    echo "  - Mac/Linux: ifconfig | grep 'inet '"
    echo "  - Windows: ipconfig"
else
    echo "✅ IP encontrado: $IP"
    echo ""
    echo "📝 Configure seu .env com:"
    echo "EXPO_PUBLIC_API_URL=http://$IP:3000"
    echo ""
    
    # Pergunta se quer criar/atualizar o .env
    read -p "Deseja criar/atualizar o arquivo .env agora? (s/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo "EXPO_PUBLIC_API_URL=http://$IP:3000" > .env
        echo "✅ Arquivo .env criado/atualizado!"
        echo ""
        echo "⚠️  IMPORTANTE: Reinicie o Expo com 'npm start'"
    fi
fi

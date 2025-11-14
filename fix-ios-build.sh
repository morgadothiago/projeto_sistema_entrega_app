#!/bin/bash

echo "🧹 Limpando cache do iOS..."

# 1. Limpar cache do Watchman (se instalado)
if command -v watchman &> /dev/null; then
    echo "  → Limpando Watchman..."
    watchman watch-del-all
fi

# 2. Limpar cache do Metro
echo "  → Limpando cache do Metro..."
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*

# 3. Remover node_modules e reinstalar
echo "  → Removendo node_modules..."
rm -rf node_modules

# 4. Limpar cache do Yarn/npm
echo "  → Limpando cache do Yarn..."
yarn cache clean

# 5. Limpar build do iOS
echo "  → Limpando build do iOS..."
cd ios
rm -rf Pods
rm -rf build
rm -f Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf .xcode.env.local

# 6. Limpar cache do CocoaPods
echo "  → Limpando cache do CocoaPods..."
pod cache clean --all

cd ..

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "Agora execute:"
echo "  1. yarn install"
echo "  2. cd ios && pod install --repo-update"
echo "  3. cd .. && npx expo run:ios"

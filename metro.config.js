const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Desabilita web e otimiza para mobile
config.resolver.platforms = ['ios', 'android'];

// Bloqueia arquivos web
config.resolver.blockList = [
  /\.web\.[jt]sx?$/,
];

module.exports = config;

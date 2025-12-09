# Modelo de Configuração do EAS (`eas.json`)

Este arquivo contém um modelo completo e documentado do `eas.json`. Você pode copiar este conteúdo para o seu arquivo `eas.json` na raiz do projeto, ajustando conforme necessário.

## O que é cada Perfil?

-   **development**: Cria uma versão de desenvolvimento que permite testar o app no seu dispositivo físico sem conectar cabo, mas com todas as bibliotecas nativas instaladas. É como um "Expo Go" customizado para o seu projeto.
-   **preview**: Cria uma versão do app pronta para instalar (APK no Android), ideal para mandar para clientes ou testar internamente sem subir na loja.
-   **production**: Cria a versão final otimizada (`.aab` no Android, `.ipa` no iOS) para enviar para as lojas (Google Play e App Store).

## Modelo `eas.json`

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "channel": "production"
      /* "autoIncrement": true -> Aumenta a versão (buildNumber/versionCode) automaticamente a cada build */
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services-json-key.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "seu-email-apple@exemplo.com",
        "ascAppId": "1234567890",
        "appleTeamId": "TEAMID123"
      }
    }
  }
}
```

## Dicas Importantes

1.  **Variáveis de Ambiente**: Se você usa `.env`, adicione `"env": { "EXPO_PUBLIC_API_URL": "..." }` dentro de cada perfil se precisar "chumbar" valores, ou configure os *Secrets* no painel do Expo para segurança.
2.  **Auto Increment**: A opção `"autoIncrement": true` no perfil de produção é muito útil para não esquecer de mudar o número da versão antes de subir para a loja.
3.  **Android APK**: Note que no perfil `preview` definimos `"buildType": "apk"`. Isso gera um arquivo instalável direto no celular, diferente do `production` que gera um `.aab` (que só a loja aceita).

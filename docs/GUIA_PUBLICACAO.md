# Guia de Publicação do Aplicativo (Expo / React Native)

Este documento serve como um guia passo a passo para preparar, compilar e publicar seu aplicativo móvel na Google Play Store (Android) e Apple App Store (iOS).

## 1. Pré-requisitos (Contas de Desenvolvedor)

Antes de começar, você precisará das contas de desenvolvedor em ambas as plataformas.

### Google Play Store (Android)
*   **Custo**: Taxa única de **$25 USD**.
*   **Link**: [Google Play Console](https://play.google.com/console)
*   **Necessário para**: Criar a ficha do aplicativo e subir o aplicativo para revisão.

### Apple App Store (iOS)
*   **Custo**: Taxa anual de **$99 USD**.
*   **Link**: [Apple Developer Program](https://developer.apple.com/)
*   **Necessário para**: Gerar certificados, perfis de provisionamento e publicar na loja.

---

## 2. Preparação do Projeto (`app.json`)

Antes de gerar a versão final, verifique se o arquivo `app.json` está configurado corretamente.

1.  **Identificadores Únicos**:
    *   **Android (`package`)**: Ex: `com.seuapp.entregas`
    *   **iOS (`bundleIdentifier`)**: Ex: `com.seuapp.entregas`
    *   *Nota: Eles devem ser iguais e únicos (nenhum outro app no mundo pode ter o mesmo).*

2.  **Versionamento**:
    *   **`version`**: Versão visível ao usuário (ex: "1.0.0").
    *   **Android (`versionCode`)**: Número inteiro sequencial (ex: 1, 2, 3...). Aumente sempre que subir uma nova versão.
    *   **iOS (`buildNumber`)**: Similar ao versionCode, deve ser incrementado a cada build (ex: "1", "2").

3.  **Assets**:
    *   Verifique se `icon.png` (ícone do app) e `splash.png` (tela de abertura) estão na pasta `assets` e com boa resolução.

---

## 3. Configurando o EAS (Expo Application Services)

O **EAS Build** é a ferramenta oficial do Expo para gerar os arquivos finais (`.aab` para Android e `.ipa` para iOS).

1.  **Instale a CLI do EAS**:
    ```bash
    npm install -g eas-cli
    ```

2.  **Faça Login na sua conta Expo**:
    ```bash
    eas login
    ```

3.  **Configure o projeto** (caso ainda não tenha feito):
    ```bash
    eas build:configure
    ```
    *   Isso criará um arquivo `eas.json` na raiz do projeto.

---

## 4. Publicando no Android (Google Play Store)

### Passo 1: Gerar o Build (AAB)
O formato exigido pela Google Play é o **App Bundle (.aab)**.

No terminal, rode:
```bash
eas build --platform android
```
*   O EAS pedirá para gerar uma **Keystore**. Responda "Yes" para ele gerenciar isso automaticamente para você.
*   Aguarde o processo (pode levar de 15 a 30 minutos).
*   Ao final, você receberá um link para baixar o arquivo `.aab`.

### Passo 2: Subir para a Loja
1.  Acesse o [Google Play Console](https://play.google.com/console).
2.  Clique em **Criar App** e preencha os dados (Nome, Idioma, Grátis/Pago).
3.  Vá em **Produção** (ou Teste Interno se preferir testar antes).
4.  Crie uma **Nova Versão**.
5.  Faça o upload do arquivo `.aab` que você baixou.
6.  Preencha as informações da loja (descrição, screenshots, classificação etária, política de privacidade).
7.  Envie para revisão.

---

## 5. Publicando no iOS (Apple App Store)

*Nota: Para publicar no iOS, você precisa de um Mac ou usar o EAS Build na nuvem (que funciona em qualquer sistema).*

### Passo 1: Gerar o Build (IPA)
No terminal, rode:
```bash
eas build --platform ios
```
*   O EAS pedirá para fazer login na sua conta Apple Developer.
*   Ele vai gerar os **Certificados** e **Provisioning Profiles** automaticamente. Responda "Yes" quando solicitado.
*   Aguarde o processo. Ao final, o link de download não é tão útil, pois o upload é feito de outra forma.

### Passo 2: Enviar para o App Store Connect (EAS Submit)
A maneira mais fácil de enviar o arquivo gerado para a Apple é usar o `eas submit`.

```bash
eas submit --platform ios
```
*   Selecione o build que acabou de ser gerado na lista.
*   Isso enviará o binário diretamente para o [App Store Connect](https://appstoreconnect.apple.com/).

### Passo 3: Configurar na Loja
1.  Acesse o [App Store Connect](https://appstoreconnect.apple.com/).
2.  Vá em **Meus Apps** -> **botão (+)** -> **Novo App**.
3.  Preencha os dados básicos.
4.  Na aba **App Store**, preencha descrições, palavras-chave e envie screenshots (obrigatório telas de iPhone 6.5" e 5.5").
5.  Role até a seção **Compilação** e selecione a versão que você enviou via EAS.
6.  Clique em **Adicionar para Análise**.

---

## 6. Dicas Importantes

*   **Atualizações OTA (Over-The-Air)**: Para pequenas correções de JS/CSS/Imagens, você pode usar o `eas update` para atualizar o app dos usuários sem passar pela revisão da loja.
    ```bash
    eas update --branch production --message "Correção de bug na home"
    ```
*   **Variáveis de Ambiente**: Se estiver usando `.env`, lembre-se de configurar os "Secrets" no painel do Expo (site) para que o EAS Build consiga ler suas chaves de API durante a compilação.
*   **Erros comuns**: Se o build falhar, leia o log de erro no link fornecido pelo terminal. Geralmente são erros de compatibilidade de bibliotecas ou configuração.

Boa sorte com o lançamento! 🚀

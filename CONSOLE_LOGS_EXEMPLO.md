# 📊 Exemplos de Console Logs

Este documento mostra os logs que aparecem no console ao preencher as telas de **Documents** e **Payments**.

---

## 📄 Tela de DOCUMENTS

### Exemplo 1: CNH enviada com sucesso

```
============================================================
📄 DADOS DA TELA DE DOCUMENTOS
============================================================

📋 Dados Capturados:
{
  "documentType": "CNH",
  "documentNumber": "12345678901",
  "fullName": "João da Silva",
  "cpf": "123.456.789-01",
  "orgaoEmissao": "SSP-SP",
  "cnhType": "AB",
  "hasImage": true,
  "imageUri": "file:///data/user/0/com.app/cache/ImagePicker/..."
}

============================================================

📤 Enviando documento para API...
🔗 Endpoint: /deliveryman/documents
📦 Tipo de conteúdo: multipart/form-data

✅ Documento enviado com sucesso!
```

### Exemplo 2: RG enviado

```
============================================================
📄 DADOS DA TELA DE DOCUMENTOS
============================================================

📋 Dados Capturados:
{
  "documentType": "RG",
  "documentNumber": "12.345.678-9",
  "fullName": "Maria Santos",
  "cpf": "987.654.321-00",
  "orgaoEmissao": "SSP-RJ",
  "cnhType": null,
  "hasImage": true,
  "imageUri": "file:///data/user/0/com.app/cache/ImagePicker/..."
}

============================================================

📤 Enviando documento para API...
🔗 Endpoint: /deliveryman/documents
📦 Tipo de conteúdo: multipart/form-data

✅ Documento enviado com sucesso!
```

---

## 💰 Tela de PAYMENTS

### Exemplo 1: Pagamento via PIX (Telefone)

```
============================================================
💰 DADOS DA TELA DE PAGAMENTOS
============================================================

📝 Dados Originais do Formulário:
{
  "paymentType": "Pix",
  "pixKey": "(11) 98765-4321",
  "pixKeyType": "Telefone",
  "bankName": "",
  "agency": "",
  "accountNumber": ""
}

------------------------------------------------------------

🔑 TIPO DE PAGAMENTO: PIX

📊 Processamento da Chave Pix:
  🎭 Chave com máscara (digitada): (11) 98765-4321
  💾 Chave sem máscara (limpa): 11987654321
  🏷️  Tipo detectado: Telefone

📤 Dados que serão enviados para API:
{
  "paymentType": "Pix",
  "pixKey": "11987654321",
  "pixKeyType": "Telefone"
}

============================================================

⏳ Validação concluída. Enviando para API...

✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
✅ DADOS SALVOS COM SUCESSO!
✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅

📋 RESUMO DA OPERAÇÃO:
  ✓ Tipo de Pagamento: Pix
  ✓ Chave Pix (limpa): 11987654321
  ✓ Tipo de Chave: Telefone

============================================================
```

### Exemplo 2: Pagamento via PIX (CPF)

```
============================================================
💰 DADOS DA TELA DE PAGAMENTOS
============================================================

📝 Dados Originais do Formulário:
{
  "paymentType": "Pix",
  "pixKey": "123.456.789-01",
  "pixKeyType": "CPF",
  "bankName": "",
  "agency": "",
  "accountNumber": ""
}

------------------------------------------------------------

🔑 TIPO DE PAGAMENTO: PIX

📊 Processamento da Chave Pix:
  🎭 Chave com máscara (digitada): 123.456.789-01
  💾 Chave sem máscara (limpa): 12345678901
  🏷️  Tipo detectado: CPF

📤 Dados que serão enviados para API:
{
  "paymentType": "Pix",
  "pixKey": "12345678901",
  "pixKeyType": "CPF"
}

============================================================

⏳ Validação concluída. Enviando para API...

✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
✅ DADOS SALVOS COM SUCESSO!
✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅

📋 RESUMO DA OPERAÇÃO:
  ✓ Tipo de Pagamento: Pix
  ✓ Chave Pix (limpa): 12345678901
  ✓ Tipo de Chave: CPF

============================================================
```

### Exemplo 3: Pagamento via PIX (Email)

```
============================================================
💰 DADOS DA TELA DE PAGAMENTOS
============================================================

📝 Dados Originais do Formulário:
{
  "paymentType": "Pix",
  "pixKey": "usuario@email.com",
  "pixKeyType": "Email",
  "bankName": "",
  "agency": "",
  "accountNumber": ""
}

------------------------------------------------------------

🔑 TIPO DE PAGAMENTO: PIX

📊 Processamento da Chave Pix:
  🎭 Chave com máscara (digitada): usuario@email.com
  💾 Chave sem máscara (limpa): usuario@email.com
  🏷️  Tipo detectado: Email

📤 Dados que serão enviados para API:
{
  "paymentType": "Pix",
  "pixKey": "usuario@email.com",
  "pixKeyType": "Email"
}

============================================================

⏳ Validação concluída. Enviando para API...

✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
✅ DADOS SALVOS COM SUCESSO!
✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅

📋 RESUMO DA OPERAÇÃO:
  ✓ Tipo de Pagamento: Pix
  ✓ Chave Pix (limpa): usuario@email.com
  ✓ Tipo de Chave: Email

============================================================
```

### Exemplo 4: Pagamento via Transferência Bancária

```
============================================================
💰 DADOS DA TELA DE PAGAMENTOS
============================================================

📝 Dados Originais do Formulário:
{
  "paymentType": "Transferencia",
  "pixKey": "",
  "pixKeyType": undefined,
  "bankName": "Banco do Brasil",
  "agency": "1234",
  "accountNumber": "12345-6"
}

------------------------------------------------------------

🏦 TIPO DE PAGAMENTO: TRANSFERÊNCIA BANCÁRIA

📊 Dados Bancários:
  🏛️  Banco: Banco do Brasil
  🔢 Agência: 1234
  💳 Conta: 12345-6

📤 Dados que serão enviados para API:
{
  "paymentType": "Transferencia",
  "bankName": "Banco do Brasil",
  "agency": "1234",
  "accountNumber": "12345-6"
}

============================================================

⏳ Validação concluída. Enviando para API...

✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
✅ DADOS SALVOS COM SUCESSO!
✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅

📋 RESUMO DA OPERAÇÃO:
  ✓ Tipo de Pagamento: Transferencia
  ✓ Banco: Banco do Brasil
  ✓ Agência: 1234
  ✓ Conta: 12345-6

============================================================
```

---

## 🔍 Logs Durante a Digitação (Detecção de Tipo)

Enquanto você digita a chave Pix, o sistema detecta automaticamente o tipo:

```
🔑 Telefone detectado (com DDD) - 11987654321
```

```
🔑 CPF detectado (11 dígitos) - 12345678901
```

```
🔑 E-mail detectado - usuario@email.com
```

```
🔑 CNPJ detectado (14 dígitos) - 12345678000190
```

```
🔑 Chave Aleatória (UUID ou outro formato) - 550e8400-e29b-41d4-a716-446655440000
```

---

## ❌ Logs de Erro

### Erro ao enviar documento:

```
❌ Erro ao enviar documento: Network Error
```

### Erro ao salvar pagamento:

```
❌ Erro ao salvar: Dados de Pix incompletos
```

---

## 📌 Notas Importantes

1. **Máscaras Visuais vs Banco**: Observe que os valores **com máscara** são mostrados ao usuário, mas os valores **sem máscara** são enviados para a API.

2. **Detecção Automática**: O tipo de chave Pix é detectado automaticamente enquanto você digita, e aparece no console.

3. **Dados Completos**: Todos os campos do formulário são mostrados no console, mesmo os vazios.

4. **Resumo Final**: Após o sucesso, um resumo limpo é exibido com apenas os dados relevantes.

---

## 🎯 Como Usar os Logs

1. **Abra o console** do React Native (Metro Bundler ou terminal)
2. **Preencha os formulários** nas telas
3. **Clique em Enviar**
4. **Veja os logs detalhados** no console

Os logs ajudam a:
- ✅ Verificar se os dados estão sendo capturados corretamente
- ✅ Confirmar que as máscaras estão sendo removidas
- ✅ Ver exatamente o que será enviado para a API
- ✅ Debugar problemas de validação

# Especificação da API de Estatísticas - Dashboard Home

## Endpoint Requerido

### GET `/deliveryman/:id/stats`

Retorna as estatísticas do entregador para exibição no dashboard home.

## Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

## Parâmetros

- `id` (path parameter) - ID do entregador

## Resposta Esperada

### Status: 200 OK

```typescript
{
  "deliveries": {
    "pending": number,      // Entregas pendentes/aguardando coleta
    "completed": number,    // Entregas concluídas hoje
    "total": number         // Total de entregas (opcional)
  },
  "earnings": {
    "today": number,        // Ganhos do dia em reais
    "week": number,         // Ganhos da semana (opcional)
    "month": number,        // Ganhos do mês (opcional)
    "goal": number          // Meta de ganhos (opcional)
  },
  "performance": {
    "averageDeliveryTime": number,  // Tempo médio de entrega em minutos
    "rating": number                // Avaliação média (opcional)
  },
  "balance": {
    "available": number,    // Saldo disponível para saque
    "pending": number       // Saldo pendente (opcional)
  }
}
```

## Exemplo de Resposta

```json
{
  "deliveries": {
    "pending": 8,
    "completed": 24,
    "total": 32
  },
  "earnings": {
    "today": 180.50,
    "week": 850.00,
    "month": 3200.00,
    "goal": 200.00
  },
  "performance": {
    "averageDeliveryTime": 25,
    "rating": 4.8
  },
  "balance": {
    "available": 1250.75,
    "pending": 180.50
  }
}
```

## Possíveis Erros

### 401 Unauthorized
```json
{
  "error": "Token inválido ou expirado"
}
```

### 404 Not Found
```json
{
  "error": "Entregador não encontrado"
}
```

### 500 Internal Server Error
```json
{
  "error": "Erro interno do servidor"
}
```

## Notas de Implementação

1. **Valores Padrão**: O frontend está preparado para lidar com valores ausentes, usando 0 como padrão.

2. **Loading States**: O frontend exibe um loading enquanto busca os dados e mantém valores padrão em caso de erro.

3. **Tratamento de Erro**: Se o endpoint retornar 404, o frontend exibirá uma mensagem informando que o endpoint ainda não está implementado.

4. **Cancelamento**: A requisição pode ser cancelada se o usuário sair da tela antes da resposta.

5. **Formatação de Valores**:
   - Valores monetários são exibidos com 2 casas decimais
   - Tempo médio é exibido em minutos
   - Todos os números inteiros são exibidos sem formatação

## Integração no Frontend

O frontend já está preparado para consumir este endpoint. A chamada está localizada em:

**Arquivo**: `app/(tabs)/home.tsx`
**Linha**: ~190

```typescript
const response = await api.get(`/deliveryman/${user.id}/stats`, {
  signal: abortController.signal,
})
```

## Próximos Passos

1. Implementar o endpoint no backend seguindo a especificação acima
2. Testar a integração com o frontend
3. Ajustar valores e campos conforme necessário
4. Implementar cache se necessário para melhor performance

# Runbook de Validação - FiraBot v7

Este runbook descreve como validar o projeto depois de alterações no código, documentação ou ambiente.

## Antes De Começar

Não usar banco remoto para testes locais.

Não abrir, copiar ou expor valores reais de `.env`.

Não apagar `auth/` a menos que a intenção seja forçar novo pareamento do WhatsApp.

## Validação Técnica Rápida

```powershell
cd C:\Dev\Projetos\firabot-v7
npm test
```

O comando executa:

1. `npm run build`
2. `node tests/run-tests.mjs`

Atenção: isso gera/atualiza `dist/`.

## Banco Local

Subir MySQL local:

```powershell
docker compose up -d mysql
```

Verificar container:

```powershell
docker ps --filter "name=firabot-mysql"
```

Entrar no MySQL local:

```powershell
docker exec -it firabot-mysql mysql -u firabot -p firabot
```

Consultas úteis:

```sql
SHOW TABLES;
SELECT id, name, path, category_code, is_active FROM docs ORDER BY id;
SELECT state, COUNT(*) FROM user_states GROUP BY state;
SELECT event_type, COUNT(*) FROM logs GROUP BY event_type ORDER BY COUNT(*) DESC;
```

## Execução Local

```powershell
npm run dev
```

No primeiro pareamento, ler o QR Code gerado no terminal.

Se QR Code repetir indefinidamente, investigar sessão em `auth/`. Só remover a pasta se quiser parear novamente.

## Teste Manual No WhatsApp

### Início

1. Reiniciar o bot.
2. Confirmar que ele não envia boas-vindas sozinho.
3. Enviar `oi`.
4. Esperar saudação e menu principal.

### Menu Principal

Validar opções:

```text
1 Biblioteca
2 Documentos
3 PPC do Curso
4 Links Importantes
5 Editais Abertos
6 RU
7 Suporte
```

Confirmar que o menu principal não exibe `0 - Voltar`.

### Documentos DRCA

Roteiro:

```text
oi
2
1
1
2
3
4
```

Esperado:

- `2` abre setor de documentos;
- `1` abre documentos DRCA;
- opções `1` a `4` enviam PDFs diferentes;
- após cada envio, aparece follow-up contextual com opções restantes;
- `3` dentro de DRCA envia `Requerimento Superior`, não abre PPC do curso.

### Documentos CAE

Roteiro:

```text
0
2
2
1
```

Esperado:

- CAE informa que ainda não há documentos cadastrados para envio automático;
- opções numéricas diferentes de `0` recebem fallback contextual.

### PPCs

Roteiro:

```text
0
3
1
1
2
0
3
2
1
2
0
3
3
1
2
0
3
4
1
0
3
5
1
```

Esperado:

- cada curso abre seu submenu de PPC;
- cada PPC envia o PDF correto;
- após envio, o bot mantém o usuário no submenu do curso;
- `0` retorna ao menu principal.

### Links, Editais e RU

Roteiro:

```text
0
4
0
5
0
6
0
```

Esperado:

- links importantes mostram SUAP, login SUAP e site do campus;
- editais mostram até 10 editais;
- RU mostra horário de almoço;
- `0` sempre volta ao menu principal.

### Suporte

Roteiro:

```text
7
Tenho uma dúvida sobre matrícula.
0
```

Esperado:

- bot pede uma mensagem livre;
- mensagem é registrada;
- bot confirma registro;
- estado muda para `suporte_confirmacao`;
- `0` retorna ao menu principal.

### Encerramento

Roteiro:

```text
encerrar
1
oi
```

Esperado:

- `encerrar` salva estado `encerrado`;
- número após encerramento recebe fallback de atendimento encerrado ou contextual;
- `oi` reinicia atendimento.

## Comandos Técnicos

Validar:

```text
!ping
!help
!status
!ifma
!encerrar
```

Esperado:

- `!ping` confirma bot ativo;
- `!help` lista comandos e explica navegação;
- `!status` mostra WhatsApp, banco, uptime, documentos e debug;
- `!ifma` mostra informações do campus;
- `!encerrar` encerra atendimento.

## Testes De Proteção

Quando possível, validar:

- mensagem enviada antes do start do processo não recebe resposta se `IGNORE_OLD_MESSAGES=true`;
- mensagem em grupo não recebe resposta se `IGNORE_GROUPS=true`;
- mensagens repetidas muito rápidas são filtradas por anti-spam;
- mensagem do próprio bot não é processada;
- opção inválida dentro de submenu não cai no menu principal.

## Critérios De Pronto

- [ ] `npm test` passa.
- [ ] MySQL local sobe.
- [ ] `npm run dev` inicia sem erro de configuração.
- [ ] QR Code/pareamento funciona quando necessário.
- [ ] Fluxo `oi -> 2 -> 1 -> documentos` funciona.
- [ ] Fluxo `oi -> 3 -> cursos -> PPCs` funciona.
- [ ] Fluxo `7 -> mensagem livre de suporte` funciona.
- [ ] `encerrar` e `!encerrar` funcionam.
- [ ] `!status` não expõe segredo.
- [ ] Logs não mostram telefone completo, QR Code, token ou senha.

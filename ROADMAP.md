# PetXadrez — Roadmap e Ideias

> Ultima atualizacao: 2026-06-11

## Como usar este documento

- Adicione itens na categoria apropriada
- Use `[ ]` para pendente, `[x]` para concluido
- Prioridade: [ALTA], [MEDIA], [BAIXA]
- Ao concluir um item, mova-o para a secao "Concluido" no final
- Dependencias entre itens sao indicadas com "Depende de:"

---

## Bugs Conhecidos

(nenhum bug registrado no momento)

---

## Melhorias Tecnicas (Refactoring)

(nenhuma melhoria tecnica pendente no momento)

---

## Novas Features

### Pagina de Estatisticas

Uma nova pagina `/estatisticas` com cards de curiosidades calculadas a partir dos dados de partidas existentes. Todas essas estatisticas podem ser implementadas sem alterar o schema do banco, apenas com novos endpoints no backend (ou computacao no frontend).

- [ ] [MEDIA] **O Maior Patinho** — Card que mostra o par de jogadores com maior rivalidade unilateral: "Jogador X perdeu N vezes para Jogador Y". Implementacao: agregar partidas por par de jogadores e contar vitorias de cada lado, encontrar a maior diferenca.
- [ ] [MEDIA] **Cor Preferida?** — Para cada jogador, calcular o winrate separado jogando de brancas vs jogando de pretas. Destacar o jogador com a maior diferenca entre os dois winrates. Ex: "Jogador X tem 80% de winrate de brancas mas so 30% de pretas".
- [ ] [BAIXA] **Viciado** — Jogador com mais partidas totais disputadas (ja temos vitorias+derrotas+empates, basta somar e exibir). Pode ser um card simples ou destaque no ranking.
- [ ] [BAIXA] **Hello World** — Exibir a primeira partida registrada no sistema (query: partida com `created_at` mais antigo). Card com os nomes dos jogadores, resultado e data.

### Perfil do Jogador (Expansao)

Melhorias na pagina `/perfil/:id` para tornar o perfil mais rico e personalizado.

(todos os itens desta secao foram concluidos — ver secao Concluido)

### Visual e Design

Melhorias visuais na interface para dar identidade unica ao PetXadrez.

- [ ] [MEDIA] **Background Tematico de Xadrez** — Fundo quadriculado sutil (padrao xadrez) usando CSS puro com `repeating-linear-gradient` ou `conic-gradient`. Cores discretas (ex: `zinc-900` e `zinc-950` alternando) para nao poluir a interface. Opcionalmente, adicionar pecas de xadrez pequenas espalhadas como SVGs decorativos com baixa opacidade.

### Autenticacao e Contas

Evolucao do sistema de autenticacao para permitir perfis individuais.

- [ ] [BAIXA] **Login via UFSM** — Substituir o sistema atual de senha admin compartilhada por autenticacao via credenciais da UFSM. Pesquisar se a UFSM oferece um identity provider (OAuth2, CAS ou SAML). Isso permitiria que cada jogador gerenciasse seu proprio perfil (bio, curso, foto). Impacto grande: requer reestruturacao do backend (trocar o decorator `@requer_admin` por verificacao de sessao/token) e do frontend (fluxo de login, estado de usuario logado via Context/state global). Considerar manter o sistema de admin separado (ex: flag `is_admin` na tabela jogadores) para funcoes como registro de partidas.
  - Depende de: verificar se a UFSM disponibiliza um servico de autenticacao externo

---

## Ideias Soltas

Ideias em estado bruto, sem compromisso de implementacao. Podem ser promovidas para "Novas Features" quando desenvolvidas.

- Foto de perfil (upload ou link para avatar)
- Modo torneio: criacao de torneios com chaveamento automatico
- Notificacao quando sair do Top 3
- Streak de vitorias visivel no perfil (sequencia atual)
- Head-to-head: ao ver um perfil, comparar com outro jogador
- Seasons/temporadas: resetar o ranking periodicamente e manter historico

---

## Concluido

- [x] [ALTA] **Grafico de Variacao de Rating** — Grafico AreaChart (Recharts) no perfil mostrando evolucao do MMR ao longo do tempo
- [x] [MEDIA] **Bio do Jogador** — Campo de texto editavel pelo admin no perfil, armazenado na tabela jogadores
- [x] [MEDIA] **Curso e Semestre** — Campos editaveis pelo admin, exibidos no card do perfil
- [x] [MEDIA] **Conquistas / Badges** — 8 conquistas computadas on-the-fly (Estreante, Primeira Vitoria, Veterano, Lenda, Imbativel, Pacifista, Rating S, Montanha-Russa)
- [x] [MEDIA] Extrair a API Base URL para constante centralizada (`src/config.js`)
- [x] [MEDIA] Remover `src/lib/supabase.js` e a dependencia `@supabase/supabase-js` do frontend
- [x] [BAIXA] Remover `App.css`
- [x] [BAIXA] Adicionar `.env` e `venv/` ao `.gitignore` do backend

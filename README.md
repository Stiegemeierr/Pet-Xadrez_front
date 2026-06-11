# PETXadrez

> **Status:** Versao Alpha (MVP)

O **PETXadrez** e uma aplicacao web desenvolvida para gerenciar o ranking de jogadores de xadrez da sala do PET (Programa de Educacao Tutorial) do curso de Ciencia da Computacao.

O objetivo deste sistema e gamificar essa experiencia, introduzindo um sistema de *Matchmaking Rating* (MMR) baseado no calculo Elo (o mesmo utilizado pela FIDE), proporcionando maior competitividade e incentivando o engajamento dos alunos.

---

## Documentacao

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Mapa completo do frontend (estrutura, componentes, fluxos)
- [ROADMAP.md](./ROADMAP.md) — Bugs, melhorias, ideias de features futuras
- [Backend — ARCHITECTURE.md](https://github.com/Stiegemeierr/PET-Xadrez-backend-/blob/main/ARCHITECTURE.md) — Arquitetura do backend
- [Backend — API_REFERENCE.md](https://github.com/Stiegemeierr/PET-Xadrez-backend-/blob/main/API_REFERENCE.md) — Documentacao dos endpoints

---

## Funcionalidades

* **Leaderboard (Ranking):** Tabela de classificacao em tempo real ordenada por MMR, com destaque visual para o Top 3 (Ouro, Prata e Bronze).
* **Registro de Partidas:** Formulario rapido e otimizado para mobile para registrar os resultados dos jogos na propria sala do PET.
* **Perfil do Jogador:** Tela de estatisticas detalhadas mostrando a Taxa de Vitoria (Winrate) e o historico das ultimas partidas com a variacao exata de pontos conquistados ou perdidos.
* **Historico de Partidas:** Visualizacao de todas as partidas registradas com detalhes de confronto e variacao de MMR.
* **Modo Admin:** Autenticacao por senha para funcoes de gerenciamento (registrar partidas, cadastrar jogadores, excluir partidas).

---

## Tecnologias Utilizadas (Stack)

O projeto foi construido focando em performance, responsividade (Mobile-First) e facilidade de manutencao:

* **Frontend:** React 19 construido com Vite 8.
* **Estilizacao:** Tailwind CSS (v4).
* **Roteamento:** React Router Dom v7 para navegacao Single Page Application (SPA).
* **Backend:** API REST em Python/Flask ([repositorio do backend](https://github.com/Stiegemeierr/PET-Xadrez-backend-)).
* **Banco de Dados:** Supabase (PostgreSQL).
* **Hospedagem:** Frontend na Vercel, Backend no Render.

---

## Como Rodar Localmente

### Pre-requisitos
- Node.js 18+
- npm

### Passos

1. Clone o repositorio:
```bash
git clone https://github.com/Stiegemeierr/Pet-Xadrez_front.git
cd Pet-Xadrez_front
```

2. Instale as dependencias:
```bash
npm install
```

3. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estara disponivel em `http://localhost:5173`.

> **Nota:** O frontend se comunica com a API hospedada no Render (`https://petxadrez-api.onrender.com`). Para desenvolvimento local do backend, veja o [repositorio do backend](https://github.com/Stiegemeierr/PET-Xadrez-backend-).

---

## O Calculo de MMR (Sistema Elo)

A logica de calculo de MMR roda no **backend Flask** (`elo_calculator.py`).

Quando uma partida e registrada, o Frontend envia apenas o `id` das Brancas, o `id` das Pretas e o `resultado` (1 para vitoria das brancas, 0 para vitoria das pretas, 0.5 para empate) via `POST /partidas`. O backend entao:

1. Busca os dados atuais dos dois jogadores.
2. Calcula a expectativa de vitoria de cada um usando a formula Elo padrao.
3. Aplica a constante de volatilidade (K = 100) para calcular os novos ratings.
4. Atualiza o MMR e os contadores de V/D/E de ambos os jogadores.
5. Salva o historico da partida com a variacao exata de MMR.

> **Por que K=100?** O fator K alto torna o sistema mais volatil, criando um efeito "montanha-russa" ideal para microcomunidades onde o numero de partidas e menor e a emocao da variacao de pontos e parte da diversao.

---

## Estrutura do Banco de Dados

O banco de dados relacional (Supabase/PostgreSQL) e composto por duas tabelas principais:

### Tabela `jogadores`
Armazena o estado atual dos membros.
* `id` (UUID, Primary Key)
* `nome` (Texto, Unique)
* `mmr_atual` (Integer, Default 500)
* `vitorias` (Integer, Default 0)
* `derrotas` (Integer, Default 0)
* `empates` (Integer, Default 0)

### Tabela `partidas`
Funciona como o "livro-razao" do historico do sistema.
* `id` (UUID, Primary Key)
* `jogador_brancas_id` (Foreign Key referenciando `jogadores.id`)
* `jogador_pretas_id` (Foreign Key referenciando `jogadores.id`)
* `resultado` (Numeric restrito a 1, 0 ou 0.5)
* `variacao_mmr_brancas` (Integer)
* `variacao_mmr_pretas` (Integer)
* `created_at` (Timestamp)

> *Nota de Seguranca:* Foi implementada uma restricao (`CHECK constraint`) a nivel de banco de dados para impedir que o `jogador_brancas_id` seja igual ao `jogador_pretas_id`.

---

*Desenvolvido para a comunidade do PET Ciencia da Computacao.*
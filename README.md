#  PETXadrez

> **Status:** Versão Alpha (MVP) 

O **PETXadrez** é uma aplicação web desenvolvida para gerenciar o ranking de jogadores de xadrez da sala do PET (Programa de Educação Tutorial) do curso de Ciência da Computação. 

O objetivo deste sistema é gamificar essa experiência, introduzindo um sistema de *Matchmaking Rating* (MMR) baseado no cálculo Elo (o mesmo utilizado pela FIDE), proporcionando maior competitividade e incentivando o engajamento dos alunos.

---

##  Funcionalidades

* **Leaderboard (Ranking):** Tabela de classificação em tempo real ordenada por MMR, com destaque visual para o Top 3 (Ouro, Prata e Bronze).
* **Registro de Partidas:** Formulário rápido e otimizado para mobile para registrar os resultados dos jogos na própria sala do PET.
* **Perfil do Jogador:** Tela de estatísticas detalhadas mostrando a Taxa de Vitória (Winrate) e o histórico das últimas partidas com a variação exata de pontos conquistados ou perdidos.

---

##  Tecnologias Utilizadas (Stack)

O projeto foi construído focando em performance, responsividade (Mobile-First) e facilidade de manutenção:

* **Frontend:** React.js construído com Vite.
* **Estilização:** Tailwind CSS (v4).
* **Roteamento:** React Router Dom para navegação Single Page Application (SPA).
* **Backend / Banco de Dados:** Supabase (PostgreSQL).
* **Hospedagem (Deploy):** Vercel.

---



### O Cálculo de MMR (Sistema Elo)
Toda a matemática de pontuação roda diretamente no servidor do banco de dados (PostgreSQL) através de uma **Stored Procedure** (`plpgsql`). 

Quando uma partida é registrada, o Frontend envia apenas o `id` das Brancas, o `id` das Pretas e o `resultado` (1 para vitória, 0 para derrota, 0.5 para empate) através de uma chamada de Remote Procedure Call (RPC). O Supabase executa a função `registrar_partida`, que:
1. Bloqueia as linhas dos jogadores envolvidos temporariamente (`FOR UPDATE`) para evitar sobrescrita de dados.
2. Calcula a expectativa de vitória de cada um usando a fórmula Elo padrão.
3. Aplica a constante de volatilidade ($K = 32$) para calcular os novos ratings.
4. Salva o histórico exato da variação de MMR.

---

## 🗄️ Estrutura do Banco de Dados

O banco de dados relacional é composto por duas tabelas principais:

### Tabela `jogadores`
Armazena o estado atual dos membros.
* `id` (UUID, Primary Key)
* `nome` (Texto, Unique)
* `mmr_atual` (Integer, Default 1200)
* `vitorias` (Integer, Default 0)
* `derrotas` (Integer, Default 0)
* `empates` (Integer, Default 0)

### Tabela `partidas`
Funciona como o "livro-razão" imutável do histórico do sistema.
* `id` (UUID, Primary Key)
* `jogador_brancas_id` (Foreign Key referenciando `jogadores.id`)
* `jogador_pretas_id` (Foreign Key referenciando `jogadores.id`)
* `resultado` (Numeric restrito a 1, 0 ou 0.5)
* `variacao_mmr` (Integer)

> *Nota de Segurança:* Foi implementada uma restrição (`CHECK constraint`) a nível de banco de dados para impedir que o `jogador_brancas_id` seja igual ao `jogador_pretas_id`.


---
*Desenvolvido para a comunidade do PET Ciência da Computação.*
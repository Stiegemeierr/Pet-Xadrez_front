# Arquitetura — PET-Xadrez Frontend

> Documento de referencia tecnica. Leia este arquivo para entender a estrutura completa do frontend sem precisar ler o codigo-fonte.

---

## Visao Geral

Aplicacao web SPA (Single Page Application) construida em React para gerenciar o ranking de xadrez do PET. Interface mobile-first com design dark mode.

**Deploy:** Vercel (com rewrites SPA configurado em `vercel.json`)

---

## Stack Tecnica

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| React | 19.x | Framework UI |
| Vite | 8.x | Build tool + dev server |
| Tailwind CSS | 4.x | Estilizacao (via plugin `@tailwindcss/vite`) |
| React Router Dom | 7.x | Roteamento SPA |
| @supabase/supabase-js | 2.x | Cliente Supabase (importado mas NAO usado — ver nota abaixo) |

> **Nota:** O cliente Supabase (`src/lib/supabase.js`) esta configurado mas nao e utilizado por nenhuma page. Toda comunicacao com o banco e feita via API Flask (backend). Essa dependencia pode ser removida em uma limpeza futura.

---

## Mapa de Arquivos

```
Pet-Xadrez_front/
|-- index.html               # HTML base do Vite
|-- package.json              # Dependencias e scripts npm
|-- vite.config.js            # Config Vite (plugins: react + tailwindcss)
|-- vercel.json               # Config de deploy Vercel (rewrites para SPA)
|-- eslint.config.js          # Config ESLint
|-- jogadores_rows.csv        # Dados de jogadores (exportacao/backup)
|-- partidas_rows.csv         # Dados de partidas (exportacao/backup)
|-- public/                   # Assets estaticos
|-- src/
    |-- main.jsx              # Entry point (ReactDOM.createRoot)
    |-- App.jsx               # Layout raiz + definicao de rotas
    |-- App.css               # CSS legado do template Vite (NAO utilizado)
    |-- index.css             # Importacao do Tailwind CSS
    |-- components/
    |   |-- Navbar.jsx        # Barra de navegacao sticky (links para todas as rotas)
    |-- pages/
    |   |-- Ranking.jsx       # Leaderboard com lista de jogadores ordenada por MMR
    |   |-- Historico.jsx     # Historico geral de partidas (com exclusao para admin)
    |   |-- Registro.jsx      # Formulario de registro de nova partida (admin)
    |   |-- Perfil.jsx        # Pagina de perfil do jogador + ultimas partidas
    |   |-- NovoJogador.jsx   # Formulario de cadastro de novo jogador (admin)
    |   |-- Login.jsx         # Tela de autenticacao admin (senha)
    |-- lib/
        |-- supabase.js       # Cliente Supabase (configurado mas nao usado)
```

---

## Descricao dos Componentes

### Componentes Globais

#### `App.jsx`
- Layout principal com `BrowserRouter`
- Container centralizado `max-w-md` (mobile-first)
- Renderiza `Navbar` + `Routes`
- Background dark: `bg-zinc-900`

#### `Navbar.jsx`
- Barra de navegacao fixa (`sticky top-0`)
- Logo "PETXadrez" com destaque verde
- Links: Ranking, Historico, Registrar Jogo, + Jogador, (cadeado) Login
- Link ativo destacado em `text-green-400`
- Scroll horizontal invisivel para nao quebrar em telas pequenas

### Pages

#### `Ranking.jsx` — Rota `/`
- Busca `GET /jogadores` ao montar
- Renderiza lista ordenada por MMR (desc)
- Top 3 com destaque visual (ouro, prata, bronze)
- Cada card e clicavel (Link para `/perfil/:id`)
- Mostra: posicao, nome, V/D/E, MMR

#### `Historico.jsx` — Rota `/historico`
- Busca `GET /partidas` e `GET /jogadores` (para mapear IDs em nomes)
- Cards com confronto: brancas VS pretas, variacao de MMR, vencedor
- Se admin logado: botao de exclusao visivel no hover
- Modal de confirmacao para exclusao com feedback visual
- Exclusao chama `DELETE /partidas/:id`

#### `Registro.jsx` — Rota `/registro`
- Formulario com dois selects (brancas e pretas) e 3 botoes de resultado
- Validacao: campos obrigatorios, jogador nao pode jogar contra si mesmo
- Chama `POST /partidas` com header `X-Admin-Password`
- Se 401, redireciona para `/login`
- Feedback visual de sucesso/erro

#### `Perfil.jsx` — Rota `/perfil/:id`
- Busca jogador, todos os jogadores (mapa de nomes) e historico de partidas
- Card principal: nome, MMR grande, Vitorias/Derrotas/Empates/Winrate
- Barra decorativa gradient verde no topo do card
- Lista de ultimas partidas com perspectiva do jogador (vitoria/derrota/empate + variacao)
- Botao "Voltar para o Ranking"

#### `NovoJogador.jsx` — Rota `/novo-jogador`
- Formulario simples com campo de nome (max 30 chars)
- Chama `POST /jogadores` com header `X-Admin-Password`
- Se 401, redireciona para `/login`
- Sucesso: redireciona para Ranking apos 1.5s

#### `Login.jsx` — Rota `/login`
- Campo de senha centralizado com visual premium (cadeado, gradient verde)
- Chama `POST /auth/login` para validar
- Sucesso: salva senha em `localStorage('admin_password')` e redireciona para `/registro`
- Erro: feedback visual inline

---

## Comunicacao com o Backend

### API Base URL

```
https://petxadrez-api.onrender.com
```

> **Importante:** Esta URL esta hardcoded em TODAS as chamadas `fetch()` dentro das pages. Nao existe variavel de ambiente ou constante centralizada para ela.

### Padrao de chamadas

Todas as pages usam `fetch()` nativo. Nao existe biblioteca HTTP (axios, etc). O padrao e:

```javascript
const res = await fetch('https://petxadrez-api.onrender.com/endpoint', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-Admin-Password': localStorage.getItem('admin_password') || ''
  },
  body: JSON.stringify({ ... })
});
```

### Autenticacao Admin

- A senha e armazenada em `localStorage` com chave `admin_password`
- Salva no `Login.jsx` apos validacao com sucesso
- Enviada em toda requisicao admin via header `X-Admin-Password`
- Se o backend retorna `401`, o frontend redireciona para `/login`
- A deteccao de admin no `Historico.jsx` verifica apenas `!!localStorage.getItem('admin_password')`

---

## Rotas

| Path | Componente | Acesso | Descricao |
|------|------------|--------|-----------|
| `/` | Ranking | Publico | Leaderboard principal |
| `/historico` | Historico | Publico (exclusao requer admin) | Historico geral |
| `/registro` | Registro | Admin | Registrar partida |
| `/perfil/:id` | Perfil | Publico | Perfil de jogador |
| `/novo-jogador` | NovoJogador | Admin | Cadastrar jogador |
| `/login` | Login | Publico | Autenticacao admin |

---

## Estilizacao

- 100% Tailwind CSS v4 (classes inline nos componentes)
- Tema escuro: background `zinc-900/950`, texto `zinc-100/400`
- Cor de destaque: `green-400/500/600`
- Cards com `bg-zinc-800/50`, `border-zinc-700/50`, `rounded-xl/2xl`
- Animacao de entrada: `animate-fade-in` (definida no Tailwind)
- Loading spinner: `animate-spin` com bordas verde
- Design mobile-first: container `max-w-md mx-auto`

---

## Deploy

- Plataforma: Vercel
- Build: `vite build`
- Config: `vercel.json` com rewrite SPA (`/(.*) -> /index.html`)
- Variaveis de ambiente do Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) configuradas na Vercel, mas nao sao usadas pela aplicacao atual

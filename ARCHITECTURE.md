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
| Recharts | latest | Graficos (usado no grafico de evolucao do MMR no perfil) |

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
    |-- config.js             # Constantes centralizadas (API_BASE_URL)
    |-- index.css             # Importacao do Tailwind CSS
    |-- components/
    |   |-- Navbar.jsx        # Barra de navegacao sticky (links para todas as rotas)
    |-- pages/
        |-- Ranking.jsx       # Leaderboard com lista de jogadores ordenada por MMR
        |-- Historico.jsx     # Historico geral de partidas (com exclusao para admin)
        |-- Registro.jsx      # Formulario de registro de nova partida (admin)
        |-- Perfil.jsx        # Perfil expandido: grafico MMR, bio, conquistas, partidas
        |-- NovoJogador.jsx   # Formulario de cadastro de novo jogador (admin)
        |-- Login.jsx         # Tela de autenticacao admin (senha)
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
- Busca jogador, todos os jogadores (mapa de nomes), historico de partidas, historico de MMR e conquistas
- **Card principal:** nome, bio (italico), curso/semestre, MMR grande, V/D/E/Winrate
- **Botao Editar Perfil (admin):** modal com formulario para bio, curso, semestre (PUT /jogadores/:id)
- **Grafico de evolucao do MMR:** Recharts AreaChart com gradiente verde, tooltip customizado, linha de referencia em 500
- **Conquistas:** grid 2 colunas com badges desbloqueados (coloridos) e travados (cinza, opacidade reduzida). 8 conquistas computadas on-the-fly
- **Ultimas Partidas:** lista das 10 partidas mais recentes com perspectiva do jogador
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

A URL da API esta centralizada no arquivo `src/config.js`:

```javascript
import { API_BASE_URL } from '../config';

const res = await fetch(`${API_BASE_URL}/endpoint`, {
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
| `/perfil/:id` | Perfil | Publico (edicao requer admin) | Perfil expandido de jogador |
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

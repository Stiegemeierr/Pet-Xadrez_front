# PetXadrez — Roadmap e Ideias

> Ultima atualizacao: 2026-06-11

## Como usar este documento

- Adicione itens na categoria apropriada
- Use `[ ]` para pendente, `[x]` para concluido
- Prioridade: [ALTA], [MEDIA], [BAIXA]
- Ao concluir um item, mova-o para a secao "Concluido" no final

---

## Bugs Conhecidos

(nenhum bug registrado no momento)

---

## Melhorias Tecnicas (Refactoring)

- [ ] [MEDIA] Extrair a API Base URL (`https://petxadrez-api.onrender.com`) para uma variavel de ambiente ou constante centralizada — atualmente esta hardcoded em 6 arquivos diferentes
- [ ] [MEDIA] Remover `src/lib/supabase.js` e a dependencia `@supabase/supabase-js` do frontend — toda comunicacao ja e feita via API Flask, esse modulo nao e usado
- [ ] [BAIXA] Remover `App.css` — arquivo CSS legado do template Vite que nao e utilizado por nenhum componente
- [ ] [BAIXA] Adicionar `.env` e `venv/` ao `.gitignore` do backend (atualmente so ignora `.env`, falta `venv/` e `__pycache__/`)

---

## Novas Features

(nenhuma feature planejada no momento — adicione ideias aqui)

---

## Ideias para o Futuro

(adicione ideias aqui livremente, sem compromisso de implementacao)

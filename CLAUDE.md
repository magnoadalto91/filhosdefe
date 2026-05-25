# CLAUDE.md — Site Filhos de Fé

Instruções e contexto para o assistente neste projeto.

## Sobre o projeto

Site para gerenciar / controlar as obrigações no terreiro de umbanda, o nome do site será 'Filhos de Fé'. O site deve ser desenvolvido considerando que depois será instalado no smartphone via google chrome como app (PWAs)

## Idéias a serem implantadas

- O site deverá um endpoint para admin com dashboard e configurações
- A ideia do site é ter um cadastro de letras das musicas, links do youtube para ouvi-las, links de videos educacionais, cadastro de ervas medicinais (com foto) e nesse caso um sub cadastro para ervas medicinais encontradas no quintal do nosso terreiro, cadastro de entidades (com historias, cores de velas, saudações, etc), cadastro para rotinas na gira (coisas que ocorrem toda vez) e um cadastro de próxima gira onde será utilizados esses outros cadastros para montar quais serão as entidades do dia, quais musicas serão cantadas, o que os irmãos devem fazer ao chegar na Gira e tudo isso no admin totalmente NO-CODE para o usuário administrador configurar sozinho. Para o usuário comum, basicamente ele terá uma sessão de aprendizagem e tbm um calendário para acompanhar as proximas Giras e notificação quando forem cadastradas novas e quando estiver proximo e ao clicar no dia deverá mostrar um modal com as informações da Gira cadastradas no admin.

## Stack

### Backend (criar pasta separada)
- Node.js + Express 5
- Prisma ORM + PostgreSQL (Neon)
- Cloudinary para storage de imagens
- JWT + bcrypt para autenticação
- Multer para upload de arquivos (memoryStorage)

### Frontend (criar pasta separada)
- React 19 + Vite 7
- Tailwind CSS 4
- React Router 7
- Swiper 12

## Dependências — versões fixas importantes

- **axios**: usar obrigatoriamente a versão `1.7.9`
  ```
  npm install axios@1.7.9
  ```
- **Node.js**: os pacotes exigem Node >= 20.

## Deploy — Vercel + Neon

- Repositório: https://github.com/magnoadalto91/filhosdefe.git
- **Banco de dados:** Neon PostgreSQL (sa-east-1) — pooler URL configurada em `DATABASE_URL`
- **Backend:** Vercel (projeto separado) — `backend/vercel.json` roteia tudo para `server.js`
  - Build command: `prisma generate && prisma migrate deploy` (script `vercel-build`)
  - Migrations rodam automaticamente em cada deploy
  - Cron job de lembretes de Gira: `POST /api/cron/giras-reminder` — agendado às 11:00 UTC (08:00 BRT) via Vercel Crons
- **Frontend:** Vercel (projeto separado) — `frontend/vercel.json` redireciona tudo para `index.html` (SPA)
  - Env var obrigatória no painel Vercel: `VITE_API_URL=<url-do-backend-vercel>`

### Env vars necessárias no backend Vercel:
- `DATABASE_URL` — URL do Neon (pooler)
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_MAILTO`
- `RESEND_API_KEY`
- `CRON_SECRET` — gerado automaticamente pelo Vercel (protege o endpoint de cron)

## Permissões e fluxo de trabalho

- O assistente tem **permissão total** neste projeto: pode commitar e fazer push para o GitHub sem pedir confirmação.
- **Sempre** fazer commit + push ao final de cada tarefa concluída. Não deixar mudanças apenas locais.
- Repositório remoto: `origin/main` (GitHub)

## Observações gerais

- Nunca commitar `.env` — deve estar no `.gitignore` da raiz
- `package-lock.json` deve ser atualizado localmente (`npm install`) antes de commitar quando mudar dependências
- O `postinstall` do backend roda `prisma generate` automaticamente após `npm install`
- Sem `alert()`/`confirm()` nativos usar criar um modal com a identidade visual do site e usa-la
- Sem emojis/ícones padrão em UI, usar icones modernos.
- Prisma — nunca `--force-reset` em produção
- Sempre vá atualizando este arquivo com informações importantes do projeto.


## LEMBRAR

- Todo upload deve ser convertido para webp antes de enviar ao cloudnary
- todo usuário deve ter um cadastro e ao acessar o site mostra primeiramente a tela de login (para cadastrar,  logar, esqueci minha senha, etc)
- configurar o resend.com



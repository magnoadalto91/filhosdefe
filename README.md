Filhos de Fé

Aplicação PWA para organizar as atividades e o acervo de conhecimento de um terreiro de umbanda. O usuário comum acompanha o calendário de giras e o conteúdo de estudo; o administrador cadastra e configura tudo pelo painel, sem depender de desenvolvedor.

Stack

Backend: Node.js 20, Express 5, Prisma ORM, PostgreSQL (Neon) Frontend: React 19, Vite 7, Tailwind CSS 4, React Router 7, Swiper Autenticação: JWT e bcrypt Imagens: upload com Multer, conversão para WebP com Sharp e armazenamento no Cloudinary Notificações: Web Push (VAPID) e e-mail transacional via Resend Agendamento: node-cron no servidor e cron da Vercel em produção Deploy: Vercel, com frontend e backend em projetos separados

Funcionalidades
Cadastro de músicas com letra e link do YouTube
Cadastro de ervas medicinais com foto, incluindo as encontradas no quintal do terreiro
Cadastro de entidades com histórias, cores de vela e saudações
Cadastro de rotinas da gira e montagem da próxima gira a partir dos demais cadastros
Calendário de giras para o usuário comum, com modal de detalhes ao clicar no dia
Notificação push quando uma nova gira é cadastrada e quando a data se aproxima
Painel administrativo no-code, com dashboard e configurações
Instalação no celular como aplicativo (PWA)
Estrutura
backend/     API Express, schema e migrations do Prisma
frontend/    aplicação React (Vite), empacotada como PWA
Como rodar

Pré-requisitos: Node.js 20 ou superior e um banco PostgreSQL (o projeto usa Neon).

bash
# backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# frontend
cd frontend
npm install
npm run dev

O postinstall do backend roda prisma generate automaticamente.

Variáveis de ambiente

Backend: DATABASE_URL, JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL, RESEND_API_KEY, CRON_SECRET Frontend: VITE_API_URL apontando para a URL do backend

Deploy

Backend e frontend são dois projetos na Vercel. O backend roda prisma generate && prisma migrate deploy no build, então as migrations são aplicadas a cada deploy. O frontend redireciona todas as rotas para index.html, como SPA. O lembrete de gira é um cron diário que chama GET /api/cron/giras-reminder.

Convenções do projeto
Todo upload é convertido para WebP antes de ir para o Cloudinary
Sem alert() ou confirm() nativos: usar os modais com a identidade visual do site
.env nunca é versionado

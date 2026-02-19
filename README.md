# Projeto Barbearia | Sistema de Agendamento + Painel Admin

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-000000?style=for-the-badge&logo=render&logoColor=white)

> **Aplicação Full-Stack de agendamento para barbearia** com foco em consistência de horários (bloqueio por duração real), autenticação, painel administrativo e rastreabilidade de mudanças (audit log).

---

## 🧠 Engenharia & Arquitetura

Este projeto foi construído para resolver dores comuns de sistemas de agendamento:

- **Conflitos de horários** (sobreposição) evitados no backend com regras determinísticas.
- **Disponibilidade confiável** via endpoint dedicado (`/availability`) baseado em bloqueios reais.
- **Painel Admin** com autorização por allowlist de emails.
- **Auditoria** de alterações/exclusões de agendamentos, com ator (barbeiro/admin) registrado.
- **Perfil do cliente** com histórico de agendamentos futuros e compras passadas.

### Princípios de projeto
- **Backend como fonte de verdade** para regras de agenda (o frontend só orquestra).
- **Contratos de API claros** (payloads padronizados para criação/edição/exclusão).
- **Autenticação com Supabase** no front e validação no backend via token Bearer.

---

## 🚀 Stack

### Frontend
- **React + Vite**
- **TailwindCSS**
- Integração com Supabase Auth (`@supabase/supabase-js`)
- Fetch com token Bearer para endpoints protegidos

### Backend
- **Node.js + Express**
- **Supabase (Postgres)**
- Validação de token e middlewares de autorização
- CORS restrito por `FRONTEND_ORIGIN`

### Infra / Deploy
- **Frontend**: Vercel
- **Backend**: Render
- **Banco**: Supabase (Postgres + Auth)

---

## ✅ Funcionalidades

### Cliente
- Listagem de serviços (Supabase)
- Carrinho + finalização do agendamento
- Agendamento com **bloqueio por duração real**
- Login/Cadastro (Supabase Auth)
- Menu do usuário (hamburger 3 linhas):
  - **Perfil**
  - **Tema**
  - **Sair**
- Perfil do cliente:
  - editar **nome / telefone / email**
  - ver **agendamentos marcados**
  - ver **compras passadas**

### Admin (barbeiro)
- Acesso pelo mesmo login do cliente, mas liberado apenas para emails allowlisted
- Identificação do barbeiro responsável
- **Agenda do dia** (com editar horário e excluir)
- **Calendário mensal** (quantidade de atendimentos por dia + expandir)
- **Histórico (audit log)** de alterações/exclusões
- **Clientes**: base com email/telefone + lista de agendamentos por cliente

---

## 🗃️ Modelo de Dados (Supabase)

### Tabelas principais
- `services`
  - `id`, `name`, `description`, `price`, `duration`, `image`, `category`
- `appointments`
  - `id`, `user_id`, `date`, `time`, `payment_method`, `notes`, `created_at`
- `appointment_items`
  - `appointment_id`, `service_id`, `qty`

### Auditoria (Admin)
- `admin_audit_logs`
  - `action` (`UPDATE_APPOINTMENT` | `DELETE_APPOINTMENT`)
  - `appointment_id`
  - `actor_user_id`, `actor_email`, `actor_name`
  - `target_user_id`
  - `before_data` (jsonb)
  - `after_data` (jsonb)
  - `created_at`

---

## 🔐 Auth & Permissões

### Autenticação
- O frontend obtém a sessão via Supabase:
  - `supabase.auth.getSession()`
- Requisições autenticadas ao backend usam:
  - `Authorization: Bearer <access_token>`

### Autorização de Admin
- O backend valida se o email do usuário autenticado está numa allowlist (`ADMIN_EMAILS`).
- Rotas Admin ficam sob middlewares:
  - `requireAuth`
  - `requireAdmin`

---

## 🧩 Estrutura do Projeto

> Ajuste se o seu repositório tiver nomes diferentes, mas a separação é:

```bash
/
├── frontend/
│   ├── src/
│   │   ├── auth/                # AuthProvider, RequireAuth, etc.
│   │   ├── components/          # Header, UserMenu, etc.
│   │   ├── pages/               # Home, Login, Agendar, Admin, Profile...
│   │   ├── services/            # api.ts, adminApi.ts, profileApi.ts...
│   │   └── lib/                 # supabase client
│   └── .env
│
└── backend/
    ├── server.js
    ├── supabaseClient.js
    └── .env

# Configuração do login na nuvem (Supabase)

O código de login/cadastro e sincronização já está pronto. Faltam **2 passos** que só você pode fazer.

## 1. Criar o projeto e o banco

1. Crie uma conta grátis em https://supabase.com e um novo projeto.
2. No projeto, abra **SQL Editor** e rode este script (cria a tabela e a segurança):

```sql
-- Tabela que guarda a coleção de cada usuário
create table if not exists public.collections (
  user_id    uuid primary key references auth.users on delete cascade,
  owned      jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Liga Row Level Security: cada um só enxerga a própria linha
alter table public.collections enable row level security;

create policy "own row - select"
  on public.collections for select
  using (auth.uid() = user_id);

create policy "own row - insert"
  on public.collections for insert
  with check (auth.uid() = user_id);

create policy "own row - update"
  on public.collections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

3. (Opcional) Em **Authentication → Providers → Email**, você pode desligar
   "Confirm email" para poder entrar logo após criar a conta, sem confirmar por e-mail.

## 2. Colar as credenciais no app

No painel do Supabase: **Project Settings → API**. Copie:

- **Project URL**
- **anon public** key

Cole os dois em `constants/supabase.ts`:

```ts
export const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
```

> A chave **anon** é pública por design (pode ficar no código do site);
> quem protege os dados são as políticas RLS acima. **Nunca** use a `service_role` aqui.

Pronto — ao subir a mudança, a seção **Conta** em Ajustes passa a permitir criar
conta e entrar, e as marcações passam a sincronizar entre aparelhos.

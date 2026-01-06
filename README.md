# site-pnsc

Projeto Vite + React pronto para build com Docker e deploy via EasyPanel.

## Requisitos
- Node.js (veja `.nvmrc`)
- Docker + Docker Compose
- Git

## Rodar local (dev)
```bash
npm install
npm run dev
```

## Build com Docker (produção)
```bash
docker compose up --build
```
Abra `http://localhost:5000`.

## Variáveis de ambiente
- `APP_PORT`: porta local do host (padrao `5000`)
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: chave anon do Supabase
- `VITE_SUPABASE_BUCKET`: bucket do Storage (padrão `pnsc-media`)
- `VITE_GOOGLE_MAPS_API_KEY`: (opcional) chave da API do Google Static Maps

## Supabase Storage
1. Crie um projeto no Supabase.
2. Crie um bucket público (ex: `pnsc-media`).
3. Copie as variáveis do `.env.example` para o `.env` e preencha os valores.
4. Se o upload retornar erro de RLS, aplique as políticas abaixo no SQL Editor:
```sql
-- deixa o bucket público para leitura via getPublicUrl
update storage.buckets set public = true where id = 'pnsc-media';

-- leitura pública dos arquivos
create policy "Public read pnsc-media"
  on storage.objects for select
  using (bucket_id = 'pnsc-media');

-- permitir upload via anon key
create policy "Public insert pnsc-media"
  on storage.objects for insert
  with check (bucket_id = 'pnsc-media');

-- permitir remoção via dashboard
create policy "Public delete pnsc-media"
  on storage.objects for delete
  using (bucket_id = 'pnsc-media');
```
5. Em produção, troque por políticas com autenticação do Supabase.

## Supabase Banco de Dados (eventos/infos)
1. No Supabase, abra o SQL Editor e execute:
```sql
create extension if not exists "pgcrypto";

create table if not exists public.site_data (
  id integer primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  time text,
  location text,
  description text,
  created_at timestamptz default now()
);

alter table public.site_data enable row level security;
alter table public.events enable row level security;

create policy "Public read site_data"
  on public.site_data for select
  using (true);

create policy "Public write site_data"
  on public.site_data for insert
  with check (true);

create policy "Public update site_data"
  on public.site_data for update
  using (true);

create policy "Public read events"
  on public.events for select
  using (true);

create policy "Public insert events"
  on public.events for insert
  with check (true);

create policy "Public update events"
  on public.events for update
  using (true);

create policy "Public delete events"
  on public.events for delete
  using (true);
```
2. Se preferir restringir acesso, substitua as políticas por regras com autenticação do Supabase.

Sem Supabase configurado, o site continua usando localStorage como fallback.

## Publicar no GitHub
```bash
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

## Deploy no EasyPanel (Docker Compose)
1. Crie um projeto do tipo Compose.
2. Em Fonte > Git, informe a URL do repositorio e o ramo (ex: `main`).
3. Caminho de build: `/`
4. Arquivo docker compose: `docker-compose.yml`
5. Em Variaveis de ambiente, defina `APP_PORT=5000` e as `VITE_*` do Supabase (e opcional `VITE_GOOGLE_MAPS_API_KEY`).
6. Em Dominios, adicione `www.pnsc.domingos-automacoes.shop` e ative SSL.
7. Salve e clique em Implantar.

## Notas
- O container expõe a porta 80 internamente (Nginx).






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

## Build com Docker (producao)
```bash
docker compose up --build
```
Abra `http://localhost:8080`.

## Variaveis de ambiente
- `APP_PORT`: porta local do host (padrao `8080`)

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
5. (Opcional) defina `APP_PORT` no painel.
6. Salve e clique em Implantar.

## Notas
- O container expoe a porta 80 internamente (Nginx).

# Construtora JPA — site institucional

Site estático (HTML, CSS e JS puros) da Construtora JPA, João Pessoa/PB.

## Estrutura
- `index.html` e demais páginas `.html` na raiz
- `assets/site.css`, `assets/site.js`
- `img/` — fotos em WebP (640/1024/1600/2000) e JPG

## Rodar localmente
Qualquer servidor estático serve, por exemplo:

```bash
npx serve .
```

## Deploy
Publicado na Vercel como projeto estático (sem build). Framework preset: **Other**, Build command vazio, Output directory `.`.

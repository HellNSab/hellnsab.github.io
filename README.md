# Site personnel — Nadya Serbouti

Site minimaliste construit avec [Astro](https://astro.build), déployé automatiquement sur GitHub Pages.

## Mise en ligne (une seule fois)

1. **Personnalise deux fichiers** en remplaçant les valeurs `YOUR-…` :
   - `astro.config.mjs` → ton nom d'utilisateur GitHub
   - `src/site.ts` → tes liens GitHub et LinkedIn
2. **Crée un dépôt sur GitHub** nommé `ton-pseudo.github.io` (le site sera alors à l'adresse `https://ton-pseudo.github.io`).
   Si tu préfères un autre nom, par exemple `blog`, mets `base: '/blog'` dans `astro.config.mjs`.
3. **Envoie les fichiers** dans le dépôt :
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/ton-pseudo/ton-pseudo.github.io.git
   git push -u origin main
   ```
4. **Active GitHub Pages** : dans le dépôt, *Settings › Pages › Source* → choisis **GitHub Actions**.
5. Après une à deux minutes, le site est en ligne. Chaque `git push` sur `main` le redéploie.

## Voir le site sur ton ordinateur

Il faut [Node.js](https://nodejs.org) (version 22 ou plus) :

```bash
npm install
npm run dev
```

Puis ouvre http://localhost:4321. Les brouillons y sont visibles (avec une étiquette « draft »).

## Écrire un article

1. Copie `src/content/posts/example-post.md` et renomme-le. Le nom du fichier devient l'URL :
   `evaluating-llm-chatbots.md` → `/posts/evaluating-llm-chatbots/`.
2. Modifie l'en-tête (`title`, `description`, `date`, `tags`) et écris en Markdown.
3. Laisse `draft: true` tant que l'article n'est pas prêt : il ne sera jamais publié.
   Passe à `draft: false` pour le publier, puis `git push`.

Tu peux supprimer `example-post.md` quand tu n'en as plus besoin.

## Où modifier quoi

| Quoi | Fichier |
|---|---|
| Texte de présentation | `src/pages/index.astro` |
| Nom, titre, liens | `src/site.ts` |
| Couleurs, typographie | `src/layouts/Base.astro` (bloc `<style>`) |
| Articles | `src/content/posts/` |

Le site s'adapte automatiquement au mode sombre et aux mobiles, et propose un flux RSS (`/rss.xml`).

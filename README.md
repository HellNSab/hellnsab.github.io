# Site personnel — Nadya Serbouti

Site minimaliste construit avec [Astro](https://astro.build), déployé automatiquement sur GitHub Pages.

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

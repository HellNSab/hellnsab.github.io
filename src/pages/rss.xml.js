import rss from '@astrojs/rss';
import { SITE } from '../site';
import { getPublishedPosts } from '../posts';

export async function GET(context) {
  const posts = await getPublishedPosts();
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `${base}posts/${post.id}/`,
    })),
  });
}

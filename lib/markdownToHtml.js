import remark from 'remark';
import html from 'remark-html';
import remarkSlug from 'remark-slug';
import remarkToc from 'remark-toc';

export default async function markdownToHtml(markdown) {
  const result = await remark()
    .use(remarkToc, { tight: true, heading: 'Contenido del Post' })
    .use(remarkSlug)
    .use(html)
    .process(markdown);
  return result.toString();
}

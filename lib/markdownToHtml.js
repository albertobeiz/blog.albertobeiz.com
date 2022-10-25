import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkSlug from 'remark-slug';
import remarkToc from 'remark-toc';

export default async function markdownToHtml(markdown) {
  const result = await remark()
    .use(remarkToc, { tight: true, heading: 'Contenido del Post' })
    .use(remarkSlug)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return result.toString();
}

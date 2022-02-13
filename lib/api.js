import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const postsDirectory = join(process.cwd(), '_posts');
const draftsDirectory = join(process.cwd(), '_drafts');

function getPostSlugs(directory) {
  return fs.readdirSync(
    directory === '_drafts' ? draftsDirectory : postsDirectory
  );
}

export function getPostBySlug(slug, fields = [], directory = '_posts') {
  const realSlug = getPostSlugs(directory).find(
    (postSlug) => `${slug}.md` === postSlug.substring(11)
  );

  const fullPath = join(
    directory === '_drafts' ? draftsDirectory : postsDirectory,
    realSlug
  );
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = slug;
    }
    if (field === 'content') {
      items[field] = content;
    }

    if (typeof data[field] !== 'undefined') {
      items[field] = data[field];
    }
  });

  return items;
}

export function getAllPosts(fields = [], directory = '_posts') {
  const slugs = getPostSlugs(directory);
  const posts = slugs
    .map((slug) =>
      getPostBySlug(slug.substring(11).replace('.md', ''), fields, directory)
    )
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

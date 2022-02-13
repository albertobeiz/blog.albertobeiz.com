import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const postsDirectory = join(process.cwd(), '_posts');
const draftsDirectory = join(process.cwd(), '_posts');

function getPostSlugs(directory) {
  return fs.readdirSync(
    directory === '_posts' ? postsDirectory : draftsDirectory
  );
}

export function getPostBySlug(slug, fields = [], directory = '_posts') {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = join(
    directory === '_posts' ? postsDirectory : draftsDirectory,
    `${realSlug}.md`
  );
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug;
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
    .map((slug) => getPostBySlug(slug, fields))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

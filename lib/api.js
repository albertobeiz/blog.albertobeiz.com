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
  const posts = getPostSlugs(directory).map((postSlug) => {
    const fullPath = join(
      directory === '_drafts' ? draftsDirectory : postsDirectory,
      postSlug
    );

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const items = {};

    fields.forEach((field) => {
      if (field === 'slug') {
        items[field] = postSlug.substring(11).replace('.md', '');
      }
      if (field === 'date') {
        items[field] = postSlug.substring(0, 10);
      }
      if (field === 'content') {
        items[field] = content;
      }

      if (typeof data[field] !== 'undefined') {
        items[field] = data[field];
      }
    });

    return items;
  });

  const post = posts.find((post) => post.slug === slug);

  if (post.collection) {
    const items = posts
      .filter((cpost) => cpost.collection === post.collection)
      .map((cpost) => ({
        title: cpost.title,
        slug: cpost.slug,
        subtitle: cpost.subtitle,
      }));
    post.collection = { title: post.collection, items };
  }

  return post;
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

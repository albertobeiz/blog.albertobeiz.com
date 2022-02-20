import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Container from '../../components/container';
import PostBody from '../../components/post-body';
import Header from '../../components/header';
import PostHeader from '../../components/post-header';
import Layout from '../../components/layout';
import { getPostBySlug, getAllPosts } from '../../lib/api';
import PostTitle from '../../components/post-title';
import Head from 'next/head';
import markdownToHtml from '../../lib/markdownToHtml';
import Prism from 'prismjs';
import { useEffect } from 'react';
import 'prismjs/components/prism-markup-templating.js';
import 'prismjs/components/prism-php';

export default function Post({ post, preview }) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  useEffect(() => {
    Prism.highlightAll();
  }, [post]);

  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="mb-32">
              <Head>
                <title>{post.title} | Alberto Beiz</title>
                <meta
                  key="og:image"
                  property="og:image"
                  content={post.coverImage}
                />
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post.author}
                tags={post.tags}
                collection={post.collection}
              />
              <PostBody content={post.content} collection={post.collection} />
            </article>
          </>
        )}
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(
    params.slug,
    [
      'title',
      'subtitle',
      'date',
      'slug',
      'tags',
      'content',
      'coverImage',
      'collection',
    ],
    '_drafts'
  );
  const content = await markdownToHtml(post.content || '');

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug'], '_drafts');

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}

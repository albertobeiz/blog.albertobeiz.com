import Container from '../components/container';
import MoreStories from '../components/more-stories';
import Layout from '../components/layout';
import { getAllPosts } from '../lib/api';
import Head from 'next/head';
import Header from '../components/header';

export default function Index({ allPosts }) {
  return (
    <>
      <Layout>
        <Head>
          <title>Alberto Beiz</title>
        </Head>
        <Container>
          <Header />
          {<MoreStories posts={allPosts} />}
        </Container>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const allPosts = getAllPosts([
    'title',
    'date',
    'coverImage',
    'tags',
    'slug',
    'collection',
  ]);

  return {
    props: { allPosts },
  };
}

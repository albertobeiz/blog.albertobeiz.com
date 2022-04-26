import Container from '../components/container';
import MoreStories from '../components/more-stories';
import Layout from '../components/layout';
import { getAllPosts } from '../lib/api';
import Head from 'next/head';
import Header from '../components/header';
import { SectionHeader } from '../components/SectionHeader';

export default function Index({ allPosts }) {
  return (
    <>
      <Layout>
        <Head>
          <title>Alberto Beiz</title>
        </Head>
        <Container>
          <Header />
          <div className="flex flex-col lg:flex-row justify-between">
            {<MoreStories posts={allPosts} />}
            <div style={{ flexBasis: 300 }}>
              <div className="flex justify-center">
                <img
                  className="mb-8 rounded-full h-52"
                  src="/images/alberto.png"
                ></img>
              </div>
              <SectionHeader>Freelance developer</SectionHeader>
              <p className="mb-4">
                Contacta conmigo para desarrollo de proyectos a medida.
              </p>
            </div>
          </div>
        </Container>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const allPosts = getAllPosts([
    'title',
    'subtitle',
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

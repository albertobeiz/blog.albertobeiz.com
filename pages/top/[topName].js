import Container from '../../components/container';
import Header from '../../components/header';
import Layout from '../../components/layout';
import { TOPS } from '../../lib/tops';

export default function Top({ topName, items }) {
  return (
    <Layout>
      <Container>
        <Header />
        <h2 className="mb-8 text-4xl font-bold tracking-tighter leading-tight">
          Top {topName} 2022
        </h2>

        <div className="pb-16">
          {items.map((item) => (
            <div key={item.name} className="flex items-center space-x-4 mb-2">
              <div>
                <img className="object-cover w-20 h-20" src={item.image} />
              </div>
              <div>
                <h2 className="text-2xl">{item.name}</h2>
                <p>
                  <span className="text-md text-gray-500 mr-1">
                    {item.month}
                  </span>
                  {item.comment && '-'} {item.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  return {
    props: { topName: params.topName, items: TOPS[params.topName] },
  };
}

export async function getStaticPaths() {
  const lists = Object.keys(TOPS);
  return {
    paths: lists.map((topName) => {
      return {
        params: {
          topName,
        },
      };
    }),
    fallback: false,
  };
}

import Container from '../../components/container';
import Header from '../../components/header';
import Layout from '../../components/layout';
import { LISTAS } from '../../lib/listas';

export default function Lista({ listName, items }) {
  return (
    <Layout>
      <Container>
        <Header />
        <h1 className="text-3xl mb-8">Top {listName} 2022</h1>

        <div className="pb-16">
          {items.map((item) => (
            <div key={item.name} className="flex items-center space-x-4">
              <div>
                <img className="object-contain w-24 h-24" src={item.image} />
              </div>
              <div>
                <h2 className="text-2xl">{item.name}</h2>
                <p>
                  <span className="text-md text-gray-500 mr-1">
                    {item.month}
                  </span>
                  - {item.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Layout>
  );
}

export async function getStaticProps() {
  const items = LISTAS.videojuegos;
  return {
    props: { listName: 'videojuegos', items },
  };
}

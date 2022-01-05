import Container from '../../components/container';
import Header from '../../components/header';
import Layout from '../../components/layout';
import { TOPS } from '../../lib/tops';

export default function Top({ topName, tiers, itemsByTier }) {
  return (
    <Layout>
      <Container>
        <Header />
        <h2 className="mb-8 text-4xl font-bold tracking-tighter leading-tight">
          Top {topName} 2022
        </h2>

        {tiers.map(
          (tier) =>
            itemsByTier[tier] && (
              <div className="pb-8 flex">
                <div className="flex flex-col pt-2 w-10 mr-8">
                  <p className="text-6xl text-gray-500">{tier}</p>
                </div>
                {itemsByTier[tier].map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col items-center justify-center mr-4"
                  >
                    <img
                      className="object-cover w-20 h-20 mb-1"
                      src={item.image}
                    />

                    <h2 className="text-sm">{item.name}</h2>
                    <p className="text-xs text-gray-500">{item.month}</p>
                  </div>
                ))}
              </div>
            )
        )}
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const tiers = ['S', 'A', 'B', 'C', 'D'];
  const items = TOPS[params.topName];

  const itemsByTier = {};
  for (const item of items) {
    const tier = item.tier;
    if (!itemsByTier[tier]) {
      itemsByTier[tier] = [];
    }
    itemsByTier[tier].push(item);
  }

  return {
    props: { topName: params.topName, itemsByTier, tiers },
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

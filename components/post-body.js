import Link from 'next/link';
import markdownStyles from './markdown-styles.module.css';

export default function PostBody({ content, collection }) {
  return (
    <>
      <div className="max-w-2xl mx-auto">
        <CollectionIndex collection={collection} />

        <div
          className={markdownStyles['markdown']}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <CollectionIndex collection={collection} />
      </div>
    </>
  );
}

function CollectionIndex({ collection }) {
  return (
    <>
      {collection && (
        <div className="my-6">
          <h2 className="font-bold">{collection.title}</h2>

          <ol className="list-decimal list-inside">
            {collection.items.map((item, index) => (
              <li key={item.title}>
                <Link href={'/posts/' + item.slug}>
                  <a className="underline text-sm">{item.subtitle}</a>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}

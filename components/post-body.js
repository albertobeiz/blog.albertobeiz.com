import markdownStyles from './markdown-styles.module.css';

export default function PostBody({ content, prev, next }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div>
        {prev && (
          <Link to={`/posts/${prev.slug}`}>
            <div className="text-gray-500">
              <span className="block">{prev.title}</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

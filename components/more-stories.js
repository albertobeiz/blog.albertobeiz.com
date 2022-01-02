import PostPreview from '../components/post-preview';

export default function MoreStories({ posts }) {
  return (
    <section>
      <h2 className="mb-8 text-4xl font-bold tracking-tighter leading-tight">
        Posts
      </h2>
      <div className="grid grid-cols-1 gap-y-2 mb-32">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            slug={post.slug}
          />
        ))}
      </div>
    </section>
  );
}

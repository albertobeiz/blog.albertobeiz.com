import PostPreview from '../components/post-preview';
import { SectionHeader } from './SectionHeader';

export default function MoreStories({ posts }) {
  return (
    <section>
      <SectionHeader>Posts</SectionHeader>
      <div className="grid grid-cols-1 gap-y-2 mb-16">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            subtitle={post.subtitle}
            coverImage={post.coverImage}
            date={post.date}
            slug={post.slug}
            collection={post.collection && post.collection.title}
            tags={post.tags}
          />
        ))}
      </div>
    </section>
  );
}

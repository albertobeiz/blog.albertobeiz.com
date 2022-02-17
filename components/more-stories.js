import PostPreview from '../components/post-preview';
import { SectionHeader } from './SectionHeader';

export default function MoreStories({ posts }) {
  return (
    <section>
      <SectionHeader>Posts</SectionHeader>
      <div className="grid grid-cols-1 gap-y-4 mb-32">
        {posts.map((post) => (
          <PostPreview
            key={post.slug}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            slug={post.slug}
            collection={post.collection.title}
            tags={post.tags}
          />
        ))}
      </div>
    </section>
  );
}

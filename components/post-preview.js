import Avatar from '../components/avatar';
import DateFormatter from '../components/date-formatter';
import Link from 'next/link';

export default function PostPreview({ title, date, excerpt, author, slug }) {
  return (
    <div>
      <h3 className="text-xl mb-1">
        <Link as={`/posts/${slug}`} href="/posts/[slug]">
          <a className="hover:underline">{title}</a>
        </Link>
      </h3>
      <div className="text-sm mb-4 text-gray-600">
        <DateFormatter dateString={date} />
      </div>
    </div>
  );
}

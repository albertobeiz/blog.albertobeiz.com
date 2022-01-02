import DateFormatter from '../components/date-formatter';
import Link from 'next/link';
import Image from 'next/image';

export default function PostPreview({ title, date, slug, coverImage, tags }) {
  return (
    <div className="flex space-x-4">
      <div>
        <Image src={coverImage} width={50} height={50}></Image>
      </div>
      <div>
        <h3 className="text-xl mb-1">
          <Link as={`/posts/${slug}`} href="/posts/[slug]">
            <a className="hover:underline">{title}</a>
          </Link>
        </h3>
        <div className="text-sm mb-4 text-gray-600">
          <DateFormatter dateString={date} /> {tags && '-'}{' '}
          {tags?.map((tag) => (
            <span
              key={tag}
              className="border border-gray-300 rounded-xl px-2 pb-0.5 text-gray-500 mr-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

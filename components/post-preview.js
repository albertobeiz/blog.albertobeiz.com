import DateFormatter from '../components/date-formatter';
import Link from 'next/link';
import Image from 'next/image';

export default function PostPreview({
  title,
  subtitle,
  date,
  slug,
  coverImage,
  tags,
  collection,
}) {
  return (
    <Link as={`/posts/${slug}`} href="/posts/[slug]">
      <div className="flex items-center space-x-2 hover:bg-gray-200 cursor-pointer">
        <Image src={coverImage} width={45} height={45}></Image>

        <div>
          <h3 className="text-md tracking-tight">
            <span className="font-semibold">{title}</span> {subtitle && '-'}{' '}
            <span className="text-sm text-gray-600">{subtitle}</span>
          </h3>
          <div className="text-xs text-gray-600">
            <DateFormatter dateString={date} />
          </div>
        </div>
      </div>
    </Link>
  );
}

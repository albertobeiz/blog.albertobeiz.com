import DateFormatter from '../components/date-formatter';
import PostTitle from '../components/post-title';

export default function PostHeader({ title, date, tags, collection }) {
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-sm text-gray-500">
          <DateFormatter dateString={date} />
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
    </>
  );
}

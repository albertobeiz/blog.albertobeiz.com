import Link from 'next/link';

export default function Header() {
  return (
    <h2 className="text-2xl font-bold text-gray-700 tracking-tight leading-tight mb-4 mt-6">
      <Link href="/">
        <a className="hover:underline">Alberto Beiz</a>
      </Link>
      .
    </h2>
  );
}

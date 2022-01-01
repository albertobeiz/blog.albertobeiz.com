import Link from 'next/link';

export default function Header() {
  return (
    <h2 className="text-2xl font-bold tracking-tight leading-tight mb-10 mt-8">
      <Link href="/">
        <a className="hover:underline">Alberto Beiz</a>
      </Link>
      .
    </h2>
  );
}

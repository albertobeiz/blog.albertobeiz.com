export default function PostTitle({ children }) {
  return (
    <h1 className="text-3xl max-w-2xl mx-auto font-bold tracking-tighter leading-tight md:leading-none mb-2 text-center md:text-left">
      {children}
    </h1>
  );
}

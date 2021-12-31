import { CMS_NAME } from '../lib/constants';

export default function Intro() {
  return (
    <section className="flex-col md:flex-row flex items-baseline md:justify-between mt-16 mb-16 md:mb-12">
      <h1 className="text-2xl md:text-6xl font-bold tracking-tighter leading-tight md:pr-8">
        Alberto Beiz.
      </h1>
      <h4 className="text-center md:text-left text-lg mt-5 md:pl-8">A 🤷🏼‍♂️</h4>
    </section>
  );
}

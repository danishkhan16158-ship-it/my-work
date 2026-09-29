export default function Founder() {
  return (
    <section
      id="founder"
      className="mt-20 border-y border-white/10 bg-[#161920]/80 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-3 text-xs font-extrabold uppercase text-[#6366f1]">
            <span className="h-px w-9 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]" />
            Meet the Founder
          </div>
          <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Danish Khan — Lead Developer &amp; Founder, Danah Web
          </h2>
          <blockquote className="mt-6 border-l-2 border-[#6366f1] pl-5 text-base leading-8 text-white/70 sm:text-lg">
            “At Danah Web, I focus on engineering ultra-fast, modern web
            applications and landing pages using Next.js and Tailwind CSS. My
            goal is to help businesses replace outdated, slow websites with
            high-performing digital experiences that drive real revenue.”
          </blockquote>
        </div>
      </div>
    </section>
  );
}

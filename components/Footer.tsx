const contactEmail = "danahwebsolutions@gmail.com";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0d0f12]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <a
          className="text-sm font-extrabold text-white"
          href="#home"
          aria-label="Danah Web Solutions home"
        >
          Danah Web Solutions
        </a>
        <nav
          aria-label="Footer contact links"
          className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-white/65"
        >
          <a
            className="transition-colors hover:text-white"
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            className="transition-colors hover:text-white"
            href={`mailto:${contactEmail}`}
          >
            Email
          </a>
          <a
            className="transition-colors hover:text-white"
            href="tel:+918279271587"
          >
            Phone
          </a>
        </nav>
        <p className="text-xs text-white/45">
          © {new Date().getFullYear()} Danah Web Solutions. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";

export default function Footer() {
  const phone = process.env.CONTACT_PHONE || "802-318-0835";

  return (
    <footer className="bg-green-800 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg mb-3">Amy&apos;s Finds</h3>
            <p className="text-sm text-green-200 leading-relaxed">
              Curated antique furniture from Vermont. Each piece tells a story
              and carries the warmth of history.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-green-300 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-green-200">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-green-300 mb-3">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-green-200">
              <li>
                <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </li>
              <li>Vermont, USA</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-green-700 mt-8 pt-6 text-center text-xs text-green-300">
          &copy; {new Date().getFullYear()} Amy&apos;s Finds. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

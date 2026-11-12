import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const notes = [
  ['01', 'Report a site with a photo and a location'],
  ['02', 'Follow the status until the cleanup is verified'],
  ['03', 'Collect points for reports that are confirmed'],
];

export default function AuthShell({ title, subtitle, children, footer, eyebrow }) {
  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-forest-900 p-12 lg:flex lg:flex-col xl:p-16">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/media/hero.mp4"
          poster="/media/hero-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/55 to-forest-900/20" />

        <div className="relative z-10">
          <Logo tone="light" />
        </div>

        <div className="relative z-10 mt-auto max-w-md">
          <h2 className="mt-5 font-display text-[clamp(1.9rem,2.8vw,2.6rem)] font-normal leading-[1.05] text-white">
            Every report has a record, a team and an outcome.
          </h2>

          <dl className="mt-9 space-y-4 border-t border-white/15 pt-6">
            {notes.map(([index, note]) => (
              <div key={index} className="flex gap-4">
                <dt className="tabular text-[13px] text-white/40">{index}</dt>
                <dd className="text-[13px] leading-relaxed text-white/70">{note}</dd>
              </div>
            ))}
          </dl>

          <Link
            to="/"
            className="mt-9 inline-block text-[13px] text-white/50 underline-offset-4 transition hover:text-white hover:underline"
          >
            Back to the home page
          </Link>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
          <Logo />
          <Link to="/" className="text-[13px] text-ink-muted transition hover:text-ink">
            Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[400px]"
          >
            {eyebrow && (
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">{eyebrow}</p>
            )}
            <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subtitle}</p>

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-6 text-[13px] text-ink-muted">{footer}</div>}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

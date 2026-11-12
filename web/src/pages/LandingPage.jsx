import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Download, Menu, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/button';
import useAuthStore from '../store/authStore';

const roleLanding = {
  admin: '/admin',
  field_agent: '/agent',
  organization: '/org',
  citizen: '/citizen',
};

const navigation = [
  { label: 'Platform', href: '#platform' },
  { label: 'Process', href: '#process' },
  { label: 'Rewards', href: '#rewards' },
  { label: 'For agencies', href: '#agencies' },
];

const process = [
  {
    step: '01',
    title: 'A citizen reports a site',
    body: 'Photo, location, waste type and severity. The report is classified and queued for the agency that covers the area.',
    meta: 'Citizen submits',
  },
  {
    step: '02',
    title: 'An agency assigns a crew',
    body: 'The team triages the queue, picks a field agent and records the priority. Assignment and status changes are timestamped.',
    meta: 'Agency decides',
  },
  {
    step: '03',
    title: 'The cleanup is verified',
    body: 'The site is marked resolved only after inspection. The citizen is notified and points move into their ledger.',
    meta: 'Verified on site',
  },
];

const capabilities = [
  {
    title: 'Photo and location on every record',
    body: 'No report exists without an image and coordinates, so crews know exactly what they are walking into.',
  },
  {
    title: 'Hotspot detection',
    body: 'Reports that cluster become a hotspot with a risk score, which turns repeated complaints into a planned intervention.',
  },
  {
    title: 'Assignment with ownership',
    body: 'One assigned field agent, one visible queue and a record of who changed what and when.',
  },
  {
    title: 'Status history',
    body: 'Every transition from pending to resolved is stored against the report and never rewritten.',
  },
  {
    title: 'Notifications for both sides',
    body: 'Citizens and crews are informed at each stage instead of chasing updates through phone calls.',
  },
  {
    title: 'Points and rewards',
    body: 'Reports earn points, verified reports earn more, and published rewards can be redeemed from the ledger.',
  },
];

const rewardsRows = [
  ['Report submitted', 'Points are credited to your ledger'],
  ['Report verified', 'Additional points on confirmation'],
  ['Reward redeemed', 'Subject to availability'],
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const dashboardLink = token ? roleLanding[user?.role] || '/citizen' : null;
  const motionProps = reduced
    ? {}
    : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } };

  return (
    <div className="min-h-screen bg-surface">
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          scrolled || menuOpen ? 'border-b border-line bg-surface/95 backdrop-blur' : 'bg-transparent'
        }`}
      >
        <div className="container flex h-16 items-center justify-between gap-4 lg:h-[72px]">
          <Logo tone={scrolled || menuOpen ? 'dark' : 'light'} />

          <nav className="hidden items-center gap-7 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-[13px] font-medium transition-colors ${
                  scrolled ? 'text-ink-muted hover:text-ink' : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {dashboardLink ? (
              <Button asChild variant={scrolled ? 'default' : 'light'} size="sm">
                <Link to={dashboardLink}>Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className={scrolled ? '' : 'text-white hover:bg-white/10 hover:text-white'}>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild variant="accent" size="sm">
                  <Link to="/register">
                    Get started
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className={`grid h-9 w-9 place-items-center rounded-md border lg:hidden ${
              scrolled || menuOpen ? 'border-line text-ink' : 'border-white/20 text-white'
            }`}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-line bg-surface px-5 pb-6 pt-2 lg:hidden">
            <nav className="flex flex-col divide-y divide-line">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm font-medium text-ink"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              {dashboardLink ? (
                <Button asChild>
                  <Link to={dashboardLink}>Open dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button asChild variant="accent">
                    <Link to="/register">Get started</Link>
                  </Button>
                </>
              )}
              <Button asChild variant="ghost">
                <a href="/downloads/EcoSenseAI.apk">
                  <Download className="h-4 w-4" />
                  Download the Android app
                </a>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative flex min-h-[640px] items-end overflow-hidden bg-forest-900 pb-12 pt-32 sm:min-h-[720px] lg:min-h-[88vh] lg:pb-16">
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
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/45 to-forest-900/10" />

          <div className="container relative z-10">
            <motion.div {...motionProps} className="max-w-3xl">
              <h1 className="mt-6 font-display text-[clamp(2.9rem,7vw,5.6rem)] font-normal leading-[0.95] tracking-[-0.02em] text-white">
                Cleaner streets,
                <br />
                on the record.
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
                EcoSense AI connects the people who spot waste with the teams responsible for clearing it. Every
                report keeps its photo, its location and its history until the site is verified.
              </p>

              <div className="mt-9 flex flex-col gap-2.5 sm:flex-row">
                <Button asChild size="lg" variant="accent">
                  <Link to={dashboardLink || '/register'}>
                    {dashboardLink ? 'Open your dashboard' : 'Report a site'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/25 text-white hover:border-white/50 hover:bg-white/10"
                >
                  <Link to={dashboardLink || '/login'}>Agency sign in</Link>
                </Button>
              </div>
            </motion.div>

            <div className="mt-14 grid grid-cols-1 gap-6 border-t border-white/15 pt-6 sm:grid-cols-3 sm:gap-8">
              {[
                ['Photo and location', 'attached to every report'],
                ['Status history', 'visible to the reporter'],
                ['Points', 'credited and redeemable'],
              ].map(([value, label]) => (
                <div key={value}>
                  <p className="text-sm font-medium text-white">{value}</p>
                  <p className="mt-0.5 text-[13px] text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="container grid gap-8 py-16 sm:grid-cols-[240px_1fr] sm:py-20">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-muted">The gap</p>
            <div>
              <h2 className="max-w-3xl font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-normal leading-[1.1] tracking-[-0.01em]">
                Waste is reported in minutes and cleared in weeks. The delay is coordination, not effort.
              </h2>
              <div className="mt-8 grid max-w-3xl gap-6 text-sm leading-relaxed text-ink-muted sm:grid-cols-2">
                <p>
                  Most reporting tools stop at a form submission. The report lands in an inbox that no one owns, and
                  the citizen has no way to know whether anything happened.
                </p>
                <p>
                  EcoSense AI treats every report as a case with an owner, a status and a history. Citizens can see
                  progress. Agencies can prove it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-20 border-b border-line">
          <div className="container py-16 sm:py-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <h2 className="max-w-xl text-[clamp(1.6rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight">
                From a photo to a verified cleanup
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
                Three stages, one record. Nothing is re-created in a spreadsheet or lost in a chat thread.
              </p>
            </div>

            <div className="mt-12 divide-y divide-line border-t border-line">
              {process.map((item) => (
                <div key={item.step} className="grid gap-3 py-7 sm:grid-cols-[80px_1fr_180px] sm:gap-8">
                  <p className="tabular text-sm text-ink-muted">{item.step}</p>
                  <div>
                    <h3 className="text-lg font-medium">{item.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{item.body}</p>
                  </div>
                  <p className="text-[13px] text-ink-muted sm:text-right">{item.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="scroll-mt-20 border-b border-line">
          <div className="container py-16 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-muted">Platform</p>
                <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight">
                  Built for the work after the report
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
                  The platform covers triage, assignment, field updates and verification, with a shared record for
                  citizens, agents, organizations and administrators.
                </p>
              </div>

              <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {capabilities.map((item) => (
                  <div key={item.title} className="border-t border-line pt-4">
                    <h3 className="text-[15px] font-medium">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="agencies" className="scroll-mt-20 border-b border-line bg-bone">
          <div className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-muted">For agencies</p>
              <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight">
                An operations view, not a complaints inbox
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
                Triage by status and severity, assign field agents, watch hotspots and close cases with a complete
                audit trail. The dashboard is designed for daily operations, not for a demo.
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6">
                {[
                  ['Citizens', 'Report and follow'],
                  ['Field agents', 'Start and resolve'],
                  ['Organizations', 'Coordinate coverage'],
                  ['Administrators', 'Manage access'],
                ].map(([term, detail]) => (
                  <div key={term}>
                    <dt className="text-[13px] font-medium">{term}</dt>
                    <dd className="mt-0.5 text-[13px] text-ink-muted">{detail}</dd>
                  </div>
                ))}
              </dl>

              <Button asChild className="mt-8">
                <Link to="/login">Open the agency dashboard</Link>
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-line bg-white p-2">
              <img
                src="/media/dashboard.png"
                alt="EcoSense AI operations dashboard showing report metrics and waste type breakdown"
                className="w-full rounded-lg border border-line"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <section id="rewards" className="scroll-mt-20 border-b border-line">
          <div className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-muted">Rewards</p>
              <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight">
                Points that follow the work
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
                Reports earn points, and confirmed cleanups earn more. Points sit in a ledger that you can see, and
                published rewards can be redeemed from the citizen portal while stock is available.
              </p>
              <Button asChild variant="outline" className="mt-8">
                <Link to="/register">Create a citizen account</Link>
              </Button>
            </div>

            <div className="divide-y divide-line border-y border-line">
              {rewardsRows.map(([label, note]) => (
                <div key={label} className="flex items-baseline justify-between gap-6 py-5">
                  <p className="text-[15px] font-medium">{label}</p>
                  <p className="max-w-[220px] text-right text-[13px] text-ink-muted">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-forest-900 text-white">
          <div className="container flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-end sm:py-20">
            <div>
              <h2 className="max-w-lg font-display text-[clamp(2rem,4vw,3.1rem)] font-normal leading-[1.02]">
                Start with the street outside your door.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
                Create an account, report one site and follow it until it is closed.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
              <Button asChild variant="accent" size="lg">
                <Link to={dashboardLink || '/register'}>Create an account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 text-white hover:border-white/50 hover:bg-white/10"
              >
                <Link to={dashboardLink || '/login'}>Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface">
        <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ink-muted">
              Waste reporting and cleanup operations. Report a site, assign a team, verify the cleanup and keep the
              record.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Product</p>
            <div className="mt-3 space-y-2.5 text-[13px]">
              <a href="#platform" className="block text-ink-muted transition hover:text-ink">Platform</a>
              <a href="#process" className="block text-ink-muted transition hover:text-ink">Process</a>
              <a href="#rewards" className="block text-ink-muted transition hover:text-ink">Rewards</a>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Access</p>
            <div className="mt-3 space-y-2.5 text-[13px]">
              <Link to="/register" className="block text-ink-muted transition hover:text-ink">Create account</Link>
              <Link to="/login" className="block text-ink-muted transition hover:text-ink">Sign in</Link>
              <a href="/downloads/EcoSenseAI.apk" className="block text-ink-muted transition hover:text-ink">Android app</a>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Contact</p>
            <div className="mt-3 space-y-2.5 text-[13px]">
              <a href="mailto:hello@ecosense.ai" className="block text-ink-muted transition hover:text-ink">hello@ecosense.ai</a>
              <p className="text-ink-muted">Nairobi, Kenya</p>
            </div>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="container flex flex-col items-start justify-between gap-2 py-5 text-[12px] text-ink-muted sm:flex-row sm:items-center">
            <p>EcoSense AI. All rights reserved.</p>
            <p>Privacy, terms and data handling available on request.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

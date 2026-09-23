export const metadata = {
  title: 'HVAC Service Near You | NeighborCoverage',
  description:
    'Get connected with a local HVAC technician today. NeighborCoverage makes it easy — one call gets you vetted HVAC help in your area.',
};

const PHONE_DISPLAY = '(888) 813-9665';
const PHONE_HREF = 'tel:+18888139665';

function HouseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function PhoneIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
          light ? 'bg-white/10 text-white' : 'bg-[#1B2A4A] text-white'
        }`}
      >
        <HouseIcon className="h-5 w-5" />
      </span>
      <span
        className={`text-xl font-extrabold tracking-tight ${
          light ? 'text-white' : 'text-[#1B2A4A]'
        }`}
      >
        Neighbor<span className="text-[#E07820]">Coverage</span>
      </span>
    </div>
  );
}

export default function HvacPage() {
  return (
    <main className="min-h-screen bg-white text-[#1B2A4A]">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Wordmark />
          <a
            href={PHONE_HREF}
            data-cta-location="hvac_header"
            className="hidden items-center gap-2 rounded-full bg-[#E07820] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#c9691a] sm:inline-flex"
          >
            <PhoneIcon className="h-4 w-4" />
            {PHONE_DISPLAY}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-[#E07820]">
              Local HVAC Specialists Standing By
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Expert HVAC Service In Your Neighborhood
            </h1>
            <p className="mt-6 text-lg text-white/80 sm:text-xl">
              AC not working? Furnace issues? Our local HVAC specialists are
              standing by. One call connects you to vetted technicians ready to
              help today.
            </p>
            <div className="mt-8">
              <a
                href={PHONE_HREF}
                data-cta-location="hvac_hero"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#E07820] px-8 py-5 text-xl font-extrabold text-white shadow-lg transition hover:bg-[#c9691a] sm:w-auto"
              >
                <PhoneIcon className="h-6 w-6" />
                Call {PHONE_DISPLAY}
              </a>
            </div>

            {/* Trust signals */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                'Licensed Technicians',
                'Same-Day Service Available',
                'No Cost to Connect',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm font-semibold text-white/90"
                >
                  <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#E07820] text-white">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Call',
                desc: 'Tap the button and call our line. It only takes a moment to get started.',
              },
              {
                step: '2',
                title: 'Get Matched',
                desc: 'We connect you with a vetted local HVAC technician in your area.',
              },
              {
                step: '3',
                title: 'Service Completed',
                desc: 'Your technician diagnoses the issue and gets your system running right.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-8 text-center shadow-sm"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1B2A4A] text-2xl font-extrabold text-white">
                  {s.step}
                </div>
                <h3 className="mt-6 text-xl font-bold text-[#1B2A4A]">
                  {s.title}
                </h3>
                <p className="mt-3 text-[#374151]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Second CTA */}
      <section className="bg-[#F9FAFB] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1B2A4A] sm:text-4xl">
            Ready for Fast HVAC Help?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#374151]">
            Don&apos;t wait in the heat or the cold. Connect with a local HVAC
            specialist now.
          </p>
          <div className="mt-8">
            <a
              href={PHONE_HREF}
              data-cta-location="hvac_bottom"
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#E07820] px-8 py-5 text-xl font-extrabold text-white shadow-lg transition hover:bg-[#c9691a] sm:w-auto"
            >
              <PhoneIcon className="h-6 w-6" />
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B2A4A] py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
          <Wordmark light />
          <p className="text-sm text-white/70">
            © 2025 NeighborCoverage. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Sticky mobile CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#1B2A4A] p-3 shadow-2xl sm:hidden">
        <a
          href={PHONE_HREF}
          data-cta-location="hvac_sticky"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E07820] px-6 py-4 text-lg font-extrabold text-white"
        >
          <PhoneIcon className="h-5 w-5" />
          Call Now
        </a>
      </div>
    </main>
  );
}

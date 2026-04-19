import Topbar from "@/components/layout/Topbar";

type Props = {
  panelLabel: string;
  panelTitle: string;
  panelDescription: string;
  panelPoints: string[];
  formLabel: string;
  formTitle: string;
  formDescription?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export default function AuthShell({
  panelLabel,
  panelTitle,
  panelDescription,
  panelPoints,
  formLabel,
  formTitle,
  formDescription,
  children,
  footer,
}: Props) {
  return (
    <div className="min-h-screen bg-[#fbf9f5]">
      <Topbar
        navLinks={[
          { href: "/", label: "Home" },
          { href: "/explore", label: "Explore" },
          { href: "/leaderboard", label: "Leaderboard" },
        ]}
      />

      <main className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto grid w-full max-w-[1100px] gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Left dark panel */}
          <section
            className="order-2 rounded-[28px] border border-[#1a3530] bg-[#17302E] px-8 py-10 text-white shadow-[0_24px_56px_rgba(23,48,46,0.18)] lg:order-1 lg:px-10 lg:py-12"
            style={{
              backgroundImage:
                "radial-gradient(circle at top right, rgba(16,185,129,0.14), transparent 28%), radial-gradient(circle at bottom left, rgba(0,108,73,0.06), transparent 36%)",
            }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6ffbbe] mb-6"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {panelLabel}
            </p>
            <h1
              className="max-w-[480px] text-[2.8rem] font-extrabold leading-[1.0] tracking-[-0.04em] sm:text-[3.8rem]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {panelTitle}
            </h1>
            <p
              className="mt-5 max-w-[460px] text-[14px] leading-[1.7] text-white/65"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {panelDescription}
            </p>

            <ul className="mt-8 space-y-4">
              {panelPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-[14px] leading-[1.6] text-white/72"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#4edea3]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-[18px] border border-white/10 bg-white/[0.06] p-5">
              <p
                className="text-sm font-semibold text-white"
                style={{ fontFamily: "var(--font-headline)" }}
              >HelpHub AI</p>
              <p
                className="mt-2 text-[13px] leading-[1.6] text-white/55"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Multi-page help requests, trust signals, messaging, notifications, and AI guidance in one product flow.
              </p>
            </div>
          </section>

          {/* Right form panel */}
          <section className="order-1 rounded-[28px] border border-[#d7e6e0] bg-white px-7 py-8 shadow-[0_16px_48px_rgba(27,28,26,0.07)] lg:order-2 lg:px-9 lg:py-10">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#006c49] mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {formLabel}
            </p>
            <h2
              className="max-w-[420px] text-[2.2rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#1b1c1a] sm:text-[3rem]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              {formTitle}
            </h2>
            {formDescription ? (
              <p
                className="mt-3 max-w-[420px] text-[13px] leading-[1.6] text-[#54615d]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {formDescription}
              </p>
            ) : null}

            <div className="mt-7">{children}</div>

            <div className="mt-6 border-t border-[#efeeea] pt-5 text-[13px] text-[#54615d]" style={{ fontFamily: "var(--font-body)" }}>
              {footer}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#d7e6e0] py-5 px-6">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-[#6c7a71]" style={{ fontFamily: "var(--font-body)" }}>
            &copy; 2026 HelpHub AI. The Digital Sanctuary.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Community Guidelines"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs text-[#6c7a71] no-underline hover:text-[#006c49]"
                style={{ fontFamily: "var(--font-body)" }}
              >{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

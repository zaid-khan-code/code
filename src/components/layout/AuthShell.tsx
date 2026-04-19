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
    <div className="min-h-screen">
      <Topbar
        navLinks={[
          { href: "/", label: "Home" },
          { href: "/explore", label: "Explore" },
          { href: "/leaderboard", label: "Leaderboard" },
        ]}
      />

      <main className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <section
            className="order-2 rounded-[30px] border border-[#20403B] bg-[#17302E] px-7 py-8 text-white shadow-[0_24px_56px_rgba(23,48,46,0.16)] lg:order-1 lg:px-10 lg:py-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at top right, rgba(242,182,72,0.18), transparent 24%)",
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#93D7CB]">
              {panelLabel}
            </p>
            <h1 className="mt-5 max-w-[520px] text-[2.6rem] font-black leading-[0.94] tracking-[-0.05em] sm:text-[4rem]">
              {panelTitle}
            </h1>
            <p className="mt-5 max-w-[520px] text-base leading-8 text-white/72">
              {panelDescription}
            </p>

            <ul className="mt-8 space-y-4">
              {panelPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-base leading-7 text-white/78">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#24C9B0]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-[22px] border border-white/10 bg-white/6 p-5">
              <p className="text-sm font-semibold text-white">HelpHub AI</p>
              <p className="mt-2 text-sm leading-6 text-white/66">
                Multi-page help requests, trust signals, messaging, notifications, and AI guidance in one product flow.
              </p>
            </div>
          </section>

          <section className="order-1 rounded-[30px] border border-[#E7DED2] bg-white/96 px-6 py-7 shadow-[0_24px_56px_rgba(28,25,23,0.08)] lg:order-2 lg:px-8 lg:py-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#245D51]">
              {formLabel}
            </p>
            <h2 className="mt-4 max-w-[460px] text-[2.3rem] font-black leading-[0.98] tracking-[-0.05em] text-[#171717] sm:text-[3.4rem]">
              {formTitle}
            </h2>
            {formDescription ? (
              <p className="mt-4 max-w-[460px] text-sm leading-7 text-[#655F57]">
                {formDescription}
              </p>
            ) : null}

            <div className="mt-8">{children}</div>

            <div className="mt-7 border-t border-[#F2ECE4] pt-6 text-sm text-[#655F57]">
              {footer}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { EduFooter, LanguageToggle, useEduLang } from "@/lib/edumindUi";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { lang, setLang, dir } = useEduLang();

  return (
    <main className="em-auth-page" dir={dir}>
      <div className="em-bg-orb em-orb-one" />
      <div className="em-bg-orb em-orb-two" />

      <section className="em-auth-shell em-login-shell">
        <nav className="em-auth-nav">
          <Link to="/" className="em-auth-logo">
            EduMind
          </Link>
          <div className="em-auth-nav-actions">
            <LanguageToggle lang={lang} setLang={setLang} />
            <Link to="/select-role" className="em-auth-nav-link">
              Choose role
            </Link>
          </div>
        </nav>

        <div className="em-login-card em-page-enter">
          <div className="em-form-header">
            <span>EduMind</span>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>

        <EduFooter lang={lang} />
      </section>
    </main>
  );
}

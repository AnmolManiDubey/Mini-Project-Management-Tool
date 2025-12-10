import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const onProjectsPage = location.pathname === "/";

  return (
    <div className="app-shell">
      {/* Top navigation bar */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">PM</div>
          <div>
            <div className="app-title">Project Manager</div>
            <div className="app-subtitle">Organization: KAV Associates</div>
          </div>
        </div>

        <nav className="app-nav">
          <Link
            to="/"
            className={`app-nav-link ${onProjectsPage ? "active" : ""}`}
          >
            Projects
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="app-main">{children}</main>
    </div>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import { Menu, Home, List, Plus, PieChart } from "lucide-react";
import type { ReactNode } from "react";
import avatarUrl from "@/assets/avatar.jpg";

interface Props {
  children: ReactNode;
  title?: string;
  showMenu?: boolean;
  header?: ReactNode;
}

export function AppShell({ children, title = "Financial Serenity", showMenu = true, header }: Props) {
  const loc = useLocation();
  const path = loc.pathname;

  return (
    <div className="app-frame">
      {header ?? (
        <header className="app-header">
          <div className="left">
            {showMenu && (
              <button className="icon-btn" aria-label="Menu">
                <Menu size={20} />
              </button>
            )}
            <h1>{title}</h1>
          </div>
        <div className="avatar" aria-label="Profile">
          <img src={avatarUrl} alt="Profile" width={36} height={36} loading="lazy" />
        </div>
        </header>
      )}
      <main className="fade-in">{children}</main>
      <nav className="bottom-nav">
        <Link to="/" className={path === "/" ? "active" : ""}>
          <Home size={18} />
          Home
        </Link>
        <Link to="/transactions" className={path === "/transactions" ? "active" : ""}>
          <List size={18} />
          Activity
        </Link>
        <Link to="/add" className="add">
          <Plus size={20} />
          Add
        </Link>
        <Link to="/analytics" className={path === "/analytics" ? "active" : ""}>
          <PieChart size={18} />
          Stats
        </Link>
      </nav>
    </div>
  );
}
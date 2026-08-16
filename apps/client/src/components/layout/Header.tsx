import "./Header.css";
import { useEffect, useState } from "react";
import { NavLink, useLocation, type NavLinkRenderProps } from "react-router-dom";
import { ChevronDown, ChevronRight, Menu, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { navItems } from "@/data/nav";
import { BrandMark } from "./BrandMark";

export function Header() {
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    setMobileExpanded(null);
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!openDropdown) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenDropdown(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openDropdown]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="nav-item-dropdown"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  className={[item.to, ...item.children.map((child) => child.to)].some((to) => location.pathname === to) ? "nav-link active" : "nav-link"}
                  aria-expanded={openDropdown === item.label}
                  onClick={() => setOpenDropdown((value) => (value === item.label ? null : item.label))}
                >
                  {item.label} <ChevronDown size={13} className={openDropdown === item.label ? "nav-caret nav-caret--open" : "nav-caret"} />
                </button>
                {openDropdown === item.label && (
                  <div className="nav-dropdown-panel" role="menu">
                    {item.children.map((child) => (
                      <NavLink key={child.to} to={child.to} className={({ isActive }: NavLinkRenderProps) => (isActive ? "active" : "")} role="menuitem">
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }: NavLinkRenderProps) => (isActive ? "nav-link active" : "nav-link")}
              >
                {item.label}
              </NavLink>
            )
          )}
          <NavLink
            to="/contact"
            className={({ isActive }: NavLinkRenderProps) => (isActive ? "nav-link active" : "nav-link")}
          >
            Contact
          </NavLink>
        </nav>
        <div className="header-actions">
          <Link to="/contact" className="button button--small button--primary">Speak to an advisor <ArrowRight size={15} /></Link>
          <button className="mobile-menu-button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="mobile-nav">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label} className="mobile-nav-group">
                <button
                  type="button"
                  className="mobile-nav-group-trigger"
                  aria-expanded={mobileExpanded === item.label}
                  onClick={() => setMobileExpanded((value) => (value === item.label ? null : item.label))}
                >
                  {item.label}
                  <ChevronDown size={18} className={mobileExpanded === item.label ? "nav-caret nav-caret--open" : "nav-caret"} />
                </button>
                {mobileExpanded === item.label && (
                  <div className="mobile-nav-subgroup">
                    {item.children.map((child) => (
                      <NavLink key={child.to} to={child.to}>{child.label}<ChevronRight size={16} /></NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.to === "/"}>{item.label}<ChevronRight size={18} /></NavLink>
            )
          )}
          <NavLink to="/contact">Contact<ChevronRight size={18} /></NavLink>
          <Link to="/contact" className="button button--primary">Choose why you’re here <ArrowRight size={16} /></Link>
        </div>
      )}
    </header>
  );
}

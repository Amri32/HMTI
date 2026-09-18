"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import SidebarAdmin, { MODUL } from "@/components/admin/SidebarAdmin";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentModule =
    MODUL.find((modul) => modul.href === pathname)?.label ?? "Panel admin";

  return (
    <div className={`admin-shell ${collapsed ? "is-collapsed" : ""}`}>
      <SidebarAdmin
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />
      {mobileOpen ? (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Tutup menu navigasi"
        />
      ) : null}

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-context">
            <p className="admin-topbar-kicker">HMTI / Ruang kerja</p>
            <p className="admin-topbar-title">{currentModule}</p>
          </div>
          <div className="admin-topbar-actions">
            <button
              type="button"
              className="admin-topbar-open"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="admin-sidebar"
              aria-label="Buka menu navigasi"
            >
              <span className="admin-toggle-icon" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}

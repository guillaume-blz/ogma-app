import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { MenuItem } from "@/components/MenuItem";
import { MenuTitle } from "@/components/MenuTitle";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { useTabStore } from "@/stores/tabStore";
import { useCommandPaletteStore } from "@/stores/commandPaletteStore";
import { navigation } from "@/app/navigation";
import { SidebarSourcesSection } from "@/layouts/SidebarSourcesSection";

export function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const addTab = useTabStore((s) => s.addTab);
  const openPalette = useCommandPaletteStore((s) => s.toggle);

  const handleNavClick = (id: string, path: string) => {
    addTab({ id, path });
    navigate(path);
  };

  return (
    <div className="flex flex-col h-full">
      <nav className="flex flex-col gap-0.5 p-2 overflow-y-auto flex-1">
        {navigation.map((section, i) => (
          <div key={i}>
            {section.titleKey && <MenuTitle label={t(section.titleKey)} />}
            {section.items.map((item) =>
              item.id === "sources" ? (
                <SidebarSourcesSection key={item.id} label={t(item.labelKey)} />
              ) : (
                <MenuItem
                  key={item.id}
                  icon={item.icon}
                  label={t(item.labelKey)}
                  active={location.pathname === item.path}
                  onClick={() => handleNavClick(item.id, item.path)}
                />
              )
            )}
            {i === 0 && (
              <MenuItem
                icon={Search}
                label={t("nav.search")}
                onClick={openPalette}
              />
            )}
          </div>
        ))}
      </nav>
      <WorkspaceSwitcher />
    </div>
  );
}

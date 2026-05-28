import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MenuItem } from "@/components/MenuItem";
import { MenuTitle } from "@/components/MenuTitle";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { useTabStore } from "@/stores/tabStore";
import { navigation } from "@/app/navigation";

export function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const addTab = useTabStore((s) => s.addTab);

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
            {section.items.map((item) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={t(item.labelKey)}
                active={location.pathname === item.path}
                onClick={() => handleNavClick(item.id, item.path)}
              />
            ))}
          </div>
        ))}
      </nav>
      <WorkspaceSwitcher />
    </div>
  );
}

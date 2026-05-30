import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { WorkspaceCard } from "@/components/WorkspaceCard";
import { navigation } from "@/app/navigation";
import { useTabStore } from "@/stores/tabStore";
import { useSourcesQuery } from "@/features/sources/hooks/useSourcesQuery";
import type { NavItem } from "@/app/navigation";

const SUMMARY_SECTIONS = navigation.filter(
  (s) => s.titleKey && s.titleKey !== "section.settings"
);

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addTab = useTabStore((s) => s.addTab);
  const { data: sources = [] } = useSourcesQuery();

  const counts: Record<string, number> = {
    sources: sources.length,
  };

  const handleNavigate = (item: NavItem) => {
    addTab({ id: item.id, path: item.path });
    navigate(item.path);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title={t("workspace.title")} subtitle={t("workspace.plan")} />
      <div className="flex flex-col gap-8">
        {SUMMARY_SECTIONS.map((section) => (
          <div key={String(section.titleKey)}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(section.titleKey!)}
            </h2>
            <div className="flex flex-col gap-1.5">
              {section.items.map((item) => (
                <WorkspaceCard
                  key={item.id}
                  icon={item.icon}
                  label={t(item.labelKey)}
                  count={counts[item.id] ?? 0}
                  onClick={() => handleNavigate(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

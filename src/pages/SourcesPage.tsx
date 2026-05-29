import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SourceTable } from "@/features/sources/components/SourceTable";
import { SourceDrawer } from "@/features/sources/components/SourceDrawer";
import { useSourceStore } from "@/features/sources/store";
import { useTabStore } from "@/stores/tabStore";
import type { Source } from "@/features/sources/types";

export function SourcesPage() {
  const { t } = useTranslation();
  const { sources, loading, fetchSources, deleteSource, testSource } = useSourceStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editSource, setEditSource] = useState<Source | undefined>();
  const navigate = useNavigate();
  const addTab = useTabStore((s) => s.addTab);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  const handleOpen = (source: Source) => {
    addTab({ id: `source-${source.id}`, path: `/sources/${source.id}`, label: source.name });
    navigate(`/sources/${source.id}`);
  };

  const handleEdit = (source: Source) => {
    setEditSource(source);
    setDrawerOpen(true);
  };

  const handleNew = () => {
    setEditSource(undefined);
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setEditSource(undefined);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("nav.sources")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("sources.subtitle")}
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
          {t("sources.new")}
        </button>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">{t("sources.loading")}</p>
      )}

      {!loading && sources.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <p className="text-sm">{t("sources.empty")}</p>
        </div>
      )}

      {!loading && sources.length > 0 && (
        <SourceTable
          sources={sources}
          onOpen={handleOpen}
          onEdit={handleEdit}
          onDelete={deleteSource}
          onTest={testSource}
        />
      )}

      <SourceDrawer
        open={drawerOpen}
        onClose={handleClose}
        source={editSource}
      />
    </div>
  );
}

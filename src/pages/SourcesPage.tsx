import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SourceCard } from "@/features/sources/components/SourceCard";
import { SourceDrawer } from "@/features/sources/components/SourceDrawer";
import { useSourceStore } from "@/features/sources/store";
import type { Source } from "@/features/sources/types";

export function SourcesPage() {
  const { t } = useTranslation();
  const { sources, loading, fetchSources, deleteSource, testSource } = useSourceStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editSource, setEditSource] = useState<Source | undefined>();

  useEffect(() => { fetchSources(); }, [fetchSources]);

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
    <div className="max-w-3xl">
      <div className="mb-6 flex items-start justify-between border-b border-border pb-6">
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

      <div className="grid gap-3 sm:grid-cols-2">
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            onEdit={handleEdit}
            onDelete={deleteSource}
            onTest={testSource}
          />
        ))}
      </div>

      <SourceDrawer
        open={drawerOpen}
        onClose={handleClose}
        source={editSource}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SourceTable } from "@/features/sources/components/SourceTable";
import { SourceDrawer } from "@/features/sources/components/SourceDrawer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSourcesQuery } from "@/features/sources/hooks/useSourcesQuery";
import { useSourceStore } from "@/features/sources/store";
import { useTabStore } from "@/stores/tabStore";
import type { Source } from "@/features/sources/types";

export function SourcesPage() {
  const { t } = useTranslation();
  const { data: sources = [], isLoading } = useSourcesQuery();
  const { deleteSource, testSource } = useSourceStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editSource, setEditSource] = useState<Source | undefined>();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const addTab = useTabStore((s) => s.addTab);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setDrawerOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleOpen = (source: Source) => {
    addTab({ id: `source-${source.id}`, path: `/sources/${source.id}`, label: source.name });
    navigate(`/sources/${source.id}`);
  };

  const handleEdit = (source: Source) => {
    addTab({ id: `source-${source.id}`, path: `/sources/${source.id}`, label: source.name });
    navigate(`/sources/${source.id}?tab=settings`);
  };

  const handleDeleteConfirm = () => {
    if (pendingDeleteId) deleteSource(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("nav.sources")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("sources.subtitle")}</p>
        </div>
        <button
          onClick={() => { setEditSource(undefined); setDrawerOpen(true); }}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
          {t("sources.new")}
        </button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">{t("sources.loading")}</p>
      )}

      {!isLoading && sources.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <p className="text-sm">{t("sources.empty")}</p>
        </div>
      )}

      {!isLoading && sources.length > 0 && (
        <SourceTable
          sources={sources}
          onOpen={handleOpen}
          onEdit={handleEdit}
          onDelete={setPendingDeleteId}
          onTest={testSource}
        />
      )}

      <SourceDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditSource(undefined); }}
        source={editSource}
      />

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete source"
        description={`"${sources.find((s) => s.id === pendingDeleteId)?.name}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}

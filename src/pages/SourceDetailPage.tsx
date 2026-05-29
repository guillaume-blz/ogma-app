import { useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SourceTypeIcon } from "@/features/sources/components/SourceTypeIcon";
import { SourceDetailTabs, type DetailTab } from "@/features/sources/components/detail/SourceDetailTabs";
import { OverviewTab } from "@/features/sources/components/detail/OverviewTab";
import { TablesTab } from "@/features/sources/components/detail/TablesTab";
import { DataTab } from "@/features/sources/components/detail/DataTab";
import { SchemaTab } from "@/features/sources/components/detail/SchemaTab";
import { SettingsTab } from "@/features/sources/components/detail/SettingsTab";
import { useSourceStore } from "@/features/sources/store";

const VALID_TABS: DetailTab[] = ["overview", "tables", "data", "schema", "settings"];

export function SourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sources, loading, fetchSources } = useSourceStore();

  useEffect(() => { fetchSources(); }, [fetchSources]);

  const source = sources.find((s) => s.id === id);
  const rawTab = searchParams.get("tab") ?? "overview";
  const activeTab: DetailTab = VALID_TABS.includes(rawTab as DetailTab)
    ? (rawTab as DetailTab)
    : "overview";

  if (loading && !source) return (
    <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> Loading…
    </div>
  );

  if (!loading && !source) {
    navigate("/sources", { replace: true });
    return null;
  }

  if (!source) return null;

  const changeTab = (tab: DetailTab) =>
    setSearchParams(tab === "overview" ? {} : { tab });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <button
          type="button"
          onClick={() => navigate("/sources")}
          className="flex items-center justify-center size-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Back to sources"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex size-8 items-center justify-center rounded-md border border-border bg-background">
          <SourceTypeIcon type={source.source_type} className="size-4 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight text-foreground">{source.name}</h1>
          <p className="text-xs text-muted-foreground capitalize">{source.source_type}</p>
        </div>
      </div>

      <SourceDetailTabs active={activeTab} onChange={changeTab} />

      <div>
        {activeTab === "overview"  && <OverviewTab source={source} />}
        {activeTab === "tables"    && <TablesTab sourceId={source.id} />}
        {activeTab === "data"      && <DataTab sourceId={source.id} />}
        {activeTab === "schema"    && <SchemaTab sourceId={source.id} />}
        {activeTab === "settings"  && <SettingsTab source={source} />}
      </div>
    </div>
  );
}

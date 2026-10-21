import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, useApi } from "../api";
import { PluginCard } from "./PluginCard";
import type { PluginRead, APIResponse, PaginatedResponse } from "../api/types";

export function PluginList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, error, loading, refetch } = useApi<APIResponse<PaginatedResponse<PluginRead>>>(() =>
    api.listPlugins({ page, page_size: 12, search: debouncedSearch, category: category || undefined })
  );
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    "development",
    "testing",
    "security",
    "infrastructure",
    "documentation",
    "code-review",
    "data",
    "ml-ops",
  ];

  if (loading && !data) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="card-body space-y-4">
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                <div className="h-6 bg-slate-200 rounded-full w-28"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3 className="text-lg font-medium text-slate-700 mb-1">Failed to load plugins</h3>
        <p className="text-slate-500 mb-4">{error.message}</p>
        <button className="btn btn-primary" onClick={refetch}>
          Try again
        </button>
      </div>
    );
  }

  if (!data || !data.data || data.data.items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📦</div>
        <h3 className="text-lg font-medium text-slate-700 mb-1">No plugins found</h3>
        <p className="text-slate-500 mb-4">
          {search || category ? "Try adjusting your search or filter." : "No plugins available yet."}
        </p>
        {!search && !category && (
          <button className="btn btn-primary" onClick={() => navigate("/install")}>
            Browse Installation Guide
          </button>
        )}
      </div>
    );
  }

  // TypeScript narrowing
  const responseData = data.data;
  const items = responseData.items;
  const totalPages = responseData.total_pages;
  const total = responseData.total;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search plugins..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="form-input pl-10"
            aria-label="Search plugins"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="form-input max-w-xs"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((plugin) => (
          <PluginCard key={plugin.id} plugin={plugin} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            ← Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages} ({total} total)
          </span>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
import { render, screen, fireEvent } from "@testing-library/react";
import { PluginList } from "../components/PluginList";
import { useApi } from "../api";
import { vi, describe, beforeEach, it, expect } from "vitest";

const mockPlugins = [
  {
    id: 1,
    name: "python-development",
    display_name: "Python Development",
    description: "Python, Django, FastAPI, testing, and packaging",
    category: "development",
    repository_url: "https://github.com/wshobson/agents",
    homepage_url: null,
    license: "MIT",
    is_external: false,
    external_url: null,
    agent_count: 3,
    skill_count: 16,
    command_count: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "javascript-typescript",
    display_name: "JavaScript/TypeScript",
    description: "JavaScript and TypeScript development and project setup",
    category: "development",
    repository_url: "https://github.com/wshobson/agents",
    homepage_url: null,
    license: "MIT",
    is_external: false,
    external_url: null,
    agent_count: 2,
    skill_count: 12,
    command_count: 2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

vi.mock("../api", () => ({
  useApi: vi.fn(),
}));

describe("PluginList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton cards", () => {
    vi.mocked(useApi).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      refetch: vi.fn(),
    });

    render(<PluginList />);
    // Check for skeleton cards (animate-pulse class)
    const pulseCards = document.querySelectorAll(".animate-pulse");
    expect(pulseCards.length).toBeGreaterThan(0);
  });

  it("renders error state", () => {
    vi.mocked(useApi).mockReturnValue({
      data: null,
      error: new Error("Failed to fetch"),
      loading: false,
      refetch: vi.fn(),
    });

    render(<PluginList />);
    expect(screen.getByText(/failed to load plugins/i)).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it("renders empty state when no plugins", () => {
    vi.mocked(useApi).mockReturnValue({
      data: { data: { items: [], total: 0, page: 1, page_size: 12, total_pages: 0 } },
      error: null,
      loading: false,
      refetch: vi.fn(),
    });

    render(<PluginList />);
    expect(screen.getByText(/no plugins found/i)).toBeInTheDocument();
  });

  it("renders plugin cards with data", () => {
    vi.mocked(useApi).mockReturnValue({
      data: { data: { items: mockPlugins, total: 2, page: 1, page_size: 12, total_pages: 1 } },
      error: null,
      loading: false,
      refetch: vi.fn(),
    });

    render(<PluginList />);
    expect(screen.getByText("Python Development")).toBeInTheDocument();
    expect(screen.getByText("JavaScript/TypeScript")).toBeInTheDocument();
    expect(screen.getByText("3 agents")).toBeInTheDocument();
    expect(screen.getByText("16 skills")).toBeInTheDocument();
  });

  it("filters by search term", () => {
    vi.mocked(useApi).mockReturnValue({
      data: { data: { items: [mockPlugins[0]], total: 1, page: 1, page_size: 12, total_pages: 1 } },
      error: null,
      loading: false,
      refetch: vi.fn(),
    });

    render(<PluginList />);
    const searchInput = screen.getByPlaceholderText(/search plugins/i);
    fireEvent.change(searchInput, { target: { value: "python" } });
    expect(searchInput).toHaveValue("python");
  });

  it("filters by category", () => {
    vi.mocked(useApi).mockReturnValue({
      data: { data: { items: mockPlugins, total: 2, page: 1, page_size: 12, total_pages: 1 } },
      error: null,
      loading: false,
      refetch: vi.fn(),
    });

    render(<PluginList />);
    const categorySelect = screen.getByLabelText(/filter by category/i);
    fireEvent.change(categorySelect, { target: { value: "development" } });
    expect(categorySelect).toHaveValue("development");
  });
});
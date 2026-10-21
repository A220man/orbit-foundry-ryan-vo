import { render, screen } from "@testing-library/react";
import { App } from "../App";
import { vi, describe, it, expect } from "vitest";

vi.mock("../components/Layout", () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">
      <nav data-testid="navigation">
        <a href="/plugins">Plugins</a>
        <a href="/harnesses">Harnesses</a>
        <a href="/install">Install</a>
      </nav>
      <div data-testid="layout-children">{children}</div>
      <footer data-testid="footer">
        Orbit Foundry
      </footer>
    </div>
  ),
}));

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText("Orbit Foundry")).toBeInTheDocument();
  });

  it("shows navigation links", () => {
    render(<App />);
    expect(screen.getByText("Plugins")).toBeInTheDocument();
    expect(screen.getByText("Harnesses")).toBeInTheDocument();
    expect(screen.getByText("Install")).toBeInTheDocument();
  });
});
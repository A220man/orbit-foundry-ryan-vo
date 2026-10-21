import { Layout } from "./components/Layout";
import { PluginsPage } from "./pages/Plugins";
import { PluginDetailPage } from "./pages/PluginDetailPage";
import { HarnessesPage } from "./pages/Harnesses";
import { InstallPage } from "./pages/Install";
import { Routes, Route, Navigate } from "react-router-dom";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/plugins" replace />} />
        <Route path="/plugins" element={<PluginsPage />} />
        <Route path="/plugins/:id" element={<PluginDetailPage />} />
        <Route path="/harnesses" element={<HarnessesPage />} />
        <Route path="/install" element={<InstallPage />} />
      </Routes>
    </Layout>
  );
}
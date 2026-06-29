import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { SiteHeader } from "./components/layout/SiteHeader";
import { SiteFooter } from "./components/layout/SiteFooter";
import { LandingPage } from "./pages/LandingPage";
import { ExplorerPage } from "./pages/ExplorerPage";
import { CaseDetailPage } from "./pages/CaseDetailPage";
import { InsightsPage } from "./pages/InsightsPage";
import { DeliveryPage } from "./pages/DeliveryPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const ProgramsPage = lazy(() =>
  import("./pages/ProgramsPage").then((module) => ({ default: module.ProgramsPage })),
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <SiteHeader />
      <main id="main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="/case/:id" element={<CaseDetailPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route
            path="/programs"
            element={
              <Suspense fallback={<div className="route-loading">Loading programme database…</div>}>
                <ProgramsPage />
              </Suspense>
            }
          />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}

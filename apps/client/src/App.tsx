import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/home/Index";
import { HomeOwnershipOpportunitiesPage } from "@/pages/home-ownership-opportunities/Index";
import { OpportunityDetailPage } from "@/pages/opportunity-detail/Index";
import { WhoWeArePage } from "@/pages/who-we-are/Index";
import { HomeReadyPage } from "@/pages/homeready/Index";
import { CoOwnershipPage } from "@/pages/co-ownership/Index";
import { WorkWithAXPPage } from "@/pages/work-with-axp/Index";
import { KnowledgePage } from "@/pages/knowledge/Index";
import { ImpactPage } from "@/pages/impact/Index";
import { MediaPage } from "@/pages/media/Index";
import { CareersPage } from "@/pages/careers/Index";
import { ContactPage } from "@/pages/contact/Index";
import { NotFoundPage } from "@/pages/not-found/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home-ownership-opportunities" element={<HomeOwnershipOpportunitiesPage />} />
          <Route path="/opportunities/:slug" element={<OpportunityDetailPage />} />
          <Route path="/who-we-are" element={<WhoWeArePage />} />
          <Route path="/ecosystem" element={<Navigate to="/who-we-are" replace />} />
          <Route path="/solutions" element={<Navigate to="/home-ownership-opportunities" replace />} />
          <Route path="/homeready" element={<HomeReadyPage />} />
          <Route path="/co-ownership" element={<CoOwnershipPage />} />
          <Route path="/work-with-axp" element={<WorkWithAXPPage />} />
          <Route path="/partnership-hub" element={<Navigate to="/work-with-axp" replace />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/investors-partners" element={<Navigate to="/work-with-axp" replace />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

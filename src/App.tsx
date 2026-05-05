import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WellbeingProvider } from "@/context/WellbeingContext";
import { ThemeProvider } from "@/hooks/use-theme";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import JournalPage from "@/pages/JournalPage";
import CameraPage from "@/pages/CameraPage";
import BurnoutPage from "@/pages/BurnoutPage";
import QuestionnairePage from "@/pages/QuestionnairePage";
import ChatPage from "@/pages/ChatPage";
import DashboardPage from "@/pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WellbeingProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/camera" element={<CameraPage />} />
              <Route path="/burnout" element={<BurnoutPage />} />
              <Route path="/questionnaire" element={<QuestionnairePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </WellbeingProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

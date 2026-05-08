import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WellbeingProvider } from "@/context/WellbeingContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/hooks/use-theme";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import JournalPage from "@/pages/JournalPage";
import CameraPage from "@/pages/CameraPage";
import BurnoutPage from "@/pages/BurnoutPage";
import QuestionnairePage from "@/pages/QuestionnairePage";
import ChatPage from "@/pages/ChatPage";
import DashboardPage from "@/pages/DashboardPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const protect = (el: JSX.Element) => <ProtectedRoute>{el}</ProtectedRoute>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WellbeingProvider>
            <AppLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/journal" element={protect(<JournalPage />)} />
                <Route path="/camera" element={protect(<CameraPage />)} />
                <Route path="/burnout" element={protect(<BurnoutPage />)} />
                <Route path="/questionnaire" element={protect(<QuestionnairePage />)} />
                <Route path="/chat" element={protect(<ChatPage />)} />
                <Route path="/dashboard" element={protect(<DashboardPage />)} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </WellbeingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

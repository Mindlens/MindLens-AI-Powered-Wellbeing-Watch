import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { WellbeingProvider } from "@/context/WellbeingContext";
import { ThemeProvider } from "@/hooks/use-theme";
import AppLayout from "@/components/AppLayout";
import PageSkeleton from "@/components/PageSkeleton";
import HomePage from "@/pages/HomePage";
import JournalPage from "@/pages/JournalPage";
import BurnoutPage from "@/pages/BurnoutPage";
import QuestionnairePage from "@/pages/QuestionnairePage";
import ChatPage from "@/pages/ChatPage";
import NotFound from "./pages/NotFound";

const CameraPage = lazy(() => import("@/pages/CameraPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));

const queryClient = new QueryClient();

const FadeRoute = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<FadeRoute><HomePage /></FadeRoute>} />
        <Route path="/journal" element={<FadeRoute><JournalPage /></FadeRoute>} />
        <Route path="/camera" element={<FadeRoute><Suspense fallback={<PageSkeleton />}><CameraPage /></Suspense></FadeRoute>} />
        <Route path="/burnout" element={<FadeRoute><BurnoutPage /></FadeRoute>} />
        <Route path="/questionnaire" element={<FadeRoute><QuestionnairePage /></FadeRoute>} />
        <Route path="/chat" element={<FadeRoute><ChatPage /></FadeRoute>} />
        <Route path="/dashboard" element={<FadeRoute><Suspense fallback={<PageSkeleton />}><DashboardPage /></Suspense></FadeRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <WellbeingProvider>
            <AppLayout>
              <AnimatedRoutes />
            </AppLayout>
          </WellbeingProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

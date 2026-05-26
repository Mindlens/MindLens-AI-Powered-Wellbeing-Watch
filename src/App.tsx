import { Suspense, lazy, memo } from "react";
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
import NotFound from "./pages/NotFound";

const JournalPage = lazy(() => import("@/pages/JournalPage"));
const BurnoutPage = lazy(() => import("@/pages/BurnoutPage"));
const QuestionnairePage = lazy(() => import("@/pages/QuestionnairePage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const CameraPage = lazy(() => import("@/pages/CameraPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));

const queryClient = new QueryClient();

const fadeTransition = { duration: 0.2, ease: "easeOut" as const };

const FadeRoute = memo(({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={fadeTransition}
  >
    <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
  </motion.div>
));
FadeRoute.displayName = "FadeRoute";

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<FadeRoute><HomePage /></FadeRoute>} />
        <Route path="/journal" element={<FadeRoute><JournalPage /></FadeRoute>} />
        <Route path="/camera" element={<FadeRoute><CameraPage /></FadeRoute>} />
        <Route path="/burnout" element={<FadeRoute><BurnoutPage /></FadeRoute>} />
        <Route path="/questionnaire" element={<FadeRoute><QuestionnairePage /></FadeRoute>} />
        <Route path="/chat" element={<FadeRoute><ChatPage /></FadeRoute>} />
        <Route path="/dashboard" element={<FadeRoute><DashboardPage /></FadeRoute>} />
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

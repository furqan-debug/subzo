import { Toaster } from "@/components/ui/Toaster";
import { Toaster as Sonner } from "@/components/ui/Sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistCache } from "@/lib/queryPersister";
import OfflineBanner from "@/components/OfflineBanner";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useDeepLinkHandler } from "@/hooks/useDeepLinkHandler";
import { initializeGoogleAuth } from "@/hooks/useGoogleAuth";
import { lazy, Suspense, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { addNotificationTapListener } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import PageTransition from "@/components/PageTransition";
import NotificationScheduler from "@/components/NotificationScheduler";

// Eagerly loaded (initial route)
import Auth from "./pages/Auth";
import Index from "./pages/Index";

// Lazy-loaded pages
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AddSubscription = lazy(() => import("./pages/AddSubscription"));
const SubscriptionDetail = lazy(() => import("./pages/SubscriptionDetail"));
const Analytics = lazy(() => import("./pages/Analytics"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const Plans = lazy(() => import("./pages/Plans"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      staleTime: 5 * 60 * 1000,
      networkMode: 'offlineFirst',
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

persistCache(queryClient);

const AppRoutes = () => {
  useDeepLinkHandler();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  useEffect(() => {
    return addNotificationTapListener(navigate);
  }, [navigate]);

  return (
    <Suspense fallback={null}>
      <AnimatePresence>
        <Routes location={location} key={location.pathname}>
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/plans" element={<ProtectedRoute><PageTransition><Plans /></PageTransition></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><AppLayout><PageTransition><Index /></PageTransition></AppLayout></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AppLayout><PageTransition><AddSubscription /></PageTransition></AppLayout></ProtectedRoute>} />
          <Route path="/subscription/:id" element={<ProtectedRoute><AppLayout><PageTransition><SubscriptionDetail /></PageTransition></AppLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AppLayout><PageTransition><Analytics /></PageTransition></AppLayout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><AppLayout><PageTransition><CalendarPage /></PageTransition></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppLayout><PageTransition><SettingsPage /></PageTransition></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OfflineBanner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationScheduler />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

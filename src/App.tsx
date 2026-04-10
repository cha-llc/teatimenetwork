
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import Index from "./pages/Index";
import CategoriesPage from "./pages/CategoriesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TemplatesPage from "./pages/TemplatesPage";
import GamificationPage from "./pages/GamificationPage";
import InsightsPage from "./pages/InsightsPage";
import ChallengesPage from "./pages/ChallengesPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PricingPage from "./pages/PricingPage";
import IoTPage from "./pages/IoTPage";
import IncubatorPage from "./pages/IncubatorPage";
import NeuroFeedbackPage from "./pages/NeuroFeedbackPage";
import NeuroHistoryPage from "./pages/NeuroHistoryPage";
import TeamsPage from "./pages/TeamsPage";
import MomentumRealmPage from "./pages/MomentumRealmPage";
import AccountabilityPage from "./pages/AccountabilityPage";
import CommunityPage from "./pages/CommunityPage";
import UserProfilePage from "./pages/UserProfilePage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import HabitsPage from "./pages/HabitsPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LanguageProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                {/* PUBLIC ROUTES - No auth required */}
                <Route path="/" element={<Index />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cookies" element={<PrivacyPage />} />
                <Route path="/payment-success" element={<PaymentSuccessPage />} />

                {/* AUTH REQUIRED - Free tier allowed */}
                <Route
                  path="/habits"
                  element={
                    <ProtectedRoute>
                      <HabitsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/:username"
                  element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* SUBSCRIPTION GATED - Active subscription required */}
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <CategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/templates"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <TemplatesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/achievements"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <GamificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insights"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <InsightsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/challenges"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <ChallengesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/smart-ecosystem"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <IoTPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/integrations"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <IoTPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incubator"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <IncubatorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/neuro-feedback"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <NeuroFeedbackPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/neuro-history"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <NeuroHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <TeamsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teams/join/:inviteCode"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <TeamsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/momentum-realm"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <MomentumRealmPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/accountability"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <AccountabilityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <ProtectedRoute requireSubscription="active">
                      <CommunityPage />
                    </ProtectedRoute>
                  }
                />

                {/* ADMIN ONLY */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

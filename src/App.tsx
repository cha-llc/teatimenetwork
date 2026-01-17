
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
                <Route path="/" element={<Index />} />
                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/achievements" element={<GamificationPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/challenges" element={<ChallengesPage />} />
                <Route path="/smart-ecosystem" element={<IoTPage />} />
                <Route path="/integrations" element={<IoTPage />} />
                <Route path="/incubator" element={<IncubatorPage />} />
                <Route path="/neuro-feedback" element={<NeuroFeedbackPage />} />
                <Route path="/neuro-history" element={<NeuroHistoryPage />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/teams/join/:inviteCode" element={<TeamsPage />} />
                <Route path="/momentum-realm" element={<MomentumRealmPage />} />
                <Route path="/accountability" element={<AccountabilityPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/user/:username" element={<UserProfilePage />} />
                <Route path="/payment-success" element={<PaymentSuccessPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cookies" element={<PrivacyPage />} />
                <Route path="/admin" element={<AdminPage />} />
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

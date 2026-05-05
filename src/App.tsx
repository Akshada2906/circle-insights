import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StakeholderProvider } from "@/contexts/StakeholderContext";
import { AccountProvider } from "@/contexts/AccountContext";
import Index from "./pages/Index";
import Accounts from "./pages/Accounts";
import AccountDetails from "./pages/AccountDetails";
import AccountFormPage from "./pages/AccountFormPage";
import StakeholderFormPage from "./pages/StakeholderFormPage";
import StakeholderDetails from "./pages/StakeholderDetails";
import ImportFinanceData from "./pages/ImportFinanceData";
import FinancialAccountDetails from "./pages/FinancialAccountDetails";
import FinancialAccountInsights from "./pages/FinancialAccountInsights";
import FinancialAccountForm from "./pages/FinancialAccountForm";
import FinancialProjectForm from "./pages/FinancialProjectForm";
import FinancialProjectDetails from "./pages/FinancialProjectDetails";

import Financials from "./pages/Financials";
import FinanceDashboard from "./pages/FinanceDashboard";
import Circles from "./pages/Circles";
import ValueChain from "./pages/ValueChain";
import Opportunities from "./pages/Opportunities";
import MyCalendar from "./pages/MyCalendar";
import PrivateEquity from "./pages/PrivateEquity";
import PrivateEquityDetails from "./pages/PrivateEquityDetails";
import PrivateEquityInsights from "./pages/PrivateEquityInsights";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // const { isAuthenticated } = useAuth();
  // if (!isAuthenticated) {
  //   return <Navigate to="/auth" replace />;
  // }
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AccountProvider>
          <StakeholderProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
                <Route path="/accounts/new" element={<ProtectedRoute><AccountFormPage /></ProtectedRoute>} />
                <Route path="/accounts/:id" element={<ProtectedRoute><AccountDetails /></ProtectedRoute>} />
                <Route path="/accounts/:id/edit" element={<ProtectedRoute><AccountFormPage /></ProtectedRoute>} />
                <Route path="/finance-dashboard" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
                <Route path="/private-equity" element={<ProtectedRoute><PrivateEquity /></ProtectedRoute>} />
                <Route path="/private-equity/:id" element={<ProtectedRoute><PrivateEquityDetails /></ProtectedRoute>} />
                <Route path="/private-equity/:id/insights" element={<ProtectedRoute><PrivateEquityInsights /></ProtectedRoute>} />
                <Route path="/financials" element={<ProtectedRoute><Financials /></ProtectedRoute>} />
                <Route path="/financials/import" element={<ProtectedRoute><ImportFinanceData /></ProtectedRoute>} />
                <Route path="/financials/new" element={<ProtectedRoute><FinancialAccountForm /></ProtectedRoute>} />
                <Route path="/financials/:id" element={<ProtectedRoute><FinancialAccountDetails /></ProtectedRoute>} />
                <Route path="/financials/:id/insights" element={<ProtectedRoute><FinancialAccountInsights /></ProtectedRoute>} />
                <Route path="/financials/:id/edit" element={<ProtectedRoute><FinancialAccountForm /></ProtectedRoute>} />
                <Route path="/financials/:accountId/projects/new" element={<ProtectedRoute><FinancialProjectForm /></ProtectedRoute>} />
                <Route path="/financials/:accountId/projects/:projectId" element={<ProtectedRoute><FinancialProjectDetails /></ProtectedRoute>} />
                <Route path="/financials/:accountId/projects/:projectId/edit" element={<ProtectedRoute><FinancialProjectForm /></ProtectedRoute>} />
                <Route path="/circles" element={<ProtectedRoute><Circles /></ProtectedRoute>} />
                <Route path="/value-chain" element={<ProtectedRoute><ValueChain /></ProtectedRoute>} />
                <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><MyCalendar /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
              </Routes>
            </BrowserRouter>
          </StakeholderProvider>
        </AccountProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

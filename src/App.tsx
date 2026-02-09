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

import Stakeholders from "./pages/Stakeholders";
import Financials from "./pages/Financials";
import Circles from "./pages/Circles";
import ValueChain from "./pages/ValueChain";
import Opportunities from "./pages/Opportunities";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AccountProvider>
        <StakeholderProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/accounts/new" element={<AccountFormPage />} />
              <Route path="/accounts/:id" element={<AccountDetails />} />
              <Route path="/accounts/:id/edit" element={<AccountFormPage />} />
              <Route path="/stakeholders" element={<Stakeholders />} />
              <Route path="/stakeholders/new" element={<StakeholderFormPage />} />
              <Route path="/stakeholders/:id" element={<StakeholderDetails />} />
              <Route path="/stakeholders/:id/edit" element={<StakeholderFormPage />} />
              <Route path="/financials" element={<Financials />} />
              <Route path="/circles" element={<Circles />} />
              <Route path="/value-chain" element={<ValueChain />} />
              <Route path="/opportunities" element={<Opportunities />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StakeholderProvider>
      </AccountProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/stakeholders" element={<Stakeholders />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/circles" element={<Circles />} />
          <Route path="/value-chain" element={<ValueChain />} />
          <Route path="/opportunities" element={<Opportunities />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

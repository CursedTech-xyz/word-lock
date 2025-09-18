import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import EncryptionStudio from "./pages/EncryptionStudio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="encrypt" element={<EncryptionStudio />} />
            <Route path="files" element={<div className="p-8 text-center text-muted-foreground">File Laboratory - Coming Soon</div>} />
            <Route path="vault" element={<div className="p-8 text-center text-muted-foreground">Key Vault - Coming Soon</div>} />
            <Route path="analysis" element={<div className="p-8 text-center text-muted-foreground">Analysis Center - Coming Soon</div>} />
            <Route path="learn" element={<div className="p-8 text-center text-muted-foreground">Learning Hub - Coming Soon</div>} />
            <Route path="settings" element={<div className="p-8 text-center text-muted-foreground">Settings - Coming Soon</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

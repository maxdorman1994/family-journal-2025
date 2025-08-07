import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Journal from "./pages/Journal";
import Gallery from "./pages/Gallery";
import MunroBagging from "./pages/MunroBagging";
import HintsTips from "./pages/HintsTips";
import Wishlist from "./pages/Wishlist";
import Milestones from "./pages/Milestones";
import MapSimple from "./pages/MapSimple";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/munro-bagging" element={<MunroBagging />} />
            <Route path="/hints-tips" element={<HintsTips />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/milestones" element={<Milestones />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);

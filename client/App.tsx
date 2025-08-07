import "./global.css";

import React from "react";
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
import Map from "./pages/Map";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Fallback app without TooltipProvider for debugging
const FallbackApp = () => (
  <QueryClientProvider client={queryClient}>
    <div style={{ padding: '20px', textAlign: 'center', background: '#f0f0f0' }}>
      <h1>🏴󠁧󠁢󠁳󠁣󠁴󠁿 A Wee Adventure</h1>
      <p>Loading minimal version due to React error...</p>
      <p>If you see this, React is working but TooltipProvider is causing issues.</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  </QueryClientProvider>
);

const App = () => {
  // Check if we can safely use TooltipProvider
  try {
    return (
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
                <Route path="/map" element={<Map />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('TooltipProvider failed, using fallback:', error);
    return <FallbackApp />;
  }
};

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

const container = document.getElementById("root")!;

// Check if React is properly available
if (typeof React === 'undefined') {
  console.error('React is not defined! Check your build configuration.');
  container.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error: React is not loaded</h1><p>Please refresh the page.</p></div>';
} else {
  console.log('✅ React is properly loaded');

  // Prevent double mounting in development
  if (!container.hasAttribute("data-root-created")) {
    try {
      const root = createRoot(container);
      container.setAttribute("data-root-created", "true");
      root.render(<AppWithErrorBoundary />);
      console.log('✅ React app mounted successfully');
    } catch (error) {
      console.error('❌ Error mounting React app:', error);
      container.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error mounting app</h1><p>Check console for details.</p></div>';
    }
  }
}

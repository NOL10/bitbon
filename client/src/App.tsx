import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import { BonsaiProvider } from "./lib/store";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BonsaiProvider>
          <Router hook={useHashLocation}>
          <div className="relative min-h-screen overflow-hidden">

            {/* Draggable region for Electron */}
            {typeof window !== 'undefined' && (window as any).electron && (
              <div
                className="drag-region"
                style={{
                  // @ts-ignore
                  WebkitAppRegion: 'drag',
                  height: 32,
                  width: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 10,
                }}
              />
            )}

            <div className="crt grid-lines scanlines absolute inset-0 pointer-events-none"></div>
            <Toaster />
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/settings" component={Settings} />
                <Route component={NotFound} />
              </Switch>
          </div>
          </Router>
        </BonsaiProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

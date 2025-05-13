import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import { BonsaiProvider } from "./lib/store";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BonsaiProvider>
          <div className="relative min-h-screen overflow-hidden">
            <div className="crt grid-lines scanlines absolute inset-0 pointer-events-none"></div>
            <Toaster />
            <Router />
          </div>
        </BonsaiProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

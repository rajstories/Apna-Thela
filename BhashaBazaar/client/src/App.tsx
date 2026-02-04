import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PWAInstallBanner } from "@/components/pwa-install-banner";
import Home from "@/pages/home";
import BuyIngredients from "@/pages/buy-ingredients";
import Inventory from "@/pages/inventory";
import Wallet from "@/pages/wallet";
import Profile from "@/pages/profile";
import ProfileEdit from "@/pages/profile-edit";
import NearbySellers from "@/pages/nearby-sellers";
import ComparePrices from "@/pages/compare-prices";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/buy-ingredients" component={BuyIngredients} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/edit" component={ProfileEdit} />
      <Route path="/nearby-sellers" component={NearbySellers} />
      <Route path="/compare-prices" component={ComparePrices} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PWAInstallBanner />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

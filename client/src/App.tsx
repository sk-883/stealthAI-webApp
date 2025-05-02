import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Network from "@/pages/Network";
import Jobs from "@/pages/Jobs";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/:id">
        {(params) => <Profile id={params.id} />}
      </Route>
      <Route path="/network" component={Network} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/messages" component={Messages} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Navbar />
      <Router />
      <MobileNavigation />
    </TooltipProvider>
  );
}

export default App;

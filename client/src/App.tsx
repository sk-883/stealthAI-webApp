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
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthPage from "@/pages/auth-page";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/profile" component={Profile} />
      <Route path="/profile/:id">
        {(params) => <Profile id={params.id} />}
      </Route>
      <ProtectedRoute path="/network" component={Network} />
      <ProtectedRoute path="/jobs" component={Jobs} />
      <ProtectedRoute path="/messages" component={Messages} />
      <ProtectedRoute path="/notifications" component={Notifications} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Navbar />
        <Router />
        <MobileNavigation />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;

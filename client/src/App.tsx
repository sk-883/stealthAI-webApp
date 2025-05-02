import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Network from "@/pages/Network";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Jobs from "@/pages/Jobs";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";

function AuthenticatedRoute({ component: Component, ...rest }: any) {
  const { data: user, isLoading } = useQuery({ 
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/">
        {() => <AuthenticatedRoute component={Home} />}
      </Route>
      <Route path="/profile">
        {() => <AuthenticatedRoute component={Profile} />}
      </Route>
      <Route path="/profile/:id">
        {(params) => <AuthenticatedRoute component={Profile} id={params.id} />}
      </Route>
      <Route path="/network">
        {() => <AuthenticatedRoute component={Network} />}
      </Route>
      <Route path="/jobs">
        {() => <AuthenticatedRoute component={Jobs} />}
      </Route>
      <Route path="/messages">
        {() => <AuthenticatedRoute component={Messages} />}
      </Route>
      <Route path="/notifications">
        {() => <AuthenticatedRoute component={Notifications} />}
      </Route>
      <Route path="/settings">
        {() => <AuthenticatedRoute component={Settings} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { data: user } = useQuery({ 
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return (
    <TooltipProvider>
      <Toaster />
      {user && <Navbar />}
      <Router />
      {user && <MobileNavigation />}
    </TooltipProvider>
  );
}

export default App;

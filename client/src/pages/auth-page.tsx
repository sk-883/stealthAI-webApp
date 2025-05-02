import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage() {
  const { user } = useAuth();
  
  // Redirect to home if already logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  // This serves as the auth page which contains both login and register forms
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to LinkedUp</h2>
          <p className="text-gray-600">Sign in to connect with professionals around the world</p>
        </div>
        <Login />
        <div className="mt-6 text-center">
          <p>Don't have an account? Register below</p>
        </div>
        <Register />
      </div>
      <div className="hidden md:flex md:w-1/2 bg-primary/10 p-8 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">LinkedUp</h1>
          <h2 className="text-2xl font-semibold mb-4">Connect. Network. Grow.</h2>
          <p className="text-lg mb-6">Join the professional network that helps you build connections, find opportunities, and advance your career.</p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="bg-primary text-white p-1 rounded-full mr-2">✓</span>
              <span>Connect with professionals in your industry</span>
            </li>
            <li className="flex items-center">
              <span className="bg-primary text-white p-1 rounded-full mr-2">✓</span>
              <span>Discover job opportunities tailored to your skills</span>
            </li>
            <li className="flex items-center">
              <span className="bg-primary text-white p-1 rounded-full mr-2">✓</span>
              <span>Share your achievements and experience</span>
            </li>
            <li className="flex items-center">
              <span className="bg-primary text-white p-1 rounded-full mr-2">✓</span>
              <span>Stay updated with industry trends and news</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
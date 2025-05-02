import { useState } from "react";
import { Redirect, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Extend the insert user schema for registration validation
const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long"
  }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      headline: "",
      bio: "",
      profilePicture: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 70)}.jpg`
    }
  });
  
  // Redirect to home if already logged in - moved after all hooks
  if (user) {
    return <Redirect to="/" />;
  }
  
  // Login submit handler
  function onLoginSubmit(data: z.infer<typeof loginSchema>) {
    setAuthError(null);
    loginMutation.mutate(data, {
      onError: (error) => {
        setAuthError(error.message || "Invalid username or password. Please try again.");
      }
    });
  }
  
  // Register submit handler
  function onRegisterSubmit(data: RegisterFormData) {
    setAuthError(null);
    // Remove confirmPassword as it's not part of the API schema
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onError: (error) => {
        setAuthError(error.message || "Registration failed. Please try again.");
      }
    });
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side with forms */}
      <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-center bg-white overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          <div className="flex justify-center items-center mb-6">
            <svg className="h-10 w-10 text-[#0a66c2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 17H6.5v-7H9v7zM7.8 9.2A1.6 1.6 0 117.8 6a1.6 1.6 0 010 3.2zm9.7 7.8h-2.5v-4c0-2.5-3-2.3-3 0v4h-2.5v-7h2.5v1.5c1-1.9 5-2 5 1.8v3.7z" />
            </svg>
            <h1 className="ml-2 text-3xl font-bold text-[#0a66c2]">LinkedUp</h1>
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-center">Welcome to LinkedUp</h2>
          <p className="text-gray-600 text-center mb-6">Connect with professionals around the world</p>
          
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Join Now</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardContent className="pt-6">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
                                {...field} 
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                {...field} 
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#0a66c2] hover:bg-[#004182]"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign in"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardContent className="pt-6">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your full name" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="headline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Headline</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Software Engineer at TechCorp" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about yourself" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a password (6+ characters)" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm your password" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <p className="text-xs text-[#666666] mt-4">
                        By clicking Agree & Join, you agree to the LinkedUp User Agreement, Privacy Policy, and Cookie Policy.
                      </p>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#0a66c2] hover:bg-[#004182]"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Agree & Join"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right side with branding */}
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
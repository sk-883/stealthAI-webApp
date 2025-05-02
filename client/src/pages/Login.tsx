import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Define form with validation
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.name}!`
      });
      navigate("/");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      setAuthError(error.message || "Invalid username or password. Please try again.");
    }
  });
  
  // Submit handler
  function onSubmit(data: z.infer<typeof loginSchema>) {
    setAuthError(null);
    loginMutation.mutate(data);
  }
  
  // Update document title
  useEffect(() => {
    document.title = "Sign In | LinkedUp";
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <svg className="h-10 w-10 text-[#0a66c2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 17H6.5v-7H9v7zM7.8 9.2A1.6 1.6 0 117.8 6a1.6 1.6 0 010 3.2zm9.7 7.8h-2.5v-4c0-2.5-3-2.3-3 0v4h-2.5v-7h2.5v1.5c1-1.9 5-2 5 1.8v3.7z" />
            </svg>
            <h1 className="ml-2 text-3xl font-bold text-[#0a66c2]">LinkedUp</h1>
          </div>
          <h2 className="text-2xl font-bold text-[#191919]">Sign in</h2>
          <p className="text-[#666666] mt-2">Stay updated on your professional world</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
          
          <CardFooter className="flex justify-center border-t p-6">
            <p className="text-sm text-center text-[#666666]">
              New to LinkedUp?{" "}
              <Link href="/register" className="text-[#0a66c2] font-medium hover:underline">
                Join now
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

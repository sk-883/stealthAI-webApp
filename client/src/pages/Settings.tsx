import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/queryClient";

import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  headline: z.string().optional(),
  bio: z.string().optional(),
  profilePicture: z.string().optional(),
  coverPicture: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Account form schema
const accountFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password.",
  path: ["currentPassword"],
}).refine(data => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// Notification settings schema
const notificationSchema = z.object({
  newMessage: z.boolean().default(true),
  connectionRequest: z.boolean().default(true),
  postEngagement: z.boolean().default(true),
  jobAlert: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
});

type NotificationValues = z.infer<typeof notificationSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user data
  const { data: userData, isLoading } = useQuery({ 
    queryKey: ["/api/auth/user"]
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userData?.name || "",
      headline: userData?.headline || "",
      bio: userData?.bio || "",
      profilePicture: userData?.profilePicture || "",
      coverPicture: userData?.coverPicture || "",
    },
  });

  // Account form
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      username: userData?.username || "",
      email: "user@example.com", // Assuming there's no email field in the current schema
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      newMessage: true,
      connectionRequest: true,
      postEngagement: true,
      jobAlert: true,
      emailNotifications: true,
      pushNotifications: true,
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const response = await apiRequest("PATCH", `/api/users/${userData?.id}`, values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  // Handle account form submission
  const onAccountSubmit = (values: AccountFormValues) => {
    toast({
      title: "Account updated",
      description: "Your account settings have been updated.",
    });
    // In a real app, we would update the account information
    console.log(values);
  };

  // Handle notification settings submission
  const onNotificationSubmit = (values: NotificationValues) => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
    // In a real app, we would update the notification settings
    console.log(values);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 mb-16 md:mb-0">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 space-y-1">
            <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1">
              <TabsTrigger 
                value="profile" 
                className="justify-start px-4 py-2 h-9 w-full"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="justify-start px-4 py-2 h-9 w-full"
              >
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="justify-start px-4 py-2 h-9 w-full"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="justify-start px-4 py-2 h-9 w-full"
              >
                Privacy
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1">
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>
                    Manage your public profile information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-start md:gap-6">
                        <Avatar className="h-24 w-24 mb-4 md:mb-0">
                          <AvatarImage src={userData?.profilePicture} alt={userData?.name} />
                          <AvatarFallback>{userData?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <FormField
                            control={profileForm.control}
                            name="profilePicture"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profile Picture URL</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  Enter a URL for your profile picture.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="coverPicture"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cover Image URL</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  Enter a URL for your profile banner.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="headline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Headline</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              A brief professional headline that appears below your name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea rows={5} {...field} />
                            </FormControl>
                            <FormDescription>
                              Write a short bio about yourself. This will appear on your profile.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Manage your account settings and password.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...accountForm}>
                    <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6">
                      <FormField
                        control={accountForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Your unique username. This is used for your profile URL.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Your email address for notifications and account recovery.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Separator />
                      
                      <h3 className="text-lg font-medium">Change Password</h3>
                      
                      <FormField
                        control={accountForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={accountForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit">Save changes</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Manage which notifications you receive.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                      <h3 className="text-lg font-medium">Notification Types</h3>
                      
                      <FormField
                        control={notificationForm.control}
                        name="newMessage"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Messages</FormLabel>
                              <FormDescription>
                                Notify me when I receive a new message.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="connectionRequest"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Connection Requests</FormLabel>
                              <FormDescription>
                                Notify me when someone sends me a connection request.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="postEngagement"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Post Engagements</FormLabel>
                              <FormDescription>
                                Notify me when someone likes or comments on my posts.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="jobAlert"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Job Alerts</FormLabel>
                              <FormDescription>
                                Notify me about new job opportunities that match my profile.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Separator />
                      
                      <h3 className="text-lg font-medium">Notification Channels</h3>
                      
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications via email.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Push Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications in your browser.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit">Save preferences</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Manage who can see your profile and activity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Profile Visibility</h3>
                    <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">Who can see your profile</h4>
                        <p className="text-sm text-muted-foreground">
                          Control who can view your full profile information.
                        </p>
                      </div>
                      <select className="border rounded-md p-2">
                        <option>Everyone</option>
                        <option>Connections only</option>
                        <option>Nobody</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">Profile photo visibility</h4>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your profile photo.
                        </p>
                      </div>
                      <select className="border rounded-md p-2">
                        <option>Everyone</option>
                        <option>Connections only</option>
                        <option>Nobody</option>
                      </select>
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-lg font-medium">Activity Visibility</h3>
                    <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">Connections list</h4>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your connections.
                        </p>
                      </div>
                      <select className="border rounded-md p-2">
                        <option>Everyone</option>
                        <option>Connections only</option>
                        <option>Only you</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">Email address visibility</h4>
                        <p className="text-sm text-muted-foreground">
                          Control who can see your email address.
                        </p>
                      </div>
                      <select className="border rounded-md p-2">
                        <option>Connections only</option>
                        <option>1st and 2nd connections</option>
                        <option>Only you</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">Active status</h4>
                        <p className="text-sm text-muted-foreground">
                          Show when you are active on LinkedUp.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <h3 className="text-lg font-medium">Data Privacy</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        Download your data
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-red-500">
                        Delete account
                      </Button>
                    </div>
                  </div>
                  
                  <Button>Save privacy settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
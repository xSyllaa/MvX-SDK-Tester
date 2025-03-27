"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, BarChart } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import PasswordChangeForm from '../components/PasswordChangeForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Type pour les statistiques d'utilisation
type UsageStats = {
  today: number;
  week: number;
  month: number;
  lastRequest: string | null;
  limits: {
    dailyLimit: number;
    weeklyLimit: number;
    monthlyLimit: number;
  }
};

export default function AccountPage() {
  const { userData, isLoading, isAuthenticated, redirectToLogin } = useUser();
  const router = useRouter();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Récupérer les statistiques d'utilisation
  const fetchUsageStats = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/usage', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsageStats({
          today: data.usage.today,
          week: data.usage.week,
          month: data.usage.month,
          lastRequest: data.usage.lastRequest,
          limits: data.limits
        });
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsageStats();
    }
  }, [isAuthenticated, fetchUsageStats]);
  
  // Redirect to login page if user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToLogin('/account');
    }
  }, [isLoading, isAuthenticated, redirectToLogin]);
  
  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);
  
  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Loading your account...</h1>
            <p className="text-muted-foreground">Please wait while we retrieve your information</p>
          </div>
        </div>
      </div>
    );
  }
  
  // If user is not logged in, don't display anything (redirection will be handled by useEffect)
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container max-w-6xl py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">Manage your account and view usage statistics</p>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Usage</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{userData?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{userData?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Join Date</p>
                  <p className="text-sm text-muted-foreground">
                    {userData?.joinDate ? new Date(userData.joinDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Current Plan</p>
                  <p className="text-sm text-muted-foreground">{userData?.plan}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Change Password</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <PasswordChangeForm />
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="destructive"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Usage Tab */}
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {usageStats ? (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div>
                      <p className="text-sm font-medium">Daily Usage</p>
                      <p className="text-sm text-muted-foreground">
                        {usageStats.today} / {usageStats.limits.dailyLimit} requests
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Weekly Usage</p>
                      <p className="text-sm text-muted-foreground">
                        {usageStats.week} / {usageStats.limits.weeklyLimit} requests
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Monthly Usage</p>
                      <p className="text-sm text-muted-foreground">
                        {usageStats.month} / {usageStats.limits.monthlyLimit} requests
                      </p>
                    </div>
                    {usageStats.lastRequest && (
                      <div>
                        <p className="text-sm font-medium">Last Request</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(usageStats.lastRequest).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Loading usage statistics...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertCircle, LogOut, Settings, User, CreditCard, 
  Activity, Fingerprint, Shield, BarChart
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import UsageDisplay from '../components/UsageDisplay';
import ApiUsageStats from '../components/ApiUsageStats';
import UserProfileCard from '../components/UserProfileCard';
import SubscriptionPlanCard from '../components/SubscriptionPlanCard';
import { useUser } from '@/hooks/use-user';
import PasswordChangeForm from '../components/PasswordChangeForm';

// Plans d'abonnement disponibles
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Basic access with limited API requests',
    priceMonthly: null,
    priceYearly: null,
    badge: 'Default',
    features: [
      { title: 'SDK Analysis', included: true },
      { title: 'Basic AI Chatbot', included: true },
      { title: 'Priority Support', included: false },
      { title: 'Advanced Analytics', included: false },
      { title: 'Custom Integrations', included: false },
    ],
    limits: {
      daily: 5,
      weekly: 15,
      monthly: 30
    },
    isActive: true,
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    description: 'Enhanced access with higher usage limits',
    priceMonthly: 9.99,
    priceYearly: 99.99,
    badge: 'Popular',
    features: [
      { title: 'SDK Analysis', included: true },
      { title: 'Advanced AI Chatbot', included: true },
      { title: 'Priority Support', included: true },
      { title: 'Advanced Analytics', included: false },
      { title: 'Custom Integrations', included: false },
    ],
    limits: {
      daily: 20,
      weekly: 100,
      monthly: 400
    },
    isPopular: true,
    isActive: false,
  }
];

export default function AccountPage() {
  const { userData, isLoading, isAuthenticated, redirectToLogin } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Récupérer l'onglet actif depuis les paramètres d'URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'usage', 'subscription', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
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
          <p className="text-muted-foreground">Manage your account, security, and subscriptions</p>
        </div>
        
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full md:w-auto flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="profile" id="profile-tab-trigger" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="usage" id="usage-tab-trigger" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Usage</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" id="subscription-tab-trigger" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Subscription</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <UserProfileCard 
              userData={userData} 
              onLogout={handleLogout}
            />
            
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Security</CardTitle>
                  </div>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordChangeForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Usage Tab */}
        <TabsContent value="usage">
          <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold mb-6">API Usage Statistics</h2>
              <ApiUsageStats 
                userPlan={subscriptionPlans.find(plan => plan.isActive)}
              />
              
              <div className="mt-6 bg-muted/40 rounded-lg p-6 border">
                <h3 className="text-lg font-medium mb-3">About Usage Limits</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    <strong>Note: SDK analysis has no usage limits.</strong> The limits shown above only apply to AI chatbot requests.
                  </p>
                  <p>
                    Your API usage is tracked and limited based on your subscription plan. Usage counters reset at the following intervals:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Daily: Every day at midnight UTC</li>
                    <li>Weekly: Every Sunday at midnight UTC</li>
                    <li>Monthly: On the first day of each month at midnight UTC</li>
                  </ul>
                  <p>
                    If you need higher API limits, consider upgrading your subscription plan.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-6">Current Plan</h2>
              <SubscriptionPlanCard 
                plan={subscriptionPlans.find(plan => plan.isActive)!}
                showUpgradeButton={false}
              />
              
              <Button 
                className="w-full mt-4" 
                onClick={() => setActiveTab('subscription')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <div>
            <h2 className="text-2xl font-bold mb-2">Subscription Plans</h2>
            <p className="text-muted-foreground mb-6">
              Choose the plan that best fits your needs
            </p>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {subscriptionPlans.map((plan) => (
                <SubscriptionPlanCard 
                  key={plan.id} 
                  plan={plan}
                />
              ))}
            </div>
            
            <Alert className="mt-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Enterprise Plan Coming Soon</AlertTitle>
              <AlertDescription>
                Need higher limits or custom features? Enterprise plans will be available soon. 
                Contact our support team for more information.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
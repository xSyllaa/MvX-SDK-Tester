"use client";

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SubscriptionPlanType } from '@/lib/subscription-plans';
import { formatDistanceToNow } from 'date-fns';

type UsageData = {
  plan: SubscriptionPlanType;
  usage: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  reset: {
    daily: string;
    weekly: string;
    monthly: string;
  };
};

export function UsageDisplay() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ai/usage');
        if (!response.ok) {
          throw new Error('Failed to fetch usage data');
        }
        const data = await response.json();
        setUsageData(data);
      } catch (err) {
        setError('Could not load usage data. Please try again later.');
        console.error('Error fetching usage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
    // Refresh data every minute
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>Loading your usage data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!usageData) {
    return null;
  }

  // Format reset times relative to now
  const formatReset = (resetTime: string) => {
    try {
      return formatDistanceToNow(new Date(resetTime), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get subscription plan name for display
  const getPlanDisplay = (plan: SubscriptionPlanType) => {
    switch (plan) {
      case SubscriptionPlanType.FREE:
        return { name: 'Free', color: 'bg-gray-500' };
      case SubscriptionPlanType.PREMIUM:
        return { name: 'Premium', color: 'bg-blue-500' };
      case SubscriptionPlanType.ENTERPRISE:
        return { name: 'Enterprise', color: 'bg-purple-600' };
      default:
        return { name: 'Unknown', color: 'bg-gray-500' };
    }
  };

  const planInfo = getPlanDisplay(usageData.plan);

  // Calculate percentages for progress bars
  const dailyPercentage = Math.min(100, (usageData.usage.daily / usageData.limits.daily) * 100);
  const weeklyPercentage = Math.min(100, (usageData.usage.weekly / usageData.limits.weekly) * 100);
  const monthlyPercentage = Math.min(100, (usageData.usage.monthly / usageData.limits.monthly) * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>API Usage</CardTitle>
            <CardDescription>Track your current API usage</CardDescription>
          </div>
          <Badge className={planInfo.color}>{planInfo.name} Plan</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Daily Usage</div>
              <div className="text-sm text-gray-500">
                {usageData.usage.daily} / {usageData.limits.daily} requests
              </div>
            </div>
            <Progress value={dailyPercentage} 
              className={dailyPercentage > 90 ? 'bg-red-200' : 'bg-gray-200'} />
            <div className="text-xs text-gray-500 mt-1">
              Resets {formatReset(usageData.reset.daily)}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Weekly Usage</div>
              <div className="text-sm text-gray-500">
                {usageData.usage.weekly} / {usageData.limits.weekly} requests
              </div>
            </div>
            <Progress value={weeklyPercentage} 
              className={weeklyPercentage > 90 ? 'bg-red-200' : 'bg-gray-200'} />
            <div className="text-xs text-gray-500 mt-1">
              Resets {formatReset(usageData.reset.weekly)}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Monthly Usage</div>
              <div className="text-sm text-gray-500">
                {usageData.usage.monthly} / {usageData.limits.monthly} requests
              </div>
            </div>
            <Progress value={monthlyPercentage} 
              className={monthlyPercentage > 90 ? 'bg-red-200' : 'bg-gray-200'} />
            <div className="text-xs text-gray-500 mt-1">
              Resets {formatReset(usageData.reset.monthly)}
            </div>
          </div>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between pt-4">
        {usageData.plan !== SubscriptionPlanType.ENTERPRISE && (
          <Button variant="outline">Upgrade Plan</Button>
        )}
        <Button variant="ghost" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </CardFooter>
    </Card>
  );
} 
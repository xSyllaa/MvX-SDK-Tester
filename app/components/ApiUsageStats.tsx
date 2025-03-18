"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UsageStats {
  daily: number;
  weekly: number;
  monthly: number;
}

interface UsageLimits {
  daily: number;
  weekly: number;
  monthly: number;
}

interface UsageResetTimes {
  daily: string;
  weekly: string;
  monthly: string;
}

interface UsageData {
  plan: string;
  usage: UsageStats;
  limits: UsageLimits;
  reset: UsageResetTimes;
}

// Prop type for the component
interface ApiUsageStatsProps {
  userPlan?: {
    id: string;
    name: string;
    limits?: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  } | null;
  className?: string;
}

export default function ApiUsageStats({ userPlan, className }: ApiUsageStatsProps) {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsageData() {
      try {
        setLoading(true);
        const response = await fetch('/api/ai/usage');
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('You must be logged in to view your usage.');
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'An error occurred while retrieving usage data.');
          }
          return;
        }
        
        const data = await response.json();
        setUsageData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching usage data:', error);
        setError('Connection error. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsageData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchUsageData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format reset time
  const formatResetTime = (resetTimeStr: string) => {
    if (!resetTimeStr) return 'Unknown';
    
    try {
      const resetTime = new Date(resetTimeStr);
      return formatDistanceToNow(resetTime, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting reset time:', error);
      return 'Unknown';
    }
  };

  // Calculate usage percentage
  const calculatePercentage = (used: number, limit: number) => {
    if (!limit) return 0;
    const percentage = (used / limit) * 100;
    return Math.min(percentage, 100); // Cap at 100% maximum
  };

  // Get appropriate color based on usage percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-amber-500';
    return 'text-emerald-500';
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Use real data if available, otherwise fall back to simulated data based on userPlan
  const limits = usageData?.limits || {
    daily: userPlan?.limits?.daily || 5,
    weekly: userPlan?.limits?.weekly || 15,
    monthly: userPlan?.limits?.monthly || 30
  };

  const usage = usageData?.usage || {
    daily: 0,
    weekly: 0,
    monthly: 0
  };

  const reset = usageData?.reset || {
    daily: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    weekly: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    monthly: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  // Check if any limits are exceeded
  const isExceeded = {
    daily: usage.daily >= limits.daily,
    weekly: usage.weekly >= limits.weekly,
    monthly: usage.monthly >= limits.monthly
  };

  const dailyPercentage = calculatePercentage(usage.daily, limits.daily);
  const weeklyPercentage = calculatePercentage(usage.weekly, limits.weekly);
  const monthlyPercentage = calculatePercentage(usage.monthly, limits.monthly);

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Daily Usage */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Daily Usage</div>
              <div className="text-sm text-muted-foreground">
                {usage.daily} / {limits.daily} requests
              </div>
            </div>
            <div className={`progress-daily`}>
              <Progress value={dailyPercentage} />
            </div>
            <p className="text-xs mt-1 text-muted-foreground">
              {isExceeded.daily ? (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Daily limit reached. Resets {formatResetTime(reset.daily)}.
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" /> Resets {formatResetTime(reset.daily)}.
                </span>
              )}
            </p>
          </div>

          {/* Weekly Usage */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Weekly Usage</div>
              <div className="text-sm text-muted-foreground">
                {usage.weekly} / {limits.weekly} requests
              </div>
            </div>
            <div className={`progress-weekly`}>
              <Progress value={weeklyPercentage} />
            </div>
            <p className="text-xs mt-1 text-muted-foreground">
              {isExceeded.weekly ? (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Weekly limit reached. Resets {formatResetTime(reset.weekly)}.
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" /> Resets {formatResetTime(reset.weekly)}.
                </span>
              )}
            </p>
          </div>

          {/* Monthly Usage */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Monthly Usage</div>
              <div className="text-sm text-muted-foreground">
                {usage.monthly} / {limits.monthly} requests
              </div>
            </div>
            <div className={`progress-monthly`}>
              <Progress value={monthlyPercentage} />
            </div>
            <p className="text-xs mt-1 text-muted-foreground">
              {isExceeded.monthly ? (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Monthly limit reached. Resets {formatResetTime(reset.monthly)}.
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" /> Resets {formatResetTime(reset.monthly)}.
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-400">SDK Analysis: Unlimited</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-500">
          The usage limits shown above only apply to AI Chatbot requests. 
          SDK Analysis remains unlimited for all users regardless of plan.
        </AlertDescription>
      </Alert>

      <style jsx global>{`
        .progress-daily :global(.progress) {
          ${dailyPercentage >= 90 ? 'background-color: rgb(239 68 68 / 0.2);' : ''}
        }
        .progress-daily :global(div[role="progressbar"]) {
          ${dailyPercentage >= 90 ? 'background-color: rgb(239 68 68);' : 
          dailyPercentage >= 75 ? 'background-color: rgb(245 158 11);' : 
          'background-color: rgb(16 185 129);'}
        }
        
        .progress-weekly :global(.progress) {
          ${weeklyPercentage >= 90 ? 'background-color: rgb(239 68 68 / 0.2);' : ''}
        }
        .progress-weekly :global(div[role="progressbar"]) {
          ${weeklyPercentage >= 90 ? 'background-color: rgb(239 68 68);' : 
          weeklyPercentage >= 75 ? 'background-color: rgb(245 158 11);' : 
          'background-color: rgb(16 185 129);'}
        }
        
        .progress-monthly :global(.progress) {
          ${monthlyPercentage >= 90 ? 'background-color: rgb(239 68 68 / 0.2);' : ''}
        }
        .progress-monthly :global(div[role="progressbar"]) {
          ${monthlyPercentage >= 90 ? 'background-color: rgb(239 68 68);' : 
          monthlyPercentage >= 75 ? 'background-color: rgb(245 158 11);' : 
          'background-color: rgb(16 185 129);'}
        }
      `}</style>
    </div>
  );
} 
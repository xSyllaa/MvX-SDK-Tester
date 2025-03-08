'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AIUsageStatusProps {
  className?: string;
}

export function AIUsageStatus({ className }: AIUsageStatusProps) {
  const { data: session } = useSession();
  const [usageData, setUsageData] = useState<{
    current: number;
    limit: number;
    reset?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai');
      
      if (!response.ok) {
        const data = await response.json();
        
        if (response.status === 429) {
          // Rate limit atteint
          setUsageData({
            current: data.current || 10,
            limit: data.limit || 10,
            reset: data.reset
          });
        } else {
          throw new Error(data.error || 'Failed to fetch AI usage data');
        }
      } else {
        // Si nous sommes ici, c'est que nous n'avons pas atteint la limite
        // Nous devons faire une requête séparée pour obtenir le nombre actuel
        const fetchCurrentUsage = async () => {
          try {
            const usageResponse = await fetch('/api/ai/usage');
            if (usageResponse.ok) {
              const usageData = await usageResponse.json();
              return usageData.current || 0;
            }
            return 0;
          } catch {
            return 0;
          }
        };
        
        const current = await fetchCurrentUsage();
        
        setUsageData({
          current,
          limit: 10, // Valeur par défaut
          reset: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching AI usage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUsageData();
    }
  }, [session]);

  if (!session) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>AI Usage</CardTitle>
          <CardDescription>Sign in to track your AI usage</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Anonymous users are limited to 3 AI requests per day. Sign in for more requests.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading && !usageData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>AI Usage</CardTitle>
          <CardDescription>Loading your usage data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
        </CardContent>
      </Card>
    );
  }

  if (error && !usageData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>AI Usage</CardTitle>
          <CardDescription>Failed to load usage data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
          <Button onClick={fetchUsageData} variant="outline" size="sm" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculer les valeurs pour l'affichage
  const percentage = usageData ? Math.round((usageData.current / usageData.limit) * 100) : 0;
  const remaining = usageData ? usageData.limit - usageData.current : 0;
  const resetDate = usageData?.reset ? new Date(usageData.reset) : new Date(new Date().setHours(24, 0, 0, 0));
  
  // Formater le temps restant en heures et minutes
  const now = new Date();
  const hoursDiff = Math.floor((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesDiff = Math.floor(((resetDate.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Usage</CardTitle>
            <CardDescription>Your daily AI request limit</CardDescription>
          </div>
          <Badge variant={remaining > 0 ? "outline" : "destructive"}>
            {remaining > 0 ? `${remaining} left` : 'Limit reached'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{usageData?.current || 0} used</span>
            <span>{usageData?.limit || 10} limit</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Resets in {hoursDiff}h {minutesDiff}m
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={fetchUsageData} variant="outline" size="sm" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Usage
        </Button>
      </CardFooter>
    </Card>
  );
} 
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AIUsageStatusProps {
  className?: string;
}

interface UsageStats {
  totalRequests: number;
  monthlyRequests: number;
  dailyRequests: number;
  monthlyLimit: number;
}

export function AIUsageStatus({ className = '' }: AIUsageStatusProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats>({
    totalRequests: 0,
    monthlyRequests: 0,
    dailyRequests: 0,
    monthlyLimit: 1000 // Limite par défaut
  });

  useEffect(() => {
    const fetchUsageStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/ai/usage/stats', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch AI usage stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageStats();
  }, []);

  const handleViewPlans = () => {
    router.push('/subscription');
  };

  // Calculer le pourcentage d'utilisation mensuelle
  const monthlyUsagePercentage = (stats.monthlyRequests / stats.monthlyLimit) * 100;

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <CardContent className="p-0">
          <div className="h-24 flex items-center justify-center">
            <div className="animate-pulse text-sm text-muted-foreground">
              Loading usage statistics...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <CardTitle className="text-sm font-medium flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4" />
        AI Usage Statistics
      </CardTitle>
      
      <CardContent className="p-0 space-y-6">
        {/* Monthly Usage */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Monthly Usage</span>
            <span className="font-medium">
              {stats.monthlyRequests}/{stats.monthlyLimit}
            </span>
          </div>
          <Progress 
            value={monthlyUsagePercentage} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Resets at the beginning of each month
          </p>
        </div>

        {/* Usage Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-semibold">
              {stats.dailyRequests}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Today's Requests
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-semibold">
              {stats.totalRequests}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total Requests
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={handleViewPlans}
        >
          View upgrade options
        </Button>
      </CardContent>
    </Card>
  );
} 
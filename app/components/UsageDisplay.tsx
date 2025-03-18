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
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export default function UsageDisplay() {
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
            setError('Vous devez être connecté pour voir votre utilisation.');
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Une erreur est survenue lors de la récupération des données d\'utilisation.');
          }
          return;
        }
        
        const data = await response.json();
        setUsageData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching usage data:', error);
        setError('Erreur de connexion. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsageData();

    // Rafraîchir les données toutes les 5 minutes
    const interval = setInterval(fetchUsageData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Formater le temps restant avant réinitialisation
  const formatResetTime = (resetTimeStr: string) => {
    if (!resetTimeStr) return 'Inconnu';
    
    try {
      const resetTime = new Date(resetTimeStr);
      return formatDistanceToNow(resetTime, { addSuffix: true, locale: fr });
    } catch (error) {
      console.error('Error formatting reset time:', error);
      return 'Inconnu';
    }
  };

  // Calculer le pourcentage d'utilisation
  const calculatePercentage = (used: number, limit: number) => {
    if (!limit) return 0;
    const percentage = (used / limit) * 100;
    return Math.min(percentage, 100); // Limiter à 100% maximum
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-8 w-3/4" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-1/2" /></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!usageData) return null;

  const { plan, usage, limits, reset } = usageData;
  
  // Vérifier si des limites sont dépassées
  const isExceeded = {
    daily: usage.daily >= limits.daily,
    weekly: usage.weekly >= limits.weekly,
    monthly: usage.monthly >= limits.monthly
  };

  // Get subscription plan name for display
  const getPlanDisplay = (plan: string) => {
    switch (plan) {
      case 'free':
        return { name: 'Free', color: 'bg-gray-500' };
      case 'premium':
        return { name: 'Premium', color: 'bg-blue-500' };
      case 'enterprise':
        return { name: 'Enterprise', color: 'bg-purple-600' };
      default:
        return { name: 'Unknown', color: 'bg-gray-500' };
    }
  };

  const planInfo = getPlanDisplay(plan);

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
                {usage.daily} / {limits.daily} requests
              </div>
            </div>
            <Progress value={calculatePercentage(usage.daily, limits.daily)} 
              className={isExceeded.daily ? 'bg-red-200' : 'bg-gray-200'} />
            <p className="text-xs text-muted-foreground">
              {isExceeded.daily ? (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Limite quotidienne atteinte. Réinitialisation {formatResetTime(reset.daily)}.
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Réinitialisation {formatResetTime(reset.daily)}.
                </span>
              )}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Weekly Usage</div>
              <div className="text-sm text-gray-500">
                {usage.weekly} / {limits.weekly} requests
              </div>
            </div>
            <Progress value={calculatePercentage(usage.weekly, limits.weekly)} 
              className={isExceeded.weekly ? 'bg-red-200' : 'bg-gray-200'} />
            <p className="text-xs text-muted-foreground">
              {isExceeded.weekly ? (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Limite hebdomadaire atteinte. Réinitialisation {formatResetTime(reset.weekly)}.
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Réinitialisation {formatResetTime(reset.weekly)}.
                </span>
              )}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Monthly Usage</div>
              <div className="text-sm text-gray-500">
                {usage.monthly} / {limits.monthly} requests
              </div>
            </div>
            <Progress value={calculatePercentage(usage.monthly, limits.monthly)} 
              className={isExceeded.monthly ? 'bg-red-200' : 'bg-gray-200'} />
            <p className="text-xs text-muted-foreground">
              {isExceeded.monthly ? (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Limite mensuelle atteinte. Réinitialisation {formatResetTime(reset.monthly)}.
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Réinitialisation {formatResetTime(reset.monthly)}.
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between pt-4">
        {plan === 'free' && (
          <Alert className="mt-4 bg-primary/5 border-primary/20">
            <AlertTitle className="text-primary">Besoin de plus de requêtes ?</AlertTitle>
            <AlertDescription>
              Envisagez de passer au Plan Premium pour obtenir des limites plus élevées et des fonctionnalités supplémentaires.
            </AlertDescription>
          </Alert>
        )}
        <Button variant="ghost" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </CardFooter>
    </Card>
  );
} 
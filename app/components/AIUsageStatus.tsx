'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Info, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIUsageStatusProps {
  className?: string;
}

export function AIUsageStatus({ className = '' }: AIUsageStatusProps) {
  const router = useRouter();
  const [anonymousLimit] = useState(3); // Limite fixe pour les utilisateurs anonymes
  const [anonymousUsed, setAnonymousUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'utilisation anonyme depuis un cookie ou localStorage
    const fetchAnonymousUsage = () => {
      setLoading(true);
      try {
        // Essayer de récupérer l'utilisation depuis localStorage
        const storedUsage = localStorage.getItem('anonymousApiUsage');
        const usage = storedUsage ? parseInt(storedUsage, 10) : 0;
        setAnonymousUsed(usage);
      } catch (e) {
        console.error('Error fetching anonymous usage', e);
        setAnonymousUsed(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAnonymousUsage();
  }, []);

  const handleSignInClick = () => {
    signIn(undefined, { callbackUrl: '/account' });
  };

  const handleSubscriptionClick = () => {
    router.push('/subscription');
  };

  // Calculer le pourcentage d'utilisation
  const usagePercentage = (anonymousUsed / anonymousLimit) * 100;
  const isLimitReached = anonymousUsed >= anonymousLimit;

  return (
    <Card className={`p-4 ${className}`}>
      <CardTitle className="text-sm font-medium flex items-center gap-2 mb-3">
        <Info className="h-4 w-4" />
        AI Chatbot Access
      </CardTitle>
      
      <CardContent className="p-0 space-y-4">
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs ml-2">
            AI Chatbot requires authentication
          </AlertDescription>
        </Alert>
        
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">
            <strong>SDK Analysis:</strong> Unlimited for all users
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            <strong>AI Chatbot:</strong> Authentication required
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full" 
            onClick={handleSignInClick}
          >
            Sign in for AI Chatbot
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={handleSubscriptionClick}
          >
            View plans
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
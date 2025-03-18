"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type SubscriptionPlanFeature = {
  title: string;
  included: boolean;
};

type SubscriptionPlanDetails = {
  id: string;
  name: string;
  description: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  badge?: string;
  features: SubscriptionPlanFeature[];
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  isPopular?: boolean;
  isActive?: boolean;
};

type SubscriptionPlanCardProps = {
  plan: SubscriptionPlanDetails;
  className?: string;
  showUpgradeButton?: boolean;
};

export default function SubscriptionPlanCard({ 
  plan, 
  className,
  showUpgradeButton = true
}: SubscriptionPlanCardProps) {
  const router = useRouter();
  
  const handleUpgrade = () => {
    router.push('/subscription');
  };
  
  return (
    <Card className={cn(
      "w-full transition-all", 
      plan.isPopular && "border-primary shadow-md", 
      plan.isActive && "bg-primary/5",
      className
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription className="mt-1.5">{plan.description}</CardDescription>
          </div>
          
          {(plan.badge || plan.isActive) && (
            <Badge variant={plan.isActive ? "default" : "outline"} className={cn(
              plan.isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}>
              {plan.isActive ? "Active Plan" : plan.badge}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Prix */}
        <div>
          {plan.priceMonthly !== null ? (
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">${plan.priceMonthly}</span>
              <span className="text-muted-foreground ml-1.5">/month</span>
            </div>
          ) : (
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">Free</span>
            </div>
          )}
          
          {plan.priceYearly !== null && (
            <p className="text-sm text-muted-foreground mt-1">
              ${plan.priceYearly}/year (save ${plan.priceMonthly! * 12 - plan.priceYearly})
            </p>
          )}
        </div>
        
        {/* Limites d'utilisation */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium">Usage Limits</h4>
          <ul className="space-y-1">
            <li className="text-sm flex justify-between">
              <span className="text-muted-foreground">Daily AI Chatbot Requests</span>
              <span>{plan.limits.daily}</span>
            </li>
            <li className="text-sm flex justify-between">
              <span className="text-muted-foreground">Weekly AI Chatbot Requests</span>
              <span>{plan.limits.weekly}</span>
            </li>
            <li className="text-sm flex justify-between">
              <span className="text-muted-foreground">Monthly AI Chatbot Requests</span>
              <span>{plan.limits.monthly}</span>
            </li>
            <li className="text-sm flex justify-between">
              <span className="text-muted-foreground">SDK Analysis</span>
              <span>Unlimited</span>
            </li>
          </ul>
        </div>
        
        {/* Fonctionnalités */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium">Features</h4>
          <ul className="space-y-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="text-sm flex items-baseline space-x-2">
                <Check className={cn(
                  "h-3.5 w-3.5 shrink-0", 
                  feature.included ? "text-primary" : "text-muted-foreground/30"
                )} />
                <span className={feature.included ? undefined : "text-muted-foreground/50 line-through"}>
                  {feature.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter>
        {showUpgradeButton ? (
          plan.isActive ? (
            <Button className="w-full" variant="outline" disabled>
              Current Plan
            </Button>
          ) : (
            <Button
              className="w-full" 
              variant={plan.isPopular ? "default" : "outline"}
              onClick={handleUpgrade}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {plan.isPopular ? "Upgrade to " + plan.name : "Select " + plan.name}
            </Button>
          )
        ) : null}
      </CardFooter>
    </Card>
  );
} 
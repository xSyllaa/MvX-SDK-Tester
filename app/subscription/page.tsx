"use client";

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";
import { SubscriptionPlanType, SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { UsageDisplay } from '../components/UsageDisplay';
import { WaitlistForm } from '../components/WaitlistForm';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Choose the plan that fits your needs
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Free Plan */}
        <PlanCard
          title="Free"
          price="$0"
          description="Basic access for personal use"
          features={SUBSCRIPTION_PLANS[SubscriptionPlanType.FREE].features}
          ctaText="Current Plan"
          disabled={true}
          highlighted={false}
          isComingSoon={false}
        />

        {/* Premium Plan */}
        <PlanCard
          title="Premium"
          description="Enhanced features for professionals"
          features={SUBSCRIPTION_PLANS[SubscriptionPlanType.PREMIUM].features}
          ctaText="Join Waitlist"
          disabled={false}
          highlighted={true}
          isComingSoon={true}
          tier={SubscriptionPlanType.PREMIUM}
        />

        {/* Enterprise Plan */}
        <PlanCard
          title="Enterprise"
          description="Advanced features for teams and organizations"
          features={SUBSCRIPTION_PLANS[SubscriptionPlanType.ENTERPRISE].features}
          ctaText="Join Waitlist"
          disabled={false}
          highlighted={false}
          isComingSoon={true}
          tier={SubscriptionPlanType.ENTERPRISE}
        />
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Your Current Usage</h2>
        <UsageDisplay />
      </div>

      <div className="mt-12 bg-muted p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">How do the request limits work?</h3>
            <p className="text-muted-foreground">
              Request limits are reset daily, weekly, and monthly. Once you reach a limit, you'll need to wait 
              until the next reset period or upgrade your plan to continue using the service.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium">When will Premium and Enterprise plans be available?</h3>
            <p className="text-muted-foreground">
              We're currently working on finalizing these tiers. Join our waitlist to be notified as soon as they become available 
              and to get priority access.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium">What are the key differences between plans?</h3>
            <p className="text-muted-foreground">
              Free plan offers basic functionality with limited requests, Premium adds extended limits and advanced features, 
              while Enterprise includes dedicated support, custom integrations, and prioritized requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlanCardProps {
  title: string;
  price?: string;
  period?: string;
  description: string;
  features: string[];
  ctaText: string;
  disabled: boolean;
  highlighted: boolean;
  isComingSoon: boolean;
  tier?: SubscriptionPlanType;
}

function PlanCard({
  title,
  price,
  period = '',
  description,
  features,
  ctaText,
  disabled,
  highlighted,
  isComingSoon,
  tier
}: PlanCardProps) {
  return (
    <Card className={`flex flex-col ${highlighted ? 'border-primary shadow-lg' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {isComingSoon && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 whitespace-nowrap flex-shrink-0">
              <Clock className="mr-1 h-3 w-3" />
              Coming Soon
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {price && (
          <div className="flex items-baseline mb-4">
            <span className="text-3xl font-bold">{price}</span>
            {period && <span className="text-muted-foreground ml-1">{period}</span>}
          </div>
        )}
        {!price && !isComingSoon && (
          <div className="h-10">
            {/* Spacer when no price */}
          </div>
        )}
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isComingSoon && tier ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full" variant={highlighted ? "default" : "outline"}>
                {ctaText}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="text-center">
                <DialogTitle className="text-xl">Join {title} Waitlist</DialogTitle>
                <DialogDescription className="mx-auto max-w-sm">
                  Be among the first to access our {title} tier when it launches.
                </DialogDescription>
              </DialogHeader>
              <WaitlistForm 
                defaultTier={tier} 
                showTitle={false} 
              />
            </DialogContent>
          </Dialog>
        ) : (
          <Button className="w-full" disabled={disabled} variant={highlighted ? "default" : "outline"}>
            {ctaText}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 
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
import { Check, Clock, PlusCircle, ChevronDown } from "lucide-react";
import { SubscriptionPlanType, SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import UsageDisplay from '../components/UsageDisplay';
import { WaitlistForm } from '../components/WaitlistForm';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from 'next-auth/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

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

      {/* Afficher la section d'utilisation uniquement si l'utilisateur est authentifié */}
      {isAuthenticated && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Your Current Usage</h2>
          <UsageDisplay />
        </div>
      )}

      <div className="mt-12 bg-gradient-to-b from-muted/50 to-muted rounded-xl p-8 border shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full space-y-2">
          <AccordionItem value="item-1" className="border rounded-lg px-4 shadow-sm bg-card">
            <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline">
              How do the request limits work?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 pt-1">
              <p>
                Request limits are reset at different intervals:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Daily:</strong> Reset every 24 hours at midnight UTC</li>
                <li><strong>Weekly:</strong> Reset every Sunday at midnight UTC</li>
                <li><strong>Monthly:</strong> Reset on the first day of each calendar month</li>
              </ul>
              <p className="mt-2">
                Once you reach a limit, you'll need to wait until the next reset period or upgrade your plan to continue using the service.
              </p>
              <p className="mt-2">
                <strong>Note:</strong> SDK Analysis remains unlimited for all users, regardless of plan.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="border rounded-lg px-4 shadow-sm bg-card">
            <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline">
              When will Premium and Enterprise plans be available?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 pt-1">
              <p>
                We're currently in the final stages of development for our Premium and Enterprise tiers. 
                These advanced plans will offer significantly higher API limits and exclusive features.
              </p>
              <p className="mt-2">
                Join our waitlist to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Be notified as soon as these plans become available</li>
                <li>Get priority access during the initial launch</li>
                <li>Receive special early-adopter pricing</li>
              </ul>
              <p className="mt-2">
                We expect to launch these plans within the next quarter.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3" className="border rounded-lg px-4 shadow-sm bg-card">
            <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline">
              What are the key differences between plans?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 pt-1">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Free Plan:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Basic AI Chatbot functionality</li>
                    <li>Limited number of daily, weekly, and monthly requests</li>
                    <li>Unlimited SDK Analysis</li>
                    <li>Community support</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Premium Plan:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Advanced AI Chatbot with extended capabilities</li>
                    <li>Significantly higher request limits</li>
                    <li>Priority support via email</li>
                    <li>Advanced analytics and reporting</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Enterprise Plan:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All Premium features</li>
                    <li>Dedicated support with faster response times</li>
                    <li>Custom integrations</li>
                    <li>Team collaboration features</li>
                    <li>SLA guarantees</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4" className="border rounded-lg px-4 shadow-sm bg-card">
            <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline">
              Can I upgrade or downgrade my plan at any time?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 pt-1">
              <p>
                Yes, you can change your subscription plan at any time from your account settings. 
                When upgrading, you'll immediately gain access to the higher tier benefits. 
              </p>
              <p className="mt-2">
                When downgrading, your current plan will remain active until the end of your billing period, 
                after which the new plan will take effect. Any unused credits or higher-tier features will 
                not carry over to the new plan.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
    <Card className={`flex flex-col h-full ${highlighted ? 'border-primary shadow-lg' : ''}`}>
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
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 mr-2 text-primary mt-1 shrink-0" />
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
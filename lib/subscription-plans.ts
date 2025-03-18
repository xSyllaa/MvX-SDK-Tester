/**
 * Types and constants for subscription plan management
 * Defines API request limits for each plan
 */

export enum SubscriptionPlanType {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export interface RequestLimits {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface SubscriptionPlan {
  id: SubscriptionPlanType;
  name: string;
  description: string;
  requestLimits: RequestLimits;
  features: string[];
  price?: number; // Monthly price in USD (optional for free tier)
}

/**
 * Available subscription plans definition
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanType, SubscriptionPlan> = {
  [SubscriptionPlanType.FREE]: {
    id: SubscriptionPlanType.FREE,
    name: "Free",
    description: "Limited access for free users",
    requestLimits: {
      daily: 5,
      weekly: 15,
      monthly: 30
    },
    features: [
      "Limited AI chat access",
      "Basic SDK analysis",
      "Public documentation"
    ]
  },
  [SubscriptionPlanType.PREMIUM]: {
    id: SubscriptionPlanType.PREMIUM,
    name: "Premium",
    description: "Advanced access for developers",
    requestLimits: {
      daily: 20,
      weekly: 100,
      monthly: 300
    },
    features: [
      "Full AI chat access",
      "Advanced SDK analysis",
      "Complete documentation",
      "Priority access"
    ],
    price: 9.99
  },
  [SubscriptionPlanType.ENTERPRISE]: {
    id: SubscriptionPlanType.ENTERPRISE,
    name: "Enterprise",
    description: "Complete solution for businesses",
    requestLimits: {
      daily: 100,
      weekly: 500,
      monthly: 2000
    },
    features: [
      "Unlimited AI chat access",
      "Advanced SDK analysis",
      "Complete documentation",
      "Dedicated support",
      "Custom API"
    ],
    price: 49.99
  }
};

/**
 * Get request limits for a specific plan
 * @param planType Plan type
 * @returns Request limits for that plan
 */
export function getPlanLimits(planType: SubscriptionPlanType): RequestLimits {
  return SUBSCRIPTION_PLANS[planType].requestLimits;
}

/**
 * Returns the default plan (free)
 * @returns Default free plan
 */
export function getDefaultPlan(): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[SubscriptionPlanType.FREE];
}

/**
 * Check if a user has exceeded their request limits
 * @param usageStats User's usage statistics
 * @param planType User's subscription plan type
 * @returns An object indicating if limits are exceeded and for which periods
 */
export function checkLimitsExceeded(
  usageStats: { daily: number; weekly: number; monthly: number },
  planType: SubscriptionPlanType = SubscriptionPlanType.FREE
): { exceeded: boolean; daily: boolean; weekly: boolean; monthly: boolean } {
  const limits = getPlanLimits(planType);
  
  return {
    daily: usageStats.daily >= limits.daily,
    weekly: usageStats.weekly >= limits.weekly,
    monthly: usageStats.monthly >= limits.monthly,
    exceeded: 
      usageStats.daily >= limits.daily || 
      usageStats.weekly >= limits.weekly || 
      usageStats.monthly >= limits.monthly
  };
} 
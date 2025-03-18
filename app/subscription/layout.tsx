import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription Plans | MvX SDK Tester',
  description: 'Choose the subscription plan that fits your needs',
};

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
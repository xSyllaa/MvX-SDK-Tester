import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'My Account | MvX SDK Tester',
  description: 'Manage your account and check your API usage',
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
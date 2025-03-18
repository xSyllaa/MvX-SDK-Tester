"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SubscriptionPlanType } from '@/lib/subscription-plans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

// Schéma de validation
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  contactType: z.literal('email'),
  tier: z.nativeEnum(SubscriptionPlanType)
});

const walletSchema = z.object({
  walletAddress: z.string().min(5, 'Please enter a valid MultiversX wallet address'),
  contactType: z.literal('wallet'),
  tier: z.nativeEnum(SubscriptionPlanType)
});

const formSchema = z.discriminatedUnion('contactType', [emailSchema, walletSchema]);

type FormValues = z.infer<typeof formSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;
type WalletFormValues = z.infer<typeof walletSchema>;

interface WaitlistFormProps {
  defaultTier?: SubscriptionPlanType;
  showTitle?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export function WaitlistForm({ 
  defaultTier = SubscriptionPlanType.PREMIUM, 
  showTitle = true,
  className = "",
  onSuccess
}: WaitlistFormProps) {
  const [contactMethod, setContactMethod] = useState<'email' | 'wallet'>('email');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Initialiser le form
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactType: 'email',
      tier: defaultTier
    }
  });
  
  // Gérer le changement de méthode de contact
  const handleContactMethodChange = (value: string) => {
    if (value === 'email' || value === 'wallet') {
      setContactMethod(value);
      setValue('contactType', value);
    }
  };
  
  // Soumettre le formulaire
  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.contactType === 'email' ? data.email : undefined,
          walletAddress: data.contactType === 'wallet' ? data.walletAddress : undefined,
          tier: data.tier
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus('success');
        reset();
        if (onSuccess) onSuccess();
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to join waitlist. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again later.');
      console.error('Waitlist submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle>Join the Waitlist</CardTitle>
          <CardDescription>
            Be among the first to access our advanced features when they launch.
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent>
        {submitStatus === 'success' ? (
          <Alert className="bg-green-50 border-green-300">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Subscription Request Received</AlertTitle>
            <AlertDescription className="text-green-700">
              Thank you for joining our waitlist! We'll notify you when the tier becomes available.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 pt-4">
            <Tabs defaultValue="email" onValueChange={handleContactMethodChange} className="w-full mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="wallet">MultiversX Wallet</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4 pt-2">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full"
                    {...register('email')}
                  />
                  {contactMethod === 'email' && (errors as any).email && (
                    <p className="text-sm text-red-500">{(errors as any).email.message}</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="wallet" className="space-y-4 pt-2">
                <div className="space-y-3">
                  <Label htmlFor="walletAddress" className="text-base">Wallet Address</Label>
                  <Input
                    id="walletAddress"
                    placeholder="erd1..."
                    className="w-full"
                    {...register('walletAddress')}
                  />
                  {contactMethod === 'wallet' && (errors as any).walletAddress && (
                    <p className="text-sm text-red-500">{(errors as any).walletAddress.message}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <input 
              type="hidden" 
              {...register('tier')} 
              value={defaultTier} 
            />
            
            {submitStatus === 'error' && (
              <Alert className="mt-4 bg-red-50 border-red-300">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-center mt-6">
              <Button type="submit" disabled={submitting} className="min-w-32">
                {submitting ? 'Processing...' : 'Join Waitlist'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 
"use client";

import Link from "next/link";
import { ArrowLeft, Home, Eye, ArrowRight, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function SubmitSuccessPage() {
  return (
    <div className="container max-w-5xl py-16 px-4">
      <motion.div 
        className="flex flex-col items-center text-center py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Check className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
          Component Submitted Successfully!
        </h1>
        <p className="text-muted-foreground max-w-[600px] mb-8">
          Thank you for your contribution to the MultiversX community. Our team will review your component and make it available as soon as possible.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/components/submit">
              <Plus className="mr-2 h-4 w-4" />
              Submit Another Component
            </Link>
          </Button>
        </div>
      </motion.div>
      
      <div className="mt-16 border-t pt-8">
        <h2 className="text-xl font-bold mb-4">What Happens Next?</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border rounded-lg p-6 space-y-3">
            <div className="rounded-full bg-muted h-8 w-8 flex items-center justify-center font-bold">1</div>
            <h3 className="font-bold">Component Review</h3>
            <p className="text-sm text-muted-foreground">
              Our team will review your component to ensure it meets our quality standards.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 space-y-3">
            <div className="rounded-full bg-muted h-8 w-8 flex items-center justify-center font-bold">2</div>
            <h3 className="font-bold">Publication</h3>
            <p className="text-sm text-muted-foreground">
              Once approved, your component will be published in our community library.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 space-y-3">
            <div className="rounded-full bg-muted h-8 w-8 flex items-center justify-center font-bold">3</div>
            <h3 className="font-bold">Sharing</h3>
            <p className="text-sm text-muted-foreground">
              Your component will be available to all developers in the MultiversX community.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-12">
        <Button variant="ghost" asChild>
          <Link href="/key-components" className="flex items-center">
            Explore Component Library
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
} 
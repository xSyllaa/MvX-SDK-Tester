"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, Mail, Calendar, Edit, LogOut, 
  Settings, CreditCard, MoreHorizontal, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserProfileCardProps = {
  userData: {
    id: string;
    name: string;
    email: string;
    image?: string;
    joinDate: string;
    plan: string;
  };
  className?: string;
  onLogout: () => void;
};

export default function UserProfileCard({ userData, className, onLogout }: UserProfileCardProps) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Générer les initiales pour l'avatar fallback
  const getInitials = () => {
    if (!userData.name) return 'U';
    
    const nameParts = userData.name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  };
  
  // Formater la date d'inscription
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Naviguer vers l'édition du profil
  const handleEditProfile = () => {
    setIsSettingsOpen(false);
    router.push('/account?tab=profile');
  };
  
  // Naviguer vers la gestion de l'abonnement
  const handleManageSubscription = () => {
    setIsSettingsOpen(false);
    router.push('/account?tab=subscription');
  };
  
  // Naviguer vers les paramètres de sécurité
  const handleSecuritySettings = () => {
    setIsSettingsOpen(false);
    router.push('/account?tab=profile&section=security');
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>User Profile</CardTitle>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditProfile} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSecuritySettings} className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Security Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleManageSubscription} className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Manage Subscription</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>Your personal account information</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar et infos principales */}
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData.image} alt={userData.name} />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <Badge variant="outline">{userData.plan}</Badge>
          </div>
          
          {/* Informations détaillées */}
          <div className="flex-1 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{userData.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{formatJoinDate(userData.joinDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={handleEditProfile}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={handleSecuritySettings}
          >
            <Shield className="mr-2 h-4 w-4" />
            Security Settings
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={handleManageSubscription}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start text-destructive hover:text-destructive"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
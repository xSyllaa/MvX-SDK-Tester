"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const { toast } = useToast();
  
  const passwordsMatch = newPassword === confirmPassword;
  const isValidNewPassword = newPassword.length >= 8;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(false);
    
    // Basic validation
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }
    
    if (!isValidNewPassword) {
      setError("New password must be at least 8 characters long");
      return;
    }
    
    if (!passwordsMatch) {
      setError("New passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Implement actual password change API call
      // For now, simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful password change
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password changed",
        description: "Your password has been successfully updated.",
        variant: "default",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Failed to change password. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Change Password</h3>
      <p className="text-sm text-muted-foreground">
        Update your password to maintain secure access to your account
      </p>
      
      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-500/10 text-green-600 border-green-500/20 my-4">
          <Check className="h-4 w-4" />
          <AlertDescription>Password successfully changed</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <div className="relative">
            <Input
              id="current-password"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pr-10"
              placeholder="Enter your current password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`pr-10 ${newPassword && !isValidNewPassword ? "border-red-500" : ""}`}
              placeholder="Enter new password (min 8 characters)"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {newPassword && !isValidNewPassword && (
            <p className="text-xs text-red-500 mt-1">
              Password must be at least 8 characters long
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`pr-10 ${
                confirmPassword 
                  ? passwordsMatch 
                    ? "border-green-500 focus:border-green-500" 
                    : "border-red-500 focus:border-red-500"
                  : ""
              }`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && (
            <p className={`text-xs mt-1 ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
              {passwordsMatch ? "Passwords match ✓" : "Passwords do not match"}
            </p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading || !passwordsMatch || !isValidNewPassword}
        >
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
} 
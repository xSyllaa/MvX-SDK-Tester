'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Github, Mail, User, Settings, LogOut, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { WalletConnectLoginButton } from "@multiversx/sdk-dapp/UI";
import { XPortalLogo } from "@/components/icons/xportal-logo";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type pour les props des boutons de connexion
type WalletConnectLoginButtonPropsType = {
  callbackRoute?: string;
  nativeAuth: boolean;
  onLoginRedirect: () => void;
};

export function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [anonymousToken, setAnonymousToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const callbackRoute = '/';

  const {
    user,
    isReallyAuthenticated,
    isLoading,
    error,
    loginWithCredentials,
    registerWithCredentials,
    logout
  } = useAuth();

  // Fonction utilitaire pour récupérer un cookie
  const getCookieValue = (name: string): string | null => {
    if (typeof document === 'undefined') {
      return null;
    }
    
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Le cookie commence-t-il par le nom que nous recherchons?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    return null;
  };

  // Mettre à jour le message d'erreur lors du changement d'error
  useEffect(() => {
    if (error) {
      // Traduire les messages d'erreur en messages plus compréhensibles
      if (error.includes('User with this email or username already exists')) {
        setErrorMessage('This username is already taken. Please choose another one.');
      } else {
        setErrorMessage(error);
      }
    } else {
      setErrorMessage(null);
    }
  }, [error]);

  // Récupérer le jeton anonyme au chargement du composant
  useEffect(() => {
    try {
      const token = getCookieValue('anonymousToken');
      if (token) {
        setAnonymousToken(token);
        console.log('Anonymous token found:', token);
      } else {
        console.log('No anonymous token found in cookies');
      }
    } catch (e) {
      console.error('Error reading cookies:', e);
    }
  }, []);

  const commonProps: WalletConnectLoginButtonPropsType = {
    callbackRoute,
    nativeAuth: true,
    onLoginRedirect: () => {
      console.log('Login redirect called');
    }
  };

  const handleGithubLogin = async () => {
    // TODO: Implement with our own system
    // await loginWithGithub();
    setIsOpen(false);
  };

  const handleGoogleLogin = async () => {
    // TODO: Implement with our own system
    // await loginWithGoogle();
    setIsOpen(false);
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!identifier || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }
    
    try {
      console.log(`Attempting to login with username: ${identifier}`);
      const result = await loginWithCredentials(identifier, password);
      
      if (result.success) {
        setIdentifier('');
        setPassword('');
        setIsOpen(false);
      } else if (result.error) {
        console.error('Login error:', result.error);
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Connection error. Please try again later.');
    }
  };

  const handleCredentialsRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!identifier || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please try again.');
      return;
    }
    
    try {
      const result = await registerWithCredentials(identifier, password, identifier, undefined, anonymousToken || undefined);
      
      if (result.success) {
        setIdentifier('');
        setPassword('');
        setConfirmPassword('');
        setIsRegistering(false);
        setIsOpen(false);
      } else if (result.error) {
        console.error('Registration error:', result.error);
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('Connection error. Please try again later.');
    }
  };

  const toggleRegistration = () => {
    setIsRegistering(!isRegistering);
    setErrorMessage(null);
    setIdentifier('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    logout();
    setIsAccountOpen(false);
  };
  
  // Fonction pour afficher un message d'erreur formaté
  const renderErrorMessage = (message: string | null) => {
    if (!message) return null;
    
    return (
      <div className="flex items-start gap-2 text-sm text-destructive p-3 bg-destructive/10 rounded-lg border border-destructive/20 break-words">
        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>
    );
  };

  const renderForm = () => {
    if (isRegistering) {
      const passwordsMatch = password === confirmPassword;
      const showPasswordValidation = confirmPassword.length > 0;
      
      return (
        <form onSubmit={handleCredentialsRegister} className="flex flex-col gap-3 w-full">
          {renderErrorMessage(errorMessage)}
          
          <div className="w-full relative">
            <input 
              type="text"
              placeholder="Username" 
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background/50"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          
          <div className="w-full relative">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password" 
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background/50 pr-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="w-full relative">
            <input 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password" 
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-background/50 pr-9 transition-colors ${
                showPasswordValidation 
                  ? passwordsMatch 
                    ? "border-green-500 focus:border-green-500" 
                    : "border-red-500 focus:border-red-500"
                  : "border-border"
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            {showPasswordValidation && (
              <p className={`text-xs mt-1 ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
                {passwordsMatch ? "Passwords match ✓" : "Passwords do not match"}
              </p>
            )}
          </div>
          
          <div className="flex gap-3 mt-1">
            <Button 
              type="submit" 
              className="flex-1 h-10 text-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Create account'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 text-sm"
              onClick={toggleRegistration}
            >
              Sign in instead
            </Button>
          </div>
        </form>
      );
    }
    
    return (
      <form onSubmit={handleCredentialsLogin} className="flex flex-col gap-3 w-full">
        {renderErrorMessage(errorMessage)}
        
        <div className="w-full relative">
          <input 
            type="text" 
            placeholder="Username" 
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background/50"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        
        <div className="w-full relative">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background/50 pr-9"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="button" 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        
        <div className="flex gap-3 mt-1">
          <Button 
            type="submit" 
            className="flex-1 h-10 text-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 text-sm"
            onClick={toggleRegistration}
          >
            Create account
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div>
      {isReallyAuthenticated ? (
        <Button
          variant="outline"
          className="px-3 py-2 h-auto"
          onClick={() => setIsAccountOpen(true)}
          disabled={isLoading}
        >
          <User className="mr-2 h-4 w-4" />
          My Account
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          disabled={isLoading}
        >
          <Wallet className="h-5 w-5" />
        </Button>
      )}

      {/* Modal de compte utilisateur */}
      <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
        <DialogContent className="sm:max-w-[380px] max-w-[90vw] w-full p-0 gap-0 max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader className="p-3 border-b sticky top-0 bg-background z-10">
            <div>
              <DialogTitle className="text-base font-medium">My Account</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Manage your account settings
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-3 p-3 w-full overflow-x-hidden">
            {/* Info utilisateur */}
            <div className="p-3 rounded-lg bg-card">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-medium">{user?.displayName || user?.username}</h2>
                    <p className="text-xs text-muted-foreground">{user?.email || 'No email'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Options de compte */}
            <div className="p-3 rounded-lg bg-card">
              <h3 className="text-xs font-medium mb-2">Account Options</h3>
              
              {/* Ici, vous pourrez ajouter d'autres options de compte selon vos besoins */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-9 text-xs"
                  size="sm"
                >
                  <Settings className="mr-2 h-3 w-3" />
                  Account Settings
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-9 text-xs text-destructive hover:text-destructive"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  <LogOut className="mr-2 h-3 w-3" />
                  {isLoading ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de connexion */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[420px] max-w-[90vw] w-full p-0 gap-0 max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
            <div>
              <DialogTitle className="text-lg font-semibold">Connect your wallet</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Choose your preferred method to connect to our app
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 p-4 w-full overflow-x-hidden">
            {/* xPortal Section */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-card to-card/80 border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                  <XPortalLogo width={24} height={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold truncate">xPortal Mobile Wallet</h3>
                  <p className="text-sm text-muted-foreground">Scan QR code with app</p>
                </div>
              </div>
              
              <div className="flex justify-center w-full max-w-[280px] mx-auto">
                <style jsx global>{`
                  /* Style global pour la modal WalletConnect */
                  .walletconnect-modal__base {
                    background-color: hsl(var(--background)) !important;
                    color: hsl(var(--foreground)) !important;
                    max-width: 100% !important;
                    width: 100% !important;
                    padding: 24px !important;
                    border-radius: 1rem !important;
                    border: 1px solid hsl(var(--border)) !important;
                    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) !important;
                    position: relative !important;
                    z-index: 100 !important;
                  }

                  /* Overlay de la modal */
                  #walletconnect-wrapper {
                    background: rgba(0, 0, 0, 0.5) !important;
                    backdrop-filter: blur(4px) !important;
                    z-index: 99 !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                  }

                  /* Style du header */
                  .walletconnect-modal__header {
                    padding: 0 !important;
                    margin-bottom: 24px !important;
                    user-select: text !important;
                  }

                  .walletconnect-modal__header p {
                    color: hsl(var(--foreground)) !important;
                    font-size: 16px !important;
                    font-weight: 600 !important;
                    user-select: text !important;
                  }

                  /* Style de la zone de QR code */
                  .walletconnect-qrcode__base {
                    background: white !important;
                    padding: 16px !important;
                    border-radius: 12px !important;
                    width: fit-content !important;
                    margin: 0 auto 16px !important;
                    user-select: text !important;
                  }

                  .walletconnect-qrcode__text {
                    color: hsl(var(--foreground)) !important;
                    font-size: 14px !important;
                    margin-bottom: 16px !important;
                    font-weight: 500 !important;
                    user-select: text !important;
                  }

                  /* Style du texte et des liens */
                  .walletconnect-modal__base p,
                  .walletconnect-modal__base div {
                    color: hsl(var(--foreground)) !important;
                    font-size: 14px !important;
                    user-select: text !important;
                  }

                  /* Style des liens */
                  .walletconnect-modal__base a {
                    color: hsl(var(--primary)) !important;
                    font-weight: 500 !important;
                    text-decoration: none !important;
                    user-select: text !important;
                  }

                  /* Style du bouton de fermeture */
                  .walletconnect-modal__close__wrapper {
                    position: absolute !important;
                    top: 24px !important;
                    right: 24px !important;
                    background: none !important;
                    width: 24px !important;
                    height: 24px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    transition: opacity 0.2s !important;
                    z-index: 101 !important;
                  }

                  .walletconnect-modal__close__icon {
                    width: 16px !important;
                    height: 16px !important;
                    opacity: 0.5 !important;
                  }

                  .walletconnect-modal__close__wrapper:hover .walletconnect-modal__close__icon {
                    opacity: 1 !important;
                  }

                  /* Style des boutons */
                  .walletconnect-connect__buttons__wrapper__android,
                  .walletconnect-connect__buttons__wrapper__wrap {
                    background: none !important;
                  }

                  .walletconnect-connect__button {
                    background-color: rgb(24 24 27) !important;
                    color: white !important;
                    border-radius: 0.5rem !important;
                    transition: all 0.2s !important;
                    border: none !important;
                    padding: 12px 20px !important;
                    margin: 8px 0 !important;
                    user-select: text !important;
                  }

                  .walletconnect-connect__button:hover {
                    background-color: rgb(39 39 42) !important;
                  }

                  /* Style du footer */
                  .walletconnect-modal__footer {
                    background: none !important;
                    border-top: 1px solid hsl(var(--border)) !important;
                    margin-top: 24px !important;
                    padding-top: 16px !important;
                    user-select: text !important;
                  }

                  /* Style de la bannière */
                  .walletconnect-banner__wrapper,
                  .walletconnect-banner__icon {
                    background: hsl(var(--card)) !important;
                    border: 1px solid hsl(var(--border)) !important;
                    border-radius: 8px !important;
                    padding: 12px !important;
                    user-select: text !important;
                  }

                  /* Style du texte mobile */
                  .walletconnect-modal__mobile__toggle {
                    color: hsl(var(--foreground)) !important;
                    font-size: 14px !important;
                    margin-top: 12px !important;
                    font-weight: 500 !important;
                    user-select: text !important;
                  }

                  .walletconnect-modal__mobile__toggle span {
                    color: hsl(var(--foreground)) !important;
                    user-select: text !important;
                  }

                  .walletconnect-modal__mobile__toggle a {
                    text-decoration: none !important;
                    color: hsl(var(--primary)) !important;
                    user-select: text !important;
                  }

                  /* Style du texte de la bannière */
                  .walletconnect-banner__content {
                    color: hsl(var(--foreground)) !important;
                    font-weight: 500 !important;
                    user-select: text !important;
                  }

                  /* Style du texte de description */
                  .walletconnect-modal__base .walletconnect-modal__mobile__toggle p {
                    color: hsl(var(--foreground)) !important;
                    opacity: 1 !important;
                    user-select: text !important;
                  }

                  /* Override des styles spécifiques de dapp-core-component */
                  .dapp-core-component__main__btn,
                  .dapp-core-component__main__btn-primary,
                  .dapp-wallet-connect-login-button {
                    background-color: rgb(24 24 27) !important;
                    color: white !important;
                    border-radius: 0.5rem !important;
                    transition: all 0.2s !important;
                    border: none !important;
                    margin: 0 !important;
                    padding: 0 1rem !important;
                  }
                  
                  .dapp-core-component__main__btn:hover,
                  .dapp-core-component__main__btn-primary:hover,
                  .dapp-wallet-connect-login-button:hover {
                    background-color: rgb(39 39 42) !important;
                  }

                  /* Suppression des marges par défaut */
                  .dapp-core-component__main__m-1,
                  .dapp-core-component__main__mx-3,
                  .dapp-core-component__main__px-4 {
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                `}</style>
                <div className="w-full">
                  <WalletConnectLoginButton
                    {...commonProps}
                    isWalletConnectV2={true}
                    loginButtonText="Connect with xPortal"
                    className="w-full inline-flex items-center justify-center h-10 text-sm font-medium"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-muted-foreground">Don't have the xPortal App?</p>
                <a 
                  href="https://xportal.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:text-primary/90 text-xs font-medium"
                >
                  Get xPortal →
                </a>
              </div>
            </div>

            {/* OAuth Section */}
            <div className="flex flex-col gap-3 w-full">
              <div className="text-sm font-medium text-muted-foreground px-1">
                Or continue with
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                {/* GitHub Section */}
                <Button
                  variant="outline"
                  className="h-11 text-sm relative overflow-hidden group" 
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    GitHub
                  </div>
                </Button>

                {/* Gmail Section */}
                <Button
                  variant="outline"
                  className="h-11 text-sm relative overflow-hidden group" 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Gmail
                  </div>
                </Button>
              </div>
            </div>

            {/* Credentials Section */}
            <div className="rounded-xl border shadow-sm bg-gradient-to-br from-card to-card/80 p-4">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-3">
                <User className="h-5 w-5" />
                {isRegistering ? "Create an account" : "Sign in with credentials"}
              </h3>
              
              {renderForm()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
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
      setIsOpen(false);
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
      <div className="flex items-start gap-2 text-[10px] text-red-500 p-2 bg-red-50 rounded border border-red-200 break-words mb-2">
        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>
    );
  };

  const renderForm = () => {
    if (isRegistering) {
      return (
        <form onSubmit={handleCredentialsRegister} className="space-y-1.5 mt-1.5 w-full">
          {renderErrorMessage(errorMessage)}
          
          <div className="w-full relative">
            <input 
              type="text"
              placeholder="Username" 
              className="w-full px-2 py-1.5 border border-border rounded text-xs"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          
          <div className="w-full relative">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password" 
              className="w-full px-2 py-1.5 border border-border rounded text-xs pr-7"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </div>
          
          <div className="w-full relative">
            <input 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password" 
              className="w-full px-2 py-1.5 border border-border rounded text-xs pr-7"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1 h-7 text-[10px]"
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-7 text-[10px]"
              size="sm"
              onClick={toggleRegistration}
            >
              Sign in instead
            </Button>
          </div>
        </form>
      );
    }
    
    return (
      <form onSubmit={handleCredentialsLogin} className="space-y-1.5 mt-1.5 w-full">
        {renderErrorMessage(errorMessage)}
        
        <div className="w-full relative">
          <input 
            type="text" 
            placeholder="Username" 
            className="w-full px-2 py-1.5 border border-border rounded text-xs"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        
        <div className="w-full relative">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            className="w-full px-2 py-1.5 border border-border rounded text-xs pr-7"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="button" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            className="flex-1 h-7 text-[10px]"
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-7 text-[10px]"
            size="sm"
            onClick={toggleRegistration}
          >
            Register
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
        <DialogContent className="sm:max-w-[380px] max-w-[90vw] w-full p-0 gap-0 max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader className="p-3 border-b sticky top-0 bg-background z-10">
            <div>
              <DialogTitle className="text-base font-medium">Connect your wallet</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Choose your preferred wallet to connect to our app
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-3 p-3 w-full overflow-x-hidden">
            {/* xPortal Section */}
            <div className="p-3 rounded-lg bg-card w-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                  <XPortalLogo width={18} height={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium truncate">xPortal Mobile Wallet</h3>
                  <p className="text-xs text-muted-foreground">Scan QR code with app</p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <style jsx global>{`
                  /* Style global pour la modal WalletConnect */
                  .walletconnect-modal__base {
                    background-color: hsl(var(--background)) !important;
                    color: hsl(var(--foreground)) !important;
                    max-width: 100% !important;
                    width: 100% !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    box-sizing: border-box !important;
                  }

                  /* Forcer le texte à être lisible */
                  .walletconnect-modal__base p,
                  .walletconnect-modal__base h2,
                  .walletconnect-modal__base div {
                    color: hsl(var(--foreground)) !important;
                    font-size: 14px !important;
                    overflow-wrap: break-word !important;
                    word-wrap: break-word !important;
                  }

                  /* QR code - sélecteurs généraux pour tous les conteneurs possibles du QR */
                  .walletconnect-qrcode__image,
                  .walletconnect-qrcode__base,
                  #walletconnect-qrcode-modal,
                  [id*="qrcode"],
                  [class*="qrcode"] {
                    background-color: white !important;
                    margin: 0 auto !important;
                    border-radius: 12px !important;
                    padding: 12px !important;
                    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) !important;
                    max-width: 100% !important;
                    width: auto !important;
                    box-sizing: border-box !important;
                  }

                  /* QR code image directement */
                  canvas,
                  .walletconnect-qrcode__image img,
                  .walletconnect-qrcode__image canvas,
                  .walletconnect-qrcode__image svg {
                    background-color: white !important;
                    border-radius: 8px !important;
                    max-width: 100% !important;
                    height: auto !important;
                    width: auto !important;
                    display: block !important;
                    margin: 0 auto !important;
                  }

                  /* Contenu en dessous du QR code */
                  .walletconnect-modal__footer {
                    background-color: hsl(var(--background)) !important;
                    color: hsl(var(--foreground)) !important;
                    padding: 8px !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                  }

                  /* Boutons */
                  .walletconnect-connect__buttons__wrapper__android,
                  .walletconnect-connect__buttons__wrapper__wrap {
                    background-color: hsl(var(--background)) !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                  }

                  /* Éléments spécifiques au texte informatif */
                  .walletconnect-modal__mobile__toggle {
                    color: hsl(var(--primary)) !important;
                    overflow-wrap: break-word !important;
                    word-wrap: break-word !important;
                  }

                  /* Texte des liens */
                  .walletconnect-modal__mobile__toggle a {
                    color: hsl(var(--primary)) !important;
                  }

                  /* Bannière inférieure */
                  .walletconnect-banner__wrapper,
                  .walletconnect-banner__icon {
                    background-color: hsl(var(--card)) !important;
                    color: hsl(var(--card-foreground)) !important;
                    border-radius: 8px !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                  }
                `}</style>
                <div className="w-full">
                  <WalletConnectLoginButton
                    {...commonProps}
                    isWalletConnectV2={true}
                    loginButtonText="Connect with xPortal"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] text-muted-foreground">Don't have the xPortal App?</p>
                <a 
                  href="https://xportal.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:text-primary/90 text-[10px] font-medium"
                >
                  Get xPortal
                </a>
              </div>
            </div>

            {/* OAuth & Credentials */}
            <div className="flex flex-col gap-3 w-full">
              <div className="grid grid-cols-2 gap-2 w-full">
                {/* GitHub Section */}
                <div className="p-2 rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                      <Github width={14} height={14} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-medium truncate">GitHub</h3>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full h-7 text-[10px]" 
                    onClick={handleGithubLogin}
                    disabled={isLoading}
                    size="sm"
                  >
                    <Github className="mr-1 h-3 w-3" />
                    Sign in
                  </Button>
                </div>

                {/* Gmail Section */}
                <div className="p-2 rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                      <Mail width={14} height={14} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-medium truncate">Gmail</h3>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline" 
                    className="w-full h-7 text-[10px]" 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    size="sm"
                  >
                    <Mail className="mr-1 h-3 w-3" />
                    Sign in
                  </Button>
                </div>
              </div>

              {/* Identifiant + Mot de passe Section */}
              <div className="rounded-lg border shadow-sm bg-card text-card-foreground p-4">
                <h3 className="font-medium text-sm flex items-center gap-2 text-white">
                  <Mail className="h-4 w-4" />
                  {isRegistering ? "Register" : "Username + Password"}
                </h3>
                
                {renderForm()}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
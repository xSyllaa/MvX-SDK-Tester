'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Github, Mail, User, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { WalletConnectLoginButton } from "@multiversx/sdk-dapp/UI";
import { XPortalLogo } from "@/components/icons/xportal-logo";
import { getCookie } from '@/lib/cookies';

// Type pour les props des boutons de connexion
type WalletConnectLoginButtonPropsType = {
  callbackRoute?: string;
  nativeAuth: boolean;
  onLoginRedirect: () => void;
};

export function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [anonymousToken, setAnonymousToken] = useState<string | null>(null);
  
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

  // Récupérer le jeton anonyme au chargement du composant
  useEffect(() => {
    const token = getCookie('anonymousToken');
    if (token) {
      setAnonymousToken(token);
      console.log('Anonymous token found:', token);
    } else {
      console.log('No anonymous token found in cookies');
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
    const result = await loginWithCredentials(identifier, password);
    if (result.success) {
      setIdentifier('');
      setPassword('');
      setIsOpen(false);
    }
  };

  const handleCredentialsRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ajouter le jeton anonyme aux données d'inscription si disponible
    const registerData = {
      identifier,
      password,
      username,
      displayName,
      anonymousToken
    };
    
    console.log('Registering with data:', registerData);
    
    const result = await registerWithCredentials(
      identifier, 
      password, 
      username, 
      displayName, 
      anonymousToken || undefined
    );
    
    if (result.success) {
      setIdentifier('');
      setPassword('');
      setUsername('');
      setDisplayName('');
      setIsRegistering(false);
      setIsOpen(false);
    }
  };

  const toggleRegistration = () => {
    setIsRegistering(!isRegistering);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {isReallyAuthenticated ? (
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium">
            <span className="text-green-600">{user?.displayName || user?.username}</span>
          </div>
          <Button
            variant="outline"
            className="px-3 py-2 h-auto"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
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
              <div className="p-3 rounded-lg bg-card w-full">
                <div className="flex gap-2 mb-2">
                  <div className="h-6 w-6 shrink-0 rounded-md bg-primary/10 flex items-center justify-center mt-0.5">
                    <User width={14} height={14} />
                  </div>
                  <div className="min-w-0 w-full">
                    <h3 className="text-xs font-medium truncate">
                      {isRegistering ? "Register" : "Username + Password"}
                    </h3>
                    
                    {isRegistering ? (
                      <form onSubmit={handleCredentialsRegister} className="space-y-1.5 mt-1.5 w-full">
                        {error && (
                          <div className="text-[10px] text-red-500 p-1.5 bg-red-50 rounded border border-red-200 break-words">
                            {error}
                          </div>
                        )}
                        
                        {anonymousToken ? (
                          <div className="text-[10px] text-green-600 p-1.5 bg-green-50 rounded border border-green-200 mb-2">
                            Anonymous account detected - your data will be preserved
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-600 p-1.5 bg-amber-50 rounded border border-amber-200 mb-2">
                            No anonymous account detected - you'll start fresh
                          </div>
                        )}
                        
                        <input 
                          type="text"
                          placeholder="Email or username" 
                          className="w-full px-2 py-1.5 border border-border rounded text-xs"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          required
                        />
                        <input 
                          type="text"
                          placeholder="Username (optional)" 
                          className="w-full px-2 py-1.5 border border-border rounded text-xs"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                        <input 
                          type="text"
                          placeholder="Display Name (optional)" 
                          className="w-full px-2 py-1.5 border border-border rounded text-xs"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                        />
                        <input 
                          type="password" 
                          placeholder="Password" 
                          className="w-full px-2 py-1.5 border border-border rounded text-xs"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
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
                    ) : (
                      <form onSubmit={handleCredentialsLogin} className="space-y-1.5 mt-1.5 w-full">
                        {error && (
                          <div className="text-[10px] text-red-500 p-1.5 bg-red-50 rounded border border-red-200 break-words">
                            {error}
                          </div>
                        )}
                        <input 
                          type="text" 
                          placeholder="Email or username" 
                          className="w-full px-2 py-1.5 border border-border rounded text-xs"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          required
                        />
                        <input 
                          type="password" 
                          placeholder="Password" 
                          className="w-full px-2 py-1.5 border border-border rounded text-xs"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
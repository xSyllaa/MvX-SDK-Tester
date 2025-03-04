'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet, Github, Mail, User } from "lucide-react";
import { useState } from "react";
import { WalletConnectLoginButton } from "@multiversx/sdk-dapp/UI";
import { XPortalLogo } from "@/components/icons/xportal-logo";
import type { WalletConnectLoginButtonPropsType } from '@multiversx/sdk-dapp/UI';
import { useAuth } from "@/hooks/useAuth";

export function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const callbackRoute = "/";

  const {
    loginWithGithub,
    loginWithGoogle,
    loginWithCredentials,
    loading,
    error
  } = useAuth({ callbackUrl: callbackRoute });

  const commonProps: WalletConnectLoginButtonPropsType = {
    callbackRoute,
    nativeAuth: true,
    onLoginRedirect: () => {
      console.log('Login redirect called');
      setIsOpen(false);
    }
  };

  const handleGithubLogin = async () => {
    await loginWithGithub();
    setIsOpen(false);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    setIsOpen(false);
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithCredentials(email, password);
    if (!error) {
      setEmail('');
      setPassword('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Wallet className="h-5 w-5" />
        </Button>
      </DialogTrigger>
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
                  disabled={loading}
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
                  disabled={loading}
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
                  <h3 className="text-xs font-medium truncate">Identifiant + Mot de passe</h3>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                        disabled={loading}
                        size="sm"
                      >
                        {loading ? 'Signing in...' : 'Sign in'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7 text-[10px]"
                        size="sm"
                      >
                        Register
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
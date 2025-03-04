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
import { Wallet } from "lucide-react";
import { useState } from "react";
import { WalletConnectLoginButton } from "@multiversx/sdk-dapp/UI";
import { XPortalLogo } from "@/components/icons/xportal-logo";
import type { WalletConnectLoginButtonPropsType } from '@multiversx/sdk-dapp/UI';

export function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const callbackRoute = "/";

  const commonProps: WalletConnectLoginButtonPropsType = {
    callbackRoute,
    nativeAuth: true,
    onLoginRedirect: () => {
      console.log('Login redirect called');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Wallet className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <div>
            <DialogTitle className="text-lg font-medium">Connect your wallet</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Choose your preferred wallet to connect to our app
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-4">
          {/* xPortal Section */}
          <div className="p-5 rounded-lg bg-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <XPortalLogo width={32} height={32} />
              </div>
              <div>
                <h3 className="font-medium">xPortal Mobile Wallet</h3>
                <p className="text-sm text-muted-foreground">Scan this QR code with your app</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <style jsx global>{`
                .walletconnect-modal__base {
                  background: hsl(var(--card)) !important;
                  color: hsl(var(--foreground)) !important;
                  border: 1px solid hsl(var(--border)) !important;
                  border-radius: 0.75rem !important;
                  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
                }
                .walletconnect-modal__header p {
                  color: hsl(var(--foreground)) !important;
                }
                .walletconnect-modal__close__wrapper {
                  background: hsl(var(--muted)) !important;
                }
                .walletconnect-modal__mobile__toggle {
                  background: hsl(var(--accent)) !important;
                  color: hsl(var(--accent-foreground)) !important;
                }
                .walletconnect-qrcode__image {
                  padding: 20px !important;
                  background: white !important;
                  border-radius: 12px !important;
                }
                .walletconnect-modal__footer {
                  color: hsl(var(--muted-foreground)) !important;
                }
                .walletconnect-connect__button {
                  background: hsl(var(--primary)) !important;
                  color: hsl(var(--primary-foreground)) !important;
                  border: none !important;
                  padding: 0.5rem 1rem !important;
                  border-radius: 0.375rem !important;
                  font-weight: 500 !important;
                  transition: opacity 0.2s !important;
                }
                .walletconnect-connect__button:hover {
                  opacity: 0.9 !important;
                }
              `}</style>
              <div className="w-full">
                <WalletConnectLoginButton
                  {...commonProps}
                  isWalletConnectV2={true}
                  loginButtonText="Connect with xPortal"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">Don't have the xPortal App?</p>
              <a 
                href="https://xportal.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:text-primary/90 text-sm font-medium"
              >
                Get xPortal
              </a>
            </div>
          </div>

          {/* MultiversX Extension Section */}
          <div className="p-4 rounded-lg bg-card flex items-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <XPortalLogo width={32} height={32} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">MultiversX Wallet Extension</h3>
              <p className="text-sm text-muted-foreground">Connect using browser wallet extension</p>
            </div>
          </div>

          {/* Ledger Section */}
          <div className="p-4 rounded-lg bg-card flex items-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.5 8.25V15.75H4.5V8.25M19.5 8.25H4.5M19.5 8.25V6.75C19.5 5.92157 18.8284 5.25 18 5.25H6C5.17157 5.25 4.5 5.92157 4.5 6.75V8.25M19.5 15.75V17.25C19.5 18.0784 18.8284 18.75 18 18.75H6C5.17157 18.75 4.5 18.0784 4.5 17.25V15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Ledger</h3>
              <p className="text-sm text-muted-foreground">Connect using Ledger hardware wallet</p>
            </div>
          </div>

          <div className="mt-2 text-center">
            <p className="text-sm text-muted-foreground">Don't have a wallet?</p>
            <a 
              href="https://chrome.google.com/webstore/detail/multiversx-defi-wallet/dngmlblcodfobpdpecaadgfbcggfjfnm"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/90 text-sm font-medium"
            >
              Get MultiversX Wallet Extension ↗
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
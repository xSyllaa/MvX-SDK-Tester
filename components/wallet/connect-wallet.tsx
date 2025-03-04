'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet, X } from "lucide-react";
import { useState } from "react";
import { WalletConnectLoginButton } from "@multiversx/sdk-dapp/UI";
import { XPortalLogo } from "@/components/icons/xportal-logo";

export function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const callbackRoute = "/";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Wallet className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 bg-[#18191D]">
        <div className="flex flex-col h-full">
          {/* Header avec titre */}
          <div className="p-4 flex justify-between items-center border-b border-zinc-800">
            <h2 className="text-lg font-medium text-white">Connect your wallet</h2>
          </div>

          {/* xPortal Section */}
          <div className="p-5 rounded-lg bg-[#25262C] mx-4 mb-4">
            <div className="flex mb-5">
              <div className="min-w-[48px] mr-4">
                <div className="w-[130px] h-[26px] flex items-center justify-center">
                  <XPortalLogo width={130} height={26} />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-white text-base font-medium">xPortal Mobile Wallet</h3>
                <p className="text-sm text-gray-400">Scan this QR code with your app</p>
              </div>
            </div>
            
            <style jsx global>{`
              .wallet-connect-login-container {
                width: 100% !important;
                display: flex !important;
                justify-content: center !important;
                padding: 0 !important;
              }
              .token-login-wrapper {
                background-color: transparent !important;
                margin: 0 !important;
                padding: 0 !important;
                display: flex !important;
                justify-content: center !important;
                min-height: 180px !important;
              }
              .qr-code-svg {
                background-color: #25262C !important;
                padding: 16px !important;
                border-radius: 8px !important;
                width: 180px !important;
                height: 180px !important;
                display: block !important;
              }
              .wallet-connect-login-btn {
                background-color: transparent !important;
                padding: 0 !important;
                border: none !important;
                width: 100% !important;
                height: auto !important;
              }
              .connect-wallet-btn {
                background: none !important;
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .identicon {
                display: none !important;
              }
            `}</style>
            
            <div className="flex justify-center">
              <div className="qr-container relative flex justify-center min-h-[180px]">
                <WalletConnectLoginButton
                  callbackRoute={callbackRoute}
                  isWalletConnectV2={true}
                  loginButtonText=""
                  className="wallet-connect-login-btn"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-400">Don't have the xPortal App?</p>
              <a 
                href="https://xportal.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#14DFBE] hover:text-[#0fcaa9] text-sm font-medium"
              >
                Get xPortal
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
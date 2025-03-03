'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  ExtensionLoginButton,
  LedgerLoginButton,
  WalletConnectLoginButton,
  WebWalletLoginButton
} from "@multiversx/sdk-dapp/UI";

export function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const callbackRoute = "/";
  
  // Références pour les boutons de login
  const extensionBtnRef = useRef<HTMLDivElement>(null);
  const ledgerBtnRef = useRef<HTMLDivElement>(null);
  const webWalletBtnRef = useRef<HTMLDivElement>(null);

  // Fonction pour déclencher le clic du bouton
  const triggerButtonClick = (ref: React.RefObject<HTMLDivElement>) => {
    const button = ref.current?.querySelector('button');
    if (button instanceof HTMLElement) {
      button.click();
    }
  };

  // Appliquer du CSS personnalisé au QR code
  useEffect(() => {
    if (isOpen) {
      // Ajouter un délai pour s'assurer que les éléments sont montés
      const timer = setTimeout(() => {
        // Styles pour le conteneur WalletConnect
        const walletConnectContainer = document.querySelector('.wallet-connect-login-container');
        if (walletConnectContainer) {
          walletConnectContainer.setAttribute('style', 'width: 100% !important; display: flex !important; justify-content: center !important; padding: 0 !important;');
        }

        // QR code styling
        const qrElement = document.querySelector('.qr-code-svg');
        if (qrElement) {
          qrElement.setAttribute('style', 'background-color: #25262C !important; padding: 16px !important; border-radius: 8px !important; width: 180px !important; height: 180px !important; display: block !important;');
        }
        
        // Style supplémentaire pour améliorer l'apparence
        const svgInQr = document.querySelector('.qr-code-svg svg');
        if (svgInQr) {
          svgInQr.setAttribute('width', '148');
          svgInQr.setAttribute('height', '148');
          svgInQr.setAttribute('style', 'background: transparent !important;');
        }

        // Masquer l'identicon (avatar du wallet) s'il est présent
        const identicon = document.querySelector('.identicon');
        if (identicon) {
          identicon.setAttribute('style', 'display: none !important;');
        }

        // Corriger l'espacement dans le conteneur WalletConnect
        const tokenLoginWrapper = document.querySelector('.token-login-wrapper');
        if (tokenLoginWrapper) {
          tokenLoginWrapper.setAttribute('style', 'background-color: transparent !important; margin: 0 !important; padding: 0 !important; display: flex !important; justify-content: center !important; min-height: 180px !important;');
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Wallet className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 bg-[#18191D]">
        <div className="flex flex-col h-full">
          {/* Header avec titre et croix */}
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Connect your wallet</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* xPortal Section */}
          <div className="p-5 rounded-lg bg-[#25262C] mx-4 mb-4">
            <div className="flex mb-5">
              <div className="min-w-[48px] mr-4">
                <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 3L12.5 21L20.5 21L20.5 3L12.5 3Z" fill="#14DFBE"/>
                    <path d="M3.5 3L3.5 21L11.5 21L11.5 3L3.5 3Z" fill="#14DFBE"/>
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
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
              .multiversx-wallet-login-container,
              .extension-login-container,
              .ledger-login-container,
              .web-wallet-login-container {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                opacity: 0 !important;
              }
              button.extension-login-button,
              button.ledger-login-button,
              button.web-wallet-login-button,
              button.wallet-connect-login-button {
                width: 100% !important;
                height: 100% !important;
                background-color: transparent !important;
                border-radius: 0 !important;
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                color: white !important;
                font-weight: 500 !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                opacity: 0 !important;
                cursor: pointer !important;
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

          {/* Autres méthodes d'authentification */}
          <div className="px-4 mb-4">
            {/* Extension */}
            <div 
              className="bg-[#25262C] hover:bg-[#2E2F34] rounded-lg mb-3 relative cursor-pointer"
              onClick={() => triggerButtonClick(extensionBtnRef)}
              ref={extensionBtnRef}
            >
              <div className="p-4 flex items-center">
                <div className="min-w-[48px] mr-4">
                  <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5 3L12.5 21L20.5 21L20.5 3L12.5 3Z" fill="#14DFBE"/>
                      <path d="M3.5 3L3.5 21L11.5 21L11.5 3L3.5 3Z" fill="#14DFBE"/>
                    </svg>
                  </div>
                </div>
                <span className="text-white font-medium">MultiversX Wallet Extension</span>
                <ExtensionLoginButton
                  callbackRoute={callbackRoute}
                  className="extension-button"
                  loginButtonText=""
                />
              </div>
            </div>

            {/* Ledger */}
            <div 
              className="bg-[#25262C] hover:bg-[#2E2F34] rounded-lg mb-3 relative cursor-pointer"
              onClick={() => triggerButtonClick(ledgerBtnRef)}
              ref={ledgerBtnRef}
            >
              <div className="p-4 flex items-center">
                <div className="min-w-[48px] mr-4">
                  <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.06 13.8H7.14C6.75 13.8 6.44 13.49 6.44 13.1V6.73C6.44 6.34 6.75 6.03 7.14 6.03H9.06C9.45 6.03 9.76 6.34 9.76 6.73V13.1C9.76 13.49 9.45 13.8 9.06 13.8Z" fill="white"/>
                      <path d="M12.86 13.8H10.94C10.55 13.8 10.24 13.49 10.24 13.1V6.73C10.24 6.34 10.55 6.03 10.94 6.03H12.86C13.25 6.03 13.56 6.34 13.56 6.73V13.1C13.56 13.49 13.25 13.8 12.86 13.8Z" fill="white"/>
                      <path d="M14.85 20H5.15C2.31 20 0 17.69 0 14.85V5.15C0 2.31 2.31 0 5.15 0H14.85C17.69 0 20 2.31 20 5.15V14.85C20 17.69 17.69 20 14.85 20ZM5.15 1.52C3.15 1.52 1.52 3.15 1.52 5.15V14.85C1.52 16.85 3.15 18.48 5.15 18.48H14.85C16.85 18.48 18.48 16.85 18.48 14.85V5.15C18.48 3.15 16.85 1.52 14.85 1.52H5.15Z" fill="white"/>
                    </svg>
                  </div>
                </div>
                <span className="text-white font-medium">Ledger</span>
                <LedgerLoginButton
                  callbackRoute={callbackRoute}
                  className="ledger-button"
                  loginButtonText=""
                />
              </div>
            </div>

            {/* Web Wallet */}
            <div 
              className="bg-[#25262C] hover:bg-[#2E2F34] rounded-lg relative cursor-pointer"
              onClick={() => triggerButtonClick(webWalletBtnRef)}
              ref={webWalletBtnRef}
            >
              <div className="p-4 flex items-center">
                <div className="min-w-[48px] mr-4">
                  <div className="w-12 h-12 bg-black rounded-md flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5 3L12.5 21L20.5 21L20.5 3L12.5 3Z" fill="#14DFBE"/>
                      <path d="M3.5 3L3.5 21L11.5 21L11.5 3L3.5 3Z" fill="#14DFBE"/>
                    </svg>
                  </div>
                </div>
                <span className="text-white font-medium">MultiversX Wallet</span>
                <WebWalletLoginButton
                  callbackRoute={callbackRoute}
                  className="web-wallet-button"
                  loginButtonText=""
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
'use client';

import { DappProvider } from "@multiversx/sdk-dapp/wrappers";
import { SignTransactionsModals } from "@multiversx/sdk-dapp/UI/SignTransactionsModals";
import { NotificationModal } from "@multiversx/sdk-dapp/UI/NotificationModal";
import { TransactionsToastList } from "@multiversx/sdk-dapp/UI/TransactionsToastList";
import type { PropsWithChildren } from "react";

export type Environment = 'mainnet' | 'devnet' | 'testnet';

const networkConfigs = {
  mainnet: {
    name: "MultiversX Mainnet",
    apiAddress: "https://api.multiversx.com",
    explorerAddress: "https://explorer.multiversx.com",
    walletAddress: "https://wallet.multiversx.com",
    chainId: "1",
  }
};

export function MultiversXProvider({ children }: PropsWithChildren) {
  const networkConfig = {
    ...networkConfigs.mainnet,
    apiTimeout: 10000,
    walletConnectV2ProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    walletConnectV2RelayAddress: "wss://relay.walletconnect.com",
    nativeAuth: true
  };

  

  if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
    console.error('WalletConnect Project ID is not configured. Please check your .env.local file.');
  }

  return (
    <DappProvider
      environment="mainnet"
      customNetworkConfig={networkConfig}
      dappConfig={{
        shouldUseWebViewProvider: true,
        logoutRoute: '/'
      }}
    >
      {children}
      <TransactionsToastList />
      <NotificationModal />
      <SignTransactionsModals />
    </DappProvider>
  );
} 
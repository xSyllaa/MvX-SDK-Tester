'use client';

import { DappProvider } from "@multiversx/sdk-dapp/wrappers";
import { SignTransactionsModals } from "@multiversx/sdk-dapp/UI/SignTransactionsModals";
import { NotificationModal } from "@multiversx/sdk-dapp/UI/NotificationModal";
import { TransactionsToastList } from "@multiversx/sdk-dapp/UI/TransactionsToastList";
import type { PropsWithChildren } from "react";

export type Environment = 'mainnet' | 'devnet' | 'testnet';

const networkConfigs = {
  devnet: {
    name: "MultiversX Devnet",
    apiAddress: "https://devnet-api.multiversx.com",
    explorerAddress: "https://devnet-explorer.multiversx.com",
    walletAddress: "https://devnet-wallet.multiversx.com",
    chainId: "D",
  }
};

export function MultiversXProvider({ children }: PropsWithChildren) {
  const networkConfig = {
    ...networkConfigs.devnet,
    apiTimeout: 10000,
    walletConnectV2ProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  };

  if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
    console.error('WalletConnect Project ID is not configured. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your environment variables.');
  }

  return (
    <DappProvider
      environment="devnet"
      customNetworkConfig={networkConfig}
    >
      {children}
      <TransactionsToastList />
      <NotificationModal />
      <SignTransactionsModals />
    </DappProvider>
  );
} 
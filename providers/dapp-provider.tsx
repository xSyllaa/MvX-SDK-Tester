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
  },
  devnet: {
    name: "MultiversX Devnet",
    apiAddress: "https://devnet-api.multiversx.com",
    explorerAddress: "https://devnet-explorer.multiversx.com",
    walletAddress: "https://devnet-wallet.multiversx.com",
    chainId: "D",
  },
  testnet: {
    name: "MultiversX Testnet",
    apiAddress: "https://testnet-api.multiversx.com",
    explorerAddress: "https://testnet-explorer.multiversx.com",
    walletAddress: "https://testnet-wallet.multiversx.com",
    chainId: "T",
  },
};

const defaultNetworkConfig = {
  egldLabel: "EGLD",
  decimals: "18",
  gasPerDataByte: "1500",
};

interface MultiversXProviderProps extends PropsWithChildren {
  environment?: Environment;
}

export function MultiversXProvider({ 
  children, 
  environment = 'devnet' 
}: MultiversXProviderProps) {
  const networkConfig = {
    ...defaultNetworkConfig,
    ...networkConfigs[environment],
    apiTimeout: 10000,
  };

  return (
    <DappProvider
      environment={environment}
      customNetworkConfig={networkConfig}
    >
      {children}
      <TransactionsToastList />
      <NotificationModal />
      <SignTransactionsModals />
    </DappProvider>
  );
} 
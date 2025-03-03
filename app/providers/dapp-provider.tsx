'use client';

import { DappProvider } from "@multiversx/sdk-dapp/wrappers";
import type { PropsWithChildren } from "react";

export function MultiversXProvider({ children }: PropsWithChildren) {
  return (
    <DappProvider
      environment="devnet"
      customNetworkConfig={{
        name: 'customConfig',
        apiTimeout: 10000,
        walletConnectV2ProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      }}
    >
      {children}
    </DappProvider>
  );
} 
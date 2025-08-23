import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import {
  metaMaskWallet,
  walletConnectWallet,
  injectedWallet,
  rainbowWallet,
  // coinbaseWallet, // 注释掉Coinbase钱包
} from '@rainbow-me/rainbowkit/wallets';

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set');
}

// 自定义钱包连接器列表，排除Coinbase钱包
const connectors = connectorsForWallets([
  {
    groupName: '推荐',
    wallets: [
      metaMaskWallet,
      walletConnectWallet,
      injectedWallet,
    ],
  },
  {
    groupName: '其他',
    wallets: [
      rainbowWallet,
      // 不包含coinbaseWallet
    ],
  },
], {
  appName: 'WasteToNFT',
  projectId,
});

export const config = createConfig({
  connectors,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});
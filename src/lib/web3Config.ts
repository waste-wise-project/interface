import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set');
}

export const config = getDefaultConfig({
	appName: 'WasteToNFT',
	projectId,
	chains: [sepolia],
	ssr: true, // 重要：App Router需要SSR支持
});
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
	EligibleNFT, 
	NFTClaim, 
	OwnedNFT, 
	NFTPoolStats, 
	MintNFTResponse 
} from '@/types/nft';
import nftApiService from '@/services/nftApi';

interface NftState {
	// 数据状态
	eligibleNfts: EligibleNFT[];
	ownedNfts: OwnedNFT[];
	nftClaims: NFTClaim[];
	poolStats: NFTPoolStats | null;
	recentMints: MintNFTResponse[];

	// 加载状态
	isLoadingEligible: boolean;
	isLoadingOwned: boolean;
	isLoadingClaims: boolean;
	isLoadingStats: boolean;
	isClaiming: boolean;
	isMinting: boolean;

	// 错误状态
	error: string | null;

	// Actions
	fetchEligibleNfts: (walletAddress: string) => Promise<void>;
	fetchOwnedNfts: (walletAddress: string) => Promise<void>;
	fetchNftClaims: (walletAddress: string) => Promise<void>;
	fetchPoolStats: () => Promise<void>;
	
	reserveNft: (walletAddress: string, nftPoolId: number) => Promise<void>;
	claimNft: (walletAddress: string, nftPoolId: number) => Promise<void>;
	
	addRecentMint: (mint: MintNFTResponse) => void;
	clearError: () => void;
	reset: () => void;
}

const initialState = {
	eligibleNfts: [],
	ownedNfts: [],
	nftClaims: [],
	poolStats: null,
	recentMints: [],
	isLoadingEligible: false,
	isLoadingOwned: false,
	isLoadingClaims: false,
	isLoadingStats: false,
	isClaiming: false,
	isMinting: false,
	error: null,
};

export const useNftStore = create<NftState>()(
	devtools(
		(set, get) => ({
			...initialState,

			fetchEligibleNfts: async (walletAddress: string) => {
				set({ isLoadingEligible: true, error: null });
				try {
					const eligibleNfts = await nftApiService.getEligibleNfts(walletAddress);
					set({ eligibleNfts, isLoadingEligible: false });
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : '获取可领取NFT失败';
					set({ 
						error: errorMessage, 
						isLoadingEligible: false 
					});
				}
			},

			fetchOwnedNfts: async (walletAddress: string) => {
				set({ isLoadingOwned: true, error: null });
				try {
					const ownedNfts = await nftApiService.getOwnedNfts(walletAddress);
					set({ ownedNfts, isLoadingOwned: false });
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : '获取拥有的NFT失败';
					set({ 
						error: errorMessage, 
						isLoadingOwned: false 
					});
				}
			},

			fetchNftClaims: async (walletAddress: string) => {
				set({ isLoadingClaims: true, error: null });
				try {
					const nftClaims = await nftApiService.getNftClaims(walletAddress);
					set({ nftClaims, isLoadingClaims: false });
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : '获取领取记录失败';
					set({ 
						error: errorMessage, 
						isLoadingClaims: false 
					});
				}
			},

			fetchPoolStats: async () => {
				set({ isLoadingStats: true, error: null });
				try {
					const poolStats = await nftApiService.getPoolStats();
					set({ poolStats, isLoadingStats: false });
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : '获取NFT池统计失败';
					set({ 
						error: errorMessage, 
						isLoadingStats: false 
					});
				}
			},

			reserveNft: async (walletAddress: string, nftPoolId: number) => {
				set({ error: null });
				try {
					await nftApiService.reserveNft({ walletAddress, nftPoolId });
					// 重新获取可领取NFT列表以更新状态
					get().fetchEligibleNfts(walletAddress);
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : '预留NFT失败';
					set({ error: errorMessage });
					throw error;
				}
			},

			claimNft: async (walletAddress: string, nftPoolId: number) => {
				set({ isClaiming: true, error: null });
				try {
					const result = await nftApiService.claimNft({ walletAddress, nftPoolId });
					
					// 更新本地状态
					const currentClaims = get().nftClaims;
					const newClaim: NFTClaim = {
						id: result.claimId,
						nftPoolId,
						walletAddress,
						status: 'CONFIRMED',
						requestedAt: new Date().toISOString(),
						confirmedAt: new Date().toISOString(),
						transactionHash: result.transferResult.transactionHash,
					};
					
					set({ 
						nftClaims: [newClaim, ...currentClaims],
						isClaiming: false 
					});
					
					// 重新获取可领取NFT和拥有的NFT列表
					get().fetchEligibleNfts(walletAddress);
					get().fetchOwnedNfts(walletAddress);
					
					return result;
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : '领取NFT失败';
					set({ 
						error: errorMessage, 
						isClaiming: false 
					});
					throw error;
				}
			},

			addRecentMint: (mint: MintNFTResponse) => {
				const currentMints = get().recentMints;
				set({ 
					recentMints: [mint, ...currentMints].slice(0, 10) // 只保留最近10个
				});
			},

			clearError: () => {
				set({ error: null });
			},

			reset: () => {
				set(initialState);
			},
		}),
		{
			name: 'nft-store',
		}
	)
);
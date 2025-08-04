'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { isAddress } from 'viem';
import { CONTRACT_ADDRESS, WASTE_WISE_ABI } from '@/contract';

// 类型定义
export interface NFTMetadata {
	name?: string;
	description?: string;
	image?: string;
	attributes?: Array<{
		trait_type: string;
		value: string | number;
	}>;
	[key: string]: any;
}

export interface NFTWithMetadata {
	tokenId: string;
	owner: string;
	tokenURI: string;
	metadata?: NFTMetadata;
	metadataError?: string;
}

export interface UseUserNFTsReturn {
	nfts: NFTWithMetadata[];
	isLoading: boolean;
	error: string | null;
	isEmpty: boolean;
	refetch: () => void;
	getUserNFTs: (userAddress?: string) => Promise<void>;
}

export function useUserNFTs(userAddress?: string): UseUserNFTsReturn {
	const { address: connectedAddress } = useAccount();

	// 确定查询地址
	const queryAddress = userAddress || connectedAddress;

	// 状态管理
	const [nfts, setNfts] = useState<NFTWithMetadata[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// 获取用户拥有的 NFT token IDs
	const {
		data: userNFTIds,
		isLoading: isLoadingIds,
		error: idsError,
		refetch: refetchIds,
	} = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: WASTE_WISE_ABI,
		functionName: 'getUserNFTs',
		args: queryAddress ? [queryAddress as `0x${string}`] : undefined,
		query: {
			enabled: !!queryAddress && isAddress(queryAddress),
		},
	});

	// 批量获取 NFT 详细信息的合约调用
	const contracts = ((userNFTIds as bigint[]) || []).flatMap((tokenId) => [
		{
			address: CONTRACT_ADDRESS,
			abi: WASTE_WISE_ABI,
			functionName: 'ownerOf',
			args: [tokenId],
		},
		{
			address: CONTRACT_ADDRESS,
			abi: WASTE_WISE_ABI,
			functionName: 'tokenURI',
			args: [tokenId],
		},
		{
			address: CONTRACT_ADDRESS,
			abi: WASTE_WISE_ABI,
			functionName: 'exists',
			args: [tokenId],
		},
	]);

	const {
		data: contractResults,
		isLoading: isLoadingDetails,
		error: detailsError,
		refetch: refetchDetails,
	} = useReadContracts({
		contracts,
		query: {
			enabled: !!userNFTIds && (userNFTIds as bigint[]).length > 0,
		},
	});

	// 获取 metadata 的函数
	const fetchMetadata = useCallback(
		async (tokenURI: string): Promise<NFTMetadata | null> => {
			try {
				// 处理 IPFS URLs
				let url = tokenURI;
				if (tokenURI.startsWith('ipfs://')) {
					url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
				}

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const metadata = await response.json();
				return metadata;
			} catch (error) {
				console.error('获取 metadata 失败:', error);
				return null;
			}
		},
		[]
	);

	// 处理合约数据并获取 metadata
	const processNFTData = useCallback(async () => {
		if (
			!userNFTIds ||
			!contractResults ||
			(userNFTIds as bigint[]).length === 0
		) {
			setNfts([]);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const tokenIds = userNFTIds as bigint[];
			const nftPromises = tokenIds.map(async (tokenId, index) => {
				const baseIndex = index * 3;

				const ownerResult = contractResults[baseIndex];
				const tokenURIResult = contractResults[baseIndex + 1];
				const existsResult = contractResults[baseIndex + 2];

				// 检查合约调用是否成功
				if (
					ownerResult?.status !== 'success' ||
					tokenURIResult?.status !== 'success' ||
					existsResult?.status !== 'success' ||
					!existsResult.result
				) {
					return null;
				}

				const owner = ownerResult.result as string;
				const tokenURI = tokenURIResult.result as string;

				// 创建基础 NFT 对象
				const nft: NFTWithMetadata = {
					tokenId: tokenId.toString(),
					owner,
					tokenURI,
				};

				// 获取 metadata
				try {
					const metadata = await fetchMetadata(tokenURI);
					if (metadata) {
						nft.metadata = metadata;
					}
				} catch (error) {
					nft.metadataError =
						error instanceof Error ? error.message : '获取 metadata 失败';
				}

				return nft;
			});

			const results = await Promise.all(nftPromises);
			const validNFTs = results.filter(
				(nft): nft is NFTWithMetadata => nft !== null
			);

			setNfts(validNFTs);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : '处理 NFT 数据失败';
			setError(errorMessage);
			setNfts([]);
		} finally {
			setIsLoading(false);
		}
	}, [userNFTIds, contractResults, fetchMetadata]);

	// 监听数据变化并处理
	useEffect(() => {
		if (contractResults && userNFTIds) {
			processNFTData();
		}
	}, [contractResults, userNFTIds, processNFTData]);

	// 设置错误状态
	useEffect(() => {
		if (idsError) {
			setError(idsError.message);
		} else if (detailsError) {
			setError(detailsError.message);
		} else {
			setError(null);
		}
	}, [idsError, detailsError]);

	// 手动获取用户 NFTs
	const getUserNFTs = useCallback(
		async (targetUserAddress?: string) => {
			const addressToQuery = targetUserAddress || queryAddress;
			if (!addressToQuery || !isAddress(addressToQuery)) {
				setError('无效的用户地址');
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				await refetchIds();
			} catch (error) {
				setError(error instanceof Error ? error.message : '获取 NFT 列表失败');
			}
		},
		[queryAddress, refetchIds]
	);

	// 刷新所有数据
	const refetch = useCallback(() => {
		refetchIds();
		refetchDetails();
	}, [refetchIds, refetchDetails]);

	const isLoadingState = isLoadingIds || isLoadingDetails || isLoading;
	const isEmpty = !isLoadingState && nfts.length === 0;

	return {
		nfts,
		isLoading: isLoadingState,
		error,
		isEmpty,
		refetch,
		getUserNFTs,
	};
}

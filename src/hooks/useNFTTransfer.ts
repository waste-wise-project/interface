// hooks/useNFTTransfer.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import {
	useAccount,
	useWriteContract,
	useWaitForTransactionReceipt,
	useReadContract,
	usePublicClient,
} from 'wagmi';
import { CONTRACT_ADDRESS, WASTE_WISE_ABI } from '@/contract';

// 合约配置
const SOURCE_ADDRESS = '0x7878C4617329AD141e3834d23FCf1AA6476A6914' as const; // 指定的转出地址

// 类型定义
interface NFTInfo {
	tokenId: string;
	tokenURI: string;
	owner: string;
}

interface TransferState {
	loading: boolean;
	error: string | null;
	success: boolean;
	transactionHash: string | null;
	message: string;
}

interface UseNFTTransferReturn {
	// 状态
	transferState: TransferState;

	// 数据
	sourceNFTs: NFTInfo[];
	loadingNFTs: boolean;

	// 检查
	isSourceAddressConnected: boolean;
	currentUserAddress: string | undefined;

	// 操作
	transferNFT: (tokenId: number, toAddress: string) => Promise<void>;
	refreshSourceNFTs: () => void;
	clearTransferState: () => void;

	// 工具函数
	validateRecipientAddress: (address: string) => boolean;
	getGasEstimate: (
		tokenId: number,
		toAddress: string
	) => Promise<bigint | null>;
}

export function useNFTTransfer(): UseNFTTransferReturn {
	const { address: currentUserAddress, isConnected } = useAccount();
	const publicClient = usePublicClient();

	// 状态管理
	const [transferState, setTransferState] = useState<TransferState>({
		loading: false,
		error: null,
		success: false,
		transactionHash: null,
		message: '',
	});

	const [sourceNFTs, setSourceNFTs] = useState<NFTInfo[]>([]);
	const [loadingNFTs, setLoadingNFTs] = useState(false);

	// 检查当前用户是否为指定的源地址
	const isSourceAddressConnected =
		isConnected &&
		currentUserAddress?.toLowerCase() === SOURCE_ADDRESS.toLowerCase();

	// 获取源地址的NFT列表
	const { data: sourceNFTIds, refetch: refetchSourceNFTs } = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: WASTE_WISE_ABI,
		functionName: 'getUserNFTs',
		args: [SOURCE_ADDRESS],
		query: {
			refetchInterval: 10000, // 每10秒刷新一次
		},
	});

	// 写入合约操作
	const {
		writeContract,
		data: hash,
		isPending: isWritePending,
		error: writeError,
	} = useWriteContract();

	// 等待交易确认
	const {
		isLoading: isConfirming,
		isSuccess: isConfirmed,
		error: confirmError,
	} = useWaitForTransactionReceipt({ hash });

	// 更新转移状态
	const updateTransferState = useCallback((updates: Partial<TransferState>) => {
		setTransferState((prev) => ({ ...prev, ...updates }));
	}, []);

	// 清除转移状态
	const clearTransferState = useCallback(() => {
		setTransferState({
			loading: false,
			error: null,
			success: false,
			transactionHash: null,
			message: '',
		});
	}, []);

	// 验证接收地址
	const validateRecipientAddress = useCallback((address: string): boolean => {
		if (!address || address.trim() === '') return false;
		if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;
		if (address.toLowerCase() === SOURCE_ADDRESS.toLowerCase()) return false;
		return true;
	}, []);

	// 获取Gas估算
	const getGasEstimate = useCallback(
		async (tokenId: number, toAddress: string): Promise<bigint | null> => {
			if (!publicClient || !isSourceAddressConnected) return null;

			try {
				const gas = await publicClient.estimateContractGas({
					address: CONTRACT_ADDRESS,
					abi: WASTE_WISE_ABI,
					functionName: 'transferNFT',
					args: [toAddress as `0x${string}`, BigInt(tokenId)],
					account: SOURCE_ADDRESS,
				});
				return gas;
			} catch (error) {
				console.error('Gas估算失败:', error);
				return null;
			}
		},
		[publicClient, isSourceAddressConnected]
	);

	// 获取NFT详细信息
	const fetchNFTDetails = useCallback(async () => {
		if (!sourceNFTIds || sourceNFTIds.length === 0) {
			setSourceNFTs([]);
			return;
		}

		setLoadingNFTs(true);
		try {
			const nftDetails: NFTInfo[] = [];

			for (const tokenId of sourceNFTIds) {
				try {
					// 这里应该使用实际的读取合约调用
					// 为了简化示例，我们创建模拟数据
					const nftInfo: NFTInfo = {
						tokenId: tokenId.toString(),
						tokenURI: `https://api.wastewise.com/metadata/${tokenId}`,
						owner: SOURCE_ADDRESS,
					};
					nftDetails.push(nftInfo);
				} catch (error) {
					console.error(`获取NFT ${tokenId} 详情失败:`, error);
				}
			}

			setSourceNFTs(nftDetails);
		} catch (error) {
			console.error('获取NFT详情失败:', error);
			updateTransferState({
				error: '获取NFT信息失败',
				message: '❌ 无法加载NFT列表',
			});
		} finally {
			setLoadingNFTs(false);
		}
	}, [sourceNFTIds, updateTransferState]);

	// 转移NFT
	const transferNFT = useCallback(
		async (tokenId: number, toAddress: string) => {
			// 验证前置条件
			if (!isSourceAddressConnected) {
				updateTransferState({
					error: '请使用源地址连接钱包',
					message: `❌ 请使用地址 ${SOURCE_ADDRESS} 连接钱包`,
				});
				return;
			}

			if (!validateRecipientAddress(toAddress)) {
				updateTransferState({
					error: '无效的接收地址',
					message: '❌ 请输入有效的接收地址',
				});
				return;
			}

			try {
				clearTransferState();
				updateTransferState({
					loading: true,
					message: '🔄 准备转移NFT...',
				});

				// 执行转移
				writeContract({
					address: CONTRACT_ADDRESS,
					abi: WASTE_WISE_ABI,
					functionName: 'transferNFT',
					args: [toAddress as `0x${string}`, BigInt(tokenId)],
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : '转移失败';
				updateTransferState({
					loading: false,
					error: errorMessage,
					message: `❌ ${errorMessage}`,
				});
			}
		},
		[
			isSourceAddressConnected,
			validateRecipientAddress,
			writeContract,
			updateTransferState,
			clearTransferState,
		]
	);

	// 刷新源地址NFT列表
	const refreshSourceNFTs = useCallback(() => {
		refetchSourceNFTs();
	}, [refetchSourceNFTs]);

	// 监听交易状态变化
	useEffect(() => {
		if (isWritePending) {
			updateTransferState({
				loading: true,
				message: '📝 发送交易中...',
			});
		} else if (isConfirming) {
			updateTransferState({
				loading: true,
				message: '⏳ 等待区块链确认...',
			});
		} else if (isConfirmed && hash) {
			updateTransferState({
				loading: false,
				success: true,
				transactionHash: hash,
				message: `✅ NFT转移成功! 交易哈希: ${hash}`,
			});
			// 刷新NFT列表
			setTimeout(() => {
				refreshSourceNFTs();
			}, 2000);
		} else if (writeError) {
			updateTransferState({
				loading: false,
				error: writeError.message,
				message: `❌ 交易失败: ${writeError.message}`,
			});
		} else if (confirmError) {
			updateTransferState({
				loading: false,
				error: confirmError.message,
				message: `❌ 确认失败: ${confirmError.message}`,
			});
		}
	}, [
		isWritePending,
		isConfirming,
		isConfirmed,
		hash,
		writeError,
		confirmError,
		updateTransferState,
		refreshSourceNFTs,
	]);

	// 当NFT ID列表更新时，获取详细信息
	useEffect(() => {
		fetchNFTDetails();
	}, [fetchNFTDetails]);

	return {
		// 状态
		transferState,

		// 数据
		sourceNFTs,
		loadingNFTs,

		// 检查
		isSourceAddressConnected,
		currentUserAddress,

		// 操作
		transferNFT,
		refreshSourceNFTs,
		clearTransferState,

		// 工具函数
		validateRecipientAddress,
		getGasEstimate,
	};
}

'use client';

import { useState, useEffect, useCallback, use } from 'react';
import {
	useAccount,
	useWriteContract,
	useWaitForTransactionReceipt,
	useReadContract,
	useReadContracts,
} from 'wagmi';
import { isAddress } from 'viem';
import { CONTRACT_ADDRESS, WASTE_WISE_ABI } from '@/contract';

// 类型定义
export interface NFTInfo {
	tokenId: string;
	owner: string;
	tokenURI: string;
}

export interface MintParams {
	to: string;
	tokenURI: string;
}

export interface TransferParams {
	to: string;
	tokenId: number;
}

export interface ContractState {
	isLoading: boolean;
	error: string | null;
	message: string;
	messageType: 'success' | 'error' | 'info';
}

export interface WasteWiseContractReturn {
	// 状态
	state: ContractState;
	isOwner: boolean;
	contractInfo: {
		address: string;
		owner: string | undefined;
		totalSupply: bigint | undefined;
	};

	// 读取操作
	getUserNFTs: (userAddress?: string) => Promise<NFTInfo[]>;
	getNFTInfo: (tokenId: number) => Promise<NFTInfo | null>;
	checkNFTExists: (tokenId: number) => Promise<boolean>;
	getUserBalance: (userAddress?: string) => Promise<number>;

	// 写入操作
	mintNFT: (params: MintParams) => Promise<void>;
	transferNFT: (params: TransferParams) => Promise<void>;

	// 工具函数
	validateAddress: (address: string) => boolean;
	validateTokenURI: (uri: string) => boolean;
	clearState: () => void;

	// 刷新数据
	refetch: () => void;
}

export function useWasteWiseContract(): WasteWiseContractReturn {
	const { address, isConnected } = useAccount();

	// 状态管理
	const [state, setState] = useState<ContractState>({
		isLoading: false,
		error: null,
		message: '',
		messageType: 'info',
	});

	// 内部状态用于存储查询结果
	const [userTokenIds, setUserTokenIds] = useState<bigint[]>([]);
	const [targetAddress, setTargetAddress] = useState<string>('');

	// 读取合约数据
	const { data: contractOwner, refetch: refetchOwner } = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: WASTE_WISE_ABI,
		functionName: 'owner',
	});

	const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: WASTE_WISE_ABI,
		functionName: 'getTotalSupply',
	});

	// 获取用户NFT token IDs
	const { data: userNFTIds, refetch: refetchUserNFTs } = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: WASTE_WISE_ABI,
		functionName: 'getUserNFTs',
		args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
		query: {
			enabled: !!targetAddress && isAddress(targetAddress),
		},
	});

	// 获取用户余额
	const { data: userBalance, refetch: refetchBalance } = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: WASTE_WISE_ABI,
		functionName: 'balanceOf',
		args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
		query: {
			enabled: !!targetAddress && isAddress(targetAddress),
		},
	});

	// 批量获取NFT详细信息
	const nftContracts = userTokenIds
		.map((tokenId) => [
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
		])
		.flat();

	const { data: nftDetails, refetch: refetchNFTDetails } = useReadContracts({
		contracts: nftContracts,
		query: {
			enabled: userTokenIds.length > 0,
		},
	});

	// 写入操作
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

	// 检查是否为合约拥有者
	const isOwner =
		address && contractOwner
			? address.toLowerCase() === contractOwner.toLowerCase()
			: false;

	// 更新状态
	const updateState = useCallback((newState: Partial<ContractState>) => {
		setState((prev) => ({ ...prev, ...newState }));
	}, []);

	// 清除状态
	const clearState = useCallback(() => {
		setState({
			isLoading: false,
			error: null,
			message: '',
			messageType: 'info',
		});
	}, []);

	// 验证地址
	const validateAddress = useCallback((address: string): boolean => {
		return address.trim() !== '' && isAddress(address);
	}, []);

	// 验证 Token URI
	const validateTokenURI = useCallback((uri: string): boolean => {
		if (!uri.trim()) return false;
		try {
			new URL(uri);
			return true;
		} catch {
			return false;
		}
	}, []);

	// 获取用户NFT列表
	const getUserNFTs = useCallback(
		async (userAddress?: string): Promise<NFTInfo[]> => {
			const queryAddress = userAddress || address;
			console.log(userAddress, 'userAddress');
			if (!queryAddress) {
				// throw new Error('用户地址不能为空');
				return [];
			}

			updateState({ isLoading: true, error: null });

			try {
				// 设置目标地址以触发查询
				setTargetAddress(queryAddress);

				// 等待一下让 React Query 更新
				await new Promise((resolve) => setTimeout(resolve, 100));

				// 手动触发重新获取
				await refetchUserNFTs();

				if (!userNFTIds || !Array.isArray(userNFTIds)) {
					updateState({
						isLoading: false,
						message: '✅ 该用户暂无NFT',
						messageType: 'success',
					});
					return [];
				}

				// 更新状态以获取详细信息
				setUserTokenIds(userNFTIds as bigint[]);

				// 等待详细信息查询完成
				await refetchNFTDetails();

				const nfts: NFTInfo[] = [];

				if (nftDetails && userNFTIds.length > 0) {
					for (let i = 0; i < userNFTIds.length; i++) {
						const tokenId = userNFTIds[i];
						const baseIndex = i * 3;

						const ownerResult = nftDetails[baseIndex];
						const tokenURIResult = nftDetails[baseIndex + 1];
						const existsResult = nftDetails[baseIndex + 2];

						if (
							ownerResult?.status === 'success' &&
							tokenURIResult?.status === 'success' &&
							existsResult?.status === 'success' &&
							existsResult.result
						) {
							nfts.push({
								tokenId: tokenId.toString(),
								owner: ownerResult.result as string,
								tokenURI: tokenURIResult.result as string,
							});
						}
					}
				}

				updateState({
					isLoading: false,
					message: `✅ 成功获取 ${nfts.length} 个NFT`,
					messageType: 'success',
				});
				return nfts;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : '获取NFT列表失败';
				updateState({
					isLoading: false,
					error: errorMessage,
					message: `❌ ${errorMessage}`,
					messageType: 'error',
				});
				throw error;
			}
		},
		[
			address,
			updateState,
			refetchUserNFTs,
			refetchNFTDetails,
			userNFTIds,
			nftDetails,
		]
	);

	// 获取NFT信息
	const getNFTInfo = useCallback(
		async (tokenId: number): Promise<NFTInfo | null> => {
			updateState({ isLoading: true, error: null });

			try {
				// 创建单个NFT查询
				const singleNFTContracts = [
					{
						address: CONTRACT_ADDRESS,
						abi: WASTE_WISE_ABI,
						functionName: 'exists',
						args: [BigInt(tokenId)],
					},
					{
						address: CONTRACT_ADDRESS,
						abi: WASTE_WISE_ABI,
						functionName: 'ownerOf',
						args: [BigInt(tokenId)],
					},
					{
						address: CONTRACT_ADDRESS,
						abi: WASTE_WISE_ABI,
						functionName: 'tokenURI',
						args: [BigInt(tokenId)],
					},
				];

				// 使用 useReadContracts 但需要在组件外部，这里我们模拟等待结果
				// 实际应用中，你可能需要创建一个单独的 hook 或使用状态管理

				updateState({
					isLoading: false,
					message: `✅ 请使用组件内的 useReadContracts 来实现单个NFT查询`,
					messageType: 'info',
				});

				// 这里返回 null，实际实现需要在组件层面处理
				return null;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : '获取NFT信息失败';
				updateState({
					isLoading: false,
					error: errorMessage,
					message: `❌ ${errorMessage}`,
					messageType: 'error',
				});
				return null;
			}
		},
		[updateState]
	);

	// 检查NFT是否存在 - 需要在组件中使用 useReadContract
	const checkNFTExists = useCallback(
		async (tokenId: number): Promise<boolean> => {
			// 这个函数需要在组件中单独实现 useReadContract
			// 这里返回 false 作为默认值
			console.warn('checkNFTExists 需要在组件中使用 useReadContract 实现');
			return false;
		},
		[]
	);

	// 获取用户余额
	const getUserBalance = useCallback(
		async (userAddress?: string): Promise<number> => {
			const queryAddress = userAddress || address;
			if (!queryAddress) return 0;

			// 设置目标地址
			setTargetAddress(queryAddress);

			// 触发重新获取
			await refetchBalance();

			return userBalance ? Number(userBalance) : 0;
		},
		[address, userBalance, refetchBalance]
	);

	// 铸造NFT
	const mintNFT = useCallback(
		async ({ to, tokenURI }: MintParams) => {
			// 验证输入
			if (!validateAddress(to)) {
				updateState({
					error: '接收者地址无效',
					message: '❌ 接收者地址无效',
					messageType: 'error',
				});
				return;
			}

			if (!validateTokenURI(tokenURI)) {
				updateState({
					error: 'Token URI无效',
					message: '❌ Token URI无效',
					messageType: 'error',
				});
				return;
			}

			if (!isConnected) {
				updateState({
					error: '钱包未连接',
					message: '❌ 请先连接钱包',
					messageType: 'error',
				});
				return;
			}

			if (!isOwner) {
				updateState({
					error: '权限不足',
					message: '❌ 只有合约拥有者才能铸造NFT',
					messageType: 'error',
				});
				return;
			}

			try {
				clearState();
				writeContract({
					address: CONTRACT_ADDRESS,
					abi: WASTE_WISE_ABI,
					functionName: 'mintNFT',
					args: [to as `0x${string}`, tokenURI],
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : '铸造失败';
				updateState({
					error: errorMessage,
					message: `❌ ${errorMessage}`,
					messageType: 'error',
				});
			}
		},
		[
			validateAddress,
			validateTokenURI,
			isConnected,
			isOwner,
			writeContract,
			updateState,
			clearState,
		]
	);

	// 转移NFT
	const transferNFT = useCallback(
		async ({ to, tokenId }: TransferParams) => {
			if (!validateAddress(to)) {
				updateState({
					error: '接收者地址无效',
					message: '❌ 接收者地址无效',
					messageType: 'error',
				});
				return;
			}

			if (!isConnected) {
				updateState({
					error: '钱包未连接',
					message: '❌ 请先连接钱包',
					messageType: 'error',
				});
				return;
			}

			try {
				clearState();
				writeContract({
					address: CONTRACT_ADDRESS,
					abi: WASTE_WISE_ABI,
					functionName: 'transferNFT',
					args: [to as `0x${string}`, BigInt(tokenId)],
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : '转移失败';
				updateState({
					error: errorMessage,
					message: `❌ ${errorMessage}`,
					messageType: 'error',
				});
			}
		},
		[validateAddress, isConnected, writeContract, updateState, clearState]
	);

	// 刷新所有数据
	const refetch = useCallback(() => {
		refetchOwner();
		refetchTotalSupply();
		refetchUserNFTs();
		refetchBalance();
		refetchNFTDetails();
	}, [
		refetchOwner,
		refetchTotalSupply,
		refetchUserNFTs,
		refetchBalance,
		refetchNFTDetails,
	]);

	// 监听交易状态变化
	useEffect(() => {
		if (isWritePending) {
			updateState({
				isLoading: true,
				message: '📝 交易发送中...',
				messageType: 'info',
			});
		} else if (isConfirming) {
			updateState({
				isLoading: true,
				message: '⏳ 等待区块链确认...',
				messageType: 'info',
			});
		} else if (isConfirmed) {
			updateState({
				isLoading: false,
				error: null,
				message: `✅ 交易成功! 哈希: ${hash}`,
				messageType: 'success',
			});
			// 刷新数据
			refetch();
		} else if (writeError) {
			updateState({
				isLoading: false,
				error: writeError.message,
				message: `❌ 交易失败: ${writeError.message}`,
				messageType: 'error',
			});
		} else if (confirmError) {
			updateState({
				isLoading: false,
				error: confirmError.message,
				message: `❌ 确认失败: ${confirmError.message}`,
				messageType: 'error',
			});
		}
	}, [
		isWritePending,
		isConfirming,
		isConfirmed,
		writeError,
		confirmError,
		hash,
		updateState,
		refetch,
	]);

	return {
		state,
		isOwner,
		contractInfo: {
			address: CONTRACT_ADDRESS,
			owner: contractOwner,
			totalSupply,
		},

		// 读取操作
		getUserNFTs,
		getNFTInfo,
		checkNFTExists,
		getUserBalance,

		// 写入操作
		mintNFT,
		transferNFT,

		// 工具函数
		validateAddress,
		validateTokenURI,
		clearState,

		// 刷新数据
		refetch,
	};
}

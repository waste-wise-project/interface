'use client';

import { useState, useEffect, useCallback } from 'react';
import {
	useAccount,
	useWriteContract,
	useWaitForTransactionReceipt,
	useReadContract,
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
			const targetAddress = userAddress || address;
			if (!targetAddress) {
				throw new Error('用户地址不能为空');
			}

			updateState({ isLoading: true, error: null });

			try {
				// 这里应该使用 useReadContract，但为了在函数中调用，我们模拟实现
				// 实际项目中，你可能需要使用 wagmi 的 readContract 函数

				// 模拟数据 - 实际实现需要调用合约
				const nfts: NFTInfo[] = [];

				updateState({ isLoading: false });
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
		[address, updateState]
	);

	// 获取NFT信息
	const getNFTInfo = useCallback(
		async (tokenId: number): Promise<NFTInfo | null> => {
			updateState({ isLoading: true, error: null });

			try {
				// 实际实现需要调用合约读取方法
				// const owner = await readContract({...});
				// const tokenURI = await readContract({...});

				updateState({ isLoading: false });
				return null; // 返回实际数据
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

	// 检查NFT是否存在
	const checkNFTExists = useCallback(
		async (tokenId: number): Promise<boolean> => {
			try {
				// 实际实现需要调用合约
				return false;
			} catch {
				return false;
			}
		},
		[]
	);

	// 获取用户余额
	const getUserBalance = useCallback(
		async (userAddress?: string): Promise<number> => {
			const targetAddress = userAddress || address;
			if (!targetAddress) return 0;

			try {
				// 实际实现需要调用合约
				return 0;
			} catch {
				return 0;
			}
		},
		[address]
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
		[validateAddress, writeContract, updateState, clearState]
	);

	// 刷新所有数据
	const refetch = useCallback(() => {
		refetchOwner();
		refetchTotalSupply();
	}, [refetchOwner, refetchTotalSupply]);

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

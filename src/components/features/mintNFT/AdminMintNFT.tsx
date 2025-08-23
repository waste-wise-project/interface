'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import nftApiService, {
	type AddNftToPoolRequest,
	type MintNFTResponse,
} from '@/services/nftApi';
import { NFTForm } from './NFTForm';
import { NFTPreview } from './NFTPreview';
import { StatusMessage } from './StatusMessage';
import { WalletRequiredMessage } from './WalletRequiredMessage';

interface AdminMintNFTProps {
	className?: string;
}

export interface NFTFormData {
	name: string;
	description: string;
	imageUrl: string;
	category: string;
	rarity: number;
	requiredScore: number;
	requiredClassifications: number;
}

export default function AdminMintNFT({ className = '' }: AdminMintNFTProps) {
	// NFT 表单数据
	const [formData, setFormData] = useState<NFTFormData>({
		name: '',
		description: '',
		imageUrl: '',
		category: 'achievement',
		rarity: 1,
		requiredScore: 0,
		requiredClassifications: 0,
	});

	// 状态管理
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>(
		'info'
	);

	const { address: walletAddress, isConnected } = useAccount();

	// 清空表单
	const clearForm = () => {
		setFormData({
			name: '',
			description: '',
			imageUrl: '',
			category: 'achievement',
			rarity: 1,
			requiredScore: 0,
			requiredClassifications: 0,
		});
		setMessage(null);
	};

	// 处理铸造NFT - 调用后端API
	const handleMintNFT = async () => {
		// 构建请求数据
		const mintData: AddNftToPoolRequest = {
			name: formData.name,
			description: formData.description,
			imageUrl: formData.imageUrl,
			category: formData.category,
			rarity: formData.rarity,
			requiredScore: formData.requiredScore,
			requiredClassifications: formData.requiredClassifications,
			attributes: nftApiService.buildNFTAttributes({
				category: formData.category,
				rarity: formData.rarity,
				customAttributes: [],
			}),
		};

		// 验证数据
		const validation = nftApiService.validateNFTData(mintData);
		if (!validation.isValid) {
			setMessage(`❌ 数据验证失败: ${validation.errors.join(', ')}`);
			setMessageType('error');
			return;
		}

		setIsLoading(true);
		setMessage('正在铸造NFT到区块链，请稍候...');
		setMessageType('info');

		try {
			// 调用后端API铸造NFT
			const response: MintNFTResponse = await nftApiService.mintNftToPool(
				mintData
			);

			setMessage(
				`🎉 NFT铸造成功！Token ID: ${
					response.tokenId
				}，交易哈希: ${nftApiService.formatTxHash(
					response.blockchainInfo.transactionHash
				)}`
			);
			setMessageType('success');

			// 清空表单
			setTimeout(() => {
				clearForm();
			}, 2000);
		} catch (error: unknown) {
			console.error('铸造NFT失败:', error);
			const errorMessage = error instanceof Error ? error.message : '网络错误，请检查后端服务并稍后重试';
			setMessage(`❌ 铸造失败: ${errorMessage}`);
			setMessageType('error');
		} finally {
			setIsLoading(false);
		}
	};

	// 验证表单
	const isFormValid = () => {
		return nftApiService.validateNFTData(formData).isValid;
	};

	// 如果未连接钱包
	if (!isConnected) {
		return <WalletRequiredMessage className={className} />;
	}

	return (
		<div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 ${className}`}>
			{/* 标题 */}
			<div className='mb-6'>
				<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
					🏭 管理员 NFT 铸造
				</h2>
				<div className='mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded'>
					当前钱包:{' '}
					{walletAddress
						? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
						: '未连接'}
				</div>
			</div>

			{/* NFT表单 */}
			<NFTForm
				formData={formData}
				setFormData={setFormData}
				isLoading={isLoading}
			/>

			{/* NFT预览 */}
			{isFormValid() && <NFTPreview formData={formData} className='mt-6' />}

			{/* 铸造按钮 */}
			<button
				onClick={handleMintNFT}
				disabled={!isFormValid() || isLoading}
				className='w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium'
			>
				{isLoading ? (
					<span className='flex items-center justify-center'>
						<svg
							className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
							fill='none'
							viewBox='0 0 24 24'
						>
							<circle
								className='opacity-25'
								cx='12'
								cy='12'
								r='10'
								stroke='currentColor'
								strokeWidth='4'
							></circle>
							<path
								className='opacity-75'
								fill='currentColor'
								d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
							></path>
						</svg>
						铸造中，请稍候...
					</span>
				) : (
					'🎨 铸造 NFT 到区块链'
				)}
			</button>

			{/* 状态消息 */}
			<StatusMessage
				message={message}
				messageType={messageType}
				className='mt-4'
			/>

			{/* 使用说明 */}
			<div className='mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md'>
				<h4 className='font-medium text-gray-800 dark:text-white mb-2'>💡 使用说明:</h4>
				<ul className='text-sm text-gray-600 dark:text-gray-300 space-y-1'>
					<li>• 所有标记为 * 的字段都是必填项</li>
					<li>• 稀有度 1-5 星，越高越稀有，影响NFT的珍贵程度</li>
					<li>• 图片URL必须是可公开访问的HTTPS链接</li>
					<li>• 积分和分类次数决定用户获取NFT的门槛</li>
					<li>• NFT将自动铸造到区块链合约并上传元数据到IPFS</li>
					<li>• 铸造成功后会自动添加到NFT可领取池中</li>
					<li>• 符合条件的用户可以在NFT页面找到并领取</li>
				</ul>
			</div>
		</div>
	);
}

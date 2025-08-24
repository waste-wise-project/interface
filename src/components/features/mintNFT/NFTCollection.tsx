'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNftStore } from '@/stores/useNftStore';
import NFTCard from './NFTCard';

interface NFTCollectionProps {
	className?: string;
}

export function NFTCollection({ className = '' }: NFTCollectionProps) {
	const { address: walletAddress, isConnected } = useAccount();
	const {
		eligibleNfts,
		ownedNfts,
		isLoadingEligible,
		isLoadingOwned,
		isClaiming,
		error,
		fetchEligibleNfts,
		fetchOwnedNfts,
		fetchNftClaims,
		claimNft,
		clearError,
	} = useNftStore();


	// 加载数据
	useEffect(() => {
		if (isConnected && walletAddress) {
			fetchEligibleNfts(walletAddress);
			fetchOwnedNfts(walletAddress);
			fetchNftClaims(walletAddress);
		}
	}, [isConnected, walletAddress, fetchEligibleNfts, fetchOwnedNfts, fetchNftClaims]);

	// 处理领取NFT
	const handleClaimNft = async (nftPoolId: number) => {
		if (!walletAddress) return;

		try {
			await claimNft(walletAddress, nftPoolId);
		} catch {
			// 错误已经在store中处理
		}
	};

	if (!isConnected) {
		return (
			<div
				className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}
			>
				<div className='text-center'>
					<h3 className='text-lg font-semibold text-yellow-800 mb-2'>
						⚠️ 请先连接钱包
					</h3>
					<p className='text-yellow-700'>需要连接钱包才能查看NFT收藏</p>
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* 错误提示 */}
			{error && (
				<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
					<div className='flex items-center justify-between'>
						<p className='text-red-800 text-sm'>{error}</p>
						<button
							onClick={clearError}
							className='text-red-600 hover:text-red-800'
						>
							<svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
								<path
									fillRule='evenodd'
									d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
									clipRule='evenodd'
								/>
							</svg>
						</button>
					</div>
				</div>
			)}

			{/* 可领取的NFT */}
			<div>
				<h3 className='text-xl font-semibold text-gray-900 mb-4'>
					🎁 可领取的NFT
				</h3>

				{isLoadingEligible ? (
					<div className='text-center py-8'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
						<p className='text-gray-500 mt-2'>加载中...</p>
					</div>
				) : eligibleNfts.length === 0 ? (
					<div className='text-center py-8 bg-gray-50 rounded-lg'>
						<p className='text-gray-500'>暂无可领取的NFT</p>
						<p className='text-sm text-gray-400 mt-1'>
							完成更多垃圾分类任务来解锁NFT奖励
						</p>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{eligibleNfts.map((nft, index) => (
							<NFTCard
								key={nft.id}
								nft={nft}
								type='eligible'
								onClaim={handleClaimNft}
								isClaiming={isClaiming}
								index={index}
							/>
						))}
					</div>
				)}
			</div>

			{/* 已拥有的NFT */}
			<div>
				<h3 className='text-xl font-semibold text-gray-900 mb-4'>
					🏆 我的NFT收藏
				</h3>

				{isLoadingOwned ? (
					<div className='text-center py-8'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
						<p className='text-gray-500 mt-2'>加载中...</p>
					</div>
				) : ownedNfts.length === 0 ? (
					<div className='text-center py-8 bg-gray-50 rounded-lg'>
						<p className='text-gray-500'>您还没有拥有任何NFT</p>
						<p className='text-sm text-gray-400 mt-1'>
							快去领取第一个环保NFT吧！
						</p>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{ownedNfts.map((ownedNft, index) => (
							<NFTCard
								key={ownedNft.claimId}
								nft={ownedNft}
								type='owned'
								index={index}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

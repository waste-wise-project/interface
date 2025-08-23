'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNftStore } from '@/stores/useNftStore';
import nftApiService from '@/services/nftApi';
import Image from 'next/image';

interface NFTCollectionProps {
	className?: string;
}

export function NFTCollection({ className = '' }: NFTCollectionProps) {
	const { address: walletAddress, isConnected } = useAccount();
	const {
		eligibleNfts,
		ownedNfts,
		nftClaims,
		isLoadingEligible,
		isLoadingOwned,
		isLoadingClaims,
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
	}, [isConnected, walletAddress]);

	// 处理领取NFT
	const handleClaimNft = async (nftPoolId: number) => {
		if (!walletAddress) return;

		try {
			await claimNft(walletAddress, nftPoolId);
		} catch (error) {
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
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{eligibleNfts.map((nft) => (
							<div
								key={nft.id}
								className='bg-white rounded-lg shadow-md p-4 border'
							>
								{nft.imageUrl && (
									<Image
										width={512}
										height={512}
										src={nft.imageUrl}
										alt={nft.name}
										className='w-full h-48 object-cover rounded-lg mb-3'
									/>
								)}
								<h4 className='font-semibold text-gray-900 mb-2'>{nft.name}</h4>
								<p className='text-sm text-gray-600 mb-3 line-clamp-2'>
									{nft.description}
								</p>

								{/* NFT属性 */}
								<div className='flex flex-wrap gap-1 mb-3'>
									<span
										className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${nftApiService.getRarityColor(
											nft.rarity
										)}`}
									>
										{'⭐'.repeat(nft.rarity)}
									</span>
									<span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-gray-600 bg-gray-100'>
										{nftApiService.formatCategory(nft.category || 'general')}
									</span>
								</div>

								{/* 领取条件 */}
								{!nft.canClaim && nft.missingRequirements.length > 0 && (
									<div className='text-xs text-orange-600 bg-orange-50 p-2 rounded mb-3'>
										<p>还需要:</p>
										<ul className='list-disc list-inside'>
											{nft.missingRequirements.map((req, index) => (
												<li key={index}>{req}</li>
											))}
										</ul>
									</div>
								)}

								{/* 领取按钮 */}
								<button
									onClick={() => handleClaimNft(nft.id!)}
									disabled={!nft.canClaim || isClaiming}
									className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
										nft.canClaim
											? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
											: 'bg-gray-100 text-gray-400 cursor-not-allowed'
									}`}
								>
									{isClaiming
										? '领取中...'
										: nft.canClaim
										? '🎁 领取NFT'
										: '条件不足'}
								</button>
							</div>
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
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{ownedNfts.map((ownedNft) => (
							<div
								key={ownedNft.claimId}
								className='bg-white rounded-lg shadow-md p-4 border border-green-200'
							>
								{ownedNft.nft.imageUrl && (
									<img
										src={ownedNft.nft.imageUrl}
										alt={ownedNft.nft.name}
										className='w-full h-48 object-cover rounded-lg mb-3'
									/>
								)}
								<h4 className='font-semibold text-gray-900 mb-2'>
									{ownedNft.nft.name}
								</h4>
								<p className='text-sm text-gray-600 mb-3 line-clamp-2'>
									{ownedNft.nft.description}
								</p>

								{/* NFT属性 */}
								<div className='flex flex-wrap gap-1 mb-3'>
									<span
										className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${nftApiService.getRarityColor(
											ownedNft.nft.rarity
										)}`}
									>
										{'⭐'.repeat(ownedNft.nft.rarity)}
									</span>
									<span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-100'>
										已拥有
									</span>
								</div>

								{/* 获得时间和交易信息 */}
								<div className='text-xs text-gray-500 space-y-1'>
									<p>
										获得时间:{' '}
										{new Date(ownedNft.claimedAt).toLocaleDateString()}
									</p>
									<p>
										交易哈希:{' '}
										{nftApiService.formatTxHash(ownedNft.transactionHash)}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import nftApiService from '@/services/nftApi';
import type { EligibleNFT, OwnedNFT } from '@/types/nft';

interface NFTCardProps {
	nft: EligibleNFT | OwnedNFT;
	type: 'eligible' | 'owned';
	onClaim?: (nftPoolId: number) => void;
	isClaiming?: boolean;
	index?: number;
}

export default function NFTCard({
	nft,
	type,
	onClaim,
	isClaiming = false,
	index = 0,
}: NFTCardProps) {
	// 获取NFT数据
	const getNftData = () => {
		switch (type) {
			case 'owned':
				return (nft as OwnedNFT).nft;
			default:
				return nft as EligibleNFT;
		}
	};

	const nftData = getNftData();
	const ownedNft = type === 'owned' ? (nft as OwnedNFT) : null;
	const eligibleNft = type === 'eligible' ? (nft as EligibleNFT) : null;

	// 获取状态颜色和样式
	const getStatusStyle = () => {
		switch (type) {
			case 'owned':
				return {
					topBar: 'bg-gradient-to-r from-green-400 to-green-600',
					badge: 'bg-gradient-to-r from-green-500 to-green-600',
					badgeText: '✅ 已拥有',
					hoverBg: 'bg-gradient-to-br from-green-400 to-green-600',
				};
			default:
				return {
					topBar: eligibleNft!.canClaim
						? 'bg-gradient-to-r from-blue-400 to-blue-600'
						: 'bg-gradient-to-r from-gray-300 to-gray-400',
					badge: eligibleNft!.canClaim
						? 'bg-gradient-to-r from-blue-500 to-blue-600'
						: 'bg-gradient-to-r from-gray-400 to-gray-500',
					badgeText: eligibleNft!.canClaim ? '🎁 可领取' : '⏳ 进行中',
					hoverBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
				};
		}
	};

	const statusStyle = getStatusStyle();

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				delay: index * 0.1,
				type: 'spring',
				stiffness: 100,
				damping: 12,
			}}
			whileHover={{
				y: -6,
				scale: 1.02,
				transition: { duration: 0.2 },
			}}
			className='group cursor-pointer w-full'
		>
			<div className='bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 relative backdrop-blur-sm'>
				{/* 顶部状态条 */}
				<div
					className={`absolute top-0 left-0 right-0 h-1 ${statusStyle.topBar}`}
				/>

				{/* NFT图片容器 */}
				<div className='relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-50 to-gray-100'>
					<div className='aspect-square relative group-hover:scale-105 transition-transform duration-300'>
						{nftData.imageUrl && (
							<Image
								width={400}
								height={400}
								src={nftData.imageUrl}
								alt={nftData.name}
								className='w-full h-full object-cover'
								onError={() => '/default-nft.svg'}
								priority={index < 6}
							/>
						)}

						{/* 悬浮遮罩 */}
						<div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4'>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								whileHover={{ opacity: 1, y: 0 }}
								className='text-white font-bold text-sm bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm'
							>
								{type === 'owned' && '🎁 已领取'}
								{type === 'eligible' &&
									(eligibleNft!.canClaim ? '🎁 可领取' : '⏳ 努力中')}
							</motion.div>
						</div>
					</div>

					{/* 右上角状态标签 */}
					<div className='absolute top-3 right-3'>
						<span
							className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${statusStyle.badge}`}
						>
							{statusStyle.badgeText}
						</span>
					</div>
				</div>

				{/* 卡片内容 */}
				<div className='p-5 space-y-4'>
					{/* 标题和描述 */}
					<div>
						<h4 className='font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-800 transition-colors'>
							{nftData.name}
						</h4>
						<p className='text-sm text-gray-600 line-clamp-2 leading-relaxed'>
							{nftData.description}
						</p>
					</div>

					{/* NFT属性标签 */}
					<div className='flex flex-wrap gap-2'>
						<span
							className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${nftApiService.getRarityColor(
								nftData.rarity
							)}`}
						>
							{'⭐'.repeat(nftData.rarity)}{' '}
							{nftApiService.getRarityLabel(nftData.rarity)}
						</span>
						<span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-50'>
							{nftApiService.formatCategory(nftData.category || 'general')}
						</span>
					</div>

					{/* 详细信息 */}
					<div className='space-y-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg'>
						{/* TokenID显示（仅已拥有的NFT） */}
						{type === 'owned' && ownedNft && ownedNft.tokenId !== undefined && (
							<div className='flex justify-between items-center'>
								<span>Token ID:</span>
								<span className='font-mono font-bold text-blue-600'>
									{ownedNft.tokenId}
								</span>
							</div>
						)}

						{/* 已拥有NFT的信息 */}
						{type === 'owned' && ownedNft && (
							<>
								<div className='flex justify-between items-center'>
									<span>获得时间:</span>
									<span className='font-medium'>
										{new Date(ownedNft.claimedAt).toLocaleDateString('zh-CN')}
									</span>
								</div>
								<div className='flex justify-between items-center'>
									<span>交易哈希:</span>
									<span className='font-mono text-blue-600'>
										{nftApiService.formatTxHash(ownedNft.transactionHash)}
									</span>
								</div>
								{ownedNft.contractAddress && (
									<div className='flex justify-between items-center'>
										<span>合约地址:</span>
										<span className='font-mono text-purple-600'>
											{nftApiService.formatTxHash(ownedNft.contractAddress)}
										</span>
									</div>
								)}
							</>
						)}

						{/* 可领取NFT的条件信息 */}
						{type === 'eligible' &&
							eligibleNft &&
							nftData.requiredScore > 0 && (
								<div className='flex justify-between items-center'>
									<span>需求积分:</span>
									<span className='font-bold text-amber-600'>
										{nftData.requiredScore}
									</span>
								</div>
							)}
					</div>

					{/* 领取条件提示 */}
					{type === 'eligible' &&
						eligibleNft &&
						!eligibleNft.canClaim &&
						eligibleNft.missingRequirements.length > 0 && (
							<div className='bg-orange-50 border border-orange-200 p-3 rounded-lg'>
								<p className='text-xs font-semibold text-orange-800 mb-1'>
									还需要:
								</p>
								<ul className='text-xs text-orange-700 space-y-0.5'>
									{eligibleNft.missingRequirements.map((req, index) => (
										<li key={index} className='flex items-center'>
											<span className='w-1 h-1 bg-orange-400 rounded-full mr-2' />
											{req}
										</li>
									))}
								</ul>
							</div>
						)}

					{/* 领取按钮（仅对可领取的NFT显示） */}
					{type === 'eligible' && eligibleNft && (
						<motion.button
							whileHover={{ scale: eligibleNft.canClaim ? 1.02 : 1 }}
							whileTap={{ scale: eligibleNft.canClaim ? 0.98 : 1 }}
							onClick={() => eligibleNft.canClaim && onClaim?.(nftData.id!)}
							disabled={!eligibleNft.canClaim || isClaiming}
							className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
								eligibleNft.canClaim
									? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl disabled:opacity-50'
									: 'bg-gray-100 text-gray-400 cursor-not-allowed'
							}`}
						>
							{isClaiming ? (
								<span className='flex items-center justify-center'>
									<svg
										className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
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
									领取中...
								</span>
							) : eligibleNft.canClaim ? (
								'🎁 立即领取'
							) : (
								'⏳ 条件不足'
							)}
						</motion.button>
					)}
				</div>

				{/* 悬浮光效 */}
				<div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
					<div
						className={`absolute inset-0 opacity-10 rounded-2xl ${statusStyle.hoverBg}`}
					/>
				</div>
			</div>
		</motion.div>
	);
}

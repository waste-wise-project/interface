'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NFTInfo, useWasteWiseContract } from '@/hooks/useWasteWiseContract';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUserNFTs } from '@/hooks/useUserNFTs';

// 注意：在客户端组件中不能导出metadata
// 如果需要metadata，应该在layout.tsx或者使用动态metadata

export default function CollectionPage() {
	const { isConnected, address } = useAccount();
	const { nfts, isLoading, error, refetch } = useUserNFTs();

	if (!isConnected) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-6xl mb-4'>🏆</div>
					<h1 className='text-2xl font-bold text-gray-900 mb-4'>我的NFT收藏</h1>
					<p className='text-gray-600 mb-8'>连接钱包查看你的环保NFT收藏</p>
					<div className='flex justify-center'>
						<ConnectButton />
					</div>
				</div>
			</div>
		);
	}

	if (isLoading)
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				加载中...
			</div>
		);
	if (error)
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				错误: {error}
			</div>
		);
	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='max-w-6xl mx-auto px-4'>
				<div className='text-center mb-8'>
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>
						🏆 我的NFT收藏
					</h1>
					<p className='text-gray-600'>查看你通过垃圾分类获得的环保NFT</p>
				</div>

				{/* NFT网格 - 这里可以添加实际的NFT显示逻辑 */}
				<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6'>
					{nfts
						.filter((item) => item.metadata)
						.map((item, id) => (
							<div key={id} className='bg-white rounded-lg shadow-md p-4'>
								<div className='aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center'>
									<Image
										alt={item?.metadata?.name || ''}
										src={item?.metadata?.image || ''}
										width={512}
										height={512}
									/>
								</div>
								<h3 className='font-semibold mb-2 text-black'>
									{item?.metadata?.name || ''}
								</h3>
								<p className='text-sm text-gray-600'>
									{item?.metadata?.description || ''}
								</p>
							</div>
						))}
				</div>

				{/* 空状态 */}
				{nfts.length === 0 && (
					<div className='text-center py-12'>
						<div className='text-6xl mb-4'>🎯</div>
						<h2 className='text-xl font-semibold text-gray-900 mb-2'>
							开始你的环保之旅
						</h2>
						<p className='text-gray-600 mb-6'>
							每正确分类垃圾即可获得一个独特的环保NFT
						</p>
						<a
							href='/classification'
							className='inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors'
						>
							开始分类挑战
						</a>
					</div>
				)}
			</div>
		</div>
	);
}

function getUserNFTs() {
	throw new Error('Function not implemented.');
}

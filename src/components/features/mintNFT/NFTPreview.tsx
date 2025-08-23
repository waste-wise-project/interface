'use client';

import nftApiService from '@/services/nftApi';
import { NFTFormData } from './AdminMintNFT';

interface NFTPreviewProps {
	formData: NFTFormData;
	className?: string;
}

export function NFTPreview({ formData, className = '' }: NFTPreviewProps) {
	return (
		<div className={`p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg ${className}`}>
			<h4 className='font-medium text-blue-800 mb-3 flex items-center'>
				🎨 NFT 预览卡片
			</h4>
			<div className='bg-white p-4 rounded-lg shadow-sm'>
				<div className='flex items-start space-x-4'>
					{/* 缩略图 */}
					{formData.imageUrl && (
						<img
							src={formData.imageUrl}
							alt='NFT缩略图'
							className='w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0'
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = 'none';
							}}
						/>
					)}
					
					{/* NFT信息 */}
					<div className='flex-1 min-w-0'>
						<h5 className='font-semibold text-gray-900 truncate mb-1'>
							{formData.name}
						</h5>
						<p className='text-sm text-gray-600 mb-3 line-clamp-2'>
							{formData.description}
						</p>
						
						{/* 属性标签 */}
						<div className='flex flex-wrap gap-2'>
							<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${nftApiService.getRarityColor(formData.rarity)}`}>
								{'⭐'.repeat(formData.rarity)} {nftApiService.formatRarity(formData.rarity)}
							</span>
							
							<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-600 bg-gray-100'>
								{nftApiService.formatCategory(formData.category)}
							</span>
							
							{formData.requiredScore > 0 && (
								<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-100'>
									💰 {nftApiService.formatScore(formData.requiredScore)} 积分
								</span>
							)}
							
							{formData.requiredClassifications > 0 && (
								<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-100'>
									🗂️ {formData.requiredClassifications} 次分类
								</span>
							)}
						</div>
					</div>
				</div>
			</div>
			
			{/* 详细数据预览 */}
			<div className='mt-4 bg-white p-3 rounded-lg text-sm'>
				<h6 className='font-medium text-gray-700 mb-2'>📊 详细信息:</h6>
				<div className='grid grid-cols-2 gap-2 text-xs'>
					<div>
						<span className='text-gray-500'>名称:</span>
						<span className='ml-2 text-gray-800 font-medium'>{formData.name}</span>
					</div>
					<div>
						<span className='text-gray-500'>稀有度:</span>
						<span className='ml-2 text-gray-800 font-medium'>
							{formData.rarity} 星 - {nftApiService.formatRarity(formData.rarity)}
						</span>
					</div>
					<div>
						<span className='text-gray-500'>类别:</span>
						<span className='ml-2 text-gray-800 font-medium'>
							{nftApiService.formatCategory(formData.category)}
						</span>
					</div>
					<div>
						<span className='text-gray-500'>获取条件:</span>
						<span className='ml-2 text-gray-800 font-medium'>
							{formData.requiredScore > 0 || formData.requiredClassifications > 0 
								? `${formData.requiredScore}积分 + ${formData.requiredClassifications}次分类`
								: '无条件限制'
							}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
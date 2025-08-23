'use client';

import { Dispatch, SetStateAction } from 'react';
import nftApiService from '@/services/nftApi';
import { NFTFormData } from './AdminMintNFT';

interface NFTFormProps {
	formData: NFTFormData;
	setFormData: Dispatch<SetStateAction<NFTFormData>>;
	isLoading: boolean;
}

export function NFTForm({ formData, setFormData, isLoading }: NFTFormProps) {
	const updateFormData = (field: keyof NFTFormData, value: string | number) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<div className='space-y-6'>
			{/* NFT 基本信息 */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						NFT 名称 *
					</label>
					<input
						type='text'
						placeholder='环保战士 #001'
						value={formData.name}
						onChange={(e) => updateFormData('name', e.target.value)}
						disabled={isLoading}
						maxLength={100}
						className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors'
					/>
					<div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
						{formData.name.length}/100 字符
					</div>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						图片URL *
					</label>
					<input
						type='url'
						placeholder='https://example.com/nft.png'
						value={formData.imageUrl}
						onChange={(e) => updateFormData('imageUrl', e.target.value)}
						disabled={isLoading}
						className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors'
					/>
					<div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
						支持 HTTPS 图片链接
					</div>
				</div>
			</div>

			{/* NFT 描述 */}
			<div>
				<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
					NFT 描述 *
				</label>
				<textarea
					placeholder='描述这个NFT的获得原因和意义...'
					value={formData.description}
					onChange={(e) => updateFormData('description', e.target.value)}
					disabled={isLoading}
					maxLength={500}
					rows={3}
					className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 resize-none transition-colors'
				/>
				<div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
					{formData.description.length}/500 字符
				</div>
			</div>

			{/* NFT 属性配置 */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						类别
					</label>
					<select
						value={formData.category}
						onChange={(e) => updateFormData('category', e.target.value)}
						disabled={isLoading}
						className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors'
					>
						<option value='achievement'>🏆 成就类</option>
						<option value='milestone'>🎯 里程碑</option>
						<option value='special'>⭐ 特殊奖励</option>
						<option value='general'>📦 通用</option>
					</select>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						稀有度 (1-5)
					</label>
					<select
						value={formData.rarity}
						onChange={(e) => updateFormData('rarity', Number(e.target.value))}
						disabled={isLoading}
						className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors'
					>
						<option value={1}>⭐ 1 - {nftApiService.formatRarity(1)}</option>
						<option value={2}>⭐⭐ 2 - {nftApiService.formatRarity(2)}</option>
						<option value={3}>⭐⭐⭐ 3 - {nftApiService.formatRarity(3)}</option>
						<option value={4}>⭐⭐⭐⭐ 4 - {nftApiService.formatRarity(4)}</option>
						<option value={5}>⭐⭐⭐⭐⭐ 5 - {nftApiService.formatRarity(5)}</option>
					</select>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						需要积分
					</label>
					<input
						type='number'
						min='0'
						step='1'
						value={formData.requiredScore}
						onChange={(e) => updateFormData('requiredScore', Number(e.target.value))}
						disabled={isLoading}
						className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors'
					/>
				</div>
			</div>

			{/* 需要分类次数和积分预览 */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						需要分类次数
					</label>
					<input
						type='number'
						min='0'
						step='1'
						value={formData.requiredClassifications}
						onChange={(e) => updateFormData('requiredClassifications', Number(e.target.value))}
						disabled={isLoading}
						className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 transition-colors'
					/>
				</div>
				
				{/* 实时预览积分显示 */}
				<div className='flex items-end'>
					<div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-md w-full'>
						<div className='text-sm text-gray-600 dark:text-gray-400'>积分显示预览:</div>
						<div className='font-semibold text-gray-800 dark:text-white'>
							{nftApiService.formatScore(formData.requiredScore)} 积分
						</div>
					</div>
				</div>
			</div>

			{/* 图片预览 */}
			{formData.imageUrl && (
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						图片预览
					</label>
					<div className='border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700'>
						<img
							src={formData.imageUrl}
							alt='NFT预览'
							className='w-full max-w-xs mx-auto rounded-lg shadow-sm'
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliKDovb3lpLHotKU8L3RleHQ+PC9zdmc+';
							}}
						/>
					</div>
				</div>
			)}

			{/* 表单验证提示 */}
			{(() => {
				const validation = nftApiService.validateNFTData(formData);

				if (!validation.isValid && (formData.name || formData.description || formData.imageUrl)) {
					return (
						<div className='p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-md'>
							<p className='text-sm text-orange-800 dark:text-orange-300 font-medium mb-1'>
								⚠️ 请检查以下问题:
							</p>
							<ul className='text-sm text-orange-700 dark:text-orange-300 list-disc list-inside space-y-1'>
								{validation.errors.map((error, index) => (
									<li key={index}>{error}</li>
								))}
							</ul>
						</div>
					);
				}
				return null;
			})()}
		</div>
	);
}
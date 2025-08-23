'use client';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useDropzone } from 'react-dropzone';
import { useClassificationStore } from '@/stores/useClassificationStore';
import { useWasteImageUpload } from '@/hooks/useWasteImageUpload';
import { useToast } from '@/hooks/useToast';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Upload, Loader2, CheckCircle, X } from 'lucide-react';
import ResultDisplay from './ResultDisplay';

const WASTE_CATEGORIES = [
	{
		value: 'recyclable',
		label: '可回收垃圾',
		color: 'bg-green-500',
		emoji: '♻️',
	},
	{ value: 'hazardous', label: '有害垃圾', color: 'bg-red-500', emoji: '☠️' },
	{ value: 'kitchen', label: '厨余垃圾', color: 'bg-blue-500', emoji: '🍎' },
	{ value: 'other', label: '其他垃圾', color: 'bg-gray-500', emoji: '🗑️' },
];

export default function WasteClassificationForm() {
	const { address, isConnected } = useAccount();
	const toast = useToast();
	const {
		currentClassification,
		setImageUrl,
		setSelectedCategory,
		submitClassification,
		resetCurrent,
	} = useClassificationStore();

	// Supabase上传相关
	const {
		uploadImage,
		uploading,
		progress,
		error: uploadError,
	} = useWasteImageUpload();
	const [localPreview, setLocalPreview] = useState<string | null>(null);

	// 文件上传处理
	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (!file) return;

			try {
				// 立即显示本地预览
				const previewUrl = URL.createObjectURL(file);
				setLocalPreview(previewUrl);

				// 上传到Supabase
				const result = await uploadImage(file);

				// 上传成功后更新URL
				setImageUrl(result.url);

				// 清理本地预览
				URL.revokeObjectURL(previewUrl);
				setLocalPreview(null);

				toast.success('图片上传成功！可以开始选择垃圾分类了');
			} catch (error) {
				console.error('Upload failed:', error);
				toast.error(
					`上传失败：${error instanceof Error ? error.message : '请重试'}`
				);

				// 清理预览
				if (localPreview) {
					URL.revokeObjectURL(localPreview);
					setLocalPreview(null);
				}
			}
		},
		[uploadImage, setImageUrl, toast, localPreview]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
		},
		maxSize: 5 * 1024 * 1024, // 5MB
		multiple: false,
	});

	// 处理提交
	const handleSubmit = async () => {
		if (!isConnected || !address) {
			toast.error('请先连接钱包才能进行垃圾分类');
			return;
		}

		// 使用 promise toast 显示整个流程
		const classificationPromise = submitClassification(address);

		toast.promise(classificationPromise, {
			loading: '🤖 AI正在分析图片...',
			success: (result) => {
				if (result.isCorrect) {
					return `🎉 分类正确！获得 ${result.score} 积分`;
				} else {
					return `😅 分类错误，获得 ${result.score} 积分`;
				}
			},
			error: (error) => `❌ 分析失败：${error}`,
		});

		try {
			const result = await classificationPromise;

			// 检查NFT奖励
			if (result.availableNfts && result.availableNfts.length > 0) {
				toast.success('🎁 恭喜！您获得了新的环保NFT奖励', {
					duration: 6000,
				});
			}
		} catch (error) {
			console.error('Classification failed:', error);
		}
	};

	// 清除图片
	const clearImage = () => {
		setImageUrl(null);
		setLocalPreview(null);

		// 清理本地预览URL
		if (localPreview) {
			URL.revokeObjectURL(localPreview);
		}
	};

	// 重新开始
	const handleReset = () => {
		resetCurrent();
		clearImage();
	};

	// 获取显示的图片URL
	const displayImage = currentClassification.imageUrl || localPreview;

	if (!isConnected) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-6xl mb-4'>🔗</div>
					<h1 className='text-2xl font-bold text-gray-900 mb-4'>
						请先连接钱包
					</h1>
					<p className='text-gray-600'>需要连接钱包才能开始垃圾分类挑战</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='max-w-4xl mx-auto px-4'>
				<div className='text-center mb-8'>
					<h1 className='text-3xl font-bold text-gray-900 mb-2'>
						🌱 垃圾分类挑战
					</h1>
					<p className='text-gray-600'>
						上传垃圾图片，选择正确分类，获得环保NFT！
					</p>
				</div>

				{/* 显示结果 */}
				{currentClassification.result ? (
					<ResultDisplay
						result={currentClassification.result}
						onReset={handleReset}
					/>
				) : (
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
						{/* 左侧：图片上传 */}
						<div className='space-y-6'>
							<div className='bg-white rounded-lg shadow-lg p-6'>
								<h2 className='text-xl font-semibold mb-4'>📸 上传垃圾图片</h2>

								{displayImage ? (
									// 显示图片预览
									<div className='space-y-4'>
										<div className='relative w-full h-64 rounded-lg overflow-hidden border-2 border-green-200'>
											<Image
												src={displayImage}
												alt='垃圾图片预览'
												fill
												className='object-cover'
											/>
											{uploading && (
												<div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
													<div className='text-center text-white'>
														<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2'></div>
														<div>上传中... {progress}%</div>
													</div>
												</div>
											)}
											{currentClassification.imageUrl && !uploading && (
												<div className='absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full'>
													<CheckCircle className='h-4 w-4' />
												</div>
											)}
										</div>

										<div className='flex justify-between items-center'>
											<div className='text-sm text-gray-600'>
												{uploading
													? '正在上传到云端...'
													: currentClassification.imageUrl
													? '图片已就绪'
													: '本地预览'}
											</div>
											<button
												onClick={clearImage}
												className='flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm'
												disabled={uploading}
											>
												<X className='h-4 w-4' />
												<span>重新上传</span>
											</button>
										</div>
									</div>
								) : (
									// 上传区域
									<div
										{...getRootProps()}
										className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
											isDragActive
												? 'border-green-500 bg-green-50'
												: 'border-gray-300 hover:border-gray-400'
										}`}
									>
										<input {...getInputProps()} />
										<Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' />
										<div>
											<p className='text-lg font-medium mb-2'>
												{isDragActive ? '放下图片文件' : '拖拽图片到这里'}
											</p>
											<p className='text-sm text-gray-600'>
												或点击选择文件 (支持 JPG、PNG、WebP，最大5MB)
											</p>
										</div>
									</div>
								)}

								{uploadError && (
									<div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
										<p className='text-red-600 text-sm'>{uploadError}</p>
									</div>
								)}
							</div>
						</div>

						{/* 右侧：分类选择和提交 */}
						<div className='space-y-6'>
							<div className='bg-white rounded-lg shadow-lg p-6'>
								<h2 className='text-xl font-semibold mb-4'>🗂️ 选择垃圾分类</h2>

								<div className='grid grid-cols-2 gap-3'>
									{WASTE_CATEGORIES.map((category) => (
										<motion.button
											key={category.value}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											onClick={() => setSelectedCategory(category.value)}
											className={`p-4 rounded-lg text-white font-medium transition-all ${
												currentClassification.selectedCategory ===
												category.value
													? `${category.color} ring-2 ring-offset-2 ring-gray-500`
													: `${category.color} opacity-70 hover:opacity-100`
											}`}
										>
											<div className='text-2xl mb-1'>{category.emoji}</div>
											<div className='text-sm'>{category.label}</div>
										</motion.button>
									))}
								</div>
							</div>

							{/* 提交按钮 */}
							<div className='bg-white rounded-lg shadow-lg p-6'>
								<button
									onClick={handleSubmit}
									disabled={
										!currentClassification.imageUrl ||
										!currentClassification.selectedCategory ||
										currentClassification.isSubmitting ||
										uploading
									}
									className='w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2'
								>
									{currentClassification.isSubmitting ? (
										<>
											<Loader2 className='animate-spin h-5 w-5' />
											<span>AI分析中...</span>
										</>
									) : uploading ? (
										<>
											<Loader2 className='animate-spin h-5 w-5' />
											<span>上传中...</span>
										</>
									) : (
										<span>🚀 开始AI分析</span>
									)}
								</button>

								{/* 提示信息 */}
								{!currentClassification.imageUrl && (
									<p className='text-sm text-gray-500 mt-2 text-center'>
										请先上传图片
									</p>
								)}
								{currentClassification.imageUrl &&
									!currentClassification.selectedCategory && (
										<p className='text-sm text-gray-500 mt-2 text-center'>
											请选择垃圾分类
										</p>
									)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

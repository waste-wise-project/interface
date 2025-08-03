'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useWasteWiseContract } from '@/hooks/useWasteWiseContract';
import { usePinataUpload } from '@/hooks/usePinataUpload';

interface AdminMintNFTProps {
	className?: string;
}

export default function AdminMintNFTWithPinata({
	className = '',
}: AdminMintNFTProps) {
	const [recipientAddress, setRecipientAddress] = useState(
		'0x7878C4617329AD141e3834d23FCf1AA6476A6914'
	);

	// NFT 元数据表单
	const [nftName, setNftName] = useState('');
	const [nftDescription, setNftDescription] = useState('');
	const [location, setLocation] = useState('');
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const { isConnected } = useAccount();
	const {
		state: contractState,
		isOwner,
		contractInfo,
		mintNFT,
		validateAddress,
	} = useWasteWiseContract();

	const {
		uploading,
		uploadProgress,
		error: uploadError,
		uploadCompleteNFT,
	} = usePinataUpload();

	// 处理图片选择
	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedImage(file);

			// 创建预览
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	// 清除图片
	const clearImage = () => {
		setSelectedImage(null);
		setImagePreview(null);
	};

	// 处理铸造 - 包含 IPFS 上传
	const handleMintNFT = async () => {
		if (!selectedImage) {
			alert('请选择NFT图片');
			return;
		}

		try {
			// 1. 构建 NFT 元数据
			const metadata = {
				name: nftName,
				description: nftDescription,
				attributes: [
					{ trait_type: 'Location', value: location },
					{
						trait_type: 'Created At',
						value: new Date().toISOString().split('T')[0],
					},
				].filter((attr) => attr.value), // 过滤空值
			};

			// 2. 上传到 IPFS
			const uploadResult = await uploadCompleteNFT(selectedImage, metadata);

			// 3. 铸造 NFT
			await mintNFT({
				to: recipientAddress,
				tokenURI: uploadResult.ipfsUrl,
			});

			// 4. 成功后清空表单
			if (contractState.messageType === 'success') {
				setNftName('');
				setNftDescription('');
				setLocation('');
				clearImage();
			}
		} catch (error) {
			console.error('铸造NFT失败:', error);
		}
	};

	// 如果未连接钱包
	if (!isConnected) {
		return (
			<div
				className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}
			>
				<div className='text-center'>
					<h3 className='text-lg font-semibold text-yellow-800 mb-2'>
						⚠️ 请先连接钱包
					</h3>
					<p className='text-yellow-700'>需要连接钱包才能使用管理员功能</p>
				</div>
			</div>
		);
	}

	// 如果不是合约拥有者
	if (!isOwner && contractInfo.owner) {
		return (
			<div
				className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
			>
				<div className='text-center'>
					<h3 className='text-lg font-semibold text-red-800 mb-2'>
						🚫 访问权限不足
					</h3>
					<p className='text-red-700 mb-2'>只有合约拥有者才能铸造NFT</p>
					<div className='text-sm text-red-600'>
						<p>合约拥有者: {contractInfo.owner}</p>
					</div>
				</div>
			</div>
		);
	}

	const isLoading = contractState.isLoading || uploading;

	return (
		<div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>
			{/* 标题和合约信息 */}
			<div className='mb-6'>
				<h2 className='text-2xl font-bold text-gray-900 mb-2'>
					🏭 管理员 NFT 铸造 (IPFS)
				</h2>
				<div className='text-sm text-gray-600'>
					<p>合约地址: {contractInfo.address}</p>
					<p>当前总供应量: {contractInfo.totalSupply?.toString() || '0'}</p>
				</div>
			</div>

			{/* 上传进度 */}
			{uploading && (
				<div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
					<div className='flex items-center justify-between text-sm text-blue-800 mb-2'>
						<span>上传到 IPFS</span>
						<span>{uploadProgress}%</span>
					</div>
					<div className='w-full bg-blue-200 rounded-full h-2'>
						<div
							className='bg-blue-600 h-2 rounded-full transition-all duration-300'
							style={{ width: `${uploadProgress}%` }}
						/>
					</div>
				</div>
			)}

			{/* 铸造表单 */}
			<div className='space-y-4'>
				{/* 接收者地址 */}
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>
						接收者地址 *
					</label>
					<input
						type='text'
						value={recipientAddress}
						onChange={(e) => setRecipientAddress(e.target.value)}
						disabled={true}
						className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100'
					/>
				</div>

				{/* NFT 基本信息 */}
				<div className='grid grid-cols-1'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							NFT 名称 *
						</label>
						<input
							type='text'
							placeholder='WasteWise 环保奖励 #1'
							value={nftName}
							onChange={(e) => setNftName(e.target.value)}
							disabled={isLoading}
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100'
						/>
					</div>
				</div>

				{/* NFT 描述 */}
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>
						NFT 描述 *
					</label>
					<textarea
						placeholder='描述这个NFT的获得原因和意义...'
						value={nftDescription}
						onChange={(e) => setNftDescription(e.target.value)}
						disabled={isLoading}
						rows={3}
						className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100'
					/>
				</div>

				{/* NFT 图片上传 */}
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>
						NFT 图片 *
					</label>

					{!imagePreview ? (
						<div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors'>
							<input
								type='file'
								accept='image/*'
								onChange={handleImageSelect}
								disabled={isLoading}
								className='hidden'
								id='image-upload'
							/>
							<label
								htmlFor='image-upload'
								className='cursor-pointer flex flex-col items-center'
							>
								<div className='text-4xl text-gray-400 mb-2'>📷</div>
								<div className='text-sm text-gray-600'>
									点击选择图片或拖拽到此处
								</div>
								<div className='text-xs text-gray-500 mt-1'>
									支持 JPG, PNG, GIF 格式
								</div>
							</label>
						</div>
					) : (
						<div className='relative border rounded-lg p-4'>
							<img
								src={imagePreview}
								alt='NFT预览'
								className='w-full max-w-xs mx-auto rounded-lg'
							/>
							<button
								onClick={clearImage}
								disabled={isLoading}
								className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50'
							>
								×
							</button>
						</div>
					)}
				</div>

				{/* 铸造按钮 */}
				<button
					onClick={handleMintNFT}
					disabled={
						!isOwner ||
						isLoading ||
						!recipientAddress ||
						!nftName ||
						!nftDescription ||
						!selectedImage ||
						!validateAddress(recipientAddress)
					}
					className='w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
				>
					{isLoading ? '处理中...' : '🎨 上传到 IPFS 并铸造 NFT'}
				</button>
			</div>

			{/* 状态消息 */}
			{(contractState.message || uploadError) && (
				<div
					className={`mt-4 p-3 rounded-md ${
						uploadError
							? 'bg-red-50 text-red-800 border border-red-200'
							: contractState.messageType === 'success'
							? 'bg-green-50 text-green-800 border border-green-200'
							: contractState.messageType === 'error'
							? 'bg-red-50 text-red-800 border border-red-200'
							: 'bg-blue-50 text-blue-800 border border-blue-200'
					}`}
				>
					<p className='text-sm break-words word-wrap overflow-wrap-anywhere'>
						{uploadError || contractState.message}
					</p>
				</div>
			)}
		</div>
	);
}

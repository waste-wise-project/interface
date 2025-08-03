'use client';

import { useState } from 'react';

interface PinataUploadResult {
	ipfsHash: string;
	ipfsUrl: string;
	timestamp: string;
}

interface NFTMetadata {
	name: string;
	description: string;
	image: string;
	attributes?: Array<{
		trait_type: string;
		value: string | number;
	}>;
	external_url?: string;
}

export function usePinataUpload() {
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);

	// 上传图片到 Pinata
	const uploadImageToPinata = async (
		file: File
	): Promise<PinataUploadResult> => {
		setUploading(true);
		setError(null);
		setUploadProgress(0);

		try {
			const formData = new FormData();
			formData.append('file', file);

			// Pinata 元数据
			const pinataMetadata = JSON.stringify({
				name: `WasteWise-Image-${Date.now()}`,
				keyvalues: {
					type: 'image',
					uploadedAt: new Date().toISOString(),
				},
			});
			formData.append('pinataMetadata', pinataMetadata);

			const pinataOptions = JSON.stringify({
				cidVersion: 0,
			});
			formData.append('pinataOptions', pinataOptions);

			const response = await fetch('/api/pinata/upload-image', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`上传失败: ${response.statusText}`);
			}

			const result = await response.json();
			setUploadProgress(100);

			return {
				ipfsHash: result.IpfsHash,
				ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : '上传失败';
			setError(errorMessage);
			throw error;
		} finally {
			setUploading(false);
		}
	};

	// 上传 JSON 元数据到 Pinata
	const uploadMetadataToPinata = async (
		metadata: NFTMetadata
	): Promise<PinataUploadResult> => {
		setUploading(true);
		setError(null);

		try {
			const response = await fetch('/api/pinata/upload-json', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					metadata,
					pinataMetadata: {
						name: `WasteWise-Metadata-${Date.now()}`,
						keyvalues: {
							type: 'metadata',
							uploadedAt: new Date().toISOString(),
						},
					},
				}),
			});

			if (!response.ok) {
				throw new Error(`元数据上传失败: ${response.statusText}`);
			}

			const result = await response.json();

			return {
				ipfsHash: result.IpfsHash,
				ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : '元数据上传失败';
			setError(errorMessage);
			throw error;
		} finally {
			setUploading(false);
		}
	};

	// 完整的 NFT 上传流程
	const uploadCompleteNFT = async (
		imageFile: File,
		metadata: Omit<NFTMetadata, 'image'>
	): Promise<PinataUploadResult> => {
		try {
			setUploadProgress(25);

			// 1. 先上传图片
			const imageResult = await uploadImageToPinata(imageFile);
			setUploadProgress(50);

			// 2. 创建完整的元数据（包含图片 IPFS 链接）
			const completeMetadata: NFTMetadata = {
				...metadata,
				image: imageResult.ipfsUrl,
			};

			setUploadProgress(75);

			// 3. 上传元数据
			const metadataResult = await uploadMetadataToPinata(completeMetadata);
			setUploadProgress(100);

			return metadataResult;
		} catch (error) {
			setUploadProgress(0);
			throw error;
		}
	};

	return {
		uploading,
		uploadProgress,
		error,
		uploadImageToPinata,
		uploadMetadataToPinata,
		uploadCompleteNFT,
	};
}

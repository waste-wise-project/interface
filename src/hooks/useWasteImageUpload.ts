'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UploadResult {
	url: string;
	path: string;
}

export function useWasteImageUpload() {
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const uploadImage = async (file: File): Promise<UploadResult> => {
		setUploading(true);
		setError(null);
		setProgress(0);

		try {
			// 文件名和路径
			const fileExt = file.name.split('.').pop();
			const fileName = `waste-${Date.now()}-${Math.random()
				.toString(36)
				.substring(2)}.${fileExt}`;
			const filePath = `classifications/${fileName}`;

			// 模拟上传进度
			const progressInterval = setInterval(() => {
				setProgress((prev) => Math.min(prev + 15, 90));
			}, 200);

			// 上传文件
			const { error: uploadError } = await supabase.storage
				.from('waste-images')
				.upload(filePath, file, {
					cacheControl: '3600',
					upsert: false,
				});

			clearInterval(progressInterval);

			if (uploadError) {
				throw new Error(uploadError.message);
			}

			// {获取公共URL}
			const {
				data: { publicUrl = '' },
			} = supabase.storage.from('waste-images').getPublicUrl(filePath);
			setProgress(100);

			return {
				url: publicUrl,
				path: filePath,
			};
		} catch (error) {
			console.log(error, 'error');
			const errorMessage = error instanceof Error ? error.message : '上传失败';
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setUploading(false);
			// 重置进度条
			setTimeout(() => setProgress(0), 1000);
		}
	};

	// 删除图片（可选）
	const deleteImage = async (path: string): Promise<void> => {
		const { error } = await supabase.storage
			.from('waste-images')
			.remove([path]);

		if (error) {
			throw new Error(error.message);
		}
	};

	return {
		uploadImage,
		deleteImage,
		uploading,
		progress,
		error,
	};
}

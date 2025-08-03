import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		// 检查环境变量
		if (!process.env.PINATA_JWT) {
			return NextResponse.json(
				{ error: 'PINATA_JWT 环境变量未设置' },
				{ status: 500 }
			);
		}

		// 获取 FormData - Next.js 13+ 的正确方式
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return NextResponse.json({ error: '未提供文件' }, { status: 400 });
		}

		console.log(
			'📁 上传文件:',
			file.name,
			'大小:',
			file.size,
			'bytes',
			'类型:',
			file.type
		);

		// 创建新的 FormData 发送给 Pinata
		const pinataFormData = new FormData();
		pinataFormData.append('file', file);

		// 添加 Pinata 元数据
		const pinataMetadata = JSON.stringify({
			name: `WasteWise-${Date.now()}-${file.name}`,
			keyvalues: {
				uploadedAt: new Date().toISOString(),
				originalName: file.name,
				type: 'image',
			},
		});
		pinataFormData.append('pinataMetadata', pinataMetadata);

		// 添加 Pinata 选项
		const pinataOptions = JSON.stringify({
			cidVersion: 1,
		});
		pinataFormData.append('pinataOptions', pinataOptions);

		console.log(
			'🔑 使用 JWT (前10字符):',
			process.env.PINATA_JWT.substring(0, 10)
		);

		// 发送到 Pinata API
		const response = await fetch(
			'https://api.pinata.cloud/pinning/pinFileToIPFS',
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${process.env.PINATA_JWT}`,
					// 注意：不要手动设置 Content-Type，让浏览器自动设置 multipart/form-data
				},
				body: pinataFormData,
			}
		);

		console.log('📡 Pinata 响应状态:', response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Pinata 错误响应:', errorText);

			return NextResponse.json(
				{
					error: `Pinata API 错误: ${response.status} ${response.statusText}`,
					details: errorText,
					status: response.status,
				},
				{ status: response.status }
			);
		}

		const result = await response.json();
		console.log('✅ 上传成功:', result.IpfsHash);

		return NextResponse.json({
			success: true,
			IpfsHash: result.IpfsHash,
			PinSize: result.PinSize,
			Timestamp: result.Timestamp,
			ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
		});
	} catch (error) {
		console.error('💥 API 路由错误:', error);
		return NextResponse.json(
			{
				error: '服务器内部错误',
				details: error instanceof Error ? error.message : '未知错误',
			},
			{ status: 500 }
		);
	}
}

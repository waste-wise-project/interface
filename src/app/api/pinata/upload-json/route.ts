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

		// 获取 JSON 数据
		const { metadata, pinataMetadata } = await request.json();

		if (!metadata) {
			return NextResponse.json({ error: '未提供元数据' }, { status: 400 });
		}

		console.log('📝 上传 JSON 元数据:', JSON.stringify(metadata, null, 2));

		const response = await fetch(
			'https://api.pinata.cloud/pinning/pinJSONToIPFS',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env.PINATA_JWT}`,
				},
				body: JSON.stringify({
					pinataContent: metadata,
					pinataMetadata: pinataMetadata || {
						name: `WasteWise-Metadata-${Date.now()}`,
						keyvalues: {
							type: 'metadata',
							uploadedAt: new Date().toISOString(),
						},
					},
					pinataOptions: {
						cidVersion: 1,
					},
				}),
			}
		);

		console.log('📡 Pinata JSON 响应状态:', response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('❌ Pinata JSON 错误响应:', errorText);

			return NextResponse.json(
				{
					error: `Pinata API 错误: ${response.status} ${response.statusText}`,
					details: errorText,
				},
				{ status: response.status }
			);
		}

		const result = await response.json();
		console.log('✅ JSON 上传成功:', result.IpfsHash);

		return NextResponse.json({
			success: true,
			IpfsHash: result.IpfsHash,
			PinSize: result.PinSize,
			Timestamp: result.Timestamp,
			ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
		});
	} catch (error) {
		console.error('💥 JSON API 路由错误:', error);
		return NextResponse.json(
			{
				error: '服务器内部错误',
				details: error instanceof Error ? error.message : '未知错误',
			},
			{ status: 500 }
		);
	}
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		domains: [
			'gateway.pinata.cloud',
			'ipfs.io',
			'cloudflare-ipfs.com',
			'dweb.link',
			'nftstorage.link',
			'ipfs.infura.io',
			// 添加其他可能用到的 IPFS 网关
		],
	},
};

export default nextConfig;

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
			'jfnfivcnkvsvxjwmevru.supabase.co',
			'ivory-personal-goat-759.mypinata.cloud',
			// 需删除
			'cdn.example.com',
		],
	},
};

export default nextConfig;

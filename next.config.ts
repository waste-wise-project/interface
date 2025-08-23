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
			'picsum.photos',
		],
	},
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				'indexeddb-js': false,
			};
		}
		return config;
	},
};

export default nextConfig;

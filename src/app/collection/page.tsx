'use client';

import { NFTCollection } from '@/components/features/mintNFT';

export default function CollectionPage() {
	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='max-w-6xl mx-auto px-4'>
				<NFTCollection />
			</div>
		</div>
	);
}

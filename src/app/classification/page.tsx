import WasteClassificationForm from '@/components/features/classification/WasteClassificationForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: '垃圾分类 | WasteToNFT',
	description: '上传垃圾图片，通过AI识别进行分类，获得环保NFT奖励！',
};

export default function ClassificationPage() {
	return (
		<div className='min-w-[500px] mx-auto bg'>
			<WasteClassificationForm />
		</div>
	);
}

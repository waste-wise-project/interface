import { WasteCategoryToCNMap } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function ResultDisplay({
	result,
	onReset,
}: {
	result: any;
	onReset: () => void;
}) {
	const expectedCategoryOfCN =
		WasteCategoryToCNMap[
			result.expectedCategory as keyof typeof WasteCategoryToCNMap
		] || result.expectedCategory;

	console.log(expectedCategoryOfCN, 'expectedCategoryOfCN');
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='bg-white rounded-lg shadow-lg p-8'
		>
			<div className='text-center mb-6'>
				<div className='text-6xl mb-4'>{result.isCorrect ? '🎉' : '😔'}</div>
				<h2 className='text-2xl font-bold mb-2'>
					{result.isCorrect ? '分类正确！' : '分类错误'}
				</h2>
				<p className='text-lg text-green-600 font-semibold'>
					获得 {result.score} 积分
				</p>
			</div>

			{/* 详细结果 */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
				<div>
					<h3 className='font-semibold mb-2'>AI识别结果</h3>
					<p className='text-lg'>{result.aiDetectedCategory}</p>
					<p className='text-sm text-gray-600'>
						置信度：{(result.confidence * 100).toFixed(1)}%
					</p>
				</div>

				<div>
					<h3 className='font-semibold mb-2'>你的选择</h3>
					<p className='text-lg'>{expectedCategoryOfCN}</p>
				</div>
			</div>

			{/* AI分析 */}
			<div className='mb-6'>
				<h3 className='font-semibold mb-2'>AI分析</h3>
				<p className='text-gray-700'>{result.aiDescription}</p>
			</div>

			{/* 处理建议 */}
			<div className='mb-6'>
				<h3 className='font-semibold mb-2'>处理建议</h3>
				<p className='text-gray-700'>{result.disposalInstructions}</p>
			</div>

			{/* NFT奖励提示 */}
			{result.availableNfts && result.availableNfts.length > 0 && (
				<div className='mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg'>
					<div className='flex items-center space-x-2 mb-2'>
						<span className='text-2xl'>🎁</span>
						<h3 className='font-semibold text-purple-800'>恭喜获得NFT奖励！</h3>
					</div>
					<p className='text-sm text-purple-600'>
						您获得了 {result.availableNfts.length}{' '}
						个环保NFT奖励，可在收藏页面查看和领取。
					</p>
				</div>
			)}

			{/* 重新开始按钮 */}
			<div className='text-center'>
				<button
					onClick={onReset}
					className='bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'
				>
					继续挑战
				</button>
			</div>
		</motion.div>
	);
}

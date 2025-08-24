import { Achievement } from '@/stores';
import { motion } from 'framer-motion';
import AchievementCard from './AchievementCard';
import EmptyAchievementState from './EmptyAchievementState';

const AchievementList = ({
	filteredAchievements,
}: {
	filteredAchievements: Achievement[];
}) => {
	// 统计数据
	const stats = {
		total: filteredAchievements.length,
		completed: filteredAchievements.filter((a) => a.isCompleted || a.isClaimed)
			.length,
		claimable: filteredAchievements.filter((a) => a.canClaim && !a.isClaimed)
			.length,
		claimed: filteredAchievements.filter((a) => a.isClaimed).length,
	};

	const completionRate =
		stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

	if (filteredAchievements.length === 0) {
		return (
			<div className='col-span-full'>
				<EmptyAchievementState />
			</div>
		);
	}

	return (
		<div className='space-y-8'>
			{/* 统计卡片 */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className='bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden'
			>
				{/* 背景装饰 */}
				<div className='absolute inset-0 bg-white/10 backdrop-blur-sm' />
				<div className='absolute top-0 right-0 size-32 bg-white/5 rounded-full -translate-y-16 translate-x-16' />
				<div className='absolute bottom-0 left-0 size-24 bg-white/5 rounded-full translate-y-12 -translate-x-12' />

				<div className='relative z-10'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
						<motion.div
							className='text-center'
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.1 }}
						>
							<div className='text-3xl font-bold mb-1'>{stats.total}</div>
							<div className='text-blue-100 text-sm'>总成就</div>
						</motion.div>
						<motion.div
							className='text-center'
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.2 }}
						>
							<div className='text-3xl font-bold mb-1'>{stats.completed}</div>
							<div className='text-blue-100 text-sm'>已完成</div>
						</motion.div>
						<motion.div
							className='text-center'
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.3 }}
						>
							<div className='text-3xl font-bold mb-1'>{stats.claimable}</div>
							<div className='text-blue-100 text-sm'>可领取</div>
						</motion.div>
						<motion.div
							className='text-center'
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.4 }}
						>
							<div className='text-3xl font-bold mb-1'>{completionRate}%</div>
							<div className='text-blue-100 text-sm'>完成率</div>
						</motion.div>
					</div>

					{/* 整体进度条 */}
					<motion.div
						className='space-y-2'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<div className='flex justify-between text-sm'>
							<span className='text-blue-100'>整体进度</span>
							<span className='font-semibold'>{completionRate}%</span>
						</div>
						<div className='w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm'>
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${completionRate}%` }}
								transition={{
									delay: 0.7,
									duration: 1.5,
									ease: 'easeOut',
								}}
								className='bg-gradient-to-r from-white to-blue-200 h-full rounded-full relative overflow-hidden'
							>
								{/* 进度条光效 */}
								<div
									className='absolute inset-0 opacity-60'
									style={{
										background:
											'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
										animation: 'shimmer 2s infinite',
									}}
								/>
							</motion.div>
						</div>
					</motion.div>
				</div>
			</motion.div>

			{/* 成就网格 */}
			<motion.div
				className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'
				variants={{
					hidden: { opacity: 0 },
					show: {
						opacity: 1,
						transition: {
							staggerChildren: 0.1,
						},
					},
				}}
				initial='hidden'
				animate='show'
			>
				{filteredAchievements.map((achievement, index) => (
					<motion.div
						key={achievement.id}
						variants={{
							hidden: { opacity: 0, y: 20 },
							show: { opacity: 1, y: 0 },
						}}
					>
						<AchievementCard achievement={achievement} index={index} />
					</motion.div>
				))}
			</motion.div>

			{/* 可领取成就提醒 - 固定在右下角 */}
			{stats.claimable > 0 && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8, x: 100 }}
					animate={{ opacity: 1, scale: 1, x: 0 }}
					className='fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-blue-600 text-white p-4 rounded-2xl shadow-2xl z-50 max-w-sm'
				>
					<div className='flex items-center gap-3'>
						<motion.div
							className='size-12 bg-white/20 rounded-full flex items-center justify-center'
							animate={{ rotate: [0, 10, -10, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<span className='text-2xl'>🎁</span>
						</motion.div>
						<div className='flex-1'>
							<div className='font-bold text-lg'>
								有 {stats.claimable} 个成就已领取！
							</div>
							<div className='text-sm text-white/90'>
								赶快去看看是否可以领取NFT吧
							</div>
						</div>
					</div>

					{/* 关闭按钮 */}
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						className='absolute -top-2 -right-2 size-6 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors'
						onClick={(e) => {
							e.currentTarget.closest('.fixed')?.remove();
						}}
					>
						×
					</motion.button>
				</motion.div>
			)}
		</div>
	);
};

export default AchievementList;

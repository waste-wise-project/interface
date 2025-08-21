import { motion } from 'framer-motion';

const EmptyAchievementState = () => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='flex flex-col items-center justify-center py-16 px-8 relative'
		>
			{/* 动画图标 */}
			<motion.div
				animate={{
					y: [0, -10, 0],
					rotate: [0, 5, -5, 0],
				}}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
				className='mb-8 relative z-10'
			>
				<div className='w-32 h-32 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl relative overflow-hidden'>
					{/* 内部光效 */}
					<div className='absolute inset-2 bg-white/20 rounded-full' />
					<div className='absolute inset-4 bg-white/10 rounded-full' />
					<span className='text-6xl relative z-10'>🏆</span>
				</div>

				{/* 外部光晕 */}
				<div className='absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse' />
			</motion.div>

			{/* 标题和描述 */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.3 }}
				className='text-center mb-8 relative z-10'
			>
				<h3 className='text-2xl font-bold text-slate-800 mb-4'>
					暂无匹配的成就
				</h3>
				<p className='text-slate-600 max-w-md leading-relaxed'>
					当前筛选条件下没有找到相关成就。尝试调整筛选条件或开始完成更多垃圾分类任务来解锁新成就！
				</p>
			</motion.div>

			{/* 建议操作 */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.6 }}
				className='flex flex-col sm:flex-row gap-4 relative z-10'
			>
				<motion.button
					whileHover={{
						scale: 1.05,
					}}
					whileTap={{ scale: 0.95 }}
					className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group'
				>
					<span className='relative z-10'>开始分类挑战</span>
					{/* 按钮光效 */}
					<div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
				</motion.button>

				<motion.button
					whileHover={{
						scale: 1.05,
					}}
					whileTap={{ scale: 0.95 }}
					className='bg-white text-slate-700 px-8 py-3 rounded-xl font-semibold shadow-lg border-2 border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-xl'
				>
					查看全部成就
				</motion.button>
			</motion.div>

			{/* 装饰粒子动画 */}
			<div className='absolute inset-0 pointer-events-none overflow-hidden'>
				{[...Array(8)].map((_, i) => (
					<motion.div
						key={i}
						animate={{
							y: [100, -100],
							opacity: [0, 1, 0],
							scale: [0.5, 1, 0.5],
							rotate: [0, 180, 360],
						}}
						transition={{
							duration: 4 + i * 0.5,
							repeat: Infinity,
							delay: i * 0.7,
							ease: 'easeInOut',
						}}
						className={`absolute text-2xl ${
							i % 4 === 0
								? 'left-1/4'
								: i % 4 === 1
								? 'left-1/2'
								: i % 4 === 2
								? 'left-3/4'
								: 'left-1/6'
						} top-full`}
						style={{
							transform: `translateX(${((i % 4) - 1.5) * 50}px)`,
						}}
					>
						{['✨', '🌟', '⭐', '💫', '🎯', '🎊', '🌈', '💎'][i]}
					</motion.div>
				))}
			</div>

			{/* 背景装饰圆圈 */}
			<div className='absolute inset-0 pointer-events-none'>
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
					className='absolute top-1/4 left-1/4 w-16 h-16 border-2 border-blue-200/30 rounded-full'
				/>
				<motion.div
					animate={{ rotate: -360 }}
					transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
					className='absolute bottom-1/4 right-1/4 w-12 h-12 border-2 border-indigo-200/30 rounded-full'
				/>
				<motion.div
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.6, 0.3],
					}}
					transition={{ duration: 3, repeat: Infinity }}
					className='absolute top-1/2 right-1/3 w-8 h-8 bg-purple-200/30 rounded-full'
				/>
			</div>
		</motion.div>
	);
};

export default EmptyAchievementState;

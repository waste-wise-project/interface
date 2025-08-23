import { Achievement } from '@/stores';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AchievementCard({
	achievement,
	index,
}: {
	achievement: Achievement;
	index: number;
}) {
	// 根据等级获取背景渐变 - 优化颜色方案
	const getTierGradient = (tier: string) => {
		switch (tier) {
			case 'bronze':
				return 'from-orange-400 to-amber-500';
			case 'silver':
				return 'from-slate-400 to-slate-600';
			case 'gold':
				return 'from-amber-400 to-yellow-500';
			case 'platinum':
				return 'from-blue-400 to-indigo-500';
			case 'diamond':
				return 'from-purple-400 to-pink-500';
			default:
				return 'from-gray-400 to-gray-600';
		}
	};

	// 根据状态获取样式 - 参考图片设计
	const getStatusStyle = () => {
		if (achievement.isCompleted) {
			return {
				bg: 'bg-gray-500',
				text: 'text-white',
				label: '已完成',
				icon: '',
			};
		}
		return {
			bg: 'bg-gray-500',
			text: 'text-white',
			label: '进行中',
			icon: '',
		};
	};

	const status = getStatusStyle();
	const tierGradient = getTierGradient(achievement.tier);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				delay: index * 0.1,
				type: 'spring',
				stiffness: 100,
				damping: 12,
			}}
			whileHover={{
				y: -6,
				scale: 1.02,
				transition: { duration: 0.2 },
			}}
			className='relative group cursor-pointer w-full'
		>
			{/* 主卡片 - 优化视觉层次 */}
			<div className='bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/30 relative backdrop-blur-sm'>
				{/* 顶部进度条背景 */}
				<div className='absolute top-0 left-0 right-0 h-1.5 bg-gray-200/50 rounded-t-3xl'>
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: `${achievement.progress}%` }}
						transition={{
							delay: index * 0.1 + 0.5,
							duration: 1,
							ease: 'easeOut',
						}}
						className={`h-full bg-gradient-to-r ${tierGradient} rounded-tl-3xl shadow-sm`}
					/>
				</div>

				<div className='pt-8 pb-5 px-6'>
					{/* 图标和状态区域 */}
					<div className='flex items-start justify-between mb-4'>
						{/* 图标容器 - 重新设计突出图片美感 */}
						<div className='relative'>
							{/* 图标容器 - 更大更美观 */}
							<div className='w-24 h-24 rounded-2xl bg-gradient-to-br from-white to-gray-50 p-0.5 shadow-lg relative z-10 border border-gray-200/60'>
								<div className='w-full h-full bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-inner'>
									<Image
										src={achievement.iconUrl}
										alt={achievement.name}
										width={80}
										height={80}
										className='object-cover w-full h-full rounded-xl'
										onError={() => '/window.svg'}
										priority={index < 6}
									/>
								</div>
							</div>

							{/* 等级徽章 - 调整位置 */}
							<div
								className={`absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r ${tierGradient} flex items-center justify-center text-white text-xs font-bold shadow-lg z-20 border-2 border-white`}
							>
								{achievement.tier === 'bronze' && '🥉'}
								{achievement.tier === 'silver' && '🥈'}
								{achievement.tier === 'gold' && '🥇'}
								{achievement.tier === 'platinum' && '💎'}
								{achievement.tier === 'diamond' && '💠'}
							</div>
						</div>

						{/* 状态标签 */}
						<div
							className={`${status.bg} ${status.text} px-3 py-1.5 rounded-full text-xs font-medium shadow-sm`}
						>
							{status.label}
						</div>
					</div>

					{/* 成就信息 - 更精致的布局 */}
					<div className='mb-5'>
						<h3 className='font-bold text-xl mb-2 text-gray-900 group-hover:text-gray-800 transition-colors'>
							{achievement.name}
						</h3>
						<p className='text-gray-600 text-sm leading-relaxed mb-4'>
							{achievement.description}
						</p>

						{/* 进度文字 */}
						<div className='flex justify-between items-center mb-3'>
							<span className='text-sm font-medium text-gray-700'>进度</span>
							<span className='text-lg font-bold text-gray-900'>
								{achievement.progress}%
							</span>
						</div>

						{/* 进度条 - 更加精致 */}
						<div className='relative w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner'>
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${achievement.progress}%` }}
								transition={{
									delay: index * 0.1 + 0.5,
									duration: 1.2,
									ease: 'easeOut',
								}}
								className='h-full bg-gray-300 rounded-full relative overflow-hidden'
							>
								{/* 进度条光效 */}
								<div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse' />
							</motion.div>
						</div>
					</div>

					{/* 底部积分区域 - 更精致的设计 */}
					<div className='flex items-center justify-between pt-3 border-t border-gray-100/80'>
						<div className='flex items-center gap-2'>
							<div className='w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center shadow-sm'>
								<span className='text-amber-600 text-sm'>💰</span>
							</div>
							<span className='text-sm font-bold text-gray-800'>
								+{achievement.scoreReward} 积分
							</span>
						</div>

						{/* 可领取按钮 */}
						{achievement.canClaim && !achievement.isClaimed && (
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={`bg-gradient-to-r ${tierGradient} text-white px-4 py-2 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300`}
							>
								领取奖励
							</motion.button>
						)}
					</div>
				</div>

				{/* 悬浮时的微妙光效 */}
				<div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
					<div className='absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-30 rounded-3xl' />
				</div>

				{/* 围绕积分区域运动的装饰小球 */}
				<div className='absolute bottom-3 left-6 w-40 h-12 pointer-events-none'>
					{/* 外圈装饰球 */}
					{[...Array(2)].map((_, i) => (
						<motion.div
							key={`score-outer-${i}`}
							className={`absolute w-1.5 h-1.5 rounded-full shadow-sm ${
								achievement.canClaim
									? 'bg-blue-400'
									: achievement.isCompleted
									? 'bg-amber-400'
									: 'bg-gray-400'
							}`}
							style={{
								top: '50%',
								left: '20%',
								transformOrigin: '0 0',
							}}
							animate={{
								rotate: 360,
								x: Math.cos(((i * 180 + index * 60) * Math.PI) / 180) * 45 - 3,
								y: Math.sin(((i * 180 + index * 60) * Math.PI) / 180) * 20 - 3,
							}}
							transition={{
								rotate: {
									duration: 8 + i * 0.1,
									repeat: Infinity,
									ease: 'linear',
								},
								x: { duration: 0 },
								y: { duration: 0 },
							}}
						/>
					))}

					{/* 内圈装饰球 */}
					{[...Array(3)].map((_, i) => (
						<motion.div
							key={`score-inner-${i}`}
							className={`absolute w-1 h-1 rounded-full ${
								achievement.canClaim
									? 'bg-blue-300'
									: achievement.isCompleted
									? 'bg-amber-300'
									: 'bg-gray-300'
							}`}
							style={{
								top: '50%',
								left: '20%',
								transformOrigin: '0 0',
							}}
							animate={{
								rotate: -360,
								x: Math.cos(((i * 120 + index * 45) * Math.PI) / 180) * 32 - 2,
								y: Math.sin(((i * 120 + index * 45) * Math.PI) / 180) * 15 - 2,
							}}
							transition={{
								rotate: {
									duration: 12 + i * 0.1,
									repeat: Infinity,
									ease: 'linear',
								},
								x: { duration: 0 },
								y: { duration: 0 },
							}}
						/>
					))}
				</div>
			</div>
		</motion.div>
	);
}

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
	// 根据等级获取背景渐变 - Tailwind v4 兼容
	const getTierGradient = (tier: string) => {
		switch (tier) {
			case 'bronze':
				return 'from-amber-300 via-orange-400 to-amber-600';
			case 'silver':
				return 'from-slate-300 via-gray-400 to-slate-500';
			case 'gold':
				return 'from-yellow-300 via-amber-400 to-yellow-600';
			case 'platinum':
				return 'from-slate-200 via-blue-300 to-slate-400';
			case 'diamond':
				return 'from-cyan-200 via-blue-300 to-indigo-400';
			default:
				return 'from-slate-300 via-gray-400 to-slate-500';
		}
	};

	// 根据状态获取样式
	const getStatusStyle = () => {
		if (achievement.isClaimed) {
			return {
				bg: 'bg-emerald-500',
				text: 'text-white',
				label: '已领取',
				icon: '✓',
			};
		}
		if (achievement.canClaim) {
			return {
				bg: 'bg-blue-500',
				text: 'text-white',
				label: '可领取',
				icon: '🎁',
			};
		}
		if (achievement.isCompleted) {
			return {
				bg: 'bg-amber-500',
				text: 'text-white',
				label: '已完成',
				icon: '★',
			};
		}
		return {
			bg: 'bg-slate-400',
			text: 'text-white',
			label: '进行中',
			icon: '⏳',
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
				y: -8,
				transition: { duration: 0.3 },
			}}
			className='relative group cursor-pointer'
		>
			{/* 主卡片 */}
			<div className='bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200/60'>
				{/* 顶部装饰条 */}
				<div className={`h-2 bg-gradient-to-r ${tierGradient}`} />

				<div className='p-6'>
					{/* 图标和状态区域 */}
					<div className='flex items-start justify-between mb-6'>
						{/* 图标容器 */}
						<div className='relative'>
							{/* 旋转装饰球 - 外圈 */}
							<div className='absolute inset-0 w-20 h-20'>
								{[...Array(3)].map((_, i) => (
									<motion.div
										key={`outer-${i}`}
										className={`absolute w-2 h-2 rounded-full shadow-sm ${
											achievement.canClaim
												? 'bg-blue-400'
												: achievement.isCompleted
												? 'bg-amber-400'
												: 'bg-slate-400'
										}`}
										style={{
											top: '50%',
											left: '50%',
											transformOrigin: '0 0',
										}}
										animate={{
											rotate: 360,
											x:
												Math.cos(((i * 120 + index * 30) * Math.PI) / 180) *
													40 -
												4,
											y:
												Math.sin(((i * 120 + index * 30) * Math.PI) / 180) *
													40 -
												4,
										}}
										transition={{
											rotate: {
												duration: 4 + i * 0.3,
												repeat: Infinity,
												ease: 'linear',
											},
											x: { duration: 0 },
											y: { duration: 0 },
										}}
									/>
								))}
							</div>

							{/* 旋转装饰球 - 内圈 */}
							<div className='absolute inset-0 w-20 h-20'>
								{[...Array(2)].map((_, i) => (
									<motion.div
										key={`inner-${i}`}
										className={`absolute w-1.5 h-1.5 rounded-full ${
											achievement.canClaim
												? 'bg-blue-300'
												: achievement.isCompleted
												? 'bg-amber-300'
												: 'bg-slate-300'
										}`}
										style={{
											top: '50%',
											left: '50%',
											transformOrigin: '0 0',
										}}
										animate={{
											rotate: -360,
											x:
												Math.cos(((i * 180 + index * 45) * Math.PI) / 180) *
													28 -
												3,
											y:
												Math.sin(((i * 180 + index * 45) * Math.PI) / 180) *
													28 -
												3,
										}}
										transition={{
											rotate: {
												duration: 6 + i * 0.5,
												repeat: Infinity,
												ease: 'linear',
											},
											x: { duration: 0 },
											y: { duration: 0 },
										}}
									/>
								))}
							</div>

							<div
								className={`w-20 h-20 rounded-full bg-gradient-to-br ${tierGradient} p-1 shadow-lg relative z-10`}
							>
								<div className='w-full h-full bg-white rounded-full flex items-center justify-center'>
									<Image
										src={achievement.iconUrl}
										alt={achievement.name}
										width={48}
										height={48}
										className='object-contain'
										onError={() => '/window.svg'}
									/>
								</div>
							</div>
							{/* 等级徽章 */}
							<div
								className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${tierGradient} flex items-center justify-center text-white text-xs font-bold shadow-md z-20`}
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
							className={`${status.bg} ${status.text} px-3 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1`}
						>
							<span>{status.icon}</span>
							<span>{status.label}</span>
						</div>
					</div>

					{/* 成就信息 */}
					<div className='mb-6'>
						<h3 className='font-bold text-xl mb-2 text-slate-800 group-hover:text-slate-900 transition-colors'>
							{achievement.name}
						</h3>
						<p className='text-slate-600 text-sm leading-relaxed'>
							{achievement.description}
						</p>
					</div>

					{/* 进度区域 */}
					<div className='mb-6'>
						<div className='flex justify-between items-center mb-3'>
							<span className='text-sm font-medium text-slate-700'>进度</span>
							<span className='text-sm font-bold text-slate-800'>
								{achievement.progress}%
							</span>
						</div>

						{/* 美化的进度条 */}
						<div className='relative w-full bg-slate-200 rounded-full h-3 overflow-hidden'>
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${achievement.progress}%` }}
								transition={{
									delay: index * 0.1 + 0.5,
									duration: 1,
									ease: 'easeOut',
								}}
								className={`h-full bg-gradient-to-r ${tierGradient} rounded-full relative overflow-hidden`}
							>
								{/* 进度条光效 */}
								<div className='absolute inset-0 bg-white/30 animate-pulse' />
								<div
									className='absolute top-0 left-0 h-full w-1/3 opacity-50 animate-pulse'
									style={{
										background:
											'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
									}}
								/>
							</motion.div>
						</div>
					</div>

					{/* 底部操作区域 */}
					<div className='flex justify-between items-center'>
						{/* 奖励信息 */}
						<div className='flex items-center gap-2'>
							<div className='w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center'>
								<span className='text-amber-600 text-sm'>💰</span>
							</div>
							<span className='text-sm font-semibold text-slate-700'>
								+{achievement.scoreReward} 积分
							</span>
						</div>

						{/* 领取按钮 */}
						{achievement.canClaim && !achievement.isClaimed && (
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={`bg-gradient-to-r ${tierGradient} text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300`}
							>
								领取奖励
							</motion.button>
						)}
					</div>
				</div>

				{/* 悬浮时的光效 */}
				<div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
					<div
						className={`absolute inset-0 bg-gradient-to-br ${tierGradient} opacity-5 rounded-xl`}
					/>
				</div>
			</div>

			{/* 卡片外部光晕效果 */}
			{achievement.canClaim && (
				<div
					className={`absolute inset-0 bg-gradient-to-r ${tierGradient} opacity-20 blur-xl rounded-xl -z-10 animate-pulse`}
				/>
			)}
		</motion.div>
	);
}

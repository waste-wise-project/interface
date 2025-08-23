'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAchievementStore } from '@/stores/useAchievementStore';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import AchievementCard from '@/components/features/achievements/AchievementCard';
import AchievementList from '@/components/features/achievements/AchievementList';

export default function AchievementsPage() {
	const { address, isConnected } = useAccount();
	const {
		achievements,
		isLoading,
		filter,
		setFilter,
		loadAchievements,
		getFilteredAchievements,
		getCompletionRate,
	} = useAchievementStore();

	useEffect(() => {
		if (isConnected && address) {
			loadAchievements(address);
		}
	}, [isConnected, address, loadAchievements]);

	if (!isConnected) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<Trophy className='mx-auto h-16 w-16 text-gray-400 mb-4' />
					<h1 className='text-2xl font-bold text-gray-900 mb-4'>我的成就</h1>
					<p className='text-gray-600'>连接钱包查看你的环保成就</p>
				</div>
			</div>
		);
	}

	const filteredAchievements = getFilteredAchievements();
	const completionRate = getCompletionRate();

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='max-w-6xl mx-auto px-4'>
				{/* 筛选器 */}
				<div className='flex flex-row justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold text-gray-900'>🏆 我的成就</h1>

					<div className='flex space-x-2'>
						{[
							{ value: 'all', label: '全部' },
							{ value: 'completed', label: '已完成' },
							{ value: 'claimable', label: '可领取' },
							{ value: 'claimed', label: '已领取' },
						].map((tab) => (
							<button
								key={tab.value}
								onClick={() => setFilter(tab.value as any)}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									filter === tab.value
										? 'bg-blue-600 text-white'
										: 'bg-white text-gray-700 hover:bg-gray-50'
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				{/* 成就列表 */}
				{isLoading ? (
					<div className='text-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
						<p className='mt-4 text-gray-600'>加载中...</p>
					</div>
				) : (
					<AchievementList filteredAchievements={filteredAchievements} />
				)}
			</div>
		</div>
	);
}

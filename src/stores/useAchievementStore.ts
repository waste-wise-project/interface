import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import apiClient from '@/lib/api';
import type { Achievement } from '@/types/api';

type AchievementFilter = 'all' | 'completed' | 'claimable' | 'claimed';

interface AchievementState {
	achievements: Achievement[];
	isLoading: boolean;
	filter: AchievementFilter;

	// Actions
	loadAchievements: (walletAddress: string) => Promise<void>;
	claimAchievement: (
		achievementId: number,
		walletAddress: string
	) => Promise<void>;
	setFilter: (filter: AchievementFilter) => void;

	// Computed properties
	getFilteredAchievements: () => Achievement[];
	getCompletionRate: () => number;
}

export const useAchievementStore = create<AchievementState>()(
	devtools(
		(set, get) => ({
			achievements: [],
			isLoading: false,
			filter: 'all',

			loadAchievements: async (walletAddress: string): Promise<void> => {
				set({ isLoading: true });

				try {
					const achievements: Achievement[] = await apiClient.get(
						'/achievement/my-achievements',
						{
							params: { walletAddress },
						}
					);
					console.log(achievements, 'achievements');
					set({ achievements, isLoading: false });
				} catch (error) {
					console.error('Failed to load achievements:', error);
					set({ isLoading: false });
				}
			},

			claimAchievement: async (
				achievementId: number,
				walletAddress: string
			): Promise<void> => {
				try {
					await apiClient.post('/achievement/claim', {
						achievementId,
						walletAddress,
					});

					// 更新本地状态
					set((state) => ({
						achievements: state.achievements.map((achievement) =>
							achievement.id === achievementId
								? { ...achievement, isClaimed: true }
								: achievement
						),
					}));

					// 重新加载以获取最新状态
					await get().loadAchievements(walletAddress);
				} catch (error) {
					console.error('Failed to claim achievement:', error);
					throw error;
				}
			},

			setFilter: (filter: AchievementFilter) => set({ filter }),

			getFilteredAchievements: (): Achievement[] => {
				const { achievements, filter } = get();
				switch (filter) {
					case 'completed':
						return achievements.filter((a) => a.isCompleted);
					case 'claimable':
						return achievements.filter((a) => a.canClaim && !a.isClaimed);
					case 'claimed':
						return achievements.filter((a) => a.isClaimed);
					default:
						return achievements;
				}
			},

			getCompletionRate: (): number => {
				const { achievements } = get();
				if (achievements.length === 0) return 0;
				const completed = achievements.filter((a) => a.isCompleted).length;
				return Math.round((completed / achievements.length) * 100);
			},
		}),
		{ name: 'achievement-store' }
	)
);

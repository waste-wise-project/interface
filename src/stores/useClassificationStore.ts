import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import apiClient from '@/lib/api';
import type { ClassificationResult, ClassificationStats } from '@/types/api';

interface CurrentClassification {
	imageUrl: string | null;
	selectedCategory: string | null;
	isSubmitting: boolean;
	result: ClassificationResult | null;
}

interface ClassificationState {
	// 当前分类状态
	currentClassification: CurrentClassification;

	// 历史记录
	history: ClassificationResult[];
	isLoadingHistory: boolean;

	// 统计数据
	stats: ClassificationStats | null;
	isLoadingStats: boolean;

	// Actions
	setImageUrl: (url: string | null) => void;
	setSelectedCategory: (category: string | null) => void;
	submitClassification: (
		walletAddress: string
	) => Promise<ClassificationResult>;
	loadHistory: (walletAddress: string) => Promise<void>;
	loadStats: (walletAddress: string) => Promise<void>;
	resetCurrent: () => void;
}

export const useClassificationStore = create<ClassificationState>()(
	devtools(
		(set, get) => ({
			// 初始状态
			currentClassification: {
				imageUrl: null,
				selectedCategory: null,
				isSubmitting: false,
				result: null,
			},
			history: [],
			isLoadingHistory: false,
			stats: null,
			isLoadingStats: false,

			// Actions
			setImageUrl: (imageUrl: string | null) =>
				set((state) => ({
					currentClassification: {
						...state.currentClassification,
						imageUrl,
					},
				})),

			setSelectedCategory: (selectedCategory: string | null) =>
				set((state) => ({
					currentClassification: {
						...state.currentClassification,
						selectedCategory,
					},
				})),

			submitClassification: async (
				walletAddress: string
			): Promise<ClassificationResult> => {
				const { currentClassification } = get();

				if (
					!currentClassification.imageUrl ||
					!currentClassification.selectedCategory
				) {
					throw new Error('请上传图片并选择分类');
				}

				set((state) => ({
					currentClassification: {
						...state.currentClassification,
						isSubmitting: true,
					},
				}));

				try {
					// TODO: 调用真实的agent 接口
					// const result: ClassificationResult = await apiClient.post(
					// 	'/classification',
					// 	{
					// 		imageUrl: currentClassification.imageUrl,
					// 		expectedCategory: currentClassification.selectedCategory,
					// 		walletAddress,
					// 	}
					// );

					// set((state) => ({
					// 	currentClassification: {
					// 		...state.currentClassification,
					// 		result,
					// 		isSubmitting: false,
					// 	},
					// 	history: [result, ...state.history],
					// }));

					// // 重新加载统计数据
					// await get().loadStats(walletAddress);

					// return result;
					return {} as ClassificationResult;
				} catch (error) {
					set((state) => ({
						currentClassification: {
							...state.currentClassification,
							isSubmitting: false,
						},
					}));
					throw error;
				}
			},

			loadHistory: async (walletAddress: string): Promise<void> => {
				set({ isLoadingHistory: true });

				try {
					const history: ClassificationResult[] = await apiClient.get(
						'/classification',
						{
							params: { walletAddress, limit: 20 },
						}
					);
					set({ history, isLoadingHistory: false });
				} catch (error) {
					console.error('Failed to load classification history:', error);
					set({ isLoadingHistory: false });
				}
			},

			loadStats: async (walletAddress: string): Promise<void> => {
				set({ isLoadingStats: true });

				try {
					const stats: ClassificationStats = await apiClient.get(
						'/classification/stats',
						{
							params: { walletAddress },
						}
					);
					set({ stats, isLoadingStats: false });
				} catch (error) {
					console.error('Failed to load classification stats:', error);
					set({ isLoadingStats: false });
				}
			},

			resetCurrent: () =>
				set({
					currentClassification: {
						imageUrl: null,
						selectedCategory: null,
						isSubmitting: false,
						result: null,
					},
				}),
		}),
		{ name: 'classification-store' }
	)
);

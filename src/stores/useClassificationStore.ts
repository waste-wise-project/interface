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
					// 调用后端分类接口
					const response: ClassificationResult = await apiClient.post(
						'/classification',
						{
							imageUrl: currentClassification.imageUrl,
							expectedCategory: currentClassification.selectedCategory,
							walletAddress,
						}
					);

					set((state) => ({
						currentClassification: {
							...state.currentClassification,
							isSubmitting: false,
							result: response,
						},
						// 将新结果添加到历史记录开头
						history: [response, ...state.history.slice(0, 19)], // 保持最多20条记录
					}));

					return response;
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
					const response = await apiClient.get('/classification/history', {
						params: { walletAddress, limit: 20 },
					});
					
					// 后端返回分页数据，我们取 data 字段中的历史记录
					const history: ClassificationResult[] = response.data || [];
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

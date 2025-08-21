import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
	// UI状态
	theme: 'light' | 'dark' | 'system';
	isLoading: boolean;

	// 通知系统
	notifications: Array<{
		id: string;
		type: 'success' | 'error' | 'warning' | 'info';
		title: string;
		message: string;
		duration?: number;
	}>;

	// 用户偏好
	preferences: {
		showTutorial: boolean;
		autoConnect: boolean;
		language: 'zh' | 'en';
	};

	// 动作
	setTheme: (theme: 'light' | 'dark' | 'system') => void;
	setLoading: (loading: boolean) => void;
	addNotification: (
		notification: Omit<AppState['notifications'][0], 'id'>
	) => void;
	removeNotification: (id: string) => void;
	updatePreferences: (preferences: Partial<AppState['preferences']>) => void;
}

export const useAppStore = create<AppState>()(
	devtools(
		persist(
			(set, get) => ({
				// 初始状态
				theme: 'system',
				isLoading: false,
				notifications: [],
				preferences: {
					showTutorial: true,
					autoConnect: true,
					language: 'zh',
				},

				// 动作
				setTheme: (theme) => set({ theme }),
				setLoading: (isLoading) => set({ isLoading }),

				addNotification: (notification) => {
					const id = Date.now().toString();
					const newNotification = { ...notification, id };

					set((state) => ({
						notifications: [...state.notifications, newNotification],
					}));

					// 自动移除
					if (notification.duration !== 0) {
						setTimeout(() => {
							get().removeNotification(id);
						}, notification.duration || 5000);
					}
				},

				removeNotification: (id) =>
					set((state) => ({
						notifications: state.notifications.filter((n) => n.id !== id),
					})),

				updatePreferences: (newPreferences) =>
					set((state) => ({
						preferences: { ...state.preferences, ...newPreferences },
					})),
			}),
			{
				name: 'app-storage',
				partialize: (state) => ({
					theme: state.theme,
					preferences: state.preferences,
				}),
			}
		),
		{ name: 'app-store' }
	)
);

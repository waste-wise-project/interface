'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
	return (
		<Toaster
			position='top-right'
			gutter={8}
			containerClassName=''
			containerStyle={{}}
			toastOptions={{
				// 全局默认配置
				duration: 4000,
				style: {
					background: '#fff',
					color: '#374151',
					padding: '16px',
					borderRadius: '8px',
					boxShadow:
						'0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
					border: '1px solid #e5e7eb',
					fontSize: '14px',
					maxWidth: '420px',
				},
				// 成功通知样式
				success: {
					style: {
						border: '1px solid #10b981',
						background: '#f0fdf4',
						color: '#065f46',
					},
					iconTheme: {
						primary: '#10b981',
						secondary: '#f0fdf4',
					},
				},
				// 错误通知样式
				error: {
					style: {
						border: '1px solid #ef4444',
						background: '#fef2f2',
						color: '#991b1b',
					},
					iconTheme: {
						primary: '#ef4444',
						secondary: '#fef2f2',
					},
				},
				// 加载中样式
				loading: {
					style: {
						border: '1px solid #3b82f6',
						background: '#eff6ff',
						color: '#1e40af',
					},
					iconTheme: {
						primary: '#3b82f6',
						secondary: '#eff6ff',
					},
				},
			}}
		/>
	);
}

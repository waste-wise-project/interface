import axios, { AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/api';

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 100000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// 类型化的API响应处理
const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
	if (response.data.success) {
		console.log(response.data.data, 'response');
		return response.data.data;
	} else {
		throw new Error(
			response.data.message || response.data.error || 'API request failed'
		);
	}
};

// 请求拦截器
apiClient.interceptors.request.use((config) => {
	return config;
});

// 响应拦截器 - 统一处理响应格式
apiClient.interceptors.response.use(
	(response) => {
		// 直接返回处理后的数据
		return handleApiResponse(response);
	},
	(error) => {
		console.error('API Error:', error);
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.message ||
			'请求失败';

		return Promise.reject(new Error(errorMessage));
	}
);

export default apiClient;

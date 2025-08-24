'use client';

import { useAccount } from 'wagmi';
import { useMemo } from 'react';

/**
 * 管理员权限验证 Hook
 * @returns {Object} { isAdmin: boolean, adminAddresses: string[], currentAddress?: string }
 */
export function useAdminAuth() {
	const { address: currentAddress, isConnected } = useAccount();

	const adminAddresses = useMemo(() => {
		const adminEnv = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES;
		if (!adminEnv) {
			console.warn('未配置NEXT_PUBLIC_ADMIN_ADDRESSES环境变量');
			return [];
		}

		return adminEnv
			.split(',')
			.map(addr => addr.trim().toLowerCase())
			.filter(addr => addr.length > 0);
	}, []);

	const isAdmin = useMemo(() => {
		if (!isConnected || !currentAddress) {
			return false;
		}

		const normalizedCurrentAddress = currentAddress.toLowerCase();
		return adminAddresses.includes(normalizedCurrentAddress);
	}, [isConnected, currentAddress, adminAddresses]);

	return {
		isAdmin,
		adminAddresses,
		currentAddress,
		isConnected,
	};
}
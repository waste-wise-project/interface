'use client';

import { useRouter } from 'next/navigation';

interface UnauthorizedMessageProps {
	className?: string;
	currentAddress?: string;
}

export default function UnauthorizedMessage({ 
	className = '',
	currentAddress 
}: UnauthorizedMessageProps) {
	const router = useRouter();

	return (
		<div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center ${className}`}>
			{/* 警告图标 */}
			<div className='mb-6'>
				<div className='mx-auto flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full'>
					<svg 
						className='w-8 h-8 text-red-600 dark:text-red-400' 
						fill='none' 
						stroke='currentColor' 
						viewBox='0 0 24 24'
					>
						<path 
							strokeLinecap='round' 
							strokeLinejoin='round' 
							strokeWidth={2} 
							d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' 
						/>
					</svg>
				</div>
			</div>

			{/* 标题 */}
			<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
				🚫 访问受限
			</h2>

			{/* 错误信息 */}
			<div className='mb-6'>
				<p className='text-gray-600 dark:text-gray-400 mb-4'>
					抱歉，您当前的钱包地址没有权限访问NFT铸造功能。
				</p>
				
				{currentAddress && (
					<div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4'>
						<p className='text-sm text-gray-500 dark:text-gray-400'>当前钱包地址：</p>
						<code className='text-sm font-mono text-gray-800 dark:text-gray-200'>
							{currentAddress}
						</code>
					</div>
				)}

				<div className='bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md'>
					<h4 className='font-medium text-blue-800 dark:text-blue-200 mb-2'>
						💡 如何获得访问权限？
					</h4>
					<ul className='text-sm text-blue-700 dark:text-blue-300 text-left space-y-1'>
						<li>• 联系系统管理员将您的钱包地址添加到管理员列表</li>
						<li>• 确保您使用的是已授权的管理员钱包地址</li>
						<li>• 如果您是管理员，请检查钱包连接是否正确</li>
					</ul>
				</div>
			</div>

			{/* 操作按钮 */}
			<div className='flex flex-col sm:flex-row gap-3 justify-center'>
				<button
					onClick={() => router.push('/')}
					className='px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'
				>
					返回首页
				</button>
				<button
					onClick={() => window.location.reload()}
					className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
				>
					刷新页面
				</button>
			</div>

			{/* 底部说明 */}
			<div className='mt-8 pt-4 border-t border-gray-200 dark:border-gray-700'>
				<p className='text-xs text-gray-500 dark:text-gray-400'>
					NFT铸造功能仅限管理员使用，如有疑问请联系技术支持
				</p>
			</div>
		</div>
	);
}
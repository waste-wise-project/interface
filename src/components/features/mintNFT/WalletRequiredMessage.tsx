'use client';

interface WalletRequiredMessageProps {
	className?: string;
}

export function WalletRequiredMessage({ className = '' }: WalletRequiredMessageProps) {
	return (
		<div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
			<div className='text-center'>
				<div className='mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4'>
					<svg className='w-8 h-8 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' />
					</svg>
				</div>
				<h3 className='text-lg font-semibold text-yellow-800 mb-2'>
					⚠️ 请先连接钱包
				</h3>
				<p className='text-yellow-700 mb-4'>
					需要连接管理员钱包才能铸造NFT到区块链
				</p>
				<div className='text-sm text-yellow-600 bg-yellow-100 p-3 rounded-md'>
					💡 请使用页面顶部的连接钱包按钮来连接您的Web3钱包
				</div>
			</div>
		</div>
	);
}
'use client';

interface StatusMessageProps {
	message: string | null;
	messageType: 'success' | 'error' | 'info';
	className?: string;
}

export function StatusMessage({ message, messageType, className = '' }: StatusMessageProps) {
	if (!message) return null;

	return (
		<div
			className={`p-4 rounded-md ${
				messageType === 'success'
					? 'bg-green-50 text-green-800 border border-green-200'
					: messageType === 'error'
					? 'bg-red-50 text-red-800 border border-red-200'
					: 'bg-blue-50 text-blue-800 border border-blue-200'
			} ${className}`}
		>
			<p className='text-sm break-words'>
				{message}
			</p>
			
			{/* 如果是成功消息，显示额外操作 */}
			{messageType === 'success' && message.includes('交易哈希') && (
				<div className='mt-2 text-xs'>
					<p className='text-green-700'>
						💡 您可以到区块链浏览器查看交易详情
					</p>
				</div>
			)}
		</div>
	);
}
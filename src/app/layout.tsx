import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Web3Provider from '@/components/providers/Web3Provider';
import ToastProvider from '@/components/providers/ToastProvider';
import Navigation from '@/components/ui/Navigation';
import './globals.css';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter',
});

export const metadata: Metadata = {
	title: {
		default: 'WasteToNFT - 垃圾分类变有趣',
		template: '%s | WasteToNFT',
	},
	description: '正确分类垃圾，获得独特的环保NFT，为地球做贡献！',
	keywords: ['垃圾分类', 'NFT', '环保', 'Web3', '区块链', 'AI识别'],
	authors: [{ name: 'WasteToNFT Team' }],
	creator: 'WasteToNFT Team',
	openGraph: {
		type: 'website',
		locale: 'zh_CN',
		url: 'https://wastetonfr.com',
		title: 'WasteToNFT - 垃圾分类变有趣',
		description: '正确分类垃圾，获得独特的环保NFT，为地球做贡献！',
		siteName: 'WasteToNFT',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'WasteToNFT - 垃圾分类变有趣',
		description: '正确分类垃圾，获得独特的环保NFT，为地球做贡献！',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='zh-CN' className={inter.variable}>
			<body className='font-sans antialiased'>
				<Web3Provider>
					<ToastProvider />
					<div className='flex min-h-screen flex-col'>
						<Navigation />
						<main className='flex-1'>{children}</main>
						<footer className='bg-gray-800 text-white py-12'>
							<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
								<div className='grid md:grid-cols-4 gap-8'>
									<div>
										<div className='flex items-center space-x-2 mb-4'>
											<span className='text-2xl'>🌱</span>
											<span className='text-xl font-bold text-green-400'>
												WasteToNFT
											</span>
										</div>
										<p className='text-gray-400 text-sm'>
											让垃圾分类变有趣，共同守护地球环境！
										</p>
									</div>

									<div>
										<h3 className='font-semibold mb-4'>产品</h3>
										<ul className='space-y-2 text-sm text-gray-400'>
											<li>
												<a
													href='/classification'
													className='hover:text-white transition-colors'
												>
													垃圾分类
												</a>
											</li>
											<li>
												<a
													href='/collection'
													className='hover:text-white transition-colors'
												>
													我的收藏
												</a>
											</li>
											<li>
												<a
													href='/leaderboard'
													className='hover:text-white transition-colors'
												>
													排行榜
												</a>
											</li>
										</ul>
									</div>

									<div>
										<h3 className='font-semibold mb-4'>社区</h3>
										<ul className='space-y-2 text-sm text-gray-400'>
											<li>
												<a
													href='#'
													className='hover:text-white transition-colors'
												>
													Discord
												</a>
											</li>
											<li>
												<a
													href='#'
													className='hover:text-white transition-colors'
												>
													Twitter
												</a>
											</li>
											<li>
												<a
													href='#'
													className='hover:text-white transition-colors'
												>
													GitHub
												</a>
											</li>
										</ul>
									</div>

									<div>
										<h3 className='font-semibold mb-4'>支持</h3>
										<ul className='space-y-2 text-sm text-gray-400'>
											<li>
												<a
													href='#'
													className='hover:text-white transition-colors'
												>
													帮助中心
												</a>
											</li>
											<li>
												<a
													href='#'
													className='hover:text-white transition-colors'
												>
													联系我们
												</a>
											</li>
											<li>
												<a
													href='#'
													className='hover:text-white transition-colors'
												>
													隐私政策
												</a>
											</li>
										</ul>
									</div>
								</div>

								<div className='border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400'>
									© 2025 WasteToNFT. All rights reserved.
								</div>
							</div>
						</footer>
					</div>
				</Web3Provider>
			</body>
		</html>
	);
}
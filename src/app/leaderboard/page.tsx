import { Metadata } from 'next';
import LeaderboardClient from '@/components/features/leaderboard/LeaderboardClient';

export const metadata: Metadata = {
  title: '环保排行榜 - WasteToNFT',
  description: '查看社区环保分类排行榜，看看谁是最环保的分类达人！通过正确分类垃圾来提升你的排名。',
  keywords: ['环保', '排行榜', '垃圾分类', 'NFT', '区块链'],
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 环保排行榜
          </h1>
          <p className="text-gray-600">
            看看谁是最环保的分类达人！积分越高排名越靠前
          </p>
        </div>

        <LeaderboardClient />
      </div>
    </div>
  );
}
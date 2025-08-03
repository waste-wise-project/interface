'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface LeaderboardEntry {
  rank: number;
  address: string;
  correctAttempts: number;
  accuracy: number;
  nftCount: number;
}

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取排行榜数据
    setTimeout(() => {
      setLeaderboard([
        { rank: 1, address: '0x1234...5678', correctAttempts: 150, accuracy: 95, nftCount: 15 },
        { rank: 2, address: '0x2345...6789', correctAttempts: 120, accuracy: 92, nftCount: 12 },
        { rank: 3, address: '0x3456...7890', correctAttempts: 100, accuracy: 90, nftCount: 10 },
        { rank: 4, address: '0x4567...8901', correctAttempts: 85, accuracy: 88, nftCount: 8 },
        { rank: 5, address: '0x5678...9012', correctAttempts: 70, accuracy: 85, nftCount: 7 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 环保排行榜
          </h1>
          <p className="text-gray-600">
            看看谁是最环保的分类达人！
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-green-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">🏆 社区竞赛</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <div 
                key={entry.rank} 
                className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 ${
                  address?.toLowerCase() === entry.address.toLowerCase() ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getRankEmoji(entry.rank)}</span>
                    <span className="font-bold text-lg">#{entry.rank}</span>
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900">
                      {entry.address}
                      {address?.toLowerCase() === entry.address.toLowerCase() && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          你
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{entry.correctAttempts}</div>
                    <div>正确次数</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{entry.accuracy}%</div>
                    <div>准确率</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">{entry.nftCount}</div>
                    <div>NFT数量</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 参与提示 */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 提升你的排名
            </h3>
            <p className="text-blue-700 mb-4">
              通过正确分类垃圾来提升你在排行榜上的位置！
            </p>
            <a 
              href="/classification"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              开始分类挑战
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
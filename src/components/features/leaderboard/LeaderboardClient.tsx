'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { getLeaderboard, getUserRanking, type UserRanking } from '@/lib/graphql';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  lastUpdated: string;
}

export default function LeaderboardClient() {
  const { address } = useAccount();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRanking, setUserRanking] = useState<UserRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const leaderboardData = await getLeaderboard({ limit: 50 });
      
      const formattedData: LeaderboardEntry[] = leaderboardData.entries.map(entry => ({
        rank: entry.rank,
        address: entry.walletAddress,
        score: entry.score,
        lastUpdated: entry.lastUpdated
      }));
      
      setLeaderboard(formattedData);
      
      // 如果用户已连接钱包，获取用户排名
      if (address) {
        try {
          const userRankingData = await getUserRanking(address);
          setUserRanking(userRankingData);
        } catch (userError) {
          console.warn('Failed to fetch user ranking:', userError);
          // 用户排名获取失败不影响排行榜显示
        }
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err instanceof Error ? err.message : '获取排行榜数据失败');
      toast.error('获取排行榜数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载排行榜数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 用户个人排名卡片 */}
      {address && userRanking && (
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">你的排名</h3>
              <p className="text-blue-100">钱包地址: {formatAddress(address)}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">#{userRanking.rank || '未上榜'}</div>
              <div className="text-blue-100">{userRanking.score} 积分</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-green-50 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">🏆 积分排行榜</h2>
          <button
            onClick={fetchLeaderboard}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            🔄 刷新
          </button>
        </div>
        
        {leaderboard.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <p className="text-gray-600">暂无排行榜数据</p>
            <p className="text-gray-500 text-sm mt-2">开始垃圾分类来获得积分吧！</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry) => (
              <div 
                key={entry.rank} 
                className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  address?.toLowerCase() === entry.address.toLowerCase() ? 'bg-green-50 border-l-4 border-green-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getRankEmoji(entry.rank)}</span>
                    <span className="font-bold text-lg text-gray-800">#{entry.rank}</span>
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatAddress(entry.address)}
                      {address?.toLowerCase() === entry.address.toLowerCase() && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          你
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      更新于: {formatDate(entry.lastUpdated)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="font-bold text-xl text-green-600">{entry.score}</div>
                    <div className="text-xs text-gray-500">积分</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 参与提示 */}
      <div className="text-center">
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
  );
}
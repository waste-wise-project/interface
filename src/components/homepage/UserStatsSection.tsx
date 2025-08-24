'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import StatsCard from '@/components/ui/StatsCard';

interface UserStats {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  totalCredits: number;
  nftCount: number;
}

export default function UserStatsSection() {
  const { isConnected, address } = useAccount();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 处理hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取用户统计数据
  useEffect(() => {
    if (mounted && isConnected && address) {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      fetch(`${apiUrl}/classification/stats?walletAddress=${address}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          // 转换后端数据格式到前端需要的格式
          const responseData = data.data || data;
          const transformedStats: UserStats = {
            totalAttempts: responseData.totalClassifications || 0,
            correctAttempts: responseData.correctClassifications || 0,
            accuracy: responseData.accuracyRate || 0,
            totalCredits: responseData.totalScore || 0,
            nftCount: 0 // TODO: 需要从NFT接口获取
          };
          setStats(transformedStats);
        })
        .catch((error) => {
          console.error('获取用户统计失败:', error);
          // 不显示错误，只是不显示统计数据
          setStats(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [mounted, isConnected, address]);

  if (!mounted || !isConnected) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          📊 我的统计数据
        </h2>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : stats ? (
          <StatsCard stats={stats} />
        ) : (
          <div className="text-center text-gray-500">
            暂无数据，开始你的第一次分类挑战吧！
          </div>
        )}
      </div>
    </section>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import ConnectWallet from '@/components/ui/ConnectWallet';

interface UserStats {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  totalCredits: number;
  nftCount: number;
}

export default function HeroSection() {
  const { address, isConnected } = useAccount();
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
          const transformedStats: UserStats = {
            totalAttempts: data.totalClassifications || 0,
            correctAttempts: data.correctClassifications || 0,
            accuracy: data.accuracyRate || 0,
            totalCredits: data.totalScore || 0,
            nftCount: 0 // TODO: 需要从NFT接口获取
          };
          setStats(transformedStats);
        })
        .catch((error) => {
          console.error('获取用户统计失败:', error);
          // 设置默认值避免显示错误
          setStats({
            totalAttempts: 0,
            correctAttempts: 0,
            accuracy: 0,
            totalCredits: 0,
            nftCount: 0
          });
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [mounted, isConnected, address]);

  // 防止hydration不匹配
  if (!mounted) {
    return (
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </section>
    );
  }
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4 animate-bounce">🌍</div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
            让垃圾分类变有趣
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            正确分类垃圾，获得独特的环保NFT，为地球做贡献！
          </p>
        </div>

        <div className="space-y-4">
          {!isConnected ? (
            <ConnectWallet />
          ) : (
            <div className="space-y-6">
              <Link
                href="/classification"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                🎯 开始分类挑战
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>

              {stats && !isLoading && (
                <div className="text-sm text-gray-600">
                  欢迎回来！你已经正确分类了{' '}
                  <span className="font-semibold text-green-600">
                    {stats.correctAttempts}
                  </span>{' '}
                  次
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
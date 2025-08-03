'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import StatsCard from '@/components/ui/StatsCard';
import ConnectWallet from '@/components/ui/ConnectWallet';

interface UserStats {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  totalCredits: number;
  nftCount: number;
}

export default function Homepage() {
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
    if (mounted && isConnected) {
      setIsLoading(true);
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
          setStats(data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [mounted, isConnected]);

  // 防止hydration不匹配
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
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

          {/* 连接钱包或开始按钮 */}
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
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                {stats && !isLoading && (
                  <div className="text-sm text-gray-600">
                    欢迎回来！你已经正确分类了 <span className="font-semibold text-green-600">{stats.correctAttempts}</span> 次
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 功能特色区域 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ✨ 关键亮点
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { emoji: '🎯', title: '简单易用', desc: '4个按钮选择垃圾类型' },
              { emoji: '🎨', title: '视觉吸引', desc: '清爽的绿色保护主题' },
              { emoji: '🏆', title: '游戏化', desc: '积分系统、稀有NFT、排行榜' },
              { emoji: '📱', title: '响应式', desc: '适配手机和电脑' },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心体验流程 */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            🎮 核心体验流程
          </h2>
          
          <div className="space-y-8">
            {[
              { 
                emoji: '🏠', 
                color: 'green',
                title: '1. 首页 - 项目介绍和个人统计',
                desc: '了解项目，查看个人成就'
              },
              { 
                emoji: '🗂️', 
                color: 'blue',
                title: '2. 垃圾分类 - 核心功能，选择类型获得NFT',
                desc: '上传图片，选择分类，AI识别验证'
              },
              { 
                emoji: '🏆', 
                color: 'yellow',
                title: '3. 我的收藏 - 展示获得的环保NFT',
                desc: '查看和管理你的NFT收藏'
              },
              { 
                emoji: '📊', 
                color: 'purple',
                title: '4. 排行榜 - 社区竞赛功能',
                desc: '与其他用户比较成绩'
              },
            ].map((step, index) => (
              <div key={index} className="flex items-center space-x-6 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className={`text-2xl bg-${step.color}-100 p-3 rounded-full flex-shrink-0`}>
                  {step.emoji}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 用户统计（仅在连接钱包后显示） */}
      {mounted && isConnected && (
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
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            🌟 加入环保革命
          </h2>
          <p className="text-xl mb-8 opacity-90">
            每一次正确的分类都是对地球的贡献
          </p>
          
          {!isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  立即开始 →
                </button>
              )}
            </ConnectButton.Custom>
          ) : (
            <Link 
              href="/classification"
              className="inline-block bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
            >
              开始分类挑战 →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
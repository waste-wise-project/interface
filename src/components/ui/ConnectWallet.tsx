'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

interface ConnectWalletProps {
  onConnected?: () => void;
  redirectPath?: string;
  showWelcomeMessage?: boolean;
}

export default function ConnectWallet({ 
  onConnected,
  redirectPath = '/classification',
  showWelcomeMessage = true 
}: ConnectWalletProps) {
  const router = useRouter();
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // 处理连接成功后的逻辑
  const handleConnectionSuccess = useCallback(async () => {
    if (!isConnected || !address) return;

    try {
      setIsRedirecting(true);
      setConnectionError(null);

      // 可以在这里添加用户数据初始化逻辑
      // 比如检查用户是否首次连接，保存用户信息等
      
      // 执行自定义回调
      if (onConnected) {
        await onConnected();
      }

      // 短暂延迟提升用户体验
      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);

    } catch (error) {
      console.error('Connection post-processing failed:', error);
      setConnectionError('连接后处理失败，请重试');
      setIsRedirecting(false);
    }
  }, [isConnected, address, onConnected, router, redirectPath]);

  // 监听连接状态变化
  useEffect(() => {
    if (isConnected && address && !isRedirecting) {
      handleConnectionSuccess();
    }
  }, [isConnected, address, isRedirecting, handleConnectionSuccess]);

  // 处理连接错误
  const handleConnectionError = (error: Error) => {
    console.error('Wallet connection error:', error);
    setConnectionError('钱包连接失败，请重试');
    setIsRedirecting(false);
  };

  // 重试连接
  const handleRetry = () => {
    setConnectionError(null);
    // 这里可以添加重新连接的逻辑
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className="space-y-4"
          >
            {(() => {
              // 显示连接错误
              if (connectionError) {
                return (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-500">⚠️</span>
                        <p className="text-red-700 text-sm">{connectionError}</p>
                      </div>
                      <button
                        onClick={handleRetry}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                      >
                        重试
                      </button>
                    </div>
                  </div>
                );
              }

              // 显示重定向状态
              if (connected && isRedirecting) {
                return (
                  <div className="space-y-4 text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-green-700 font-medium">钱包连接成功！</p>
                      <p className="text-green-600 text-sm mt-1">正在跳转到垃圾分类页面...</p>
                    </div>
                    {showWelcomeMessage && (
                      <p className="text-sm text-gray-600">
                        欢迎加入环保之旅！🌱
                      </p>
                    )}
                  </div>
                );
              }

              // 显示连接按钮
              if (!connected) {
                return (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        try {
                          openConnectModal();
                        } catch (error) {
                          handleConnectionError(error as Error);
                        }
                      }}
                      disabled={isConnecting}
                      className={`
                        bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold 
                        hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                      `}
                    >
                      {isConnecting ? (
                        <span className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>连接中...</span>
                        </span>
                      ) : (
                        '🚀 开始环保之旅'
                      )}
                    </button>
                    <p className="text-sm text-gray-500 text-center">
                      连接钱包即可开始垃圾分类挑战
                    </p>
                    
                    {/* 支持的钱包提示 */}
                    <div className="text-xs text-gray-400 text-center">
                      支持 MetaMask、WalletConnect 等主流钱包
                    </div>
                  </div>
                );
              }

              // 已连接但未重定向（备用状态）
              return (
                <div className="space-y-4 text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-700">钱包已连接</p>
                    <p className="text-blue-600 text-sm">{account?.displayName}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

// 使用示例组件
export function ConnectWalletPage() {
  const handleConnected = async () => {
    // 这里可以添加连接成功后的自定义逻辑
    // 比如：初始化用户数据、发送分析事件等
    console.log('Wallet connected successfully');
    
    // 示例：发送连接事件到分析服务
    // analytics.track('wallet_connected', { timestamp: Date.now() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
            🌍
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            让垃圾分类变有趣
          </h1>
          <p className="text-gray-600">
            正确分类垃圾，获得独特的环保NFT，为地球做贡献！
          </p>
        </div>
        
        <ConnectWallet 
          onConnected={handleConnected}
          redirectPath="/classification"
          showWelcomeMessage={true}
        />
      </div>
    </div>
  );
}
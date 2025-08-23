'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import toast from 'react-hot-toast';

interface ConnectWalletProps {
  onConnected?: () => void;
  redirectPath?: string;
  showWelcomeMessage?: boolean;
  maxRetries?: number;
}

type ConnectionErrorType = 'network' | 'coinbase' | 'timeout' | 'user_rejected' | 'unknown';

interface ConnectionError {
  type: ConnectionErrorType;
  message: string;
  details?: string;
  retryable: boolean;
}

export default function ConnectWallet({ 
  onConnected,
  redirectPath = '/classification',
  showWelcomeMessage = true,
  maxRetries = 3
}: ConnectWalletProps) {
  const router = useRouter();
  const { address, isConnected, isConnecting } = useAccount();
  useDisconnect(); // 保留以备后用
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [connectionError, setConnectionError] = useState<ConnectionError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // 清理函数
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 解析错误类型
  const parseConnectionError = useCallback((error: Error): ConnectionError => {
    const errorMessage = error.message.toLowerCase();
    
    // Coinbase 相关错误
    if (errorMessage.includes('coinbase') || errorMessage.includes('cca-lite')) {
      return {
        type: 'coinbase',
        message: 'Coinbase 钱包服务暂时不可用',
        details: '请尝试使用其他钱包或稍后重试',
        retryable: true
      };
    }
    
    // 网络错误
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
      return {
        type: 'network',
        message: '网络连接异常',
        details: '请检查网络连接后重试',
        retryable: true
      };
    }
    
    // 用户拒绝
    if (errorMessage.includes('user rejected') || errorMessage.includes('user denied') || errorMessage.includes('canceled')) {
      return {
        type: 'user_rejected',
        message: '用户取消了连接',
        details: '请重新点击连接按钮',
        retryable: false
      };
    }
    
    // 超时错误
    if (errorMessage.includes('timeout')) {
      return {
        type: 'timeout',
        message: '连接超时',
        details: '钱包响应时间过长，请重试',
        retryable: true
      };
    }
    
    // 默认未知错误
    return {
      type: 'unknown',
      message: '连接失败',
      details: error.message,
      retryable: true
    };
  }, []);

  // 处理连接成功后的逻辑
  const handleConnectionSuccess = useCallback(async () => {
    if (!isConnected || !address || !mountedRef.current) return;

    try {
      setIsRedirecting(true);
      setConnectionError(null);
      setRetryCount(0); // 重置重试计数

      // 清除任何现有的超时
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 执行自定义回调
      if (onConnected) {
        await Promise.race([
          onConnected(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('连接回调超时')), 10000)
          )
        ]);
      }

      // 成功提示
      toast.success('钱包连接成功！', {
        duration: 2000,
        icon: '🎉'
      });

      // 短暂延迟提升用户体验
      if (mountedRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            router.push(redirectPath);
          }
        }, 1500);
      }

    } catch (error) {
      console.error('Connection post-processing failed:', error);
      const parsedError = parseConnectionError(error as Error);
      setConnectionError(parsedError);
      setIsRedirecting(false);
      toast.error(parsedError.message);
    }
  }, [isConnected, address, onConnected, router, redirectPath, parseConnectionError]);

  // 监听连接状态变化
  useEffect(() => {
    if (isConnected && address && !isRedirecting && !connectionError) {
      handleConnectionSuccess();
    }
  }, [isConnected, address, isRedirecting, connectionError, handleConnectionSuccess]);

  // 处理连接错误
  const handleConnectionError = useCallback((error: Error) => {
    console.error('Wallet connection error:', error);
    const parsedError = parseConnectionError(error);
    setConnectionError(parsedError);
    setIsRedirecting(false);
    setIsRetrying(false);
    
    // 显示错误提示
    toast.error(parsedError.message, {
      duration: 4000,
      icon: parsedError.type === 'coinbase' ? '🔗' : '⚠️'
    });
  }, [parseConnectionError]);

  // 自动重试逻辑
  const attemptAutoRetry = useCallback(async () => {
    if (retryCount >= maxRetries || !connectionError?.retryable) {
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // 延迟重试，避免频繁请求
    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // 指数退避，最大5秒
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (mountedRef.current) {
      setConnectionError(null);
      setIsRetrying(false);
      
      toast.loading(`自动重试中... (${retryCount + 1}/${maxRetries})`, {
        duration: 2000,
        icon: '🔄'
      });
    }
  }, [retryCount, maxRetries, connectionError]);

  // 手动重试连接
  const handleManualRetry = useCallback(() => {
    setConnectionError(null);
    setRetryCount(0);
    setIsRetrying(false);
    toast.dismiss();
  }, []);

  // 自动重试效果
  useEffect(() => {
    if (connectionError?.retryable && retryCount < maxRetries && connectionError.type !== 'user_rejected') {
      const timeoutId = setTimeout(attemptAutoRetry, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [connectionError, retryCount, maxRetries, attemptAutoRetry]);

  // 处理钱包连接超时
  const handleConnectionTimeout = useCallback(() => {
    if (isConnecting) {
      const timeoutError: ConnectionError = {
        type: 'timeout',
        message: '连接超时',
        details: '钱包响应时间过长，请检查钱包状态或重试',
        retryable: true
      };
      setConnectionError(timeoutError);
      setIsRetrying(false);
      toast.error('连接超时，请重试', { icon: '⏰' });
    }
  }, [isConnecting]);

  // 连接超时监听
  useEffect(() => {
    if (isConnecting) {
      const timeoutId = setTimeout(handleConnectionTimeout, 30000); // 30秒超时
      return () => clearTimeout(timeoutId);
    }
  }, [isConnecting, handleConnectionTimeout]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
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
                const getErrorIcon = (type: ConnectionErrorType) => {
                  switch (type) {
                    case 'coinbase': return '🔗';
                    case 'network': return '🌐';
                    case 'timeout': return '⏰';
                    case 'user_rejected': return '❌';
                    default: return '⚠️';
                  }
                };

                const getErrorStyles = (type: ConnectionErrorType) => {
                  switch (type) {
                    case 'coinbase': 
                      return {
                        bg: 'bg-orange-50 border-orange-200',
                        text: 'text-orange-800',
                        details: 'text-orange-600',
                        button: 'text-orange-700 hover:text-orange-900 bg-orange-100 hover:bg-orange-200'
                      };
                    case 'network':
                      return {
                        bg: 'bg-blue-50 border-blue-200',
                        text: 'text-blue-800',
                        details: 'text-blue-600',
                        button: 'text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200'
                      };
                    case 'timeout':
                      return {
                        bg: 'bg-yellow-50 border-yellow-200',
                        text: 'text-yellow-800',
                        details: 'text-yellow-600',
                        button: 'text-yellow-700 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200'
                      };
                    case 'user_rejected':
                      return {
                        bg: 'bg-gray-50 border-gray-200',
                        text: 'text-gray-800',
                        details: 'text-gray-600',
                        button: 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
                      };
                    default:
                      return {
                        bg: 'bg-red-50 border-red-200',
                        text: 'text-red-800',
                        details: 'text-red-600',
                        button: 'text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200'
                      };
                  }
                };

                const styles = getErrorStyles(connectionError.type);

                return (
                  <div className="space-y-4">
                    <div className={`${styles.bg} border rounded-lg p-4`}>
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getErrorIcon(connectionError.type)}</span>
                        <div className="flex-1">
                          <p className={`${styles.text} font-medium text-sm`}>
                            {connectionError.message}
                          </p>
                          {connectionError.details && (
                            <p className={`${styles.details} text-xs mt-1`}>
                              {connectionError.details}
                            </p>
                          )}
                          
                          {/* 重试信息 */}
                          {connectionError.retryable && retryCount < maxRetries && (
                            <div className={`${styles.details} text-xs mt-2 flex items-center space-x-2`}>
                              {isRetrying ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                  <span>自动重试中... ({retryCount}/{maxRetries})</span>
                                </>
                              ) : (
                                <span>将在 2 秒后自动重试 ({retryCount}/{maxRetries})</span>
                              )}
                            </div>
                          )}
                          
                          {/* 重试按钮 */}
                          <div className="mt-3 flex space-x-2">
                            {connectionError.retryable && (
                              <button
                                onClick={handleManualRetry}
                                disabled={isRetrying}
                                className={`${styles.button} text-sm font-medium 
                                         disabled:opacity-50 disabled:cursor-not-allowed
                                         px-3 py-1 rounded`}
                              >
                                {isRetrying ? '重试中...' : '立即重试'}
                              </button>
                            )}
                            
                            {connectionError.type === 'coinbase' && (
                              <button
                                onClick={() => {
                                  setConnectionError(null);
                                  toast.success('建议使用 MetaMask 或其他钱包', { icon: '💡' });
                                }}
                                className="text-gray-600 hover:text-gray-800 text-sm underline"
                              >
                                使用其他钱包
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
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
                          // 清除之前的错误状态
                          setConnectionError(null);
                          setRetryCount(0);
                          toast.dismiss();
                          openConnectModal();
                        } catch (error) {
                          handleConnectionError(error as Error);
                        }
                      }}
                      disabled={isConnecting || isRetrying}
                      className={`
                        w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold 
                        hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                      `}
                    >
                      {isConnecting || isRetrying ? (
                        <span className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>
                            {isRetrying ? `重试中... (${retryCount}/${maxRetries})` : '连接中...'}
                          </span>
                        </span>
                      ) : (
                        '🚀 开始环保之旅'
                      )}
                    </button>
                    
                    <p className="text-sm text-gray-500 text-center">
                      连接钱包即可开始垃圾分类挑战
                    </p>
                    
                    {/* 支持的钱包提示 */}
                    <div className="text-xs text-gray-400 text-center space-y-1">
                      <div>支持 MetaMask、WalletConnect 等主流钱包</div>
                      {retryCount > 0 && (
                        <div className="text-yellow-600">
                          遇到问题？建议使用 MetaMask 钱包
                        </div>
                      )}
                    </div>
                    
                    {/* 网络状态提示 */}
                    {typeof navigator !== 'undefined' && !navigator.onLine && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-yellow-700">
                          <span>🌐</span>
                          <span className="text-sm">网络连接异常，请检查网络设置</span>
                        </div>
                      </div>
                    )}
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
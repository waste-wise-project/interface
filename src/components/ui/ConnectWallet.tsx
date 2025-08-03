'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectWallet() {
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
          >
            {(() => {
              if (!connected) {
                return (
                  <div className="space-y-4">
                    <button
                      onClick={openConnectModal}
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      🚀 开始环保之旅
                    </button>
                    <p className="text-sm text-gray-500">
                      连接钱包即可开始垃圾分类挑战
                    </p>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
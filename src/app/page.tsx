import Homepage from '@/components/Homepage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '首页',
  description: '加入WasteToNFT，通过垃圾分类获得环保NFT，为地球做贡献！',
};

export default function Page() {
  return <Homepage />;
}
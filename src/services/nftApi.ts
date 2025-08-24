import apiClient from '@/lib/api';
import {
  NFTData,
  MintNFTResponse,
  EligibleNFT,
  NFTClaim,
  OwnedNFT,
  NFTPoolStats,
  AddNftToPoolRequest,
  ReserveNftRequest,
  ClaimNftRequest,
  BatchAddNftRequest,
  NFTValidationResult,
  NFT_RARITY_LABELS,
  NFT_CATEGORY_LABELS,
  NFTAttribute,
} from '@/types/nft';

class NFTApiService {
  // ==========================================
  // 用户功能
  // ==========================================

  /**
   * 获取钱包可领取的NFT列表
   */
  async getEligibleNfts(walletAddress: string): Promise<EligibleNFT[]> {
    return apiClient.get(`/nft/eligible`, {
      params: { walletAddress },
    });
  }

  /**
   * 预留NFT（30分钟有效）
   */
  async reserveNft(data: ReserveNftRequest): Promise<{
    message: string;
    reservedUntil: string;
  }> {
    return apiClient.post('/nft/reserve', data);
  }

  /**
   * 领取NFT（直接转移到用户钱包）
   */
  async claimNft(data: ClaimNftRequest): Promise<{
    claimId: number;
    transferResult: {
      transactionHash: string;
      blockNumber: number;
    };
    message: string;
  }> {
    return apiClient.post('/nft/claim', data);
  }

  /**
   * 获取钱包的NFT领取记录
   */
  async getNftClaims(walletAddress: string): Promise<NFTClaim[]> {
    return apiClient.get('/nft/claims', {
      params: { walletAddress },
    });
  }

  /**
   * 查询特定领取记录的状态
   */
  async getClaimStatus(claimId: number): Promise<NFTClaim> {
    return apiClient.get(`/nft/claims/${claimId}`);
  }

  /**
   * 获取钱包拥有的NFT列表
   */
  async getOwnedNfts(walletAddress: string): Promise<OwnedNFT[]> {
    return apiClient.get('/nft/owned', {
      params: { walletAddress },
    });
  }

  // ==========================================
  // 管理员功能
  // ==========================================

  /**
   * 添加NFT到池并铸造到链上（管理员）
   */
  async mintNftToPool(data: AddNftToPoolRequest): Promise<MintNFTResponse> {
    return apiClient.post('/nft/admin/pool', data);
  }

  /**
   * 批量添加NFT到池（管理员）
   */
  async batchMintNfts(data: BatchAddNftRequest): Promise<MintNFTResponse[]> {
    return apiClient.post('/nft/admin/pool/batch', data);
  }

  /**
   * 获取NFT池统计信息（管理员）
   */
  async getPoolStats(): Promise<NFTPoolStats> {
    return apiClient.get('/nft/admin/stats');
  }

  // ==========================================
  // 辅助功能
  // ==========================================

  /**
   * 验证NFT数据
   */
  validateNFTData(data: Partial<NFTData>): NFTValidationResult {
    const errors: string[] = [];

    // 必填字段验证
    if (!data.name || data.name.trim().length === 0) {
      errors.push('NFT名称不能为空');
    } else if (data.name.length > 100) {
      errors.push('NFT名称不能超过100个字符');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('NFT描述不能为空');
    } else if (data.description.length > 500) {
      errors.push('NFT描述不能超过500个字符');
    }

    if (!data.imageUrl || data.imageUrl.trim().length === 0) {
      errors.push('图片URL不能为空');
    } else if (!this.isValidUrl(data.imageUrl)) {
      errors.push('图片URL格式无效');
    }

    // 数值验证
    if (data.rarity !== undefined) {
      if (!Number.isInteger(data.rarity) || data.rarity < 1 || data.rarity > 5) {
        errors.push('稀有度必须是1-5之间的整数');
      }
    }

    if (data.requiredScore !== undefined) {
      if (!Number.isInteger(data.requiredScore) || data.requiredScore < 0) {
        errors.push('需要积分必须是大于等于0的整数');
      }
    }

    if (data.requiredClassifications !== undefined) {
      if (!Number.isInteger(data.requiredClassifications) || data.requiredClassifications < 0) {
        errors.push('需要分类次数必须是大于等于0的整数');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 构建NFT属性
   */
  buildNFTAttributes(options: {
    category?: string;
    rarity: number;
    customAttributes?: NFTAttribute[];
  }): NFTAttribute[] {
    const attributes: NFTAttribute[] = [];

    // 基础属性
    attributes.push({
      trait_type: 'Rarity',
      value: this.formatRarity(options.rarity),
    });

    attributes.push({
      trait_type: 'Rarity Level',
      value: options.rarity,
    });

    if (options.category) {
      attributes.push({
        trait_type: 'Category',
        value: this.formatCategory(options.category),
      });
    }

    // 添加时间戳
    attributes.push({
      trait_type: 'Created At',
      value: new Date().toISOString().split('T')[0], // YYYY-MM-DD 格式
    });

    // 添加自定义属性
    if (options.customAttributes && options.customAttributes.length > 0) {
      attributes.push(...options.customAttributes);
    }

    return attributes;
  }

  /**
   * 格式化稀有度显示
   */
  formatRarity(rarity: number): string {
    return NFT_RARITY_LABELS[rarity] || '未知';
  }

  /**
   * 获取稀有度标签
   */
  getRarityLabel(rarity: number): string {
    return NFT_RARITY_LABELS[rarity] || '未知';
  }

  /**
   * 格式化类别显示
   */
  formatCategory(category: string): string {
    return NFT_CATEGORY_LABELS[category] || category;
  }

  /**
   * 计算NFT稀有度颜色
   */
  getRarityColor(rarity: number): string {
    const colors = {
      1: 'text-gray-600 bg-gray-100',     // 普通
      2: 'text-green-600 bg-green-100',   // 稀有
      3: 'text-blue-600 bg-blue-100',     // 史诗
      4: 'text-purple-600 bg-purple-100', // 传说
      5: 'text-orange-600 bg-orange-100', // 神话
    };
    return colors[rarity as keyof typeof colors] || colors[1];
  }

  /**
   * 格式化积分显示
   */
  formatScore(score: number): string {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    }
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toString();
  }

  /**
   * 生成NFT预览数据
   */
  generatePreview(data: NFTData): {
    displayName: string;
    rarityText: string;
    rarityColor: string;
    categoryText: string;
    scoreText: string;
    classificationsText: string;
  } {
    return {
      displayName: data.name || '未命名NFT',
      rarityText: `${data.rarity} 星 - ${this.formatRarity(data.rarity)}`,
      rarityColor: this.getRarityColor(data.rarity),
      categoryText: this.formatCategory(data.category || 'general'),
      scoreText: `${this.formatScore(data.requiredScore)} 积分`,
      classificationsText: `${data.requiredClassifications} 次分类`,
    };
  }

  // ==========================================
  // 私有辅助方法
  // ==========================================

  /**
   * 验证URL格式
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 生成唯一ID（用于本地临时标识）
   */
  generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 格式化交易哈希显示
   */
  formatTxHash(hash: string, length = 8): string {
    if (!hash) return '';
    if (hash.length <= length * 2) return hash;
    return `${hash.slice(0, length)}...${hash.slice(-length)}`;
  }

  /**
   * 获取以太坊浏览器链接
   */
  getEtherscanLink(txHash: string, network = 'sepolia'): string {
    const baseUrl = network === 'mainnet' 
      ? 'https://etherscan.io' 
      : `https://${network}.etherscan.io`;
    return `${baseUrl}/tx/${txHash}`;
  }
}

// 导出单例实例
const nftApiService = new NFTApiService();
export default nftApiService;

// 导出类型
export type {
  NFTData,
  MintNFTResponse,
  EligibleNFT,
  NFTClaim,
  OwnedNFT,
  NFTPoolStats,
  AddNftToPoolRequest,
  ReserveNftRequest,
  ClaimNftRequest,
  BatchAddNftRequest,
  NFTValidationResult,
};
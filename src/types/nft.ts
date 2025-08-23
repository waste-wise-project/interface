// NFT 相关类型定义
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface NFTData {
  id?: number;
  name: string;
  description: string;
  imageUrl: string;
  rarity: number;
  category?: string;
  requiredScore: number;
  requiredClassifications: number;
  attributes?: NFTAttribute[];
}

export interface BlockchainInfo {
  tokenId: number;
  transactionHash: string;
  metadataUri: string;
  contractAddress?: string;
  blockNumber?: number;
}

export interface MintNFTResponse {
  id: number;
  name: string;
  description: string;
  tokenId: number;
  contractAddress: string;
  metadataUri: string;
  status: 'AVAILABLE' | 'CLAIMED' | 'RESERVED';
  blockchainInfo: BlockchainInfo;
}

export interface EligibleNFT extends NFTData {
  canClaim: boolean;
  missingRequirements: string[];
}

export interface NFTClaim {
  id: number;
  nftPoolId: number;
  walletAddress: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
  requestedAt: string;
  confirmedAt?: string;
  failedAt?: string;
  failureReason?: string;
  transactionHash?: string;
}

export interface OwnedNFT {
  claimId: number;
  nft: NFTData & { id: number };
  claimedAt: string;
  transactionHash: string;
}

export interface NFTPoolStats {
  overview: {
    totalNfts: number;
    availableNfts: number;
    claimedNfts: number;
    pendingClaims: number;
    claimRate: number;
  };
  byRarity: Array<{
    rarity: number;
    count: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
  }>;
}

// API 请求类型
export interface AddNftToPoolRequest {
  name: string;
  description: string;
  imageUrl: string;
  rarity: number;
  requiredScore: number;
  requiredClassifications: number;
  category?: string;
  attributes?: NFTAttribute[];
}

export interface ReserveNftRequest {
  walletAddress: string;
  nftPoolId: number;
}

export interface ClaimNftRequest {
  walletAddress: string;
  nftPoolId: number;
}

export interface BatchAddNftRequest {
  nfts: AddNftToPoolRequest[];
}

// NFT 验证错误
export interface NFTValidationResult {
  isValid: boolean;
  errors: string[];
}

// NFT 稀有度映射
export const NFT_RARITY_LABELS: Record<number, string> = {
  1: '普通',
  2: '稀有',
  3: '史诗',
  4: '传说',
  5: '神话',
};

// NFT 类别映射
export const NFT_CATEGORY_LABELS: Record<string, string> = {
  achievement: '成就类',
  milestone: '里程碑',
  special: '特殊奖励',
  general: '通用',
};

// NFT 状态映射
export const NFT_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: '可领取',
  CLAIMED: '已领取',
  RESERVED: '已预留',
  PENDING: '处理中',
  CONFIRMED: '已确认',
  FAILED: '失败',
  CANCELLED: '已取消',
};
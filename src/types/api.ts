export interface ApiResponse<T = any> {
	success: boolean;
	data: T;
	message?: string;
	error?: string;
}

export interface ClassificationResult {
	id: number;
	imageUrl: string;
	expectedCategory: string;
	aiDetectedCategory: string;
	isCorrect: boolean;
	score: number;
	confidence: number;
	aiDescription: string;
	characteristics: string[];
	materialType: string;
	disposalInstructions: string;
	detailedAnalysis: string;
	learningPoints: string[];
	suggestions: string[];
	improvementTips: string[];
	walletAddress: string;
	userLocation?: string;
	deviceInfo?: string;
	availableNfts?: NFTReward[];
	createdAt: string;
	updatedAt: string;
}

export interface NFTReward {
	id: number;
	name: string;
	description: string;
	imageUrl: string;
	rarity: number;
}

export interface CategoryStatsItem {
	total: number;
	correct: number;
	accuracy: number;
}

export interface CategoryBreakdown {
	recyclable: CategoryStatsItem;
	hazardous: CategoryStatsItem;
	kitchen: CategoryStatsItem;
	other: CategoryStatsItem;
}

export interface AvailableAchievement {
	id: number;
	name: string;
	description: string;
	progress: number;
	target: number;
}

export interface ClassificationStats {
	totalClassifications: number;
	correctClassifications: number;
	accuracyRate: number;
	totalScore: number;
	averageScore: number;
	categoryBreakdown: CategoryBreakdown;
	recentClassifications: ClassificationResult[];
	achievements: {
		canEarn: AvailableAchievement[];
	};
}

export interface Achievement {
	id: number;
	code: string;
	name: string;
	description: string;
	scoreReward: number;
	iconUrl: string;
	category: string;
	tier: string;
	requirements: Record<string, any>;
	progress: number;
	isCompleted: boolean;
	isClaimed: boolean;
	canClaim: boolean;
}

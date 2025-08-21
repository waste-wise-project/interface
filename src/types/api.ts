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
	availableNfts?: NFTReward[];
	createdAt: string;
}

export interface NFTReward {
	id: number;
	name: string;
	description: string;
	imageUrl: string;
	rarity: number;
}

export interface ClassificationStats {
	totalClassifications: number;
	correctClassifications: number;
	totalScore: number;
	accuracy: number;
	streakCount: number;
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

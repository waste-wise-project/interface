
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  score: number;
  lastUpdated: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  timestamp: string;
}

export interface UserRanking {
  walletAddress: string;
  score: number;
  rank?: number;
  timestamp: string;
}

export interface GetLeaderboardInput {
  limit?: number;
  offset?: number;
}

// GraphQL查询
const LEADERBOARD_QUERY = `
  query GetLeaderboard($input: GetLeaderboardInput) {
    leaderboard(input: $input) {
      entries {
        rank
        walletAddress
        score
        lastUpdated
      }
      total
      timestamp
    }
  }
`;

const USER_RANKING_QUERY = `
  query GetUserRanking($walletAddress: String!) {
    userRanking(walletAddress: $walletAddress) {
      walletAddress
      score
      rank
      timestamp
    }
  }
`;

export async function executeGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result: GraphQLResponse<T> = await response.json();
    
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }
    
    if (!result.data) {
      throw new Error('No data returned from GraphQL query');
    }
    
    return result.data;
  } catch (error) {
    console.error('GraphQL Error:', error);
    throw error;
  }
}

export async function getLeaderboard(input?: GetLeaderboardInput): Promise<LeaderboardResponse> {
  const result = await executeGraphQL<{ leaderboard: LeaderboardResponse }>(
    LEADERBOARD_QUERY,
    { input }
  );
  return result.leaderboard;
}

export async function getUserRanking(walletAddress: string): Promise<UserRanking> {
  const result = await executeGraphQL<{ userRanking: UserRanking }>(
    USER_RANKING_QUERY,
    { walletAddress }
  );
  return result.userRanking;
}
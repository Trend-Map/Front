export type TrendStatus = 'candidate' | 'live' | 'archived';
export type AvailabilityStatus = 'available' | 'soldout' | 'low_stock' | 'unknown';
export type StockLevel = 'plenty' | 'low' | 'out';
export type ClaimStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type UpdateType = 'available' | 'soldout' | 'restocked' | 'low_stock' | 'closed_temporarily';

export interface Trend {
  id: string;
  keyword: string;
  rank: number;
  score: number;
  growthRate: number;
  status: TrendStatus;
  description: string;
  relatedKeywords: string[];
  placeCount: number;
  postCount: number;
  searchVolume: number;
  updatedAt: string;
  category: string;
}

export interface Place {
  id: string;
  trendId: string;
  name: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  mapX: number;
  mapY: number;
  availabilityStatus: AvailabilityStatus;
  stockLevel: StockLevel;
  businessHours: string;
  claimed: boolean;
  claimStatus: ClaimStatus;
  lastUpdatedAt: string;
  tags: string[];
  notes: string;
}

export interface PlaceStatusUpdate {
  id: string;
  placeId: string;
  placeName: string;
  trendId: string;
  type: UpdateType;
  stockLevel: StockLevel;
  reportedBy: string;
  reportedAt: string;
  memo: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  hashtags: string[];
  linkedTrendIds: string[];
  linkedPlaceIds: string[];
  images: string[];
  likeCount: number;
  saveCount: number;
  shareCount: number;
  createdAt: string;
  author: string;
}

export interface Comment {
  id: string;
  postId: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface SearchRecord {
  id: string;
  query: string;
  region: string;
  clickedType: 'trend' | 'place' | 'post';
  createdAt: string;
}

export interface TrendSnapshot {
  trendId: string;
  mentionCount: number;
  reactionScore: number;
  searchScore: number;
  placeAssociationScore: number;
  generatedAt: string;
}

export interface PlaceFilters {
  district?: string;
  availabilityStatus?: AvailabilityStatus | 'all';
  sortBy?: 'recent' | 'score';
}

export interface SearchParams {
  query: string;
  region?: string;
}

export interface SearchResults {
  trends: Trend[];
  places: Place[];
  posts: Post[];
  relatedKeywords: string[];
}

export interface ClaimPayload {
  placeId: string;
  businessName: string;
  ownerName: string;
  phone: string;
  registrationNumber: string;
}

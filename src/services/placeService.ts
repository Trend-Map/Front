import { mockStore, notifyUpdate, genId } from '../data/mockData';
import type { Place, PlaceFilters, PlaceStatusUpdate, AvailabilityStatus } from '../types';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export const placeService = {
  async getPlacesByTrend(trendId: string, filters?: PlaceFilters): Promise<Place[]> {
    await delay(250);
    let result = mockStore.places.filter(p => p.trendId === trendId);

    if (filters?.district && filters.district !== 'all') {
      result = result.filter(p => p.district === filters.district);
    }
    if (filters?.availabilityStatus && filters.availabilityStatus !== 'all') {
      result = result.filter(p => p.availabilityStatus === filters.availabilityStatus);
    }
    if (filters?.sortBy === 'recent') {
      result = [...result].sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
    }
    return result;
  },

  async getPlaceById(id: string): Promise<Place | null> {
    await delay(200);
    return mockStore.places.find(p => p.id === id) ?? null;
  },

  async createPlace(payload: Omit<Place, 'id' | 'claimed' | 'claimStatus' | 'lastUpdatedAt'>): Promise<Place> {
    await delay(400);
    const newPlace: Place = {
      ...payload,
      id: genId('place'),
      claimed: false,
      claimStatus: 'none',
      lastUpdatedAt: new Date().toISOString(),
    };
    mockStore.places.push(newPlace);
    // Update trend placeCount
    const trend = mockStore.trends.find(t => t.id === payload.trendId);
    if (trend) trend.placeCount += 1;
    notifyUpdate();
    return newPlace;
  },

  async reportPlaceStatus(payload: {
    placeId: string;
    type: PlaceStatusUpdate['type'];
    stockLevel: PlaceStatusUpdate['stockLevel'];
    memo: string;
    reportedBy: string;
  }): Promise<PlaceStatusUpdate> {
    await delay(300);
    const place = mockStore.places.find(p => p.id === payload.placeId);
    if (!place) throw new Error('장소를 찾을 수 없습니다');

    const statusMap: Record<PlaceStatusUpdate['type'], AvailabilityStatus> = {
      available: 'available',
      soldout: 'soldout',
      restocked: 'available',
      low_stock: 'low_stock',
      closed_temporarily: 'soldout',
    };

    place.availabilityStatus = statusMap[payload.type];
    place.stockLevel = payload.stockLevel;
    place.lastUpdatedAt = new Date().toISOString();

    const update: PlaceStatusUpdate = {
      id: genId('upd'),
      placeId: payload.placeId,
      placeName: place.name,
      trendId: place.trendId,
      type: payload.type,
      stockLevel: payload.stockLevel,
      reportedBy: payload.reportedBy || '익명',
      reportedAt: new Date().toISOString(),
      memo: payload.memo,
    };
    mockStore.placeStatusUpdates.unshift(update);
    notifyUpdate();
    return update;
  },

  async getUpdatesForTrend(trendId: string): Promise<PlaceStatusUpdate[]> {
    await delay(200);
    return mockStore.placeStatusUpdates.filter(u => u.trendId === trendId)
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  },

  async getUpdatesForPlace(placeId: string): Promise<PlaceStatusUpdate[]> {
    await delay(200);
    return mockStore.placeStatusUpdates.filter(u => u.placeId === placeId)
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  },

  async getRecentUpdates(limit = 10): Promise<PlaceStatusUpdate[]> {
    await delay(200);
    return [...mockStore.placeStatusUpdates]
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
      .slice(0, limit);
  },
};

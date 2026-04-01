import { mockStore, notifyUpdate } from '../data/mockData';
import type { ClaimPayload, ClaimStatus } from '../types';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export const ownerService = {
  async claimPlace(payload: ClaimPayload): Promise<void> {
    await delay(500);
    const place = mockStore.places.find(p => p.id === payload.placeId);
    if (!place) throw new Error('장소를 찾을 수 없습니다');
    place.claimStatus = 'pending';
    notifyUpdate();
  },

  async getClaimStatus(placeId: string): Promise<ClaimStatus> {
    await delay(200);
    const place = mockStore.places.find(p => p.id === placeId);
    return place?.claimStatus ?? 'none';
  },
};

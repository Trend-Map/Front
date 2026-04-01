import { mockStore } from '../data/mockData';
import type { Trend } from '../types';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export const trendService = {
  async getTopTrends(): Promise<Trend[]> {
    await delay(300);
    return mockStore.trends.filter(t => t.status === 'live').sort((a, b) => a.rank - b.rank);
  },

  async getTrendById(id: string): Promise<Trend | null> {
    await delay(200);
    return mockStore.trends.find(t => t.id === id) ?? null;
  },

  async getTrendRelatedPosts(trendId: string) {
    await delay(250);
    return mockStore.posts.filter(p => p.linkedTrendIds.includes(trendId));
  },
};

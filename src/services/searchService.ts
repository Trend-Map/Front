import { mockStore } from '../data/mockData';
import type { SearchParams, SearchResults } from '../types';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function normalize(str: string) { return str.toLowerCase().replace(/\s+/g, ''); }

export const searchService = {
  async searchAll(params: SearchParams): Promise<SearchResults> {
    await delay(350);
    const q = normalize(params.query);
    if (!q) return { trends: [], places: [], posts: [], relatedKeywords: [] };

    const trends = mockStore.trends.filter(t =>
      normalize(t.keyword).includes(q) ||
      t.relatedKeywords.some(k => normalize(k).includes(q)) ||
      normalize(t.description).includes(q)
    );

    const places = mockStore.places.filter(p =>
      normalize(p.name).includes(q) ||
      normalize(p.address).includes(q) ||
      normalize(p.district).includes(q) ||
      p.tags.some(tag => normalize(tag).includes(q))
    );

    const posts = mockStore.posts.filter(p =>
      normalize(p.title).includes(q) ||
      normalize(p.body).includes(q) ||
      p.hashtags.some(h => normalize(h).includes(q))
    );

    // Collect related keywords from matched trends
    const relatedKeywords = Array.from(
      new Set(trends.flatMap(t => t.relatedKeywords))
    ).filter(k => normalize(k) !== q).slice(0, 8);

    return { trends, places, posts, relatedKeywords };
  },

  async getPopularQueries(): Promise<string[]> {
    await delay(150);
    const freq: Record<string, number> = {};
    mockStore.searchRecords.forEach(r => {
      freq[r.query] = (freq[r.query] ?? 0) + 1;
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([q]) => q)
      .slice(0, 10);
  },
};

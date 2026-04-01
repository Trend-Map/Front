import { mockStore, notifyUpdate, genId } from '../data/mockData';
import type { Post, Comment } from '../types';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export const communityService = {
  async getPosts(params?: { linkedTrendId?: string; sortBy?: 'recent' | 'popular' }): Promise<Post[]> {
    await delay(300);
    let result = [...mockStore.posts];
    if (params?.linkedTrendId) {
      result = result.filter(p => p.linkedTrendIds.includes(params.linkedTrendId!));
    }
    if (params?.sortBy === 'popular') {
      result.sort((a, b) => (b.likeCount + b.saveCount) - (a.likeCount + a.saveCount));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  },

  async getPostById(id: string): Promise<Post | null> {
    await delay(200);
    return mockStore.posts.find(p => p.id === id) ?? null;
  },

  async createPost(payload: {
    title: string;
    body: string;
    hashtags: string[];
    linkedTrendIds: string[];
    linkedPlaceIds: string[];
    author: string;
  }): Promise<Post> {
    await delay(400);
    const newPost: Post = {
      id: genId('post'),
      ...payload,
      images: [],
      likeCount: 0,
      saveCount: 0,
      shareCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockStore.posts.unshift(newPost);
    // Update linked trend postCounts
    payload.linkedTrendIds.forEach(trendId => {
      const trend = mockStore.trends.find(t => t.id === trendId);
      if (trend) trend.postCount += 1;
    });
    notifyUpdate();
    return newPost;
  },

  async createComment(payload: { postId: string; body: string; author: string }): Promise<Comment> {
    await delay(300);
    const comment: Comment = {
      id: genId('cmt'),
      postId: payload.postId,
      body: payload.body,
      author: payload.author || '익명',
      createdAt: new Date().toISOString(),
    };
    mockStore.comments.push(comment);
    notifyUpdate();
    return comment;
  },

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    await delay(200);
    return mockStore.comments.filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async toggleReaction(postId: string, type: 'like' | 'save' | 'share'): Promise<Post> {
    await delay(100);
    const post = mockStore.posts.find(p => p.id === postId);
    if (!post) throw new Error('게시글을 찾을 수 없습니다');
    if (type === 'like') post.likeCount += 1;
    if (type === 'save') post.saveCount += 1;
    if (type === 'share') post.shareCount += 1;
    notifyUpdate();
    return post;
  },
};

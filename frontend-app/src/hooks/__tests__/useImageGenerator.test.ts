import { renderHook, act } from '@testing-library/react';
import { useImageGenerator, useBulkImageGenerator } from '../useImageGenerator';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('useImageGenerator Hook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useImageGenerator());
    
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generatedImage).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.progress).toBe(0);
  });

  it('generates image successfully', async () => {
    const mockImageUrl = 'data:image/jpeg;base64,testimage';
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        imageUrl: mockImageUrl,
        prompt: 'test prompt',
        settings: {}
      })
    } as Response);

    const { result } = renderHook(() => useImageGenerator());
    
    let generationResult;
    await act(async () => {
      generationResult = await result.current.generateImage({
        title: 'Test Title',
        content: 'Test Content'
      });
    });
    
    expect(generationResult).toEqual({
      imageUrl: mockImageUrl,
      prompt: 'test prompt',
      settings: {}
    });
    expect(result.current.generatedImage).toBe(mockImageUrl);
    expect(result.current.isGenerating).toBe(false);
  });

  it('handles generation errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Generation failed'
      })
    } as Response);

    const { result } = renderHook(() => useImageGenerator());
    
    let generationResult;
    await act(async () => {
      generationResult = await result.current.generateImage({
        title: 'Test Title'
      });
    });
    
    expect(generationResult).toBe(null);
    expect(result.current.error).toBe('Generation failed');
    expect(result.current.isGenerating).toBe(false);
  });

  it('validates required title', async () => {
    const { result } = renderHook(() => useImageGenerator());
    
    let generationResult;
    await act(async () => {
      generationResult = await result.current.generateImage({
        title: ''
      });
    });
    
    expect(generationResult).toBe(null);
    expect(result.current.error).toBe('Title is required for image generation');
  });

  it('calls success callback on successful generation', async () => {
    const mockCallback = jest.fn();
    const mockImageUrl = 'data:image/jpeg;base64,testimage';
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        imageUrl: mockImageUrl,
        prompt: 'test prompt',
        settings: {}
      })
    } as Response);

    const { result } = renderHook(() => useImageGenerator({
      onSuccess: mockCallback
    }));
    
    await act(async () => {
      await result.current.generateImage({
        title: 'Test Title'
      });
    });
    
    expect(mockCallback).toHaveBeenCalledWith(mockImageUrl);
  });

  it('calls error callback on generation failure', async () => {
    const mockCallback = jest.fn();
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Generation failed'
      })
    } as Response);

    const { result } = renderHook(() => useImageGenerator({
      onError: mockCallback
    }));
    
    await act(async () => {
      await result.current.generateImage({
        title: 'Test Title'
      });
    });
    
    expect(mockCallback).toHaveBeenCalledWith('Generation failed');
  });

  it('clears error and image', () => {
    const { result } = renderHook(() => useImageGenerator());
    
    // Set some initial state
    act(() => {
      result.current.clearError();
      result.current.clearImage();
    });
    
    expect(result.current.error).toBe(null);
    expect(result.current.generatedImage).toBe(null);
  });

  it('generates post image successfully', async () => {
    const mockResponse = {
      postId: 123,
      imageUrl: 'test-image-url',
      prompt: 'test prompt',
      status: 'generated'
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    const { result } = renderHook(() => useImageGenerator());
    
    let generationResult;
    await act(async () => {
      generationResult = await result.current.generatePostImage({
        postId: 123,
        title: 'Test Post',
        content: 'Test Content'
      });
    });
    
    expect(generationResult).toEqual(mockResponse);
  });
});

describe('useBulkImageGenerator Hook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useBulkImageGenerator());
    
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.processedCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.currentPost).toBe(null);
    expect(result.current.errors).toEqual([]);
    expect(result.current.progress).toBe(0);
  });

  it('processes bulk generation successfully', async () => {
    const mockPosts = [
      { id: 1, title: { rendered: 'Post 1' }, content: { rendered: 'Content 1' }, excerpt: { rendered: 'Excerpt 1' } },
      { id: 2, title: { rendered: 'Post 2' }, content: { rendered: 'Content 2' }, excerpt: { rendered: 'Excerpt 2' } }
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, postId: 1, imageUrl: 'url1' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, postId: 2, imageUrl: 'url2' })
      } as Response);

    const { result } = renderHook(() => useBulkImageGenerator());
    
    let bulkResult;
    await act(async () => {
      bulkResult = await result.current.processBulkGeneration(mockPosts);
    });
    
    expect(result.current.processedCount).toBe(2);
    expect(result.current.totalCount).toBe(2);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.progress).toBe(100);
  });

  it('handles errors during bulk processing', async () => {
    const mockPosts = [
      { id: 1, title: { rendered: 'Post 1' }, content: { rendered: 'Content 1' }, excerpt: { rendered: 'Excerpt 1' } }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Generation failed' })
    } as Response);

    const { result } = renderHook(() => useBulkImageGenerator());
    
    await act(async () => {
      await result.current.processBulkGeneration(mockPosts);
    });
    
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0]).toEqual({
      postId: 1,
      error: 'Generation failed'
    });
  });

  it('resets bulk state', () => {
    const { result } = renderHook(() => useBulkImageGenerator());
    
    act(() => {
      result.current.resetBulkState();
    });
    
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.processedCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.currentPost).toBe(null);
    expect(result.current.errors).toEqual([]);
  });
});
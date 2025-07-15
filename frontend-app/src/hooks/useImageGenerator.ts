'use client';

import { useState, useCallback } from 'react';

interface GenerationSettings {
  style: string;
  aspectRatio: string;
  quality: string;
  includeText: boolean;
}

interface UseImageGeneratorOptions {
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

interface GenerateImageParams {
  title: string;
  content?: string;
  settings?: Partial<GenerationSettings>;
}

interface GeneratePostImageParams {
  postId: number;
  title: string;
  content: string;
  excerpt?: string;
}

export function useImageGenerator(options: UseImageGeneratorOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const defaultSettings: GenerationSettings = {
    style: 'photorealistic',
    aspectRatio: '16:9',
    quality: 'high',
    includeText: false
  };

  const generateImage = useCallback(async ({ title, content, settings }: GenerateImageParams) => {
    if (!title?.trim()) {
      const errorMsg = 'Title is required for image generation';
      setError(errorMsg);
      options.onError?.(errorMsg);
      return null;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setGeneratedImage(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content?.trim() || '',
          settings: { ...defaultSettings, ...settings }
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.imageUrl);
      options.onSuccess?.(data.imageUrl);
      
      return {
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        settings: data.settings
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMsg);
      options.onError?.(errorMsg);
      return null;
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [options]);

  const generatePostImage = useCallback(async ({ postId, title, content, excerpt }: GeneratePostImageParams) => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85));
      }, 800);

      const response = await fetch('/api/generate-post-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          title,
          content,
          excerpt
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate post image');
      }

      return {
        postId: data.postId,
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        status: data.status
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate post image';
      setError(errorMsg);
      options.onError?.(errorMsg);
      return null;
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearImage = useCallback(() => {
    setGeneratedImage(null);
  }, []);

  return {
    // State
    isGenerating,
    generatedImage,
    error,
    progress,
    
    // Actions
    generateImage,
    generatePostImage,
    clearError,
    clearImage,
    
    // Utils
    defaultSettings
  };
}

// Hook for bulk image generation
export function useBulkImageGenerator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPost, setCurrentPost] = useState<string | null>(null);
  const [errors, setErrors] = useState<Array<{ postId: number; error: string }>>([]);

  const processBulkGeneration = useCallback(async (posts: any[]) => {
    setIsProcessing(true);
    setProcessedCount(0);
    setTotalCount(posts.length);
    setErrors([]);

    const results = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      setCurrentPost(post.title.rendered);

      try {
        const response = await fetch('/api/generate-post-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: post.id,
            title: post.title.rendered,
            content: post.content.rendered,
            excerpt: post.excerpt.rendered
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate image');
        }

        results.push(data);
        setProcessedCount(i + 1);

        // Add a small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error generating image for post ${post.id}:`, error);
        setErrors(prev => [...prev, {
          postId: post.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }]);
        setProcessedCount(i + 1);
      }
    }

    setIsProcessing(false);
    setCurrentPost(null);
    
    return {
      results,
      errors: errors,
      processed: processedCount,
      total: totalCount
    };
  }, [errors, processedCount, totalCount]);

  const resetBulkState = useCallback(() => {
    setIsProcessing(false);
    setProcessedCount(0);
    setTotalCount(0);
    setCurrentPost(null);
    setErrors([]);
  }, []);

  return {
    // State
    isProcessing,
    processedCount,
    totalCount,
    currentPost,
    errors,
    progress: totalCount > 0 ? (processedCount / totalCount) * 100 : 0,
    
    // Actions
    processBulkGeneration,
    resetBulkState
  };
}
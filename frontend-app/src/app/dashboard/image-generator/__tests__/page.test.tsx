import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageGeneratorPage from '../page';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'admin', isAdmin: true },
    useRequireAuth: jest.fn()
  })
}));

// Mock the ImageGenerator component
jest.mock('@/components/ImageGenerator/ImageGenerator', () => {
  return function MockImageGenerator() {
    return <div data-testid="image-generator">Image Generator Component</div>;
  };
});

// Mock fetch globally
global.fetch = jest.fn();
global.alert = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockAlert = alert as jest.MockedFunction<typeof alert>;

describe('ImageGeneratorPage', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockAlert.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the image generator page', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        posts: [],
        total: 0
      })
    } as Response);

    render(<ImageGeneratorPage />);
    
    expect(screen.getByText('AI Image Generator')).toBeInTheDocument();
    expect(screen.getByText('Single Image Generator')).toBeInTheDocument();
    expect(screen.getByTestId('image-generator')).toBeInTheDocument();
  });

  it('displays statistics cards', async () => {
    const mockPosts = [
      {
        id: 1,
        title: { rendered: 'Test Post 1' },
        date: '2024-01-01',
        featured_image_url: 'https://picsum.photos/600/400',
        needs_image: true,
        placeholder_type: 'picsum'
      },
      {
        id: 2,
        title: { rendered: 'Test Post 2' },
        date: '2024-01-02',
        featured_image_url: 'https://picsum.photos/600/400',
        needs_image: true,
        placeholder_type: 'picsum'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        posts: mockPosts,
        total: 2
      })
    } as Response);

    render(<ImageGeneratorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Posts with Placeholders
      expect(screen.getByText('0')).toBeInTheDocument(); // Images Generated
    });
  });

  it('displays posts needing images in table', async () => {
    const mockPosts = [
      {
        id: 1,
        title: { rendered: 'Test Post 1' },
        date: '2024-01-01T00:00:00Z',
        featured_image_url: 'https://picsum.photos/600/400',
        needs_image: true,
        placeholder_type: 'picsum'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        posts: mockPosts,
        total: 1
      })
    } as Response);

    render(<ImageGeneratorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Placeholder')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    });
  });

  it('handles individual post image generation', async () => {
    const mockPosts = [
      {
        id: 1,
        title: { rendered: 'Test Post 1' },
        date: '2024-01-01T00:00:00Z',
        featured_image_url: 'https://picsum.photos/600/400',
        needs_image: true,
        placeholder_type: 'picsum'
      }
    ];

    // Mock initial posts fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        posts: mockPosts,
        total: 1
      })
    } as Response);

    // Mock image generation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        postId: 1,
        imageUrl: 'generated-image-url',
        status: 'generated'
      })
    } as Response);

    render(<ImageGeneratorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/generate-post-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: 1,
          title: 'Test Post 1',
          content: '',
          excerpt: ''
        }),
      });
    });
  });

  it('handles bulk generation', async () => {
    const mockPosts = [
      {
        id: 1,
        title: { rendered: 'Test Post 1' },
        date: '2024-01-01T00:00:00Z',
        featured_image_url: 'https://picsum.photos/600/400',
        needs_image: true,
        placeholder_type: 'picsum'
      },
      {
        id: 2,
        title: { rendered: 'Test Post 2' },
        date: '2024-01-02T00:00:00Z',
        featured_image_url: 'https://picsum.photos/600/400',
        needs_image: true,
        placeholder_type: 'picsum'
      }
    ];

    // Mock initial posts fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        posts: mockPosts,
        total: 2
      })
    } as Response);

    // Mock bulk generation responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, postId: 1, imageUrl: 'url1' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, postId: 2, imageUrl: 'url2' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          posts: [], // All posts now have images
          total: 0
        })
      } as Response);

    render(<ImageGeneratorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Bulk Generate (2 posts)')).toBeInTheDocument();
    });

    const bulkButton = screen.getByRole('button', { name: /bulk generate/i });
    fireEvent.click(bulkButton);

    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const mockPosts = [
      {
        id: 1,
        title: { rendered: 'Test Post 1' },
        date: '2024-01-01T00:00:00Z',
        featured_image_url: 'https://picsum.photos/600/400',
        needs_image: true,
        placeholder_type: 'picsum'
      }
    ];

    // Mock initial posts fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        posts: mockPosts,
        total: 1
      })
    } as Response);

    // Mock failed image generation
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Generation failed'
      })
    } as Response);

    render(<ImageGeneratorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    const generateButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to generate image: Generation failed');
    });
  });

  it('shows success message when no posts need images', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        posts: [],
        total: 0
      })
    } as Response);

    render(<ImageGeneratorPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/all posts have proper featured images/i)).toBeInTheDocument();
    });
  });

  it('handles refresh posts functionality', async () => {
    // Initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        posts: [],
        total: 0
      })
    } as Response);

    // Refresh fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        posts: [],
        total: 0
      })
    } as Response);

    render(<ImageGeneratorPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('disables buttons during bulk processing', async () => {
    const mockPosts = [
      {
        id: 1,
        title: { rendered: 'Test Post 1' },
        date: '2024-01-01T00:00:00Z',
        featured_image_url: 'https://picsum.photos/600/400',
        needs_image: true,
        placeholder_type: 'picsum'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        posts: mockPosts,
        total: 1
      })
    } as Response);

    // Mock slow generation response
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, postId: 1, imageUrl: 'url1' })
        } as Response), 100)
      )
    );

    render(<ImageGeneratorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Bulk Generate (1 posts)')).toBeInTheDocument();
    });

    const bulkButton = screen.getByRole('button', { name: /bulk generate/i });
    fireEvent.click(bulkButton);

    // Check that individual generate button is disabled during bulk processing
    const individualButton = screen.getByRole('button', { name: /^generate$/i });
    expect(individualButton).toBeDisabled();
  });
});
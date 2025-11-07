import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageGenerator from '../ImageGenerator';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ImageGenerator Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the image generator form', () => {
    render(<ImageGenerator />);
    
    expect(screen.getByLabelText(/post title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/post content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
  });

  it('shows error when title is empty', async () => {
    render(<ImageGenerator />);
    
    const generateButton = screen.getByRole('button', { name: /generate image/i });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a title/i)).toBeInTheDocument();
    });
  });

  it('disables generate button when generating', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        imageUrl: 'data:image/jpeg;base64,test',
        prompt: 'test prompt'
      })
    } as Response);

    render(<ImageGenerator />);
    
    const titleInput = screen.getByLabelText(/post title/i);
    const generateButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.click(generateButton);
    
    expect(generateButton).toBeDisabled();
    expect(screen.getByText(/generating image/i)).toBeInTheDocument();
  });

  it('displays generated image on successful generation', async () => {
    const mockImageUrl = 'data:image/jpeg;base64,testimage';
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        imageUrl: mockImageUrl,
        prompt: 'test prompt'
      })
    } as Response);

    render(<ImageGenerator />);
    
    const titleInput = screen.getByLabelText(/post title/i);
    const generateButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      const generatedImage = screen.getByAltText(/generated image/i);
      expect(generatedImage).toBeInTheDocument();
      expect(generatedImage).toHaveAttribute('src', mockImageUrl);
    });
  });

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'API Error'
      })
    } as Response);

    render(<ImageGenerator />);
    
    const titleInput = screen.getByLabelText(/post title/i);
    const generateButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
  });

  it('allows changing generation settings', () => {
    render(<ImageGenerator />);
    
    const styleSelect = screen.getByLabelText(/style/i);
    const aspectRatioSelect = screen.getByLabelText(/aspect ratio/i);
    const qualitySelect = screen.getByLabelText(/quality/i);
    
    fireEvent.change(styleSelect, { target: { value: 'illustration' } });
    fireEvent.change(aspectRatioSelect, { target: { value: '1:1' } });
    fireEvent.change(qualitySelect, { target: { value: 'ultra' } });
    
    expect(styleSelect).toHaveValue('illustration');
    expect(aspectRatioSelect).toHaveValue('1:1');
    expect(qualitySelect).toHaveValue('ultra');
  });

  it('calls onImageGenerated callback when provided', async () => {
    const mockCallback = jest.fn();
    const mockImageUrl = 'data:image/jpeg;base64,testimage';
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        imageUrl: mockImageUrl,
        prompt: 'test prompt'
      })
    } as Response);

    render(<ImageGenerator onImageGenerated={mockCallback} />);
    
    const titleInput = screen.getByLabelText(/post title/i);
    const generateButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(mockImageUrl);
    });
  });

  it('sends correct API request with settings', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        imageUrl: 'data:image/jpeg;base64,test',
        prompt: 'test prompt'
      })
    } as Response);

    render(<ImageGenerator />);
    
    const titleInput = screen.getByLabelText(/post title/i);
    const contentInput = screen.getByLabelText(/post content/i);
    const styleSelect = screen.getByLabelText(/style/i);
    const generateButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });
    fireEvent.change(styleSelect, { target: { value: 'illustration' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Title',
          content: 'Test Content',
          settings: {
            style: 'illustration',
            aspectRatio: '16:9',
            quality: 'high',
            includeText: false
          }
        }),
      });
    });
  });

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ImageGenerator />);
    
    const titleInput = screen.getByLabelText(/post title/i);
    const generateButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('shows download and copy buttons when image is generated', async () => {
    const mockImageUrl = 'data:image/jpeg;base64,testimage';
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        imageUrl: mockImageUrl,
        prompt: 'test prompt'
      })
    } as Response);

    render(<ImageGenerator />);
    
    const titleInput = screen.getByLabelText(/post title/i);
    const generateButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download image/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy url/i })).toBeInTheDocument();
    });
  });
});

describe('ImageGenerator Props', () => {
  it('initializes with provided postTitle and postContent', () => {
    render(
      <ImageGenerator 
        postTitle="Initial Title" 
        postContent="Initial Content" 
      />
    );
    
    expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ImageGenerator className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
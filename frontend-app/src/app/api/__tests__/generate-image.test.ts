import { NextRequest } from 'next/server';
import { POST } from '../generate-image/route';

// Mock environment variables
process.env.HUGGINGFACE_API_TOKEN = 'test-token';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('/api/generate-image', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('generates image successfully with valid input', async () => {
    const requestBody = {
      title: 'Climate Change Impact',
      content: 'Article about environmental issues',
      settings: {
        style: 'photorealistic',
        aspectRatio: '16:9',
        quality: 'high',
        includeText: false
      }
    };

    const request = new NextRequest('http://localhost:3000/api/generate-image', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.imageUrl).toBeDefined();
    expect(data.prompt).toContain('Climate Change Impact');
    expect(data.settings).toEqual(requestBody.settings);
  });

  it('returns error when title is missing', async () => {
    const requestBody = {
      title: '',
      settings: {
        style: 'photorealistic',
        aspectRatio: '16:9',
        quality: 'high',
        includeText: false
      }
    };

    const request = new NextRequest('http://localhost:3000/api/generate-image', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Title is required');
  });

  it('generates appropriate prompt for environmental content', async () => {
    const requestBody = {
      title: 'Climate Change and Agriculture',
      content: 'Environmental conservation and sustainable farming practices',
      settings: {
        style: 'photorealistic',
        aspectRatio: '16:9',
        quality: 'high',
        includeText: false
      }
    };

    const request = new NextRequest('http://localhost:3000/api/generate-image', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.prompt).toContain('environmental conservation');
    expect(data.prompt).toContain('nature');
    expect(data.prompt).toContain('sustainability');
  });

  it('generates appropriate prompt for media content', async () => {
    const requestBody = {
      title: 'Journalism in the Digital Age',
      content: 'Media coverage and news reporting trends',
      settings: {
        style: 'photorealistic',
        aspectRatio: '16:9',
        quality: 'high',
        includeText: false
      }
    };

    const request = new NextRequest('http://localhost:3000/api/generate-image', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.prompt).toContain('journalism');
    expect(data.prompt).toContain('newsroom');
    expect(data.prompt).toContain('media coverage');
  });

  it('applies different style modifiers correctly', async () => {
    const styles = ['photorealistic', 'illustration', 'abstract', 'minimalist'];
    
    for (const style of styles) {
      const requestBody = {
        title: 'Test Title',
        settings: {
          style,
          aspectRatio: '16:9',
          quality: 'high',
          includeText: false
        }
      };

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.prompt).toContain(style === 'photorealistic' ? 'photorealistic' : style);
    }
  });

  it('handles different aspect ratios', async () => {
    const aspectRatios = ['16:9', '4:3', '1:1', '9:16'];
    
    for (const aspectRatio of aspectRatios) {
      const requestBody = {
        title: 'Test Title',
        settings: {
          style: 'photorealistic',
          aspectRatio,
          quality: 'high',
          includeText: false
        }
      };

      const request = new NextRequest('http://localhost:3000/api/generate-image', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.settings.aspectRatio).toBe(aspectRatio);
    }
  });

  it('handles malformed JSON request', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-image', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to generate image');
  });
});
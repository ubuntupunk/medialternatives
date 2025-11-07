'use client';

import React, { useState } from 'react';

/**
 * Image generation settings interface
 * @typedef {Object} GenerationSettings
 * @property {string} style - Image style (photorealistic, illustration, abstract, etc.)
 * @property {string} aspectRatio - Image aspect ratio (16:9, 4:3, 1:1, etc.)
 * @property {string} quality - Generation quality (low, medium, high, ultra)
 * @property {boolean} includeText - Whether to include text in the image
 */

/**
 * Image generator props interface
 * @typedef {Object} ImageGeneratorProps
 * @property {string} [postTitle=''] - Initial title for image generation
 * @property {string} [postContent=''] - Initial content for context
 * @property {Function} [onImageGenerated] - Callback when image is generated
 * @property {string} [className=''] - Additional CSS classes
 */

/**
 * AI-Powered Image Generator Component
 *
 * Interactive component for generating images using AI based on text content.
 * Supports various styles, aspect ratios, and quality settings.
 * Integrates with Hugging Face API for image generation.
 *
 * @component
 * @param {ImageGeneratorProps} props - Component props
 * @returns {JSX.Element} The rendered image generator interface
 *
 * @example
 * ```tsx
 * <ImageGenerator
 *   postTitle="Beautiful Sunset"
 *   postContent="A stunning sunset over the ocean waves"
 *   onImageGenerated={(url) => console.log('Image generated:', url)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom settings
 * const [settings, setSettings] = useState({
 *   style: 'photorealistic',
 *   aspectRatio: '16:9',
 *   quality: 'high',
 *   includeText: false
 * });
 *
 * <ImageGenerator
 *   postTitle={post.title}
 *   postContent={post.content}
 *   className="my-image-generator"
 * />
 * ```
 */
const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  postTitle = '',
  postContent = '',
  onImageGenerated,
  className = ''
}) => {
  const [title, setTitle] = useState(postTitle);
  const [content, setContent] = useState(postContent);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [settings, setSettings] = useState<GenerationSettings>({
    style: 'photorealistic',
    aspectRatio: '16:9',
    quality: 'high',
    includeText: false
  });

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError('Please enter a title for the image');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedImageUrl('');

    try {
      const response = await fetch('/api/generate-image-hf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          settings
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImageUrl(data.imageUrl);
      
      if (onImageGenerated) {
        onImageGenerated(data.imageUrl);
      }

    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_generated.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyUrl = async () => {
    if (generatedImageUrl) {
      try {
        await navigator.clipboard.writeText(generatedImageUrl);
        // You could add a toast notification here
        alert('Image URL copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  return (
    <div className={`image-generator ${className}`}>
      <div className="row">
        {/* Input Section */}
        <div className="col-lg-6 mb-4">
          <div className="mb-3">
            <label htmlFor="imageTitle" className="form-label">
              <strong>Post Title</strong>
            </label>
            <input
              type="text"
              className="form-control"
              id="imageTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the post title..."
              maxLength={100}
            />
            <div className="form-text">
              This will be used to generate relevant imagery
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="imageContent" className="form-label">
              <strong>Post Content/Description</strong>
            </label>
            <textarea
              className="form-control"
              id="imageContent"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter post content or description for better context..."
              maxLength={500}
            />
            <div className="form-text">
              Optional: Provide context for more accurate image generation
            </div>
          </div>

          {/* Generation Settings */}
          <div className="card mb-3">
            <div className="card-header">
              <h6 className="mb-0">Generation Settings</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="imageStyle" className="form-label">Style</label>
                  <select
                    className="form-select"
                    id="imageStyle"
                    value={settings.style}
                    onChange={(e) => setSettings({...settings, style: e.target.value})}
                  >
                    <option value="photorealistic">Photorealistic</option>
                    <option value="illustration">Illustration</option>
                    <option value="abstract">Abstract</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="vintage">Vintage</option>
                    <option value="modern">Modern</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="aspectRatio" className="form-label">Aspect Ratio</label>
                  <select
                    className="form-select"
                    id="aspectRatio"
                    value={settings.aspectRatio}
                    onChange={(e) => setSettings({...settings, aspectRatio: e.target.value})}
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="4:3">4:3 (Standard)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="quality" className="form-label">Quality</label>
                  <select
                    className="form-select"
                    id="quality"
                    value={settings.quality}
                    onChange={(e) => setSettings({...settings, quality: e.target.value})}
                  >
                    <option value="standard">Standard</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="includeText"
                      checked={settings.includeText}
                      onChange={(e) => setSettings({...settings, includeText: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="includeText">
                      Include title text in image
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg w-100"
            onClick={handleGenerate}
            disabled={isGenerating || !title.trim()}
          >
            {isGenerating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generating Image...
              </>
            ) : (
              <>
                <i className="bi bi-magic me-2"></i>
                Generate Image
              </>
            )}
          </button>

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h6 className="mb-0">Generated Image Preview</h6>
            </div>
            <div className="card-body d-flex flex-column">
              {generatedImageUrl ? (
                <>
                  <div className="mb-3 flex-grow-1 d-flex align-items-center justify-content-center">
                    <img
                      src={generatedImageUrl}
                      alt="Generated image"
                      className="img-fluid rounded shadow"
                      style={{ maxHeight: '300px', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-success"
                      onClick={handleDownload}
                    >
                      <i className="bi bi-download me-2"></i>
                      Download Image
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleCopyUrl}
                    >
                      <i className="bi bi-clipboard me-2"></i>
                      Copy URL
                    </button>
                  </div>
                </>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                  <i className="bi bi-image display-1 mb-3"></i>
                  <p className="text-center">
                    {isGenerating 
                      ? 'Generating your custom image...' 
                      : 'Generated image will appear here'
                    }
                  </p>
                  {isGenerating && (
                    <div className="progress w-100 mt-3">
                      <div 
                        className="progress-bar progress-bar-striped progress-bar-animated" 
                        role="progressbar" 
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
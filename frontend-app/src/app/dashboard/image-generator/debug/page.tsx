'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ImageGeneratorDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testPrompt, setTestPrompt] = useState('Climate change and environmental activism');
  const [loading, setLoading] = useState(false);

  const testImageGeneration = async () => {
    setLoading(true);
    setDebugInfo(null);

    try {
      console.log('Testing image generation with prompt:', testPrompt);
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: testPrompt,
          content: 'Test content for debugging image generation system',
          settings: {
            style: 'photorealistic',
            aspectRatio: '16:9',
            quality: 'high',
            includeText: false
          }
        }),
      });

      const data = await response.json();
      
      setDebugInfo({
        response: data,
        status: response.status,
        timestamp: new Date().toISOString(),
        prompt: testPrompt
      });

    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        prompt: testPrompt
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironment = () => {
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      hasHfToken: !!process.env.HUGGINGFACE_API_TOKEN,
      timestamp: new Date().toISOString()
    };
    
    setDebugInfo({
      environment: envInfo,
      note: 'Environment check completed'
    });
  };

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/dashboard/image-generator">Image Generator</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Debug
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h2 text-balance">
            <i className="bi bi-bug me-2 text-warning"></i>
            Image Generator Debug Console
          </h1>
          <p className="text-muted">
            Debug and test the AI image generation system
          </p>
        </div>
      </div>

      {/* Test Controls */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Test Image Generation</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="testPrompt" className="form-label">Test Prompt</label>
                <input
                  type="text"
                  className="form-control"
                  id="testPrompt"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter a test prompt..."
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={testImageGeneration}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Testing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-play me-2"></i>
                      Test Generation
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={checkEnvironment}
                >
                  <i className="bi bi-gear me-2"></i>
                  Check Environment
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">System Info</h6>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <strong>Model:</strong><br />
                <code>black-forest-labs/FLUX.1-dev</code>
              </div>
              <div className="mb-2">
                <strong>API:</strong><br />
                Hugging Face Inference
              </div>
              <div className="mb-2">
                <strong>Fallback:</strong><br />
                Picsum placeholder images
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Output */}
      {debugInfo && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Debug Output</h5>
                <small className="text-muted">
                  {debugInfo.timestamp}
                </small>
              </div>
              <div className="card-body">
                <pre className="bg-light p-3 rounded" style={{ fontSize: '0.875rem', maxHeight: '500px', overflow: 'auto' }}>
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
                
                {debugInfo.response?.imageUrl && (
                  <div className="mt-3">
                    <h6>Generated Image:</h6>
                    <img 
                      src={debugInfo.response.imageUrl} 
                      alt="Generated test image"
                      className="img-fluid rounded"
                      style={{ maxWidth: '400px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Debug Instructions</h6>
            </div>
            <div className="card-body">
              <h6>To enable live AI generation:</h6>
              <ol>
                <li>Get a Hugging Face API token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">huggingface.co/settings/tokens</a></li>
                <li>Add <code>HUGGINGFACE_API_TOKEN=your_token_here</code> to your <code>.env</code> file</li>
                <li>Restart the development server</li>
                <li>Test generation using the form above</li>
              </ol>
              
              <h6 className="mt-3">Current Status:</h6>
              <ul>
                <li><strong>Prompt Generation:</strong> ✅ Working - Creates content-aware prompts</li>
                <li><strong>AI Integration:</strong> ⚠️ Requires HF token for live generation</li>
                <li><strong>Fallback Images:</strong> ✅ Working - Uses themed placeholders</li>
                <li><strong>WordPress Integration:</strong> 🚧 Not implemented - images not saved to posts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
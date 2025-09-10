'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const ImageGeneratorDebugPage: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testPrompt, setTestPrompt] = useState('Climate change and environmental activism');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('black-forest-labs/FLUX.1-dev');
  const [customModel, setCustomModel] = useState('');
  const [testType, setTestType] = useState('image'); // 'image' or 'text'

  const testImageGeneration = async () => {
    setLoading(true);
    setDebugInfo(null);

    try {
      console.log('Testing image generation with prompt:', testPrompt);
      
      const response = await fetch('/api/generate-image-hf', {
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
              <div className="row">
                <div className="col-md-6 mb-3">
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
                <div className="col-md-6 mb-3">
                  <label htmlFor="testType" className="form-label">Test Type</label>
                  <select
                    className="form-select"
                    id="testType"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                  >
                    <option value="image">Image Generation</option>
                    <option value="text">Text Generation</option>
                  </select>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label htmlFor="modelSelect" className="form-label">Model Selection</label>
                  <select
                    className="form-select"
                    id="modelSelect"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    <optgroup label="Image Generation Models">
                      <option value="black-forest-labs/FLUX.1-dev">FLUX.1-dev (Latest)</option>
                      <option value="stabilityai/stable-diffusion-2-1">Stable Diffusion 2.1</option>
                      <option value="runwayml/stable-diffusion-v1-5">Stable Diffusion 1.5</option>
                      <option value="stabilityai/stable-diffusion-xl-base-1.0">SDXL Base 1.0</option>
                      <option value="prompthero/openjourney">OpenJourney</option>
                    </optgroup>
                    <optgroup label="Text Generation Models">
                      <option value="microsoft/DialoGPT-medium">DialoGPT Medium</option>
                      <option value="facebook/blenderbot-400M-distill">BlenderBot 400M</option>
                      <option value="google/flan-t5-base">FLAN-T5 Base</option>
                      <option value="distilbert-base-uncased">DistilBERT</option>
                    </optgroup>
                    <optgroup label="Custom">
                      <option value="custom">Custom Model...</option>
                    </optgroup>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="customModel" className="form-label">Custom Model</label>
                  <input
                    type="text"
                    className="form-control"
                    id="customModel"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="owner/model-name"
                    disabled={selectedModel !== 'custom'}
                  />
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
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
                <button
                  className="btn btn-outline-warning"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const response = await fetch('/api/test-hf-simple');
                      const data = await response.json();
                      setDebugInfo({
                        tokenValidation: data,
                        timestamp: new Date().toISOString(),
                        note: 'HF Token validation test'
                      });
                    } catch (error) {
                      setDebugInfo({
                        error: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: new Date().toISOString(),
                        note: 'Token validation failed'
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-shield-check me-2"></i>
                  Test Token
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const modelToTest = selectedModel === 'custom' ? customModel : selectedModel;
                      const response = await fetch('/api/test-model-direct', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          model: modelToTest,
                          prompt: testPrompt,
                          type: testType
                        }),
                      });
                      const data = await response.json();
                      setDebugInfo({
                        modelTest: data,
                        testedModel: modelToTest,
                        testType: testType,
                        timestamp: new Date().toISOString(),
                        note: `Direct model test: ${modelToTest}`
                      });
                    } catch (error) {
                      setDebugInfo({
                        error: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: new Date().toISOString(),
                        note: 'Model test failed'
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || (selectedModel === 'custom' && !customModel.trim())}
                >
                  <i className="bi bi-robot me-2"></i>
                  Test Selected Model
                </button>
                <button
                  className="btn btn-outline-info"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const response = await fetch('/api/test-simple-image');
                      const data = await response.json();
                      setDebugInfo({
                        simpleImageTest: data,
                        timestamp: new Date().toISOString(),
                        note: 'Simple image generation test with multiple models'
                      });
                    } catch (error) {
                      setDebugInfo({
                        error: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: new Date().toISOString(),
                        note: 'Simple image test failed'
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-image me-2"></i>
                  Simple Image Test
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
                <strong>Primary Model:</strong><br />
                <code>black-forest-labs/FLUX.1-dev</code>
              </div>
              <div className="mb-2">
                <strong>Fallback Model:</strong><br />
                <code>stabilityai/stable-diffusion-2-1</code>
              </div>
              <div className="mb-2">
                <strong>Client:</strong><br />
                Official HF Inference Client
              </div>
              <div className="mb-2">
                <strong>Final Fallback:</strong><br />
                Themed placeholder images
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

                {debugInfo.hfClientTest?.debug?.imagePreview && (
                  <div className="mt-3">
                    <h6>HF Client Test Result:</h6>
                    <div className="alert alert-success">
                      <i className="bi bi-check-circle me-2"></i>
                      Official HF Client is working! Image size: {debugInfo.hfClientTest.debug.imageSize} bytes
                    </div>
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
              <h6>Debug Tests Available:</h6>
              <ol>
                <li><strong>Test Token:</strong> Validates HF token with account API</li>
                <li><strong>Test HF Client:</strong> Tests official client with text + image generation</li>
                <li><strong>Test Generation:</strong> Full image generation with content-aware prompts</li>
                <li><strong>Check Environment:</strong> Verifies environment configuration</li>
              </ol>
              
              <h6 className="mt-3">Setup Instructions:</h6>
              <ol>
                <li>Get a Hugging Face API token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">huggingface.co/settings/tokens</a></li>
                <li>Ensure token has <strong>Read</strong> permissions</li>
                <li>Add <code>HUGGINGFACE_API_TOKEN=your_token_here</code> to your <code>.env</code> file</li>
                <li>Restart the development server</li>
                <li>Run &quot;Test HF Client&quot; to verify setup</li>
              </ol>
              
              <h6 className="mt-3">Current Status:</h6>
              <ul>
                <li><strong>Official HF Client:</strong> Installed and configured</li>
                <li><strong>Prompt Generation:</strong> Working - Creates content-aware prompts</li>
                <li><strong>Model Fallback:</strong> FLUX.1-dev → Stable Diffusion 2.1 → Placeholder</li>
                <li><strong>Authentication:</strong> Test with &quot;Test HF Client&quot; button</li>
                <li><strong>WordPress Integration:</strong> Not implemented - images not saved to posts</li>
              </ul>
              
              <h6 className="mt-3">Troubleshooting:</h6>
              <ul>
                <li><strong>401 Error:</strong> Token invalid or model requires special access</li>
                <li><strong>Generic Images:</strong> Using fallback placeholders instead of AI</li>
                <li><strong>No Images on Front Page:</strong> WordPress integration not implemented</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGeneratorDebugPage;
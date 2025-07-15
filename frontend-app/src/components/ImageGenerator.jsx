import React, { useState } from 'react';
import { textToImage } from '@huggingface/inference';

const HF_TOKEN = 'your_hf_token_here'; // Replace with your Hugging Face API token

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateImage = async () => {
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const result = await textToImage({
        model: "black-forest-labs/FLUX.1-dev",
        input: prompt,
        apiToken: HF_TOKEN
      });
      const imageUrl = URL.createObjectURL(result);
      setImageUrl(imageUrl);
    } catch (error) {
      setError('Failed to generate image. Please try again.');
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Hugging Face Text-to-Image Generator</h2>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt (e.g., 'A futuristic city with neon lights')"
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={generateImage}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {imageUrl && (
        <div className="mt-4">
          <img src={imageUrl} alt="Generated Image" className="max-w-full h-auto rounded" />
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
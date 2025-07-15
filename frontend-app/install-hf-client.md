# Install Hugging Face Client

## Issue Found
We're using manual fetch() calls instead of the official Hugging Face client library, which is causing authentication issues.

## Solution
Install the official client and update our API:

```bash
cd frontend-app
bun add @huggingface/inference
```

## Updated Implementation
```typescript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);

const image = await hf.textToImage({
  model: "black-forest-labs/FLUX.1-dev",
  inputs: prompt,
  parameters: {
    num_inference_steps: 20,
    guidance_scale: 7.5,
    width: getWidthFromAspectRatio(settings.aspectRatio),
    height: getHeightFromAspectRatio(settings.aspectRatio),
  }
});
```

This should resolve the 401 authentication errors we're seeing.
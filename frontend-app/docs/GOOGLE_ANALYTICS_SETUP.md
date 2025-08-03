# Google Analytics Data API Setup Guide

## Your Current Setup

### ✅ Active Google Analytics Property
- **Account**: anaartjiepaartie@gmail.com
- **Property ID**: 251633919
- **Measurement ID**: G-2JG7BP50ZW

### 🎯 Goal
Enable the dashboard to read analytics data and show popular posts with real view counts.

## Step-by-Step Setup

### 1. Enable Google Analytics Data API

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Sign in** with: anaartjiepaartie@gmail.com
3. **Select or Create Project** (can be any name, e.g., "Medialternatives Dashboard")
4. **Enable API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Analytics Data API"
   - Click "Enable"

### 2. Create Service Account

1. **Go to**: "APIs & Services" → "Credentials"
2. **Click**: "Create Credentials" → "Service Account"
3. **Fill in**:
   - Service account name: `medialternatives-analytics`
   - Description: `Dashboard analytics data access`
   - email: medialternatives-analytics@medialternatives-anaartjie.iam.gserviceaccount.com
4. 
**Click**: "Create and Continue"
5. **Skip** role assignment for now
6. **Click**: "Done"


### 3. Generate Service Account Key

1. **Click** on your new service account
2. **Go to**: "Keys" tab
3. **Click**: "Add Key" → "Create new key"
4. **Select**: JSON format
5. **Download** the JSON file (keep it secure!)

### 4. Grant Analytics Access

1. **Go to**: [Google Analytics](https://analytics.google.com/)
2. **Click**: Admin (gear icon)
3. **Select** your property (Property ID: 251633919)
4. **Go to**: "Property Access Management"
5. **Click**: "+" to add user
6. **Add** the service account email (looks like: `medialternatives-analytics@your-project.iam.gserviceaccount.com`)
7. **Set role**: "Viewer" (sufficient for reading data)

### 5. Environment Variables

Add these to your deployment environment:

```bash
# Your Google Analytics Property ID
GOOGLE_ANALYTICS_PROPERTY_ID=251633919

# Base64 encoded service account JSON
GOOGLE_SERVICE_ACCOUNT_KEY=eyJ0eXBlIjoi...

# Keep your existing tracking ID
NEXT_PUBLIC_GOOGLE_ANALYTICS=G-2JG7BP50ZW
```

### 6. Convert JSON to Base64

**Option A: Online Tool**
1. Go to: https://www.base64encode.org/
2. Paste your JSON file content
3. Copy the base64 result

**Option B: Command Line**
```bash
# On Mac/Linux
base64 -i path/to/your/service-account.json

# On Windows
certutil -encode path/to/your/service-account.json temp.txt
```

## Testing the Integration

### 1. Local Testing
```bash
# Add to .env.local
GOOGLE_ANALYTICS_PROPERTY_ID=251633919
GOOGLE_SERVICE_ACCOUNT_KEY=your-base64-encoded-json

# Test the API
curl http://localhost:3000/api/analytics?period=7d
```

### 2. Expected Response
```json
{
  "success": true,
  "data": {
    "visitors": 1234,
    "pageviews": 5678,
    "topPages": [
      {"page": "/", "views": 890},
      {"page": "/about", "views": 456}
    ]
  },
  "source": "Google Analytics API",
  "period": "7d"
}
```

## Dashboard Features Enabled

### ✅ Content Management
- **Popular Posts** tab will show real analytics data
- **View counts** from actual Google Analytics
- **Post ranking** based on traffic

### ✅ Analytics Dashboard
- **Real visitor data** instead of static numbers
- **Actual pageviews** and bounce rates
- **Live top pages** performance

### ✅ Overview Dashboard
- **Real analytics** feeding into overview stats
- **Actual performance** metrics
- **Live data** across all sections

## Security Notes

### 🔒 Service Account Security
- **Never commit** the JSON file to git
- **Use environment variables** only
- **Rotate keys** periodically
- **Limit permissions** to "Viewer" role only

### 🔒 Environment Variables
- **Server-side only** - never expose in client code
- **Use secure storage** in production (Vercel secrets, etc.)
- **Different keys** for development/production if needed

## Troubleshooting

### Common Issues

1. **"Property not found"**
   - Verify Property ID: 251633919
   - Check service account has access to the property

2. **"Permission denied"**
   - Ensure service account email is added to Google Analytics
   - Verify "Viewer" role is assigned

3. **"Invalid credentials"**
   - Check base64 encoding is correct
   - Verify JSON file is complete and valid

4. **"API not enabled"**
   - Enable Google Analytics Data API in Cloud Console
   - Wait a few minutes for propagation

### Support

If you encounter issues:
1. **Check** the browser console for error messages
2. **Verify** environment variables are set correctly
3. **Test** the API endpoint directly: `/api/analytics`
4. **Review** Google Cloud Console for API quotas/errors

## Benefits After Setup

### 📊 Real Data
- **Live visitor counts** in dashboard
- **Actual popular posts** based on traffic
- **Real-time insights** for content strategy

### 🚀 Professional Dashboard
- **Stakeholder-ready** with real metrics
- **Data-driven decisions** based on actual analytics
- **Scalable architecture** for future features

---

**Once set up, your dashboard will display real Google Analytics data while maintaining professional fallbacks for development!**

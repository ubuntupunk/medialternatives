// WordPress.com OAuth Debug Script
// Run this in browser console to test OAuth URL generation

console.log('=== WordPress.com OAuth Debug ===');

const clientId = '122122';
const redirectUri = window.location.origin + '/dashboard/analytics';
const scopes = 'read,global';
const state = 'test-state-' + Math.random().toString(36).substring(2);

const authUrl = new URL('https://public-api.wordpress.com/oauth2/authorize');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('redirect_uri', redirectUri);
authUrl.searchParams.set('response_type', 'token');
authUrl.searchParams.set('scope', scopes);
authUrl.searchParams.set('blog', 'medialternatives.wordpress.com');
authUrl.searchParams.set('state', state);

console.log('Client ID:', clientId);
console.log('Redirect URI:', redirectUri);
console.log('Scopes:', scopes);
console.log('Generated OAuth URL:', authUrl.toString());

console.log('\n=== Test Steps ===');
console.log('1. Copy the OAuth URL above');
console.log('2. Open it in a new tab');
console.log('3. Check if WordPress.com accepts the client_id');
console.log('4. If you get "Invalid client_id" error, the app needs to be re-registered');

// Test if we can make a simple API call
fetch('https://public-api.wordpress.com/wp/v2/sites/medialternatives.wordpress.com/posts?per_page=1')
  .then(response => {
    console.log('\n=== Public API Test ===');
    console.log('Public API Status:', response.status);
    if (response.ok) {
      console.log('✅ Public API is accessible');
    } else {
      console.log('❌ Public API error:', response.status);
    }
  })
  .catch(error => {
    console.log('❌ Public API failed:', error);
  });
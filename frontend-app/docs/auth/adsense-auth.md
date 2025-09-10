# AdSense Authentication System Documentation

This document outlines the current implementation of the AdSense authentication system, provides suggestions for improvements, and includes a checklist for writing unit tests.

## Current Implementation

The authentication system uses Google's OAuth 2.0 to access AdSense data. The flow is as follows:

1.  **Initiating Authentication**: The user is redirected to Google's consent screen to grant access to their AdSense account.
2.  **Callback Handling**: Google redirects the user back to the application with an authorization code. This code is exchanged for an access token and a refresh token.
3.  **Token Storage**: The access and refresh tokens are stored in a JSON file (`adsense-token.json`) on the server.
4.  **Data Fetching**: The access token is used to make authenticated requests to the AdSense API.
5.  **Token Refresh**: The refresh token is used to obtain a new access token when the current one expires.

### API Endpoints

#### `GET /api/adsense/auth`

*   **File**: `src/app/api/adsense/auth/route.ts`
*   **Description**: Initiates the OAuth 2.0 flow by redirecting the user to the Google consent screen.
*   **Details**: The `access_type` is set to `offline` to request a refresh token, and `prompt` is set to `consent` to ensure a refresh token is always sent.

#### `GET /api/adsense/callback`

*   **File**: `src/app/api/adsense/callback/route.ts`
*   **Description**: Handles the callback from Google after the user grants consent.
*   **Details**: It exchanges the authorization code for an access token and a refresh token. The tokens are then stored.

#### `GET /api/adsense/data`

*   **File**: `src/app/api/adsense/data/route.ts`
*   **Description**: Fetches data from the AdSense API.
*   **Details**: It uses the stored access token to make authenticated requests. If the access token is expired, the `googleapis` library automatically uses the refresh token to obtain a new one.

---

## Unit Testing Checklist

The following are instructions for writing unit tests for each API endpoint.

### `GET /api/adsense/auth`

*   [ ] Test that the endpoint redirects to the correct Google authentication URL.
*   [ ] Test that the `access_type`, `scope`, and `prompt` parameters are correctly set in the URL.

### `GET /api/adsense/callback`

*   [ ] Test that the endpoint correctly exchanges the authorization code for tokens.
*   [ ] Test that the tokens are correctly stored using the `setToken` function.
*   [ ] Test that the endpoint redirects to the correct success URL after a successful token exchange.
*   [ ] Test that the endpoint redirects to the correct error URL if the token exchange fails.
*   [ ] Test that the endpoint handles the case where no authorization code is provided.

### `GET /api/adsense/data`

*   [ ] Test that the endpoint returns a 401 error if no token is available.
*   [ ] Test that the endpoint successfully fetches data from the AdSense API when a valid token is present.
*   [ ] Test that the endpoint correctly handles API errors (e.g., account disapproved).
*   [ ] Test that the endpoint returns a 500 error if the data fetch fails for other reasons.

---

## Suggested Improvements

### [ ] Secure Token Storage

*   **Problem**: Storing the token in a plain text JSON file is insecure. If the file is compromised, the attacker gains access to the user's AdSense account.
*   **Suggestion**: Store the token in a more secure manner, such as:
    *   **Encrypted in a database**: Use a database to store the token and encrypt it at rest.
    *   **Secure vault**: Use a service like HashiCorp Vault or AWS Secrets Manager to store the token.

### [ ] Enhanced Error Handling

*   **Problem**: The current error handling is basic. It redirects to a generic error page, but doesn't provide much context to the user.
*   **Suggestion**: Implement more robust error handling:
    *   Provide more specific error messages to the user.
    *   Log errors with more detail to help with debugging.
    *   Implement a more user-friendly error page.

### [ ] Refactor Authentication Logic

*   **Problem**: The authentication logic is spread across multiple files. This can make it difficult to understand and maintain.
*   **Suggestion**: Consolidate the authentication logic into a single service or module. This would make the code more organized and easier to test.

### [ ] Secure Client Secret Storage

*   **Problem**: The Google Client ID and Secret are stored as environment variables. While this is better than hardcoding them, they can still be exposed if the environment is not properly secured.
*   **Suggestion**: Use a secret management service (like Vault or AWS Secrets Manager) to store the client ID and secret.

### [ ] Add a Logout/Revoke Token Endpoint

*   **Problem**: There is no way for the user to log out or revoke the application's access to their AdSense account.
*   **Suggestion**: Create a new API endpoint (e.g., `/api/adsense/logout`) that revokes the refresh token and deletes the stored token. This would give the user more control over their account.

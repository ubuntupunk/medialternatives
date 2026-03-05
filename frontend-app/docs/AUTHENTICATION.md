# Secure Authentication System

This application uses a secure JWT-based authentication system with the following features:

## Security Features

- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **JWT Tokens**: Separate access (15min) and refresh (7 days) tokens
- **Account Lockout**: 5 failed attempts lock account for 15 minutes
- **Password Complexity**: Minimum 8 characters with uppercase, lowercase, numbers, and special characters
- **Rate Limiting**: Additional protection against brute force attacks
- **HTTP-Only Cookies**: Secure token storage

## Setup

### 1. Generate Password Hash

Run the password hashing utility:

```bash
npm run hash-password yourSecurePassword123!
```

This will output a hash like:
```
ADMIN_PASSWORD_HASH=$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt6U7K2XzJzUeO
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET=your-super-secure-access-secret-key-32-chars-min
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-32-chars-min

# Admin User Configuration
ADMIN_EMAIL=admin@medialternatives.com
ADMIN_PASSWORD_HASH=<hash-from-step-1>
```

### 3. Generate Secure JWT Secrets

Use a secure random string generator:

```bash
# Linux/Mac
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## API Usage

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@medialternatives.com",
  "password": "yourSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "david-robert-lewis",
      "username": "David Robert Lewis",
      "email": "admin@medialternatives.com",
      "isAdmin": true
    },
    "message": "Login successful"
  }
}
```

### Session Validation

```bash
GET /api/auth/session
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isAuthenticated": true,
    "user": {
      "userId": "david-robert-lewis",
      "username": "David Robert Lewis",
      "email": "admin@medialternatives.com",
      "isAdmin": true
    }
  }
}
```

### Logout

```bash
POST /api/auth/logout
```

## Security Considerations

- **Token Expiration**: Access tokens expire in 15 minutes, refresh tokens in 7 days
- **Automatic Refresh**: The session endpoint automatically refreshes access tokens when needed
- **Secure Cookies**: Tokens are stored in HTTP-only, secure, sameSite cookies
- **Account Protection**: Failed login attempts are tracked per IP address
- **Password Requirements**: Complex passwords prevent weak authentication

## Migration from Old System

The old system used plain text passwords and cookie-based sessions. The new system:

1. Requires email + password authentication
2. Uses bcrypt password hashing
3. Implements JWT tokens with automatic refresh
4. Includes account lockout protection
5. Enforces password complexity rules

Update your login forms to send email instead of just password.
Signout endpoint design

- Endpoint: `POST /api/auth/signout`
- Behavior: stateless JWTs — server replies 200 OK and client should delete token locally.
- If persistent token revocation is required later, add `revoked_tokens` table and store token jti with expiry.

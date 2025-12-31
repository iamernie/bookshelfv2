# Security Audit Report - BookShelf V2

**Date:** 2025-12-31
**Auditor:** Claude Code
**Version Audited:** 2.2.23

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 2 | Needs immediate attention |
| HIGH | 3 | Fix this week |
| MEDIUM | 6 | Fix this month |
| LOW | 2 | When convenient |

---

## CRITICAL (Fix Immediately)

### 1. Insecure Session Cookie

**File:** `src/routes/api/auth/login/+server.ts` (Lines 64-70)

**Issue:** Session cookies are set with `secure: false` even in production, making them vulnerable to MITM attacks.

```typescript
cookies.set('session', result.sessionId!, {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: false, // VULNERABLE - should be true in production
  maxAge: 60 * 60 * 24 * 7
});
```

**Impact:** Session tokens can be intercepted over HTTP connections.

**Fix:**
```typescript
secure: process.env.NODE_ENV === 'production'
// or
secure: !dev
```

---

### 2. Vulnerable Dependencies

**Issue:** Known security vulnerabilities in npm dependencies.

| Package | Vulnerability | Severity |
|---------|--------------|----------|
| `cookie < 0.7.0` | Out-of-bounds character injection | CRITICAL |
| `esbuild <= 0.24.2` | SSRF in dev server | MODERATE |

**Fix:**
```bash
npm audit fix
npm update @sveltejs/kit @sveltejs/adapter-node
```

---

## HIGH Priority

### 3. Settings Endpoint Too Permissive

**File:** `src/routes/api/settings/+server.ts` (Lines 11-25)

**Issue:** Any authenticated user can read ALL settings including SMTP credentials.

```typescript
export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }
  // No admin check - any user can access
  const settings = await getAllSettings();
  return json(settings);
};
```

**Impact:** Sensitive configuration data exposed to all users.

**Fix:** Add admin role check:
```typescript
if (!locals.user || locals.user.role !== 'admin') {
  throw error(403, 'Forbidden');
}
```

---

### 4. No Rate Limiting on Password Reset

**File:** `src/lib/server/services/authService.ts` (Lines 243-273)

**Issue:** Password reset tokens can be generated unlimited times, enabling brute force attacks.

**Impact:** Token enumeration, email flooding, potential account takeover.

**Fix:**
- Limit to 3 requests per hour per email
- Track failed reset attempts
- Invalidate previous tokens when new one is issued

---

### 5. Audiobook Upload Validation Missing

**Issue:** No file type validation found for audiobook file uploads.

**Impact:** Arbitrary file upload possible under audiobook endpoint.

**Fix:**
- Implement strict file type validation for audio files (.mp3, .m4a, .m4b, .flac)
- Use magic number checking, not just extensions
- Set max file size limits

---

## MEDIUM Priority

### 6. Path Traversal Weakness

**Files:**
- `src/routes/ebooks/[...path]/+server.ts` (Line 38)
- `src/routes/covers/[...path]/+server.ts` (Line 29)

**Issue:** Simple regex replace can be bypassed with URL encoding (e.g., `..%2F..%2F`).

```typescript
const sanitizedPath = requestedPath.replace(/\.\./g, '').replace(/\/+/g, '/');
```

**Fix:**
```typescript
import { resolve, relative, normalize } from 'path';

const normalizedPath = normalize(requestedPath);
const fullPath = resolve(baseDir, normalizedPath);
const relativePath = relative(baseDir, fullPath);

// Ensure path doesn't escape base directory
if (relativePath.startsWith('..') || resolve(fullPath) !== fullPath) {
  throw error(403, 'Access denied');
}
```

---

### 7. SSRF Risk in Cover Download

**File:** `src/routes/api/covers/download/+server.ts` (Lines 47-85)

**Issue:** No validation against internal IPs when fetching cover images.

**Impact:** Attacker could fetch from internal network, localhost, or cloud metadata endpoints.

**Fix:**
```typescript
import { URL } from 'url';

function isPrivateIP(hostname: string): boolean {
  const privateRanges = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\./,
    /^localhost$/i,
    /^.*\.local$/i
  ];
  return privateRanges.some(range => range.test(hostname));
}

const parsedUrl = new URL(url);
if (isPrivateIP(parsedUrl.hostname)) {
  throw error(400, 'Invalid URL');
}
```

---

### 8. Debug Logging of Sensitive Data

**Files:**
- `src/lib/server/services/authService.ts` (Lines 26-35)
- `src/routes/api/auth/login/+server.ts` (Lines 9-13)

**Issue:** Password hash prefixes and emails logged to console.

```typescript
console.log('[AUTH SERVICE] Hash to verify against:', hash?.substring(0, 20) + '...');
console.log('[LOGIN API] Email:', data.email);
```

**Fix:** Remove all password-related console.log statements and avoid logging PII.

---

### 9. File Type Validation by Extension Only

**File:** `src/lib/server/services/ebookService.ts` (Lines 48-75)

**Issue:** File type validated only by extension, not content.

**Fix:**
```bash
npm install file-type
```

```typescript
import { fileTypeFromBuffer } from 'file-type';

const buffer = await file.arrayBuffer();
const type = await fileTypeFromBuffer(Buffer.from(buffer));

const allowedMimes = ['application/epub+zip', 'application/pdf', 'application/x-cbz'];
if (!type || !allowedMimes.includes(type.mime)) {
  throw error(400, 'Invalid file type');
}
```

---

### 10. Missing Security Headers

**Issue:** No CSP, HSTS, X-Frame-Options configured.

**Fix:** Add to `src/hooks.server.ts`:
```typescript
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
};
```

---

### 11. Unencrypted Backups

**File:** `src/lib/server/db/index.ts` (Lines 21-60)

**Issue:** Database backups stored without encryption.

**Impact:** If backup files are accessed, all user data is exposed.

**Fix:**
- Encrypt backups using AES-256
- Restrict file permissions to 600
- Store encryption key separately from backups

---

## LOW Priority

### 12. Weak Email Validation

**Files:**
- `src/routes/api/auth/signup/+server.ts` (Line 52)
- `src/lib/server/services/userService.ts` (Line 199)

**Issue:** Basic regex instead of RFC 5322 compliant validation.

**Fix:** Use a proper email validation library like `email-validator`.

---

### 13. OIDC Claims in Cookie

**File:** `src/routes/auth/oidc/callback/+server.ts` (Lines 118-128)

**Issue:** Email stored in plaintext in OIDC pending cookie.

**Fix:** Store only email_verified status, not the email itself. Use server-side session storage instead.

---

## Recommended Action Plan

### Immediate (Tonight/Tomorrow)
- [ ] Fix cookie `secure` flag in login endpoint
- [ ] Run `npm audit fix` to update vulnerable packages
- [ ] Add admin check to settings GET endpoint

### This Week
- [ ] Add rate limiting to password reset
- [ ] Fix path traversal with proper path resolution
- [ ] Remove debug logging of sensitive data
- [ ] Add security headers

### This Month
- [ ] Implement file content validation (magic numbers)
- [ ] Add SSRF protection for cover downloads
- [ ] Encrypt database backups
- [ ] Add rate limiting middleware for all auth endpoints
- [ ] Validate audiobook file uploads

### Ongoing
- [ ] Regular dependency audits (`npm audit`)
- [ ] Security testing in CI/CD pipeline
- [ ] Periodic security reviews

---

## Notes

- The codebase uses good architectural patterns (Drizzle ORM with parameterized queries, SvelteKit hooks for auth)
- Most SQL injection risks are mitigated by Drizzle ORM's parameterization
- XSS risks are largely mitigated by Svelte's automatic escaping
- The main concerns are around authentication hardening and file handling security

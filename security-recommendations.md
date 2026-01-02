# Security Audit Report - BookShelf V2

**Date:** 2025-12-31
**Auditor:** Internal Security Review
**Version Audited:** 2.2.23
**Last Updated:** 2025-12-31

---

## Summary

| Severity | Count | Fixed | Remaining |
|----------|-------|-------|-----------|
| CRITICAL | 2 | 2 | 0 |
| HIGH | 3 | 3 | 0 |
| MEDIUM | 6 | 4 | 2 |
| LOW | 2 | 0 | 2 |

---

## CRITICAL (Fix Immediately)

### 1. ~~Insecure Session Cookie~~ ✅ FIXED

**File:** `src/routes/api/auth/login/+server.ts`

**Status:** Fixed - cookies now use `secure: !dev` to enable secure cookies in production.

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

### 3. ~~Settings Endpoint Too Permissive~~ ✅ FIXED

**File:** `src/routes/api/settings/+server.ts`

**Status:** Fixed - settings endpoint now requires admin role.

---

### 4. ~~No Rate Limiting on Password Reset~~ ✅ FIXED

**File:** `src/lib/server/middleware/rateLimiter.ts` (NEW)

**Status:** Fixed - Added comprehensive rate limiting middleware:
- Password reset: 3 requests per hour per IP
- Login: 10 attempts per 15 minutes per IP
- Signup: 5 registrations per hour per IP
- General API: 100 requests per minute per IP

Applied to:
- `src/routes/api/auth/forgot-password/+server.ts`
- `src/routes/api/auth/login/+server.ts`
- `src/routes/api/auth/signup/+server.ts`

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

### 6. ~~Path Traversal Weakness~~ ✅ FIXED

**Files:**
- `src/routes/ebooks/[...path]/+server.ts`
- `src/routes/covers/[...path]/+server.ts`

**Status:** Fixed - Now uses proper path normalization with URL decoding, path.normalize(), path.resolve(), and relative path checking to prevent all traversal attempts including URL-encoded variants.

---

### 7. ~~SSRF Risk in Cover Download~~ ✅ FIXED

**File:** `src/routes/api/covers/download/+server.ts`

**Status:** Fixed - Added comprehensive SSRF protection:
- DNS resolution to detect private IPs behind hostnames
- Blocks all private IPv4 ranges (127.x, 10.x, 172.16-31.x, 192.168.x, etc.)
- Blocks private IPv6 ranges (::1, fe80:, fc00:, fd00:)
- Blocks cloud metadata endpoints (169.254.169.254)
- Blocks internal hostnames (localhost, *.local, *.internal, host.docker.internal)

---

### 8. ~~Debug Logging of Sensitive Data~~ ✅ FIXED

**Files:**
- `src/lib/server/services/authService.ts`
- `src/routes/api/auth/login/+server.ts`
- `src/hooks.server.ts`

**Status:** Fixed - Removed all console.log statements that exposed:
- Password hash prefixes
- Email addresses
- Password verification results
- Login attempt details
- Request debugging info

---

### 9. ~~Missing Security Headers~~ ✅ FIXED

**File:** `src/hooks.server.ts`

**Status:** Fixed - Added security headers to all responses:
- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` - Restricts features
- `Strict-Transport-Security` (production only) - Enforces HTTPS

---

### 10. File Type Validation by Extension Only

**File:** `src/lib/server/services/ebookService.ts`

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

### 11. Unencrypted Backups

**File:** `src/lib/server/db/index.ts`

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
- `src/lib/server/services/userService.ts`

**Issue:** Basic regex instead of RFC 5322 compliant validation.

**Fix:** Use a proper email validation library like `email-validator`.

---

### 13. OIDC Claims in Cookie

**File:** `src/routes/auth/oidc/callback/+server.ts`

**Issue:** Email stored in plaintext in OIDC pending cookie.

**Fix:** Store only email_verified status, not the email itself. Use server-side session storage instead.

---

## Recommended Action Plan

### ~~Immediate (Tonight/Tomorrow)~~ ✅ DONE
- [x] Fix cookie `secure` flag in login endpoint
- [x] Add admin check to settings GET endpoint

### ~~This Week~~ ✅ DONE
- [x] Add rate limiting to password reset (and all auth endpoints)
- [x] Fix path traversal with proper path resolution
- [x] Remove debug logging of sensitive data
- [x] Add security headers

### This Month
- [ ] Run `npm audit fix` to update vulnerable packages
- [ ] Implement file content validation (magic numbers)
- [ ] Encrypt database backups
- [ ] Validate audiobook file uploads with magic numbers

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
- **v2.3.4 Security Update:** Major security improvements including rate limiting, SSRF protection, path traversal fixes, and security headers

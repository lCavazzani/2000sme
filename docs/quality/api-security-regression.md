# API security regression suite

Run `pnpm --filter backend test:security` to execute the Cloudflare Workers-runtime regressions that protect the public Guestbook API. The command is a required step in both the pull-request Quality workflow and the deployment quality job; neither deployment job can run until that job succeeds.

| Protection | Regression evidence |
|---|---|
| Malformed JSON, missing fields, schema limits, and oversized bodies | `test/guestbook.test.ts` asserts structured 400/413 errors and no unintended D1 writes for rejected submissions. |
| Injection-like and presentational input | `test/guestbook.test.ts` proves HTML-looking strings remain literal plain text while unsupported presentation fields are rejected. |
| Origin policy and preflight | `test/guestbook.test.ts` asserts the approved production origin is allowed and an unapproved origin receives no allow-origin header. |
| Rate limiting | `test/guestbook.test.ts` asserts HTTP 429 and `Retry-After` after the per-IP threshold. |
| Security headers | `test/security-headers.test.ts` asserts the selected anti-framing, MIME, referrer, permissions, and Turnstile CSP directives. |
| Turnstile | `test/turnstile-guestbook.test.ts` uses injected verifier outcomes to prove missing, invalid, reused, and unavailable verification states cannot create D1 entries. |

## CSP rollout state

The current security policy deliberately emits `Content-Security-Policy-Report-Only`; the suite asserts that mode and the absence of an enforced CSP header. Enforcement is a separate rollout decision because it can block legitimate runtime resources. When that rollout is approved, change the policy and update the regression expectation in the same pull request rather than silently treating report-only as enforcement.

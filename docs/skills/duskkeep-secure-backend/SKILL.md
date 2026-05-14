---
name: duskkeep-secure-backend
description: "Use this skill whenever working on Duskkeep Fronts backend, Supabase, Auth, RPCs, RLS, online persistence, payments, premium currency, ladder, authoritative operations, server APIs, or security-sensitive data flows. It applies SSDLC, shift-left security, OWASP Top 10/ASVS, MITRE ATT&CK-informed threat thinking, and repo-specific offline-first constraints."
---

# Duskkeep Secure Backend

Use this skill for any backend, Supabase, Auth, persistence, economy, payments, ladder, or authoritative operation work.

## Security Baseline

Treat the browser as untrusted:
- Never accept client-side resources, rewards, loot rolls, premium currency, ladder scores, battle results, or ownership as truth.
- Sensitive mutations must go through server-side validation, RLS, idempotency and atomic persistence.
- Keep offline-first local flows only as alpha fallback, not as security proof.
- Never expose service-role keys, database passwords, webhook secrets or payment secrets to client code or `NEXT_PUBLIC_*`.

Primary references to consider:
- OWASP Top 10: Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable Components, Authentication Failures, Software/Data Integrity, Logging/Monitoring, SSRF.
- OWASP ASVS: authentication, session management, access control, validation/encoding, stored data protection, communication security, malicious code controls.
- MITRE ATT&CK: Exploit Public-Facing Application, Valid Accounts, credential abuse, persistence through misconfiguration.

## Repo Security Rules

Before editing backend/security code, read as needed:
- `docs/SECURITY_AND_BACKEND_ROADMAP.md`
- `docs/BACKEND_DATA_MODEL.md`
- `docs/SERVER_AUTHORITATIVE_OPERATIONS.md`
- Relevant files in `features/server/*`, `app/api/server/*`, `supabase/migrations/*`

Hard rules:
- No service-role key in client code.
- No `NEXT_PUBLIC_*` variable may contain server secrets.
- No direct client mutation for resources, premium currency, purchases, claims, loot rolls or ladder.
- Server routes must authenticate, validate payload shape, validate ownership and return safe error codes.
- RPCs must use RLS/`auth.uid()`, explicit grants, constrained `search_path`, idempotency and ledger where resources change.
- Do not add broad fallback from authoritative failure to local success; fallback is allowed only when no session/API is configured.
- Do not log tokens, credentials, JWTs, full auth headers, payment payloads or secrets.
- Do not introduce `eval`, dynamic SQL with untrusted strings, unsafe redirects, open proxies or remote fetches from user-controlled URLs.

## Shift-Left Checklist

For each change, do this before implementation:
- Identify assets at risk: identity, resources, premium currency, rewards, progression, cards/heroes, purchases, ladder.
- Identify trust boundary: browser, Next route, Supabase Auth, Postgres RPC/RLS, external payment/webhook.
- Define abuse cases: replay, tampering, duplicate claim, forged ownership, missing auth, stale session, crafted payload, rate abuse.
- Choose server authority: local-only alpha, proxy RPC, direct Supabase RLS read, future backend-only service.

During implementation:
- Validate input with existing contracts in `features/server/authoritativeOperations.ts` or add typed validators.
- Keep idempotency keys mandatory for sensitive mutations.
- Use allowlists for operation names, offer ids, node ids and command kinds.
- Return generic user-safe errors; keep detailed diagnostics out of client responses.
- Keep security-sensitive helpers pure and tested.

After implementation:
- Add focused tests for negative cases: unauthenticated, invalid payload, unsupported operation, wrong ownership/ids when testable, replay/idempotency when relevant.
- Run `npm.cmd run check`, relevant tests and `npm.cmd run build` for app/security changes.
- Run `npm.cmd audit --audit-level=high` after dependency/security work.
- Update `CHANGELOG.md` and version for closed iterations.

## Supabase Patterns

Client:
- Use only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Validate public config before creating clients.
- Keep session helpers centralized; do not scatter `createClient` calls.
- Use anon key + user JWT; never service role.

Server route:
- Keep `/api/server/authoritative` hidden behind `SERVER_AUTHORITATIVE_API_ENABLED=true`.
- Require `Authorization: Bearer <jwt>`.
- Revalidate operation type and payload server-side.
- Create Supabase client with anon key and forwarded user Authorization header.

Database:
- Tables storing player state require ownership through `profiles.user_id = auth.uid()`.
- RLS must be enabled.
- Mutating RPCs must be `security definer` only when needed and must set a safe `search_path`.
- Resource mutations must be atomic and ledgered.

## Output Expectations

Report:
- Security boundary touched.
- OWASP/MITRE risks mitigated.
- Whether offline fallback remains and why.
- Tests/checks run.
- Residual risks and what remains intentionally deferred.

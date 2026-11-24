# Milestone 1.2 security notes

## Authentication and frontend behavior

Protected certificate and upload APIs accept a valid JWT in the `Authorization: Bearer` header or the existing HttpOnly `token` cookie. Legacy server-rendered login sessions remain supported. The React login and signup pages are not connected to these login endpoints yet; no token is generated or stored by the frontend. The upload screen sends cookies with requests and displays a sign-in message for `401` responses. Completing the frontend authentication flow is a follow-up task.

Socket.IO connections require the same authenticated session or a valid JWT. Upload progress is sent only to the socket ID supplied with that upload after the server confirms the socket belongs to the authenticated user.

## Uploads and storage

Uploads remain in memory during processing; the current pipeline does not create temporary disk files. The upload route applies the configurable `UPLOAD_MAX_SIZE_MB` limit, validates MIME and filename extensions, then checks file signatures. DOCX input is additionally parsed with Mammoth before Cloudinary upload. The original filename is sanitized before being returned to the client.

New Cloudinary uploads use authenticated delivery and are not returned as public URLs. The application does not yet implement a signed-download or authenticated preview endpoint. Existing Cloudinary documents were not changed or deleted; their access mode must be inventoried separately because changing new-upload options does not make old assets private.

## Operational limitations

- Authentication and upload rate limits use an in-process memory counter. They reset on restart and are not shared across multiple server instances; use a shared store such as Redis before horizontal scaling.
- Security response headers are currently applied by a small local middleware. Helmet could not be installed because npm registry TLS certificate verification failed in this environment. The middleware keeps a compatibility Content Security Policy for existing inline EJS pages; migrate those inline scripts before tightening the policy or switching to Helmet defaults.
- The default Express session store is in memory. Configure a persistent, production session store before deploying multiple instances.
- Stateless JWT cookies remain valid until expiry after logout. Token revocation/session inventory is outside this milestone.

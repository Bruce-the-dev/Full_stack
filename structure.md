fullstack-js-test/
├─ backend/
│ ├─ src/
│ │ ├─ users/
│ │ │ ├─ entities/user.entity.ts
│ │ │ ├─ users.controller.ts
│ │ │ ├─ users.service.ts
│ │ │ └─ users.module.ts
│ │ ├─ app.module.ts
│ │ └─ main.ts
│ ├─ users.proto
│ ├─ package.json
│ └─ tsconfig.json
└─ frontend/
├─ public/proto/users.proto
├─ pages/index.tsx
├─ package.json
└─ next.config.js

# Fullstack JS Developer Test - QT Global Software Ltd

This repository contains a reference implementation for the Full-Stack JavaScript developer take-home assignment:

- Backend: NestJS + TypeORM + SQLite
- Frontend: Next.js + protobuf decoding + client-side signature verification
- Uses RSA-PSS (4096) + SHA-384 for signing the email hash

## Structure

- `backend/` — NestJS app (runs on http://localhost:3000)
- `frontend/` — Next.js app (runs on http://localhost:3001)
- `users.proto` — Protobuf schema (also in `frontend/public/proto/users.proto`)

## Setup

### Backend

```bash
cd backend
npm install
# dev server:
npm run start:dev
# or build and run:
npm run build
npm start
```

Backend endpoints:

POST /users — create a user (body { "email": "...", "role": "user" })

GET /users — list users (JSON)

GET /users/export — returns protobuf binary Users message (content-type: application/octet-stream)

PUT /users/:id — update user

DELETE /users/:id — delete user

Notes:

A 4096-bit RSA keypair is generated on startup (in-memory). The public key SPKI DER and signature bytes are stored per-user in SQLite.

Database file: db.sqlite (created automatically).

Frontend
cd frontend
npm install
npm run dev

Open: http://localhost:3001

What frontend does:

Fetches GET http://localhost:3000/users/export

Decodes protobuf using protobufjs

Verifies each user's signature in the browser using crypto.subtle (RSA-PSS + SHA-384)

Displays only verified users as ✅ and shows a bar chart of users created in the last 7 days

Crypto decisions & details

Hash algorithm: SHA-384 (as required)

Signature algorithm: RSA-PSS

Server signs the SHA-384 digest of the email using Node crypto.sign with RSA_PKCS1_PSS_PADDING and saltLength = RSA_PSS_SALTLEN_DIGEST (digest length).

Frontend imports public key using importKey('spki', <DER>) and verifies using subtle.verify with saltLength 48 (SHA-384 digest length).

Assumptions

synchronize: true TypeORM is allowed for this assignment.

For simplicity the backend generates a keypair at startup (if you want persistence across restarts, persist the key to disk).

users.proto must be identical in backend & frontend.

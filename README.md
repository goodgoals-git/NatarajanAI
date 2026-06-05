# NatarajanAI Reformed Frontend

A cinematic React interface for the NatarajanAI Reformed backend hosted on Hugging Face Spaces. The app provides authentication, MongoDB-backed chat synchronization, foldered conversation navigation, and prior-context reference recall.

## Backend integration

The frontend talks to the backend API at `https://goodgoals-natarajanreformed-backend.hf.space` by default. Override it locally with:

```bash
VITE_API_BASE_URL=http://localhost:7860 npm run dev
```

Integrated endpoints:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/chats/sidebar`
- `POST /api/chats/sync`
- `POST /api/chats/resolve-reference`

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

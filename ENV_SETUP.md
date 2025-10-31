# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Backend Setup

According to the API documentation (API.md), your backend should be running at:
- Base URL: `http://localhost:8000`

Make sure:
1. Your backend server is running
2. The backend is accessible at the URL above
3. You're logged in with a valid JWT token

## Testing the Connection

1. Create `.env.local` file with the API URL
2. Restart your Next.js dev server: `npm run dev`
3. Check the browser console for any fetch errors
4. The trips page will show an alert if it can't connect to the backend

## Troubleshooting

If you can't see your trips:

1. **Backend not running**: Start your backend server
2. **Wrong API URL**: Check that `NEXT_PUBLIC_API_URL` matches your backend
3. **Not authenticated**: Make sure you're logged in (check `/api/auth/users/me`)
4. **CORS issues**: Backend must allow requests from your frontend origin
5. **No trips created**: Create a trip using the "Create New Trip" form

## API Endpoints Used

- `GET /api/tripsync/my` - Fetch all trips for current user
- `POST /api/tripsync/` - Create a new trip
- `GET /api/tripsync/{trip_id}` - Get trip details



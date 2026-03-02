# Stream API Setup Guide

## Overview
The application now supports two separate API endpoints:
1. **Main API** (Node.js) - `NEXT_PUBLIC_API_URL` - http://localhost:5500/api
2. **Stream API** - `NEXT_PUBLIC_API_URL_STREAM` - http://192.168.2.199:8001

## Configuration

### Environment Variables (.env.development)
```env
NEXT_PUBLIC_API_URL=http://localhost:5500/api
NEXT_PUBLIC_API_URL_STREAM=http://192.168.2.199:8001
```

### Config File (packages/app/config/index.ts)
The config automatically picks up the environment variables:
```typescript
streamApiUrl: process.env.NEXT_PUBLIC_API_URL_STREAM || "http://192.168.2.199:8001"
```

## Using Different API Clients

### Main API (Node.js Backend)
```typescript
import API from "app/axiosbase";

// Use for all standard operations
const response = await API.post("/v1/pipeline/fetch", data);
const users = await API.get("/v1/users");
```

### Stream API
```typescript
import { STREAM_API } from "app/axiosbase";

// Use for Stream-specific operations (e.g., pipeline control)
const response = await STREAM_API.post("/v1/pipeline/start", { pipelineId });
const result = await STREAM_API.get("/v1/status");
```

## Current Implementation

### Pipeline Operations
The following pipeline operations now use the Stream API:

1. **Start Pipeline** - `startPipeline(pipelineId)`
   - Endpoint: `POST {STREAM_API}/v1/pipeline/start`
   - Uses: `STREAM_API.post()`

2. **Stop Pipeline** - `stopPipeline(pipelineId)`
   - Endpoint: `POST {STREAM_API}/v1/pipeline/stop`
   - Uses: `STREAM_API.post()`

3. **Restart Pipeline** - `restartPipeline(pipelineId)`
   - Endpoint: `POST {STREAM_API}/v1/pipeline/restart`
   - Uses: `STREAM_API.post()`

### Other Pipeline Operations (Still using Main API)
- Fetch Pipelines - uses main API
- Create Pipeline - uses main API
- Update Pipeline - uses main API
- Delete Pipeline - uses main API

## How to Add More Stream API Endpoints

### Step 1: Import STREAM_API
```typescript
import { STREAM_API } from "app/axiosbase";
```

### Step 2: Use STREAM_API instead of API
```typescript
// Before (Main API)
await API.post(API_ENDPOINTS.SOME_ENDPOINT, data);

// After (Stream API)
await STREAM_API.post(API_ENDPOINTS.SOME_ENDPOINT, data);
```

### Example: Adding a New Stream API Function
```typescript
import { STREAM_API } from "../axiosbase";

export const analyzeFrame = async (frameData: any): Promise<any> => {
  try {
    const response = await STREAM_API.post("/v1/analyze/frame", frameData);
    return response;
  } catch (error) {
    console.error("Error analyzing frame:", error);
    throw error;
  }
};
```

## API Client Features

Both `API` and `STREAM_API` support:
- ✅ GET, POST, PUT, PATCH, DELETE methods
- ✅ Automatic JSON serialization
- ✅ Error handling
- ✅ Timeout configuration
- ✅ Custom headers

### Main API Additional Features:
- ✅ Authentication token management
- ✅ Request/Response interceptors
- ✅ Automatic token refresh
- ✅ Auth logout handling

### Stream API:
- ✅ Separate base URL
- ✅ Independent configuration
- ✅ No auth interceptors (add if needed)

## Changing API URLs

### Development
Edit `.env.development`:
```env
NEXT_PUBLIC_API_URL_STREAM=http://new-stream-api-url:8001
```

### Production
Set environment variable in your deployment:
```bash
NEXT_PUBLIC_API_URL_STREAM=https://production-stream-api.com
```

## Testing

### Test Main API
```typescript
import API from "app/axiosbase";
const result = await API.get("/v1/health");
console.log("Main API:", result);
```

### Test Stream API
```typescript
import { STREAM_API } from "app/axiosbase";
const result = await STREAM_API.get("/v1/health");
console.log("Stream API:", result);
```

## Notes

- The Stream API client (`streamApiClient`) is a separate Axios instance
- Both APIs can run simultaneously without conflicts
- You can easily switch any endpoint between APIs by changing `API` to `STREAM_API`
- Add authentication to Stream API if needed by modifying `packages/app/axiosbase/index.ts`

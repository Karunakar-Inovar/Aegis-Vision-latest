# Frontend Pipeline Integration - Update Summary

## Overview
Updated frontend codebase to support pipeline-based camera streaming architecture with instance tracking. This enables the same camera to stream simultaneously in multiple pipelines with independent control.

## Changes Made

### 1. API Endpoints (`packages/app/constants/api-endpoints.ts`)
**Changed:** Updated pipeline control endpoints to match new backend API structure

```typescript
PIPELINE: {
  // ... other endpoints
  START: "/api/pipeline/start-video/",      // Was: "/ProcessVideo/StartVideoFeed/"
  STOP: "/api/pipeline/stop-video/",        // Was: "/StopFeed/StopVideoFeed/"
  RESTART: "/api/pipeline/restart-video/",  // Was: "/RestartVideo/RestartVideoFeed/"
}
```

### 2. Pipeline Utilities (`packages/app/utils/pipeline.ts`)
**Changed:** Updated all pipeline control functions to require `PipelineID` parameter

#### startPipeline
- **Added Parameter:** `PipelineID: number`
- **Added Return Field:** `instance_id?: string`
- **Request Body:** Now includes both `CameraID` and `PipelineID`

```typescript
export const startPipeline = async (
  CameraID: number, 
  PipelineID: number
): Promise<StartPipelineResponse>
```

#### stopPipeline
- **Added Parameter:** `PipelineID: number`
- **Request Body:** Now includes both `CameraID` and `PipelineID`

```typescript
export const stopPipeline = async (
  CameraID: number, 
  PipelineID: number
): Promise<void>
```

#### restartPipeline
- **Added Parameter:** `PipelineID: number` (removed hardcoded value)
- **Added Return Field:** `instance_id: string` (required field)
- **Request Body:** Now includes both `CameraID` and `PipelineID`

```typescript
export const restartPipeline = async (
  CameraID: number, 
  PipelineID: number
): Promise<RestartPipelineResponse>
```

### 3. WebRTC Stream Hook (`packages/app/hooks/useWebRTCStream.ts`)
**Changed:** Complete pipeline-awareness integration with instance tracking

#### Interface Changes
```typescript
interface UseWebRTCStreamProps {
  cameraId: number;
  pipelineId: number;  // NEW: Required parameter
  autoStart?: boolean;
  onError?: (error: string) => void;
  onStatusChange?: (status: string) => void;
  InputSourceStatus?: string;
}
```

#### State Management
- **Added State:** `const [instanceId, setInstanceId] = useState<string | null>(null);`
- **Purpose:** Tracks unique instance ID for this camera-pipeline combination

#### WebSocket Connection
**OLD URL:** `ws://localhost:8001/ws?camera_id=${cameraId}`

**NEW URL:** `ws://localhost:8001/ws/webrtc/?camera_id=${cameraId}&pipeline_id=${pipelineId}&instance_id=${instanceId}`

#### Key Changes in `startStream()`
```typescript
// 1. Call restartPipeline with pipelineId
const restartResponse = await restartPipeline(cameraId, pipelineId);

// 2. Validate instance_id received
if (!restartResponse.instance_id) {
  throw new Error("No instance_id received from server");
}

// 3. Store instance_id in state
setInstanceId(restartResponse.instance_id);

// 4. Build WebSocket URL with all three parameters
const wsUrl = `${WS_HOST}/ws/webrtc/?camera_id=${cameraId}&pipeline_id=${pipelineId}&instance_id=${restartResponse.instance_id}`;
```

#### Key Changes in `stopStream()`
```typescript
// 1. Clear instance_id when stopping
setInstanceId(null);

// 2. Pass pipelineId to stopPipeline
stopPipeline(cameraId, pipelineId);
```

#### Return Values
- **Added:** `instanceId` - exposed for debugging/monitoring

```typescript
return {
  videoRef,
  isConnected,
  status,
  uptime: formatUptime(uptime),
  instanceId,  // NEW
  startStream,
  stopStream,
};
```

### 4. Video Player Component (`packages/ui/src/templates/video-player.tsx`)
**Changed:** Made `pipelineId` required and passed to hook

#### Props Interface
```typescript
export interface VideoPlayerProps {
  cameraId: number;
  cameraName: string;
  pipelineId: number;  // Changed from optional to required
  // ... other props
}
```

#### Hook Usage
```typescript
const {
  videoRef,
  isConnected,
  status,
  uptime,
  instanceId,  // NEW
  startStream,
  stopStream,
} = useWebRTCStream({
  cameraId,
  pipelineId,  // NEW: Now passed to hook
  autoStart: autoStart && InputSourceStatus === 'Online',
  onError,
  InputSourceStatus,
  onStatusChange,
});
```

## Data Flow

```
User Action (Start Camera)
    ↓
VideoPlayer Component
    ↓ (cameraId, pipelineId)
useWebRTCStream Hook
    ↓ (POST /api/pipeline/restart-video/)
Backend API (RestartVideoFeed ViewSet)
    ↓ (Create instance, start GStreamer)
Response: { status, instance_id, message }
    ↓
Store instance_id in state
    ↓
Build WebSocket URL with 3 parameters
    ↓
ws://host/ws/webrtc/?camera_id=X&pipeline_id=Y&instance_id=UUID
    ↓
WebRTC Consumer validates parameters
    ↓
Stream cache lookup: cameraslist[{camera_id}_{pipeline_id}_{instance_id}]
    ↓
Video streaming established
```

## Breaking Changes

⚠️ **Components using `useWebRTCStream` must now provide `pipelineId`:**

```typescript
// OLD - Will cause TypeScript error
useWebRTCStream({ cameraId: 7 })

// NEW - Required parameter
useWebRTCStream({ cameraId: 7, pipelineId: 18 })
```

⚠️ **Components using pipeline control functions must pass `PipelineID`:**

```typescript
// OLD - Will cause TypeScript error
await startPipeline(cameraId);
await stopPipeline(cameraId);
await restartPipeline(cameraId);

// NEW - Required parameter
await startPipeline(cameraId, pipelineId);
await stopPipeline(cameraId, pipelineId);
await restartPipeline(cameraId, pipelineId);
```

## Validation Checklist

- [x] API endpoints updated to new paths
- [x] Pipeline utility functions accept `PipelineID` parameter
- [x] WebSocket URL includes all three required parameters
- [x] `instance_id` tracked in hook state
- [x] `VideoPlayer` component passes `pipelineId` to hook
- [ ] All parent components provide `pipelineId` prop to `VideoPlayer`
- [ ] Test WebSocket connection with real backend
- [ ] Verify multiple pipelines can stream same camera simultaneously
- [ ] Test stop/restart operations per pipeline

## Next Steps

1. **Find all VideoPlayer usages:** Search for components that render `<VideoPlayer />` and ensure they provide `pipelineId` prop

   ```bash
   grep -r "VideoPlayer" packages/app --include="*.tsx" --include="*.ts"
   ```

2. **Update parent components:** Any component rendering VideoPlayer needs pipeline context:

   ```typescript
   // Example update needed in parent components
   <VideoPlayer 
     cameraId={camera.id} 
     cameraName={camera.name}
     pipelineId={pipeline.id}  // Must be provided
   />
   ```

3. **Test WebSocket connection:** Restart backend, open browser console, start camera and verify:
   - WebSocket connects to: `ws://localhost:8001/ws/webrtc/?camera_id=X&pipeline_id=Y&instance_id=UUID`
   - No 1006 connection errors
   - Video stream loads successfully

4. **Multi-pipeline test:** Start same camera in 2 different pipelines and verify:
   - Both connections establish with different `instance_id` values
   - Stopping one pipeline doesn't affect the other
   - Each has independent WebRTC connection

## Files Modified

1. `packages/app/constants/api-endpoints.ts` - API endpoint paths
2. `packages/app/utils/pipeline.ts` - Pipeline control functions
3. `packages/app/hooks/useWebRTCStream.ts` - WebRTC streaming hook
4. `packages/ui/src/templates/video-player.tsx` - Video player component

## Troubleshooting

### WebSocket Error 1006
**Cause:** Missing or invalid query parameters in WebSocket URL

**Solution:** Verify all three parameters are present:
```
ws://host/ws/webrtc/?camera_id=7&pipeline_id=18&instance_id=abc-123-def
```

### TypeScript Errors
**Cause:** Missing required `pipelineId` parameter

**Solution:** Update component to provide pipelineId:
```typescript
<VideoPlayer cameraId={7} pipelineId={18} />
```

### Backend 400 Error
**Cause:** Old API endpoints or missing PipelineID in request body

**Solution:** Verify using new endpoints and including both CameraID and PipelineID in POST body

---

**Last Updated:** January 2025  
**Status:** Frontend integration complete, pending component updates and testing

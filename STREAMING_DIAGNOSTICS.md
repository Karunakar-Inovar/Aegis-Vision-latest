# WebRTC Streaming Diagnostics Guide

## Issues Fixed

### 1. ✅ Hardcoded Camera ID Removed
- **Problem**: Camera ID was hardcoded to `28` instead of using the prop
- **Fix**: Now correctly uses `cameraId` from component props

### 2. ✅ TypeScript Error Fixed
- **Problem**: `event.stream` doesn't exist on `RTCTrackEvent`
- **Fix**: Changed to `event.streams[0]` with proper null checks

### 3. ✅ Start API Call Re-enabled
- **Problem**: API call was commented out
- **Fix**: Now properly calls `/ProcessVideo/StartVideoFeed/` with error handling

### 4. ✅ Enhanced Logging
- **Added**: Detailed console logs for debugging at each step
- **Added**: ICE connection state monitoring
- **Added**: WebSocket message logging

## How to Debug Streaming Issues

### 1. Open Browser Console
Press `F12` and go to the Console tab to see detailed logs:

```
[WebRTC] Starting video feed for camera 7...
[WebRTC] Using API_BASE: http://192.168.2.199:8001
[WebRTC] StartVideoFeed response: {...}
[WebRTC] Connecting to WebSocket: ws://192.168.2.199:8001/ws?camera_id=7
WebSocket connected for camera 7
WebSocket message received: {...}
Parsed WS data: {...}
ICE connection state: checking
ICE connection state: connected
ontrack event received: {...}
Video srcObject set
```

### 2. Check Network Tab
1. Go to Network tab in DevTools
2. Filter by `WS` to see WebSocket connections
3. Check if WebSocket connects successfully
4. Look for any 400/500 errors

### 3. Common Issues & Solutions

#### Issue: WebSocket Connection Failed
**Symptoms**: Console shows "WebSocket connection error"
**Solutions**:
- Verify server is running on `http://192.168.2.199:8001`
- Check if WebSocket endpoint `/ws?camera_id=X` exists
- Ensure no firewall blocking port 8001
- Try accessing `http://192.168.2.199:8001` in browser

#### Issue: API Call Fails
**Symptoms**: "StartVideoFeed API error" in console
**Solutions**:
- Check if `/ProcessVideo/StartVideoFeed/` endpoint exists
- Verify CORS is enabled on server
- Check request payload format matches server expectations
- Verify camera ID is valid

#### Issue: No Video Stream
**Symptoms**: WebSocket connects but no video appears
**Solutions**:
- Check console for "ontrack event received"
- Verify "Video srcObject set" appears in logs
- Check ICE connection state (should be "connected")
- Ensure server is sending video tracks
- Check browser supports video codec being sent

#### Issue: CORS Error
**Symptoms**: "Access to fetch blocked by CORS policy"
**Solutions**:
Add to your server configuration:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. Test WebSocket Connection Manually

Open browser console and run:
```javascript
const ws = new WebSocket('ws://192.168.2.199:8001/ws?camera_id=28');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Message:', e.data);
ws.onerror = (e) => console.error('Error:', e);
```

### 5. Server Requirements

Your streaming server should:
1. Accept POST to `/ProcessVideo/StartVideoFeed/` with `{ CameraID: number }`
2. Provide WebSocket endpoint at `/ws?camera_id={id}`
3. Send WebRTC offer via WebSocket:
   ```json
   {
     "type": "offer",
     "sdp": "v=0\r\no=- ..."
   }
   ```
4. Handle WebRTC answer from client
5. Exchange ICE candidates:
   ```json
   {
     "type": "ice",
     "candidate": "...",
     "sdpMLineIndex": 0,
     "sdpMid": "0"
   }
   ```

### 6. Configuration Check

**Current Settings:**
- API Base: `http://192.168.2.199:8001`
- WebSocket: `ws://192.168.2.199:8001/ws?camera_id={id}`
- Stream API config in: `packages/app/config/index.ts`

**To Change:**
Set environment variable:
```bash
NEXT_PUBLIC_API_URL_STREAM=http://your-server:port
```

### 7. Quick Test Checklist

- [ ] Server is running on `192.168.2.199:8001`
- [ ] Can access server URL in browser
- [ ] CORS is configured on server
- [ ] WebSocket endpoint `/ws` is available
- [ ] StartVideoFeed endpoint exists
- [ ] Camera ID is valid
- [ ] Browser console shows detailed logs
- [ ] No errors in Network tab
- [ ] WebSocket shows "connected" status
- [ ] ICE connection reaches "connected" state

### 8. Video Feed Flow

```
User clicks Play
    ↓
Call /ProcessVideo/StartVideoFeed/ (CameraID)
    ↓
Connect WebSocket (ws://...?camera_id=X)
    ↓
Receive WebRTC Offer from server
    ↓
Create WebRTC Answer and send back
    ↓
Exchange ICE candidates
    ↓
ICE connection established
    ↓
Receive video track (ontrack event)
    ↓
Set video.srcObject
    ↓
Video plays!
```

## Next Steps

1. Click Play button on a camera feed
2. Open browser console (F12)
3. Check the logs to see where it fails
4. Share the console output for further debugging

## Contact Points for Debugging

- WebRTC Hook: `packages/app/hooks/useWebRTCStream.ts`
- Video Player: `packages/ui/src/video-player.tsx`
- API Config: `packages/app/config/index.ts`
- Dashboard: `apps/web/app/monitor/dashboard/page.tsx`

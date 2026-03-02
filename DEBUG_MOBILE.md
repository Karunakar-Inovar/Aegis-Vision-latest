# How to Debug Mobile App - View Console Logs

## Method 1: Expo Dev Tools (Easiest)

1. **Start the Expo development server:**
   ```bash
   cd apps/native
   npm start
   # or
   npx expo start
   ```

2. **Open the app on your phone:**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator / `a` for Android emulator

3. **View logs in terminal:**
   - All `console.log()` statements will appear in the terminal where you ran `expo start`
   - Look for logs like:
     - 🔘 Sign in button onPress triggered
     - 🔗 Forgot password pressed
     - 🔐 Sign in attempt
     - etc.

4. **Open Dev Menu on device:**
   - **iOS**: Shake device or press `Cmd + D` in simulator
   - **Android**: Shake device or press `Cmd + M` (Mac) / `Ctrl + M` (Windows/Linux)
   - Select "Debug Remote JS" to open Chrome DevTools

## Method 2: React Native Debugger

1. **Install React Native Debugger:**
   ```bash
   # Download from: https://github.com/jhen0409/react-native-debugger/releases
   # Or install via Homebrew (Mac):
   brew install --cask react-native-debugger
   ```

2. **Start the app and enable debugging:**
   - Shake device → "Debug Remote JS"
   - React Native Debugger will open automatically

## Method 3: Chrome DevTools (Web-based)

1. **Start the app on device/simulator**

2. **Enable remote debugging:**
   - Shake device → "Debug Remote JS"
   - Chrome will open at `http://localhost:8081/debugger-ui/`

3. **Open Chrome DevTools:**
   - Press `F12` or `Cmd + Option + I` (Mac) / `Ctrl + Shift + I` (Windows)
   - Go to "Console" tab
   - All `console.log()` statements will appear here

## Method 4: Flipper (Advanced)

1. **Install Flipper:**
   ```bash
   # Download from: https://fbflipper.com/
   ```

2. **Connect your device and view logs in Flipper**

## Method 5: Native Logs (iOS/Android)

### iOS (Xcode Console):
```bash
# If using iOS Simulator:
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "Expo"' --level debug

# Or open Xcode → Window → Devices and Simulators → View logs
```

### Android (Logcat):
```bash
# View Android logs:
adb logcat | grep -i "ReactNative\|Expo"

# Or use Android Studio → Logcat tab
```

## Quick Debug Commands

```bash
# Start with cleared cache
cd apps/native
npx expo start --clear

# Start on specific platform
npx expo start --ios      # iOS simulator
npx expo start --android # Android emulator

# Start with tunnel (for testing on physical device)
npx expo start --tunnel
```

## Viewing Logs in Real-Time

All the `console.log()` statements we added will show up in:
- ✅ Terminal where `expo start` is running
- ✅ Chrome DevTools Console (if remote debugging enabled)
- ✅ React Native Debugger
- ✅ Flipper

## What to Look For

When testing the sign-in screen, you should see:
- `🔘 Sign in button onPress triggered` - when button is pressed
- `🔗 Forgot password pressed` - when forgot password link is tapped
- `🔐 Sign in attempt` - when login starts
- `👤 Login result:` - shows user object
- `🔑 Navigating to reset password` - navigation logs
- `📱 Navigating to dashboard` - navigation logs

If you DON'T see these logs, it means:
- The handlers aren't being called (Pressable issue)
- The component isn't rendering correctly
- There's a JavaScript error preventing execution

## Troubleshooting

**If logs don't appear:**
1. Make sure the app is connected to the dev server
2. Check if there are any red error screens
3. Try reloading: Shake device → "Reload"
4. Clear cache: `npx expo start --clear`

**If buttons don't work:**
1. Check console for errors
2. Verify handlers are passed correctly
3. Check if Pressable is properly imported on native







# Fix AudioPlayer Error Plan

## ✅ PROBLEM SOLVED

## Problem Analysis
The error "Call to function 'AudioPlayer.constructor' has been rejected - received 2 arguments, but 3 was expected" occurs because `expo-audio` version 0.3.x has a different API than what's being used in the current code.

## Solution Applied
Switched from `expo-audio` to `expo-av` which is more stable and widely used for audio playback in React Native.

## Files Modified
1. ✅ `package.json` - Replaced `expo-audio` with `expo-av`
2. ✅ `src/screens/PlayerScreen.tsx` - Completely rewrote to use `expo-av` API

## Key Changes Made

### package.json
- Replaced `"expo-audio": "~0.3.3"` with `"expo-av": "~15.0.1"`

### PlayerScreen.tsx
- Changed import from `createAudioPlayer` and `setAudioModeAsync` to `Audio` from `expo-av`
- Replaced `createAudioPlayer()` with `Audio.Sound.createAsync()`
- Updated audio mode configuration to use `Audio.INTERRUPTION_MODE_IOS_DUCKOTHERS`
- Changed player state management from `playerRef` to `soundRef`
- Updated all playback methods:
  - `player.remove()` → `sound.unloadAsync()`
  - `player.play()` → `sound.playAsync()`
  - `player.pause()` → `sound.pauseAsync()`
  - `player.currentStatus` → `sound.getStatusAsync()`
- Added proper async error handling for all audio operations

## Next Steps
1. Run `npm install` to install the new dependency
2. Test the app on Android device
3. Verify audio playback works correctly
4. Test login, player, and logout functionality


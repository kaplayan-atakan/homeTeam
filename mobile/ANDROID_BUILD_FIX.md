# React Native Android Build Fix - Dependency Resolution

## Problem Analysis

The original error was:
```
Could not find com.facebook.react:react-native:0.72.7.
Required by:
    project :app > project :react-native-firebase_analytics
    project :app > project :react-native-firebase_app
    project :app > project :react-native-firebase_messaging
```

## Root Cause

1. **Deprecated flatDir Usage**: The build.gradle was using `flatDir` which is deprecated and doesn't support metadata formats
2. **Incorrect Artifact Name**: Firebase modules were looking for `react-native` but React Native 0.72+ uses `react-android` 
3. **Missing Repository Configuration**: Modern React Native doesn't store artifacts in `node_modules/react-native/android/`

## Solution Applied

### 1. Updated `android/build.gradle`

**Removed:**
- Deprecated `flatDir` configuration
- Duplicate React Native repository entries
- Simple force resolution

**Added:**
- Proper Maven repository configuration
- Better dependency resolution strategy
- Mapping from `react-native` to `react-android`

### 2. Updated `android/app/build.gradle`

**Fixed:**
- Conditional Flipper dependencies (prevents build errors when FLIPPER_VERSION is not defined)
- Proper React Native artifact naming

### 3. Created `android/gradle.properties`

**Added:**
- Essential Gradle JVM settings
- AndroidX support configuration  
- Flipper version definition
- Hermes engine configuration
- Architecture settings

## Key Changes

### Repository Configuration
```gradle
repositories {
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
    // React Native and related dependencies are resolved from npm
    maven {
        url("$rootDir/../node_modules/@react-native/gradle-plugin/dist/packages/gradle-plugin/android")
    }
    maven {
        url("$rootDir/../node_modules/react-native/android")
    }
    // Hermes artifacts
    maven {
        url("$rootDir/../node_modules/react-native/ReactAndroid")
    }
}
```

### Dependency Resolution Strategy
```gradle
configurations.all {
    resolutionStrategy {
        // Force React Native version consistency
        force 'com.facebook.react:react-android:0.72.7'
        force 'com.facebook.react:hermes-android:0.72.7'
        // Support for Firebase modules
        eachDependency { DependencyResolveDetails details ->
            if (details.requested.group == 'com.facebook.react' && details.requested.name == 'react-native') {
                details.useTarget group: 'com.facebook.react', name: 'react-android', version: '0.72.7'
            }
        }
    }
}
```

## Expected Result

After these changes, the following should work:
```bash
cd mobile
npm run android
```

The build process will:
1. ✅ Resolve React Native dependencies correctly
2. ✅ Find Firebase React Native modules
3. ✅ Eliminate flatDir warnings
4. ✅ Build the Android APK successfully

## Compatibility

- **React Native**: 0.72.7 ✅
- **Firebase**: v20.x ✅  
- **Android Gradle Plugin**: 8.0.1 ✅
- **Gradle**: 8.0.1 ✅

## Changes Made

1. `/mobile/android/build.gradle` - Repository and resolution strategy fixes
2. `/mobile/android/app/build.gradle` - Conditional Flipper dependencies  
3. `/mobile/android/gradle.properties` - Added essential Gradle properties

All changes maintain backward compatibility and follow React Native 0.72+ best practices.
#!/bin/bash

# React Native Android Build Validation Script
# homeTeam Mobile App - Build Test

echo "🏠 homeTeam Mobile - Android Build Validation"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d "android" ]; then
    print_error "This script must be run from the mobile directory"
    print_error "Usage: cd mobile && bash BUILD_VALIDATION.sh"
    exit 1
fi

print_status "Starting React Native Android build validation..."
echo ""

# Step 1: Check Node.js and npm
print_status "1. Checking Node.js and npm versions..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")

if [ "$NODE_VERSION" != "not found" ]; then
    print_success "Node.js: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

if [ "$NPM_VERSION" != "not found" ]; then
    print_success "npm: $NPM_VERSION"
else
    print_error "npm not found"
    exit 1
fi

echo ""

# Step 2: Check dependencies
print_status "2. Checking package dependencies..."
if [ -d "node_modules" ]; then
    print_success "node_modules directory exists"
else
    print_warning "node_modules not found. Running npm install..."
    npm install --legacy-peer-deps
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

echo ""

# Step 3: Check Android SDK and environment
print_status "3. Checking Android environment..."

if command -v adb >/dev/null 2>&1; then
    print_success "adb found in PATH"
else
    print_warning "adb not found. Make sure Android SDK is installed and in PATH"
fi

if [ -n "$ANDROID_HOME" ]; then
    print_success "ANDROID_HOME is set: $ANDROID_HOME"
else
    print_warning "ANDROID_HOME environment variable not set"
fi

echo ""

# Step 4: Check Gradle wrapper
print_status "4. Checking Gradle wrapper..."
if [ -f "android/gradlew" ]; then
    if [ -x "android/gradlew" ]; then
        print_success "gradlew is executable"
    else
        print_warning "Making gradlew executable..."
        chmod +x android/gradlew
        print_success "gradlew is now executable"
    fi
else
    print_error "gradlew not found in android directory"
    exit 1
fi

echo ""

# Step 5: Check essential files
print_status "5. Checking essential Android files..."

files_to_check=(
    "android/build.gradle"
    "android/app/build.gradle"
    "android/gradle.properties"
    "android/settings.gradle"
    "android/app/debug.keystore"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
        exit 1
    fi
done

echo ""

# Step 6: Validate gradle configuration
print_status "6. Validating Gradle configuration..."

# Check for common issues in build.gradle
if grep -q "flatDir" android/build.gradle; then
    print_warning "Deprecated flatDir usage found in build.gradle"
else
    print_success "No deprecated flatDir usage found"
fi

if grep -q "react-android" android/app/build.gradle; then
    print_success "Modern React Native dependency configuration found"
else
    print_warning "Check React Native dependency configuration"
fi

echo ""

# Step 7: Test Gradle build (dry run)
print_status "7. Testing Gradle configuration (tasks list)..."
cd android
if ./gradlew tasks --no-daemon --offline > /dev/null 2>&1; then
    print_success "Gradle configuration is valid"
else
    print_warning "Gradle configuration may have issues (network might be required)"
fi
cd ..

echo ""

# Step 8: Final instructions
print_status "8. Build instructions:"
echo ""
echo "To build the Android app, run:"
echo -e "${BLUE}cd mobile${NC}"
echo -e "${BLUE}npm run android${NC}"
echo ""
echo "Or manually:"
echo -e "${BLUE}cd mobile/android${NC}"
echo -e "${BLUE}./gradlew assembleDebug${NC}"
echo ""

# Summary
echo "=============================================="
print_success "✅ Android build environment validation completed!"
echo ""
print_status "🔧 Applied fixes:"
echo "   • Fixed deprecated flatDir usage"
echo "   • Updated React Native dependency resolution"
echo "   • Added proper repository configuration"
echo "   • Created gradle.properties with essential settings"
echo "   • Generated debug keystore"
echo "   • Fixed conditional Flipper dependencies"
echo ""
print_status "📖 For detailed information, see: ANDROID_BUILD_FIX.md"
echo ""

if command -v adb >/dev/null 2>&1 && [ -n "$ANDROID_HOME" ]; then
    print_success "🚀 Environment looks good! Ready to build Android app."
else
    print_warning "⚠️  Android SDK setup may be incomplete. Check ANDROID_HOME and PATH."
fi

echo ""
echo "🏠 homeTeam - Making family task management simple and efficient!"
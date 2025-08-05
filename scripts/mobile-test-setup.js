#!/usr/bin/env node

/**
 * homeTeam Mobile App Test & Setup Script
 * Bu script mobile uygulamanın test ortamını hazırlar ve çalıştırır
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MobileTestSetup {
    constructor() {
        this.baseDir = process.cwd();
        this.mobileDir = path.join(this.baseDir, 'mobile');
        this.backendDir = path.join(this.baseDir, 'backend');
        this.colors = {
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            reset: '\x1b[0m'
        };
    }

    log(message, color = 'reset') {
        console.log(`${this.colors[color]}${message}${this.colors.reset}`);
    }

    error(message) {
        this.log(`❌ ERROR: ${message}`, 'red');
    }

    success(message) {
        this.log(`✅ SUCCESS: ${message}`, 'green');
    }

    warning(message) {
        this.log(`⚠️  WARNING: ${message}`, 'yellow');
    }

    info(message) {
        this.log(`ℹ️  INFO: ${message}`, 'blue');
    }

    async checkPrerequisites() {
        this.info('🔍 Checking prerequisites...');

        // Node.js version check
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
            if (majorVersion >= 18) {
                this.success(`Node.js version: ${nodeVersion}`);
            } else {
                this.error(`Node.js version ${nodeVersion} is too old. Minimum required: v18`);
                return false;
            }
        } catch (error) {
            this.error('Node.js not found');
            return false;
        }

        // React Native CLI check
        try {
            execSync('npx react-native --version', { encoding: 'utf8', stdio: 'ignore' });
            this.success('React Native CLI available');
        } catch (error) {
            this.warning('React Native CLI not found globally. Will use npx.');
        }

        // Java check (for Android)
        try {
            const javaVersion = execSync('java -version 2>&1', { encoding: 'utf8' });
            if (javaVersion.includes('11') || javaVersion.includes('17') || javaVersion.includes('21')) {
                this.success('Java JDK found');
            } else {
                this.warning('Java version may be incompatible. JDK 11+ recommended.');
            }
        } catch (error) {
            this.warning('Java JDK not found. Android builds may fail.');
        }

        return true;
    }

    async checkBackendStatus() {
        this.info('🔍 Checking backend status...');

        try {
            const response = await fetch('http://localhost:3001/api/test');
            if (response.ok) {
                this.success('Backend API is running on port 3001');
                return true;
            } else {
                this.error('Backend API not responding correctly');
                return false;
            }
        } catch (error) {
            this.warning('Backend API not accessible. Starting backend...');
            return this.startBackend();
        }
    }

    async startBackend() {
        try {
            this.info('🚀 Starting backend server...');
            process.chdir(this.baseDir);
            
            // Check if npm script exists
            const packageJsonPath = path.join(this.baseDir, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.scripts && packageJson.scripts['dev:backend']) {
                    spawn('npm', ['run', 'dev:backend'], {
                        stdio: 'inherit',
                        detached: true,
                        shell: true
                    });
                    
                    // Wait for backend to start
                    this.info('⏳ Waiting for backend to start...');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    
                    return await this.checkBackendStatus();
                }
            }
            
            this.error('Backend npm script not found');
            return false;
        } catch (error) {
            this.error(`Failed to start backend: ${error.message}`);
            return false;
        }
    }

    async setupMobileEnvironment() {
        this.info('📱 Setting up mobile environment...');

        // Check if mobile directory exists
        if (!fs.existsSync(this.mobileDir)) {
            this.error('Mobile directory not found');
            return false;
        }

        process.chdir(this.mobileDir);

        // Create .env file if it doesn't exist
        const envPath = path.join(this.mobileDir, '.env');
        const envTemplatePath = path.join(this.mobileDir, '.env.template');
        
        if (!fs.existsSync(envPath) && fs.existsSync(envTemplatePath)) {
            fs.copyFileSync(envTemplatePath, envPath);
            this.success('Created .env file from template');
        }

        // Install dependencies
        try {
            this.info('📦 Installing mobile dependencies...');
            execSync('npm install', { stdio: 'inherit' });
            this.success('Mobile dependencies installed');
        } catch (error) {
            this.error(`Failed to install mobile dependencies: ${error.message}`);
            return false;
        }

        // iOS setup (if on macOS)
        if (process.platform === 'darwin') {
            try {
                this.info('🍎 Setting up iOS dependencies...');
                process.chdir(path.join(this.mobileDir, 'ios'));
                execSync('pod install', { stdio: 'inherit' });
                this.success('iOS dependencies installed');
                process.chdir(this.mobileDir);
            } catch (error) {
                this.warning(`iOS setup failed: ${error.message}`);
            }
        }

        return true;
    }

    async startMetroBundler() {
        this.info('📦 Starting Metro bundler...');
        
        try {
            const metro = spawn('npm', ['start'], {
                stdio: 'inherit',
                detached: true,
                shell: true,
                cwd: this.mobileDir
            });

            this.success('Metro bundler started');
            return metro;
        } catch (error) {
            this.error(`Failed to start Metro bundler: ${error.message}`);
            return null;
        }
    }

    async detectAndroidDevices() {
        try {
            const devices = execSync('adb devices', { encoding: 'utf8' });
            const lines = devices.split('\n').filter(line => line.includes('device') && !line.includes('List'));
            
            if (lines.length > 0) {
                this.success(`Found ${lines.length} Android device(s)/emulator(s)`);
                return true;
            } else {
                this.warning('No Android devices/emulators found');
                return false;
            }
        } catch (error) {
            this.warning('ADB not found or Android SDK not configured');
            return false;
        }
    }

    async buildAndRunAndroid() {
        this.info('🤖 Building and running Android app...');
        
        try {
            process.chdir(this.mobileDir);
            execSync('npx react-native run-android', { stdio: 'inherit' });
            this.success('Android app launched successfully');
            return true;
        } catch (error) {
            this.error(`Android build failed: ${error.message}`);
            this.info('💡 Troubleshooting tips:');
            this.info('   1. Make sure Android emulator is running');
            this.info('   2. Check if USB debugging is enabled on device');
            this.info('   3. Try: adb devices to see connected devices');
            this.info('   4. Clear cache: npm start --reset-cache');
            return false;
        }
    }

    async buildAndRunIOS() {
        if (process.platform !== 'darwin') {
            this.warning('iOS development requires macOS');
            return false;
        }

        this.info('🍎 Building and running iOS app...');
        
        try {
            process.chdir(this.mobileDir);
            execSync('npx react-native run-ios', { stdio: 'inherit' });
            this.success('iOS app launched successfully');
            return true;
        } catch (error) {
            this.error(`iOS build failed: ${error.message}`);
            this.info('💡 Troubleshooting tips:');
            this.info('   1. Make sure Xcode is installed');
            this.info('   2. Try: npx react-native run-ios --simulator="iPhone 14"');
            this.info('   3. Clean build: rm -rf ios/build');
            return false;
        }
    }

    async showTestInstructions() {
        this.info('📋 Test Instructions:');
        console.log('\n' + '='.repeat(50));
        this.log('🎯 Test Scenarios to Execute:', 'yellow');
        console.log('\n1. Authentication Tests:');
        console.log('   - Register with: test@hometeam.com / Test123!');
        console.log('   - Login with created account');
        console.log('   - Test logout functionality');
        
        console.log('\n2. Dashboard Tests:');
        console.log('   - Verify dashboard loads');
        console.log('   - Check task statistics');
        console.log('   - Test navigation between screens');
        
        console.log('\n3. Task Management Tests:');
        console.log('   - Create new task');
        console.log('   - View task list');
        console.log('   - Update task status');
        console.log('   - Delete task');
        
        console.log('\n4. Real-time Tests:');
        console.log('   - Test WebSocket connection');
        console.log('   - Verify live updates');
        
        console.log('\n5. Navigation Tests:');
        console.log('   - Test all screen transitions');
        console.log('   - Verify back navigation');
        console.log('   - Test deep linking (if implemented)');
        
        console.log('\n' + '='.repeat(50));
        this.log('📱 For detailed testing guide, see: docs/MOBILE_APP_TESTING_GUIDE.md', 'blue');
        console.log('');
    }

    async run() {
        console.log('\n🚀 homeTeam Mobile App Test Setup\n');

        // Step 1: Check prerequisites
        const prereqCheck = await this.checkPrerequisites();
        if (!prereqCheck) {
            this.error('Prerequisites check failed. Please install required software.');
            process.exit(1);
        }

        // Step 2: Check backend
        const backendCheck = await this.checkBackendStatus();
        if (!backendCheck) {
            this.error('Backend setup failed. Please check backend configuration.');
            process.exit(1);
        }

        // Step 3: Setup mobile environment
        const mobileSetup = await this.setupMobileEnvironment();
        if (!mobileSetup) {
            this.error('Mobile environment setup failed.');
            process.exit(1);
        }

        // Step 4: Start Metro bundler
        await this.startMetroBundler();
        
        // Wait for Metro to initialize
        this.info('⏳ Waiting for Metro bundler to initialize...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Step 5: Platform selection
        const args = process.argv.slice(2);
        const platform = args[0] || 'android';

        if (platform === 'android') {
            const hasAndroidDevices = await this.detectAndroidDevices();
            if (hasAndroidDevices) {
                await this.buildAndRunAndroid();
            } else {
                this.warning('Please start an Android emulator and run: npm run test:mobile android');
            }
        } else if (platform === 'ios') {
            await this.buildAndRunIOS();
        } else {
            this.error(`Unknown platform: ${platform}. Use 'android' or 'ios'`);
            process.exit(1);
        }

        // Step 6: Show test instructions
        await this.showTestInstructions();
    }
}

// Main execution
if (require.main === module) {
    const setup = new MobileTestSetup();
    setup.run().catch(error => {
        console.error('❌ Test setup failed:', error);
        process.exit(1);
    });
}

module.exports = MobileTestSetup;

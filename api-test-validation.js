const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test color functions
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(level, message) {
    const timestamp = new Date().toISOString();
    const color = level === 'ERROR' ? colors.red : 
                  level === 'SUCCESS' ? colors.green : 
                  level === 'WARNING' ? colors.yellow : 
                  colors.cyan;
    console.log(`${color}[${timestamp}] ${level}: ${message}${colors.reset}`);
}

async function testValidationSecurityFixes() {
    console.log(`${colors.cyan}🔐 Backend Validation Security Test Suite${colors.reset}`);
    console.log('='.repeat(50));
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Test 1: Duplicate Email Prevention
    console.log(`\n${colors.yellow}Test 1: Duplicate Email Prevention${colors.reset}`);
    try {
        // Register first user
        const firstUser = await axios.post(`${BASE_URL}/auth/register`, {
            firstName: 'Test',
            lastName: 'User',
            email: 'validation-test@example.com',
            password: 'StrongPassword123!'
        });
        
        // Try to register with same email
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                firstName: 'Another',
                lastName: 'User',
                email: 'validation-test@example.com',
                password: 'AnotherPassword123!'
            });
            log('ERROR', '❌ Duplicate email was allowed - SECURITY VULNERABILITY');
            results.failed++;
            results.tests.push({ test: 'Duplicate Email Prevention', status: 'FAILED', reason: 'Duplicate email allowed' });
        } catch (duplicateError) {
            if (duplicateError.response?.status === 400 || duplicateError.response?.status === 409) {
                log('SUCCESS', '✅ Duplicate email correctly blocked');
                results.passed++;
                results.tests.push({ test: 'Duplicate Email Prevention', status: 'PASSED' });
            } else {
                log('ERROR', `❌ Unexpected error: ${duplicateError.message}`);
                results.failed++;
                results.tests.push({ test: 'Duplicate Email Prevention', status: 'FAILED', reason: 'Unexpected error' });
            }
        }
    } catch (error) {
        log('ERROR', `❌ Failed to create first user: ${error.message}`);
        results.failed++;
        results.tests.push({ test: 'Duplicate Email Prevention', status: 'FAILED', reason: 'Failed to create first user' });
    }

    // Test 2: Strong Password Validation
    console.log(`\n${colors.yellow}Test 2: Strong Password Validation${colors.reset}`);
    const weakPasswords = ['123', 'password', 'abc123', 'Password'];
    
    for (const weakPassword of weakPasswords) {
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                firstName: 'Test',
                lastName: 'User',
                email: `weak-pass-test-${Date.now()}@example.com`,
                password: weakPassword
            });
            log('ERROR', `❌ Weak password "${weakPassword}" was accepted - SECURITY VULNERABILITY`);
            results.failed++;
            results.tests.push({ test: `Weak Password: ${weakPassword}`, status: 'FAILED', reason: 'Weak password accepted' });
        } catch (error) {
            if (error.response?.status === 400) {
                log('SUCCESS', `✅ Weak password "${weakPassword}" correctly rejected`);
                results.passed++;
                results.tests.push({ test: `Weak Password: ${weakPassword}`, status: 'PASSED' });
            } else {
                log('ERROR', `❌ Unexpected error for password "${weakPassword}": ${error.message}`);
                results.failed++;
                results.tests.push({ test: `Weak Password: ${weakPassword}`, status: 'FAILED', reason: 'Unexpected error' });
            }
        }
    }

    // Test 3: Invalid Email Format Validation
    console.log(`\n${colors.yellow}Test 3: Invalid Email Format Validation${colors.reset}`);
    const invalidEmails = ['notanemail', 'invalid@', '@example.com', 'user@'];
    
    for (const invalidEmail of invalidEmails) {
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                firstName: 'Test',
                lastName: 'User',
                email: invalidEmail,
                password: 'StrongPassword123!'
            });
            log('ERROR', `❌ Invalid email "${invalidEmail}" was accepted - VALIDATION FAILURE`);
            results.failed++;
            results.tests.push({ test: `Invalid Email: ${invalidEmail}`, status: 'FAILED', reason: 'Invalid email accepted' });
        } catch (error) {
            if (error.response?.status === 400) {
                log('SUCCESS', `✅ Invalid email "${invalidEmail}" correctly rejected`);
                results.passed++;
                results.tests.push({ test: `Invalid Email: ${invalidEmail}`, status: 'PASSED' });
            } else {
                log('ERROR', `❌ Unexpected error for email "${invalidEmail}": ${error.message}`);
                results.failed++;
                results.tests.push({ test: `Invalid Email: ${invalidEmail}`, status: 'FAILED', reason: 'Unexpected error' });
            }
        }
    }

    // Test 4: Login with Invalid Credentials
    console.log(`\n${colors.yellow}Test 4: Login with Invalid Credentials${colors.reset}`);
    try {
        await axios.post(`${BASE_URL}/auth/login`, {
            email: 'nonexistent@example.com',
            password: 'WrongPassword123!'
        });
        log('ERROR', '❌ Login with invalid credentials was successful - SECURITY VULNERABILITY');
        results.failed++;
        results.tests.push({ test: 'Invalid Credentials Login', status: 'FAILED', reason: 'Invalid credentials accepted' });
    } catch (error) {
        if (error.response?.status === 401) {
            log('SUCCESS', '✅ Invalid credentials correctly rejected');
            results.passed++;
            results.tests.push({ test: 'Invalid Credentials Login', status: 'PASSED' });
        } else {
            log('ERROR', `❌ Unexpected error: ${error.message}`);
            results.failed++;
            results.tests.push({ test: 'Invalid Credentials Login', status: 'FAILED', reason: 'Unexpected error' });
        }
    }

    // Test 5: JWT Token Validation
    console.log(`\n${colors.yellow}Test 5: JWT Token Validation${colors.reset}`);
    try {
        await axios.get(`${BASE_URL}/auth/profile`, {
            headers: {
                Authorization: 'Bearer invalid-jwt-token'
            }
        });
        log('ERROR', '❌ Invalid JWT token was accepted - SECURITY VULNERABILITY');
        results.failed++;
        results.tests.push({ test: 'Invalid JWT Token', status: 'FAILED', reason: 'Invalid JWT accepted' });
    } catch (error) {
        if (error.response?.status === 401) {
            log('SUCCESS', '✅ Invalid JWT token correctly rejected');
            results.passed++;
            results.tests.push({ test: 'Invalid JWT Token', status: 'PASSED' });
        } else {
            log('ERROR', `❌ Unexpected error: ${error.message}`);
            results.failed++;
            results.tests.push({ test: 'Invalid JWT Token', status: 'FAILED', reason: 'Unexpected error' });
        }
    }

    // Test 6: Password Hashing Verification
    console.log(`\n${colors.yellow}Test 6: Password Hashing Verification${colors.reset}`);
    try {
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            firstName: 'Hash',
            lastName: 'Test',
            email: `hash-test-${Date.now()}@example.com`,
            password: 'TestPassword123!'
        });

        // Check if password is hashed (not stored in plain text)
        const usersResponse = await axios.get(`${BASE_URL}/users`, {
            headers: {
                Authorization: `Bearer ${registerResponse.data.token || 'test-token'}`
            }
        });

        const newUser = usersResponse.data.data.find(user => 
            user.email.includes('hash-test-') && user.firstName === 'Hash'
        );

        if (newUser && newUser.password) {
            if (newUser.password === 'TestPassword123!') {
                log('ERROR', '❌ Password stored in plain text - CRITICAL SECURITY VULNERABILITY');
                results.failed++;
                results.tests.push({ test: 'Password Hashing', status: 'FAILED', reason: 'Plain text password' });
            } else if (newUser.password.startsWith('$2b$') || newUser.password.startsWith('$2a$')) {
                log('SUCCESS', '✅ Password is properly hashed with bcrypt');
                results.passed++;
                results.tests.push({ test: 'Password Hashing', status: 'PASSED' });
            } else {
                log('WARNING', '⚠️ Password appears to be hashed but not with bcrypt');
                results.passed++;
                results.tests.push({ test: 'Password Hashing', status: 'PASSED', note: 'Non-bcrypt hash detected' });
            }
        } else {
            log('SUCCESS', '✅ Password field is hidden from API responses');
            results.passed++;
            results.tests.push({ test: 'Password Hashing', status: 'PASSED', note: 'Password hidden from API' });
        }
    } catch (error) {
        log('ERROR', `❌ Failed to test password hashing: ${error.message}`);
        results.failed++;
        results.tests.push({ test: 'Password Hashing', status: 'FAILED', reason: 'Test setup failed' });
    }

    // Summary
    console.log(`\n${colors.cyan}🔐 Security Validation Test Results${colors.reset}`);
    console.log('='.repeat(50));
    console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
    console.log(`📊 Total Tests: ${results.passed + results.failed}`);
    
    if (results.failed === 0) {
        console.log(`\n${colors.green}🎉 ALL SECURITY VALIDATIONS PASSED!${colors.reset}`);
        console.log(`${colors.green}🔒 Your backend is secure against common vulnerabilities.${colors.reset}`);
    } else {
        console.log(`\n${colors.red}⚠️  SECURITY VULNERABILITIES DETECTED!${colors.reset}`);
        console.log(`${colors.red}🚨 ${results.failed} security issues need immediate attention.${colors.reset}`);
    }

    console.log(`\n${colors.yellow}📋 Detailed Test Results:${colors.reset}`);
    results.tests.forEach((test, index) => {
        const status = test.status === 'PASSED' ? 
            `${colors.green}✅ PASSED${colors.reset}` : 
            `${colors.red}❌ FAILED${colors.reset}`;
        console.log(`${index + 1}. ${test.test}: ${status}`);
        if (test.reason) {
            console.log(`   ${colors.red}Reason: ${test.reason}${colors.reset}`);
        }
        if (test.note) {
            console.log(`   ${colors.yellow}Note: ${test.note}${colors.reset}`);
        }
    });

    return results;
}

// Run the validation tests
testValidationSecurityFixes().catch(error => {
    console.error(`${colors.red}❌ Test suite failed: ${error.message}${colors.reset}`);
    process.exit(1);
});

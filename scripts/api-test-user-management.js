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
    const levelColors = {
        SUCCESS: colors.green,
        ERROR: colors.red,
        WARNING: colors.yellow,
        INFO: colors.blue
    };
    console.log(`[${timestamp}] ${levelColors[level] || colors.white}${message}${colors.reset}`);
}

// Global variables for test data
let adminToken = '';
let regularUserToken = '';
let testUserId = '';
let adminUserId = '';

async function runUserManagementTests() {
    console.log(`${colors.cyan}🧪 User Management API Test Suite${colors.reset}`);
    console.log('='.repeat(50));

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    try {
        // Setup: Create admin and regular users
        await setupTestUsers();

        // Test 1: User Profile Access (Self)
        console.log(`\n${colors.yellow}Test 1: Get Own Profile${colors.reset}`);
        await testGetOwnProfile(results);

        // Test 2: User Profile Update (Self)
        console.log(`\n${colors.yellow}Test 2: Update Own Profile${colors.reset}`);
        await testUpdateOwnProfile(results);

        // Test 3: Admin: Get All Users
        console.log(`\n${colors.yellow}Test 3: Admin Get All Users${colors.reset}`);
        await testAdminGetAllUsers(results);

        // Test 4: Regular User: Get All Users (Should Fail)
        console.log(`\n${colors.yellow}Test 4: Regular User Access All Users (Should Fail)${colors.reset}`);
        await testRegularUserGetAllUsers(results);

        // Test 5: Admin: Get User by ID
        console.log(`\n${colors.yellow}Test 5: Admin Get User by ID${colors.reset}`);
        await testAdminGetUserById(results);

        // Test 6: Admin: Update User Role
        console.log(`\n${colors.yellow}Test 6: Admin Update User Role${colors.reset}`);
        await testAdminUpdateUserRole(results);

        // Test 7: Admin: Update User Status
        console.log(`\n${colors.yellow}Test 7: Admin Update User Status${colors.reset}`);
        await testAdminUpdateUserStatus(results);

        // Test 8: Regular User: Change Password
        console.log(`\n${colors.yellow}Test 8: User Change Password${colors.reset}`);
        await testUserChangePassword(results);

        // Test 9: Invalid User ID Handling
        console.log(`\n${colors.yellow}Test 9: Invalid User ID Handling${colors.reset}`);
        await testInvalidUserIdHandling(results);

        // Test 10: Unauthorized Access Protection
        console.log(`\n${colors.yellow}Test 10: Unauthorized Access Protection${colors.reset}`);
        await testUnauthorizedAccess(results);

    } catch (error) {
        log('ERROR', `Setup failed: ${error.message}`);
        results.failed++;
    }

    // Summary
    console.log(`\n${colors.cyan}🧪 User Management API Test Results${colors.reset}`);
    console.log('='.repeat(50));
    console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
    console.log(`📊 Total Tests: ${results.passed + results.failed}`);

    if (results.failed === 0) {
        console.log(`\n${colors.green}🎉 ALL USER MANAGEMENT API TESTS PASSED!${colors.reset}`);
        console.log(`${colors.green}🔒 User management endpoints are working correctly.${colors.reset}`);
    } else {
        console.log(`\n${colors.red}⚠️ API ISSUES DETECTED!${colors.reset}`);
        console.log(`${colors.red}🚨 ${results.failed} API issues need immediate attention.${colors.reset}`);
    }

    // Detailed Results
    console.log(`\n${colors.blue}📋 Detailed Test Results:${colors.reset}`);
    results.tests.forEach((test, index) => {
        const status = test.status === 'PASSED' ? `${colors.green}✅ PASSED${colors.reset}` : `${colors.red}❌ FAILED${colors.reset}`;
        const reason = test.reason ? ` - ${test.reason}` : '';
        const note = test.note ? ` (${test.note})` : '';
        console.log(`${index + 1}. ${test.test}: ${status}${reason}${note}`);
    });
}

// Setup Functions
async function setupTestUsers() {
    console.log(`\n${colors.blue}🔧 Setting up test users...${colors.reset}`);
    
    // Login with existing admin user
    try {
        const adminLoginData = {
            email: 'admin@hometeam.com',
            password: 'Admin123!'
        };
        
        const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, adminLoginData);
        
        if (adminLoginResponse.data.success && adminLoginResponse.data.data.accessToken) {
            adminToken = adminLoginResponse.data.data.accessToken;
            adminUserId = adminLoginResponse.data.data.user._id;
            log('SUCCESS', '✅ Admin user logged in successfully');
        } else {
            throw new Error('Invalid admin login response');
        }
        
    } catch (error) {
        log('ERROR', `❌ Failed to login as admin: ${error.message}`);
        throw error;
    }

    // Create regular user
    try {
        const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
            firstName: 'Regular',
            lastName: 'User',
            email: `user-test-${Date.now()}@example.com`,
            password: 'UserPassword123!'
        });
        
        regularUserToken = userResponse.data.data.accessToken;
        testUserId = userResponse.data.data.user._id;
        log('SUCCESS', '✅ Regular user created successfully');
        
    } catch (error) {
        log('ERROR', `❌ Failed to create regular user: ${error.message}`);
        throw error;
    }
}

// Test Functions
async function testGetOwnProfile(results) {
    try {
        const response = await axios.get(`${BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${regularUserToken}` }
        });

        if (response.status === 200 && response.data.success && response.data.data) {
            const user = response.data.data;
            if (user.firstName === 'Regular' && user.lastName === 'User') {
                log('SUCCESS', '✅ User can access own profile');
                results.passed++;
                results.tests.push({ test: 'Get Own Profile', status: 'PASSED' });
            } else {
                log('ERROR', '❌ Profile data mismatch');
                results.failed++;
                results.tests.push({ test: 'Get Own Profile', status: 'FAILED', reason: 'Data mismatch' });
            }
        } else {
            log('ERROR', '❌ Invalid response format');
            results.failed++;
            results.tests.push({ test: 'Get Own Profile', status: 'FAILED', reason: 'Invalid response' });
        }
    } catch (error) {
        log('ERROR', `❌ Get own profile failed: ${error.message}`);
        results.failed++;
        results.tests.push({ test: 'Get Own Profile', status: 'FAILED', reason: 'Request failed' });
    }
}

async function testUpdateOwnProfile(results) {
    try {
        const updateData = {
            firstName: 'Updated',
            lastName: 'Name'
        };

        const response = await axios.patch(`${BASE_URL}/users/profile`, updateData, {
            headers: { Authorization: `Bearer ${regularUserToken}` }
        });

        if (response.status === 200 && response.data.success) {
            log('SUCCESS', '✅ User can update own profile');
            results.passed++;
            results.tests.push({ test: 'Update Own Profile', status: 'PASSED' });
        } else {
            log('ERROR', '❌ Profile update failed');
            results.failed++;
            results.tests.push({ test: 'Update Own Profile', status: 'FAILED', reason: 'Update failed' });
        }
    } catch (error) {
        log('ERROR', `❌ Update own profile failed: ${error.message}`);
        results.failed++;
        results.tests.push({ test: 'Update Own Profile', status: 'FAILED', reason: 'Request failed' });
    }
}

async function testAdminGetAllUsers(results) {
    try {
        const response = await axios.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
            if (response.data.data.length >= 2) { // At least admin and regular user
                log('SUCCESS', '✅ Admin can access all users');
                results.passed++;
                results.tests.push({ test: 'Admin Get All Users', status: 'PASSED' });
            } else {
                log('ERROR', '❌ User list incomplete');
                results.failed++;
                results.tests.push({ test: 'Admin Get All Users', status: 'FAILED', reason: 'Incomplete list' });
            }
        } else {
            log('ERROR', '❌ Invalid response format');
            results.failed++;
            results.tests.push({ test: 'Admin Get All Users', status: 'FAILED', reason: 'Invalid response' });
        }
    } catch (error) {
        log('ERROR', `❌ Admin get all users failed: ${error.message}`);
        results.failed++;
        results.tests.push({ test: 'Admin Get All Users', status: 'FAILED', reason: 'Request failed' });
    }
}

async function testRegularUserGetAllUsers(results) {
    try {
        const response = await axios.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${regularUserToken}` }
        });

        // This should fail - regular users shouldn't access all users
        log('ERROR', '❌ Regular user can access all users - SECURITY VULNERABILITY');
        results.failed++;
        results.tests.push({ test: 'Regular User Access Block', status: 'FAILED', reason: 'Unauthorized access allowed' });
    } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            log('SUCCESS', '✅ Regular user correctly blocked from accessing all users');
            results.passed++;
            results.tests.push({ test: 'Regular User Access Block', status: 'PASSED' });
        } else {
            log('ERROR', `❌ Unexpected error: ${error.message}`);
            results.failed++;
            results.tests.push({ test: 'Regular User Access Block', status: 'FAILED', reason: 'Unexpected error' });
        }
    }
}

async function testAdminGetUserById(results) {
    try {
        const response = await axios.get(`${BASE_URL}/users/${testUserId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (response.status === 200 && response.data.success && response.data.data) {
            const user = response.data.data;
            if (user._id === testUserId) {
                log('SUCCESS', '✅ Admin can get user by ID');
                results.passed++;
                results.tests.push({ test: 'Admin Get User by ID', status: 'PASSED' });
            } else {
                log('ERROR', '❌ Wrong user returned');
                results.failed++;
                results.tests.push({ test: 'Admin Get User by ID', status: 'FAILED', reason: 'Wrong user' });
            }
        } else {
            log('ERROR', '❌ Invalid response format');
            results.failed++;
            results.tests.push({ test: 'Admin Get User by ID', status: 'FAILED', reason: 'Invalid response' });
        }
    } catch (error) {
        log('ERROR', `❌ Admin get user by ID failed: ${error.message}`);
        results.failed++;
        results.tests.push({ test: 'Admin Get User by ID', status: 'FAILED', reason: 'Request failed' });
    }
}

async function testAdminUpdateUserRole(results) {
    try {
        const response = await axios.patch(`${BASE_URL}/users/${testUserId}/role`, 
            { role: 'moderator' },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        if (response.status === 200 && response.data.success) {
            log('SUCCESS', '✅ Admin can update user role');
            results.passed++;
            results.tests.push({ test: 'Admin Update User Role', status: 'PASSED' });
        } else {
            log('ERROR', '❌ Role update failed');
            results.failed++;
            results.tests.push({ test: 'Admin Update User Role', status: 'FAILED', reason: 'Update failed' });
        }
    } catch (error) {
        log('ERROR', `❌ Admin update user role failed: ${error.message}`);
        results.failed++;
        results.tests.push({ test: 'Admin Update User Role', status: 'FAILED', reason: 'Request failed' });
    }
}

async function testAdminUpdateUserStatus(results) {
    try {
        const response = await axios.patch(`${BASE_URL}/users/${testUserId}/status`, 
            { status: 'inactive' },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        if (response.status === 200 && response.data.success) {
            log('SUCCESS', '✅ Admin can update user status');
            results.passed++;
            results.tests.push({ test: 'Admin Update User Status', status: 'PASSED' });
        } else {
            log('ERROR', '❌ Status update failed');
            results.failed++;
            results.tests.push({ test: 'Admin Update User Status', status: 'FAILED', reason: 'Update failed' });
        }
    } catch (error) {
        log('ERROR', `❌ Admin update user status failed: ${error.message}`);
        results.failed++;
        results.tests.push({ test: 'Admin Update User Status', status: 'FAILED', reason: 'Request failed' });
    }
}

async function testUserChangePassword(results) {
    try {
        const response = await axios.patch(`${BASE_URL}/users/profile/change-password`, 
            { 
                oldPassword: 'UserPassword123!',
                newPassword: 'NewUserPassword123!'
            },
            { headers: { Authorization: `Bearer ${regularUserToken}` } }
        );

        if (response.status === 200 && response.data.success) {
            log('SUCCESS', '✅ User can change password');
            results.passed++;
            results.tests.push({ test: 'User Change Password', status: 'PASSED' });
        } else {
            log('ERROR', '❌ Password change failed');
            results.failed++;
            results.tests.push({ test: 'User Change Password', status: 'FAILED', reason: 'Change failed' });
        }
    } catch (error) {
        log('ERROR', `❌ User change password failed: ${error.message}`);
        results.failed++;
        results.tests.push({ test: 'User Change Password', status: 'FAILED', reason: 'Request failed' });
    }
}

async function testInvalidUserIdHandling(results) {
    try {
        const response = await axios.get(`${BASE_URL}/users/invalid-id-123`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        log('ERROR', '❌ Invalid user ID accepted - should return 400');
        results.failed++;
        results.tests.push({ test: 'Invalid User ID Handling', status: 'FAILED', reason: 'Invalid ID accepted' });
    } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 404) {
            log('SUCCESS', '✅ Invalid user ID correctly rejected');
            results.passed++;
            results.tests.push({ test: 'Invalid User ID Handling', status: 'PASSED' });
        } else {
            log('ERROR', `❌ Unexpected error: ${error.message}`);
            results.failed++;
            results.tests.push({ test: 'Invalid User ID Handling', status: 'FAILED', reason: 'Unexpected error' });
        }
    }
}

async function testUnauthorizedAccess(results) {
    try {
        const response = await axios.get(`${BASE_URL}/users/profile`);
        
        log('ERROR', '❌ Unauthorized access allowed - SECURITY VULNERABILITY');
        results.failed++;
        results.tests.push({ test: 'Unauthorized Access Protection', status: 'FAILED', reason: 'No auth required' });
    } catch (error) {
        if (error.response?.status === 401) {
            log('SUCCESS', '✅ Unauthorized access correctly blocked');
            results.passed++;
            results.tests.push({ test: 'Unauthorized Access Protection', status: 'PASSED' });
        } else {
            log('ERROR', `❌ Unexpected error: ${error.message}`);
            results.failed++;
            results.tests.push({ test: 'Unauthorized Access Protection', status: 'FAILED', reason: 'Unexpected error' });
        }
    }
}

// Run the tests
runUserManagementTests().catch(console.error);

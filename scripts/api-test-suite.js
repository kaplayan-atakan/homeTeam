#!/usr/bin/env node

/**
 * homeTeam API Test Automation
 * Comprehensive API testing with proper assertions and reporting
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class APITestSuite {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.testResults = [];
    this.authToken = null;
    this.testUser = null;
  }

  // Test result logger
  logResult(testName, status, response = null, error = null) {
    const result = {
      testName,
      status, // 'PASS', 'FAIL', 'SKIP'
      timestamp: new Date().toISOString(),
      response,
      error: error?.message || null
    };
    
    this.testResults.push(result);
    
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${icon} ${testName} - ${status}`);
    
    if (error) {
      console.log(`   Error: ${error.message}`);
    }
  }

  // HTTP Request wrapper with error handling
  async makeRequest(method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message, 
        status: error.response?.status 
      };
    }
  }

  // Authentication Tests
  async testAuthentication() {
    console.log('\n🔐 Running Authentication Tests...');

    // Test 1: Register new user
    const uniqueEmail = `test${Date.now()}@example.com`;
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      email: uniqueEmail,
      password: 'Test123!@#'
    };

    const registerResult = await this.makeRequest('POST', '/auth/register', registerData);
    
    if (registerResult.success && registerResult.data.success) {
      this.logResult('Auth: User Registration', 'PASS', registerResult.data);
      this.testUser = registerResult.data.data.user;
      this.testUser.password = registerData.password;
    } else {
      this.logResult('Auth: User Registration', 'FAIL', null, new Error(registerResult.error?.message || 'Registration failed'));
      return;
    }

    // Test 2: Login with valid credentials
    const loginData = {
      email: this.testUser.email,
      password: this.testUser.password
    };

    const loginResult = await this.makeRequest('POST', '/auth/login', loginData);
    
    if (loginResult.success && loginResult.data.success) {
      this.logResult('Auth: User Login', 'PASS', loginResult.data);
      this.authToken = loginResult.data.data.accessToken;
    } else {
      this.logResult('Auth: User Login', 'FAIL', null, new Error(loginResult.error?.message || 'Login failed'));
      return;
    }

    // Test 3: Get profile with valid token
    const profileResult = await this.makeRequest('GET', '/auth/profile', null, {
      'Authorization': `Bearer ${this.authToken}`
    });

    if (profileResult.success && profileResult.data.success) {
      this.logResult('Auth: Get Profile', 'PASS', profileResult.data);
    } else {
      this.logResult('Auth: Get Profile', 'FAIL', null, new Error(profileResult.error?.message || 'Profile fetch failed'));
    }

    // Test 4: Invalid login
    const invalidLoginResult = await this.makeRequest('POST', '/auth/login', {
      email: this.testUser.email,
      password: 'wrongpassword'
    });

    if (!invalidLoginResult.success && invalidLoginResult.status === 401) {
      this.logResult('Auth: Invalid Login (Should Fail)', 'PASS');
    } else {
      this.logResult('Auth: Invalid Login (Should Fail)', 'FAIL', null, new Error('Should have failed with 401'));
    }
  }

  // Tasks Tests
  async testTasks() {
    console.log('\n📋 Running Tasks Tests...');

    if (!this.authToken) {
      this.logResult('Tasks: All Tests', 'SKIP', null, new Error('No auth token available'));
      return;
    }

    const authHeaders = { 'Authorization': `Bearer ${this.authToken}` };

    // Test 1: Create task
    const taskData = {
      title: 'Test Task',
      description: 'Integration test task',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
    };

    const createResult = await this.makeRequest('POST', '/tasks', taskData, authHeaders);
    
    let createdTask = null;
    if (createResult.success && createResult.data.success) {
      this.logResult('Tasks: Create Task', 'PASS', createResult.data);
      createdTask = createResult.data.data;
    } else {
      this.logResult('Tasks: Create Task', 'FAIL', null, new Error(createResult.error?.message || 'Task creation failed'));
      return;
    }

    // Test 2: Get tasks list
    const listResult = await this.makeRequest('GET', '/tasks', null, authHeaders);
    
    if (listResult.success && listResult.data.success) {
      this.logResult('Tasks: Get Tasks List', 'PASS', listResult.data);
    } else {
      this.logResult('Tasks: Get Tasks List', 'FAIL', null, new Error(listResult.error?.message || 'Tasks list failed'));
    }

    // Test 3: Get specific task
    const getTaskResult = await this.makeRequest('GET', `/tasks/${createdTask.id}`, null, authHeaders);
    
    if (getTaskResult.success && getTaskResult.data.success) {
      this.logResult('Tasks: Get Specific Task', 'PASS', getTaskResult.data);
    } else {
      this.logResult('Tasks: Get Specific Task', 'FAIL', null, new Error(getTaskResult.error?.message || 'Get task failed'));
    }

    // Test 4: Update task
    const updateData = { title: 'Updated Test Task' };
    const updateResult = await this.makeRequest('PATCH', `/tasks/${createdTask.id}`, updateData, authHeaders);
    
    if (updateResult.success && updateResult.data.success) {
      this.logResult('Tasks: Update Task', 'PASS', updateResult.data);
    } else {
      this.logResult('Tasks: Update Task', 'FAIL', null, new Error(updateResult.error?.message || 'Task update failed'));
    }

    // Test 5: Complete task
    const completeResult = await this.makeRequest('POST', `/tasks/${createdTask.id}/complete`, {}, authHeaders);
    
    if (completeResult.success && completeResult.data.success) {
      this.logResult('Tasks: Complete Task', 'PASS', completeResult.data);
    } else {
      this.logResult('Tasks: Complete Task', 'FAIL', null, new Error(completeResult.error?.message || 'Task completion failed'));
    }
  }

  // Groups Tests
  async testGroups() {
    console.log('\n👥 Running Groups Tests...');

    if (!this.authToken) {
      this.logResult('Groups: All Tests', 'SKIP', null, new Error('No auth token available'));
      return;
    }

    const authHeaders = { 'Authorization': `Bearer ${this.authToken}` };

    // Test 1: Create group
    const groupData = {
      name: 'Test Group',
      description: 'Integration test group'
    };

    const createResult = await this.makeRequest('POST', '/groups', groupData, authHeaders);
    
    let createdGroup = null;
    if (createResult.success && createResult.data.success) {
      this.logResult('Groups: Create Group', 'PASS', createResult.data);
      createdGroup = createResult.data.data;
    } else {
      this.logResult('Groups: Create Group', 'FAIL', null, new Error(createResult.error?.message || 'Group creation failed'));
      return;
    }

    // Test 2: Get groups list
    const listResult = await this.makeRequest('GET', '/groups', null, authHeaders);
    
    if (listResult.success && listResult.data.success) {
      this.logResult('Groups: Get Groups List', 'PASS', listResult.data);
    } else {
      this.logResult('Groups: Get Groups List', 'FAIL', null, new Error(listResult.error?.message || 'Groups list failed'));
    }

    // Test 3: Get specific group
    const getGroupResult = await this.makeRequest('GET', `/groups/${createdGroup.id}`, null, authHeaders);
    
    if (getGroupResult.success && getGroupResult.data.success) {
      this.logResult('Groups: Get Specific Group', 'PASS', getGroupResult.data);
    } else {
      this.logResult('Groups: Get Specific Group', 'FAIL', null, new Error(getGroupResult.error?.message || 'Get group failed'));
    }
  }

  // Generate test report
  generateReport() {
    console.log('\n📊 Test Results Summary');
    console.log('================================');

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipped = this.testResults.filter(r => r.status === 'SKIP').length;
    const total = this.testResults.length;

    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`⏭️  Skipped: ${skipped}/${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    // Save detailed report
    const reportPath = path.join(__dirname, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: { passed, failed, skipped, total },
      results: this.testResults,
      timestamp: new Date().toISOString()
    }, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting homeTeam API Test Suite...\n');

    try {
      await this.testAuthentication();
      await this.testTasks();
      await this.testGroups();
    } catch (error) {
      console.error('❌ Test suite crashed:', error.message);
    } finally {
      this.generateReport();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const testSuite = new APITestSuite();
  testSuite.runAllTests();
}

module.exports = APITestSuite;

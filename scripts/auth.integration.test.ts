import * as request from 'supertest';

describe('Auth Integration Tests', () => {
  const baseURL = 'http://localhost:3001';
  let authToken: string;

  // Basit HTTP istek wrapper'ı
  const api = request.default(baseURL);

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!@#'
      };

      const response = await api
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(registerData.email);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should fail with duplicate email', async () => {
      const registerData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'duplicate@example.com',
        password: 'Test123!@#'
      };

      // İlk kayıt
      await api
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      // Duplicate kayıt
      const response = await api
        .post('/auth/register')
        .send(registerData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should fail with invalid email format', async () => {
      const registerData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email',
        password: 'Test123!@#'
      };

      const response = await api
        .post('/auth/register')
        .send(registerData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const registerData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'weakpasstest@example.com',
        password: '123'
      };

      const response = await api
        .post('/auth/register')
        .send(registerData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    let testUser: any;

    beforeAll(async () => {
      // Test kullanıcısı oluştur
      const registerData = {
        firstName: 'Login',
        lastName: 'Test',
        email: `logintest${Date.now()}@example.com`,
        password: 'Test123!@#'
      };

      const registerResponse = await api
        .post('/auth/register')
        .send(registerData);

      testUser = registerResponse.body.data.user;
      testUser.password = registerData.password;
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password
      };

      const response = await api
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(testUser.email);

      authToken = response.body.data.accessToken;
    });

    it('should fail with wrong password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      const response = await api
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'anypassword'
      };

      const response = await api
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await api
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('email');
    });

    it('should fail without token', async () => {
      const response = await api
        .get('/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const response = await api
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

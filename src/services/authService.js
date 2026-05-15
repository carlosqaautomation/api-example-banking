const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const config = require('../../config');

class AuthService {
  async register(email, password, fullName, phone) {
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      const error = new Error('User already exists');
      error.code = 'USER_EXISTS';
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const result = await db.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, phone, created_at`,
      [userId, email, passwordHash, fullName, phone]
    );

    const user = result.rows[0];
    const tokens = this.generateTokens(user.id, user.email);

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { user: this.formatUser(user), ...tokens };
  }

  async login(email, password) {
    const result = await db.query(
      'SELECT id, email, password_hash, full_name, phone FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      const error = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      const error = new Error('Invalid credentials');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    const tokens = this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.formatUser(user),
      ...tokens
    };
  }

  async refresh(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret, {
        ignoreExpiration: true
      });

      const tokenResult = await db.query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()',
        [refreshToken, decoded.userId]
      );

      if (tokenResult.rows.length === 0) {
        const error = new Error('Invalid refresh token');
        error.code = 'INVALID_REFRESH_TOKEN';
        error.statusCode = 401;
        throw error;
      }

      const userResult = await db.query(
        'SELECT id, email, full_name, phone FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        const error = new Error('User not found');
        error.code = 'USER_NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }

      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

      const user = userResult.rows[0];
      const tokens = this.generateTokens(user.id, user.email);
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (error.statusCode) throw error;
      const err = new Error('Invalid refresh token');
      err.code = 'INVALID_REFRESH_TOKEN';
      err.statusCode = 401;
      throw err;
    }
  }

  async logout(userId, refreshToken) {
    await db.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1 AND token = $2',
      [userId, refreshToken]
    );
  }

  generateTokens(userId, email) {
    const accessToken = jwt.sign(
      { userId, email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    const refreshToken = jwt.sign(
      { userId, email, type: 'refresh' },
      config.jwtSecret,
      { expiresIn: config.refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );
  }

  formatUser(user) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      createdAt: user.created_at
    };
  }
}

module.exports = new AuthService();
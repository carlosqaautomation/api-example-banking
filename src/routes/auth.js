const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { validate, loginSchema, registerSchema, refreshTokenSchema } = require('../validators/schemas');

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.validatedBody;
    const result = await authService.register(email, password, fullName, phone);

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedBody;
    const result = await authService.login(email, password);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.post('/refresh', validate(refreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.validatedBody;
    const result = await authService.refresh(refreshToken);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, require('../../config').jwtSecret, {
        ignoreExpiration: true
      });

      if (refreshToken) {
        await authService.logout(decoded.userId, refreshToken);
      }
    }

    res.json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router;
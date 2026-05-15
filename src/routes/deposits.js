const express = require('express');
const router = express.Router();
const depositService = require('../services/depositService');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', async (req, res) => {
  try {
    const { accountId, amount, depositType, reference } = req.body;

    if (!accountId || !amount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'accountId and amount are required'
        }
      });
    }

    const deposit = await depositService.deposit(
      req.user.userId,
      accountId,
      amount,
      depositType,
      reference
    );

    res.status(201).json({
      success: true,
      data: deposit
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

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const deposits = await depositService.getDepositHistory(req.user.userId, limit, offset);

    res.json({
      success: true,
      data: deposits,
      pagination: { limit, offset }
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

router.get('/:id', async (req, res) => {
  try {
    const deposit = await depositService.getDepositById(req.params.id, req.user.userId);

    res.json({
      success: true,
      data: deposit
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

module.exports = router;